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

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getStore = getStore;

var _redux = require('redux');

var _reducer = require('./reducer');

var _reducer2 = _interopRequireDefault(_reducer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _redux.createStore)(_reducer2.default);

/*
// don't use the redux dev tool because it use too much CPU and memory!
const logger = createLogger();
const store = createStore(sequencerApp, {}, compose(
  applyMiddleware(logger),
  typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
));
*/

//import thunk from 'redux-thunk';
//import createLogger from 'redux-logger';
function getStore() {
  return store;
}

},{"./reducer":29,"redux":12}],17:[function(require,module,exports){
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

},{"./io.js":21}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.context = undefined;
exports.init = init;

var _init_audio = require('./init_audio');

var context = exports.context = new window.AudioContext();

function init() {
  (0, _init_audio.initAudio)().then(function (e) {
    console.log(e);
  });
}

},{"./init_audio":19}],19:[function(require,module,exports){
/*
  Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initAudio = initAudio;

var _init = require('./init');

var _util = require('./util');

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = {},

// context,

source = void 0,
    gainNode = void 0,
    compressor = void 0;

var compressorParams = ['threshold', 'knee', 'ratio', 'reduction', 'attack', 'release'];

function initAudio() {

  //context = ctx
  return new Promise(function (resolve, reject) {
    //console.log(context)
    if (_init.context.createGainNode === undefined) {
      _init.context.createGainNode = _init.context.createGain;
    }
    // check for older implementations of WebAudio
    source = _init.context.createBufferSource();
    data.legacy = false;
    if (source.start === undefined) {
      data.legacy = true;
    }

    // set up the elementary audio nodes
    compressor = _init.context.createDynamicsCompressor();
    compressor.connect(_init.context.destination);
    gainNode = _init.context.createGainNode();
    gainNode.connect(_init.context.destination);
    gainNode.gain.value = 0.5;

    data.masterGainNode = gainNode;
    data.masterCompressor = compressor;

    (0, _util.parseSamples)({
      'ogg': _samples2.default.emptyOgg,
      'mp3': _samples2.default.emptyMp3,
      'lowtick': _samples2.default.lowtick,
      'hightick': _samples2.default.hightick
    }).then(function onFulfilled(buffers) {
      data.ogg = buffers.ogg !== undefined;
      data.mp3 = buffers.mp3 !== undefined;
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

data.setMasterVolume = function () {
  var value = arguments.length <= 0 || arguments[0] === undefined ? 0.5 : arguments[0];

  if (value > 1) {
    info('maximal volume is 1.0, volume is set to 1.0');
  }
  value = value < 0 ? 0 : value > 1 ? 1 : value;
  gainNode.gain.value = value;
};

data.getMasterVolume = function () {
  return gainNode.gain.value;
};

data.getCompressionReduction = function () {
  //console.log(compressor);
  return compressor.reduction.value;
};

data.enableMasterCompressor = function (flag) {
  if (flag) {
    gainNode.disconnect(0);
    gainNode.connect(compressor);
    compressor.disconnect(0);
    compressor.connect(_init.context.destination);
  } else {
    compressor.disconnect(0);
    gainNode.disconnect(0);
    gainNode.connect(_init.context.destination);
  }
};

data.configureMasterCompressor = function (cfg) {
  /*
      readonly attribute AudioParam threshold; // in Decibels
      readonly attribute AudioParam knee; // in Decibels
      readonly attribute AudioParam ratio; // unit-less
      readonly attribute AudioParam reduction; // in Decibels
      readonly attribute AudioParam attack; // in Seconds
      readonly attribute AudioParam release; // in Seconds
  */
  var i = void 0,
      param = void 0;
  for (i = compressorParams.length; i >= 0; i--) {
    param = compressorParams[i];
    if (cfg[param] !== undefined) {
      compressor[param].value = cfg[param];
    }
  }
};

data.getAudioContext = function () {
  return _init.context;
};

data.getTime = function () {
  return _init.context.currentTime;
};

exports.default = initAudio;

},{"./init":18,"./samples":31,"./util":37}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createInstrument = createInstrument;

var _create_store = require('./create_store');

var _sample = require('./sample');

var _io = require('./io');

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

},{"./action_types":15,"./create_store":16,"./io":21,"./sample":30}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var context = void 0;

(function () {
  exports.context = context = new window.AudioContext();
  if (typeof context === 'undefined') {
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
})();

exports.context = context;

},{}],22:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16,"./midi_note":23}],23:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],24:[function(require,module,exports){
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

},{}],25:[function(require,module,exports){
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

},{"./midi_stream":24}],26:[function(require,module,exports){
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

},{"./util":37}],27:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = exports.parseMIDIFile = exports.addMIDIEvents = exports.createPart = exports.addParts = exports.createTrack = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = exports.init = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var _midifile = require('./midifile');

var _song_from_midifile = require('./song_from_midifile');

var _init = require('./init');

var qambi = {
  version: '0.0.1',

  // from ./init
  init: _init.init,

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

},{"./init":18,"./midi_event":22,"./midi_note":23,"./midifile":25,"./part":27,"./song":33,"./song_from_midifile":34,"./track":36}],29:[function(require,module,exports){
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

},{"./action_types":15,"redux":12}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.createSample = createSample;

var _io = require('./io.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    if (sampleData === -1) {
      // create simple synth sample
      this.source = _io.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    } else {
      this.source = _io.context.createBufferSource();
      this.source.buffer = sampleData.d;
    }
    this.output = _io.context.createGain();
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

},{"./io.js":21}],31:[function(require,module,exports){
module.exports={
  "emptyOgg": "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
  "emptyMp3": "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
  "hightick": "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
  "lowtick": "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==",
}
},{}],32:[function(require,module,exports){
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

},{}],33:[function(require,module,exports){
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

var _io = require('./io');

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
    var timeStamp = _io.context.currentTime * 1000; // -> convert to millis
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

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./io":21,"./midi_event":22,"./parse_events":26,"./qambi":28,"./scheduler":32}],34:[function(require,module,exports){
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

},{"./instrument":20,"./midi_event":22,"./midifile":25,"./part":27,"./song":33,"./track":36,"isomorphic-fetch":1}],35:[function(require,module,exports){
'use strict';

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_qambi2.default.version);
_qambi2.default.log('functions');
_qambi2.default.init();

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

},{"./qambi":28,"isomorphic-fetch":1}],36:[function(require,module,exports){
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

var _io = require('./io');

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
  var output = _io.context.createGain();
  output.gain.value = volume;
  output.connect(_io.context.destination); //@TODO: route to master compressor first!

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

},{"./action_types":15,"./create_store":16,"./instrument":20,"./io":21}],37:[function(require,module,exports){
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

var _init = require('./init');

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
      _init.context.decodeAudioData(sample, function onSuccess(buffer) {
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
  console.log(_init.context);
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

},{"./init":18,"isomorphic-fetch":1}]},{},[35])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSG9zdE9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pbml0LmpzIiwic3JjL2luaXRfYXVkaW8uanMiLCJzcmMvaW5zdHJ1bWVudC5qcyIsInNyYy9pby5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9taWRpX3N0cmVhbS5qcyIsInNyYy9taWRpZmlsZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NhbXBsZS5qcyIsInNyYy9zYW1wbGVzLmpzb24iLCJzcmMvc2NoZWR1bGVyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwic3JjL3Rlc3Rfd2ViLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzNYTyxJQUFNLHNDQUFlLGNBQWY7QUFDTixJQUFNLGdDQUFZLFdBQVo7QUFDTixJQUFNLDBDQUFpQixnQkFBakI7OztBQUlOLElBQU0sb0NBQWMsYUFBZDtBQUNOLElBQU0sa0NBQWEsWUFBYjtBQUNOLElBQU0sNENBQWtCLGlCQUFsQjtBQUNOLElBQU0sb0NBQWMsYUFBZDtBQUNOLElBQU0sNENBQWtCLGlCQUFsQjs7O0FBSU4sSUFB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c0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyB0aGUgd2hhdHdnLWZldGNoIHBvbHlmaWxsIGluc3RhbGxzIHRoZSBmZXRjaCgpIGZ1bmN0aW9uXG4vLyBvbiB0aGUgZ2xvYmFsIG9iamVjdCAod2luZG93IG9yIHNlbGYpXG4vL1xuLy8gUmV0dXJuIHRoYXQgYXMgdGhlIGV4cG9ydCBmb3IgdXNlIGluIFdlYnBhY2ssIEJyb3dzZXJpZnkgZXRjLlxucmVxdWlyZSgnd2hhdHdnLWZldGNoJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHNlbGYuZmV0Y2guYmluZChzZWxmKTtcbiIsIi8qIEJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzIGZvciB0aG9zZSB3aXRoIHRoZSBzYW1lIG5hbWUgYXMgb3RoZXIgYGxvZGFzaGAgbWV0aG9kcy4gKi9cbnZhciBuYXRpdmVHZXRQcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Y7XG5cbi8qKlxuICogR2V0cyB0aGUgYFtbUHJvdG90eXBlXV1gIG9mIGB2YWx1ZWAuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIHF1ZXJ5LlxuICogQHJldHVybnMge251bGx8T2JqZWN0fSBSZXR1cm5zIHRoZSBgW1tQcm90b3R5cGVdXWAuXG4gKi9cbmZ1bmN0aW9uIGdldFByb3RvdHlwZSh2YWx1ZSkge1xuICByZXR1cm4gbmF0aXZlR2V0UHJvdG90eXBlKE9iamVjdCh2YWx1ZSkpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdldFByb3RvdHlwZTtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCBpbiBJRSA8IDkuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBob3N0IG9iamVjdCwgZWxzZSBgZmFsc2VgLlxuICovXG5mdW5jdGlvbiBpc0hvc3RPYmplY3QodmFsdWUpIHtcbiAgLy8gTWFueSBob3N0IG9iamVjdHMgYXJlIGBPYmplY3RgIG9iamVjdHMgdGhhdCBjYW4gY29lcmNlIHRvIHN0cmluZ3NcbiAgLy8gZGVzcGl0ZSBoYXZpbmcgaW1wcm9wZXJseSBkZWZpbmVkIGB0b1N0cmluZ2AgbWV0aG9kcy5cbiAgdmFyIHJlc3VsdCA9IGZhbHNlO1xuICBpZiAodmFsdWUgIT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUudG9TdHJpbmcgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICByZXN1bHQgPSAhISh2YWx1ZSArICcnKTtcbiAgICB9IGNhdGNoIChlKSB7fVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNIb3N0T2JqZWN0O1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZS4gQSB2YWx1ZSBpcyBvYmplY3QtbGlrZSBpZiBpdCdzIG5vdCBgbnVsbGBcbiAqIGFuZCBoYXMgYSBgdHlwZW9mYCByZXN1bHQgb2YgXCJvYmplY3RcIi5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDQuMC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBvYmplY3QtbGlrZSwgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZSh7fSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoWzEsIDIsIDNdKTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShfLm5vb3ApO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShudWxsKTtcbiAqIC8vID0+IGZhbHNlXG4gKi9cbmZ1bmN0aW9uIGlzT2JqZWN0TGlrZSh2YWx1ZSkge1xuICByZXR1cm4gISF2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNPYmplY3RMaWtlO1xuIiwidmFyIGdldFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vX2dldFByb3RvdHlwZScpLFxuICAgIGlzSG9zdE9iamVjdCA9IHJlcXVpcmUoJy4vX2lzSG9zdE9iamVjdCcpLFxuICAgIGlzT2JqZWN0TGlrZSA9IHJlcXVpcmUoJy4vaXNPYmplY3RMaWtlJyk7XG5cbi8qKiBgT2JqZWN0I3RvU3RyaW5nYCByZXN1bHQgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RUYWcgPSAnW29iamVjdCBPYmplY3RdJztcblxuLyoqIFVzZWQgZm9yIGJ1aWx0LWluIG1ldGhvZCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFByb3RvID0gT2JqZWN0LnByb3RvdHlwZTtcblxuLyoqIFVzZWQgdG8gcmVzb2x2ZSB0aGUgZGVjb21waWxlZCBzb3VyY2Ugb2YgZnVuY3Rpb25zLiAqL1xudmFyIGZ1bmNUb1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqIFVzZWQgdG8gY2hlY2sgb2JqZWN0cyBmb3Igb3duIHByb3BlcnRpZXMuICovXG52YXIgaGFzT3duUHJvcGVydHkgPSBvYmplY3RQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuLyoqIFVzZWQgdG8gaW5mZXIgdGhlIGBPYmplY3RgIGNvbnN0cnVjdG9yLiAqL1xudmFyIG9iamVjdEN0b3JTdHJpbmcgPSBmdW5jVG9TdHJpbmcuY2FsbChPYmplY3QpO1xuXG4vKipcbiAqIFVzZWQgdG8gcmVzb2x2ZSB0aGVcbiAqIFtgdG9TdHJpbmdUYWdgXShodHRwOi8vZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy1vYmplY3QucHJvdG90eXBlLnRvc3RyaW5nKVxuICogb2YgdmFsdWVzLlxuICovXG52YXIgb2JqZWN0VG9TdHJpbmcgPSBvYmplY3RQcm90by50b1N0cmluZztcblxuLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCwgdGhhdCBpcywgYW4gb2JqZWN0IGNyZWF0ZWQgYnkgdGhlXG4gKiBgT2JqZWN0YCBjb25zdHJ1Y3RvciBvciBvbmUgd2l0aCBhIGBbW1Byb3RvdHlwZV1dYCBvZiBgbnVsbGAuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSAwLjguMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsXG4gKiAgZWxzZSBgZmFsc2VgLlxuICogQGV4YW1wbGVcbiAqXG4gKiBmdW5jdGlvbiBGb28oKSB7XG4gKiAgIHRoaXMuYSA9IDE7XG4gKiB9XG4gKlxuICogXy5pc1BsYWluT2JqZWN0KG5ldyBGb28pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoWzEsIDIsIDNdKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KHsgJ3gnOiAwLCAneSc6IDAgfSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KE9iamVjdC5jcmVhdGUobnVsbCkpO1xuICogLy8gPT4gdHJ1ZVxuICovXG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KHZhbHVlKSB7XG4gIGlmICghaXNPYmplY3RMaWtlKHZhbHVlKSB8fFxuICAgICAgb2JqZWN0VG9TdHJpbmcuY2FsbCh2YWx1ZSkgIT0gb2JqZWN0VGFnIHx8IGlzSG9zdE9iamVjdCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgdmFyIHByb3RvID0gZ2V0UHJvdG90eXBlKHZhbHVlKTtcbiAgaWYgKHByb3RvID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgdmFyIEN0b3IgPSBoYXNPd25Qcm9wZXJ0eS5jYWxsKHByb3RvLCAnY29uc3RydWN0b3InKSAmJiBwcm90by5jb25zdHJ1Y3RvcjtcbiAgcmV0dXJuICh0eXBlb2YgQ3RvciA9PSAnZnVuY3Rpb24nICYmXG4gICAgQ3RvciBpbnN0YW5jZW9mIEN0b3IgJiYgZnVuY1RvU3RyaW5nLmNhbGwoQ3RvcikgPT0gb2JqZWN0Q3RvclN0cmluZyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaXNQbGFpbk9iamVjdDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBhcHBseU1pZGRsZXdhcmU7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIENyZWF0ZXMgYSBzdG9yZSBlbmhhbmNlciB0aGF0IGFwcGxpZXMgbWlkZGxld2FyZSB0byB0aGUgZGlzcGF0Y2ggbWV0aG9kXG4gKiBvZiB0aGUgUmVkdXggc3RvcmUuIFRoaXMgaXMgaGFuZHkgZm9yIGEgdmFyaWV0eSBvZiB0YXNrcywgc3VjaCBhcyBleHByZXNzaW5nXG4gKiBhc3luY2hyb25vdXMgYWN0aW9ucyBpbiBhIGNvbmNpc2UgbWFubmVyLCBvciBsb2dnaW5nIGV2ZXJ5IGFjdGlvbiBwYXlsb2FkLlxuICpcbiAqIFNlZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UgYXMgYW4gZXhhbXBsZSBvZiB0aGUgUmVkdXggbWlkZGxld2FyZS5cbiAqXG4gKiBCZWNhdXNlIG1pZGRsZXdhcmUgaXMgcG90ZW50aWFsbHkgYXN5bmNocm9ub3VzLCB0aGlzIHNob3VsZCBiZSB0aGUgZmlyc3RcbiAqIHN0b3JlIGVuaGFuY2VyIGluIHRoZSBjb21wb3NpdGlvbiBjaGFpbi5cbiAqXG4gKiBOb3RlIHRoYXQgZWFjaCBtaWRkbGV3YXJlIHdpbGwgYmUgZ2l2ZW4gdGhlIGBkaXNwYXRjaGAgYW5kIGBnZXRTdGF0ZWAgZnVuY3Rpb25zXG4gKiBhcyBuYW1lZCBhcmd1bWVudHMuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gbWlkZGxld2FyZXMgVGhlIG1pZGRsZXdhcmUgY2hhaW4gdG8gYmUgYXBwbGllZC5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBzdG9yZSBlbmhhbmNlciBhcHBseWluZyB0aGUgbWlkZGxld2FyZS5cbiAqL1xuZnVuY3Rpb24gYXBwbHlNaWRkbGV3YXJlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgbWlkZGxld2FyZXMgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBtaWRkbGV3YXJlc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoY3JlYXRlU3RvcmUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgICAgIHZhciBzdG9yZSA9IGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpO1xuICAgICAgdmFyIF9kaXNwYXRjaCA9IHN0b3JlLmRpc3BhdGNoO1xuICAgICAgdmFyIGNoYWluID0gW107XG5cbiAgICAgIHZhciBtaWRkbGV3YXJlQVBJID0ge1xuICAgICAgICBnZXRTdGF0ZTogc3RvcmUuZ2V0U3RhdGUsXG4gICAgICAgIGRpc3BhdGNoOiBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICAgICAgICByZXR1cm4gX2Rpc3BhdGNoKGFjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGFpbiA9IG1pZGRsZXdhcmVzLm1hcChmdW5jdGlvbiAobWlkZGxld2FyZSkge1xuICAgICAgICByZXR1cm4gbWlkZGxld2FyZShtaWRkbGV3YXJlQVBJKTtcbiAgICAgIH0pO1xuICAgICAgX2Rpc3BhdGNoID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXS5hcHBseSh1bmRlZmluZWQsIGNoYWluKShzdG9yZS5kaXNwYXRjaCk7XG5cbiAgICAgIHJldHVybiBfZXh0ZW5kcyh7fSwgc3RvcmUsIHtcbiAgICAgICAgZGlzcGF0Y2g6IF9kaXNwYXRjaFxuICAgICAgfSk7XG4gICAgfTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGJpbmRBY3Rpb25DcmVhdG9ycztcbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoKGFjdGlvbkNyZWF0b3IuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb24gY3JlYXRvcnMsIGludG8gYW4gb2JqZWN0IHdpdGggdGhlXG4gKiBzYW1lIGtleXMsIGJ1dCB3aXRoIGV2ZXJ5IGZ1bmN0aW9uIHdyYXBwZWQgaW50byBhIGBkaXNwYXRjaGAgY2FsbCBzbyB0aGV5XG4gKiBtYXkgYmUgaW52b2tlZCBkaXJlY3RseS4gVGhpcyBpcyBqdXN0IGEgY29udmVuaWVuY2UgbWV0aG9kLCBhcyB5b3UgY2FuIGNhbGxcbiAqIGBzdG9yZS5kaXNwYXRjaChNeUFjdGlvbkNyZWF0b3JzLmRvU29tZXRoaW5nKCkpYCB5b3Vyc2VsZiBqdXN0IGZpbmUuXG4gKlxuICogRm9yIGNvbnZlbmllbmNlLCB5b3UgY2FuIGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQsXG4gKiBhbmQgZ2V0IGEgZnVuY3Rpb24gaW4gcmV0dXJuLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb258T2JqZWN0fSBhY3Rpb25DcmVhdG9ycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBhY3Rpb25cbiAqIGNyZWF0b3IgZnVuY3Rpb25zLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpbiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhc2BcbiAqIHN5bnRheC4gWW91IG1heSBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZGlzcGF0Y2ggVGhlIGBkaXNwYXRjaGAgZnVuY3Rpb24gYXZhaWxhYmxlIG9uIHlvdXIgUmVkdXhcbiAqIHN0b3JlLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbnxPYmplY3R9IFRoZSBvYmplY3QgbWltaWNraW5nIHRoZSBvcmlnaW5hbCBvYmplY3QsIGJ1dCB3aXRoXG4gKiBldmVyeSBhY3Rpb24gY3JlYXRvciB3cmFwcGVkIGludG8gdGhlIGBkaXNwYXRjaGAgY2FsbC4gSWYgeW91IHBhc3NlZCBhXG4gKiBmdW5jdGlvbiBhcyBgYWN0aW9uQ3JlYXRvcnNgLCB0aGUgcmV0dXJuIHZhbHVlIHdpbGwgYWxzbyBiZSBhIHNpbmdsZVxuICogZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIGJpbmRBY3Rpb25DcmVhdG9ycyhhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9ycywgZGlzcGF0Y2gpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9ycyAhPT0gJ29iamVjdCcgfHwgYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBY3Rpb25DcmVhdG9ycyBleHBlY3RlZCBhbiBvYmplY3Qgb3IgYSBmdW5jdGlvbiwgaW5zdGVhZCByZWNlaXZlZCAnICsgKGFjdGlvbkNyZWF0b3JzID09PSBudWxsID8gJ251bGwnIDogdHlwZW9mIGFjdGlvbkNyZWF0b3JzKSArICcuICcgKyAnRGlkIHlvdSB3cml0ZSBcImltcG9ydCBBY3Rpb25DcmVhdG9ycyBmcm9tXCIgaW5zdGVhZCBvZiBcImltcG9ydCAqIGFzIEFjdGlvbkNyZWF0b3JzIGZyb21cIj8nKTtcbiAgfVxuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWN0aW9uQ3JlYXRvcnMpO1xuICB2YXIgYm91bmRBY3Rpb25DcmVhdG9ycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICB2YXIgYWN0aW9uQ3JlYXRvciA9IGFjdGlvbkNyZWF0b3JzW2tleV07XG4gICAgaWYgKHR5cGVvZiBhY3Rpb25DcmVhdG9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBib3VuZEFjdGlvbkNyZWF0b3JzW2tleV0gPSBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBib3VuZEFjdGlvbkNyZWF0b3JzO1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29tYmluZVJlZHVjZXJzO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbikge1xuICB2YXIgYWN0aW9uVHlwZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZTtcbiAgdmFyIGFjdGlvbk5hbWUgPSBhY3Rpb25UeXBlICYmICdcIicgKyBhY3Rpb25UeXBlLnRvU3RyaW5nKCkgKyAnXCInIHx8ICdhbiBhY3Rpb24nO1xuXG4gIHJldHVybiAnUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGhhbmRsaW5nICcgKyBhY3Rpb25OYW1lICsgJy4gJyArICdUbyBpZ25vcmUgYW4gYWN0aW9uLCB5b3UgbXVzdCBleHBsaWNpdGx5IHJldHVybiB0aGUgcHJldmlvdXMgc3RhdGUuJztcbn1cblxuZnVuY3Rpb24gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShpbnB1dFN0YXRlLCByZWR1Y2VycywgYWN0aW9uKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGFyZ3VtZW50TmFtZSA9IGFjdGlvbiAmJiBhY3Rpb24udHlwZSA9PT0gX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgPyAnaW5pdGlhbFN0YXRlIGFyZ3VtZW50IHBhc3NlZCB0byBjcmVhdGVTdG9yZScgOiAncHJldmlvdXMgc3RhdGUgcmVjZWl2ZWQgYnkgdGhlIHJlZHVjZXInO1xuXG4gIGlmIChyZWR1Y2VyS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gJ1N0b3JlIGRvZXMgbm90IGhhdmUgYSB2YWxpZCByZWR1Y2VyLiBNYWtlIHN1cmUgdGhlIGFyZ3VtZW50IHBhc3NlZCAnICsgJ3RvIGNvbWJpbmVSZWR1Y2VycyBpcyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSByZWR1Y2Vycy4nO1xuICB9XG5cbiAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyW1wiZGVmYXVsdFwiXSkoaW5wdXRTdGF0ZSkpIHtcbiAgICByZXR1cm4gJ1RoZSAnICsgYXJndW1lbnROYW1lICsgJyBoYXMgdW5leHBlY3RlZCB0eXBlIG9mIFwiJyArIHt9LnRvU3RyaW5nLmNhbGwoaW5wdXRTdGF0ZSkubWF0Y2goL1xccyhbYS16fEEtWl0rKS8pWzFdICsgJ1wiLiBFeHBlY3RlZCBhcmd1bWVudCB0byBiZSBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nICcgKyAoJ2tleXM6IFwiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiJyk7XG4gIH1cblxuICB2YXIgdW5leHBlY3RlZEtleXMgPSBPYmplY3Qua2V5cyhpbnB1dFN0YXRlKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuICAgIHJldHVybiAhcmVkdWNlcnMuaGFzT3duUHJvcGVydHkoa2V5KTtcbiAgfSk7XG5cbiAgaWYgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDApIHtcbiAgICByZXR1cm4gJ1VuZXhwZWN0ZWQgJyArICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAxID8gJ2tleXMnIDogJ2tleScpICsgJyAnICsgKCdcIicgKyB1bmV4cGVjdGVkS2V5cy5qb2luKCdcIiwgXCInKSArICdcIiBmb3VuZCBpbiAnICsgYXJndW1lbnROYW1lICsgJy4gJykgKyAnRXhwZWN0ZWQgdG8gZmluZCBvbmUgb2YgdGhlIGtub3duIHJlZHVjZXIga2V5cyBpbnN0ZWFkOiAnICsgKCdcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIi4gVW5leHBlY3RlZCBrZXlzIHdpbGwgYmUgaWdub3JlZC4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRSZWR1Y2VyU2FuaXR5KHJlZHVjZXJzKSB7XG4gIE9iamVjdC5rZXlzKHJlZHVjZXJzKS5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICB2YXIgcmVkdWNlciA9IHJlZHVjZXJzW2tleV07XG4gICAgdmFyIGluaXRpYWxTdGF0ZSA9IHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gICAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBkdXJpbmcgaW5pdGlhbGl6YXRpb24uICcgKyAnSWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGUgcmVkdWNlciBpcyB1bmRlZmluZWQsIHlvdSBtdXN0ICcgKyAnZXhwbGljaXRseSByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSAnICsgJ25vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuXG4gICAgdmFyIHR5cGUgPSAnQEByZWR1eC9QUk9CRV9VTktOT1dOX0FDVElPTl8nICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpLnNwbGl0KCcnKS5qb2luKCcuJyk7XG4gICAgaWYgKHR5cGVvZiByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiB0eXBlIH0pID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgd2hlbiBwcm9iZWQgd2l0aCBhIHJhbmRvbSB0eXBlLiAnICsgKCdEb25cXCd0IHRyeSB0byBoYW5kbGUgJyArIF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUICsgJyBvciBvdGhlciBhY3Rpb25zIGluIFwicmVkdXgvKlwiICcpICsgJ25hbWVzcGFjZS4gVGhleSBhcmUgY29uc2lkZXJlZCBwcml2YXRlLiBJbnN0ZWFkLCB5b3UgbXVzdCByZXR1cm4gdGhlICcgKyAnY3VycmVudCBzdGF0ZSBmb3IgYW55IHVua25vd24gYWN0aW9ucywgdW5sZXNzIGl0IGlzIHVuZGVmaW5lZCwgJyArICdpbiB3aGljaCBjYXNlIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZSwgcmVnYXJkbGVzcyBvZiB0aGUgJyArICdhY3Rpb24gdHlwZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5IG5vdCBiZSB1bmRlZmluZWQuJyk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBUdXJucyBhbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGFyZSBkaWZmZXJlbnQgcmVkdWNlciBmdW5jdGlvbnMsIGludG8gYSBzaW5nbGVcbiAqIHJlZHVjZXIgZnVuY3Rpb24uIEl0IHdpbGwgY2FsbCBldmVyeSBjaGlsZCByZWR1Y2VyLCBhbmQgZ2F0aGVyIHRoZWlyIHJlc3VsdHNcbiAqIGludG8gYSBzaW5nbGUgc3RhdGUgb2JqZWN0LCB3aG9zZSBrZXlzIGNvcnJlc3BvbmQgdG8gdGhlIGtleXMgb2YgdGhlIHBhc3NlZFxuICogcmVkdWNlciBmdW5jdGlvbnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHJlZHVjZXJzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgY29ycmVzcG9uZCB0byBkaWZmZXJlbnRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBjb21iaW5lZCBpbnRvIG9uZS4gT25lIGhhbmR5IHdheSB0byBvYnRhaW5cbiAqIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzIHJlZHVjZXJzYCBzeW50YXguIFRoZSByZWR1Y2VycyBtYXkgbmV2ZXIgcmV0dXJuXG4gKiB1bmRlZmluZWQgZm9yIGFueSBhY3Rpb24uIEluc3RlYWQsIHRoZXkgc2hvdWxkIHJldHVybiB0aGVpciBpbml0aWFsIHN0YXRlXG4gKiBpZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZW0gd2FzIHVuZGVmaW5lZCwgYW5kIHRoZSBjdXJyZW50IHN0YXRlIGZvciBhbnlcbiAqIHVucmVjb2duaXplZCBhY3Rpb24uXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHJlZHVjZXIgZnVuY3Rpb24gdGhhdCBpbnZva2VzIGV2ZXJ5IHJlZHVjZXIgaW5zaWRlIHRoZVxuICogcGFzc2VkIG9iamVjdCwgYW5kIGJ1aWxkcyBhIHN0YXRlIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlLlxuICovXG5mdW5jdGlvbiBjb21iaW5lUmVkdWNlcnMocmVkdWNlcnMpIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgZmluYWxSZWR1Y2VycyA9IHt9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IHJlZHVjZXJLZXlzW2ldO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcnNba2V5XSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgZmluYWxSZWR1Y2Vyc1trZXldID0gcmVkdWNlcnNba2V5XTtcbiAgICB9XG4gIH1cbiAgdmFyIGZpbmFsUmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhmaW5hbFJlZHVjZXJzKTtcblxuICB2YXIgc2FuaXR5RXJyb3I7XG4gIHRyeSB7XG4gICAgYXNzZXJ0UmVkdWNlclNhbml0eShmaW5hbFJlZHVjZXJzKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHNhbml0eUVycm9yID0gZTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBjb21iaW5hdGlvbigpIHtcbiAgICB2YXIgc3RhdGUgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICB2YXIgYWN0aW9uID0gYXJndW1lbnRzWzFdO1xuXG4gICAgaWYgKHNhbml0eUVycm9yKSB7XG4gICAgICB0aHJvdyBzYW5pdHlFcnJvcjtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFyIHdhcm5pbmdNZXNzYWdlID0gZ2V0VW5leHBlY3RlZFN0YXRlU2hhcGVXYXJuaW5nTWVzc2FnZShzdGF0ZSwgZmluYWxSZWR1Y2VycywgYWN0aW9uKTtcbiAgICAgIGlmICh3YXJuaW5nTWVzc2FnZSkge1xuICAgICAgICAoMCwgX3dhcm5pbmcyW1wiZGVmYXVsdFwiXSkod2FybmluZ01lc3NhZ2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBoYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgdmFyIG5leHRTdGF0ZSA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZmluYWxSZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGZpbmFsUmVkdWNlcktleXNbaV07XG4gICAgICB2YXIgcmVkdWNlciA9IGZpbmFsUmVkdWNlcnNba2V5XTtcbiAgICAgIHZhciBwcmV2aW91c1N0YXRlRm9yS2V5ID0gc3RhdGVba2V5XTtcbiAgICAgIHZhciBuZXh0U3RhdGVGb3JLZXkgPSByZWR1Y2VyKHByZXZpb3VzU3RhdGVGb3JLZXksIGFjdGlvbik7XG4gICAgICBpZiAodHlwZW9mIG5leHRTdGF0ZUZvcktleSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZSA9IGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgICBuZXh0U3RhdGVba2V5XSA9IG5leHRTdGF0ZUZvcktleTtcbiAgICAgIGhhc0NoYW5nZWQgPSBoYXNDaGFuZ2VkIHx8IG5leHRTdGF0ZUZvcktleSAhPT0gcHJldmlvdXNTdGF0ZUZvcktleTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc0NoYW5nZWQgPyBuZXh0U3RhdGUgOiBzdGF0ZTtcbiAgfTtcbn0iLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29tcG9zZTtcbi8qKlxuICogQ29tcG9zZXMgc2luZ2xlLWFyZ3VtZW50IGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG4gKlxuICogQHBhcmFtIHsuLi5GdW5jdGlvbn0gZnVuY3MgVGhlIGZ1bmN0aW9ucyB0byBjb21wb3NlLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIG9idGFpbmVkIGJ5IGNvbXBvc2luZyBmdW5jdGlvbnMgZnJvbSByaWdodCB0b1xuICogbGVmdC4gRm9yIGV4YW1wbGUsIGNvbXBvc2UoZiwgZywgaCkgaXMgaWRlbnRpY2FsIHRvIGFyZyA9PiBmKGcoaChhcmcpKSkuXG4gKi9cbmZ1bmN0aW9uIGNvbXBvc2UoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBmdW5jcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIGZ1bmNzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZnVuY3MubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8PSAwID8gdW5kZWZpbmVkIDogYXJndW1lbnRzWzBdO1xuICAgIH1cblxuICAgIHZhciBsYXN0ID0gZnVuY3NbZnVuY3MubGVuZ3RoIC0gMV07XG4gICAgdmFyIHJlc3QgPSBmdW5jcy5zbGljZSgwLCAtMSk7XG5cbiAgICByZXR1cm4gcmVzdC5yZWR1Y2VSaWdodChmdW5jdGlvbiAoY29tcG9zZWQsIGYpIHtcbiAgICAgIHJldHVybiBmKGNvbXBvc2VkKTtcbiAgICB9LCBsYXN0LmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHVuZGVmaW5lZDtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY3JlYXRlU3RvcmU7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogVGhlc2UgYXJlIHByaXZhdGUgYWN0aW9uIHR5cGVzIHJlc2VydmVkIGJ5IFJlZHV4LlxuICogRm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHlvdSBtdXN0IHJldHVybiB0aGUgY3VycmVudCBzdGF0ZS5cbiAqIElmIHRoZSBjdXJyZW50IHN0YXRlIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLlxuICogRG8gbm90IHJlZmVyZW5jZSB0aGVzZSBhY3Rpb24gdHlwZXMgZGlyZWN0bHkgaW4geW91ciBjb2RlLlxuICovXG52YXIgQWN0aW9uVHlwZXMgPSBleHBvcnRzLkFjdGlvblR5cGVzID0ge1xuICBJTklUOiAnQEByZWR1eC9JTklUJ1xufTtcblxuLyoqXG4gKiBDcmVhdGVzIGEgUmVkdXggc3RvcmUgdGhhdCBob2xkcyB0aGUgc3RhdGUgdHJlZS5cbiAqIFRoZSBvbmx5IHdheSB0byBjaGFuZ2UgdGhlIGRhdGEgaW4gdGhlIHN0b3JlIGlzIHRvIGNhbGwgYGRpc3BhdGNoKClgIG9uIGl0LlxuICpcbiAqIFRoZXJlIHNob3VsZCBvbmx5IGJlIGEgc2luZ2xlIHN0b3JlIGluIHlvdXIgYXBwLiBUbyBzcGVjaWZ5IGhvdyBkaWZmZXJlbnRcbiAqIHBhcnRzIG9mIHRoZSBzdGF0ZSB0cmVlIHJlc3BvbmQgdG8gYWN0aW9ucywgeW91IG1heSBjb21iaW5lIHNldmVyYWwgcmVkdWNlcnNcbiAqIGludG8gYSBzaW5nbGUgcmVkdWNlciBmdW5jdGlvbiBieSB1c2luZyBgY29tYmluZVJlZHVjZXJzYC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSByZWR1Y2VyIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBuZXh0IHN0YXRlIHRyZWUsIGdpdmVuXG4gKiB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgYWN0aW9uIHRvIGhhbmRsZS5cbiAqXG4gKiBAcGFyYW0ge2FueX0gW2luaXRpYWxTdGF0ZV0gVGhlIGluaXRpYWwgc3RhdGUuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBoeWRyYXRlIHRoZSBzdGF0ZSBmcm9tIHRoZSBzZXJ2ZXIgaW4gdW5pdmVyc2FsIGFwcHMsIG9yIHRvIHJlc3RvcmUgYVxuICogcHJldmlvdXNseSBzZXJpYWxpemVkIHVzZXIgc2Vzc2lvbi5cbiAqIElmIHlvdSB1c2UgYGNvbWJpbmVSZWR1Y2Vyc2AgdG8gcHJvZHVjZSB0aGUgcm9vdCByZWR1Y2VyIGZ1bmN0aW9uLCB0aGlzIG11c3QgYmVcbiAqIGFuIG9iamVjdCB3aXRoIHRoZSBzYW1lIHNoYXBlIGFzIGBjb21iaW5lUmVkdWNlcnNgIGtleXMuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZW5oYW5jZXIgVGhlIHN0b3JlIGVuaGFuY2VyLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gZW5oYW5jZSB0aGUgc3RvcmUgd2l0aCB0aGlyZC1wYXJ0eSBjYXBhYmlsaXRpZXMgc3VjaCBhcyBtaWRkbGV3YXJlLFxuICogdGltZSB0cmF2ZWwsIHBlcnNpc3RlbmNlLCBldGMuIFRoZSBvbmx5IHN0b3JlIGVuaGFuY2VyIHRoYXQgc2hpcHMgd2l0aCBSZWR1eFxuICogaXMgYGFwcGx5TWlkZGxld2FyZSgpYC5cbiAqXG4gKiBAcmV0dXJucyB7U3RvcmV9IEEgUmVkdXggc3RvcmUgdGhhdCBsZXRzIHlvdSByZWFkIHRoZSBzdGF0ZSwgZGlzcGF0Y2ggYWN0aW9uc1xuICogYW5kIHN1YnNjcmliZSB0byBjaGFuZ2VzLlxuICovXG5mdW5jdGlvbiBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBlbmhhbmNlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBlbmhhbmNlciA9IGluaXRpYWxTdGF0ZTtcbiAgICBpbml0aWFsU3RhdGUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIGVuaGFuY2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuaGFuY2VyKGNyZWF0ZVN0b3JlKShyZWR1Y2VyLCBpbml0aWFsU3RhdGUpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiByZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgcmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRSZWR1Y2VyID0gcmVkdWNlcjtcbiAgdmFyIGN1cnJlbnRTdGF0ZSA9IGluaXRpYWxTdGF0ZTtcbiAgdmFyIGN1cnJlbnRMaXN0ZW5lcnMgPSBbXTtcbiAgdmFyIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzO1xuICB2YXIgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKSB7XG4gICAgaWYgKG5leHRMaXN0ZW5lcnMgPT09IGN1cnJlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIG5leHRMaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzLnNsaWNlKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBzdGF0ZSB0cmVlIG1hbmFnZWQgYnkgdGhlIHN0b3JlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7YW55fSBUaGUgY3VycmVudCBzdGF0ZSB0cmVlIG9mIHlvdXIgYXBwbGljYXRpb24uXG4gICAqL1xuICBmdW5jdGlvbiBnZXRTdGF0ZSgpIHtcbiAgICByZXR1cm4gY3VycmVudFN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgYSBjaGFuZ2UgbGlzdGVuZXIuIEl0IHdpbGwgYmUgY2FsbGVkIGFueSB0aW1lIGFuIGFjdGlvbiBpcyBkaXNwYXRjaGVkLFxuICAgKiBhbmQgc29tZSBwYXJ0IG9mIHRoZSBzdGF0ZSB0cmVlIG1heSBwb3RlbnRpYWxseSBoYXZlIGNoYW5nZWQuIFlvdSBtYXkgdGhlblxuICAgKiBjYWxsIGBnZXRTdGF0ZSgpYCB0byByZWFkIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgaW5zaWRlIHRoZSBjYWxsYmFjay5cbiAgICpcbiAgICogWW91IG1heSBjYWxsIGBkaXNwYXRjaCgpYCBmcm9tIGEgY2hhbmdlIGxpc3RlbmVyLCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAgICogY2F2ZWF0czpcbiAgICpcbiAgICogMS4gVGhlIHN1YnNjcmlwdGlvbnMgYXJlIHNuYXBzaG90dGVkIGp1c3QgYmVmb3JlIGV2ZXJ5IGBkaXNwYXRjaCgpYCBjYWxsLlxuICAgKiBJZiB5b3Ugc3Vic2NyaWJlIG9yIHVuc3Vic2NyaWJlIHdoaWxlIHRoZSBsaXN0ZW5lcnMgYXJlIGJlaW5nIGludm9rZWQsIHRoaXNcbiAgICogd2lsbCBub3QgaGF2ZSBhbnkgZWZmZWN0IG9uIHRoZSBgZGlzcGF0Y2goKWAgdGhhdCBpcyBjdXJyZW50bHkgaW4gcHJvZ3Jlc3MuXG4gICAqIEhvd2V2ZXIsIHRoZSBuZXh0IGBkaXNwYXRjaCgpYCBjYWxsLCB3aGV0aGVyIG5lc3RlZCBvciBub3QsIHdpbGwgdXNlIGEgbW9yZVxuICAgKiByZWNlbnQgc25hcHNob3Qgb2YgdGhlIHN1YnNjcmlwdGlvbiBsaXN0LlxuICAgKlxuICAgKiAyLiBUaGUgbGlzdGVuZXIgc2hvdWxkIG5vdCBleHBlY3QgdG8gc2VlIGFsbCBzdGF0ZXMgY2hhbmdlcywgYXMgdGhlIHN0YXRlXG4gICAqIG1pZ2h0IGhhdmUgYmVlbiB1cGRhdGVkIG11bHRpcGxlIHRpbWVzIGR1cmluZyBhIG5lc3RlZCBgZGlzcGF0Y2goKWAgYmVmb3JlXG4gICAqIHRoZSBsaXN0ZW5lciBpcyBjYWxsZWQuIEl0IGlzLCBob3dldmVyLCBndWFyYW50ZWVkIHRoYXQgYWxsIHN1YnNjcmliZXJzXG4gICAqIHJlZ2lzdGVyZWQgYmVmb3JlIHRoZSBgZGlzcGF0Y2goKWAgc3RhcnRlZCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZSBsYXRlc3RcbiAgICogc3RhdGUgYnkgdGhlIHRpbWUgaXQgZXhpdHMuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEEgY2FsbGJhY2sgdG8gYmUgaW52b2tlZCBvbiBldmVyeSBkaXNwYXRjaC5cbiAgICogQHJldHVybnMge0Z1bmN0aW9ufSBBIGZ1bmN0aW9uIHRvIHJlbW92ZSB0aGlzIGNoYW5nZSBsaXN0ZW5lci5cbiAgICovXG4gIGZ1bmN0aW9uIHN1YnNjcmliZShsaXN0ZW5lcikge1xuICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgbGlzdGVuZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICB2YXIgaXNTdWJzY3JpYmVkID0gdHJ1ZTtcblxuICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICBuZXh0TGlzdGVuZXJzLnB1c2gobGlzdGVuZXIpO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIHVuc3Vic2NyaWJlKCkge1xuICAgICAgaWYgKCFpc1N1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpc1N1YnNjcmliZWQgPSBmYWxzZTtcblxuICAgICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgICAgdmFyIGluZGV4ID0gbmV4dExpc3RlbmVycy5pbmRleE9mKGxpc3RlbmVyKTtcbiAgICAgIG5leHRMaXN0ZW5lcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIERpc3BhdGNoZXMgYW4gYWN0aW9uLiBJdCBpcyB0aGUgb25seSB3YXkgdG8gdHJpZ2dlciBhIHN0YXRlIGNoYW5nZS5cbiAgICpcbiAgICogVGhlIGByZWR1Y2VyYCBmdW5jdGlvbiwgdXNlZCB0byBjcmVhdGUgdGhlIHN0b3JlLCB3aWxsIGJlIGNhbGxlZCB3aXRoIHRoZVxuICAgKiBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBnaXZlbiBgYWN0aW9uYC4gSXRzIHJldHVybiB2YWx1ZSB3aWxsXG4gICAqIGJlIGNvbnNpZGVyZWQgdGhlICoqbmV4dCoqIHN0YXRlIG9mIHRoZSB0cmVlLCBhbmQgdGhlIGNoYW5nZSBsaXN0ZW5lcnNcbiAgICogd2lsbCBiZSBub3RpZmllZC5cbiAgICpcbiAgICogVGhlIGJhc2UgaW1wbGVtZW50YXRpb24gb25seSBzdXBwb3J0cyBwbGFpbiBvYmplY3QgYWN0aW9ucy4gSWYgeW91IHdhbnQgdG9cbiAgICogZGlzcGF0Y2ggYSBQcm9taXNlLCBhbiBPYnNlcnZhYmxlLCBhIHRodW5rLCBvciBzb21ldGhpbmcgZWxzZSwgeW91IG5lZWQgdG9cbiAgICogd3JhcCB5b3VyIHN0b3JlIGNyZWF0aW5nIGZ1bmN0aW9uIGludG8gdGhlIGNvcnJlc3BvbmRpbmcgbWlkZGxld2FyZS4gRm9yXG4gICAqIGV4YW1wbGUsIHNlZSB0aGUgZG9jdW1lbnRhdGlvbiBmb3IgdGhlIGByZWR1eC10aHVua2AgcGFja2FnZS4gRXZlbiB0aGVcbiAgICogbWlkZGxld2FyZSB3aWxsIGV2ZW50dWFsbHkgZGlzcGF0Y2ggcGxhaW4gb2JqZWN0IGFjdGlvbnMgdXNpbmcgdGhpcyBtZXRob2QuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBhY3Rpb24gQSBwbGFpbiBvYmplY3QgcmVwcmVzZW50aW5nIOKAnHdoYXQgY2hhbmdlZOKAnS4gSXQgaXNcbiAgICogYSBnb29kIGlkZWEgdG8ga2VlcCBhY3Rpb25zIHNlcmlhbGl6YWJsZSBzbyB5b3UgY2FuIHJlY29yZCBhbmQgcmVwbGF5IHVzZXJcbiAgICogc2Vzc2lvbnMsIG9yIHVzZSB0aGUgdGltZSB0cmF2ZWxsaW5nIGByZWR1eC1kZXZ0b29sc2AuIEFuIGFjdGlvbiBtdXN0IGhhdmVcbiAgICogYSBgdHlwZWAgcHJvcGVydHkgd2hpY2ggbWF5IG5vdCBiZSBgdW5kZWZpbmVkYC4gSXQgaXMgYSBnb29kIGlkZWEgdG8gdXNlXG4gICAqIHN0cmluZyBjb25zdGFudHMgZm9yIGFjdGlvbiB0eXBlcy5cbiAgICpcbiAgICogQHJldHVybnMge09iamVjdH0gRm9yIGNvbnZlbmllbmNlLCB0aGUgc2FtZSBhY3Rpb24gb2JqZWN0IHlvdSBkaXNwYXRjaGVkLlxuICAgKlxuICAgKiBOb3RlIHRoYXQsIGlmIHlvdSB1c2UgYSBjdXN0b20gbWlkZGxld2FyZSwgaXQgbWF5IHdyYXAgYGRpc3BhdGNoKClgIHRvXG4gICAqIHJldHVybiBzb21ldGhpbmcgZWxzZSAoZm9yIGV4YW1wbGUsIGEgUHJvbWlzZSB5b3UgY2FuIGF3YWl0KS5cbiAgICovXG4gIGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGFjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtdXN0IGJlIHBsYWluIG9iamVjdHMuICcgKyAnVXNlIGN1c3RvbSBtaWRkbGV3YXJlIGZvciBhc3luYyBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYWN0aW9uLnR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbWF5IG5vdCBoYXZlIGFuIHVuZGVmaW5lZCBcInR5cGVcIiBwcm9wZXJ0eS4gJyArICdIYXZlIHlvdSBtaXNzcGVsbGVkIGEgY29uc3RhbnQ/Jyk7XG4gICAgfVxuXG4gICAgaWYgKGlzRGlzcGF0Y2hpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlcnMgbWF5IG5vdCBkaXNwYXRjaCBhY3Rpb25zLicpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gdHJ1ZTtcbiAgICAgIGN1cnJlbnRTdGF0ZSA9IGN1cnJlbnRSZWR1Y2VyKGN1cnJlbnRTdGF0ZSwgYWN0aW9uKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBsaXN0ZW5lcnMgPSBjdXJyZW50TGlzdGVuZXJzID0gbmV4dExpc3RlbmVycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGlzdGVuZXJzW2ldKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFjdGlvbjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXBsYWNlcyB0aGUgcmVkdWNlciBjdXJyZW50bHkgdXNlZCBieSB0aGUgc3RvcmUgdG8gY2FsY3VsYXRlIHRoZSBzdGF0ZS5cbiAgICpcbiAgICogWW91IG1pZ2h0IG5lZWQgdGhpcyBpZiB5b3VyIGFwcCBpbXBsZW1lbnRzIGNvZGUgc3BsaXR0aW5nIGFuZCB5b3Ugd2FudCB0b1xuICAgKiBsb2FkIHNvbWUgb2YgdGhlIHJlZHVjZXJzIGR5bmFtaWNhbGx5LiBZb3UgbWlnaHQgYWxzbyBuZWVkIHRoaXMgaWYgeW91XG4gICAqIGltcGxlbWVudCBhIGhvdCByZWxvYWRpbmcgbWVjaGFuaXNtIGZvciBSZWR1eC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbmV4dFJlZHVjZXIgVGhlIHJlZHVjZXIgZm9yIHRoZSBzdG9yZSB0byB1c2UgaW5zdGVhZC5cbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiByZXBsYWNlUmVkdWNlcihuZXh0UmVkdWNlcikge1xuICAgIGlmICh0eXBlb2YgbmV4dFJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIG5leHRSZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgY3VycmVudFJlZHVjZXIgPSBuZXh0UmVkdWNlcjtcbiAgICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG4gIH1cblxuICAvLyBXaGVuIGEgc3RvcmUgaXMgY3JlYXRlZCwgYW4gXCJJTklUXCIgYWN0aW9uIGlzIGRpc3BhdGNoZWQgc28gdGhhdCBldmVyeVxuICAvLyByZWR1Y2VyIHJldHVybnMgdGhlaXIgaW5pdGlhbCBzdGF0ZS4gVGhpcyBlZmZlY3RpdmVseSBwb3B1bGF0ZXNcbiAgLy8gdGhlIGluaXRpYWwgc3RhdGUgdHJlZS5cbiAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuXG4gIHJldHVybiB7XG4gICAgZGlzcGF0Y2g6IGRpc3BhdGNoLFxuICAgIHN1YnNjcmliZTogc3Vic2NyaWJlLFxuICAgIGdldFN0YXRlOiBnZXRTdGF0ZSxcbiAgICByZXBsYWNlUmVkdWNlcjogcmVwbGFjZVJlZHVjZXJcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmNvbXBvc2UgPSBleHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IGV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBleHBvcnRzLmNyZWF0ZVN0b3JlID0gdW5kZWZpbmVkO1xuXG52YXIgX2NyZWF0ZVN0b3JlID0gcmVxdWlyZSgnLi9jcmVhdGVTdG9yZScpO1xuXG52YXIgX2NyZWF0ZVN0b3JlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZVN0b3JlKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMgPSByZXF1aXJlKCcuL2NvbWJpbmVSZWR1Y2VycycpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VyczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21iaW5lUmVkdWNlcnMpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9ycyA9IHJlcXVpcmUoJy4vYmluZEFjdGlvbkNyZWF0b3JzJyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2JpbmRBY3Rpb25DcmVhdG9ycyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlID0gcmVxdWlyZSgnLi9hcHBseU1pZGRsZXdhcmUnKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYXBwbHlNaWRkbGV3YXJlKTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qXG4qIFRoaXMgaXMgYSBkdW1teSBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgZnVuY3Rpb24gbmFtZSBoYXMgYmVlbiBhbHRlcmVkIGJ5IG1pbmlmaWNhdGlvbi5cbiogSWYgdGhlIGZ1bmN0aW9uIGhhcyBiZWVuIG1pbmlmaWVkIGFuZCBOT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nLCB3YXJuIHRoZSB1c2VyLlxuKi9cbmZ1bmN0aW9uIGlzQ3J1c2hlZCgpIHt9XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nICYmIHR5cGVvZiBpc0NydXNoZWQubmFtZSA9PT0gJ3N0cmluZycgJiYgaXNDcnVzaGVkLm5hbWUgIT09ICdpc0NydXNoZWQnKSB7XG4gICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSgnWW91IGFyZSBjdXJyZW50bHkgdXNpbmcgbWluaWZpZWQgY29kZSBvdXRzaWRlIG9mIE5PREVfRU5WID09PSBcXCdwcm9kdWN0aW9uXFwnLiAnICsgJ1RoaXMgbWVhbnMgdGhhdCB5b3UgYXJlIHJ1bm5pbmcgYSBzbG93ZXIgZGV2ZWxvcG1lbnQgYnVpbGQgb2YgUmVkdXguICcgKyAnWW91IGNhbiB1c2UgbG9vc2UtZW52aWZ5IChodHRwczovL2dpdGh1Yi5jb20vemVydG9zaC9sb29zZS1lbnZpZnkpIGZvciBicm93c2VyaWZ5ICcgKyAnb3IgRGVmaW5lUGx1Z2luIGZvciB3ZWJwYWNrIChodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzMwMDMwMDMxKSAnICsgJ3RvIGVuc3VyZSB5b3UgaGF2ZSB0aGUgY29ycmVjdCBjb2RlIGZvciB5b3VyIHByb2R1Y3Rpb24gYnVpbGQuJyk7XG59XG5cbmV4cG9ydHMuY3JlYXRlU3RvcmUgPSBfY3JlYXRlU3RvcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gX2NvbWJpbmVSZWR1Y2VyczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBfYmluZEFjdGlvbkNyZWF0b3JzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmFwcGx5TWlkZGxld2FyZSA9IF9hcHBseU1pZGRsZXdhcmUyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuY29tcG9zZSA9IF9jb21wb3NlMltcImRlZmF1bHRcIl07IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSB3YXJuaW5nO1xuLyoqXG4gKiBQcmludHMgYSB3YXJuaW5nIGluIHRoZSBjb25zb2xlIGlmIGl0IGV4aXN0cy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVzc2FnZSBUaGUgd2FybmluZyBtZXNzYWdlLlxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIHdhcm5pbmcobWVzc2FnZSkge1xuICAvKiBlc2xpbnQtZGlzYWJsZSBuby1jb25zb2xlICovXG4gIGlmICh0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuICB9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tY29uc29sZSAqL1xuICB0cnkge1xuICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgeW91IGNhbiB1c2UgdGhpcyBzdGFja1xuICAgIC8vIHRvIGZpbmQgdGhlIGNhbGxzaXRlIHRoYXQgY2F1c2VkIHRoaXMgd2FybmluZyB0byBmaXJlLlxuICAgIHRocm93IG5ldyBFcnJvcihtZXNzYWdlKTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBuby1lbXB0eSAqL1xuICB9IGNhdGNoIChlKSB7fVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWVtcHR5ICovXG59IiwiKGZ1bmN0aW9uKHNlbGYpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIGlmIChzZWxmLmZldGNoKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVOYW1lKG5hbWUpIHtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpXG4gICAgfVxuICAgIGlmICgvW15hLXowLTlcXC0jJCUmJyorLlxcXl9gfH5dL2kudGVzdChuYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBjaGFyYWN0ZXIgaW4gaGVhZGVyIGZpZWxkIG5hbWUnKVxuICAgIH1cbiAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpXG4gIH1cblxuICBmdW5jdGlvbiBub3JtYWxpemVWYWx1ZSh2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICB2YWx1ZSA9IFN0cmluZyh2YWx1ZSlcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICBmdW5jdGlvbiBIZWFkZXJzKGhlYWRlcnMpIHtcbiAgICB0aGlzLm1hcCA9IHt9XG5cbiAgICBpZiAoaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMpIHtcbiAgICAgIGhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCB2YWx1ZSlcbiAgICAgIH0sIHRoaXMpXG5cbiAgICB9IGVsc2UgaWYgKGhlYWRlcnMpIHtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGhlYWRlcnMpLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLmFwcGVuZChuYW1lLCBoZWFkZXJzW25hbWVdKVxuICAgICAgfSwgdGhpcylcbiAgICB9XG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIG5hbWUgPSBub3JtYWxpemVOYW1lKG5hbWUpXG4gICAgdmFsdWUgPSBub3JtYWxpemVWYWx1ZSh2YWx1ZSlcbiAgICB2YXIgbGlzdCA9IHRoaXMubWFwW25hbWVdXG4gICAgaWYgKCFsaXN0KSB7XG4gICAgICBsaXN0ID0gW11cbiAgICAgIHRoaXMubWFwW25hbWVdID0gbGlzdFxuICAgIH1cbiAgICBsaXN0LnB1c2godmFsdWUpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZVsnZGVsZXRlJ10gPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgZGVsZXRlIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIHZhbHVlcyA9IHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldXG4gICAgcmV0dXJuIHZhbHVlcyA/IHZhbHVlc1swXSA6IG51bGxcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gfHwgW11cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5tYXAuaGFzT3duUHJvcGVydHkobm9ybWFsaXplTmFtZShuYW1lKSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV0gPSBbbm9ybWFsaXplVmFsdWUodmFsdWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZm9yRWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrLCB0aGlzQXJnKSB7XG4gICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5tYXApLmZvckVhY2goZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5tYXBbbmFtZV0uZm9yRWFjaChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBjYWxsYmFjay5jYWxsKHRoaXNBcmcsIHZhbHVlLCBuYW1lLCB0aGlzKVxuICAgICAgfSwgdGhpcylcbiAgICB9LCB0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gY29uc3VtZWQoYm9keSkge1xuICAgIGlmIChib2R5LmJvZHlVc2VkKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJykpXG4gICAgfVxuICAgIGJvZHkuYm9keVVzZWQgPSB0cnVlXG4gIH1cblxuICBmdW5jdGlvbiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXNvbHZlKHJlYWRlci5yZXN1bHQpXG4gICAgICB9XG4gICAgICByZWFkZXIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QocmVhZGVyLmVycm9yKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzQXJyYXlCdWZmZXIoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICBmdW5jdGlvbiByZWFkQmxvYkFzVGV4dChibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzVGV4dChibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgdmFyIHN1cHBvcnQgPSB7XG4gICAgYmxvYjogJ0ZpbGVSZWFkZXInIGluIHNlbGYgJiYgJ0Jsb2InIGluIHNlbGYgJiYgKGZ1bmN0aW9uKCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEJsb2IoKTtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KSgpLFxuICAgIGZvcm1EYXRhOiAnRm9ybURhdGEnIGluIHNlbGYsXG4gICAgYXJyYXlCdWZmZXI6ICdBcnJheUJ1ZmZlcicgaW4gc2VsZlxuICB9XG5cbiAgZnVuY3Rpb24gQm9keSgpIHtcbiAgICB0aGlzLmJvZHlVc2VkID0gZmFsc2VcblxuXG4gICAgdGhpcy5faW5pdEJvZHkgPSBmdW5jdGlvbihib2R5KSB7XG4gICAgICB0aGlzLl9ib2R5SW5pdCA9IGJvZHlcbiAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYmxvYiAmJiBCbG9iLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlCbG9iID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmZvcm1EYXRhICYmIEZvcm1EYXRhLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIHRoaXMuX2JvZHlGb3JtRGF0YSA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoIWJvZHkpIHtcbiAgICAgICAgdGhpcy5fYm9keVRleHQgPSAnJ1xuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmFycmF5QnVmZmVyICYmIEFycmF5QnVmZmVyLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGJvZHkpKSB7XG4gICAgICAgIC8vIE9ubHkgc3VwcG9ydCBBcnJheUJ1ZmZlcnMgZm9yIFBPU1QgbWV0aG9kLlxuICAgICAgICAvLyBSZWNlaXZpbmcgQXJyYXlCdWZmZXJzIGhhcHBlbnMgdmlhIEJsb2JzLCBpbnN0ZWFkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBCb2R5SW5pdCB0eXBlJylcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKSkge1xuICAgICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgJ3RleHQvcGxhaW47Y2hhcnNldD1VVEYtOCcpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUJsb2IgJiYgdGhpcy5fYm9keUJsb2IudHlwZSkge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsIHRoaXMuX2JvZHlCbG9iLnR5cGUpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5ibG9iKSB7XG4gICAgICB0aGlzLmJsb2IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyBibG9iJylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG5ldyBCbG9iKFt0aGlzLl9ib2R5VGV4dF0pKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXJyYXlCdWZmZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvYigpLnRoZW4ocmVhZEJsb2JBc0FycmF5QnVmZmVyKVxuICAgICAgfVxuXG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgaWYgKHJlamVjdGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHJlamVjdGVkXG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5fYm9keUJsb2IpIHtcbiAgICAgICAgICByZXR1cm4gcmVhZEJsb2JBc1RleHQodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIHRleHQnKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIHJldHVybiByZWplY3RlZCA/IHJlamVjdGVkIDogUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmZvcm1EYXRhKSB7XG4gICAgICB0aGlzLmZvcm1EYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKGRlY29kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmpzb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnRleHQoKS50aGVuKEpTT04ucGFyc2UpXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8vIEhUVFAgbWV0aG9kcyB3aG9zZSBjYXBpdGFsaXphdGlvbiBzaG91bGQgYmUgbm9ybWFsaXplZFxuICB2YXIgbWV0aG9kcyA9IFsnREVMRVRFJywgJ0dFVCcsICdIRUFEJywgJ09QVElPTlMnLCAnUE9TVCcsICdQVVQnXVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU1ldGhvZChtZXRob2QpIHtcbiAgICB2YXIgdXBjYXNlZCA9IG1ldGhvZC50b1VwcGVyQ2FzZSgpXG4gICAgcmV0dXJuIChtZXRob2RzLmluZGV4T2YodXBjYXNlZCkgPiAtMSkgPyB1cGNhc2VkIDogbWV0aG9kXG4gIH1cblxuICBmdW5jdGlvbiBSZXF1ZXN0KGlucHV0LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cbiAgICB2YXIgYm9keSA9IG9wdGlvbnMuYm9keVxuICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSkge1xuICAgICAgaWYgKGlucHV0LmJvZHlVc2VkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpXG4gICAgICB9XG4gICAgICB0aGlzLnVybCA9IGlucHV0LnVybFxuICAgICAgdGhpcy5jcmVkZW50aWFscyA9IGlucHV0LmNyZWRlbnRpYWxzXG4gICAgICBpZiAoIW9wdGlvbnMuaGVhZGVycykge1xuICAgICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhpbnB1dC5oZWFkZXJzKVxuICAgICAgfVxuICAgICAgdGhpcy5tZXRob2QgPSBpbnB1dC5tZXRob2RcbiAgICAgIHRoaXMubW9kZSA9IGlucHV0Lm1vZGVcbiAgICAgIGlmICghYm9keSkge1xuICAgICAgICBib2R5ID0gaW5wdXQuX2JvZHlJbml0XG4gICAgICAgIGlucHV0LmJvZHlVc2VkID0gdHJ1ZVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVybCA9IGlucHV0XG4gICAgfVxuXG4gICAgdGhpcy5jcmVkZW50aWFscyA9IG9wdGlvbnMuY3JlZGVudGlhbHMgfHwgdGhpcy5jcmVkZW50aWFscyB8fCAnb21pdCdcbiAgICBpZiAob3B0aW9ucy5oZWFkZXJzIHx8ICF0aGlzLmhlYWRlcnMpIHtcbiAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB9XG4gICAgdGhpcy5tZXRob2QgPSBub3JtYWxpemVNZXRob2Qob3B0aW9ucy5tZXRob2QgfHwgdGhpcy5tZXRob2QgfHwgJ0dFVCcpXG4gICAgdGhpcy5tb2RlID0gb3B0aW9ucy5tb2RlIHx8IHRoaXMubW9kZSB8fCBudWxsXG4gICAgdGhpcy5yZWZlcnJlciA9IG51bGxcblxuICAgIGlmICgodGhpcy5tZXRob2QgPT09ICdHRVQnIHx8IHRoaXMubWV0aG9kID09PSAnSEVBRCcpICYmIGJvZHkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JvZHkgbm90IGFsbG93ZWQgZm9yIEdFVCBvciBIRUFEIHJlcXVlc3RzJylcbiAgICB9XG4gICAgdGhpcy5faW5pdEJvZHkoYm9keSlcbiAgfVxuXG4gIFJlcXVlc3QucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBkZWNvZGUoYm9keSkge1xuICAgIHZhciBmb3JtID0gbmV3IEZvcm1EYXRhKClcbiAgICBib2R5LnRyaW0oKS5zcGxpdCgnJicpLmZvckVhY2goZnVuY3Rpb24oYnl0ZXMpIHtcbiAgICAgIGlmIChieXRlcykge1xuICAgICAgICB2YXIgc3BsaXQgPSBieXRlcy5zcGxpdCgnPScpXG4gICAgICAgIHZhciBuYW1lID0gc3BsaXQuc2hpZnQoKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc9JykucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgZm9ybS5hcHBlbmQoZGVjb2RlVVJJQ29tcG9uZW50KG5hbWUpLCBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpKVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGZvcm1cbiAgfVxuXG4gIGZ1bmN0aW9uIGhlYWRlcnMoeGhyKSB7XG4gICAgdmFyIGhlYWQgPSBuZXcgSGVhZGVycygpXG4gICAgdmFyIHBhaXJzID0geGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpLnRyaW0oKS5zcGxpdCgnXFxuJylcbiAgICBwYWlycy5mb3JFYWNoKGZ1bmN0aW9uKGhlYWRlcikge1xuICAgICAgdmFyIHNwbGl0ID0gaGVhZGVyLnRyaW0oKS5zcGxpdCgnOicpXG4gICAgICB2YXIga2V5ID0gc3BsaXQuc2hpZnQoKS50cmltKClcbiAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJzonKS50cmltKClcbiAgICAgIGhlYWQuYXBwZW5kKGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gaGVhZFxuICB9XG5cbiAgQm9keS5jYWxsKFJlcXVlc3QucHJvdG90eXBlKVxuXG4gIGZ1bmN0aW9uIFJlc3BvbnNlKGJvZHlJbml0LCBvcHRpb25zKSB7XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0ge31cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSAnZGVmYXVsdCdcbiAgICB0aGlzLnN0YXR1cyA9IG9wdGlvbnMuc3RhdHVzXG4gICAgdGhpcy5vayA9IHRoaXMuc3RhdHVzID49IDIwMCAmJiB0aGlzLnN0YXR1cyA8IDMwMFxuICAgIHRoaXMuc3RhdHVzVGV4dCA9IG9wdGlvbnMuc3RhdHVzVGV4dFxuICAgIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVycyBpbnN0YW5jZW9mIEhlYWRlcnMgPyBvcHRpb25zLmhlYWRlcnMgOiBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgdGhpcy51cmwgPSBvcHRpb25zLnVybCB8fCAnJ1xuICAgIHRoaXMuX2luaXRCb2R5KGJvZHlJbml0KVxuICB9XG5cbiAgQm9keS5jYWxsKFJlc3BvbnNlLnByb3RvdHlwZSlcblxuICBSZXNwb25zZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKHRoaXMuX2JvZHlJbml0LCB7XG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogdGhpcy5zdGF0dXNUZXh0LFxuICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnModGhpcy5oZWFkZXJzKSxcbiAgICAgIHVybDogdGhpcy51cmxcbiAgICB9KVxuICB9XG5cbiAgUmVzcG9uc2UuZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzcG9uc2UgPSBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogMCwgc3RhdHVzVGV4dDogJyd9KVxuICAgIHJlc3BvbnNlLnR5cGUgPSAnZXJyb3InXG4gICAgcmV0dXJuIHJlc3BvbnNlXG4gIH1cblxuICB2YXIgcmVkaXJlY3RTdGF0dXNlcyA9IFszMDEsIDMwMiwgMzAzLCAzMDcsIDMwOF1cblxuICBSZXNwb25zZS5yZWRpcmVjdCA9IGZ1bmN0aW9uKHVybCwgc3RhdHVzKSB7XG4gICAgaWYgKHJlZGlyZWN0U3RhdHVzZXMuaW5kZXhPZihzdGF0dXMpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgc3RhdHVzIGNvZGUnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUmVzcG9uc2UobnVsbCwge3N0YXR1czogc3RhdHVzLCBoZWFkZXJzOiB7bG9jYXRpb246IHVybH19KVxuICB9XG5cbiAgc2VsZi5IZWFkZXJzID0gSGVhZGVycztcbiAgc2VsZi5SZXF1ZXN0ID0gUmVxdWVzdDtcbiAgc2VsZi5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4gIHNlbGYuZmV0Y2ggPSBmdW5jdGlvbihpbnB1dCwgaW5pdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciByZXF1ZXN0XG4gICAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkgJiYgIWluaXQpIHtcbiAgICAgICAgcmVxdWVzdCA9IGlucHV0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0ID0gbmV3IFJlcXVlc3QoaW5wdXQsIGluaXQpXG4gICAgICB9XG5cbiAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKVxuXG4gICAgICBmdW5jdGlvbiByZXNwb25zZVVSTCgpIHtcbiAgICAgICAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVVSTFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQXZvaWQgc2VjdXJpdHkgd2FybmluZ3Mgb24gZ2V0UmVzcG9uc2VIZWFkZXIgd2hlbiBub3QgYWxsb3dlZCBieSBDT1JTXG4gICAgICAgIGlmICgvXlgtUmVxdWVzdC1VUkw6L20udGVzdCh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpKSB7XG4gICAgICAgICAgcmV0dXJuIHhoci5nZXRSZXNwb25zZUhlYWRlcignWC1SZXF1ZXN0LVVSTCcpXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHN0YXR1cyA9ICh4aHIuc3RhdHVzID09PSAxMjIzKSA/IDIwNCA6IHhoci5zdGF0dXNcbiAgICAgICAgaWYgKHN0YXR1cyA8IDEwMCB8fCBzdGF0dXMgPiA1OTkpIHtcbiAgICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0LFxuICAgICAgICAgIGhlYWRlcnM6IGhlYWRlcnMoeGhyKSxcbiAgICAgICAgICB1cmw6IHJlc3BvbnNlVVJMKClcbiAgICAgICAgfVxuICAgICAgICB2YXIgYm9keSA9ICdyZXNwb25zZScgaW4geGhyID8geGhyLnJlc3BvbnNlIDogeGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgcmVzb2x2ZShuZXcgUmVzcG9uc2UoYm9keSwgb3B0aW9ucykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICB9XG5cbiAgICAgIHhoci5vcGVuKHJlcXVlc3QubWV0aG9kLCByZXF1ZXN0LnVybCwgdHJ1ZSlcblxuICAgICAgaWYgKHJlcXVlc3QuY3JlZGVudGlhbHMgPT09ICdpbmNsdWRlJykge1xuICAgICAgICB4aHIud2l0aENyZWRlbnRpYWxzID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoJ3Jlc3BvbnNlVHlwZScgaW4geGhyICYmIHN1cHBvcnQuYmxvYikge1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2Jsb2InXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QuaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKVxuICAgICAgfSlcblxuICAgICAgeGhyLnNlbmQodHlwZW9mIHJlcXVlc3QuX2JvZHlJbml0ID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiByZXF1ZXN0Ll9ib2R5SW5pdClcbiAgICB9KVxuICB9XG4gIHNlbGYuZmV0Y2gucG9seWZpbGwgPSB0cnVlXG59KSh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmIDogdGhpcyk7XG4iLCIvLyBleHBvcnQgY29uc3QgQUREX01JRElfTk9URVMgPSAnYWRkX21pZGlfbm90ZXMnXG4vLyBleHBvcnQgY29uc3QgQ1JFQVRFX01JRElfTk9URSA9ICdjcmVhdGVfbWlkaV9ub3RlJ1xuLy8gZXhwb3J0IGNvbnN0IEFERF9FVkVOVFNfVE9fU09ORyA9ICdhZGRfZXZlbnRzX3RvX3NvbmcnXG4vLyBleHBvcnQgY29uc3QgQUREX01JRElfRVZFTlRTX1RPX1NPTkcgPSAnYWRkX21pZGlfZXZlbnRzX3RvX3NvbmcnXG4vLyBleHBvcnQgY29uc3QgQUREX1RSQUNLID0gJ2FkZF90cmFjaydcbi8vIGV4cG9ydCBjb25zdCBBRERfUEFSVCA9ICdhZGRfcGFydCdcbi8vIGV4cG9ydCBjb25zdCBVUERBVEVfTUlESV9OT1RFID0gJ3VwZGF0ZV9taWRpX25vdGUnXG5cblxuLy8gdHJhY2sgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9UUkFDSyA9ICdjcmVhdGVfdHJhY2snXG5leHBvcnQgY29uc3QgQUREX1BBUlRTID0gJ2FkZF9wYXJ0cydcbmV4cG9ydCBjb25zdCBTRVRfSU5TVFJVTUVOVCA9ICdzZXRfaW5zdHJ1bWVudCdcblxuXG4vLyBzb25nIGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfU09ORyA9ICdjcmVhdGVfc29uZydcbmV4cG9ydCBjb25zdCBBRERfVFJBQ0tTID0gJ2FkZF90cmFja3MnXG5leHBvcnQgY29uc3QgQUREX1RJTUVfRVZFTlRTID0gJ2FkZF90aW1lX2V2ZW50cydcbmV4cG9ydCBjb25zdCBVUERBVEVfU09ORyA9ICd1cGRhdGVfc29uZydcbmV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFMgPSAnYWRkX21pZGlfZXZlbnRzJ1xuXG5cbi8vIHBhcnQgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9QQVJUID0gJ2NyZWF0ZV9wYXJ0J1xuXG5cbi8vIG1pZGlldmVudCBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfRVZFTlQgPSAnY3JlYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfRVZFTlQgPSAndXBkYXRlX21pZGlfZXZlbnQnXG5cblxuLy8gc2VxdWVuY2VyIGFjdGlvbnNcbmV4cG9ydCBjb25zdCBTT05HX1BPU0lUSU9OID0gJ3NvbmdfcG9zaXRpb24nXG5leHBvcnQgY29uc3QgUExBWV9TT05HID0gJ3BsYXlfc29uZydcbmV4cG9ydCBjb25zdCBQQVVTRV9TT05HID0gJ3BhdXNlX3NvbmcnXG5leHBvcnQgY29uc3QgU1RPUF9TT05HID0gJ3N0b3Bfc29uZydcbmV4cG9ydCBjb25zdCBTVEFSVF9TQ0hFRFVMRVIgPSAnU1RBUlRfU0NIRURVTEVSJ1xuZXhwb3J0IGNvbnN0IFNUT1BfU0NIRURVTEVSID0gJ1NUT1BfU0NIRURVTEVSJ1xuXG5cbi8vIGluc3RydW1lbnQgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9JTlNUUlVNRU5UID0gJ2NyZWF0ZV9pbnN0cnVtZW50J1xuXG5cblxuXG5cblxuXG5cblxuXG4iLCJpbXBvcnQge2NyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUsIGNvbXBvc2V9IGZyb20gJ3JlZHV4J1xuLy9pbXBvcnQgdGh1bmsgZnJvbSAncmVkdXgtdGh1bmsnO1xuLy9pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJ3JlZHV4LWxvZ2dlcic7XG5pbXBvcnQgc2VxdWVuY2VyQXBwIGZyb20gJy4vcmVkdWNlcidcblxuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZShzZXF1ZW5jZXJBcHApO1xuXG4vKlxuLy8gZG9uJ3QgdXNlIHRoZSByZWR1eCBkZXYgdG9vbCBiZWNhdXNlIGl0IHVzZSB0b28gbXVjaCBDUFUgYW5kIG1lbW9yeSFcbmNvbnN0IGxvZ2dlciA9IGNyZWF0ZUxvZ2dlcigpO1xuY29uc3Qgc3RvcmUgPSBjcmVhdGVTdG9yZShzZXF1ZW5jZXJBcHAsIHt9LCBjb21wb3NlKFxuICBhcHBseU1pZGRsZXdhcmUobG9nZ2VyKSxcbiAgdHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHdpbmRvdy5kZXZUb29sc0V4dGVuc2lvbiAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24oKSA6IGYgPT4gZlxuKSk7XG4qL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3RvcmUoKXtcbiAgcmV0dXJuIHN0b3JlXG59XG5cblxuIiwiXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW8uanMnO1xuXG5sZXQgdGltZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCByZXBldGl0aXZlVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgc2NoZWR1bGVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgdGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgbGFzdFRpbWVTdGFtcDtcblxuZnVuY3Rpb24gaGVhcnRiZWF0KHRpbWVzdGFtcCl7XG4gIGxldCBub3cgPSBjb250ZXh0LnRpbWU7XG5cbiAgLy8gZm9yIGluc3RhbmNlOiB0aGUgY2FsbGJhY2sgb2Ygc2FtcGxlLnVuc2NoZWR1bGU7XG4gIGZvcihsZXQgW2tleSwgdGFza10gb2YgdGltZWRUYXNrcyl7XG4gICAgaWYodGFzay50aW1lID49IG5vdyl7XG4gICAgICB0YXNrLmV4ZWN1dGUobm93KTtcbiAgICAgIHRpbWVkVGFza3MuZGVsZXRlKGtleSk7XG4gICAgfVxuICB9XG5cblxuICAvLyBmb3IgaW5zdGFuY2U6IHNvbmcudXBkYXRlKCk7XG4gIGZvcihsZXQgdGFzayBvZiBzY2hlZHVsZWRUYXNrcy52YWx1ZXMoKSl7XG4gICAgdGFzayhub3cpO1xuICB9XG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnB1bHNlKCk7XG4gIGZvcihsZXQgdGFzayBvZiByZXBldGl0aXZlVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIGxhc3RUaW1lU3RhbXAgPSB0aW1lc3RhbXA7XG4gIHNjaGVkdWxlZFRhc2tzLmNsZWFyKCk7XG5cbiAgLy9zZXRUaW1lb3V0KGhlYXJ0YmVhdCwgMTAwMDApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhlYXJ0YmVhdCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRhc2sodHlwZSwgaWQsIHRhc2spe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuc2V0KGlkLCB0YXNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVRhc2sodHlwZSwgaWQpe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuZGVsZXRlKGlkKTtcbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCl7XG4gIHRhc2tzLnNldCgndGltZWQnLCB0aW1lZFRhc2tzKTtcbiAgdGFza3Muc2V0KCdyZXBldGl0aXZlJywgcmVwZXRpdGl2ZVRhc2tzKTtcbiAgdGFza3Muc2V0KCdzY2hlZHVsZWQnLCBzY2hlZHVsZWRUYXNrcyk7XG4gIGhlYXJ0YmVhdCgpO1xufSgpKVxuIiwiaW1wb3J0IHtpbml0QXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbyc7XG5cbmV4cG9ydCBjb25zdCBjb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdCgpe1xuICBpbml0QXVkaW8oKS50aGVuKChlKSA9PiB7XG4gICAgY29uc29sZS5sb2coZSlcbiAgfSlcbn1cblxuIiwiLypcbiAgU2V0cyB1cCB0aGUgYmFzaWMgYXVkaW8gcm91dGluZywgdGVzdHMgd2hpY2ggYXVkaW8gZm9ybWF0cyBhcmUgc3VwcG9ydGVkIGFuZCBwYXJzZXMgdGhlIHNhbXBsZXMgZm9yIHRoZSBtZXRyb25vbWUgdGlja3MuXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0JztcbmltcG9ydCB7cGFyc2VTYW1wbGVzfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHNhbXBsZXMgZnJvbSAnLi9zYW1wbGVzJztcblxuXG5sZXRcbiAgZGF0YSA9IHt9LFxuICAvLyBjb250ZXh0LFxuXG4gIHNvdXJjZSxcbiAgZ2Fpbk5vZGUsXG4gIGNvbXByZXNzb3I7XG5cbmNvbnN0XG4gIGNvbXByZXNzb3JQYXJhbXMgPSBbJ3RocmVzaG9sZCcsICdrbmVlJywgJ3JhdGlvJywgJ3JlZHVjdGlvbicsICdhdHRhY2snLCAncmVsZWFzZSddXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBdWRpbygpe1xuXG4gIC8vY29udGV4dCA9IGN0eFxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIC8vY29uc29sZS5sb2coY29udGV4dClcbiAgICBpZihjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlID09PSB1bmRlZmluZWQpe1xuICAgICAgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpbjtcbiAgICB9XG4gICAgLy8gY2hlY2sgZm9yIG9sZGVyIGltcGxlbWVudGF0aW9ucyBvZiBXZWJBdWRpb1xuICAgIHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgZGF0YS5sZWdhY3kgPSBmYWxzZTtcbiAgICBpZihzb3VyY2Uuc3RhcnQgPT09IHVuZGVmaW5lZCl7XG4gICAgICBkYXRhLmxlZ2FjeSA9IHRydWU7XG4gICAgfVxuXG4gICAgLy8gc2V0IHVwIHRoZSBlbGVtZW50YXJ5IGF1ZGlvIG5vZGVzXG4gICAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKCk7XG4gICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIGdhaW5Ob2RlID0gY29udGV4dC5jcmVhdGVHYWluTm9kZSgpO1xuICAgIGdhaW5Ob2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IDAuNTtcblxuICAgIGRhdGEubWFzdGVyR2Fpbk5vZGUgPSBnYWluTm9kZTtcbiAgICBkYXRhLm1hc3RlckNvbXByZXNzb3IgPSBjb21wcmVzc29yO1xuXG4gICAgcGFyc2VTYW1wbGVzKHtcbiAgICAgICdvZ2cnOiBzYW1wbGVzLmVtcHR5T2dnLFxuICAgICAgJ21wMyc6IHNhbXBsZXMuZW1wdHlNcDMsXG4gICAgICAnbG93dGljayc6IHNhbXBsZXMubG93dGljayxcbiAgICAgICdoaWdodGljayc6IHNhbXBsZXMuaGlnaHRpY2tcbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIGRhdGEub2dnID0gYnVmZmVycy5vZ2cgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgZGF0YS5tcDMgPSBidWZmZXJzLm1wMyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2s7XG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrO1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xuXG59XG5cblxuZGF0YS5zZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbih2YWx1ZSA9IDAuNSl7XG4gIGlmKHZhbHVlID4gMSl7XG4gICAgaW5mbygnbWF4aW1hbCB2b2x1bWUgaXMgMS4wLCB2b2x1bWUgaXMgc2V0IHRvIDEuMCcpO1xuICB9XG4gIHZhbHVlID0gdmFsdWUgPCAwID8gMCA6IHZhbHVlID4gMSA/IDEgOiB2YWx1ZTtcbiAgZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSA9IHZhbHVlO1xufTtcblxuXG5kYXRhLmdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBnYWluTm9kZS5nYWluLnZhbHVlO1xufTtcblxuXG5kYXRhLmdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKXtcbiAgLy9jb25zb2xlLmxvZyhjb21wcmVzc29yKTtcbiAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlO1xufTtcblxuXG5kYXRhLmVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnKXtcbiAgaWYoZmxhZyl7XG4gICAgZ2Fpbk5vZGUuZGlzY29ubmVjdCgwKTtcbiAgICBnYWluTm9kZS5jb25uZWN0KGNvbXByZXNzb3IpO1xuICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIH1lbHNle1xuICAgIGNvbXByZXNzb3IuZGlzY29ubmVjdCgwKTtcbiAgICBnYWluTm9kZS5kaXNjb25uZWN0KDApO1xuICAgIGdhaW5Ob2RlLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gIH1cbn07XG5cblxuZGF0YS5jb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnKXtcbiAgLypcbiAgICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcbiAgICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJlbGVhc2U7IC8vIGluIFNlY29uZHNcbiAgKi9cbiAgbGV0IGksIHBhcmFtO1xuICBmb3IoaSA9IGNvbXByZXNzb3JQYXJhbXMubGVuZ3RoOyBpID49IDA7IGktLSl7XG4gICAgICBwYXJhbSA9IGNvbXByZXNzb3JQYXJhbXNbaV07XG4gICAgICBpZihjZmdbcGFyYW1dICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIGNvbXByZXNzb3JbcGFyYW1dLnZhbHVlID0gY2ZnW3BhcmFtXTtcbiAgICAgIH1cbiAgfVxufTtcblxuXG5kYXRhLmdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0O1xufTtcblxuXG5kYXRhLmdldFRpbWUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dC5jdXJyZW50VGltZTtcbn07XG5cblxuZXhwb3J0IGRlZmF1bHQgaW5pdEF1ZGlvO1xuXG5cbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtjcmVhdGVTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX0lOU1RSVU1FTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBpbnN0cnVtZW50SW5kZXggPSAwXG5cbmNsYXNzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgdHlwZTogc3RyaW5nKXtcbiAgICB0aGlzLmlkID0gaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5zY2hlZHVsZWQgPSB7fVxuICAgIHRoaXMuc3VzdGFpbmVkID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICB9XG5cbiAgcHJvY2Vzc01JRElFdmVudChldmVudCwgdGltZSwgb3V0cHV0KXtcbiAgICBsZXQgc2FtcGxlXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IGNyZWF0ZVNhbXBsZSgtMSwgZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFtldmVudC5taWRpTm90ZUlkXSA9IHNhbXBsZVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KG91dHB1dClcbiAgICAgIHNhbXBsZS5zdGFydCh0aW1lKVxuICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFtldmVudC5taWRpTm90ZUlkXVxuICAgICAgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjb25zb2xlLmVycm9yKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3VzdGFpblBlZGFsRG93biA9PT0gdHJ1ZSl7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgdGhpcy5zdXN0YWluZWQucHVzaChldmVudC5taWRpTm90ZUlkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgZXZlbnQubWlkaU5vdGVJZClcbiAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHRoaXMudHJhY2suc29uZywgJ3N1c3RhaW5fcGVkYWwnLCAnZG93bicpO1xuICAgICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZC5mb3JFYWNoKChtaWRpTm90ZUlkKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlZFttaWRpTm90ZUlkXS5zdG9wKGV2ZW50LnRpbWUsICgpID0+IHtcbiAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIG1pZGlOb3RlSWQpXG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFttaWRpTm90ZUlkXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZClcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZCA9IFtdXG4gICAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHRoaXMudHJhY2suc29uZywgJ3N1c3RhaW5fcGVkYWwnLCAndXAnKTtcbiAgICAgICAgICAvL3RoaXMuc3RvcFN1c3RhaW4odGltZSk7XG4gICAgICAgIH1cblxuICAgICAgLy8gcGFubmluZ1xuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDEwKXtcbiAgICAgICAgLy8gcGFubmluZyBpcyAqbm90KiBleGFjdGx5IHRpbWVkIC0+IG5vdCBwb3NzaWJsZSAoeWV0KSB3aXRoIFdlYkF1ZGlvXG4gICAgICAgIC8vY29uc29sZS5sb2coZGF0YTIsIHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG4gICAgICAgIC8vdHJhY2suc2V0UGFubmluZyhyZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuXG4gICAgICAvLyB2b2x1bWVcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSA3KXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzdG9wQWxsU291bmRzKCl7XG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWQpLmZvckVhY2goKHNhbXBsZUlkKSA9PiB7XG4gICAgICB0aGlzLnNjaGVkdWxlZFtzYW1wbGVJZF0uc3RvcCgwLCAoKSA9PiB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFtzYW1wbGVJZF1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5zdHJ1bWVudCh0eXBlOiBzdHJpbmcpe1xuICBsZXQgaWQgPSBgSU5fJHtpbnN0cnVtZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnQoaWQsIHR5cGUpXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfSU5TVFJVTUVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIGluc3RydW1lbnRcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbiIsIlxubGV0IGNvbnRleHRcblxuKGZ1bmN0aW9uKCl7XG4gIGNvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpXG4gIGlmKHR5cGVvZiBjb250ZXh0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgY29udGV4dCA9IHtcbiAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2FpbjogMVxuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY3JlYXRlT3NjaWxsYXRvcjogZnVuY3Rpb24oKXt9LFxuICAgIH1cbiAgfVxuICByZXR1cm4gY29udGV4dFxufSgpKVxuXG5leHBvcnQge2NvbnRleHR9XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnQge1xuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCh0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSk6IHN0cmluZ3tcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgdHlwZSxcbiAgICAgIGZyZXF1ZW5jeTogNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpLFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNSURJRXZlbnRJZCgpOiBzdHJpbmd7XG4gIHJldHVybiBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnQoaWQ6IHN0cmluZywgdGlja3NfdG9fbW92ZTogbnVtYmVyKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgbGV0IHRpY2tzID0gZXZlbnQudGlja3MgKyB0aWNrc190b19tb3ZlXG4gIHRpY2tzID0gdGlja3MgPCAwID8gMCA6IHRpY2tzXG4gIC8vY29uc29sZS5sb2codGlja3MsIGV2ZW50LnRpY2tzKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudFRvKGlkOiBzdHJpbmcsIHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCJcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgQ1JFQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNSURJTm90ZShpZCwgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpKXtcbiAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbaWRdXG4gIGxldCBldmVudHMgPSBzdGF0ZS5taWRpRXZlbnRzXG4gIGxldCBzdGFydCA9IGV2ZW50c1tub3RlLm5vdGVvbl1cbiAgbGV0IGVuZCA9IGV2ZW50c1tub3RlLm5vdGVvZmZdXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBzdGFydDogc3RhcnQudGlja3MsXG4gICAgICBlbmQ6IGVuZC50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IGVuZC50aWNrcyAtIHN0YXJ0LnRpY2tzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESU5vdGUobm90ZW9uOiBzdHJpbmcsIG5vdGVvZmY6IHN0cmluZyl7XG4gIGxldCBldmVudHMgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvci5taWRpRXZlbnRzXG4gIGxldCBvbiA9IGV2ZW50c1tub3Rlb25dXG4gIGxldCBvZmYgPSBldmVudHNbbm90ZW9mZl1cbiAgaWYob24uZGF0YTEgIT09IG9mZi5kYXRhMSl7XG4gICAgY29uc29sZS5lcnJvcignY2FuXFwndCBjcmVhdGUgTUlESSBub3RlOiBldmVudHMgbXVzdCBoYXZlIHRoZSBzYW1lIGRhdGExIHZhbHVlLCBpLmUuIHRoZSBzYW1lIHBpdGNoJylcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX01JRElfTk9URSxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5vdGVvbixcbiAgICAgIG5vdGVvZmYsXG4gICAgICBzdGFydDogb24udGlja3MsXG4gICAgICBlbmQ6IG9mZi50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IG9mZi50aWNrcyAtIG9uLnRpY2tzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcyxcbiAgcHJldmlvdXNFdmVudDtcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cyl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4vKlxuICAgIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG5cbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuXG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4qL1xuICB9KTtcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpe1xuICBsZXQgbm90ZXMgPSB7fVxuICBsZXQgbm90ZXNJblRyYWNrXG4gIGxldCBuID0gMFxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50LnBhcnRJZCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50LnRyYWNrSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC50cmFja0lkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9NSURJX0VWRU5UUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoXG4gIHNldHRpbmdzOiB7XG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRyYWNrSWQ6IHN0cmluZyxcbiAgICBtaWRpRXZlbnRJZHM6QXJyYXk8c3RyaW5nPixcbiAgICBtaWRpTm90ZUlkczpBcnJheTxzdHJpbmc+LFxuICB9ID0ge31cbil7XG4gIGxldCBpZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgbWlkaUV2ZW50SWRzID0gW10sXG4gICAgbWlkaU5vdGVJZHMgPSBbXSxcbiAgICB0cmFja0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfUEFSVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBtaWRpRXZlbnRJZHMsXG4gICAgICBtaWRpTm90ZUlkcyxcbiAgICAgIHRyYWNrSWQsXG4gICAgICBtdXRlOiBmYWxzZVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzKHBhcnRfaWQ6IHN0cmluZywgLi4ubWlkaV9ldmVudF9pZHMpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHBhcnRfaWQsXG4gICAgICBtaWRpX2V2ZW50X2lkc1xuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgY3JlYXRlTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0e1xuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxufSBmcm9tICcuL3BhcnQnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgc29uZ0Zyb21NSURJRmlsZVxufSBmcm9tICcuL3NvbmdfZnJvbV9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdFxufSBmcm9tICcuL2luaXQnXG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uOiAnMC4wLjEnLFxuXG4gIC8vIGZyb20gLi9pbml0XG4gIGluaXQsXG5cbiAgLy8gZnJvbSAuL21pZGlfZXZlbnRcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG5cbiAgLy8gZnJvbSAuL21pZGlfbm90ZVxuICBjcmVhdGVNSURJTm90ZSxcblxuICAvLyBmcm9tIC4vc29uZ1xuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIHVwZGF0ZVNvbmcsXG4gIHN0YXJ0U29uZyxcbiAgc3RvcFNvbmcsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcblxuICAvLyBmcm9tIC4vcGFydFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuXG4gIHBhcnNlTUlESUZpbGUsXG4gIHNvbmdGcm9tTUlESUZpbGUsXG5cbiAgbG9nOiBmdW5jdGlvbihpZCl7XG4gICAgaWYoaWQgPT09ICdmdW5jdGlvbnMnKXtcbiAgICAgIGNvbnNvbGUubG9nKGBmdW5jdGlvbnM6XG4gICAgICAgIGNyZWF0ZU1JRElFdmVudFxuICAgICAgICBtb3ZlTUlESUV2ZW50XG4gICAgICAgIG1vdmVNSURJRXZlbnRUb1xuICAgICAgICBjcmVhdGVNSURJTm90ZVxuICAgICAgICBjcmVhdGVTb25nXG4gICAgICAgIGFkZFRyYWNrc1xuICAgICAgICBjcmVhdGVUcmFja1xuICAgICAgICBhZGRQYXJ0c1xuICAgICAgICBjcmVhdGVQYXJ0XG4gICAgICAgIGFkZE1JRElFdmVudHNcbiAgICAgIGApXG4gICAgfVxuICB9XG59XG5cbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG4vL2NvbnN0IE1JREkgPSB7fVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTk9URV9PRkYnLCB7dmFsdWU6IDB4ODB9KTsgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ05PVEVfT04nLCB7dmFsdWU6IDB4OTB9KTsgLy8xNDRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BPTFlfUFJFU1NVUkUnLCB7dmFsdWU6IDB4QTB9KTsgLy8xNjBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0NPTlRST0xfQ0hBTkdFJywge3ZhbHVlOiAweEIwfSk7IC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQUk9HUkFNX0NIQU5HRScsIHt2YWx1ZTogMHhDMH0pOyAvLzE5MlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ0hBTk5FTF9QUkVTU1VSRScsIHt2YWx1ZTogMHhEMH0pOyAvLzIwOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUElUQ0hfQkVORCcsIHt2YWx1ZTogMHhFMH0pOyAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1lTVEVNX0VYQ0xVU0lWRScsIHt2YWx1ZTogMHhGMH0pOyAvLzI0MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTUlESV9USU1FQ09ERScsIHt2YWx1ZTogMjQxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTT05HX1BPU0lUSU9OJywge3ZhbHVlOiAyNDJ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NPTkdfU0VMRUNUJywge3ZhbHVlOiAyNDN9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RVTkVfUkVRVUVTVCcsIHt2YWx1ZTogMjQ2fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdFT1gnLCB7dmFsdWU6IDI0N30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVElNSU5HX0NMT0NLJywge3ZhbHVlOiAyNDh9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NUQVJUJywge3ZhbHVlOiAyNTB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0NPTlRJTlVFJywge3ZhbHVlOiAyNTF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NUT1AnLCB7dmFsdWU6IDI1Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQUNUSVZFX1NFTlNJTkcnLCB7dmFsdWU6IDI1NH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1lTVEVNX1JFU0VUJywge3ZhbHVlOiAyNTV9KTtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdURU1QTycsIHt2YWx1ZTogMHg1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVElNRV9TSUdOQVRVUkUnLCB7dmFsdWU6IDB4NTh9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0VORF9PRl9UUkFDSycsIHt2YWx1ZTogMHgyRn0pO1xuXG5leHBvcnQgZGVmYXVsdCBxYW1iaVxuXG5leHBvcnQge1xuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgY3JlYXRlTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBjcmVhdGVUcmFjayxcbiAgYWRkUGFydHMsXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcblxuLy8gIE1JREksXG5cbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcbn1cbiIsImltcG9ydCB7Y29tYmluZVJlZHVjZXJzfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7XG4gIC8vIGZvciBlZGl0b3JcbiAgQ1JFQVRFX1NPTkcsXG4gIENSRUFURV9UUkFDSyxcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9QQVJUUyxcbiAgQUREX1RSQUNLUyxcbiAgQUREX01JRElfTk9URVMsXG4gIEFERF9NSURJX0VWRU5UUyxcbiAgQUREX1RJTUVfRVZFTlRTLFxuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgQ1JFQVRFX01JRElfTk9URSxcbiAgQUREX0VWRU5UU19UT19TT05HLFxuICBVUERBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgVVBEQVRFX1NPTkcsXG4gIFNFVF9JTlNUUlVNRU5ULFxuXG4gIC8vIGZvciBzZXF1ZW5jZXIgb25seVxuICBTT05HX1BPU0lUSU9OLFxuICBTVEFSVF9TQ0hFRFVMRVIsXG4gIFNUT1BfU0NIRURVTEVSLFxuXG4gIC8vIGZvciBpbnN0cnVtZW50IG9ubHlcbiAgQ1JFQVRFX0lOU1RSVU1FTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBpbml0aWFsU3RhdGUgPSB7XG4gIHNvbmdzOiB7fSxcbiAgdHJhY2tzOiB7fSxcbiAgcGFydHM6IHt9LFxuICBtaWRpRXZlbnRzOiB7fSxcbiAgbWlkaU5vdGVzOiB7fSxcbn1cblxuXG5mdW5jdGlvbiBlZGl0b3Ioc3RhdGUgPSBpbml0aWFsU3RhdGUsIGFjdGlvbil7XG5cbiAgbGV0XG4gICAgZXZlbnQsIGV2ZW50SWQsXG4gICAgc29uZywgc29uZ0lkLFxuICAgIG1pZGlFdmVudHNcblxuICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuXG4gICAgY2FzZSBDUkVBVEVfU09ORzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX1RSQUNLOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS50cmFja3NbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX1BBUlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnBhcnRzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9NSURJX0VWRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5taWRpRXZlbnRzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLm1pZGlOb3Rlc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfVFJBQ0tTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzb25nSWQgPSBhY3Rpb24ucGF5bG9hZC5zb25nX2lkXG4gICAgICBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ0lkXVxuICAgICAgaWYoc29uZyl7XG4gICAgICAgIGxldCB0cmFja0lkcyA9IGFjdGlvbi5wYXlsb2FkLnRyYWNrX2lkc1xuICAgICAgICB0cmFja0lkcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWNrSWQpe1xuICAgICAgICAgIGxldCB0cmFjayA9IHN0YXRlLnRyYWNrc1t0cmFja0lkXVxuICAgICAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgICAgIHNvbmcudHJhY2tJZHMucHVzaCh0cmFja0lkKVxuICAgICAgICAgICAgdHJhY2suc29uZ0lkID0gc29uZ0lkXG4gICAgICAgICAgICBsZXQgbWlkaUV2ZW50SWRzID0gW11cbiAgICAgICAgICAgIHRyYWNrLnBhcnRJZHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0SWQpe1xuICAgICAgICAgICAgICBsZXQgcGFydCA9IHN0YXRlLnBhcnRzW3BhcnRJZF1cbiAgICAgICAgICAgICAgc29uZy5wYXJ0SWRzLnB1c2gocGFydElkKVxuICAgICAgICAgICAgICBtaWRpRXZlbnRJZHMucHVzaCguLi5wYXJ0Lm1pZGlFdmVudElkcylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBzb25nLm1pZGlFdmVudElkcy5wdXNoKC4uLm1pZGlFdmVudElkcylcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nSWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1BBUlRTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgdHJhY2tJZCA9IGFjdGlvbi5wYXlsb2FkLnRyYWNrX2lkXG4gICAgICBsZXQgdHJhY2sgPSBzdGF0ZS50cmFja3NbdHJhY2tJZF1cbiAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgLy90cmFjay5wYXJ0cy5wdXNoKC4uLmFjdGlvbi5wYXlsb2FkLnBhcnRfaWRzKVxuICAgICAgICBsZXQgcGFydElkcyA9IGFjdGlvbi5wYXlsb2FkLnBhcnRfaWRzXG4gICAgICAgIHBhcnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCl7XG4gICAgICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1tpZF1cbiAgICAgICAgICBpZihwYXJ0KXtcbiAgICAgICAgICAgIHRyYWNrLnBhcnRJZHMucHVzaChpZClcbiAgICAgICAgICAgIHBhcnQudHJhY2tJZCA9IHRyYWNrSWRcbiAgICAgICAgICAgIHBhcnQubWlkaUV2ZW50SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgICBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbaWRdXG4gICAgICAgICAgICAgIGV2ZW50LnRyYWNrSWQgPSB0cmFja0lkXG4gICAgICAgICAgICAgIGV2ZW50Lmluc3RydW1lbnRJZCA9IHRyYWNrLmluc3RydW1lbnRJZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCB3aXRoIGlkICR7aWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyB0cmFjayBmb3VuZCB3aXRoIGlkICR7dHJhY2tJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfTUlESV9FVkVOVFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBwYXJ0SWQgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkXG4gICAgICBsZXQgcGFydCA9IHN0YXRlLnBhcnRzW3BhcnRJZF1cbiAgICAgIGlmKHBhcnQpe1xuICAgICAgICAvL3BhcnQubWlkaUV2ZW50cy5wdXNoKC4uLmFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzKVxuICAgICAgICBsZXQgbWlkaUV2ZW50SWRzID0gYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudF9pZHNcbiAgICAgICAgbWlkaUV2ZW50SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBtaWRpRXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICAgICAgICAgIGlmKG1pZGlFdmVudCl7XG4gICAgICAgICAgICBwYXJ0Lm1pZGlFdmVudElkcy5wdXNoKGlkKVxuICAgICAgICAgICAgbWlkaUV2ZW50LnBhcnRJZCA9IHBhcnRJZFxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyBNSURJIGV2ZW50IGZvdW5kIHdpdGggaWQgJHtpZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHBhcnQgZm91bmQgd2l0aCBpZCAke3BhcnRJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBVUERBVEVfTUlESV9FVkVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgZXZlbnRJZCA9IGFjdGlvbi5wYXlsb2FkLmlkXG4gICAgICBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbZXZlbnRJZF07XG4gICAgICBpZihldmVudCl7XG4gICAgICAgICh7XG4gICAgICAgICAgdGlja3M6IGV2ZW50LnRpY2tzID0gZXZlbnQudGlja3MsXG4gICAgICAgICAgZGF0YTE6IGV2ZW50LmRhdGExID0gZXZlbnQuZGF0YTEsXG4gICAgICAgICAgZGF0YTI6IGV2ZW50LmRhdGEyID0gZXZlbnQuZGF0YTIsXG4gICAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIE1JREkgZXZlbnQgZm91bmQgd2l0aCBpZCAke2V2ZW50SWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX01JRElfTk9URTpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbYWN0aW9uLnBheWxvYWQuaWRdO1xuICAgICAgKHtcbiAgICAgICAgLy8gaWYgdGhlIHBheWxvYWQgaGFzIGEgdmFsdWUgZm9yICdzdGFydCcgaXQgd2lsbCBiZSBhc3NpZ25lZCB0byBub3RlLnN0YXJ0LCBvdGhlcndpc2Ugbm90ZS5zdGFydCB3aWxsIGtlZXAgaXRzIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgc3RhcnQ6IG5vdGUuc3RhcnQgPSBub3RlLnN0YXJ0LFxuICAgICAgICBlbmQ6IG5vdGUuZW5kID0gbm90ZS5lbmQsXG4gICAgICAgIGR1cmF0aW9uVGlja3M6IG5vdGUuZHVyYXRpb25UaWNrcyA9IG5vdGUuZHVyYXRpb25UaWNrc1xuICAgICAgfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBVUERBVEVfU09ORzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfTtcbiAgICAgICh7c29uZ19pZDogc29uZ0lkLCBtaWRpX2V2ZW50czogbWlkaUV2ZW50c30gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIHNvbmcgPSBzdGF0ZS5zb25nc1tzb25nSWRdXG4gICAgICBzb25nLm1pZGlFdmVudElkcyA9IFtdXG4gICAgICBtaWRpRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAvLyBwdXQgbWlkaSBldmVudCBpZHMgaW4gY29ycmVjdCBvcmRlclxuICAgICAgICBzb25nLm1pZGlFdmVudElkcy5wdXNoKGV2ZW50LmlkKVxuICAgICAgICAvLyByZXBsYWNlIGV2ZW50IHdpdGggdXBkYXRlZCBldmVudFxuICAgICAgICBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50LmlkXSA9IGV2ZW50O1xuICAgICAgfSlcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgU0VUX0lOU1RSVU1FTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX07XG4gICAgICBzdGF0ZS50cmFja3NbYWN0aW9uLnBheWxvYWQudHJhY2tJZF0uaW5zdHJ1bWVudElkID0gYWN0aW9uLnBheWxvYWQuaW5zdHJ1bWVudElkXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxuICByZXR1cm4gc3RhdGVcbn1cblxuLy8gc3RhdGUgd2hlbiBhIHNvbmcgaXMgcGxheWluZ1xuZnVuY3Rpb24gc2VxdWVuY2VyKHN0YXRlID0ge3NvbmdzOiB7fX0sIGFjdGlvbil7XG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG5cbiAgICBjYXNlIFVQREFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXSA9IHtcbiAgICAgICAgc29uZ0lkOiBhY3Rpb24ucGF5bG9hZC5zb25nX2lkLFxuICAgICAgICBtaWRpRXZlbnRzOiBhY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50cyxcbiAgICAgICAgc2V0dGluZ3M6IGFjdGlvbi5wYXlsb2FkLnNldHRpbmdzLFxuICAgICAgICBwbGF5aW5nOiBmYWxzZSxcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgU1RBUlRfU0NIRURVTEVSOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXS5zY2hlZHVsZXIgPSBhY3Rpb24ucGF5bG9hZC5zY2hlZHVsZXJcbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnBsYXlpbmcgPSB0cnVlXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNUT1BfU0NIRURVTEVSOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBkZWxldGUgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0uc2NoZWR1bGVyXG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXS5wbGF5aW5nID0gZmFsc2VcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgU09OR19QT1NJVElPTjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0ucG9zaXRpb24gPSBhY3Rpb24ucGF5bG9hZC5wb3NpdGlvblxuICAgICAgYnJlYWtcblxuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gZ3VpKHN0YXRlID0ge30sIGFjdGlvbil7XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5mdW5jdGlvbiBpbnN0cnVtZW50cyhzdGF0ZSA9IHt9LCBhY3Rpb24pe1xuICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuICAgIGNhc2UgQ1JFQVRFX0lOU1RSVU1FTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkLmluc3RydW1lbnRcbiAgICAgIC8vc3RhdGUgPSB7Li4uc3RhdGUsIC4uLntbYWN0aW9uLnBheWxvYWQuaWRdOiBhY3Rpb24ucGF5bG9hZC5pbnN0cnVtZW50fX1cbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5jb25zdCBzZXF1ZW5jZXJBcHAgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBndWksXG4gIGVkaXRvcixcbiAgc2VxdWVuY2VyLFxuICBpbnN0cnVtZW50cyxcbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyQXBwXG4iLCJcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pby5qcyc7XG5cbmNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgLy8gY3JlYXRlIHNpbXBsZSBzeW50aCBzYW1wbGVcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCk7XG4gICAgICB0aGlzLnNvdXJjZS50eXBlID0gJ3NpbmUnO1xuICAgICAgdGhpcy5zb3VyY2UuZnJlcXVlbmN5LnZhbHVlID0gZXZlbnQuZnJlcXVlbmN5XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgICAgIHRoaXMuc291cmNlLmJ1ZmZlciA9IHNhbXBsZURhdGEuZDtcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMub3V0cHV0LmdhaW4udmFsdWUgPSBldmVudC5kYXRhMiAvIDEyN1xuICAgIHRoaXMuc291cmNlLmNvbm5lY3QodGhpcy5vdXRwdXQpXG4gICAgLy90aGlzLm91dHB1dC5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIH1cblxuICBzdGFydCh0aW1lKXtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlKTtcbiAgICB0aGlzLnNvdXJjZS5zdGFydCh0aW1lKTtcbiAgfVxuXG4gIHN0b3AodGltZSwgY2Ipe1xuICAgIHRoaXMuc291cmNlLnN0b3AodGltZSk7XG4gICAgdGhpcy5zb3VyY2Uub25lbmRlZCA9IGNiO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNhbXBsZSguLi5hcmdzKXtcbiAgcmV0dXJuIG5ldyBTYW1wbGUoLi4uYXJncyk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiZW1wdHlPZ2dcIjogXCJUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89XCIsXG4gIFwiZW1wdHlNcDNcIjogXCIvL3NReEFBRHdBQUJwQUFBQUNBQUFEU0FBQUFFVEVGTlJUTXVPVGt1TlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZVPVwiLFxuICBcImhpZ2h0aWNrXCI6IFwiVWtsR1JrUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlTQUZBQUN4L3hmL2RBRE9BQ3dCc1AzcCs2SCt6QUdvQk9rQ0N3QlgvRUg1T3Z4bEE0a0oyd2NTQXJUOUUvdXQrSFQyZXZVeDk4bjZPQUY1Q0NVTXdRdmZDT3NKeEF4MERTSU1FQXE5QmlBQjN2aHo3bUxrVDlzUjEzM1l4TjJzNVFMdjB2clVCbndSbnh1UUplRXNTRENpTWQ4eUZTOGFLRklob2hVc0NLajY0dTYyNU9yYUE5SHV5UG5FbGNQK3d4dkpXdFcyNTYzN1ZRMGpIUGduQlRERE0xbzBDektMSys4aHpoZ0ZET3o4U2U0SjQ3RFlWdEcwejVmUXE5TEIxMnJmQStqOTlyb0hBaGVsSXlNd0lqZFRPdVU4bWp3SU9Hb3hoQ2I1RTUzL2orM2szL2ZUWThwVHc0eS9UcitldzhETXZkc2s4UmNIUlJrU0tPNHlHVGtIUGtVL3J6enlOY2dzclI5NERwLzVyK1pzMTd6T25jb0R4aGZFMzhXTHluL1RlT01pOXIwSVJ4bFJLSVF6eVRsT1BLbzl5am1XTWNva0RSTGMvWTdydWR0ZHp1L0QyTDFJdSsyN0pjRzN5WXJWTHVqbCszVU9aeDFVSzVRMHF6bU5QRGs4WmplZU1Qb2p6aEgrL2pMdFBkNW0waEhMSHNZSXc1VEVNTW5BMGp2ajhmU09CaXdYQVNaZ016TThkVUJHUWJJK3J6anBLa0laeWdaVDlRZmxjZGFSeXFYQ3o3K1Z3VVBINzg0cjNLN3MrdjBLRHU4YnZ5ZUxNYjQzTmpyaE9JbzBkU3ZRSGkwUG5QNmk3b3ZnM05UeHk0L0dmOFg4eUgvUUJ0dlg1NVAyWWdiMEZjVWpzeTRMTm1JNWVqaVhNMzhyN2lDOEZKd0hQdm9rN2REZ1FkYUp6bFRLSXNvRnpzclZrdUE4N2QvNnFBaTdGUTBoOUNsS01MRXozVE9yTUJjcVlTRDhFOUFGZC9kUzZrVGY2ZGJVMFhuUXY5SUgyTVhmWitsbjlERUFGd3dkRnk4Z2lpYjZLYXdxZUNoZ0kvVWJIQk9UQ1pqL3Z2WGU3SW5sRnVETjNQM2IwZDFGNGd6cGlmRzIrdTREN1F3MUZmd2JuQ0QrSWxnald5SExIUE1Wb2cybUJMMzdxdlArN052bll1VHY0cnZqZnViTjZrM3dwUFowL1drRU93dGlFVXNXY3htK0dsNGFPaGhpRkRBUEl3bWJBdG43VFBWeTc3enFjZWZyNVlIbUh1bGw3ZW55ZlBtY0FIZ0hldzFSRXI4VmhoZC9GK0FWMVJKMERpa0pXUU5jL1pQM2VmS2Q3aHZzMnVyNDZySHM1dThlOU4vNDgvMGhBLzhIRmd3dUQwNFJTQklSRXFzUU9nN21Dc3NHTUFKVy9YbjRHL1RLOExidXp1MEk3cVR2blBKeTlzWDZiUDg0QkxZSWJBd2REODRRWXhHN0VPY09EQXh3Q0ZNRUFRQzkrN1AzU3ZUWDhYSHcrdTlSOEtUeEl2U285K1g3VlFDVUJKMElNd3ppRGo0UUxoQUdEOVVNcmduVEJaY0JSdjF2K1h2MlVmUys4dGZ4K3ZFUzg3ejArdmIzK1pmOVpnRVFCU0VJVUFyV0M4a00yUXl6QzVFSkVBZHZCSGdCWFA1bisrcjRBdmQ4OVdqMDdmTXc5RDMxSnZmcCtVajl4UUQ5QThRRzVRaFhDbEVMckFzdkM5d0o3Z2Q2QldJQzN2Nk8rN1Q0UFBaTjlFSHpXdk5mOVB6MUZ2aXQrcUw5clFDSEF3RUcvd2VDQ1pVS0Z3dkRDbklKY0FjUUJXY0NhZjhaL0NENTV2YUI5ZEQwd1BTUDlVTDNtL2s3L016K0p3RXlBdzhGekFZN0NCc0phUWs1Q1drSTJnYXRCQ0lDWWYrai9GcjZ2ZmlWOTg3MnNmWlA5MXo0cC9sUiszSDl6Zjg5QXJvRUZBZmpDUDBKY3dvOENqQUpkUWRnQlNFRGtnRFEvVmo3WmZuUjk1VDI4ZlVkOXYzMlZ2ZzIrbmI4Ky82eEFXb0U0QWJEQ1A0SnBBcWJDcVFKMHdlRUJmZ0NUQUNUL1IzN00vbSs5NjcySVBZNjlnYjNhZmhXK3RUOHFmK01BajBGZ2djdUNTY0tYQXJpQ2NNSUVBZnlCSllDRndDUC9SejdBL2w3OTN6MkYvWm45bUgzN2ZqZCtpMzl5ZjlwQXQwRUZBZlJDTmtKR0FxckNaWUl2Z1pQQko4QjZQNC8vTTM1MHZkejlxLzFsZlVxOW16M1JQbWkrM0grYmdGVkJPUUczd2dIQ2t3SzBBbTdDQ0FIQ2dXbUFqQUFcIixcbiAgXCJsb3d0aWNrXCI6IFwiVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT1cIixcbn0iLCJcbmNvbnN0IEJVRkZFUl9USU1FID0gNDAwIC8vIG1pbGxpc1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2hlZHVsZXJ7XG5cbiAgY29uc3RydWN0b3IoZGF0YSl7XG4gICAgKHtcbiAgICAgIHNvbmdfaWQ6IHRoaXMuc29uZ0lkLFxuICAgICAgc3RhcnRfcG9zaXRpb246IHRoaXMuc29uZ1N0YXJ0UG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXA6IHRoaXMudGltZVN0YW1wLFxuICAgICAgbWlkaUV2ZW50czogdGhpcy5ldmVudHMsXG4gICAgICBpbnN0cnVtZW50czogdGhpcy5pbnN0cnVtZW50cyxcbiAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgdHJhY2tzOiB0aGlzLnRyYWNrcyxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGJhcnM6IHRoaXMuYmFycyxcbiAgICAgICAgbG9vcDogdGhpcy5sb29wXG4gICAgICB9XG4gICAgfSA9IGRhdGEpXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRQb3NpdGlvbilcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cblxuICBnZXRFdmVudHMoKXtcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZShwb3NpdGlvbil7XG4gICAgdmFyIGksXG4gICAgICBldmVudCxcbiAgICAgIG51bUV2ZW50cyxcbiAgICAgIGV2ZW50cyxcbiAgICAgIGluc3RydW1lbnRcblxuICAgIHRoaXMubWF4dGltZSA9IHBvc2l0aW9uICsgQlVGRkVSX1RJTUVcbiAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSBldmVudHNbaV1cbiAgICAgIGluc3RydW1lbnQgPSB0aGlzLmluc3RydW1lbnRzW2V2ZW50Lmluc3RydW1lbnRJZF1cblxuICAgICAgaWYodHlwZW9mIGluc3RydW1lbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYodGhpcy5wYXJ0c1tldmVudC5wYXJ0SWRdLm11dGUgPT09IHRydWUgfHwgdGhpcy50cmFja3NbZXZlbnQudHJhY2tJZF0ubXV0ZSA9PT0gdHJ1ZSB8fCBldmVudC5tdXRlID09PSB0cnVlKXtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZUlkID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vIHRoaXMgaXMgdXN1YWxseSBjYXVzZWQgYnkgdGhlIHNhbWUgbm90ZSBvbiB0aGUgc2FtZSB0aWNrcyB2YWx1ZSwgd2hpY2ggaXMgcHJvYmFibHkgYSBidWcgaW4gdGhlIG1pZGkgZmlsZVxuICAgICAgICBjb25zb2xlLmluZm8oJ25vIG1pZGlOb3RlSWQnLCBldmVudClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gZGVidWcgbWludXRlX3dhbHR6IGRvdWJsZSBldmVudHNcbiAgICAgIC8vIGlmKGV2ZW50LnRpY2tzID4gNDAzMDApe1xuICAgICAgLy8gICBjb25zb2xlLmluZm8oZXZlbnQpXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfWVsc2UgaWYoaW5zdHJ1bWVudC50eXBlID09PSAnZXh0ZXJuYWwnKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWQ6IHJvdXRlIHRvIGV4dGVybmFsIG1pZGkgaW5zdHJ1bWVudFxuICAgICAgfWVsc2V7XG4gICAgICAgIGxldCB0aW1lID0gKHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRQb3NpdGlvbilcbiAgICAgICAgdGltZSAvPSAxMDAwIC8vIGNvbnZlcnQgdG8gc2Vjb25kcyBiZWNhdXNlIHRoZSBhdWRpbyBjb250ZXh0IHVzZXMgc2Vjb25kcyBmb3Igc2NoZWR1bGluZ1xuICAgICAgICBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUsIHRoaXMudHJhY2tzW2V2ZW50LnRyYWNrSWRdLm91dHB1dClcbiAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLmluZGV4LCB0aGlzLm51bUV2ZW50cylcbiAgICAvL3JldHVybiB0aGlzLmluZGV4ID49IDEwXG4gICAgcmV0dXJuIHRoaXMuaW5kZXggPj0gdGhpcy5udW1FdmVudHMgLy8gZW5kIG9mIHNvbmdcbiAgfVxuXG5cbiAgc3RvcEFsbFNvdW5kcygpe1xuICAgIE9iamVjdC5rZXlzKHRoaXMuaW5zdHJ1bWVudHMpLmZvckVhY2goKGluc3RydW1lbnRJZCkgPT4ge1xuICAgICAgaWYoaW5zdHJ1bWVudElkICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHRoaXMuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXS5zdG9wQWxsU291bmRzKClcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbn1cblxuIiwiLy9AIGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzLCBmaWx0ZXJFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJ1xuaW1wb3J0IHtnZXRNSURJRXZlbnRJZH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge1xuICBDUkVBVEVfU09ORyxcbiAgQUREX1RSQUNLUyxcbiAgVVBEQVRFX1NPTkcsXG4gIFNPTkdfUE9TSVRJT04sXG4gIEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICBTVEFSVF9TQ0hFRFVMRVIsXG4gIFNUT1BfU0NIRURVTEVSLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcbmltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBzb25nSW5kZXggPSAwXG5cbmNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDMwLFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG4vKlxudHlwZSBzb25nU2V0dGluZ3MgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgcHBxOiBudW1iZXIsXG4gIGJwbTogbnVtYmVyLFxuICBiYXJzOiBudW1iZXIsXG4gIGxvd2VzdE5vdGU6IG51bWJlcixcbiAgaGlnaGVzdE5vdGU6IG51bWJlcixcbiAgbm9taW5hdG9yOiBudW1iZXIsXG4gIGRlbm9taW5hdG9yOiBudW1iZXIsXG4gIHF1YW50aXplVmFsdWU6IG51bWJlcixcbiAgZml4ZWRMZW5ndGhWYWx1ZTogbnVtYmVyLFxuICBwb3NpdGlvblR5cGU6IHN0cmluZyxcbiAgdXNlTWV0cm9ub21lOiBib29sZWFuLFxuICBhdXRvU2l6ZTogYm9vbGVhbixcbiAgbG9vcDogYm9vbGVhbixcbiAgcGxheWJhY2tTcGVlZDogbnVtYmVyLFxuICBhdXRvUXVhbnRpemU6IGJvb2xlYW5cbn1cbiovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzOiB7fSA9IHt9KTogc3RyaW5ne1xuICBsZXQgaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHMgPSB7fTtcbiAgKHtcbiAgICBuYW1lOiBzLm5hbWUgPSBpZCxcbiAgICBwcHE6IHMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgIGJwbTogcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgYmFyczogcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICBsb3dlc3ROb3RlOiBzLmxvd2VzdE5vdGUgPSBkZWZhdWx0U29uZy5sb3dlc3ROb3RlLFxuICAgIGhpZ2hlc3ROb3RlOiBzLmhpZ2hlc3ROb3RlID0gZGVmYXVsdFNvbmcuaGlnaGVzdE5vdGUsXG4gICAgbm9taW5hdG9yOiBzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgIHF1YW50aXplVmFsdWU6IHMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICBwb3NpdGlvblR5cGU6IHMucG9zaXRpb25UeXBlID0gZGVmYXVsdFNvbmcucG9zaXRpb25UeXBlLFxuICAgIHVzZU1ldHJvbm9tZTogcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICBsb29wOiBzLmxvb3AgPSBkZWZhdWx0U29uZy5sb29wLFxuICAgIHBsYXliYWNrU3BlZWQ6IHMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgfSA9IHNldHRpbmdzKVxuXG4gIGxldHtcbiAgICB0aW1lRXZlbnRzOiB0aW1lRXZlbnRzID0gW1xuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRFTVBPLCBkYXRhMTogcy5icG19LFxuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRJTUVfU0lHTkFUVVJFLCBkYXRhMTogcy5ub21pbmF0b3IsIGRhdGEyOiBzLmRlbm9taW5hdG9yfVxuICAgIF0sXG4gICAgbWlkaUV2ZW50SWRzOiBtaWRpRXZlbnRJZHMgPSBbXSxcbiAgICBwYXJ0SWRzOiBwYXJ0SWRzID0gW10sXG4gICAgdHJhY2tJZHM6IHRyYWNrSWRzID0gW10sXG4gIH0gPSBzZXR0aW5nc1xuXG4gIC8vcGFyc2VUaW1lRXZlbnRzKHMsIHRpbWVFdmVudHMpXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9TT05HLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGltZUV2ZW50cyxcbiAgICAgIG1pZGlFdmVudElkcyxcbiAgICAgIHBhcnRJZHMsXG4gICAgICB0cmFja0lkcyxcbiAgICAgIHNldHRpbmdzOiBzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVHJhY2tzKHNvbmdfaWQ6IHN0cmluZywgLi4udHJhY2tfaWRzOiBzdHJpbmdbXSk6IHZvaWR7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfVFJBQ0tTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHNvbmdfaWQsXG4gICAgICB0cmFja19pZHMsXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUaW1lRXZlbnRzKC4uLnRpbWVfZXZlbnRzOiBzdHJpbmdbXSk6IHZvaWR7XG5cbn1cblxuXG4vLyBwcmVwYXJlIHNvbmcgZXZlbnRzIGZvciBwbGF5YmFja1xuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZVNvbmcoc29uZ19pZDogc3RyaW5nLCBmaWx0ZXJfZXZlbnRzOiBib29sZWFuID0gZmFsc2UpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdfaWRdXG4gIGlmKHNvbmcpe1xuICAgIGNvbnNvbGUudGltZSgndXBkYXRlIHNvbmcnKVxuICAgIC8vQFRPRE86IGNoZWNrIGlmIHRpbWUgZXZlbnRzIGFyZSB1cGRhdGVkXG4gICAgcGFyc2VUaW1lRXZlbnRzKHNvbmcuc2V0dGluZ3MsIHNvbmcudGltZUV2ZW50cylcbiAgICBsZXQgbWlkaUV2ZW50cyA9IFsuLi5zb25nLnRpbWVFdmVudHNdXG4gICAgc29uZy5taWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihldmVudF9pZCl7XG4gICAgICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50X2lkXVxuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICBtaWRpRXZlbnRzLnB1c2goey4uLmV2ZW50fSlcbiAgICAgIH1cbiAgICB9KVxuICAgIG1pZGlFdmVudHMgPSBwYXJzZUV2ZW50cyhtaWRpRXZlbnRzKVxuICAgIHBhcnNlTUlESU5vdGVzKG1pZGlFdmVudHMpXG4gICAgLy8gbWlkaUV2ZW50cy5mb3JFYWNoKChlKSA9PiB7XG4gICAgLy8gICBpZihlLmJhciA+PSA1ICYmIGUuYmFyIDw9IDYpe1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhlLmJhcnNBc1N0cmluZywgZS5kYXRhMSwgZS5kYXRhMiwgZS50eXBlKVxuICAgIC8vICAgfVxuICAgIC8vIH0pXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogVVBEQVRFX1NPTkcsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHNvbmdfaWQsXG4gICAgICAgIG1pZGlfZXZlbnRzOiBtaWRpRXZlbnRzLFxuICAgICAgICBzZXR0aW5nczogc29uZy5zZXR0aW5ncyAvLyBuZWVkZWQgZm9yIHRoZSBzZXF1ZW5jZXIgcmVkdWNlclxuICAgICAgfVxuICAgIH0pXG4gICAgY29uc29sZS50aW1lRW5kKCd1cGRhdGUgc29uZycpXG4gIH1lbHNle1xuICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ19pZH1gKVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0U29uZyhzb25nX2lkOiBzdHJpbmcsIHN0YXJ0X3Bvc2l0aW9uOiBudW1iZXIgPSAwKTogdm9pZHtcblxuICBmdW5jdGlvbiBjcmVhdGVTY2hlZHVsZXIoKXtcbiAgICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpXG4gICAgbGV0IHNvbmdEYXRhID0gc3RhdGUuc2VxdWVuY2VyLnNvbmdzW3NvbmdfaWRdXG4gICAgbGV0IHBhcnRzID0ge31cbiAgICBsZXQgdHJhY2tzID0ge31cbiAgICBsZXQgaW5zdHJ1bWVudHMgPSB7fVxuICAgIGxldCBpID0gMFxuICAgIGxldCBtaWRpRXZlbnRzID0gc29uZ0RhdGEubWlkaUV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgLy8gaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZUlkID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAvLyAgIGNvbnNvbGUuaW5mbyhpKyssICdubyBtaWRpTm90ZUlkJywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC50cmFja0lkKVxuICAgICAgLy8gICByZXR1cm4gZmFsc2VcbiAgICAgIC8vIH1cbiAgICAgIGxldCBwYXJ0ID0gcGFydHNbZXZlbnQucGFydElkXVxuICAgICAgbGV0IHRyYWNrID0gdHJhY2tzW2V2ZW50LnRyYWNrSWRdXG4gICAgICBpZih0eXBlb2YgcGFydCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBwYXJ0c1tldmVudC5wYXJ0SWRdID0gcGFydCA9IHN0YXRlLmVkaXRvci5wYXJ0c1tldmVudC5wYXJ0SWRdXG4gICAgICB9XG4gICAgICBpZih0eXBlb2YgdHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdHJhY2tzW2V2ZW50LnRyYWNrSWRdID0gdHJhY2sgPSBzdGF0ZS5lZGl0b3IudHJhY2tzW2V2ZW50LnRyYWNrSWRdXG4gICAgICAgIGluc3RydW1lbnRzW3RyYWNrLmluc3RydW1lbnRJZF0gPSBzdGF0ZS5pbnN0cnVtZW50c1t0cmFjay5pbnN0cnVtZW50SWRdXG4gICAgICB9XG4gICAgICAvL3JldHVybiAoIWV2ZW50Lm11dGUgJiYgIXBhcnQubXV0ZSAmJiAhdHJhY2subXV0ZSlcbiAgICAgIC8vIGNoZWNrIGlmIGEgbm90ZSwgcGFydCBvciB0cmFjayBpcyBtdXRlZCBzaG91bGQgYmUgZG9uZSBpbiB0aGUgc2NoZWR1bGVyIGxvb3BcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfSlcblxuICAgIGxldCBwb3NpdGlvbiA9IHN0YXJ0X3Bvc2l0aW9uXG4gICAgbGV0IHRpbWVTdGFtcCA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwIC8vIC0+IGNvbnZlcnQgdG8gbWlsbGlzXG4gICAgbGV0IHNjaGVkdWxlciA9IG5ldyBTY2hlZHVsZXIoe1xuICAgICAgc29uZ19pZCxcbiAgICAgIHN0YXJ0X3Bvc2l0aW9uLFxuICAgICAgdGltZVN0YW1wLFxuICAgICAgcGFydHMsXG4gICAgICB0cmFja3MsXG4gICAgICBpbnN0cnVtZW50cyxcbiAgICAgIHNldHRpbmdzOiBzb25nRGF0YS5zZXR0aW5ncyxcbiAgICAgIG1pZGlFdmVudHM6IG1pZGlFdmVudHMsXG4gICAgfSlcblxuICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFNUQVJUX1NDSEVEVUxFUixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ19pZCxcbiAgICAgICAgc2NoZWR1bGVyXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgbGV0XG4gICAgICAgIG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLFxuICAgICAgICBkaWZmID0gbm93IC0gdGltZVN0YW1wLFxuICAgICAgICBlbmRPZlNvbmdcblxuICAgICAgcG9zaXRpb24gKz0gZGlmZiAvLyBwb3NpdGlvbiBpcyBpbiBtaWxsaXNcbiAgICAgIHRpbWVTdGFtcCA9IG5vd1xuICAgICAgZW5kT2ZTb25nID0gc2NoZWR1bGVyLnVwZGF0ZShwb3NpdGlvbilcbiAgICAgIGlmKGVuZE9mU29uZyl7XG4gICAgICAgIHN0b3BTb25nKHNvbmdfaWQpXG4gICAgICB9XG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNPTkdfUE9TSVRJT04sXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzb25nX2lkLFxuICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgYWRkVGFzaygncmVwZXRpdGl2ZScsIHNvbmdfaWQsIGNyZWF0ZVNjaGVkdWxlcigpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcFNvbmcoc29uZ19pZDogc3RyaW5nKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKVxuICBsZXQgc29uZ0RhdGEgPSBzdGF0ZS5zZXF1ZW5jZXIuc29uZ3Nbc29uZ19pZF1cbiAgaWYoc29uZ0RhdGEpe1xuICAgIGlmKHNvbmdEYXRhLnBsYXlpbmcpe1xuICAgICAgcmVtb3ZlVGFzaygncmVwZXRpdGl2ZScsIHNvbmdfaWQpXG4gICAgICBzb25nRGF0YS5zY2hlZHVsZXIuc3RvcEFsbFNvdW5kcygpXG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNUT1BfU0NIRURVTEVSLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgc29uZ19pZFxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgfWVsc2V7XG4gICAgY29uc29sZS5lcnJvcihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ19pZH1gKVxuICB9XG59XG5cblxuLypcbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzKFxuICBzZXR0aW5nczoge3NvbmdfaWQ6IHN0cmluZywgdHJhY2tfaWQ6IHN0cmluZywgcGFydF9pZDogc3RyaW5nfSxcbiAgbWlkaV9ldmVudHM6IEFycmF5PHt0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXJ9PlxuKXtcbiAgLy9AdG9kbzogY3JlYXRlIHBhcnQsIGFkZCBldmVudHMgdG8gcGFydCwgY3JlYXRlIHRyYWNrLCBhZGQgcGFydCB0byB0cmFjaywgYWRkIHRyYWNrIHRvIHNvbmdcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICAgIHBheWxvYWQ6IHtcbi8vICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHNUb1Nvbmcoc29uZ19pZDogc3RyaW5nLCBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+KXtcbiAgLy9AdG9kbzogY3JlYXRlIHBhcnQsIGFkZCBldmVudHMgdG8gcGFydCwgY3JlYXRlIHRyYWNrLCBhZGQgcGFydCB0byB0cmFjaywgYWRkIHRyYWNrIHRvIHNvbmdcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkOiBzb25nX2lkLFxuICAgICAgbWlkaV9ldmVudHNcbiAgICB9XG4gIH0pXG59XG4qLyIsIlxuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQgcGFyc2VNSURJRmlsZSBmcm9tICcuL21pZGlmaWxlJ1xuaW1wb3J0IHtjcmVhdGVNSURJRXZlbnQsIGdldE1JRElFdmVudElkfSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2NyZWF0ZVBhcnQsIGFkZE1JRElFdmVudHN9IGZyb20gJy4vcGFydCdcbmltcG9ydCB7Y3JlYXRlVHJhY2ssIGFkZFBhcnRzLCBzZXRJbnN0cnVtZW50fSBmcm9tICcuL3RyYWNrJ1xuaW1wb3J0IHtjcmVhdGVTb25nLCBhZGRUcmFja3MsIHVwZGF0ZVNvbmd9IGZyb20gJy4vc29uZydcbmltcG9ydCB7Y3JlYXRlSW5zdHJ1bWVudH0gZnJvbSAnLi9pbnN0cnVtZW50J1xuXG5jb25zdCBQUFEgPSA5NjBcblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGUoZGF0YSwgc2V0dGluZ3MgPSB7fSl7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgcmV0dXJuIHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZih0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB0b1NvbmcoZGF0YSk7XG4gIC8vIH1lbHNle1xuICAvLyAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgLy8gICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAvLyAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAvLyAgICAgcmV0dXJuIHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICAvLyAgIH1lbHNle1xuICAvLyAgICAgZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgLy8gICB9XG4gIH1cblxuICAvLyB7XG4gIC8vICAgcHBxID0gbmV3UFBRLFxuICAvLyAgIGJwbSA9IG5ld0JQTSxcbiAgLy8gICBwbGF5YmFja1NwZWVkID0gbmV3UGxheWJhY2tTcGVlZCxcbiAgLy8gfSA9IHNldHRpbmdzXG59XG5cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCl7XG4gIGxldCB0cmFja3MgPSBwYXJzZWQudHJhY2tzXG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdFxuICBsZXQgcHBxRmFjdG9yID0gUFBRIC8gcHBxIC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGV2ZW50SWRzXG4gIGxldCBicG0gPSAtMVxuICBsZXQgbm9taW5hdG9yID0gLTFcbiAgbGV0IGRlbm9taW5hdG9yID0gLTFcbiAgbGV0IHRyYWNrSWRzID0gW11cbiAgbGV0IHNvbmdJZFxuICBsZXQgaW5zdHJ1bWVudElkID0gY3JlYXRlSW5zdHJ1bWVudCgpXG5cblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgZXZlbnRJZHMgPSBbXTtcblxuICAgIGZvcihsZXQgZXZlbnQgb2YgdHJhY2spe1xuICAgICAgdGlja3MgKz0gKGV2ZW50LmRlbHRhVGltZSAqIHBwcUZhY3Rvcik7XG5cbiAgICAgIGlmKGNoYW5uZWwgPT09IC0xICYmIHR5cGVvZiBldmVudC5jaGFubmVsICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgfVxuICAgICAgdHlwZSA9IGV2ZW50LnN1YnR5cGU7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbHRhVGltZSwgdGlja3MsIHR5cGUpO1xuXG4gICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSl7XG5cbiAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2luc3RydW1lbnROYW1lJzpcbiAgICAgICAgICBpZihldmVudC50ZXh0KXtcbiAgICAgICAgICAgIHRyYWNrSW5zdHJ1bWVudE5hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT24nOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDgwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzICsgMHg1MSwgdGlja3MsIHR5cGU6IDB4NTEsIGRhdGExOiB0bXB9KTtcbiAgICAgICAgICAvL3RpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MsIHRpY2tzLCB0eXBlOiAweDUxLCBkYXRhMTogdG1wfSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcyArIDB4NTgsIHRpY2tzLCB0eXBlOiAweDU4LCBkYXRhMTogZXZlbnQubnVtZXJhdG9yLCBkYXRhMjogZXZlbnQuZGVub21pbmF0b3J9KTtcbiAgICAgICAgICAvL3RpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MsIHRpY2tzLCB0eXBlOiAweDU4LCBkYXRhMTogZXZlbnQubnVtZXJhdG9yLCBkYXRhMjogZXZlbnQuZGVub21pbmF0b3J9KTtcbiAgICAgICAgICBicmVhaztcblxuXG4gICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4RTAsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBsYXN0VHlwZSA9IHR5cGVcbiAgICAgIGxhc3RUaWNrcyA9IHRpY2tzXG4gICAgfVxuXG4gICAgaWYoZXZlbnRJZHMubGVuZ3RoID4gMCl7XG4gICAgICBsZXQgdHJhY2tJZCA9IGNyZWF0ZVRyYWNrKHtuYW1lOiB0cmFja05hbWV9KVxuICAgICAgc2V0SW5zdHJ1bWVudCh0cmFja0lkLCBpbnN0cnVtZW50SWQpXG4gICAgICAvL2xldCBwYXJ0SWQgPSBjcmVhdGVQYXJ0KHt0cmFja0lkLCBtaWRpRXZlbnRJZHM6IGV2ZW50SWRzfSlcbiAgICAgIGxldCBwYXJ0SWQgPSBjcmVhdGVQYXJ0KHt0cmFja0lkfSlcbiAgICAgIGFkZE1JRElFdmVudHMocGFydElkLCAuLi5ldmVudElkcylcbiAgICAgIGFkZFBhcnRzKHRyYWNrSWQsIHBhcnRJZClcbiAgICAgIC8vYWRkVHJhY2tzKHNvbmdJZCwgdHJhY2tJZClcbiAgICAgIHRyYWNrSWRzLnB1c2godHJhY2tJZClcbiAgICB9XG4gIH1cblxuICBzb25nSWQgPSBjcmVhdGVTb25nKHtcbiAgICBwcHE6IFBQUSxcbiAgICAvL3BsYXliYWNrU3BlZWQ6IDEsXG4gICAgLy9wcHEsXG4gICAgYnBtLFxuICAgIG5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcixcbiAgICB0aW1lRXZlbnRzLFxuICB9KVxuICBhZGRUcmFja3Moc29uZ0lkLCAuLi50cmFja0lkcylcbiAgdXBkYXRlU29uZyhzb25nSWQpXG4gIHJldHVybiBzb25nSWRcbn1cbiIsIlxuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQgcWFtYmksIHtcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG4gIGNyZWF0ZU1JRElOb3RlLFxuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcbn0gZnJvbSAnLi9xYW1iaSdcblxuY29uc29sZS5sb2cocWFtYmkudmVyc2lvbilcbnFhbWJpLmxvZygnZnVuY3Rpb25zJylcbnFhbWJpLmluaXQoKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBsZXQgYnV0dG9uU3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKVxuICBsZXQgYnV0dG9uU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSB0cnVlXG4gIGJ1dHRvblN0b3AuZGlzYWJsZWQgPSB0cnVlXG5cbiAgbGV0IHRlc3QgPSAyXG4gIGxldCBub3Rlb24sIG5vdGVvZmYsIG5vdGUsIHNvbmdJZCwgdHJhY2ssIHBhcnQxLCBwYXJ0MlxuXG4gIGlmKHRlc3QgPT09IDEpe1xuXG4gICAgc29uZ0lkID0gY3JlYXRlU29uZyh7bmFtZTogJ015IEZpcnN0IFNvbmcnLCBwbGF5YmFja1NwZWVkOiAxLCBsb29wOiB0cnVlLCBicG06IDYwfSlcbiAgICB0cmFjayA9IGNyZWF0ZVRyYWNrKHtuYW1lOiAnZ3VpdGFyJywgc29uZ0lkfSlcbiAgICBwYXJ0MSA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMScsIHRyYWNrfSlcbiAgICBwYXJ0MiA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMicsIHRyYWNrfSlcbiAgICAvL25vdGVvbiA9IGNyZWF0ZU1JRElFdmVudCg5NjAsIDE0NCwgNjAsIDEwMClcbiAgICAvL25vdGVvZmYgPSBjcmVhdGVNSURJRXZlbnQoMTAyMCwgMTI4LCA2MCwgMClcbiAgICAvL2FkZE1JRElFdmVudHMocGFydDEsIG5vdGVvbiwgbm90ZW9mZilcblxuICAgIC8vbm90ZSA9IGNyZWF0ZU1JRElOb3RlKG5vdGVvbiwgbm90ZW9mZilcblxuXG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCB0eXBlID0gMTQ0XG5cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspe1xuICAgICAgZXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCB0eXBlLCA2MCwgMTAwKSlcbiAgICAgIGlmKGkgJSAyID09PSAwKXtcbiAgICAgICAgdHlwZSA9IDEyOFxuICAgICAgICB0aWNrcyArPSA5NjBcbiAgICAgIH1lbHNle1xuICAgICAgICB0eXBlID0gMTQ0XG4gICAgICAgIHRpY2tzICs9IDk2MFxuICAgICAgfVxuICAgIH1cbiAgICBhZGRNSURJRXZlbnRzKHBhcnQxLCAuLi5ldmVudHMpXG5cbiAgICBhZGRQYXJ0cyh0cmFjaywgcGFydDEsIHBhcnQyKVxuICAgIGFkZFRyYWNrcyhzb25nSWQsIHRyYWNrKVxuICAgIHVwZGF0ZVNvbmcoc29uZ0lkKVxuICAgIGJ1dHRvblN0YXJ0LmRpc2FibGVkID0gZmFsc2VcbiAgfVxuXG4vKlxuICAvL3N0YXJ0U29uZyhzb25nKVxuICAvLyBsZXQgc29uZzIgPSBjcmVhdGVTb25nKClcblxuICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICAgc3RhcnRTb25nKHNvbmcyLCA1MDAwKVxuICAvLyB9LCAxMDAwKVxuXG4vLyAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbi8vICAgICBzdG9wU29uZyhzb25nKVxuLy8gLy8gICAgc3RvcFNvbmcoc29uZzIpXG4vLyAgIH0sIDIwMClcbiovXG5cbiAgaWYodGVzdCA9PT0gMil7XG4gICAgLy9mZXRjaCgnbW96azU0NWEubWlkJylcbiAgICBmZXRjaCgnbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgLnRoZW4oXG4gICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIH1cbiAgICApXG4gICAgLnRoZW4oKGFiKSA9PiB7XG4gICAgICAvL3NvbmdJZCA9IHNvbmdGcm9tTUlESUZpbGUocGFyc2VNSURJRmlsZShhYikpXG4gICAgICBsZXQgbWYgPSBwYXJzZU1JRElGaWxlKGFiKVxuICAgICAgc29uZ0lkID0gc29uZ0Zyb21NSURJRmlsZShtZilcbiAgICAgIC8vY29uc29sZS5sb2coJ2hlYWRlcjonLCBtZi5oZWFkZXIpXG4gICAgICAvL2NvbnNvbGUubG9nKCcjIHRyYWNrczonLCBtZi50cmFja3Muc2l6ZSlcbiAgICAgIGJ1dHRvblN0YXJ0LmRpc2FibGVkID0gZmFsc2VcbiAgICAgIGJ1dHRvblN0b3AuZGlzYWJsZWQgPSBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBidXR0b25TdGFydC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgc3RhcnRTb25nKHNvbmdJZCwgMClcbiAgfSlcblxuICBidXR0b25TdG9wLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzdG9wU29uZyhzb25nSWQpXG4gIH0pXG5cbn0pXG4iLCJcblxuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvJ1xuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge2NyZWF0ZUluc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7XG4gIENSRUFURV9UUkFDSyxcbiAgQUREX1BBUlRTLFxuICBTRVRfSU5TVFJVTUVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHRyYWNrSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFjayhcbiAgc2V0dGluZ3M6IHtuYW1lOiBzdHJpbmcsIHBhcnRJZHM6QXJyYXk8c3RyaW5nPiwgc29uZ0lkOiBzdHJpbmd9ID0ge31cbiAgLy9zZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydHM6QXJyYXk8c3RyaW5nPiwgc29uZzogc3RyaW5nfSA9IHtuYW1lOiAnYWFwJywgcGFydHM6IFtdLCBzb25nOiAnbm8gc29uZyd9XG4gIC8vc2V0dGluZ3MgPSB7bmFtZTogbmFtZSA9ICdhYXAnLCBwYXJ0czogcGFydHMgPSBbXSwgc29uZzogc29uZyA9ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuKXtcbiAgbGV0IGlkID0gYE1UXyR7dHJhY2tJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgcGFydElkcyA9IFtdLFxuICAgIHNvbmdJZCA9ICdub25lJ1xuICB9ID0gc2V0dGluZ3NcbiAgbGV0IHZvbHVtZSA9IDAuNVxuICBsZXQgb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgb3V0cHV0LmdhaW4udmFsdWUgPSB2b2x1bWVcbiAgb3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbikgLy9AVE9ETzogcm91dGUgdG8gbWFzdGVyIGNvbXByZXNzb3IgZmlyc3QhXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9UUkFDSyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBwYXJ0SWRzLFxuICAgICAgc29uZ0lkLFxuICAgICAgdm9sdW1lLFxuICAgICAgb3V0cHV0LFxuICAgICAgbXV0ZTogZmFsc2UsXG4gICAgICAvL2luc3RydW1lbnRJZDogY3JlYXRlSW5zdHJ1bWVudCgnc2luZXdhdmUnKSxcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRQYXJ0cyh0cmFja19pZDogc3RyaW5nLCAuLi5wYXJ0X2lkczpzdHJpbmcpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX1BBUlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHRyYWNrX2lkLFxuICAgICAgcGFydF9pZHMsXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJbnN0cnVtZW50KHRyYWNrSWQ6IHN0cmluZywgaW5zdHJ1bWVudElkOiBzdHJpbmcpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogU0VUX0lOU1RSVU1FTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdHJhY2tJZCxcbiAgICAgIGluc3RydW1lbnRJZCxcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtdXRlVHJhY2soZmxhZzogYm9vbGVhbil7XG5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Vm9sdW1lVHJhY2soZmxhZzogYm9vbGVhbil7XG5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGFubmluZ1RyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG4iLCJpbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0J1xuXG5sZXRcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgIHNlY29uZHMsXG4gICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcy8xMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcil7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogYnVmZmVyfSk7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHsnaWQnOiBpZCwgJ2J1ZmZlcic6IGJ1ZmZlcn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvbkVycm9yKGUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgLy9yZWplY3QoZSk7XG4gICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiB1bmRlZmluZWR9KTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICBsZXQgZXhlY3V0b3IgPSBmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgZmV0Y2godXJsKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5vayl7XG4gICAgICAgICAgcmVzcG9uc2UuYmxvYigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBwYXJzZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKG1hcHBpbmcsIGV2ZXJ5ID0gZmFsc2Upe1xuICBsZXQga2V5LCBzYW1wbGUsXG4gICAgcHJvbWlzZXMgPSBbXSxcbiAgICB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKTtcblxuICBldmVyeSA9IHR5cGVTdHJpbmcoZXZlcnkpID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZTtcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgZm9yKGtleSBpbiBtYXBwaW5nKXtcbiAgICAgIGlmKG1hcHBpbmcuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgIHNhbXBsZSA9IG1hcHBpbmdba2V5XTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjaGVja0lmQmFzZTY0KHNhbXBsZSkpXG4gICAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChwYXJzZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGV2ZXJ5KSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgIHByb21pc2VzLnB1c2gocGFyc2VTYW1wbGUoc2FtcGxlLCBldmVyeSkpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwgZXZlcnkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQodmFsdWVzKXtcbiAgICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgIGxldCBtYXBwaW5nID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKTtcbiAgICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2VwZW4oKXtcbiAgY29uc29sZS5sb2coY29udGV4dClcbn1cblxuZnVuY3Rpb24gY2hlY2tJZkJhc2U2NChkYXRhKXtcbiAgbGV0IHBhc3NlZCA9IHRydWU7XG4gIHRyeXtcbiAgICBhdG9iKGRhdGEpO1xuICB9Y2F0Y2goZSl7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cbiJdfQ==
