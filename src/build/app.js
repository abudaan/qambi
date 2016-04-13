(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// the whatwg-fetch polyfill installs the fetch() function
// on the global object (window or self)
//
// Return that as the export for use in Webpack, Browserify etc.
require('whatwg-fetch');
module.exports = self.fetch.bind(self);

},{"whatwg-fetch":14}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./_getPrototype":2,"./_isHostObject":3,"./isObjectLike":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
},{"./compose":10}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

},{"./createStore":11,"./utils/warning":13,"_process":6,"lodash/isPlainObject":5}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
},{"lodash/isPlainObject":5}],12:[function(require,module,exports){
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

},{"./applyMiddleware":7,"./bindActionCreators":8,"./combineReducers":9,"./compose":10,"./createStore":11,"./utils/warning":13,"_process":6}],13:[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
(function(self) {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name)
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value)
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    if (headers instanceof Headers) {
      headers.forEach(function(value, name) {
        this.append(name, value)
      }, this)

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        this.append(name, headers[name])
      }, this)
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      this.map[name].forEach(function(value) {
        callback.call(thisArg, value, name, this)
      }, this)
    }, this)
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self,
    arrayBuffer: 'ArrayBuffer' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
        // Only support ArrayBuffers for POST method.
        // Receiving ArrayBuffers happens via Blobs, instead.
      } else {
        throw new Error('unsupported BodyInit type')
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8')
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type)
        }
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(JSON.parse)
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(input, options) {
    options = options || {}
    var body = options.body
    if (Request.prototype.isPrototypeOf(input)) {
      if (input.bodyUsed) {
        throw new TypeError('Already read')
      }
      this.url = input.url
      this.credentials = input.credentials
      if (!options.headers) {
        this.headers = new Headers(input.headers)
      }
      this.method = input.method
      this.mode = input.mode
      if (!body) {
        body = input._bodyInit
        input.bodyUsed = true
      }
    } else {
      this.url = input
    }

    this.credentials = options.credentials || this.credentials || 'omit'
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers)
    }
    this.method = normalizeMethod(options.method || this.method || 'GET')
    this.mode = options.mode || this.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(body)
  }

  Request.prototype.clone = function() {
    return new Request(this)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this.type = 'default'
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
    this._initBody(bodyInit)
  }

  Body.call(Response.prototype)

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    })
  }

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''})
    response.type = 'error'
    return response
  }

  var redirectStatuses = [301, 302, 303, 307, 308]

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code')
    }

    return new Response(null, {status: status, headers: {location: url}})
  }

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    return new Promise(function(resolve, reject) {
      var request
      if (Request.prototype.isPrototypeOf(input) && !init) {
        request = input
      } else {
        request = new Request(input, init)
      }

      var xhr = new XMLHttpRequest()

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      xhr.onload = function() {
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }

      xhr.onerror = function() {
        reject(new TypeError('Network request failed'))
      }

      xhr.open(request.method, request.url, true)

      if (request.credentials === 'include') {
        xhr.withCredentials = true
      }

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(value, name) {
        xhr.setRequestHeader(name, value)
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  self.fetch.polyfill = true
})(typeof self !== 'undefined' ? self : this);

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// export const ADD_MIDI_NOTES = 'add_midi_notes'
// export const CREATE_MIDI_NOTE = 'create_midi_note'
// export const ADD_EVENTS_TO_SONG = 'add_events_to_song'
// export const ADD_MIDI_EVENTS_TO_SONG = 'add_midi_events_to_song'
// export const ADD_TRACK = 'add_track'
// export const ADD_PART = 'add_part'
// export const UPDATE_MIDI_NOTE = 'update_midi_note'

// track actions
var CREATE_TRACK = exports.CREATE_TRACK = 'create_track';
var ADD_PARTS = exports.ADD_PARTS = 'add_parts';
var SET_INSTRUMENT = exports.SET_INSTRUMENT = 'set_instrument';

// song actions
var CREATE_SONG = exports.CREATE_SONG = 'create_song';
var ADD_TRACKS = exports.ADD_TRACKS = 'add_tracks';
var ADD_TIME_EVENTS = exports.ADD_TIME_EVENTS = 'add_time_events';
var UPDATE_SONG = exports.UPDATE_SONG = 'update_song';
var ADD_MIDI_EVENTS = exports.ADD_MIDI_EVENTS = 'add_midi_events';

// part actions
var CREATE_PART = exports.CREATE_PART = 'create_part';

// midievent actions
var CREATE_MIDI_EVENT = exports.CREATE_MIDI_EVENT = 'create_midi_event';
var UPDATE_MIDI_EVENT = exports.UPDATE_MIDI_EVENT = 'update_midi_event';

// sequencer actions
var SONG_POSITION = exports.SONG_POSITION = 'song_position';
var PLAY_SONG = exports.PLAY_SONG = 'play_song';
var PAUSE_SONG = exports.PAUSE_SONG = 'pause_song';
var STOP_SONG = exports.STOP_SONG = 'stop_song';
var START_SCHEDULER = exports.START_SCHEDULER = 'START_SCHEDULER';
var STOP_SCHEDULER = exports.STOP_SCHEDULER = 'STOP_SCHEDULER';

// instrument actions
var CREATE_INSTRUMENT = exports.CREATE_INSTRUMENT = 'create_instrument';
var STORE_SAMPLES = exports.STORE_SAMPLES = 'store_samples';

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.test = undefined;
exports.getStore = getStore;

var _redux = require('redux');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var test = exports.test = function () {
  //console.log('run once')
  return 'test';
}();
//import thunk from 'redux-thunk';
//import createLogger from 'redux-logger';


var store = (0, _redux.createStore)(_reducer2.default);

/*
// don't use the redux dev tool because it use too much CPU and memory!
const logger = createLogger();
const store = createStore(sequencerApp, {}, compose(
  applyMiddleware(logger),
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
));
*/

function getStore() {
  //console.log('getStore() called')
  return store;
}

},{"./reducer":28,"redux":12}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.addTask = addTask;
exports.removeTask = removeTask;

var _init_audio = require('./init_audio');

var timedTasks = new Map();
var repetitiveTasks = new Map();
var scheduledTasks = new Map();
var tasks = new Map();
var lastTimeStamp = void 0;

function heartbeat(timestamp) {
  var now = _init_audio.context.currentTime;

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

  //setTimeout(heartbeat, 10000);
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

},{"./init_audio":19}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = init;

var _init_audio = require('./init_audio');

var _create_store = require('./create_store');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();

function init(cb) {
  (0, _init_audio.initAudio)().then(function (data) {

    store.dispatch({
      type: _action_types.STORE_SAMPLES,
      payload: {
        lowTick: data.lowtick,
        highTick: data.hightick
      }
    });

    cb({
      legacy: data.legacy,
      mp3: data.mp3,
      ogg: data.ogg
    });
  });
}

},{"./action_types":15,"./create_store":16,"./init_audio":19}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.masterCompressor = exports.masterGain = exports.context = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                    Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
                                                                                                                                                                                                                                                  */

exports.initAudio = initAudio;

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var masterGain = void 0,
    compressor = void 0,
    initialized = false;

var context = exports.context = function () {
  console.log('init AudioContext');

  if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    exports.context = context = new window.AudioContext();
  } else {
    //@TODO: create dummy AudioContext for use in node, see: https://www.npmjs.com/package/audio-context
    exports.context = context = {
      createGain: function createGain() {
        return {
          gain: 1
        };
      },
      createOscillator: function createOscillator() {}
    };
  }
  return context;
}();

function initAudio() {

  if (context.createGainNode === undefined) {
    context.createGainNode = context.createGain;
  }
  // check for older implementations of WebAudio
  var data = {};
  var source = context.createBufferSource();
  data.legacy = false;
  if (source.start === undefined) {
    data.legacy = true;
  }

  // set up the elementary audio nodes
  exports.masterCompressor = compressor = context.createDynamicsCompressor();
  compressor.connect(context.destination);
  exports.masterGain = masterGain = context.createGainNode();
  masterGain.connect(context.destination);
  masterGain.gain.value = 0.5;
  initialized = true;

  return new Promise(function (resolve, reject) {

    (0, _util.parseSamples)(_samples2.default).then(function onFulfilled(buffers) {
      //console.log(buffers)
      data.ogg = buffers.emptyOgg !== undefined;
      data.mp3 = buffers.emptyMp3 !== undefined;
      data.lowtick = buffers.lowtick;
      data.hightick = buffers.hightick;
      if (data.ogg === false && data.mp3 === false) {
        reject('No support for ogg nor mp3!');
      } else {
        resolve(data);
      }
    }, function onRejected() {
      reject('Something went wrong while initializing Audio');
    });
  });
}

var _setMasterVolume = function setMasterVolume() {
  var value = arguments.length <= 0 || arguments[0] === undefined ? 0.5 : arguments[0];

  if (initialized === false) {
    console.error('please call qambi.init() first');
  } else {
    exports.setMasterVolume = _setMasterVolume = function setMasterVolume() {
      var value = arguments.length <= 0 || arguments[0] === undefined ? 0.5 : arguments[0];

      if (value > 1) {
        console.info('maximal volume is 1.0, volume is set to 1.0');
      }
      value = value < 0 ? 0 : value > 1 ? 1 : value;
      masterGain.gain.value = value;
    };
    _setMasterVolume(value);
  }
};

var _getMasterVolume = function getMasterVolume() {
  if (initialized === false) {
    console.error('please call qambi.init() first');
  } else {
    exports.getMasterVolume = _getMasterVolume = function getMasterVolume() {
      return masterGain.gain.value;
    };
    return _getMasterVolume();
  }
};

var _getCompressionReduction = function getCompressionReduction() {
  if (initialized === false) {
    console.error('please call qambi.init() first');
  } else {
    exports.getCompressionReduction = _getCompressionReduction = function getCompressionReduction() {
      return compressor.reduction.value;
    };
    return _getCompressionReduction();
  }
};

var _enableMasterCompressor = function enableMasterCompressor() {
  if (initialized === false) {
    console.error('please call qambi.init() first');
  } else {
    exports.enableMasterCompressor = _enableMasterCompressor = function enableMasterCompressor(flag) {
      if (flag) {
        masterGain.disconnect(0);
        masterGain.connect(compressor);
        compressor.disconnect(0);
        compressor.connect(context.destination);
      } else {
        compressor.disconnect(0);
        masterGain.disconnect(0);
        masterGain.connect(context.destination);
      }
    };
    _enableMasterCompressor();
  }
};

var _configureMasterCompressor = function configureMasterCompressor(cfg) {
  /*
    readonly attribute AudioParam attack; // in Seconds
    readonly attribute AudioParam knee; // in Decibels
    readonly attribute AudioParam ratio; // unit-less
    readonly attribute AudioParam reduction; // in Decibels
    readonly attribute AudioParam release; // in Seconds
    readonly attribute AudioParam threshold; // in Decibels
     @see: http://webaudio.github.io/web-audio-api/#the-dynamicscompressornode-interface
  */
  if (initialized === false) {
    console.error('please call qambi.init() first');
  } else {
    exports.configureMasterCompressor = _configureMasterCompressor = function configureMasterCompressor(cfg) {
      var _cfg$attack = cfg.attack;
      compressor.attack = _cfg$attack === undefined ? 0.003 : _cfg$attack;
      var _cfg$knee = cfg.knee;
      compressor.knee = _cfg$knee === undefined ? 30 : _cfg$knee;
      var _cfg$ratio = cfg.ratio;
      compressor.ratio = _cfg$ratio === undefined ? 12 : _cfg$ratio;
      var _cfg$reduction = cfg.reduction;
      compressor.reduction = _cfg$reduction === undefined ? 0 : _cfg$reduction;
      var _cfg$release = cfg.release;
      compressor.release = _cfg$release === undefined ? 0.250 : _cfg$release;
      var _cfg$threshold = cfg.threshold;
      compressor.threshold = _cfg$threshold === undefined ? -24 : _cfg$threshold;
    };
    _configureMasterCompressor(cfg);
  }
};

exports.masterGain = masterGain;
exports.masterCompressor = compressor;
exports.setMasterVolume = _setMasterVolume;
exports.getMasterVolume = _getMasterVolume;
exports.getCompressionReduction = _getCompressionReduction;
exports.enableMasterCompressor = _enableMasterCompressor;
exports.configureMasterCompressor = _configureMasterCompressor;

},{"./samples":30,"./util":36}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createInstrument = createInstrument;

var _create_store = require('./create_store');

var _sample = require('./sample');

var _init_audio = require('./init_audio');

var _action_types = require('./action_types');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var store = (0, _create_store.getStore)();
var instrumentIndex = 0;

var Instrument = function () {
  function Instrument(id, type) {
    _classCallCheck(this, Instrument);

    this.id = id;
    this.type = type;
    this.scheduled = {};
    this.sustained = [];
    this.sustainPedalDown = false;
  }

  _createClass(Instrument, [{
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event, time, output) {
      var _this = this;

      var sample = void 0;
      if (event.type === 144) {
        //console.log(144, ':', time, context.currentTime, event.millis)
        sample = (0, _sample.createSample)(-1, event);
        this.scheduled[event.midiNoteId] = sample;
        sample.output.connect(output);
        sample.start(time);
        //console.log('start', event.midiNoteId)
      } else if (event.type === 128) {
          //console.log(128, ':', time, context.currentTime, event.millis)
          sample = this.scheduled[event.midiNoteId];
          if (typeof sample === 'undefined') {
            console.error('sample not found for event', event);
            return;
          }
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustained.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              //console.log('stop', event.midiNoteId)
              delete _this.scheduled[event.midiNoteId];
            });
          }
        } else if (event.type === 176) {
          // sustain pedal
          if (event.data1 === 64) {
            if (event.data2 === 127) {
              this.sustainPedalDown = true;
              //console.log('sustain pedal down')
              //dispatchEvent(this.track.song, 'sustain_pedal', 'down');
            } else if (event.data2 === 0) {
                this.sustainPedalDown = false;
                this.sustained.forEach(function (midiNoteId) {
                  _this.scheduled[midiNoteId].stop(event.time, function () {
                    //console.log('stop', midiNoteId)
                    delete _this.scheduled[midiNoteId];
                  });
                });
                //console.log('sustain pedal up', this.sustained)
                this.sustained = [];
                //dispatchEvent(this.track.song, 'sustain_pedal', 'up');
                //this.stopSustain(time);
              }

            // panning
          } else if (event.data1 === 10) {
              // panning is *not* exactly timed -> not possible (yet) with WebAudio
              //console.log(data2, remap(data2, 0, 127, -1, 1));
              //track.setPanning(remap(data2, 0, 127, -1, 1));

              // volume
            } else if (event.data1 === 7) {
                // to be implemented
              }
        }
    }
  }, {
    key: 'stopAllSounds',
    value: function stopAllSounds() {
      var _this2 = this;

      Object.keys(this.scheduled).forEach(function (sampleId) {
        _this2.scheduled[sampleId].stop(0, function () {
          delete _this2.scheduled[sampleId];
        });
      });
    }
  }]);

  return Instrument;
}();

function createInstrument(type) {
  var id = 'IN_' + instrumentIndex++ + '_' + new Date().getTime();
  var instrument = new Instrument(id, type);
  store.dispatch({
    type: _action_types.CREATE_INSTRUMENT,
    payload: {
      id: id,
      instrument: instrument
    }
  });
  return id;
}

},{"./action_types":15,"./create_store":16,"./init_audio":19,"./sample":29}],21:[function(require,module,exports){
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
      sortIndex: ticks + type,
      frequency: 440 * Math.pow(2, (data1 - 69) / 12)
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

},{"./action_types":15,"./create_store":16,"./midi_note":22}],22:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],23:[function(require,module,exports){
/*
  Wrapper for accessing bytes through sequential reads

  based on: https://github.com/gasman/jasmid
  adapted to work with ArrayBuffer -> Uint8Array
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fcc = String.fromCharCode;

var MIDIStream = function () {

  // buffer is Uint8Array

  function MIDIStream(buffer) {
    _classCallCheck(this, MIDIStream);

    this.buffer = buffer;
    this.position = 0;
  }

  /* read string or any number of bytes */


  _createClass(MIDIStream, [{
    key: 'read',
    value: function read(length) {
      var toString = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var result = void 0;

      if (toString) {
        result = '';
        for (var i = 0; i < length; i++, this.position++) {
          result += fcc(this.buffer[this.position]);
        }
        return result;
      } else {
        result = [];
        for (var _i = 0; _i < length; _i++, this.position++) {
          result.push(this.buffer[this.position]);
        }
        return result;
      }
    }

    /* read a big-endian 32-bit integer */

  }, {
    key: 'readInt32',
    value: function readInt32() {
      var result = (this.buffer[this.position] << 24) + (this.buffer[this.position + 1] << 16) + (this.buffer[this.position + 2] << 8) + this.buffer[this.position + 3];
      this.position += 4;
      return result;
    }

    /* read a big-endian 16-bit integer */

  }, {
    key: 'readInt16',
    value: function readInt16() {
      var result = (this.buffer[this.position] << 8) + this.buffer[this.position + 1];
      this.position += 2;
      return result;
    }

    /* read an 8-bit integer */

  }, {
    key: 'readInt8',
    value: function readInt8(signed) {
      var result = this.buffer[this.position];
      if (signed && result > 127) {
        result -= 256;
      }
      this.position += 1;
      return result;
    }
  }, {
    key: 'eof',
    value: function eof() {
      return this.position >= this.buffer.length;
    }

    /* read a MIDI-style letiable-length integer
      (big-endian value in groups of 7 bits,
      with top bit set to signify that another byte follows)
    */

  }, {
    key: 'readVarInt',
    value: function readVarInt() {
      var result = 0;
      while (true) {
        var b = this.readInt8();
        if (b & 0x80) {
          result += b & 0x7f;
          result <<= 7;
        } else {
          /* b is the last byte */
          return result + b;
        }
      }
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.position = 0;
    }
  }, {
    key: 'setPosition',
    value: function setPosition(p) {
      this.position = p;
    }
  }]);

  return MIDIStream;
}();

exports.default = MIDIStream;

},{}],24:[function(require,module,exports){
/*
  Extracts all midi events from a binary midi file, uses midi_stream.js

  based on: https://github.com/gasman/jasmid
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseMIDIFile = parseMIDIFile;

var _midi_stream = require('./midi_stream');

var _midi_stream2 = _interopRequireDefault(_midi_stream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lastEventTypeByte = void 0,
    trackName = void 0;

function readChunk(stream) {
  var id = stream.read(4, true);
  var length = stream.readInt32();
  //console.log(length);
  return {
    'id': id,
    'length': length,
    'data': stream.read(length, false)
  };
}

function readEvent(stream) {
  var event = {};
  var length;
  event.deltaTime = stream.readVarInt();
  var eventTypeByte = stream.readInt8();
  //console.log(eventTypeByte, eventTypeByte & 0x80, 146 & 0x0f);
  if ((eventTypeByte & 0xf0) == 0xf0) {
    /* system / meta event */
    if (eventTypeByte == 0xff) {
      /* meta event */
      event.type = 'meta';
      var subtypeByte = stream.readInt8();
      length = stream.readVarInt();
      switch (subtypeByte) {
        case 0x00:
          event.subtype = 'sequenceNumber';
          if (length !== 2) {
            throw 'Expected length for sequenceNumber event is 2, got ' + length;
          }
          event.number = stream.readInt16();
          return event;
        case 0x01:
          event.subtype = 'text';
          event.text = stream.read(length);
          return event;
        case 0x02:
          event.subtype = 'copyrightNotice';
          event.text = stream.read(length);
          return event;
        case 0x03:
          event.subtype = 'trackName';
          event.text = stream.read(length);
          trackName = event.text;
          return event;
        case 0x04:
          event.subtype = 'instrumentName';
          event.text = stream.read(length);
          return event;
        case 0x05:
          event.subtype = 'lyrics';
          event.text = stream.read(length);
          return event;
        case 0x06:
          event.subtype = 'marker';
          event.text = stream.read(length);
          return event;
        case 0x07:
          event.subtype = 'cuePoint';
          event.text = stream.read(length);
          return event;
        case 0x20:
          event.subtype = 'midiChannelPrefix';
          if (length !== 1) {
            throw 'Expected length for midiChannelPrefix event is 1, got ' + length;
          }
          event.channel = stream.readInt8();
          return event;
        case 0x2f:
          event.subtype = 'endOfTrack';
          if (length !== 0) {
            throw 'Expected length for endOfTrack event is 0, got ' + length;
          }
          return event;
        case 0x51:
          event.subtype = 'setTempo';
          if (length !== 3) {
            throw 'Expected length for setTempo event is 3, got ' + length;
          }
          event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
          return event;
        case 0x54:
          event.subtype = 'smpteOffset';
          if (length !== 5) {
            throw 'Expected length for smpteOffset event is 5, got ' + length;
          }
          var hourByte = stream.readInt8();
          event.frameRate = {
            0x00: 24, 0x20: 25, 0x40: 29, 0x60: 30
          }[hourByte & 0x60];
          event.hour = hourByte & 0x1f;
          event.min = stream.readInt8();
          event.sec = stream.readInt8();
          event.frame = stream.readInt8();
          event.subframe = stream.readInt8();
          return event;
        case 0x58:
          event.subtype = 'timeSignature';
          if (length !== 4) {
            throw 'Expected length for timeSignature event is 4, got ' + length;
          }
          event.numerator = stream.readInt8();
          event.denominator = Math.pow(2, stream.readInt8());
          event.metronome = stream.readInt8();
          event.thirtyseconds = stream.readInt8();
          return event;
        case 0x59:
          event.subtype = 'keySignature';
          if (length !== 2) {
            throw 'Expected length for keySignature event is 2, got ' + length;
          }
          event.key = stream.readInt8(true);
          event.scale = stream.readInt8();
          return event;
        case 0x7f:
          event.subtype = 'sequencerSpecific';
          event.data = stream.read(length);
          return event;
        default:
          //if(sequencer.debug >= 2){
          //    console.warn('Unrecognised meta event subtype: ' + subtypeByte);
          //}
          event.subtype = 'unknown';
          event.data = stream.read(length);
          return event;
      }
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 0xf0) {
      event.type = 'sysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 0xf7) {
      event.type = 'dividedSysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else {
      throw 'Unrecognised MIDI event type byte: ' + eventTypeByte;
    }
  } else {
    /* channel event */
    var param1 = void 0;
    if ((eventTypeByte & 0x80) === 0) {
      /* running status - reuse lastEventTypeByte as the event type.
        eventTypeByte is actually the first parameter
      */
      //console.log('running status');
      param1 = eventTypeByte;
      eventTypeByte = lastEventTypeByte;
    } else {
      param1 = stream.readInt8();
      //console.log('last', eventTypeByte);
      lastEventTypeByte = eventTypeByte;
    }
    var eventType = eventTypeByte >> 4;
    event.channel = eventTypeByte & 0x0f;
    event.type = 'channel';
    switch (eventType) {
      case 0x08:
        event.subtype = 'noteOff';
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        return event;
      case 0x09:
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        if (event.velocity === 0) {
          event.subtype = 'noteOff';
        } else {
          event.subtype = 'noteOn';
          //console.log('noteOn');
        }
        return event;
      case 0x0a:
        event.subtype = 'noteAftertouch';
        event.noteNumber = param1;
        event.amount = stream.readInt8();
        return event;
      case 0x0b:
        event.subtype = 'controller';
        event.controllerType = param1;
        event.value = stream.readInt8();
        return event;
      case 0x0c:
        event.subtype = 'programChange';
        event.programNumber = param1;
        return event;
      case 0x0d:
        event.subtype = 'channelAftertouch';
        event.amount = param1;
        //if(trackName === 'SH-S1-44-C09 L=SML IN=3'){
        //    console.log('channel pressure', trackName, param1);
        //}
        return event;
      case 0x0e:
        event.subtype = 'pitchBend';
        event.value = param1 + (stream.readInt8() << 7);
        return event;
      default:
        /*
        throw 'Unrecognised MIDI event type: ' + eventType;
        console.log('Unrecognised MIDI event type: ' + eventType);
        */

        event.value = stream.readInt8();
        event.subtype = 'unknown';
        //console.log(event);
        /*
                event.noteNumber = param1;
                event.velocity = stream.readInt8();
                event.subtype = 'noteOn';
                console.log('weirdo', trackName, param1, event.velocity);
        */

        return event;
    }
  }
}

function parseMIDIFile(buffer) {
  if (buffer instanceof Uint8Array === false && buffer instanceof ArrayBuffer === false) {
    console.error('buffer should be an instance of Uint8Array of ArrayBuffer');
    return;
  }
  if (buffer instanceof ArrayBuffer) {
    buffer = new Uint8Array(buffer);
  }
  var tracks = new Map();
  var stream = new _midi_stream2.default(buffer);

  var headerChunk = readChunk(stream);
  if (headerChunk.id !== 'MThd' || headerChunk.length !== 6) {
    throw 'Bad .mid file - header not found';
  }

  var headerStream = new _midi_stream2.default(headerChunk.data);
  var formatType = headerStream.readInt16();
  var trackCount = headerStream.readInt16();
  var timeDivision = headerStream.readInt16();

  if (timeDivision & 0x8000) {
    throw 'Expressing time division in SMTPE frames is not supported yet';
  }

  var header = {
    'formatType': formatType,
    'trackCount': trackCount,
    'ticksPerBeat': timeDivision
  };

  for (var i = 0; i < trackCount; i++) {
    trackName = 'track_' + i;
    var track = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id !== 'MTrk') {
      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id;
    }
    var trackStream = new _midi_stream2.default(trackChunk.data);
    while (!trackStream.eof()) {
      var event = readEvent(trackStream);
      track.push(event);
    }
    tracks.set(trackName, track);
  }

  return {
    'header': header,
    'tracks': tracks
  };
}

},{"./midi_stream":23}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTimeEvents = parseTimeEvents;
exports.parseEvents = parseEvents;
exports.parseMIDINotes = parseMIDINotes;
exports.filterEvents = filterEvents;

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
    diffTicks = void 0,
    previousEvent = void 0;

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
  // if(diffTicks < 0){
  //   console.log(diffTicks, event.ticks, previousEvent.ticks, previousEvent.type)
  // }
  tick += diffTicks;
  ticks = event.ticks;
  previousEvent = event;
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
  //console.log('parse time events')
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
  var e = 0;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = timeEvents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      event = _step.value;

      //console.log(e++, event.ticks, event.type)
      //event.song = song;
      type = event.type;
      updatePosition(event);

      switch (type) {

        case 0x51:
          bpm = event.data1;
          //console.log(event)
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
  //console.log('parseEvents')
  var event = void 0;
  var startEvent = 0;
  var lastEventTick = 0;
  var result = [];

  tick = 0;
  ticks = 0;
  diffTicks = 0;

  //let events = [].concat(evts, song._timeEvents);
  var numEvents = events.length;
  //console.log(events)
  events.sort(function (a, b) {
    return a.sortIndex - b.sortIndex;
    /*
        // noteoff comes before noteon
    
        if(a.ticks === b.ticks){
          // if(a.type === 128){
          //   return -1
          // }else if(b.type === 128){
          //   return 1
          // }
          // short:
    
          let r = a.type - b.type;
          if(a.type === 176 && b.type === 144){
            r = -1
          }
          return r
        }
    
        return a.ticks - b.ticks
    */
  });
  event = events[0];
  //console.log(event)

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

    switch (event.type) {

      case 0x51:
        bpm = event.data1;
        millis = event.millis;
        millisPerTick = event.millisPerTick;
        secondsPerTick = event.secondsPerTick;

        diffTicks = event.ticks - ticks;
        tick += diffTicks;
        ticks = event.ticks;
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

        diffTicks = event.ticks - ticks;
        tick += diffTicks;
        ticks = event.ticks;
        //console.log(nominator,numSixteenth,ticksPerSixteenth);
        //console.log(event);

        break;

      default:
        //case 128:
        //case 144:
        updatePosition(event);
        updateEvent(event);
        result.push(event);

      // if(event.type === 176 && event.data1 === 64){
      //   console.log(event.data2, event.barsAsString)
      // }

    }

    // if(i < 100 && (event.type === 81 || event.type === 144 || event.type === 128)){
    //   //console.log(i, ticks, diffTicks, millis, millisPerTick)
    //   console.log(event.type, event.millis, 'note', event.data1, 'velo', event.data2)
    // }

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

  // if(millis < 0){
  //   console.log(event)
  // }
}

var midiNoteIndex = 0;

function parseMIDINotes(events) {
  var notes = {};
  var notesInTrack = void 0;
  var n = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var event = _step2.value;

      if (typeof event.partId === 'undefined' || typeof event.trackId === 'undefined') {
        console.log('no part and/or track set');
        continue;
      }
      if (event.type === 144) {
        notesInTrack = notes[event.trackId];
        if (typeof notesInTrack === 'undefined') {
          notesInTrack = notes[event.trackId] = {};
        }
        notesInTrack[event.data1] = event;
      } else if (event.type === 128) {
        notesInTrack = notes[event.trackId];
        if (typeof notesInTrack === 'undefined') {
          //console.info(n++, 'no corresponding noteon event found for event', event.id)
          continue;
        }
        var noteOn = notesInTrack[event.data1];
        var noteOff = event;
        if (typeof noteOn === 'undefined') {
          //console.info(n++, 'no noteon event for event', event.id)
          delete notes[event.trackId][event.data1];
          continue;
        }
        var id = 'MN_' + midiNoteIndex++ + '_' + new Date().getTime();
        noteOn.midiNoteId = id;
        noteOn.off = noteOff.id;
        noteOff.midiNoteId = id;
        noteOff.on = noteOn.id;
        delete notes[event.trackId][event.data1];
      }
    }
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

  Object.keys(notes).forEach(function (key) {
    delete notes[key];
  });
  //console.log(notes, notesInTrack)
}

// not in use!
function filterEvents(events) {
  var sustain = {};
  var tmpResult = {};
  var result = [];
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = events[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var event = _step3.value;

      if (event.type === 176 && event.data1 === 64) {
        if (event.data2 === 0) {
          if (typeof sustain[event.trackId] === 'undefined') {
            continue;
          } else if (sustain[event.trackId] === event.ticks) {
            delete tmpResult[event.ticks];
            continue;
          }
          tmpResult[event.ticks] = event;
          delete sustain[event.trackId];
        } else if (event.data2 === 127) {
          sustain[event.trackId] = event.ticks;
          tmpResult[event.ticks] = event;
        }
      } else {
        result.push(event);
      }
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

  console.log(sustain);
  Object.keys(tmpResult).forEach(function (key) {
    var sustainEvent = tmpResult[key];
    console.log(sustainEvent);
    result.push(sustainEvent);
  });
  return result;
}

},{"./util":36}],26:[function(require,module,exports){
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
      trackId: trackId,
      mute: false
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

},{"./action_types":15,"./create_store":16}],27:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = exports.parseMIDIFile = exports.addMIDIEvents = exports.createPart = exports.addParts = exports.createTrack = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.init = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var _midifile = require('./midifile');

var _song_from_midifile = require('./song_from_midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: '0.0.1',

  // from ./init
  init: _init.init,

  // from ./init_audio
  getAudioContext: getAudioContext,
  getMasterVolume: _init_audio.getMasterVolume,
  setMasterVolume: _init_audio.setMasterVolume,

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

  parseMIDIFile: _midifile.parseMIDIFile,
  songFromMIDIFile: _song_from_midifile.songFromMIDIFile,

  log: function log(id) {
    if (id === 'functions') {
      console.log('functions:\n        createMIDIEvent\n        moveMIDIEvent\n        moveMIDIEventTo\n        createMIDINote\n        createSong\n        addTracks\n        createTrack\n        addParts\n        createPart\n        addMIDIEvents\n      ');
    }
  }
};

// standard MIDI events
//const MIDI = {}
Object.defineProperty(qambi, 'NOTE_OFF', { value: 0x80 }); //128
Object.defineProperty(qambi, 'NOTE_ON', { value: 0x90 }); //144
Object.defineProperty(qambi, 'POLY_PRESSURE', { value: 0xA0 }); //160
Object.defineProperty(qambi, 'CONTROL_CHANGE', { value: 0xB0 }); //176
Object.defineProperty(qambi, 'PROGRAM_CHANGE', { value: 0xC0 }); //192
Object.defineProperty(qambi, 'CHANNEL_PRESSURE', { value: 0xD0 }); //208
Object.defineProperty(qambi, 'PITCH_BEND', { value: 0xE0 }); //224
Object.defineProperty(qambi, 'SYSTEM_EXCLUSIVE', { value: 0xF0 }); //240
Object.defineProperty(qambi, 'MIDI_TIMECODE', { value: 241 });
Object.defineProperty(qambi, 'SONG_POSITION', { value: 242 });
Object.defineProperty(qambi, 'SONG_SELECT', { value: 243 });
Object.defineProperty(qambi, 'TUNE_REQUEST', { value: 246 });
Object.defineProperty(qambi, 'EOX', { value: 247 });
Object.defineProperty(qambi, 'TIMING_CLOCK', { value: 248 });
Object.defineProperty(qambi, 'START', { value: 250 });
Object.defineProperty(qambi, 'CONTINUE', { value: 251 });
Object.defineProperty(qambi, 'STOP', { value: 252 });
Object.defineProperty(qambi, 'ACTIVE_SENSING', { value: 254 });
Object.defineProperty(qambi, 'SYSTEM_RESET', { value: 255 });

Object.defineProperty(qambi, 'TEMPO', { value: 0x51 });
Object.defineProperty(qambi, 'TIME_SIGNATURE', { value: 0x58 });
Object.defineProperty(qambi, 'END_OF_TRACK', { value: 0x2F });

exports.default = qambi;
exports.
// from ./init
init = _init.init;
exports.

// from ./init_audio
getAudioContext = getAudioContext;
exports.getMasterVolume = _init_audio.getMasterVolume;
exports.setMasterVolume = _init_audio.setMasterVolume;
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
exports.

//  MIDI,

parseMIDIFile = _midifile.parseMIDIFile;
exports.songFromMIDIFile = _song_from_midifile.songFromMIDIFile;

},{"./init":18,"./init_audio":19,"./midi_event":21,"./midi_note":22,"./midifile":24,"./part":26,"./song":32,"./song_from_midifile":33,"./track":35}],28:[function(require,module,exports){
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
            part.midiEventIds.forEach(function (id) {
              event = state.midiEvents[id];
              event.trackId = trackId;
              event.instrumentId = track.instrumentId;
            });
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
        // put midi event ids in correct order
        song.midiEventIds.push(event.id);
        // replace event with updated event
        state.midiEvents[event.id] = event;
      });
      break;

    case _action_types.SET_INSTRUMENT:
      state = _extends({}, state);
      state.tracks[action.payload.trackId].instrumentId = action.payload.instrumentId;
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
      state.songs[action.payload.song_id] = {
        songId: action.payload.song_id,
        midiEvents: action.payload.midi_events,
        settings: action.payload.settings,
        playing: false
      };
      break;

    case _action_types.START_SCHEDULER:
      state = _extends({}, state);
      state.songs[action.payload.song_id].scheduler = action.payload.scheduler;
      state.songs[action.payload.song_id].playing = true;
      break;

    case _action_types.STOP_SCHEDULER:
      state = _extends({}, state);
      delete state.songs[action.payload.song_id].scheduler;
      state.songs[action.payload.song_id].playing = false;
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

function instruments() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var action = arguments[1];

  switch (action.type) {
    case _action_types.CREATE_INSTRUMENT:
      state = _extends({}, state);
      state[action.payload.id] = action.payload.instrument;
      //state = {...state, ...{[action.payload.id]: action.payload.instrument}}
      break;

    case _action_types.STORE_SAMPLES:
      state = _extends({}, state);
      console.log(action.payload);
      break;

    default:
  }
  return state;
}

var sequencerApp = (0, _redux.combineReducers)({
  gui: gui,
  editor: editor,
  sequencer: sequencer,
  instruments: instruments
});

exports.default = sequencerApp;

},{"./action_types":15,"redux":12}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createSample = createSample;

var _init_audio = require('./init_audio.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    if (sampleData === -1) {
      // create simple synth sample
      this.source = _init_audio.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    } else {
      this.source = _init_audio.context.createBufferSource();
      this.source.buffer = sampleData.d;
    }
    this.output = _init_audio.context.createGain();
    this.output.gain.value = event.data2 / 127;
    this.source.connect(this.output);
    //this.output.connect(context.destination)
  }

  _createClass(Sample, [{
    key: 'start',
    value: function start(time) {
      //console.log(this.source);
      this.source.start(time);
    }
  }, {
    key: 'stop',
    value: function stop(time, cb) {
      this.source.stop(time);
      this.source.onended = cb;
    }
  }]);

  return Sample;
}();

function createSample() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Sample, [null].concat(args)))();
}

},{"./init_audio.js":19}],30:[function(require,module,exports){
module.exports={
  "emptyOgg": "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
  "emptyMp3": "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
  "hightick": "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
  "lowtick": "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==",
}
},{}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUFFER_TIME = 400; // millis

var Scheduler = function () {
  function Scheduler(data) {
    _classCallCheck(this, Scheduler);

    this.songId = data.song_id;
    this.songStartPosition = data.start_position;
    this.timeStamp = data.timeStamp;
    this.events = data.midiEvents;
    this.instruments = data.instruments;
    this.parts = data.parts;
    this.tracks = data.tracks;
    var _data$settings = data.settings;
    this.bars = _data$settings.bars;
    this.loop = _data$settings.loop;

    this.numEvents = this.events.length;
    this.index = 0;
    this.setIndex(this.songStartPosition);
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
          var event = _step.value;

          if (event.millis >= millis) {
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
        var event = this.events[i];
        if (event.millis < this.maxtime) {

          //event.time = this.timeStamp + event.millis - this.songStartPosition;

          if (event.type === 'audio') {
            // to be implemented
          } else {
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
      var i, event, numEvents, events, instrument;

      this.maxtime = position + BUFFER_TIME;
      events = this.getEvents();
      numEvents = events.length;

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        instrument = this.instruments[event.instrumentId];

        if (typeof instrument === 'undefined') {
          continue;
        }

        if (this.parts[event.partId].mute === true || this.tracks[event.trackId].mute === true || event.mute === true) {
          continue;
        }

        if ((event.type === 144 || event.type === 128) && typeof event.midiNoteId === 'undefined') {
          // this is usually caused by the same note on the same ticks value, which is probably a bug in the midi file
          console.info('no midiNoteId', event);
          continue;
        }

        // debug minute_waltz double events
        // if(event.ticks > 40300){
        //   console.info(event)
        // }

        if (event.type === 'audio') {
          // to be implemented
        } else if (instrument.type === 'external') {
            // to be implemented: route to external midi instrument
          } else {
              var time = this.timeStamp + event.millis - this.songStartPosition;
              time /= 1000; // convert to seconds because the audio context uses seconds for scheduling
              instrument.processMIDIEvent(event, time, this.tracks[event.trackId].output);
            }
      }
      //console.log(this.index, this.numEvents)
      //return this.index >= 10
      return this.index >= this.numEvents; // end of song
    }
  }, {
    key: 'stopAllSounds',
    value: function stopAllSounds() {
      var _this = this;

      Object.keys(this.instruments).forEach(function (instrumentId) {
        if (instrumentId !== 'undefined') {
          _this.instruments[instrumentId].stopAllSounds();
        }
      });
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

},{}],32:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createSong = createSong;
exports.addTracks = addTracks;
exports.addTimeEvents = addTimeEvents;
exports.updateSong = updateSong;
exports.startSong = startSong;
exports.stopSong = stopSong;

var _create_store = require('./create_store');

var _parse_events = require('./parse_events');

var _midi_event = require('./midi_event');

var _heartbeat = require('./heartbeat');

var _init_audio = require('./init_audio');

var _scheduler = require('./scheduler');

var _scheduler2 = _interopRequireDefault(_scheduler);

var _action_types = require('./action_types');

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } //@ flow

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
/*
type songSettings = {
  name: string,
  ppq: number,
  bpm: number,
  bars: number,
  lowestNote: number,
  highestNote: number,
  nominator: number,
  denominator: number,
  quantizeValue: number,
  fixedLengthValue: number,
  positionType: string,
  useMetronome: boolean,
  autoSize: boolean,
  loop: boolean,
  playbackSpeed: number,
  autoQuantize: boolean
}
*/

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
  var timeEvents = _settings$timeEvents === undefined ? [{ id: (0, _midi_event.getMIDIEventId)(), song: id, ticks: 0, type: _qambi2.default.TEMPO, data1: s.bpm }, { id: (0, _midi_event.getMIDIEventId)(), song: id, ticks: 0, type: _qambi2.default.TIME_SIGNATURE, data1: s.nominator, data2: s.denominator }] : _settings$timeEvents;
  var _settings$midiEventId = settings.midiEventIds;
  var midiEventIds = _settings$midiEventId === undefined ? [] : _settings$midiEventId;
  var _settings$partIds = settings.partIds;
  var partIds = _settings$partIds === undefined ? [] : _settings$partIds;
  var _settings$trackIds = settings.trackIds;
  var trackIds = _settings$trackIds === undefined ? [] : _settings$trackIds;

  //parseTimeEvents(s, timeEvents)

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

// prepare song events for playback
function updateSong(song_id) {
  var filter_events = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var state = store.getState().editor;
  var song = state.songs[song_id];
  if (song) {
    (function () {
      console.time('update song');
      //@TODO: check if time events are updated
      (0, _parse_events.parseTimeEvents)(song.settings, song.timeEvents);
      var midiEvents = [].concat(_toConsumableArray(song.timeEvents));
      song.midiEventIds.forEach(function (event_id) {
        var event = state.midiEvents[event_id];
        if (event) {
          midiEvents.push(_extends({}, event));
        }
      });
      midiEvents = (0, _parse_events.parseEvents)(midiEvents);
      (0, _parse_events.parseMIDINotes)(midiEvents);
      // midiEvents.forEach((e) => {
      //   if(e.bar >= 5 && e.bar <= 6){
      //     console.log(e.barsAsString, e.data1, e.data2, e.type)
      //   }
      // })
      store.dispatch({
        type: _action_types.UPDATE_SONG,
        payload: {
          song_id: song_id,
          midi_events: midiEvents,
          settings: song.settings // needed for the sequencer reducer
        }
      });
      console.timeEnd('update song');
    })();
  } else {
    console.warn('no song found with id ' + song_id);
  }
}

function startSong(song_id) {
  var start_position = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


  function createScheduler() {
    var state = store.getState();
    var songData = state.sequencer.songs[song_id];
    var parts = {};
    var tracks = {};
    var instruments = {};
    var i = 0;
    var midiEvents = songData.midiEvents.filter(function (event) {
      // if((event.type === 144 || event.type === 128) && typeof event.midiNoteId === 'undefined'){
      //   console.info(i++, 'no midiNoteId', event.ticks, event.type, event.data1, event.trackId)
      //   return false
      // }
      var part = parts[event.partId];
      var track = tracks[event.trackId];
      if (typeof part === 'undefined') {
        parts[event.partId] = part = state.editor.parts[event.partId];
      }
      if (typeof track === 'undefined') {
        tracks[event.trackId] = track = state.editor.tracks[event.trackId];
        instruments[track.instrumentId] = state.instruments[track.instrumentId];
      }
      //return (!event.mute && !part.mute && !track.mute)
      // check if a note, part or track is muted should be done in the scheduler loop
      return true;
    });

    var position = start_position;
    var timeStamp = _init_audio.context.currentTime * 1000; // -> convert to millis
    var scheduler = new _scheduler2.default({
      song_id: song_id,
      start_position: start_position,
      timeStamp: timeStamp,
      parts: parts,
      tracks: tracks,
      instruments: instruments,
      settings: songData.settings,
      midiEvents: midiEvents
    });

    store.dispatch({
      type: _action_types.START_SCHEDULER,
      payload: {
        song_id: song_id,
        scheduler: scheduler
      }
    });

    return function () {
      var now = _init_audio.context.currentTime * 1000,
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
  var state = store.getState();
  var songData = state.sequencer.songs[song_id];
  if (songData) {
    if (songData.playing) {
      (0, _heartbeat.removeTask)('repetitive', song_id);
      songData.scheduler.stopAllSounds();
      store.dispatch({
        type: _action_types.STOP_SCHEDULER,
        payload: {
          song_id: song_id
        }
      });
    }
  } else {
    console.error('no song found with id ' + song_id);
  }
}

/*
export function addMIDIEvents(
  settings: {song_id: string, track_id: string, part_id: string},
  midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>
){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
//      id: song_id,
      midi_events
    }
  })
}

export function addMIDIEventsToSong(song_id: string, midi_events: Array<{ticks: number, type: number, data1: number, data2: number}>){
  //@todo: create part, add events to part, create track, add part to track, add track to song
  store.dispatch({
    type: ADD_MIDI_EVENTS_TO_SONG,
    payload: {
      id: song_id,
      midi_events
    }
  })
}
*/

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./init_audio":19,"./midi_event":21,"./parse_events":25,"./qambi":27,"./scheduler":31}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = songFromMIDIFile;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _midifile = require('./midifile');

var _midifile2 = _interopRequireDefault(_midifile);

var _midi_event = require('./midi_event');

var _part = require('./part');

var _track = require('./track');

var _song = require('./song');

var _instrument = require('./instrument');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var PPQ = 960;

function songFromMIDIFile(data) {
  var settings = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


  if (data instanceof ArrayBuffer === true) {
    var buffer = new Uint8Array(data);
    return toSong((0, _midifile2.default)(buffer));
  } else if (typeof data.header !== 'undefined' && typeof data.tracks !== 'undefined') {
    return toSong(data);
    // }else{
    //   data = base64ToBinary(data);
    //   if(data instanceof ArrayBuffer === true){
    //     let buffer = new Uint8Array(data);
    //     return toSong(parseMIDIFile(buffer));
    //   }else{
    //     error('wrong data');
    //   }
  }

  // {
  //   ppq = newPPQ,
  //   bpm = newBPM,
  //   playbackSpeed = newPlaybackSpeed,
  // } = settings
}

function toSong(parsed) {
  var tracks = parsed.tracks;
  var ppq = parsed.header.ticksPerBeat;
  var ppqFactor = PPQ / ppq; //@TODO: get ppq from config -> only necessary if you want to change the ppq of the MIDI file !
  var timeEvents = [];
  var eventIds = void 0;
  var bpm = -1;
  var nominator = -1;
  var denominator = -1;
  var trackIds = [];
  var songId = void 0;
  var instrumentId = (0, _instrument.createInstrument)();

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      var lastTicks = void 0,
          lastType = void 0;
      var ticks = 0;
      var type = void 0;
      var channel = -1;
      var trackName = void 0;
      var trackInstrumentName = void 0;
      eventIds = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = track[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var event = _step2.value;

          ticks += event.deltaTime * ppqFactor;

          if (channel === -1 && typeof event.channel !== 'undefined') {
            channel = event.channel;
          }
          type = event.subtype;
          //console.log(event.deltaTime, ticks, type);

          switch (event.subtype) {

            case 'trackName':
              trackName = event.text;
              break;

            case 'instrumentName':
              if (event.text) {
                trackInstrumentName = event.text;
              }
              break;

            case 'noteOn':
              eventIds.push((0, _midi_event.createMIDIEvent)(ticks, 0x90, event.noteNumber, event.velocity));
              break;

            case 'noteOff':
              eventIds.push((0, _midi_event.createMIDIEvent)(ticks, 0x80, event.noteNumber, event.velocity));
              break;

            case 'setTempo':
              // sometimes 2 tempo events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              var tmp = 60000000 / event.microsecondsPerBeat;

              if (ticks === lastTicks && type === lastType) {
                //console.info('tempo events on the same tick', ticks, tmp);
                timeEvents.pop();
              }

              if (bpm === -1) {
                bpm = tmp;
              }
              timeEvents.push({ id: (0, _midi_event.getMIDIEventId)(), sortIndex: ticks + 0x51, ticks: ticks, type: 0x51, data1: tmp });
              //timeEvents.push({id: getMIDIEventId(), sortIndex: ticks, ticks, type: 0x51, data1: tmp});
              break;

            case 'timeSignature':
              // sometimes 2 time signature events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              if (lastTicks === ticks && lastType === type) {
                console.info('time signature events on the same tick', ticks, event.numerator, event.denominator);
                timeEvents.pop();
              }

              if (nominator === -1) {
                nominator = event.numerator;
                denominator = event.denominator;
              }
              timeEvents.push({ id: (0, _midi_event.getMIDIEventId)(), sortIndex: ticks + 0x58, ticks: ticks, type: 0x58, data1: event.numerator, data2: event.denominator });
              //timeEvents.push({id: getMIDIEventId(), sortIndex: ticks, ticks, type: 0x58, data1: event.numerator, data2: event.denominator});
              break;

            case 'controller':
              eventIds.push((0, _midi_event.createMIDIEvent)(ticks, 0xB0, event.controllerType, event.value));
              break;

            case 'programChange':
              eventIds.push((0, _midi_event.createMIDIEvent)(ticks, 0xC0, event.programNumber));
              break;

            case 'pitchBend':
              eventIds.push((0, _midi_event.createMIDIEvent)(ticks, 0xE0, event.value));
              break;

            default:
            //console.log(track.name, event.type);
          }

          lastType = type;
          lastTicks = ticks;
        }
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

      if (eventIds.length > 0) {
        var trackId = (0, _track.createTrack)({ name: trackName });
        (0, _track.setInstrument)(trackId, instrumentId);
        //let partId = createPart({trackId, midiEventIds: eventIds})
        var partId = (0, _part.createPart)({ trackId: trackId });
        _part.addMIDIEvents.apply(undefined, [partId].concat(_toConsumableArray(eventIds)));
        (0, _track.addParts)(trackId, partId);
        //addTracks(songId, trackId)
        trackIds.push(trackId);
      }
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

  songId = (0, _song.createSong)({
    ppq: PPQ,
    //playbackSpeed: 1,
    //ppq,
    bpm: bpm,
    nominator: nominator,
    denominator: denominator,
    timeEvents: timeEvents
  });
  _song.addTracks.apply(undefined, [songId].concat(trackIds));
  (0, _song.updateSong)(songId);
  return songId;
}

},{"./instrument":20,"./midi_event":21,"./midifile":24,"./part":26,"./song":32,"./track":35,"isomorphic-fetch":1}],34:[function(require,module,exports){
'use strict';

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_qambi2.default.getMasterVolume();
_qambi2.default.log('functions');
_qambi2.default.init(function (data) {
  console.log(data, _qambi2.default.getMasterVolume());
  (0, _qambi.setMasterVolume)(0.5);
});

document.addEventListener('DOMContentLoaded', function () {

  var buttonStart = document.getElementById('start');
  var buttonStop = document.getElementById('stop');
  buttonStart.disabled = true;
  buttonStop.disabled = true;

  var test = 2;
  var noteon = void 0,
      noteoff = void 0,
      note = void 0,
      songId = void 0,
      track = void 0,
      part1 = void 0,
      part2 = void 0;

  if (test === 1) {

    songId = (0, _qambi.createSong)({ name: 'My First Song', playbackSpeed: 1, loop: true, bpm: 60 });
    track = (0, _qambi.createTrack)({ name: 'guitar', songId: songId });
    part1 = (0, _qambi.createPart)({ name: 'solo1', track: track });
    part2 = (0, _qambi.createPart)({ name: 'solo2', track: track });
    //noteon = createMIDIEvent(960, 144, 60, 100)
    //noteoff = createMIDIEvent(1020, 128, 60, 0)
    //addMIDIEvents(part1, noteon, noteoff)

    //note = createMIDINote(noteon, noteoff)

    var events = [];
    var ticks = 0;
    var type = 144;

    for (var i = 0; i < 100; i++) {
      events.push((0, _qambi.createMIDIEvent)(ticks, type, 60, 100));
      if (i % 2 === 0) {
        type = 128;
        ticks += 960;
      } else {
        type = 144;
        ticks += 960;
      }
    }
    _qambi.addMIDIEvents.apply(undefined, [part1].concat(events));

    (0, _qambi.addParts)(track, part1, part2);
    (0, _qambi.addTracks)(songId, track);
    (0, _qambi.updateSong)(songId);
    buttonStart.disabled = false;
  }

  /*
    //startSong(song)
    // let song2 = createSong()
  
    // setTimeout(function(){
    //   startSong(song2, 5000)
    // }, 1000)
  
  //   setTimeout(function(){
  //     stopSong(song)
  // //    stopSong(song2)
  //   }, 200)
  */

  if (test === 2) {
    //fetch('mozk545a.mid')
    (0, _isomorphicFetch2.default)('minute_waltz.mid').then(function (response) {
      return response.arrayBuffer();
    }, function (error) {
      console.error(error);
    }).then(function (ab) {
      //songId = songFromMIDIFile(parseMIDIFile(ab))
      var mf = (0, _qambi.parseMIDIFile)(ab);
      songId = (0, _qambi.songFromMIDIFile)(mf);
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      buttonStart.disabled = false;
      buttonStop.disabled = false;
    });
  }

  buttonStart.addEventListener('click', function () {
    (0, _qambi.startSong)(songId, 0);
  });

  buttonStop.addEventListener('click', function () {
    (0, _qambi.stopSong)(songId);
  });
});

},{"./qambi":27,"isomorphic-fetch":1}],35:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTrack = createTrack;
exports.addParts = addParts;
exports.setInstrument = setInstrument;
exports.muteTrack = muteTrack;
exports.setVolumeTrack = setVolumeTrack;
exports.setPanningTrack = setPanningTrack;

var _init_audio = require('./init_audio');

var _create_store = require('./create_store');

var _instrument = require('./instrument');

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

  var volume = 0.5;
  var output = _init_audio.context.createGain();
  output.gain.value = volume;
  output.connect(_init_audio.masterGain);

  store.dispatch({
    type: _action_types.CREATE_TRACK,
    payload: {
      id: id,
      name: name,
      partIds: partIds,
      songId: songId,
      volume: volume,
      output: output,
      mute: false
    }
  });
  //instrumentId: createInstrument('sinewave'),
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

function setInstrument(trackId, instrumentId) {
  store.dispatch({
    type: _action_types.SET_INSTRUMENT,
    payload: {
      trackId: trackId,
      instrumentId: instrumentId
    }
  });
}

function muteTrack(flag) {}

function setVolumeTrack(flag) {}

function setPanningTrack(flag) {}

},{"./action_types":15,"./create_store":16,"./init_audio":19,"./instrument":20}],36:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.getNiceTime = getNiceTime;
exports.parseSample = parseSample;
exports.parseSamples = parseSamples;
exports.poepen = poepen;
exports.typeString = typeString;

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _init_audio = require('./init_audio');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function parseSample(sample, id, every) {
  return new Promise(function (resolve, reject) {
    try {
      _init_audio.context.decodeAudioData(sample, function onSuccess(buffer) {
        //console.log(id, buffer);
        if (id !== undefined) {
          resolve({ 'id': id, 'buffer': buffer });
          if (every) {
            every({ 'id': id, 'buffer': buffer });
          }
        } else {
          resolve(buffer);
          if (every) {
            every(buffer);
          }
        }
      }, function onError(e) {
        //console.log('error decoding audiodata', id, e);
        //reject(e); // don't use reject because we use this as a nested promise and we don't want the parent promise to reject
        if (id !== undefined) {
          resolve({ 'id': id, 'buffer': undefined });
        } else {
          resolve(undefined);
        }
      });
    } catch (e) {
      //console.log('error decoding audiodata', id, e);
      //reject(e);
      if (id !== undefined) {
        resolve({ 'id': id, 'buffer': undefined });
      } else {
        resolve(undefined);
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  var executor = function executor(resolve, reject) {

    (0, _isomorphicFetch2.default)(url).then(function (response) {
      if (response.ok) {
        response.blob().then(function (data) {
          parseSample(data, id, every).then(resolve, reject);
        });
      } else {
        if (typeof id !== 'undefined') {
          resolve({ 'id': id, 'buffer': undefined });
        } else {
          resolve(undefined);
        }
      }
    });
  };
  return new Promise(executor);
}

function parseSamples(mapping) {
  var every = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var key = void 0,
      sample = void 0,
      promises = [],
      type = typeString(mapping);

  every = typeString(every) === 'function' ? every : false;
  //console.log(type, mapping)
  if (type === 'object') {
    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        sample = mapping[key];
        //console.log(checkIfBase64(sample))
        if (checkIfBase64(sample)) {
          promises.push(parseSample(base64ToBinary(sample), key, every));
        } else {
          promises.push(loadAndParseSample(sample, key, every));
        }
      }
    }
  } else if (type === 'array') {
    mapping.forEach(function (sample) {
      if (checkIfBase64(sample)) {
        promises.push(parseSample(sample, every));
      } else {
        promises.push(loadAndParseSample(sample, every));
      }
    });
  }

  return new Promise(function (resolve, reject) {
    Promise.all(promises).then(function onFulfilled(values) {
      if (type === 'object') {
        (function () {
          var mapping = {};
          values.forEach(function (value) {
            mapping[value.id] = value.buffer;
          });
          //console.log(mapping);
          resolve(mapping);
        })();
      } else if (type === 'array') {
        resolve(values);
      }
    }, function onRejected(e) {
      reject(e);
    });
  });
}

function poepen() {
  console.log(_init_audio.context);
}

function checkIfBase64(data) {
  var passed = true;
  try {
    atob(data);
  } catch (e) {
    passed = false;
  }
  return passed;
}

// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      bytes = void 0,
      uarray = void 0,
      buffer = void 0,
      lkey1 = void 0,
      lkey2 = void 0,
      chr1 = void 0,
      chr2 = void 0,
      chr3 = void 0,
      enc1 = void 0,
      enc2 = void 0,
      enc3 = void 0,
      enc4 = void 0,
      i = void 0,
      j = 0;

  bytes = Math.ceil(3 * input.length / 4.0);
  buffer = new ArrayBuffer(bytes);
  uarray = new Uint8Array(buffer);

  lkey1 = keyStr.indexOf(input.charAt(input.length - 1));
  lkey2 = keyStr.indexOf(input.charAt(input.length - 1));
  if (lkey1 == 64) bytes--; //padding chars, so skip
  if (lkey2 == 64) bytes--; //padding chars, so skip

  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

  for (i = 0; i < bytes; i += 3) {
    //get the 3 octects in 4 ascii chars
    enc1 = keyStr.indexOf(input.charAt(j++));
    enc2 = keyStr.indexOf(input.charAt(j++));
    enc3 = keyStr.indexOf(input.charAt(j++));
    enc4 = keyStr.indexOf(input.charAt(j++));

    chr1 = enc1 << 2 | enc2 >> 4;
    chr2 = (enc2 & 15) << 4 | enc3 >> 2;
    chr3 = (enc3 & 3) << 6 | enc4;

    uarray[i] = chr1;
    if (enc3 != 64) uarray[i + 1] = chr2;
    if (enc4 != 64) uarray[i + 2] = chr3;
  }
  //console.log(buffer);
  return buffer;
}

function typeString(o) {
  if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) != 'object') {
    return typeof o === 'undefined' ? 'undefined' : _typeof(o);
  }

  if (o === null) {
    return 'null';
  }

  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

},{"./init_audio":19,"isomorphic-fetch":1}]},{},[34])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSG9zdE9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pbml0LmpzIiwic3JjL2luaXRfYXVkaW8uanMiLCJzcmMvaW5zdHJ1bWVudC5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9taWRpX3N0cmVhbS5qcyIsInNyYy9taWRpZmlsZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NhbXBsZS5qcyIsInNyYy9zYW1wbGVzLmpzb24iLCJzcmMvc2NoZWR1bGVyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwic3JjL3Rlc3Rfd2ViLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QUFHLE1BQU0sSUFBTixFQUFXO0FBQ1osV0FBTyxNQUFQLENBRFk7R0FBZDs7O0FBTDJCLE1BVXZCLGdCQUFnQixPQUFPLFNBQVAsQ0FBaUIsUUFBakIsQ0FBMEIsSUFBMUIsQ0FBK0IsQ0FBL0IsRUFBa0MsS0FBbEMsQ0FBd0MsbUJBQXhDLEVBQTZELENBQTdELENBQWhCLENBVnVCO0FBVzNCLFNBQU8sY0FBYyxXQUFkLEVBQVAsQ0FYMkI7Q0FBdEIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuXG4vKipcbiAqIEdldHMgdGhlIGBbW1Byb3RvdHlwZV1dYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyB0aGUgYFtbUHJvdG90eXBlXV1gLlxuICovXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZUdldFByb3RvdHlwZShPYmplY3QodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QgaW4gSUUgPCA5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNIb3N0T2JqZWN0KHZhbHVlKSB7XG4gIC8vIE1hbnkgaG9zdCBvYmplY3RzIGFyZSBgT2JqZWN0YCBvYmplY3RzIHRoYXQgY2FuIGNvZXJjZSB0byBzdHJpbmdzXG4gIC8vIGRlc3BpdGUgaGF2aW5nIGltcHJvcGVybHkgZGVmaW5lZCBgdG9TdHJpbmdgIG1ldGhvZHMuXG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gISEodmFsdWUgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSG9zdE9iamVjdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc0hvc3RPYmplY3QgPSByZXF1aXJlKCcuL19pc0hvc3RPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHxcbiAgICAgIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpICE9IG9iamVjdFRhZyB8fCBpc0hvc3RPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYXBwbHlNaWRkbGV3YXJlO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RvcmUgZW5oYW5jZXIgdGhhdCBhcHBsaWVzIG1pZGRsZXdhcmUgdG8gdGhlIGRpc3BhdGNoIG1ldGhvZFxuICogb2YgdGhlIFJlZHV4IHN0b3JlLiBUaGlzIGlzIGhhbmR5IGZvciBhIHZhcmlldHkgb2YgdGFza3MsIHN1Y2ggYXMgZXhwcmVzc2luZ1xuICogYXN5bmNocm9ub3VzIGFjdGlvbnMgaW4gYSBjb25jaXNlIG1hbm5lciwgb3IgbG9nZ2luZyBldmVyeSBhY3Rpb24gcGF5bG9hZC5cbiAqXG4gKiBTZWUgYHJlZHV4LXRodW5rYCBwYWNrYWdlIGFzIGFuIGV4YW1wbGUgb2YgdGhlIFJlZHV4IG1pZGRsZXdhcmUuXG4gKlxuICogQmVjYXVzZSBtaWRkbGV3YXJlIGlzIHBvdGVudGlhbGx5IGFzeW5jaHJvbm91cywgdGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0XG4gKiBzdG9yZSBlbmhhbmNlciBpbiB0aGUgY29tcG9zaXRpb24gY2hhaW4uXG4gKlxuICogTm90ZSB0aGF0IGVhY2ggbWlkZGxld2FyZSB3aWxsIGJlIGdpdmVuIHRoZSBgZGlzcGF0Y2hgIGFuZCBgZ2V0U3RhdGVgIGZ1bmN0aW9uc1xuICogYXMgbmFtZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IG1pZGRsZXdhcmVzIFRoZSBtaWRkbGV3YXJlIGNoYWluIHRvIGJlIGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RvcmUgZW5oYW5jZXIgYXBwbHlpbmcgdGhlIG1pZGRsZXdhcmUuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1pZGRsZXdhcmVzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgbWlkZGxld2FyZXNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGNyZWF0ZVN0b3JlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gICAgICB2YXIgc3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IF9jb21wb3NlMltcImRlZmF1bHRcIl0uYXBwbHkodW5kZWZpbmVkLCBjaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuXG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIHN0b3JlLCB7XG4gICAgICAgIGRpc3BhdGNoOiBfZGlzcGF0Y2hcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBiaW5kQWN0aW9uQ3JlYXRvcnM7XG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkaXNwYXRjaChhY3Rpb25DcmVhdG9yLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uIGNyZWF0b3JzLCBpbnRvIGFuIG9iamVjdCB3aXRoIHRoZVxuICogc2FtZSBrZXlzLCBidXQgd2l0aCBldmVyeSBmdW5jdGlvbiB3cmFwcGVkIGludG8gYSBgZGlzcGF0Y2hgIGNhbGwgc28gdGhleVxuICogbWF5IGJlIGludm9rZWQgZGlyZWN0bHkuIFRoaXMgaXMganVzdCBhIGNvbnZlbmllbmNlIG1ldGhvZCwgYXMgeW91IGNhbiBjYWxsXG4gKiBgc3RvcmUuZGlzcGF0Y2goTXlBY3Rpb25DcmVhdG9ycy5kb1NvbWV0aGluZygpKWAgeW91cnNlbGYganVzdCBmaW5lLlxuICpcbiAqIEZvciBjb252ZW5pZW5jZSwgeW91IGNhbiBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LFxuICogYW5kIGdldCBhIGZ1bmN0aW9uIGluIHJldHVybi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gYWN0aW9uQ3JlYXRvcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uXG4gKiBjcmVhdG9yIGZ1bmN0aW9ucy4gT25lIGhhbmR5IHdheSB0byBvYnRhaW4gaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXNgXG4gKiBzeW50YXguIFlvdSBtYXkgYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRpc3BhdGNoIFRoZSBgZGlzcGF0Y2hgIGZ1bmN0aW9uIGF2YWlsYWJsZSBvbiB5b3VyIFJlZHV4XG4gKiBzdG9yZS5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258T2JqZWN0fSBUaGUgb2JqZWN0IG1pbWlja2luZyB0aGUgb3JpZ2luYWwgb2JqZWN0LCBidXQgd2l0aFxuICogZXZlcnkgYWN0aW9uIGNyZWF0b3Igd3JhcHBlZCBpbnRvIHRoZSBgZGlzcGF0Y2hgIGNhbGwuIElmIHlvdSBwYXNzZWQgYVxuICogZnVuY3Rpb24gYXMgYGFjdGlvbkNyZWF0b3JzYCwgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGFsc28gYmUgYSBzaW5nbGVcbiAqIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgIT09ICdvYmplY3QnIHx8IGFjdGlvbkNyZWF0b3JzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWN0aW9uQ3JlYXRvcnMgZXhwZWN0ZWQgYW4gb2JqZWN0IG9yIGEgZnVuY3Rpb24sIGluc3RlYWQgcmVjZWl2ZWQgJyArIChhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBhY3Rpb25DcmVhdG9ycykgKyAnLiAnICsgJ0RpZCB5b3Ugd3JpdGUgXCJpbXBvcnQgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiIGluc3RlYWQgb2YgXCJpbXBvcnQgKiBhcyBBY3Rpb25DcmVhdG9ycyBmcm9tXCI/Jyk7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKTtcbiAgdmFyIGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIGFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yc1trZXldO1xuICAgIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbWJpbmVSZWR1Y2VycztcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uVHlwZSAmJiAnXCInICsgYWN0aW9uVHlwZS50b1N0cmluZygpICsgJ1wiJyB8fCAnYW4gYWN0aW9uJztcblxuICByZXR1cm4gJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBoYW5kbGluZyAnICsgYWN0aW9uTmFtZSArICcuICcgKyAnVG8gaWdub3JlIGFuIGFjdGlvbiwgeW91IG11c3QgZXhwbGljaXRseSByZXR1cm4gdGhlIHByZXZpb3VzIHN0YXRlLic7XG59XG5cbmZ1bmN0aW9uIGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2UoaW5wdXRTdGF0ZSwgcmVkdWNlcnMsIGFjdGlvbikge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUID8gJ2luaXRpYWxTdGF0ZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlU3RvcmUnIDogJ3ByZXZpb3VzIHN0YXRlIHJlY2VpdmVkIGJ5IHRoZSByZWR1Y2VyJztcblxuICBpZiAocmVkdWNlcktleXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdTdG9yZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVkdWNlci4gTWFrZSBzdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgJyArICd0byBjb21iaW5lUmVkdWNlcnMgaXMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgcmVkdWNlcnMuJztcbiAgfVxuXG4gIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSk7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uLiAnICsgJ0lmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCAnICsgJ2V4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgJyArICdub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gJ0BAcmVkdXgvUFJPQkVfVU5LTk9XTl9BQ1RJT05fJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KS5zcGxpdCgnJykuam9pbignLicpO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogdHlwZSB9KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIHdoZW4gcHJvYmVkIHdpdGggYSByYW5kb20gdHlwZS4gJyArICgnRG9uXFwndCB0cnkgdG8gaGFuZGxlICcgKyBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCArICcgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiAnKSArICduYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSAnICsgJ2N1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsICcgKyAnaW4gd2hpY2ggY2FzZSB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUsIHJlZ2FyZGxlc3Mgb2YgdGhlICcgKyAnYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgZGlmZmVyZW50IHJlZHVjZXIgZnVuY3Rpb25zLCBpbnRvIGEgc2luZ2xlXG4gKiByZWR1Y2VyIGZ1bmN0aW9uLiBJdCB3aWxsIGNhbGwgZXZlcnkgY2hpbGQgcmVkdWNlciwgYW5kIGdhdGhlciB0aGVpciByZXN1bHRzXG4gKiBpbnRvIGEgc2luZ2xlIHN0YXRlIG9iamVjdCwgd2hvc2Uga2V5cyBjb3JyZXNwb25kIHRvIHRoZSBrZXlzIG9mIHRoZSBwYXNzZWRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWR1Y2VycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGNvcnJlc3BvbmQgdG8gZGlmZmVyZW50XG4gKiByZWR1Y2VyIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgY29tYmluZWQgaW50byBvbmUuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluXG4gKiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhcyByZWR1Y2Vyc2Agc3ludGF4LiBUaGUgcmVkdWNlcnMgbWF5IG5ldmVyIHJldHVyblxuICogdW5kZWZpbmVkIGZvciBhbnkgYWN0aW9uLiBJbnN0ZWFkLCB0aGV5IHNob3VsZCByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZVxuICogaWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGVtIHdhcyB1bmRlZmluZWQsIGFuZCB0aGUgY3VycmVudCBzdGF0ZSBmb3IgYW55XG4gKiB1bnJlY29nbml6ZWQgYWN0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSByZWR1Y2VyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBldmVyeSByZWR1Y2VyIGluc2lkZSB0aGVcbiAqIHBhc3NlZCBvYmplY3QsIGFuZCBidWlsZHMgYSBzdGF0ZSBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZS5cbiAqL1xuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSByZWR1Y2VyS2V5c1tpXTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHZhciB3YXJuaW5nTWVzc2FnZSA9IGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2Uoc3RhdGUsIGZpbmFsUmVkdWNlcnMsIGFjdGlvbik7XG4gICAgICBpZiAod2FybmluZ01lc3NhZ2UpIHtcbiAgICAgICAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmFsUmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBmaW5hbFJlZHVjZXJLZXlzW2ldO1xuICAgICAgdmFyIHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICB2YXIgcHJldmlvdXNTdGF0ZUZvcktleSA9IHN0YXRlW2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuICAgICAgaWYgKHR5cGVvZiBuZXh0U3RhdGVGb3JLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgbmV4dFN0YXRlW2tleV0gPSBuZXh0U3RhdGVGb3JLZXk7XG4gICAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBuZXh0U3RhdGVGb3JLZXkgIT09IHByZXZpb3VzU3RhdGVGb3JLZXk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGU7XG4gIH07XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbXBvc2U7XG4vKipcbiAqIENvbXBvc2VzIHNpbmdsZS1hcmd1bWVudCBmdW5jdGlvbnMgZnJvbSByaWdodCB0byBsZWZ0LlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmNzIFRoZSBmdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiBvYnRhaW5lZCBieSBjb21wb3NpbmcgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG9cbiAqIGxlZnQuIEZvciBleGFtcGxlLCBjb21wb3NlKGYsIGcsIGgpIGlzIGlkZW50aWNhbCB0byBhcmcgPT4gZihnKGgoYXJnKSkpLlxuICovXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdCA9IGZ1bmNzW2Z1bmNzLmxlbmd0aCAtIDFdO1xuICAgIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuXG4gICAgcmV0dXJuIHJlc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNvbXBvc2VkLCBmKSB7XG4gICAgICByZXR1cm4gZihjb21wb3NlZCk7XG4gICAgfSwgbGFzdC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuQWN0aW9uVHlwZXMgPSB1bmRlZmluZWQ7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNyZWF0ZVN0b3JlO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIFRoZXNlIGFyZSBwcml2YXRlIGFjdGlvbiB0eXBlcyByZXNlcnZlZCBieSBSZWR1eC5cbiAqIEZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB5b3UgbXVzdCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAqIERvIG5vdCByZWZlcmVuY2UgdGhlc2UgYWN0aW9uIHR5cGVzIGRpcmVjdGx5IGluIHlvdXIgY29kZS5cbiAqL1xudmFyIEFjdGlvblR5cGVzID0gZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogJ0BAcmVkdXgvSU5JVCdcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFJlZHV4IHN0b3JlIHRoYXQgaG9sZHMgdGhlIHN0YXRlIHRyZWUuXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtpbml0aWFsU3RhdGVdIFRoZSBpbml0aWFsIHN0YXRlLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gaHlkcmF0ZSB0aGUgc3RhdGUgZnJvbSB0aGUgc2VydmVyIGluIHVuaXZlcnNhbCBhcHBzLCBvciB0byByZXN0b3JlIGFcbiAqIHByZXZpb3VzbHkgc2VyaWFsaXplZCB1c2VyIHNlc3Npb24uXG4gKiBJZiB5b3UgdXNlIGBjb21iaW5lUmVkdWNlcnNgIHRvIHByb2R1Y2UgdGhlIHJvb3QgcmVkdWNlciBmdW5jdGlvbiwgdGhpcyBtdXN0IGJlXG4gKiBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZSBhcyBgY29tYmluZVJlZHVjZXJzYCBrZXlzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVuaGFuY2VyIFRoZSBzdG9yZSBlbmhhbmNlci4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGVuaGFuY2UgdGhlIHN0b3JlIHdpdGggdGhpcmQtcGFydHkgY2FwYWJpbGl0aWVzIHN1Y2ggYXMgbWlkZGxld2FyZSxcbiAqIHRpbWUgdHJhdmVsLCBwZXJzaXN0ZW5jZSwgZXRjLiBUaGUgb25seSBzdG9yZSBlbmhhbmNlciB0aGF0IHNoaXBzIHdpdGggUmVkdXhcbiAqIGlzIGBhcHBseU1pZGRsZXdhcmUoKWAuXG4gKlxuICogQHJldHVybnMge1N0b3JlfSBBIFJlZHV4IHN0b3JlIHRoYXQgbGV0cyB5b3UgcmVhZCB0aGUgc3RhdGUsIGRpc3BhdGNoIGFjdGlvbnNcbiAqIGFuZCBzdWJzY3JpYmUgdG8gY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZW5oYW5jZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5oYW5jZXIgPSBpbml0aWFsU3RhdGU7XG4gICAgaW5pdGlhbFN0YXRlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBlbmhhbmNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHJldHVybiBlbmhhbmNlcihjcmVhdGVTdG9yZSkocmVkdWNlciwgaW5pdGlhbFN0YXRlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIHJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciBjdXJyZW50UmVkdWNlciA9IHJlZHVjZXI7XG4gIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gIHZhciBjdXJyZW50TGlzdGVuZXJzID0gW107XG4gIHZhciBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgdmFyIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCkge1xuICAgIGlmIChuZXh0TGlzdGVuZXJzID09PSBjdXJyZW50TGlzdGVuZXJzKSB7XG4gICAgICBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hhbmdlIGxpc3RlbmVyLiBJdCB3aWxsIGJlIGNhbGxlZCBhbnkgdGltZSBhbiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCxcbiAgICogYW5kIHNvbWUgcGFydCBvZiB0aGUgc3RhdGUgdHJlZSBtYXkgcG90ZW50aWFsbHkgaGF2ZSBjaGFuZ2VkLiBZb3UgbWF5IHRoZW5cbiAgICogY2FsbCBgZ2V0U3RhdGUoKWAgdG8gcmVhZCB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFlvdSBtYXkgY2FsbCBgZGlzcGF0Y2goKWAgZnJvbSBhIGNoYW5nZSBsaXN0ZW5lciwgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAqIGNhdmVhdHM6XG4gICAqXG4gICAqIDEuIFRoZSBzdWJzY3JpcHRpb25zIGFyZSBzbmFwc2hvdHRlZCBqdXN0IGJlZm9yZSBldmVyeSBgZGlzcGF0Y2goKWAgY2FsbC5cbiAgICogSWYgeW91IHN1YnNjcmliZSBvciB1bnN1YnNjcmliZSB3aGlsZSB0aGUgbGlzdGVuZXJzIGFyZSBiZWluZyBpbnZva2VkLCB0aGlzXG4gICAqIHdpbGwgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgYGRpc3BhdGNoKClgIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgKiBIb3dldmVyLCB0aGUgbmV4dCBgZGlzcGF0Y2goKWAgY2FsbCwgd2hldGhlciBuZXN0ZWQgb3Igbm90LCB3aWxsIHVzZSBhIG1vcmVcbiAgICogcmVjZW50IHNuYXBzaG90IG9mIHRoZSBzdWJzY3JpcHRpb24gbGlzdC5cbiAgICpcbiAgICogMi4gVGhlIGxpc3RlbmVyIHNob3VsZCBub3QgZXhwZWN0IHRvIHNlZSBhbGwgc3RhdGVzIGNoYW5nZXMsIGFzIHRoZSBzdGF0ZVxuICAgKiBtaWdodCBoYXZlIGJlZW4gdXBkYXRlZCBtdWx0aXBsZSB0aW1lcyBkdXJpbmcgYSBuZXN0ZWQgYGRpc3BhdGNoKClgIGJlZm9yZVxuICAgKiB0aGUgbGlzdGVuZXIgaXMgY2FsbGVkLiBJdCBpcywgaG93ZXZlciwgZ3VhcmFudGVlZCB0aGF0IGFsbCBzdWJzY3JpYmVyc1xuICAgKiByZWdpc3RlcmVkIGJlZm9yZSB0aGUgYGRpc3BhdGNoKClgIHN0YXJ0ZWQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbGF0ZXN0XG4gICAqIHN0YXRlIGJ5IHRoZSB0aW1lIGl0IGV4aXRzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBBIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgb24gZXZlcnkgZGlzcGF0Y2guXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0byByZW1vdmUgdGhpcyBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGxpc3RlbmVyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgdmFyIGlzU3Vic2NyaWJlZCA9IHRydWU7XG5cbiAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgbmV4dExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgIGlmICghaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2U7XG5cbiAgICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICAgIHZhciBpbmRleCA9IG5leHRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBuZXh0TGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGFuIGFjdGlvbi4gSXQgaXMgdGhlIG9ubHkgd2F5IHRvIHRyaWdnZXIgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqXG4gICAqIFRoZSBgcmVkdWNlcmAgZnVuY3Rpb24sIHVzZWQgdG8gY3JlYXRlIHRoZSBzdG9yZSwgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGVcbiAgICogY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgZ2l2ZW4gYGFjdGlvbmAuIEl0cyByZXR1cm4gdmFsdWUgd2lsbFxuICAgKiBiZSBjb25zaWRlcmVkIHRoZSAqKm5leHQqKiBzdGF0ZSBvZiB0aGUgdHJlZSwgYW5kIHRoZSBjaGFuZ2UgbGlzdGVuZXJzXG4gICAqIHdpbGwgYmUgbm90aWZpZWQuXG4gICAqXG4gICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9ubHkgc3VwcG9ydHMgcGxhaW4gb2JqZWN0IGFjdGlvbnMuIElmIHlvdSB3YW50IHRvXG4gICAqIGRpc3BhdGNoIGEgUHJvbWlzZSwgYW4gT2JzZXJ2YWJsZSwgYSB0aHVuaywgb3Igc29tZXRoaW5nIGVsc2UsIHlvdSBuZWVkIHRvXG4gICAqIHdyYXAgeW91ciBzdG9yZSBjcmVhdGluZyBmdW5jdGlvbiBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG1pZGRsZXdhcmUuIEZvclxuICAgKiBleGFtcGxlLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UuIEV2ZW4gdGhlXG4gICAqIG1pZGRsZXdhcmUgd2lsbCBldmVudHVhbGx5IGRpc3BhdGNoIHBsYWluIG9iamVjdCBhY3Rpb25zIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIEEgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGluZyDigJx3aGF0IGNoYW5nZWTigJ0uIEl0IGlzXG4gICAqIGEgZ29vZCBpZGVhIHRvIGtlZXAgYWN0aW9ucyBzZXJpYWxpemFibGUgc28geW91IGNhbiByZWNvcmQgYW5kIHJlcGxheSB1c2VyXG4gICAqIHNlc3Npb25zLCBvciB1c2UgdGhlIHRpbWUgdHJhdmVsbGluZyBgcmVkdXgtZGV2dG9vbHNgLiBBbiBhY3Rpb24gbXVzdCBoYXZlXG4gICAqIGEgYHR5cGVgIHByb3BlcnR5IHdoaWNoIG1heSBub3QgYmUgYHVuZGVmaW5lZGAuIEl0IGlzIGEgZ29vZCBpZGVhIHRvIHVzZVxuICAgKiBzdHJpbmcgY29uc3RhbnRzIGZvciBhY3Rpb24gdHlwZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEZvciBjb252ZW5pZW5jZSwgdGhlIHNhbWUgYWN0aW9uIG9iamVjdCB5b3UgZGlzcGF0Y2hlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0LCBpZiB5b3UgdXNlIGEgY3VzdG9tIG1pZGRsZXdhcmUsIGl0IG1heSB3cmFwIGBkaXNwYXRjaCgpYCB0b1xuICAgKiByZXR1cm4gc29tZXRoaW5nIGVsc2UgKGZvciBleGFtcGxlLCBhIFByb21pc2UgeW91IGNhbiBhd2FpdCkuXG4gICAqL1xuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShhY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiAnICsgJ1VzZSBjdXN0b20gbWlkZGxld2FyZSBmb3IgYXN5bmMgYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgKyAnSGF2ZSB5b3UgbWlzc3BlbGxlZCBhIGNvbnN0YW50PycpO1xuICAgIH1cblxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXJzIG1heSBub3QgZGlzcGF0Y2ggYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50UmVkdWNlcihjdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycyA9IG5leHRMaXN0ZW5lcnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlZHVjZXIgY3VycmVudGx5IHVzZWQgYnkgdGhlIHN0b3JlIHRvIGNhbGN1bGF0ZSB0aGUgc3RhdGUuXG4gICAqXG4gICAqIFlvdSBtaWdodCBuZWVkIHRoaXMgaWYgeW91ciBhcHAgaW1wbGVtZW50cyBjb2RlIHNwbGl0dGluZyBhbmQgeW91IHdhbnQgdG9cbiAgICogbG9hZCBzb21lIG9mIHRoZSByZWR1Y2VycyBkeW5hbWljYWxseS4gWW91IG1pZ2h0IGFsc28gbmVlZCB0aGlzIGlmIHlvdVxuICAgKiBpbXBsZW1lbnQgYSBob3QgcmVsb2FkaW5nIG1lY2hhbmlzbSBmb3IgUmVkdXguXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRSZWR1Y2VyIFRoZSByZWR1Y2VyIGZvciB0aGUgc3RvcmUgdG8gdXNlIGluc3RlYWQuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVJlZHVjZXIobmV4dFJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIG5leHRSZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBuZXh0UmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIGN1cnJlbnRSZWR1Y2VyID0gbmV4dFJlZHVjZXI7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuICB9XG5cbiAgLy8gV2hlbiBhIHN0b3JlIGlzIGNyZWF0ZWQsIGFuIFwiSU5JVFwiIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHNvIHRoYXQgZXZlcnlcbiAgLy8gcmVkdWNlciByZXR1cm5zIHRoZWlyIGluaXRpYWwgc3RhdGUuIFRoaXMgZWZmZWN0aXZlbHkgcG9wdWxhdGVzXG4gIC8vIHRoZSBpbml0aWFsIHN0YXRlIHRyZWUuXG4gIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICByZXR1cm4ge1xuICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBnZXRTdGF0ZTogZ2V0U3RhdGUsXG4gICAgcmVwbGFjZVJlZHVjZXI6IHJlcGxhY2VSZWR1Y2VyXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jb21wb3NlID0gZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBleHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IGV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gZXhwb3J0cy5jcmVhdGVTdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9jcmVhdGVTdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVTdG9yZSk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgnLi9jb21iaW5lUmVkdWNlcnMnKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tYmluZVJlZHVjZXJzKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2JpbmRBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9yczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9iaW5kQWN0aW9uQ3JlYXRvcnMpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vYXBwbHlNaWRkbGV3YXJlJyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwcGx5TWlkZGxld2FyZSk7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKlxuKiBUaGlzIGlzIGEgZHVtbXkgZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZ1bmN0aW9uIG5hbWUgaGFzIGJlZW4gYWx0ZXJlZCBieSBtaW5pZmljYXRpb24uXG4qIElmIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBtaW5pZmllZCBhbmQgTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJywgd2FybiB0aGUgdXNlci5cbiovXG5mdW5jdGlvbiBpc0NydXNoZWQoKSB7fVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0eXBlb2YgaXNDcnVzaGVkLm5hbWUgPT09ICdzdHJpbmcnICYmIGlzQ3J1c2hlZC5uYW1lICE9PSAnaXNDcnVzaGVkJykge1xuICAoMCwgX3dhcm5pbmcyW1wiZGVmYXVsdFwiXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IF9jb21iaW5lUmVkdWNlcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gX2JpbmRBY3Rpb25DcmVhdG9yczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbXBvc2UgPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cbiAgfSBjYXRjaCAoZSkge31cbiAgLyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xufSIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gNTk5KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiLy8gZXhwb3J0IGNvbnN0IEFERF9NSURJX05PVEVTID0gJ2FkZF9taWRpX25vdGVzJ1xuLy8gZXhwb3J0IGNvbnN0IENSRUFURV9NSURJX05PVEUgPSAnY3JlYXRlX21pZGlfbm90ZSdcbi8vIGV4cG9ydCBjb25zdCBBRERfRVZFTlRTX1RPX1NPTkcgPSAnYWRkX2V2ZW50c190b19zb25nJ1xuLy8gZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UU19UT19TT05HID0gJ2FkZF9taWRpX2V2ZW50c190b19zb25nJ1xuLy8gZXhwb3J0IGNvbnN0IEFERF9UUkFDSyA9ICdhZGRfdHJhY2snXG4vLyBleHBvcnQgY29uc3QgQUREX1BBUlQgPSAnYWRkX3BhcnQnXG4vLyBleHBvcnQgY29uc3QgVVBEQVRFX01JRElfTk9URSA9ICd1cGRhdGVfbWlkaV9ub3RlJ1xuXG5cbi8vIHRyYWNrIGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfVFJBQ0sgPSAnY3JlYXRlX3RyYWNrJ1xuZXhwb3J0IGNvbnN0IEFERF9QQVJUUyA9ICdhZGRfcGFydHMnXG5leHBvcnQgY29uc3QgU0VUX0lOU1RSVU1FTlQgPSAnc2V0X2luc3RydW1lbnQnXG5cblxuLy8gc29uZyBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX1NPTkcgPSAnY3JlYXRlX3NvbmcnXG5leHBvcnQgY29uc3QgQUREX1RSQUNLUyA9ICdhZGRfdHJhY2tzJ1xuZXhwb3J0IGNvbnN0IEFERF9USU1FX0VWRU5UUyA9ICdhZGRfdGltZV9ldmVudHMnXG5leHBvcnQgY29uc3QgVVBEQVRFX1NPTkcgPSAndXBkYXRlX3NvbmcnXG5leHBvcnQgY29uc3QgQUREX01JRElfRVZFTlRTID0gJ2FkZF9taWRpX2V2ZW50cydcblxuXG4vLyBwYXJ0IGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfUEFSVCA9ICdjcmVhdGVfcGFydCdcblxuXG4vLyBtaWRpZXZlbnQgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9NSURJX0VWRU5UID0gJ2NyZWF0ZV9taWRpX2V2ZW50J1xuZXhwb3J0IGNvbnN0IFVQREFURV9NSURJX0VWRU5UID0gJ3VwZGF0ZV9taWRpX2V2ZW50J1xuXG5cbi8vIHNlcXVlbmNlciBhY3Rpb25zXG5leHBvcnQgY29uc3QgU09OR19QT1NJVElPTiA9ICdzb25nX3Bvc2l0aW9uJ1xuZXhwb3J0IGNvbnN0IFBMQVlfU09ORyA9ICdwbGF5X3NvbmcnXG5leHBvcnQgY29uc3QgUEFVU0VfU09ORyA9ICdwYXVzZV9zb25nJ1xuZXhwb3J0IGNvbnN0IFNUT1BfU09ORyA9ICdzdG9wX3NvbmcnXG5leHBvcnQgY29uc3QgU1RBUlRfU0NIRURVTEVSID0gJ1NUQVJUX1NDSEVEVUxFUidcbmV4cG9ydCBjb25zdCBTVE9QX1NDSEVEVUxFUiA9ICdTVE9QX1NDSEVEVUxFUidcblxuXG4vLyBpbnN0cnVtZW50IGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfSU5TVFJVTUVOVCA9ICdjcmVhdGVfaW5zdHJ1bWVudCdcbmV4cG9ydCBjb25zdCBTVE9SRV9TQU1QTEVTID0gJ3N0b3JlX3NhbXBsZXMnXG5cblxuIiwiaW1wb3J0IHtjcmVhdGVTdG9yZSwgYXBwbHlNaWRkbGV3YXJlLCBjb21wb3NlfSBmcm9tICdyZWR1eCdcbi8vaW1wb3J0IHRodW5rIGZyb20gJ3JlZHV4LXRodW5rJztcbi8vaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICdyZWR1eC1sb2dnZXInO1xuaW1wb3J0IHNlcXVlbmNlckFwcCBmcm9tICcuL3JlZHVjZXInXG5cbmV4cG9ydCBjb25zdCB0ZXN0ID0gKGZ1bmN0aW9uKCl7XG4gIC8vY29uc29sZS5sb2coJ3J1biBvbmNlJylcbiAgcmV0dXJuICd0ZXN0J1xufSgpKVxuXG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKHNlcXVlbmNlckFwcCk7XG5cbi8qXG4vLyBkb24ndCB1c2UgdGhlIHJlZHV4IGRldiB0b29sIGJlY2F1c2UgaXQgdXNlIHRvbyBtdWNoIENQVSBhbmQgbWVtb3J5IVxuY29uc3QgbG9nZ2VyID0gY3JlYXRlTG9nZ2VyKCk7XG5jb25zdCBzdG9yZSA9IGNyZWF0ZVN0b3JlKHNlcXVlbmNlckFwcCwge30sIGNvbXBvc2UoXG4gIGFwcGx5TWlkZGxld2FyZShsb2dnZXIpLFxuICB0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JyAmJiB0eXBlb2Ygd2luZG93LmRldlRvb2xzRXh0ZW5zaW9uICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdy5kZXZUb29sc0V4dGVuc2lvbigpIDogZiA9PiBmXG4pKTtcbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdG9yZSgpe1xuICAvL2NvbnNvbGUubG9nKCdnZXRTdG9yZSgpIGNhbGxlZCcpXG4gIHJldHVybiBzdG9yZVxufVxuXG5cbiIsIlxuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nO1xuXG5cbmxldCB0aW1lZFRhc2tzID0gbmV3IE1hcCgpO1xubGV0IHJlcGV0aXRpdmVUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCBzY2hlZHVsZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCB0YXNrcyA9IG5ldyBNYXAoKTtcbmxldCBsYXN0VGltZVN0YW1wO1xuXG5mdW5jdGlvbiBoZWFydGJlYXQodGltZXN0YW1wKXtcbiAgbGV0IG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWU7XG5cbiAgLy8gZm9yIGluc3RhbmNlOiB0aGUgY2FsbGJhY2sgb2Ygc2FtcGxlLnVuc2NoZWR1bGU7XG4gIGZvcihsZXQgW2tleSwgdGFza10gb2YgdGltZWRUYXNrcyl7XG4gICAgaWYodGFzay50aW1lID49IG5vdyl7XG4gICAgICB0YXNrLmV4ZWN1dGUobm93KTtcbiAgICAgIHRpbWVkVGFza3MuZGVsZXRlKGtleSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBmb3IgaW5zdGFuY2U6IHNvbmcudXBkYXRlKCk7XG4gIGZvcihsZXQgdGFzayBvZiBzY2hlZHVsZWRUYXNrcy52YWx1ZXMoKSl7XG4gICAgdGFzayhub3cpO1xuICB9XG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnB1bHNlKCk7XG4gIGZvcihsZXQgdGFzayBvZiByZXBldGl0aXZlVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIGxhc3RUaW1lU3RhbXAgPSB0aW1lc3RhbXA7XG4gIHNjaGVkdWxlZFRhc2tzLmNsZWFyKCk7XG5cbiAgLy9zZXRUaW1lb3V0KGhlYXJ0YmVhdCwgMTAwMDApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhlYXJ0YmVhdCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRhc2sodHlwZSwgaWQsIHRhc2spe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuc2V0KGlkLCB0YXNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVRhc2sodHlwZSwgaWQpe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuZGVsZXRlKGlkKTtcbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCl7XG4gIHRhc2tzLnNldCgndGltZWQnLCB0aW1lZFRhc2tzKTtcbiAgdGFza3Muc2V0KCdyZXBldGl0aXZlJywgcmVwZXRpdGl2ZVRhc2tzKTtcbiAgdGFza3Muc2V0KCdzY2hlZHVsZWQnLCBzY2hlZHVsZWRUYXNrcyk7XG4gIGhlYXJ0YmVhdCgpO1xufSgpKVxuIiwiaW1wb3J0IHtpbml0QXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtTVE9SRV9TQU1QTEVTfSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KGNiKTogdm9pZHtcbiAgaW5pdEF1ZGlvKCkudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogU1RPUkVfU0FNUExFUyxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgbG93VGljazogZGF0YS5sb3d0aWNrLFxuICAgICAgICBoaWdoVGljazogZGF0YS5oaWdodGljayxcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgY2Ioe1xuICAgICAgbGVnYWN5OiBkYXRhLmxlZ2FjeSxcbiAgICAgIG1wMzogZGF0YS5tcDMsXG4gICAgICBvZ2c6IGRhdGEub2dnXG4gICAgfSlcbiAgfSlcblxufVxuXG5cbiIsIi8qXG4gIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuKi9cblxuaW1wb3J0IHNhbXBsZXMgZnJvbSAnLi9zYW1wbGVzJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vdXRpbCdcblxubGV0XG4gIG1hc3RlckdhaW4sXG4gIGNvbXByZXNzb3IsXG4gIGluaXRpYWxpemVkID0gZmFsc2VcblxuZXhwb3J0IGxldCBjb250ZXh0ID0gKGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG5cbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIHdpbmRvdy5BdWRpb0NvbnRleHQgPSAod2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0KVxuICAgIGNvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dFxuICB9ZWxzZXtcbiAgICAvL0BUT0RPOiBjcmVhdGUgZHVtbXkgQXVkaW9Db250ZXh0IGZvciB1c2UgaW4gbm9kZSwgc2VlOiBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9hdWRpby1jb250ZXh0XG4gICAgY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24oKXt9LFxuICAgIH1cbiAgfVxuICByZXR1cm4gY29udGV4dFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZihjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSB1bmRlZmluZWQpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGxldCBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZihzb3VyY2Uuc3RhcnQgPT09IHVuZGVmaW5lZCl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKClcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDAuNVxuICBpbml0aWFsaXplZCA9IHRydWVcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgcGFyc2VTYW1wbGVzKHNhbXBsZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKVxuICAgICAgICBkYXRhLm9nZyA9IGJ1ZmZlcnMuZW1wdHlPZ2cgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLm1wMyA9IGJ1ZmZlcnMuZW1wdHlNcDMgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2tcbiAgICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2tcbiAgICAgICAgaWYoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSl7XG4gICAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJylcbiAgICAgIH1cbiAgICApXG4gIH0pXG59XG5cblxubGV0IHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBzZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZTogbnVtYmVyID0gMC41KXtcbiAgICAgIGlmKHZhbHVlID4gMSl7XG4gICAgICAgIGNvbnNvbGUuaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICAgICAgfVxuICAgICAgdmFsdWUgPSB2YWx1ZSA8IDAgPyAwIDogdmFsdWUgPiAxID8gMSA6IHZhbHVlXG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpXG4gIH1cbn1cblxuXG5sZXQgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0ga25lZTsgLy8gaW4gRGVjaWJlbHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICBAc2VlOiBodHRwOi8vd2ViYXVkaW8uZ2l0aHViLmlvL3dlYi1hdWRpby1hcGkvI3RoZS1keW5hbWljc2NvbXByZXNzb3Jub2RlLWludGVyZmFjZVxuICAqL1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUuZXJyb3IoJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnOiB7fSl7XG4gICAgICAoe1xuICAgICAgICBhdHRhY2s6IGNvbXByZXNzb3IuYXR0YWNrID0gMC4wMDMsXG4gICAgICAgIGtuZWU6IGNvbXByZXNzb3Iua25lZSA9IDMwLFxuICAgICAgICByYXRpbzogY29tcHJlc3Nvci5yYXRpbyA9IDEyLFxuICAgICAgICByZWR1Y3Rpb246IGNvbXByZXNzb3IucmVkdWN0aW9uID0gMCxcbiAgICAgICAgcmVsZWFzZTogY29tcHJlc3Nvci5yZWxlYXNlID0gMC4yNTAsXG4gICAgICAgIHRocmVzaG9sZDogY29tcHJlc3Nvci50aHJlc2hvbGQgPSAtMjQsXG4gICAgICB9ID0gY2ZnKVxuICAgIH1cbiAgICBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yKGNmZylcbiAgfVxufVxuXG5leHBvcnQge21hc3RlckdhaW4sIGNvbXByZXNzb3IgYXMgbWFzdGVyQ29tcHJlc3Nvciwgc2V0TWFzdGVyVm9sdW1lLCBnZXRNYXN0ZXJWb2x1bWUsIGdldENvbXByZXNzaW9uUmVkdWN0aW9uLCBlbmFibGVNYXN0ZXJDb21wcmVzc29yLCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yfVxuIiwiaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge2NyZWF0ZVNhbXBsZX0gZnJvbSAnLi9zYW1wbGUnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7XG4gIENSRUFURV9JTlNUUlVNRU5ULFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgaW5zdHJ1bWVudEluZGV4ID0gMFxuXG5jbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHR5cGU6IHN0cmluZyl7XG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuc2NoZWR1bGVkID0ge31cbiAgICB0aGlzLnN1c3RhaW5lZCA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUsIG91dHB1dCl7XG4gICAgbGV0IHNhbXBsZVxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSBjcmVhdGVTYW1wbGUoLTEsIGV2ZW50KVxuICAgICAgdGhpcy5zY2hlZHVsZWRbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGVcbiAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdChvdXRwdXQpXG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29uc29sZS5lcnJvcignc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIHRoaXMuc3VzdGFpbmVkLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICAgIC8vZGlzcGF0Y2hFdmVudCh0aGlzLnRyYWNrLnNvbmcsICdzdXN0YWluX3BlZGFsJywgJ2Rvd24nKTtcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWQuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRbbWlkaU5vdGVJZF0uc3RvcChldmVudC50aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWQpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWQgPSBbXVxuICAgICAgICAgIC8vZGlzcGF0Y2hFdmVudCh0aGlzLnRyYWNrLnNvbmcsICdzdXN0YWluX3BlZGFsJywgJ3VwJyk7XG4gICAgICAgICAgLy90aGlzLnN0b3BTdXN0YWluKHRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHBhbm5pbmdcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSAxMCl7XG4gICAgICAgIC8vIHBhbm5pbmcgaXMgKm5vdCogZXhhY3RseSB0aW1lZCAtPiBub3QgcG9zc2libGUgKHlldCkgd2l0aCBXZWJBdWRpb1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgLy8gdm9sdW1lXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gNyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcEFsbFNvdW5kcygpe1xuICAgIE9iamVjdC5rZXlzKHRoaXMuc2NoZWR1bGVkKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgICAgdGhpcy5zY2hlZHVsZWRbc2FtcGxlSWRdLnN0b3AoMCwgKCkgPT4ge1xuICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRbc2FtcGxlSWRdXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluc3RydW1lbnQodHlwZTogc3RyaW5nKXtcbiAgbGV0IGlkID0gYElOXyR7aW5zdHJ1bWVudEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KGlkLCB0eXBlKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX0lOU1RSVU1FTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBpbnN0cnVtZW50XG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnQge1xuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCh0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSk6IHN0cmluZ3tcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgdHlwZSxcbiAgICAgIGZyZXF1ZW5jeTogNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpLFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNSURJRXZlbnRJZCgpOiBzdHJpbmd7XG4gIHJldHVybiBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnQoaWQ6IHN0cmluZywgdGlja3NfdG9fbW92ZTogbnVtYmVyKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgbGV0IHRpY2tzID0gZXZlbnQudGlja3MgKyB0aWNrc190b19tb3ZlXG4gIHRpY2tzID0gdGlja3MgPCAwID8gMCA6IHRpY2tzXG4gIC8vY29uc29sZS5sb2codGlja3MsIGV2ZW50LnRpY2tzKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudFRvKGlkOiBzdHJpbmcsIHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCJcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgQ1JFQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNSURJTm90ZShpZCwgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpKXtcbiAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbaWRdXG4gIGxldCBldmVudHMgPSBzdGF0ZS5taWRpRXZlbnRzXG4gIGxldCBzdGFydCA9IGV2ZW50c1tub3RlLm5vdGVvbl1cbiAgbGV0IGVuZCA9IGV2ZW50c1tub3RlLm5vdGVvZmZdXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBzdGFydDogc3RhcnQudGlja3MsXG4gICAgICBlbmQ6IGVuZC50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IGVuZC50aWNrcyAtIHN0YXJ0LnRpY2tzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESU5vdGUobm90ZW9uOiBzdHJpbmcsIG5vdGVvZmY6IHN0cmluZyl7XG4gIGxldCBldmVudHMgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvci5taWRpRXZlbnRzXG4gIGxldCBvbiA9IGV2ZW50c1tub3Rlb25dXG4gIGxldCBvZmYgPSBldmVudHNbbm90ZW9mZl1cbiAgaWYob24uZGF0YTEgIT09IG9mZi5kYXRhMSl7XG4gICAgY29uc29sZS5lcnJvcignY2FuXFwndCBjcmVhdGUgTUlESSBub3RlOiBldmVudHMgbXVzdCBoYXZlIHRoZSBzYW1lIGRhdGExIHZhbHVlLCBpLmUuIHRoZSBzYW1lIHBpdGNoJylcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX01JRElfTk9URSxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5vdGVvbixcbiAgICAgIG5vdGVvZmYsXG4gICAgICBzdGFydDogb24udGlja3MsXG4gICAgICBlbmQ6IG9mZi50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IG9mZi50aWNrcyAtIG9uLnRpY2tzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcyxcbiAgcHJldmlvdXNFdmVudDtcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cyl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4vKlxuICAgIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG5cbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuXG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4qL1xuICB9KTtcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpe1xuICBsZXQgbm90ZXMgPSB7fVxuICBsZXQgbm90ZXNJblRyYWNrXG4gIGxldCBuID0gMFxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50LnBhcnRJZCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50LnRyYWNrSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC50cmFja0lkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9NSURJX0VWRU5UUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoXG4gIHNldHRpbmdzOiB7XG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRyYWNrSWQ6IHN0cmluZyxcbiAgICBtaWRpRXZlbnRJZHM6QXJyYXk8c3RyaW5nPixcbiAgICBtaWRpTm90ZUlkczpBcnJheTxzdHJpbmc+LFxuICB9ID0ge31cbil7XG4gIGxldCBpZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgbWlkaUV2ZW50SWRzID0gW10sXG4gICAgbWlkaU5vdGVJZHMgPSBbXSxcbiAgICB0cmFja0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfUEFSVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBtaWRpRXZlbnRJZHMsXG4gICAgICBtaWRpTm90ZUlkcyxcbiAgICAgIHRyYWNrSWQsXG4gICAgICBtdXRlOiBmYWxzZVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzKHBhcnRfaWQ6IHN0cmluZywgLi4ubWlkaV9ldmVudF9pZHMpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHBhcnRfaWQsXG4gICAgICBtaWRpX2V2ZW50X2lkc1xuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgY3JlYXRlTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0e1xuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxufSBmcm9tICcuL3BhcnQnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgc29uZ0Zyb21NSURJRmlsZVxufSBmcm9tICcuL3NvbmdfZnJvbV9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBjb250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uOiAnMC4wLjEnLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcblxuICBsb2c6IGZ1bmN0aW9uKGlkKXtcbiAgICBpZihpZCA9PT0gJ2Z1bmN0aW9ucycpe1xuICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgY3JlYXRlTUlESUV2ZW50XG4gICAgICAgIG1vdmVNSURJRXZlbnRcbiAgICAgICAgbW92ZU1JRElFdmVudFRvXG4gICAgICAgIGNyZWF0ZU1JRElOb3RlXG4gICAgICAgIGNyZWF0ZVNvbmdcbiAgICAgICAgYWRkVHJhY2tzXG4gICAgICAgIGNyZWF0ZVRyYWNrXG4gICAgICAgIGFkZFBhcnRzXG4gICAgICAgIGNyZWF0ZVBhcnRcbiAgICAgICAgYWRkTUlESUV2ZW50c1xuICAgICAgYClcbiAgICB9XG4gIH1cbn1cblxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbi8vY29uc3QgTUlESSA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0VPWCcsIHt2YWx1ZTogMjQ3fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSk7XG5cbmV4cG9ydCBkZWZhdWx0IHFhbWJpXG5cbmV4cG9ydCB7XG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL2luaXRfYXVkaW9cbiAgZ2V0QXVkaW9Db250ZXh0LFxuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIHNldE1hc3RlclZvbHVtZSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbi8vICBNSURJLFxuXG4gIHBhcnNlTUlESUZpbGUsXG4gIHNvbmdGcm9tTUlESUZpbGUsXG59XG4iLCJpbXBvcnQge2NvbWJpbmVSZWR1Y2Vyc30gZnJvbSAncmVkdXgnXG5pbXBvcnQge1xuICAvLyBmb3IgZWRpdG9yXG4gIENSRUFURV9TT05HLFxuICBDUkVBVEVfVFJBQ0ssXG4gIENSRUFURV9QQVJULFxuICBBRERfUEFSVFMsXG4gIEFERF9UUkFDS1MsXG4gIEFERF9NSURJX05PVEVTLFxuICBBRERfTUlESV9FVkVOVFMsXG4gIEFERF9USU1FX0VWRU5UUyxcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIENSRUFURV9NSURJX05PVEUsXG4gIEFERF9FVkVOVFNfVE9fU09ORyxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX05PVEUsXG4gIFVQREFURV9TT05HLFxuICBTRVRfSU5TVFJVTUVOVCxcblxuICAvLyBmb3Igc2VxdWVuY2VyIG9ubHlcbiAgU09OR19QT1NJVElPTixcbiAgU1RBUlRfU0NIRURVTEVSLFxuICBTVE9QX1NDSEVEVUxFUixcblxuICAvLyBmb3IgaW5zdHJ1bWVudCBvbmx5XG4gIENSRUFURV9JTlNUUlVNRU5ULFxuICBTVE9SRV9TQU1QTEVTLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICBzb25nczoge30sXG4gIHRyYWNrczoge30sXG4gIHBhcnRzOiB7fSxcbiAgbWlkaUV2ZW50czoge30sXG4gIG1pZGlOb3Rlczoge30sXG59XG5cblxuZnVuY3Rpb24gZWRpdG9yKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pe1xuXG4gIGxldFxuICAgIGV2ZW50LCBldmVudElkLFxuICAgIHNvbmcsIHNvbmdJZCxcbiAgICBtaWRpRXZlbnRzXG5cbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgQ1JFQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9UUkFDSzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9QQVJUOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5wYXJ0c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9FVkVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaUV2ZW50c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5taWRpTm90ZXNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1RSQUNLUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc29uZ0lkID0gYWN0aW9uLnBheWxvYWQuc29uZ19pZFxuICAgICAgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdJZF1cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBsZXQgdHJhY2tJZHMgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZHNcbiAgICAgICAgdHJhY2tJZHMuZm9yRWFjaChmdW5jdGlvbih0cmFja0lkKXtcbiAgICAgICAgICBsZXQgdHJhY2sgPSBzdGF0ZS50cmFja3NbdHJhY2tJZF1cbiAgICAgICAgICBpZih0cmFjayl7XG4gICAgICAgICAgICBzb25nLnRyYWNrSWRzLnB1c2godHJhY2tJZClcbiAgICAgICAgICAgIHRyYWNrLnNvbmdJZCA9IHNvbmdJZFxuICAgICAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IFtdXG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24ocGFydElkKXtcbiAgICAgICAgICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICAgICAgICAgIHNvbmcucGFydElkcy5wdXNoKHBhcnRJZClcbiAgICAgICAgICAgICAgbWlkaUV2ZW50SWRzLnB1c2goLi4ucGFydC5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaCguLi5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHRyYWNrIHdpdGggaWQgJHt0cmFja0lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9QQVJUUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHRyYWNrSWQgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZFxuICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIC8vdHJhY2sucGFydHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5wYXJ0X2lkcylcbiAgICAgICAgbGV0IHBhcnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkc1xuICAgICAgICBwYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbaWRdXG4gICAgICAgICAgaWYocGFydCl7XG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBwYXJ0LnRyYWNrSWQgPSB0cmFja0lkXG4gICAgICAgICAgICBwYXJ0Lm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgICAgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICAgICAgICAgICAgICBldmVudC50cmFja0lkID0gdHJhY2tJZFxuICAgICAgICAgICAgICBldmVudC5pbnN0cnVtZW50SWQgPSB0cmFjay5pbnN0cnVtZW50SWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHBhcnQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgZm91bmQgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX01JRElfRVZFTlRTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgcGFydElkID0gYWN0aW9uLnBheWxvYWQucGFydF9pZFxuICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICBpZihwYXJ0KXtcbiAgICAgICAgLy9wYXJ0Lm1pZGlFdmVudHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkcylcbiAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IGFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzXG4gICAgICAgIG1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgbWlkaUV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgICAgICAgICBpZihtaWRpRXZlbnQpe1xuICAgICAgICAgICAgcGFydC5taWRpRXZlbnRJZHMucHVzaChpZClcbiAgICAgICAgICAgIG1pZGlFdmVudC5wYXJ0SWQgPSBwYXJ0SWRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7aWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBwYXJ0IGZvdW5kIHdpdGggaWQgJHtwYXJ0SWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX01JRElfRVZFTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGV2ZW50SWQgPSBhY3Rpb24ucGF5bG9hZC5pZFxuICAgICAgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50SWRdO1xuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICAoe1xuICAgICAgICAgIHRpY2tzOiBldmVudC50aWNrcyA9IGV2ZW50LnRpY2tzLFxuICAgICAgICAgIGRhdGExOiBldmVudC5kYXRhMSA9IGV2ZW50LmRhdGExLFxuICAgICAgICAgIGRhdGEyOiBldmVudC5kYXRhMiA9IGV2ZW50LmRhdGEyLFxuICAgICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBNSURJIGV2ZW50IGZvdW5kIHdpdGggaWQgJHtldmVudElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXTtcbiAgICAgICh7XG4gICAgICAgIC8vIGlmIHRoZSBwYXlsb2FkIGhhcyBhIHZhbHVlIGZvciAnc3RhcnQnIGl0IHdpbGwgYmUgYXNzaWduZWQgdG8gbm90ZS5zdGFydCwgb3RoZXJ3aXNlIG5vdGUuc3RhcnQgd2lsbCBrZWVwIGl0cyBjdXJyZW50IHZhbHVlXG4gICAgICAgIHN0YXJ0OiBub3RlLnN0YXJ0ID0gbm90ZS5zdGFydCxcbiAgICAgICAgZW5kOiBub3RlLmVuZCA9IG5vdGUuZW5kLFxuICAgICAgICBkdXJhdGlvblRpY2tzOiBub3RlLmR1cmF0aW9uVGlja3MgPSBub3RlLmR1cmF0aW9uVGlja3NcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX07XG4gICAgICAoe3NvbmdfaWQ6IHNvbmdJZCwgbWlkaV9ldmVudHM6IG1pZGlFdmVudHN9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ0lkXVxuICAgICAgc29uZy5taWRpRXZlbnRJZHMgPSBbXVxuICAgICAgbWlkaUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgLy8gcHV0IG1pZGkgZXZlbnQgaWRzIGluIGNvcnJlY3Qgb3JkZXJcbiAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaChldmVudC5pZClcbiAgICAgICAgLy8gcmVwbGFjZSBldmVudCB3aXRoIHVwZGF0ZWQgZXZlbnRcbiAgICAgICAgc3RhdGUubWlkaUV2ZW50c1tldmVudC5pZF0gPSBldmVudDtcbiAgICAgIH0pXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNFVF9JTlNUUlVNRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9O1xuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLnRyYWNrSWRdLmluc3RydW1lbnRJZCA9IGFjdGlvbi5wYXlsb2FkLmluc3RydW1lbnRJZFxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8vIHN0YXRlIHdoZW4gYSBzb25nIGlzIHBsYXlpbmdcbmZ1bmN0aW9uIHNlcXVlbmNlcihzdGF0ZSA9IHtzb25nczoge319LCBhY3Rpb24pe1xuICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuXG4gICAgY2FzZSBVUERBVEVfU09ORzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0gPSB7XG4gICAgICAgIHNvbmdJZDogYWN0aW9uLnBheWxvYWQuc29uZ19pZCxcbiAgICAgICAgbWlkaUV2ZW50czogYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudHMsXG4gICAgICAgIHNldHRpbmdzOiBhY3Rpb24ucGF5bG9hZC5zZXR0aW5ncyxcbiAgICAgICAgcGxheWluZzogZmFsc2UsXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNUQVJUX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0uc2NoZWR1bGVyID0gYWN0aW9uLnBheWxvYWQuc2NoZWR1bGVyXG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXS5wbGF5aW5nID0gdHJ1ZVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTVE9QX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgZGVsZXRlIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnNjaGVkdWxlclxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0ucGxheWluZyA9IGZhbHNlXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNPTkdfUE9TSVRJT046XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnBvc2l0aW9uID0gYWN0aW9uLnBheWxvYWQucG9zaXRpb25cbiAgICAgIGJyZWFrXG5cblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cbmZ1bmN0aW9uIGd1aShzdGF0ZSA9IHt9LCBhY3Rpb24pe1xuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gaW5zdHJ1bWVudHMoc3RhdGUgPSB7fSwgYWN0aW9uKXtcbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcbiAgICBjYXNlIENSRUFURV9JTlNUUlVNRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZVthY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZC5pbnN0cnVtZW50XG4gICAgICAvL3N0YXRlID0gey4uLnN0YXRlLCAuLi57W2FjdGlvbi5wYXlsb2FkLmlkXTogYWN0aW9uLnBheWxvYWQuaW5zdHJ1bWVudH19XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBTVE9SRV9TQU1QTEVTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBjb25zb2xlLmxvZyhhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5jb25zdCBzZXF1ZW5jZXJBcHAgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBndWksXG4gIGVkaXRvcixcbiAgc2VxdWVuY2VyLFxuICBpbnN0cnVtZW50cyxcbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyQXBwXG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpby5qcyc7XG5cbmNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgLy8gY3JlYXRlIHNpbXBsZSBzeW50aCBzYW1wbGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NpbmUnO1xuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuZDtcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cblxuICBzdGFydCh0aW1lKXtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlKTtcbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIHRoaXMuc291cmNlLnN0b3AodGltZSk7XG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZSguLi5hcmdzKXtcbiAgcmV0dXJuIG5ldyBTYW1wbGUoLi4uYXJncyk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZW1wdHlPZ2dcIjogXCJUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89XCIsXG4gIFwiZW1wdHlNcDNcIjogXCIvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPVwiLFxuICBcImhpZ2h0aWNrXCI6IFwiVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUFcIixcbiAgXCJsb3d0aWNrXCI6IFwiVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT1cIixcbn0iLCJcbmNvbnN0IEJVRkZFUl9USU1FID0gNDAwIC8vIG1pbGxpc1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3IoZGF0YSl7XG4gICAgKHtcbiAgICAgIHNvbmdfaWQ6IHRoaXMuc29uZ0lkLFxuICAgICAgc3RhcnRfcG9zaXRpb246IHRoaXMuc29uZ1N0YXJ0UG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXA6IHRoaXMudGltZVN0YW1wLFxuICAgICAgbWlkaUV2ZW50czogdGhpcy5ldmVudHMsXG4gICAgICBpbnN0cnVtZW50czogdGhpcy5pbnN0cnVtZW50cyxcbiAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgdHJhY2tzOiB0aGlzLnRyYWNrcyxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGJhcnM6IHRoaXMuYmFycyxcbiAgICAgICAgbG9vcDogdGhpcy5sb29wXG4gICAgICB9XG4gICAgfSA9IGRhdGEpXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRQb3NpdGlvbilcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cblxuICBnZXRFdmVudHMoKXtcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShwb3NpdGlvbil7XG4gICAgdmFyIGksXG4gICAgICBldmVudCxcbiAgICAgIG51bUV2ZW50cyxcbiAgICAgIGV2ZW50cyxcbiAgICAgIGluc3RydW1lbnRcblxuICAgIHRoaXMubWF4dGltZSA9IHBvc2l0aW9uICsgQlVGRkVSX1RJTUVcbiAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSBldmVudHNbaV1cbiAgICAgIGluc3RydW1lbnQgPSB0aGlzLmluc3RydW1lbnRzW2V2ZW50Lmluc3RydW1lbnRJZF1cblxuICAgICAgaWYodHlwZW9mIGluc3RydW1lbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5wYXJ0c1tldmVudC5wYXJ0SWRdLm11dGUgPT09IHRydWUgfHwgdGhpcy50cmFja3NbZXZlbnQudHJhY2tJZF0ubXV0ZSA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZUlkID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vIHRoaXMgaXMgdXN1YWxseSBjYXVzZWQgYnkgdGhlIHNhbWUgbm90ZSBvbiB0aGUgc2FtZSB0aWNrcyB2YWx1ZSwgd2hpY2ggaXMgcHJvYmFibHkgYSBidWcgaW4gdGhlIG1pZGkgZmlsZVxuICAgICAgICBjb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gZGVidWcgbWludXRlX3dhbHR6IGRvdWJsZSBldmVudHNcbiAgICAgIC8vIGlmKGV2ZW50LnRpY2tzID4gNDAzMDApe1xuICAgICAgLy8gICBjb25zb2xlLmluZm8oZXZlbnQpXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2UgaWYoaW5zdHJ1bWVudC50eXBlID09PSAnZXh0ZXJuYWwnKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWQ6IHJvdXRlIHRvIGV4dGVybmFsIG1pZGkgaW5zdHJ1bWVudFxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCB0aW1lID0gKHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRQb3NpdGlvbilcbiAgICAgICAgdGltZSAvPSAxMDAwIC8vIGNvbnZlcnQgdG8gc2Vjb25kcyBiZWNhdXNlIHRoZSBhdWRpbyBjb250ZXh0IHVzZXMgc2Vjb25kcyBmb3Igc2NoZWR1bGluZ1xuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUsIHRoaXMudHJhY2tzW2V2ZW50LnRyYWNrSWRdLm91dHB1dClcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmluZGV4LCB0aGlzLm51bUV2ZW50cylcbiAgICAvL3JldHVybiB0aGlzLmluZGV4ID49IDEwXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5udW1FdmVudHMgLy8gZW5kIG9mIHNvbmdcbiAgfVxuXG5cbiAgc3RvcEFsbFNvdW5kcygpe1xuICAgIE9iamVjdC5rZXlzKHRoaXMuaW5zdHJ1bWVudHMpLmZvckVhY2goKGluc3RydW1lbnRJZCkgPT4ge1xuICAgICAgaWYoaW5zdHJ1bWVudElkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHRoaXMuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXS5zdG9wQWxsU291bmRzKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn1cblxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzLCBmaWx0ZXJFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtnZXRNSURJRXZlbnRJZH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IFNjaGVkdWxlciBmcm9tICcuL3NjaGVkdWxlcidcbmltcG9ydCB7XG4gIENSRUFURV9TT05HLFxuICBBRERfVFJBQ0tTLFxuICBVUERBVEVfU09ORyxcbiAgU09OR19QT1NJVElPTixcbiAgQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gIFNUQVJUX1NDSEVEVUxFUixcbiAgU1RPUF9TQ0hFRFVMRVIsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuaW1wb3J0IHFhbWJpIGZyb20gJy4vcWFtYmknXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHNvbmdJbmRleCA9IDBcblxuY29uc3QgZGVmYXVsdFNvbmcgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMzAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vbWluYXRvcjogNCxcbiAgZGVub21pbmF0b3I6IDQsXG4gIHF1YW50aXplVmFsdWU6IDgsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IGZhbHNlLFxuICBwb3NpdGlvblR5cGU6ICdhbGwnLFxuICB1c2VNZXRyb25vbWU6IGZhbHNlLFxuICBhdXRvU2l6ZTogdHJ1ZSxcbiAgbG9vcDogZmFsc2UsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2Vcbn1cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhblxufVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvbmcoc2V0dGluZ3M6IHt9ID0ge30pOiBzdHJpbmd7XG4gIGxldCBpZCA9IGBTXyR7c29uZ0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgcyA9IHt9O1xuICAoe1xuICAgIG5hbWU6IHMubmFtZSA9IGlkLFxuICAgIHBwcTogcy5wcHEgPSBkZWZhdWx0U29uZy5wcHEsXG4gICAgYnBtOiBzLmJwbSA9IGRlZmF1bHRTb25nLmJwbSxcbiAgICBiYXJzOiBzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgIGxvd2VzdE5vdGU6IHMubG93ZXN0Tm90ZSA9IGRlZmF1bHRTb25nLmxvd2VzdE5vdGUsXG4gICAgaGlnaGVzdE5vdGU6IHMuaGlnaGVzdE5vdGUgPSBkZWZhdWx0U29uZy5oaWdoZXN0Tm90ZSxcbiAgICBub21pbmF0b3I6IHMubm9taW5hdG9yID0gZGVmYXVsdFNvbmcubm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yOiBzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgcXVhbnRpemVWYWx1ZTogcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNvbmcucXVhbnRpemVWYWx1ZSxcbiAgICBmaXhlZExlbmd0aFZhbHVlOiBzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U29uZy5maXhlZExlbmd0aFZhbHVlLFxuICAgIHBvc2l0aW9uVHlwZTogcy5wb3NpdGlvblR5cGUgPSBkZWZhdWx0U29uZy5wb3NpdGlvblR5cGUsXG4gICAgdXNlTWV0cm9ub21lOiBzLnVzZU1ldHJvbm9tZSA9IGRlZmF1bHRTb25nLnVzZU1ldHJvbm9tZSxcbiAgICBhdXRvU2l6ZTogcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgIGxvb3A6IHMubG9vcCA9IGRlZmF1bHRTb25nLmxvb3AsXG4gICAgcGxheWJhY2tTcGVlZDogcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNvbmcucGxheWJhY2tTcGVlZCxcbiAgICBhdXRvUXVhbnRpemU6IHMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICB9ID0gc2V0dGluZ3MpXG5cbiAgbGV0e1xuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHMgPSBbXG4gICAgICB7aWQ6IGdldE1JRElFdmVudElkKCksIHNvbmc6IGlkLCB0aWNrczogMCwgdHlwZTogcWFtYmkuVEVNUE8sIGRhdGExOiBzLmJwbX0sXG4gICAgICB7aWQ6IGdldE1JRElFdmVudElkKCksIHNvbmc6IGlkLCB0aWNrczogMCwgdHlwZTogcWFtYmkuVElNRV9TSUdOQVRVUkUsIGRhdGExOiBzLm5vbWluYXRvciwgZGF0YTI6IHMuZGVub21pbmF0b3J9XG4gICAgXSxcbiAgICBtaWRpRXZlbnRJZHM6IG1pZGlFdmVudElkcyA9IFtdLFxuICAgIHBhcnRJZHM6IHBhcnRJZHMgPSBbXSxcbiAgICB0cmFja0lkczogdHJhY2tJZHMgPSBbXSxcbiAgfSA9IHNldHRpbmdzXG5cbiAgLy9wYXJzZVRpbWVFdmVudHMocywgdGltZUV2ZW50cylcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aW1lRXZlbnRzLFxuICAgICAgbWlkaUV2ZW50SWRzLFxuICAgICAgcGFydElkcyxcbiAgICAgIHRyYWNrSWRzLFxuICAgICAgc2V0dGluZ3M6IHNcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUcmFja3Moc29uZ19pZDogc3RyaW5nLCAuLi50cmFja19pZHM6IHN0cmluZ1tdKTogdm9pZHtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9UUkFDS1MsXG4gICAgcGF5bG9hZDoge1xuICAgICAgc29uZ19pZCxcbiAgICAgIHRyYWNrX2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRpbWVFdmVudHMoLi4udGltZV9ldmVudHM6IHN0cmluZ1tdKTogdm9pZHtcblxufVxuXG5cbi8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU29uZyhzb25nX2lkOiBzdHJpbmcsIGZpbHRlcl9ldmVudHM6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWR7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yXG4gIGxldCBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ19pZF1cbiAgaWYoc29uZyl7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGUgc29uZycpXG4gICAgLy9AVE9ETzogY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgICBwYXJzZVRpbWVFdmVudHMoc29uZy5zZXR0aW5ncywgc29uZy50aW1lRXZlbnRzKVxuICAgIGxldCBtaWRpRXZlbnRzID0gWy4uLnNvbmcudGltZUV2ZW50c11cbiAgICBzb25nLm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50X2lkKXtcbiAgICAgIGxldCBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbZXZlbnRfaWRdXG4gICAgICBpZihldmVudCl7XG4gICAgICAgIG1pZGlFdmVudHMucHVzaCh7Li4uZXZlbnR9KVxuICAgICAgfVxuICAgIH0pXG4gICAgbWlkaUV2ZW50cyA9IHBhcnNlRXZlbnRzKG1pZGlFdmVudHMpXG4gICAgcGFyc2VNSURJTm90ZXMobWlkaUV2ZW50cylcbiAgICAvLyBtaWRpRXZlbnRzLmZvckVhY2goKGUpID0+IHtcbiAgICAvLyAgIGlmKGUuYmFyID49IDUgJiYgZS5iYXIgPD0gNil7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGUuYmFyc0FzU3RyaW5nLCBlLmRhdGExLCBlLmRhdGEyLCBlLnR5cGUpXG4gICAgLy8gICB9XG4gICAgLy8gfSlcbiAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICB0eXBlOiBVUERBVEVfU09ORyxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ19pZCxcbiAgICAgICAgbWlkaV9ldmVudHM6IG1pZGlFdmVudHMsXG4gICAgICAgIHNldHRpbmdzOiBzb25nLnNldHRpbmdzIC8vIG5lZWRlZCBmb3IgdGhlIHNlcXVlbmNlciByZWR1Y2VyXG4gICAgICB9XG4gICAgfSlcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZSBzb25nJylcbiAgfWVsc2V7XG4gICAgY29uc29sZS53YXJuKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTb25nKHNvbmdfaWQ6IHN0cmluZywgc3RhcnRfcG9zaXRpb246IG51bWJlciA9IDApOiB2b2lke1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNjaGVkdWxlcigpe1xuICAgIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKClcbiAgICBsZXQgc29uZ0RhdGEgPSBzdGF0ZS5zZXF1ZW5jZXIuc29uZ3Nbc29uZ19pZF1cbiAgICBsZXQgcGFydHMgPSB7fVxuICAgIGxldCB0cmFja3MgPSB7fVxuICAgIGxldCBpbnN0cnVtZW50cyA9IHt9XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IG1pZGlFdmVudHMgPSBzb25nRGF0YS5taWRpRXZlbnRzLmZpbHRlcihmdW5jdGlvbihldmVudCl7XG4gICAgICAvLyBpZigoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkgJiYgdHlwZW9mIGV2ZW50Lm1pZGlOb3RlSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vICAgY29uc29sZS5pbmZvKGkrKywgJ25vIG1pZGlOb3RlSWQnLCBldmVudC50aWNrcywgZXZlbnQudHlwZSwgZXZlbnQuZGF0YTEsIGV2ZW50LnRyYWNrSWQpXG4gICAgICAvLyAgIHJldHVybiBmYWxzZVxuICAgICAgLy8gfVxuICAgICAgbGV0IHBhcnQgPSBwYXJ0c1tldmVudC5wYXJ0SWRdXG4gICAgICBsZXQgdHJhY2sgPSB0cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgIGlmKHR5cGVvZiBwYXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHBhcnRzW2V2ZW50LnBhcnRJZF0gPSBwYXJ0ID0gc3RhdGUuZWRpdG9yLnBhcnRzW2V2ZW50LnBhcnRJZF1cbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiB0cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICB0cmFja3NbZXZlbnQudHJhY2tJZF0gPSB0cmFjayA9IHN0YXRlLmVkaXRvci50cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgICAgaW5zdHJ1bWVudHNbdHJhY2suaW5zdHJ1bWVudElkXSA9IHN0YXRlLmluc3RydW1lbnRzW3RyYWNrLmluc3RydW1lbnRJZF1cbiAgICAgIH1cbiAgICAgIC8vcmV0dXJuICghZXZlbnQubXV0ZSAmJiAhcGFydC5tdXRlICYmICF0cmFjay5tdXRlKVxuICAgICAgLy8gY2hlY2sgaWYgYSBub3RlLCBwYXJ0IG9yIHRyYWNrIGlzIG11dGVkIHNob3VsZCBiZSBkb25lIGluIHRoZSBzY2hlZHVsZXIgbG9vcFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc3RhcnRfcG9zaXRpb25cbiAgICBsZXQgdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAgLy8gLT4gY29udmVydCB0byBtaWxsaXNcbiAgICBsZXQgc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7XG4gICAgICBzb25nX2lkLFxuICAgICAgc3RhcnRfcG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXAsXG4gICAgICBwYXJ0cyxcbiAgICAgIHRyYWNrcyxcbiAgICAgIGluc3RydW1lbnRzLFxuICAgICAgc2V0dGluZ3M6IHNvbmdEYXRhLnNldHRpbmdzLFxuICAgICAgbWlkaUV2ZW50czogbWlkaUV2ZW50cyxcbiAgICB9KVxuXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogU1RBUlRfU0NIRURVTEVSLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBzb25nX2lkLFxuICAgICAgICBzY2hlZHVsZXJcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBsZXRcbiAgICAgICAgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsXG4gICAgICAgIGRpZmYgPSBub3cgLSB0aW1lU3RhbXAsXG4gICAgICAgIGVuZE9mU29uZ1xuXG4gICAgICBwb3NpdGlvbiArPSBkaWZmIC8vIHBvc2l0aW9uIGlzIGluIG1pbGxpc1xuICAgICAgdGltZVN0YW1wID0gbm93XG4gICAgICBlbmRPZlNvbmcgPSBzY2hlZHVsZXIudXBkYXRlKHBvc2l0aW9uKVxuICAgICAgaWYoZW5kT2ZTb25nKXtcbiAgICAgICAgc3RvcFNvbmcoc29uZ19pZClcbiAgICAgIH1cbiAgICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgICAgdHlwZTogU09OR19QT1NJVElPTixcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIHNvbmdfaWQsXG4gICAgICAgICAgcG9zaXRpb25cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBhZGRUYXNrKCdyZXBldGl0aXZlJywgc29uZ19pZCwgY3JlYXRlU2NoZWR1bGVyKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wU29uZyhzb25nX2lkOiBzdHJpbmcpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpXG4gIGxldCBzb25nRGF0YSA9IHN0YXRlLnNlcXVlbmNlci5zb25nc1tzb25nX2lkXVxuICBpZihzb25nRGF0YSl7XG4gICAgaWYoc29uZ0RhdGEucGxheWluZyl7XG4gICAgICByZW1vdmVUYXNrKCdyZXBldGl0aXZlJywgc29uZ19pZClcbiAgICAgIHNvbmdEYXRhLnNjaGVkdWxlci5zdG9wQWxsU291bmRzKClcbiAgICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgICAgdHlwZTogU1RPUF9TQ0hFRFVMRVIsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzb25nX2lkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmVycm9yKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMoXG4gIHNldHRpbmdzOiB7c29uZ19pZDogc3RyaW5nLCB0cmFja19pZDogc3RyaW5nLCBwYXJ0X2lkOiBzdHJpbmd9LFxuICBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+XG4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuLy8gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50c1RvU29uZyhzb25nX2lkOiBzdHJpbmcsIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cbiovIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBwYXJzZU1JRElGaWxlIGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge2NyZWF0ZU1JRElFdmVudCwgZ2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y3JlYXRlUGFydCwgYWRkTUlESUV2ZW50c30gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtjcmVhdGVUcmFjaywgYWRkUGFydHMsIHNldEluc3RydW1lbnR9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge2NyZWF0ZVNvbmcsIGFkZFRyYWNrcywgdXBkYXRlU29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtjcmVhdGVJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmNvbnN0IFBQUSA9IDk2MFxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZShkYXRhLCBzZXR0aW5ncyA9IHt9KXtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHRvU29uZyhkYXRhKTtcbiAgLy8gfWVsc2V7XG4gIC8vICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAvLyAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gIC8vICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gIC8vICAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIC8vICAgfWVsc2V7XG4gIC8vICAgICBlcnJvcignd3JvbmcgZGF0YScpO1xuICAvLyAgIH1cbiAgfVxuXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0XG4gIGxldCBwcHFGYWN0b3IgPSBQUFEgLyBwcHEgLy9AVE9ETzogZ2V0IHBwcSBmcm9tIGNvbmZpZyAtPiBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHBwcSBvZiB0aGUgTUlESSBmaWxlICFcbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgZXZlbnRJZHNcbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgdHJhY2tJZHMgPSBbXVxuICBsZXQgc29uZ0lkXG4gIGxldCBpbnN0cnVtZW50SWQgPSBjcmVhdGVJbnN0cnVtZW50KClcblxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBldmVudElkcyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4OTAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2V0VGVtcG8nOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRlbXBvIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBsZXQgdG1wID0gNjAwMDAwMDAgLyBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0O1xuXG4gICAgICAgICAgaWYodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUuaW5mbygndGVtcG8gZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgdG1wKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoYnBtID09PSAtMSl7XG4gICAgICAgICAgICBicG0gPSB0bXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MgKyAweDUxLCB0aWNrcywgdHlwZTogMHg1MSwgZGF0YTE6IHRtcH0pO1xuICAgICAgICAgIC8vdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcywgdGlja3MsIHR5cGU6IDB4NTEsIGRhdGExOiB0bXB9KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzICsgMHg1OCwgdGlja3MsIHR5cGU6IDB4NTgsIGRhdGExOiBldmVudC5udW1lcmF0b3IsIGRhdGEyOiBldmVudC5kZW5vbWluYXRvcn0pO1xuICAgICAgICAgIC8vdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcywgdGlja3MsIHR5cGU6IDB4NTgsIGRhdGExOiBldmVudC5udW1lcmF0b3IsIGRhdGEyOiBldmVudC5kZW5vbWluYXRvcn0pO1xuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4QjAsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudElkcy5sZW5ndGggPiAwKXtcbiAgICAgIGxldCB0cmFja0lkID0gY3JlYXRlVHJhY2soe25hbWU6IHRyYWNrTmFtZX0pXG4gICAgICBzZXRJbnN0cnVtZW50KHRyYWNrSWQsIGluc3RydW1lbnRJZClcbiAgICAgIC8vbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWQsIG1pZGlFdmVudElkczogZXZlbnRJZHN9KVxuICAgICAgbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWR9KVxuICAgICAgYWRkTUlESUV2ZW50cyhwYXJ0SWQsIC4uLmV2ZW50SWRzKVxuICAgICAgYWRkUGFydHModHJhY2tJZCwgcGFydElkKVxuICAgICAgLy9hZGRUcmFja3Moc29uZ0lkLCB0cmFja0lkKVxuICAgICAgdHJhY2tJZHMucHVzaCh0cmFja0lkKVxuICAgIH1cbiAgfVxuXG4gIHNvbmdJZCA9IGNyZWF0ZVNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIC8vcGxheWJhY2tTcGVlZDogMSxcbiAgICAvL3BwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yLFxuICAgIHRpbWVFdmVudHMsXG4gIH0pXG4gIGFkZFRyYWNrcyhzb25nSWQsIC4uLnRyYWNrSWRzKVxuICB1cGRhdGVTb25nKHNvbmdJZClcbiAgcmV0dXJuIHNvbmdJZFxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBxYW1iaSwge1xuICBzZXRNYXN0ZXJWb2x1bWUsXG4gIGdldE1hc3RlclZvbHVtZSxcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG4gIGNyZWF0ZU1JRElOb3RlLFxuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcbn0gZnJvbSAnLi9xYW1iaSdcblxucWFtYmkuZ2V0TWFzdGVyVm9sdW1lKClcbnFhbWJpLmxvZygnZnVuY3Rpb25zJylcbnFhbWJpLmluaXQoZnVuY3Rpb24oZGF0YSl7XG4gIGNvbnNvbGUubG9nKGRhdGEsIHFhbWJpLmdldE1hc3RlclZvbHVtZSgpKVxuICBzZXRNYXN0ZXJWb2x1bWUoMC41KVxufSlcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IGJ1dHRvblN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0JylcbiAgbGV0IGJ1dHRvblN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpXG4gIGJ1dHRvblN0YXJ0LmRpc2FibGVkID0gdHJ1ZVxuICBidXR0b25TdG9wLmRpc2FibGVkID0gdHJ1ZVxuXG4gIGxldCB0ZXN0ID0gMlxuICBsZXQgbm90ZW9uLCBub3Rlb2ZmLCBub3RlLCBzb25nSWQsIHRyYWNrLCBwYXJ0MSwgcGFydDJcblxuICBpZih0ZXN0ID09PSAxKXtcblxuICAgIHNvbmdJZCA9IGNyZWF0ZVNvbmcoe25hbWU6ICdNeSBGaXJzdCBTb25nJywgcGxheWJhY2tTcGVlZDogMSwgbG9vcDogdHJ1ZSwgYnBtOiA2MH0pXG4gICAgdHJhY2sgPSBjcmVhdGVUcmFjayh7bmFtZTogJ2d1aXRhcicsIHNvbmdJZH0pXG4gICAgcGFydDEgPSBjcmVhdGVQYXJ0KHtuYW1lOiAnc29sbzEnLCB0cmFja30pXG4gICAgcGFydDIgPSBjcmVhdGVQYXJ0KHtuYW1lOiAnc29sbzInLCB0cmFja30pXG4gICAgLy9ub3Rlb24gPSBjcmVhdGVNSURJRXZlbnQoOTYwLCAxNDQsIDYwLCAxMDApXG4gICAgLy9ub3Rlb2ZmID0gY3JlYXRlTUlESUV2ZW50KDEwMjAsIDEyOCwgNjAsIDApXG4gICAgLy9hZGRNSURJRXZlbnRzKHBhcnQxLCBub3Rlb24sIG5vdGVvZmYpXG5cbiAgICAvL25vdGUgPSBjcmVhdGVNSURJTm90ZShub3Rlb24sIG5vdGVvZmYpXG5cblxuICAgIGxldCBldmVudHMgPSBbXVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZSA9IDE0NFxuXG4gICAgZm9yKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKXtcbiAgICAgIGV2ZW50cy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgdHlwZSwgNjAsIDEwMCkpXG4gICAgICBpZihpICUgMiA9PT0gMCl7XG4gICAgICAgIHR5cGUgPSAxMjhcbiAgICAgICAgdGlja3MgKz0gOTYwXG4gICAgICB9ZWxzZXtcbiAgICAgICAgdHlwZSA9IDE0NFxuICAgICAgICB0aWNrcyArPSA5NjBcbiAgICAgIH1cbiAgICB9XG4gICAgYWRkTUlESUV2ZW50cyhwYXJ0MSwgLi4uZXZlbnRzKVxuXG4gICAgYWRkUGFydHModHJhY2ssIHBhcnQxLCBwYXJ0MilcbiAgICBhZGRUcmFja3Moc29uZ0lkLCB0cmFjaylcbiAgICB1cGRhdGVTb25nKHNvbmdJZClcbiAgICBidXR0b25TdGFydC5kaXNhYmxlZCA9IGZhbHNlXG4gIH1cblxuLypcbiAgLy9zdGFydFNvbmcoc29uZylcbiAgLy8gbGV0IHNvbmcyID0gY3JlYXRlU29uZygpXG5cbiAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAvLyAgIHN0YXJ0U29uZyhzb25nMiwgNTAwMClcbiAgLy8gfSwgMTAwMClcblxuLy8gICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4vLyAgICAgc3RvcFNvbmcoc29uZylcbi8vIC8vICAgIHN0b3BTb25nKHNvbmcyKVxuLy8gICB9LCAyMDApXG4qL1xuXG4gIGlmKHRlc3QgPT09IDIpe1xuICAgIC8vZmV0Y2goJ21vems1NDVhLm1pZCcpXG4gICAgZmV0Y2goJ21pbnV0ZV93YWx0ei5taWQnKVxuICAgIC50aGVuKFxuICAgICAgKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5hcnJheUJ1ZmZlcigpXG4gICAgICB9LFxuICAgICAgKGVycm9yKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpXG4gICAgICB9XG4gICAgKVxuICAgIC50aGVuKChhYikgPT4ge1xuICAgICAgLy9zb25nSWQgPSBzb25nRnJvbU1JRElGaWxlKHBhcnNlTUlESUZpbGUoYWIpKVxuICAgICAgbGV0IG1mID0gcGFyc2VNSURJRmlsZShhYilcbiAgICAgIHNvbmdJZCA9IHNvbmdGcm9tTUlESUZpbGUobWYpXG4gICAgICAvL2NvbnNvbGUubG9nKCdoZWFkZXI6JywgbWYuaGVhZGVyKVxuICAgICAgLy9jb25zb2xlLmxvZygnIyB0cmFja3M6JywgbWYudHJhY2tzLnNpemUpXG4gICAgICBidXR0b25TdGFydC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgICBidXR0b25TdG9wLmRpc2FibGVkID0gZmFsc2VcbiAgICB9KVxuICB9XG5cbiAgYnV0dG9uU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHN0YXJ0U29uZyhzb25nSWQsIDApXG4gIH0pXG5cbiAgYnV0dG9uU3RvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgc3RvcFNvbmcoc29uZ0lkKVxuICB9KVxuXG59KVxuIiwiXG5cbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge2NyZWF0ZUluc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7bWFzdGVyR2Fpbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1RSQUNLLFxuICBBRERfUEFSVFMsXG4gIFNFVF9JTlNUUlVNRU5ULFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNrKFxuICBzZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydElkczpBcnJheTxzdHJpbmc+LCBzb25nSWQ6IHN0cmluZ30gPSB7fVxuICAvL3NldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0czpBcnJheTxzdHJpbmc+LCBzb25nOiBzdHJpbmd9ID0ge25hbWU6ICdhYXAnLCBwYXJ0czogW10sIHNvbmc6ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuICAvL3NldHRpbmdzID0ge25hbWU6IG5hbWUgPSAnYWFwJywgcGFydHM6IHBhcnRzID0gW10sIHNvbmc6IHNvbmcgPSAnbm8gc29uZyd9XG4pe1xuICBsZXQgaWQgPSBgTVRfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQge1xuICAgIG5hbWUgPSBpZCxcbiAgICBwYXJ0SWRzID0gW10sXG4gICAgc29uZ0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuICBsZXQgdm9sdW1lID0gMC41XG4gIGxldCBvdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBvdXRwdXQuZ2Fpbi52YWx1ZSA9IHZvbHVtZVxuICBvdXRwdXQuY29ubmVjdChtYXN0ZXJHYWluKVxuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfVFJBQ0ssXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBuYW1lLFxuICAgICAgcGFydElkcyxcbiAgICAgIHNvbmdJZCxcbiAgICAgIHZvbHVtZSxcbiAgICAgIG91dHB1dCxcbiAgICAgIG11dGU6IGZhbHNlLFxuICAgICAgLy9pbnN0cnVtZW50SWQ6IGNyZWF0ZUluc3RydW1lbnQoJ3NpbmV3YXZlJyksXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkUGFydHModHJhY2tfaWQ6IHN0cmluZywgLi4ucGFydF9pZHM6c3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9QQVJUUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB0cmFja19pZCxcbiAgICAgIHBhcnRfaWRzLFxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SW5zdHJ1bWVudCh0cmFja0lkOiBzdHJpbmcsIGluc3RydW1lbnRJZDogc3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFNFVF9JTlNUUlVNRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHRyYWNrSWQsXG4gICAgICBpbnN0cnVtZW50SWQsXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbXV0ZVRyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZvbHVtZVRyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBhbm5pbmdUcmFjayhmbGFnOiBib29sZWFuKXtcblxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5cbmNvbnN0XG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICBzZWNvbmRzLFxuICAgIHRpbWVBc1N0cmluZyA9ICcnO1xuXG4gIHNlY29uZHMgPSBtaWxsaXMvMTAwMDsgLy8g4oaSIG1pbGxpcyB0byBzZWNvbmRzXG4gIGggPSBtRmxvb3Ioc2Vjb25kcyAvICg2MCAqIDYwKSk7XG4gIG0gPSBtRmxvb3IoKHNlY29uZHMgJSAoNjAgKiA2MCkpIC8gNjApO1xuICBzID0gbUZsb29yKHNlY29uZHMgJSAoNjApKTtcbiAgbXMgPSBtUm91bmQoKHNlY29uZHMgLSAoaCAqIDM2MDApIC0gKG0gKiA2MCkgLSBzKSAqIDEwMDApO1xuXG4gIHRpbWVBc1N0cmluZyArPSBoICsgJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbSA8IDEwID8gJzAnICsgbSA6IG07XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBzIDwgMTAgPyAnMCcgKyBzIDogcztcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG1zID09PSAwID8gJzAwMCcgOiBtcyA8IDEwID8gJzAwJyArIG1zIDogbXMgPCAxMDAgPyAnMCcgKyBtcyA6IG1zO1xuXG4gIC8vY29uc29sZS5sb2coaCwgbSwgcywgbXMpO1xuICByZXR1cm4ge1xuICAgIGhvdXI6IGgsXG4gICAgbWludXRlOiBtLFxuICAgIHNlY29uZDogcyxcbiAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgdGltZUFzU3RyaW5nOiB0aW1lQXNTdHJpbmcsXG4gICAgdGltZUFzQXJyYXk6IFtoLCBtLCBzLCBtc11cbiAgfTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGUoc2FtcGxlLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICB0cnl7XG4gICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShzYW1wbGUsXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2VzcyhidWZmZXIpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coaWQsIGJ1ZmZlcik7XG4gICAgICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IGJ1ZmZlcn0pO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeSh7J2lkJzogaWQsICdidWZmZXInOiBidWZmZXJ9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgICAvL3JlamVjdChlKTsgLy8gZG9uJ3QgdXNlIHJlamVjdCBiZWNhdXNlIHdlIHVzZSB0aGlzIGFzIGEgbmVzdGVkIHByb21pc2UgYW5kIHdlIGRvbid0IHdhbnQgdGhlIHBhcmVudCBwcm9taXNlIHRvIHJlamVjdFxuICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IHVuZGVmaW5lZH0pO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICAgIH1jYXRjaChlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgIC8vcmVqZWN0KGUpO1xuICAgICAgaWYoaWQgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59XG5cblxuZnVuY3Rpb24gbG9hZEFuZFBhcnNlU2FtcGxlKHVybCwgaWQsIGV2ZXJ5KXtcbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGZldGNoKHVybCkudGhlbihcbiAgICAgIGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgICAgaWYocmVzcG9uc2Uub2spe1xuICAgICAgICAgIHJlc3BvbnNlLmJsb2IoKS50aGVuKGZ1bmN0aW9uKGRhdGEpe1xuICAgICAgICAgICAgcGFyc2VTYW1wbGUoZGF0YSwgaWQsIGV2ZXJ5KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgaWYodHlwZW9mIGlkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgICByZXNvbHZlKHsnaWQnOiBpZCwgJ2J1ZmZlcic6IHVuZGVmaW5lZH0pO1xuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH1cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGV4ZWN1dG9yKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU2FtcGxlcyhtYXBwaW5nLCBldmVyeSA9IGZhbHNlKXtcbiAgbGV0IGtleSwgc2FtcGxlLFxuICAgIHByb21pc2VzID0gW10sXG4gICAgdHlwZSA9IHR5cGVTdHJpbmcobWFwcGluZyk7XG5cbiAgZXZlcnkgPSB0eXBlU3RyaW5nKGV2ZXJ5KSA9PT0gJ2Z1bmN0aW9uJyA/IGV2ZXJ5IDogZmFsc2U7XG4gIC8vY29uc29sZS5sb2codHlwZSwgbWFwcGluZylcbiAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgIGZvcihrZXkgaW4gbWFwcGluZyl7XG4gICAgICBpZihtYXBwaW5nLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgICBzYW1wbGUgPSBtYXBwaW5nW2tleV07XG4gICAgICAgIC8vY29uc29sZS5sb2coY2hlY2tJZkJhc2U2NChzYW1wbGUpKVxuICAgICAgICBpZihjaGVja0lmQmFzZTY0KHNhbXBsZSkpe1xuICAgICAgICAgIHByb21pc2VzLnB1c2gocGFyc2VTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShzYW1wbGUsIGtleSwgZXZlcnkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICBpZihjaGVja0lmQmFzZTY0KHNhbXBsZSkpe1xuICAgICAgICBwcm9taXNlcy5wdXNoKHBhcnNlU2FtcGxlKHNhbXBsZSwgZXZlcnkpKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShzYW1wbGUsIGV2ZXJ5KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKHZhbHVlcyl7XG4gICAgICAgIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICBsZXQgbWFwcGluZyA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vY29uc29sZS5sb2cobWFwcGluZyk7XG4gICAgICAgICAgcmVzb2x2ZShtYXBwaW5nKTtcbiAgICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlKXtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcG9lcGVuKCl7XG4gIGNvbnNvbGUubG9nKGNvbnRleHQpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSWZCYXNlNjQoZGF0YSl7XG4gIGxldCBwYXNzZWQgPSB0cnVlO1xuICB0cnl7XG4gICAgYXRvYihkYXRhKTtcbiAgfWNhdGNoKGUpe1xuICAgIHBhc3NlZCA9IGZhbHNlO1xuICB9XG4gIHJldHVybiBwYXNzZWQ7XG59XG5cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aC0xKSk7XG4gIGxrZXkyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aC0xKSk7XG4gIGlmKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcbiAgaWYobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgIGNocjIgPSAoKGVuYzIgJiAxNSkgPDwgNCkgfCAoZW5jMyA+PiAyKTtcbiAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZihlbmMzICE9IDY0KSB1YXJyYXlbaSsxXSA9IGNocjI7XG4gICAgaWYoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdHlwZVN0cmluZyhvKXtcbiAgaWYodHlwZW9mIG8gIT0gJ29iamVjdCcpe1xuICAgIHJldHVybiB0eXBlb2YgbztcbiAgfVxuXG4gIGlmKG8gPT09IG51bGwpe1xuICAgIHJldHVybiAnbnVsbCc7XG4gIH1cblxuICAvL29iamVjdCwgYXJyYXksIGZ1bmN0aW9uLCBkYXRlLCByZWdleHAsIHN0cmluZywgbnVtYmVyLCBib29sZWFuLCBlcnJvclxuICBsZXQgaW50ZXJuYWxDbGFzcyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKS5tYXRjaCgvXFxbb2JqZWN0XFxzKFxcdyspXFxdLylbMV07XG4gIHJldHVybiBpbnRlcm5hbENsYXNzLnRvTG93ZXJDYXNlKCk7XG59XG4iXX0=
