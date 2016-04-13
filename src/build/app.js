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
  console.log('run once');
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
  console.log('getStore() called');
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

var context = (0, _init_audio.getAudioContext)();

var timedTasks = new Map();
var repetitiveTasks = new Map();
var scheduledTasks = new Map();
var tasks = new Map();
var lastTimeStamp = void 0;

function heartbeat(timestamp) {
  var now = context.currentTime;

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
exports.configureMasterCompressor = exports.enableMasterCompressor = exports.getCompressionReduction = exports.getMasterVolume = exports.setMasterVolume = exports.getAudioContext = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; }; /*
                                                                                                                                                                                                                                                    Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
                                                                                                                                                                                                                                                  */

exports.initAudio = initAudio;

var _samples = require('./samples');

var _samples2 = _interopRequireDefault(_samples);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var data = {},
    context = void 0,
    masterGain = void 0,
    compressor = void 0,
    initialized = false;

function initAudio() {

  if (context.createGainNode === undefined) {
    context.createGainNode = context.createGain;
  }
  // check for older implementations of WebAudio
  var source = context.createBufferSource();
  data.legacy = false;
  if (source.start === undefined) {
    data.legacy = true;
  }

  // set up the elementary audio nodes
  compressor = context.createDynamicsCompressor();
  compressor.connect(context.destination);
  masterGain = context.createGainNode();
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

var _getAudioContext = function getAudioContext() {
  if (typeof context === 'undefined') {
    if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      context = new window.AudioContext();
    } else {
      //@TODO: create dummy AudioContext for use in node, see: https://www.npmjs.com/package/audio-context
      context = {
        createGain: function createGain() {
          return {
            gain: 1
          };
        },
        createOscillator: function createOscillator() {}
      };
    }
  }

  exports.getAudioContext = _getAudioContext = function getAudioContext() {
    return context;
  };
  return context;
};

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

exports.getAudioContext = _getAudioContext;
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
var context = (0, _init_audio.getAudioContext)();
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
exports.songFromMIDIFile = exports.parseMIDIFile = exports.addMIDIEvents = exports.createPart = exports.addParts = exports.createTrack = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = exports.getMasterVolume = exports.getAudioContext = exports.init = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var _midifile = require('./midifile');

var _song_from_midifile = require('./song_from_midifile');

var _init = require('./init');

var _init_audio = require('./init_audio');

var qambi = {
  version: '0.0.1',

  // from ./init
  init: _init.init,

  // from ./init_audio
  getAudioContext: _init_audio.getAudioContext,
  getMasterVolume: _init_audio.getMasterVolume,

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
getAudioContext = _init_audio.getAudioContext;
exports.getMasterVolume = _init_audio.getMasterVolume;
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

var context = (0, _init_audio.getAudioContext)();

var Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    if (sampleData === -1) {
      // create simple synth sample
      this.source = context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    } else {
      this.source = context.createBufferSource();
      this.source.buffer = sampleData.d;
    }
    this.output = context.createGain();
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
var context = (0, _init_audio.getAudioContext)();
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
    var timeStamp = context.currentTime * 1000; // -> convert to millis
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
      var now = context.currentTime * 1000,
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
var context = (0, _init_audio.getAudioContext)();
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
  var output = context.createGain();
  output.gain.value = volume;
  output.connect(context.destination); //@TODO: route to master compressor first!

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

var context = (0, _init_audio.getAudioContext)(),
    mPow = Math.pow,
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
      context.decodeAudioData(sample, function onSuccess(buffer) {
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
  console.log(context);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSG9zdE9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pbml0LmpzIiwic3JjL2luaXRfYXVkaW8uanMiLCJzcmMvaW5zdHJ1bWVudC5qcyIsInNyYy9taWRpX2V2ZW50LmpzIiwic3JjL21pZGlfbm90ZS5qcyIsInNyYy9taWRpX3N0cmVhbS5qcyIsInNyYy9taWRpZmlsZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NhbXBsZS5qcyIsInNyYy9zYW1wbGVzLmpzb24iLCJzcmMvc2NoZWR1bGVyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwic3JjL3Rlc3Rfd2ViLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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bUNyQixNQUFQLENBbkM0QjtDQUE5Qjs7QUF1Q08sU0FBUyxVQUFULENBQW9CLENBQXBCLEVBQXNCO0FBQzNCLE1BQUcsUUFBTyw2Q0FBUCxJQUFZLFFBQVosRUFBcUI7QUFDdEIsa0JBQWMsNENBQWQsQ0FEc0I7R0FBeEI7O0FBSUEsTUFBRyxNQUFNLElBQU4sRUFBVztBQUNaLFdBQU8sTUFBUCxDQURZO0dBQWQ7OztBQUwyQixNQVV2QixnQkFBZ0IsT0FBTyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLENBQS9CLEVBQWtDLEtBQWxDLENBQXdDLG1CQUF4QyxFQUE2RCxDQUE3RCxDQUFoQixDQVZ1QjtBQVczQixTQUFPLGNBQWMsV0FBZCxFQUFQLENBWDJCO0NBQXRCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLyoqXG4gKiBHZXRzIHRoZSBgW1tQcm90b3R5cGVdXWAgb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIGBbW1Byb3RvdHlwZV1dYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVHZXRQcm90b3R5cGUoT2JqZWN0KHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0IGluIElFIDwgOS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSG9zdE9iamVjdCh2YWx1ZSkge1xuICAvLyBNYW55IGhvc3Qgb2JqZWN0cyBhcmUgYE9iamVjdGAgb2JqZWN0cyB0aGF0IGNhbiBjb2VyY2UgdG8gc3RyaW5nc1xuICAvLyBkZXNwaXRlIGhhdmluZyBpbXByb3Blcmx5IGRlZmluZWQgYHRvU3RyaW5nYCBtZXRob2RzLlxuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIGlmICh2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS50b1N0cmluZyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9ICEhKHZhbHVlICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0hvc3RPYmplY3Q7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNIb3N0T2JqZWN0ID0gcmVxdWlyZSgnLi9faXNIb3N0T2JqZWN0JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8XG4gICAgICBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSAhPSBvYmplY3RUYWcgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiZcbiAgICBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJiBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGFwcGx5TWlkZGxld2FyZTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0b3JlIGVuaGFuY2VyIHRoYXQgYXBwbGllcyBtaWRkbGV3YXJlIHRvIHRoZSBkaXNwYXRjaCBtZXRob2RcbiAqIG9mIHRoZSBSZWR1eCBzdG9yZS4gVGhpcyBpcyBoYW5keSBmb3IgYSB2YXJpZXR5IG9mIHRhc2tzLCBzdWNoIGFzIGV4cHJlc3NpbmdcbiAqIGFzeW5jaHJvbm91cyBhY3Rpb25zIGluIGEgY29uY2lzZSBtYW5uZXIsIG9yIGxvZ2dpbmcgZXZlcnkgYWN0aW9uIHBheWxvYWQuXG4gKlxuICogU2VlIGByZWR1eC10aHVua2AgcGFja2FnZSBhcyBhbiBleGFtcGxlIG9mIHRoZSBSZWR1eCBtaWRkbGV3YXJlLlxuICpcbiAqIEJlY2F1c2UgbWlkZGxld2FyZSBpcyBwb3RlbnRpYWxseSBhc3luY2hyb25vdXMsIHRoaXMgc2hvdWxkIGJlIHRoZSBmaXJzdFxuICogc3RvcmUgZW5oYW5jZXIgaW4gdGhlIGNvbXBvc2l0aW9uIGNoYWluLlxuICpcbiAqIE5vdGUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgd2lsbCBiZSBnaXZlbiB0aGUgYGRpc3BhdGNoYCBhbmQgYGdldFN0YXRlYCBmdW5jdGlvbnNcbiAqIGFzIG5hbWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBtaWRkbGV3YXJlcyBUaGUgbWlkZGxld2FyZSBjaGFpbiB0byBiZSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0b3JlIGVuaGFuY2VyIGFwcGx5aW5nIHRoZSBtaWRkbGV3YXJlLlxuICovXG5mdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBtaWRkbGV3YXJlcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG1pZGRsZXdhcmVzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjcmVhdGVTdG9yZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcik7XG4gICAgICB2YXIgX2Rpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gICAgICB2YXIgY2hhaW4gPSBbXTtcblxuICAgICAgdmFyIG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICAgIGdldFN0YXRlOiBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgZGlzcGF0Y2g6IGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBfZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoYWluID0gbWlkZGxld2FyZXMubWFwKGZ1bmN0aW9uIChtaWRkbGV3YXJlKSB7XG4gICAgICAgIHJldHVybiBtaWRkbGV3YXJlKG1pZGRsZXdhcmVBUEkpO1xuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2ggPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdLmFwcGx5KHVuZGVmaW5lZCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcblxuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCBzdG9yZSwge1xuICAgICAgICBkaXNwYXRjaDogX2Rpc3BhdGNoXG4gICAgICB9KTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYmluZEFjdGlvbkNyZWF0b3JzO1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvbiBjcmVhdG9ycywgaW50byBhbiBvYmplY3Qgd2l0aCB0aGVcbiAqIHNhbWUga2V5cywgYnV0IHdpdGggZXZlcnkgZnVuY3Rpb24gd3JhcHBlZCBpbnRvIGEgYGRpc3BhdGNoYCBjYWxsIHNvIHRoZXlcbiAqIG1heSBiZSBpbnZva2VkIGRpcmVjdGx5LiBUaGlzIGlzIGp1c3QgYSBjb252ZW5pZW5jZSBtZXRob2QsIGFzIHlvdSBjYW4gY2FsbFxuICogYHN0b3JlLmRpc3BhdGNoKE15QWN0aW9uQ3JlYXRvcnMuZG9Tb21ldGhpbmcoKSlgIHlvdXJzZWxmIGp1c3QgZmluZS5cbiAqXG4gKiBGb3IgY29udmVuaWVuY2UsIHlvdSBjYW4gYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCBnZXQgYSBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3JzKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCkge1xuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzICE9PSAnb2JqZWN0JyB8fCBhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBpbnN0ZWFkIHJlY2VpdmVkICcgKyAoYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgYWN0aW9uQ3JlYXRvcnMpICsgJy4gJyArICdEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiPycpO1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG4gIHZhciBib3VuZEFjdGlvbkNyZWF0b3JzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJvdW5kQWN0aW9uQ3JlYXRvcnM7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25UeXBlID0gYWN0aW9uICYmIGFjdGlvbi50eXBlO1xuICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvblR5cGUgJiYgJ1wiJyArIGFjdGlvblR5cGUudG9TdHJpbmcoKSArICdcIicgfHwgJ2FuIGFjdGlvbic7XG5cbiAgcmV0dXJuICdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgaGFuZGxpbmcgJyArIGFjdGlvbk5hbWUgKyAnLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24pIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCA/ICdpbml0aWFsU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlJyA6ICdwcmV2aW91cyBzdGF0ZSByZWNlaXZlZCBieSB0aGUgcmVkdWNlcic7XG5cbiAgaWYgKHJlZHVjZXJLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnU3RvcmUgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZHVjZXIuIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnQgcGFzc2VkICcgKyAndG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLic7XG4gIH1cblxuICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiAnVGhlICcgKyBhcmd1bWVudE5hbWUgKyAnIGhhcyB1bmV4cGVjdGVkIHR5cGUgb2YgXCInICsge30udG9TdHJpbmcuY2FsbChpbnB1dFN0YXRlKS5tYXRjaCgvXFxzKFthLXp8QS1aXSspLylbMV0gKyAnXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgJyArICgna2V5czogXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCInKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9KTtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnVW5leHBlY3RlZCAnICsgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyAna2V5cycgOiAna2V5JykgKyAnICcgKyAoJ1wiJyArIHVuZXhwZWN0ZWRLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiIGZvdW5kIGluICcgKyBhcmd1bWVudE5hbWUgKyAnLiAnKSArICdFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6ICcgKyAoJ1wiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTYW5pdHkocmVkdWNlcnMpIHtcbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciByZWR1Y2VyID0gcmVkdWNlcnNba2V5XTtcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbi4gJyArICdJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgJyArICdleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5ICcgKyAnbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9ICdAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IHR5cGUgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuICcgKyAoJ0RvblxcJ3QgdHJ5IHRvIGhhbmRsZSAnICsgX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIHZhciBzYW5pdHlFcnJvcjtcbiAgdHJ5IHtcbiAgICBhc3NlcnRSZWR1Y2VyU2FuaXR5KGZpbmFsUmVkdWNlcnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2FuaXR5RXJyb3IgPSBlO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmF0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBpZiAoc2FuaXR5RXJyb3IpIHtcbiAgICAgIHRocm93IHNhbml0eUVycm9yO1xuICAgIH1cblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24pO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSh3YXJuaW5nTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1trZXldO1xuICAgICAgdmFyIHByZXZpb3VzU3RhdGVGb3JLZXkgPSBzdGF0ZVtrZXldO1xuICAgICAgdmFyIG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZVtrZXldID0gbmV4dFN0YXRlRm9yS2V5O1xuICAgICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgbmV4dFN0YXRlRm9yS2V5ICE9PSBwcmV2aW91c1N0YXRlRm9yS2V5O1xuICAgIH1cbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21wb3NlO1xuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvXG4gKiBsZWZ0LiBGb3IgZXhhbXBsZSwgY29tcG9zZShmLCBnLCBoKSBpcyBpZGVudGljYWwgdG8gYXJnID0+IGYoZyhoKGFyZykpKS5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmNzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgZnVuY3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDw9IDAgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMF07XG4gICAgfVxuXG4gICAgdmFyIGxhc3QgPSBmdW5jc1tmdW5jcy5sZW5ndGggLSAxXTtcbiAgICB2YXIgcmVzdCA9IGZ1bmNzLnNsaWNlKDAsIC0xKTtcblxuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkFjdGlvblR5cGVzID0gdW5kZWZpbmVkO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjcmVhdGVTdG9yZTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBUaGVzZSBhcmUgcHJpdmF0ZSBhY3Rpb24gdHlwZXMgcmVzZXJ2ZWQgYnkgUmVkdXguXG4gKiBGb3IgYW55IHVua25vd24gYWN0aW9ucywgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlLlxuICogSWYgdGhlIGN1cnJlbnQgc3RhdGUgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuXG4gKiBEbyBub3QgcmVmZXJlbmNlIHRoZXNlIGFjdGlvbiB0eXBlcyBkaXJlY3RseSBpbiB5b3VyIGNvZGUuXG4gKi9cbnZhciBBY3Rpb25UeXBlcyA9IGV4cG9ydHMuQWN0aW9uVHlwZXMgPSB7XG4gIElOSVQ6ICdAQHJlZHV4L0lOSVQnXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB0aGF0IGhvbGRzIHRoZSBzdGF0ZSB0cmVlLlxuICogVGhlIG9ubHkgd2F5IHRvIGNoYW5nZSB0aGUgZGF0YSBpbiB0aGUgc3RvcmUgaXMgdG8gY2FsbCBgZGlzcGF0Y2goKWAgb24gaXQuXG4gKlxuICogVGhlcmUgc2hvdWxkIG9ubHkgYmUgYSBzaW5nbGUgc3RvcmUgaW4geW91ciBhcHAuIFRvIHNwZWNpZnkgaG93IGRpZmZlcmVudFxuICogcGFydHMgb2YgdGhlIHN0YXRlIHRyZWUgcmVzcG9uZCB0byBhY3Rpb25zLCB5b3UgbWF5IGNvbWJpbmUgc2V2ZXJhbCByZWR1Y2Vyc1xuICogaW50byBhIHNpbmdsZSByZWR1Y2VyIGZ1bmN0aW9uIGJ5IHVzaW5nIGBjb21iaW5lUmVkdWNlcnNgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlZHVjZXIgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG5leHQgc3RhdGUgdHJlZSwgZ2l2ZW5cbiAqIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBhY3Rpb24gdG8gaGFuZGxlLlxuICpcbiAqIEBwYXJhbSB7YW55fSBbaW5pdGlhbFN0YXRlXSBUaGUgaW5pdGlhbCBzdGF0ZS4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGh5ZHJhdGUgdGhlIHN0YXRlIGZyb20gdGhlIHNlcnZlciBpbiB1bml2ZXJzYWwgYXBwcywgb3IgdG8gcmVzdG9yZSBhXG4gKiBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgdXNlciBzZXNzaW9uLlxuICogSWYgeW91IHVzZSBgY29tYmluZVJlZHVjZXJzYCB0byBwcm9kdWNlIHRoZSByb290IHJlZHVjZXIgZnVuY3Rpb24sIHRoaXMgbXVzdCBiZVxuICogYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUgYXMgYGNvbWJpbmVSZWR1Y2Vyc2Aga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmhhbmNlciBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gaW5pdGlhbFN0YXRlO1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5oYW5jZXIoY3JlYXRlU3RvcmUpKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSByZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgY3VycmVudFJlZHVjZXIgPSByZWR1Y2VyO1xuICB2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICB2YXIgY3VycmVudExpc3RlbmVycyA9IFtdO1xuICB2YXIgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnM7XG4gIHZhciBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpIHtcbiAgICBpZiAobmV4dExpc3RlbmVycyA9PT0gY3VycmVudExpc3RlbmVycykge1xuICAgICAgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMuc2xpY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHN0YXRlIHRyZWUgbWFuYWdlZCBieSB0aGUgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSBjdXJyZW50IHN0YXRlIHRyZWUgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiBjdXJyZW50U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGNoYW5nZSBsaXN0ZW5lci4gSXQgd2lsbCBiZSBjYWxsZWQgYW55IHRpbWUgYW4gYWN0aW9uIGlzIGRpc3BhdGNoZWQsXG4gICAqIGFuZCBzb21lIHBhcnQgb2YgdGhlIHN0YXRlIHRyZWUgbWF5IHBvdGVudGlhbGx5IGhhdmUgY2hhbmdlZC4gWW91IG1heSB0aGVuXG4gICAqIGNhbGwgYGdldFN0YXRlKClgIHRvIHJlYWQgdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBpbnNpZGUgdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBZb3UgbWF5IGNhbGwgYGRpc3BhdGNoKClgIGZyb20gYSBjaGFuZ2UgbGlzdGVuZXIsIHdpdGggdGhlIGZvbGxvd2luZ1xuICAgKiBjYXZlYXRzOlxuICAgKlxuICAgKiAxLiBUaGUgc3Vic2NyaXB0aW9ucyBhcmUgc25hcHNob3R0ZWQganVzdCBiZWZvcmUgZXZlcnkgYGRpc3BhdGNoKClgIGNhbGwuXG4gICAqIElmIHlvdSBzdWJzY3JpYmUgb3IgdW5zdWJzY3JpYmUgd2hpbGUgdGhlIGxpc3RlbmVycyBhcmUgYmVpbmcgaW52b2tlZCwgdGhpc1xuICAgKiB3aWxsIG5vdCBoYXZlIGFueSBlZmZlY3Qgb24gdGhlIGBkaXNwYXRjaCgpYCB0aGF0IGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzcy5cbiAgICogSG93ZXZlciwgdGhlIG5leHQgYGRpc3BhdGNoKClgIGNhbGwsIHdoZXRoZXIgbmVzdGVkIG9yIG5vdCwgd2lsbCB1c2UgYSBtb3JlXG4gICAqIHJlY2VudCBzbmFwc2hvdCBvZiB0aGUgc3Vic2NyaXB0aW9uIGxpc3QuXG4gICAqXG4gICAqIDIuIFRoZSBsaXN0ZW5lciBzaG91bGQgbm90IGV4cGVjdCB0byBzZWUgYWxsIHN0YXRlcyBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBsaXN0ZW5lciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuXG4gICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgIG5leHRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICBpZiAoIWlzU3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuXG4gICAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgaW5kZXggPSBuZXh0TGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgbmV4dExpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24uIEl0IGlzIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGEgc3RhdGUgY2hhbmdlLlxuICAgKlxuICAgKiBUaGUgYHJlZHVjZXJgIGZ1bmN0aW9uLCB1c2VkIHRvIGNyZWF0ZSB0aGUgc3RvcmUsIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlXG4gICAqIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGdpdmVuIGBhY3Rpb25gLiBJdHMgcmV0dXJuIHZhbHVlIHdpbGxcbiAgICogYmUgY29uc2lkZXJlZCB0aGUgKipuZXh0Kiogc3RhdGUgb2YgdGhlIHRyZWUsIGFuZCB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgKiB3aWxsIGJlIG5vdGlmaWVkLlxuICAgKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvbmx5IHN1cHBvcnRzIHBsYWluIG9iamVjdCBhY3Rpb25zLiBJZiB5b3Ugd2FudCB0b1xuICAgKiBkaXNwYXRjaCBhIFByb21pc2UsIGFuIE9ic2VydmFibGUsIGEgdGh1bmssIG9yIHNvbWV0aGluZyBlbHNlLCB5b3UgbmVlZCB0b1xuICAgKiB3cmFwIHlvdXIgc3RvcmUgY3JlYXRpbmcgZnVuY3Rpb24gaW50byB0aGUgY29ycmVzcG9uZGluZyBtaWRkbGV3YXJlLiBGb3JcbiAgICogZXhhbXBsZSwgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgYHJlZHV4LXRodW5rYCBwYWNrYWdlLiBFdmVuIHRoZVxuICAgKiBtaWRkbGV3YXJlIHdpbGwgZXZlbnR1YWxseSBkaXNwYXRjaCBwbGFpbiBvYmplY3QgYWN0aW9ucyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGFjdGlvbiBBIHBsYWluIG9iamVjdCByZXByZXNlbnRpbmcg4oCcd2hhdCBjaGFuZ2Vk4oCdLiBJdCBpc1xuICAgKiBhIGdvb2QgaWRlYSB0byBrZWVwIGFjdGlvbnMgc2VyaWFsaXphYmxlIHNvIHlvdSBjYW4gcmVjb3JkIGFuZCByZXBsYXkgdXNlclxuICAgKiBzZXNzaW9ucywgb3IgdXNlIHRoZSB0aW1lIHRyYXZlbGxpbmcgYHJlZHV4LWRldnRvb2xzYC4gQW4gYWN0aW9uIG11c3QgaGF2ZVxuICAgKiBhIGB0eXBlYCBwcm9wZXJ0eSB3aGljaCBtYXkgbm90IGJlIGB1bmRlZmluZWRgLiBJdCBpcyBhIGdvb2QgaWRlYSB0byB1c2VcbiAgICogc3RyaW5nIGNvbnN0YW50cyBmb3IgYWN0aW9uIHR5cGVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBGb3IgY29udmVuaWVuY2UsIHRoZSBzYW1lIGFjdGlvbiBvYmplY3QgeW91IGRpc3BhdGNoZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCwgaWYgeW91IHVzZSBhIGN1c3RvbSBtaWRkbGV3YXJlLCBpdCBtYXkgd3JhcCBgZGlzcGF0Y2goKWAgdG9cbiAgICogcmV0dXJuIHNvbWV0aGluZyBlbHNlIChmb3IgZXhhbXBsZSwgYSBQcm9taXNlIHlvdSBjYW4gYXdhaXQpLlxuICAgKi9cbiAgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyW1wiZGVmYXVsdFwiXSkoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG11c3QgYmUgcGxhaW4gb2JqZWN0cy4gJyArICdVc2UgY3VzdG9tIG1pZGRsZXdhcmUgZm9yIGFzeW5jIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtYXkgbm90IGhhdmUgYW4gdW5kZWZpbmVkIFwidHlwZVwiIHByb3BlcnR5LiAnICsgJ0hhdmUgeW91IG1pc3NwZWxsZWQgYSBjb25zdGFudD8nKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEaXNwYXRjaGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VycyBtYXkgbm90IGRpc3BhdGNoIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFJlZHVjZXIoY3VycmVudFN0YXRlLCBhY3Rpb24pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMgPSBuZXh0TGlzdGVuZXJzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWR1Y2VyIGN1cnJlbnRseSB1c2VkIGJ5IHRoZSBzdG9yZSB0byBjYWxjdWxhdGUgdGhlIHN0YXRlLlxuICAgKlxuICAgKiBZb3UgbWlnaHQgbmVlZCB0aGlzIGlmIHlvdXIgYXBwIGltcGxlbWVudHMgY29kZSBzcGxpdHRpbmcgYW5kIHlvdSB3YW50IHRvXG4gICAqIGxvYWQgc29tZSBvZiB0aGUgcmVkdWNlcnMgZHluYW1pY2FsbHkuIFlvdSBtaWdodCBhbHNvIG5lZWQgdGhpcyBpZiB5b3VcbiAgICogaW1wbGVtZW50IGEgaG90IHJlbG9hZGluZyBtZWNoYW5pc20gZm9yIFJlZHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0UmVkdWNlciBUaGUgcmVkdWNlciBmb3IgdGhlIHN0b3JlIHRvIHVzZSBpbnN0ZWFkLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VSZWR1Y2VyKG5leHRSZWR1Y2VyKSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0UmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgbmV4dFJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gYSBzdG9yZSBpcyBjcmVhdGVkLCBhbiBcIklOSVRcIiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCBzbyB0aGF0IGV2ZXJ5XG4gIC8vIHJlZHVjZXIgcmV0dXJucyB0aGVpciBpbml0aWFsIHN0YXRlLiBUaGlzIGVmZmVjdGl2ZWx5IHBvcHVsYXRlc1xuICAvLyB0aGUgaW5pdGlhbCBzdGF0ZSB0cmVlLlxuICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY29tcG9zZSA9IGV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBleHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IGV4cG9ydHMuY3JlYXRlU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfY3JlYXRlU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlU3RvcmUpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJy4vY29tYmluZVJlZHVjZXJzJyk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbWJpbmVSZWR1Y2Vycyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9iaW5kQWN0aW9uQ3JlYXRvcnMnKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmluZEFjdGlvbkNyZWF0b3JzKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL2FwcGx5TWlkZGxld2FyZScpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcHBseU1pZGRsZXdhcmUpO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLypcbiogVGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBmdW5jdGlvbiBuYW1lIGhhcyBiZWVuIGFsdGVyZWQgYnkgbWluaWZpY2F0aW9uLlxuKiBJZiB0aGUgZnVuY3Rpb24gaGFzIGJlZW4gbWluaWZpZWQgYW5kIE5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsIHdhcm4gdGhlIHVzZXIuXG4qL1xuZnVuY3Rpb24gaXNDcnVzaGVkKCkge31cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGlzQ3J1c2hlZC5uYW1lID09PSAnc3RyaW5nJyAmJiBpc0NydXNoZWQubmFtZSAhPT0gJ2lzQ3J1c2hlZCcpIHtcbiAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKCdZb3UgYXJlIGN1cnJlbnRseSB1c2luZyBtaW5pZmllZCBjb2RlIG91dHNpZGUgb2YgTk9ERV9FTlYgPT09IFxcJ3Byb2R1Y3Rpb25cXCcuICcgKyAnVGhpcyBtZWFucyB0aGF0IHlvdSBhcmUgcnVubmluZyBhIHNsb3dlciBkZXZlbG9wbWVudCBidWlsZCBvZiBSZWR1eC4gJyArICdZb3UgY2FuIHVzZSBsb29zZS1lbnZpZnkgKGh0dHBzOi8vZ2l0aHViLmNvbS96ZXJ0b3NoL2xvb3NlLWVudmlmeSkgZm9yIGJyb3dzZXJpZnkgJyArICdvciBEZWZpbmVQbHVnaW4gZm9yIHdlYnBhY2sgKGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzAwMzAwMzEpICcgKyAndG8gZW5zdXJlIHlvdSBoYXZlIHRoZSBjb3JyZWN0IGNvZGUgZm9yIHlvdXIgcHJvZHVjdGlvbiBidWlsZC4nKTtcbn1cblxuZXhwb3J0cy5jcmVhdGVTdG9yZSA9IF9jcmVhdGVTdG9yZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IF9iaW5kQWN0aW9uQ3JlYXRvcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gX2FwcGx5TWlkZGxld2FyZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHdhcm5pbmc7XG4vKipcbiAqIFByaW50cyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIHRyeSB7XG4gICAgLy8gVGhpcyBlcnJvciB3YXMgdGhyb3duIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCB5b3UgY2FuIHVzZSB0aGlzIHN0YWNrXG4gICAgLy8gdG8gZmluZCB0aGUgY2FsbHNpdGUgdGhhdCBjYXVzZWQgdGhpcyB3YXJuaW5nIHRvIGZpcmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cbn0iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLm1hcFtuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycyA/IG9wdGlvbnMuaGVhZGVycyA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzO1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3RcbiAgICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSAmJiAhaW5pdCkge1xuICAgICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMpID8gMjA0IDogeGhyLnN0YXR1c1xuICAgICAgICBpZiAoc3RhdHVzIDwgMTAwIHx8IHN0YXR1cyA+IDU5OSkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIi8vIGV4cG9ydCBjb25zdCBBRERfTUlESV9OT1RFUyA9ICdhZGRfbWlkaV9ub3Rlcydcbi8vIGV4cG9ydCBjb25zdCBDUkVBVEVfTUlESV9OT1RFID0gJ2NyZWF0ZV9taWRpX25vdGUnXG4vLyBleHBvcnQgY29uc3QgQUREX0VWRU5UU19UT19TT05HID0gJ2FkZF9ldmVudHNfdG9fc29uZydcbi8vIGV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFNfVE9fU09ORyA9ICdhZGRfbWlkaV9ldmVudHNfdG9fc29uZydcbi8vIGV4cG9ydCBjb25zdCBBRERfVFJBQ0sgPSAnYWRkX3RyYWNrJ1xuLy8gZXhwb3J0IGNvbnN0IEFERF9QQVJUID0gJ2FkZF9wYXJ0J1xuLy8gZXhwb3J0IGNvbnN0IFVQREFURV9NSURJX05PVEUgPSAndXBkYXRlX21pZGlfbm90ZSdcblxuXG4vLyB0cmFjayBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX1RSQUNLID0gJ2NyZWF0ZV90cmFjaydcbmV4cG9ydCBjb25zdCBBRERfUEFSVFMgPSAnYWRkX3BhcnRzJ1xuZXhwb3J0IGNvbnN0IFNFVF9JTlNUUlVNRU5UID0gJ3NldF9pbnN0cnVtZW50J1xuXG5cbi8vIHNvbmcgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9TT05HID0gJ2NyZWF0ZV9zb25nJ1xuZXhwb3J0IGNvbnN0IEFERF9UUkFDS1MgPSAnYWRkX3RyYWNrcydcbmV4cG9ydCBjb25zdCBBRERfVElNRV9FVkVOVFMgPSAnYWRkX3RpbWVfZXZlbnRzJ1xuZXhwb3J0IGNvbnN0IFVQREFURV9TT05HID0gJ3VwZGF0ZV9zb25nJ1xuZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UUyA9ICdhZGRfbWlkaV9ldmVudHMnXG5cblxuLy8gcGFydCBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX1BBUlQgPSAnY3JlYXRlX3BhcnQnXG5cblxuLy8gbWlkaWV2ZW50IGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfTUlESV9FVkVOVCA9ICdjcmVhdGVfbWlkaV9ldmVudCdcbmV4cG9ydCBjb25zdCBVUERBVEVfTUlESV9FVkVOVCA9ICd1cGRhdGVfbWlkaV9ldmVudCdcblxuXG4vLyBzZXF1ZW5jZXIgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IFNPTkdfUE9TSVRJT04gPSAnc29uZ19wb3NpdGlvbidcbmV4cG9ydCBjb25zdCBQTEFZX1NPTkcgPSAncGxheV9zb25nJ1xuZXhwb3J0IGNvbnN0IFBBVVNFX1NPTkcgPSAncGF1c2Vfc29uZydcbmV4cG9ydCBjb25zdCBTVE9QX1NPTkcgPSAnc3RvcF9zb25nJ1xuZXhwb3J0IGNvbnN0IFNUQVJUX1NDSEVEVUxFUiA9ICdTVEFSVF9TQ0hFRFVMRVInXG5leHBvcnQgY29uc3QgU1RPUF9TQ0hFRFVMRVIgPSAnU1RPUF9TQ0hFRFVMRVInXG5cblxuLy8gaW5zdHJ1bWVudCBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX0lOU1RSVU1FTlQgPSAnY3JlYXRlX2luc3RydW1lbnQnXG5leHBvcnQgY29uc3QgU1RPUkVfU0FNUExFUyA9ICdzdG9yZV9zYW1wbGVzJ1xuXG5cbiIsImltcG9ydCB7Y3JlYXRlU3RvcmUsIGFwcGx5TWlkZGxld2FyZSwgY29tcG9zZX0gZnJvbSAncmVkdXgnXG4vL2ltcG9ydCB0aHVuayBmcm9tICdyZWR1eC10aHVuayc7XG4vL2ltcG9ydCBjcmVhdGVMb2dnZXIgZnJvbSAncmVkdXgtbG9nZ2VyJztcbmltcG9ydCBzZXF1ZW5jZXJBcHAgZnJvbSAnLi9yZWR1Y2VyJ1xuXG5leHBvcnQgY29uc3QgdGVzdCA9IChmdW5jdGlvbigpe1xuICBjb25zb2xlLmxvZygncnVuIG9uY2UnKVxuICByZXR1cm4gJ3Rlc3QnXG59KCkpXG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwKTtcblxuLypcbi8vIGRvbid0IHVzZSB0aGUgcmVkdXggZGV2IHRvb2wgYmVjYXVzZSBpdCB1c2UgdG9vIG11Y2ggQ1BVIGFuZCBtZW1vcnkhXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKTtcbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwLCB7fSwgY29tcG9zZShcbiAgYXBwbHlNaWRkbGV3YXJlKGxvZ2dlciksXG4gIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24gIT09ICd1bmRlZmluZWQnID8gd2luZG93LmRldlRvb2xzRXh0ZW5zaW9uKCkgOiBmID0+IGZcbikpO1xuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0b3JlKCl7XG4gIGNvbnNvbGUubG9nKCdnZXRTdG9yZSgpIGNhbGxlZCcpXG4gIHJldHVybiBzdG9yZVxufVxuXG5cbiIsIlxuaW1wb3J0IHtnZXRBdWRpb0NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbyc7XG5cbmNvbnN0IGNvbnRleHQgPSBnZXRBdWRpb0NvbnRleHQoKVxuXG5sZXQgdGltZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCByZXBldGl0aXZlVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgc2NoZWR1bGVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgdGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgbGFzdFRpbWVTdGFtcDtcblxuZnVuY3Rpb24gaGVhcnRiZWF0KHRpbWVzdGFtcCl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gIC8vIGZvciBpbnN0YW5jZTogdGhlIGNhbGxiYWNrIG9mIHNhbXBsZS51bnNjaGVkdWxlO1xuICBmb3IobGV0IFtrZXksIHRhc2tdIG9mIHRpbWVkVGFza3Mpe1xuICAgIGlmKHRhc2sudGltZSA+PSBub3cpe1xuICAgICAgdGFzay5leGVjdXRlKG5vdyk7XG4gICAgICB0aW1lZFRhc2tzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnVwZGF0ZSgpO1xuICBmb3IobGV0IHRhc2sgb2Ygc2NoZWR1bGVkVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIC8vIGZvciBpbnN0YW5jZTogc29uZy5wdWxzZSgpO1xuICBmb3IobGV0IHRhc2sgb2YgcmVwZXRpdGl2ZVRhc2tzLnZhbHVlcygpKXtcbiAgICB0YXNrKG5vdyk7XG4gIH1cblxuICBsYXN0VGltZVN0YW1wID0gdGltZXN0YW1wO1xuICBzY2hlZHVsZWRUYXNrcy5jbGVhcigpO1xuXG4gIC8vc2V0VGltZW91dChoZWFydGJlYXQsIDEwMDAwKTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShoZWFydGJlYXQpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUYXNrKHR5cGUsIGlkLCB0YXNrKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLnNldChpZCwgdGFzayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXNrKHR5cGUsIGlkKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLmRlbGV0ZShpZCk7XG59XG5cbihmdW5jdGlvbiBzdGFydCgpe1xuICB0YXNrcy5zZXQoJ3RpbWVkJywgdGltZWRUYXNrcyk7XG4gIHRhc2tzLnNldCgncmVwZXRpdGl2ZScsIHJlcGV0aXRpdmVUYXNrcyk7XG4gIHRhc2tzLnNldCgnc2NoZWR1bGVkJywgc2NoZWR1bGVkVGFza3MpO1xuICBoZWFydGJlYXQoKTtcbn0oKSlcbiIsImltcG9ydCB7aW5pdEF1ZGlvfSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7U1RPUkVfU0FNUExFU30gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChjYik6IHZvaWR7XG4gIGluaXRBdWRpbygpLnRoZW4oKGRhdGEpID0+IHtcblxuICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFNUT1JFX1NBTVBMRVMsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIGxvd1RpY2s6IGRhdGEubG93dGljayxcbiAgICAgICAgaGlnaFRpY2s6IGRhdGEuaGlnaHRpY2ssXG4gICAgICB9XG4gICAgfSlcblxuICAgIGNiKHtcbiAgICAgIGxlZ2FjeTogZGF0YS5sZWdhY3ksXG4gICAgICBtcDM6IGRhdGEubXAzLFxuICAgICAgb2dnOiBkYXRhLm9nZ1xuICAgIH0pXG4gIH0pXG5cbn1cblxuXG4iLCIvKlxuICBTZXRzIHVwIHRoZSBiYXNpYyBhdWRpbyByb3V0aW5nLCB0ZXN0cyB3aGljaCBhdWRpbyBmb3JtYXRzIGFyZSBzdXBwb3J0ZWQgYW5kIHBhcnNlcyB0aGUgc2FtcGxlcyBmb3IgdGhlIG1ldHJvbm9tZSB0aWNrcy5cbiovXG5cblxuaW1wb3J0IHNhbXBsZXMgZnJvbSAnLi9zYW1wbGVzJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vdXRpbCdcblxuXG5sZXRcbiAgZGF0YSA9IHt9LFxuICBjb250ZXh0LFxuICBtYXN0ZXJHYWluLFxuICBjb21wcmVzc29yLFxuICBpbml0aWFsaXplZCA9IGZhbHNlXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRBdWRpbygpe1xuXG4gIGlmKGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPT09IHVuZGVmaW5lZCl7XG4gICAgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2FpblxuICB9XG4gIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZihzb3VyY2Uuc3RhcnQgPT09IHVuZGVmaW5lZCl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKClcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDAuNVxuICBpbml0aWFsaXplZCA9IHRydWVcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgcGFyc2VTYW1wbGVzKHNhbXBsZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKVxuICAgICAgICBkYXRhLm9nZyA9IGJ1ZmZlcnMuZW1wdHlPZ2cgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLm1wMyA9IGJ1ZmZlcnMuZW1wdHlNcDMgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2tcbiAgICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2tcbiAgICAgICAgaWYoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSl7XG4gICAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJylcbiAgICAgIH1cbiAgICApXG4gIH0pXG59XG5cblxubGV0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIGlmKHR5cGVvZiBjb250ZXh0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgICAgd2luZG93LkF1ZGlvQ29udGV4dCA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQpXG4gICAgICBjb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHRcbiAgICB9ZWxzZXtcbiAgICAgIC8vQFRPRE86IGNyZWF0ZSBkdW1teSBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlLCBzZWU6IGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL2F1ZGlvLWNvbnRleHRcbiAgICAgIGNvbnRleHQgPSB7XG4gICAgICAgIGNyZWF0ZUdhaW46IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICAgIHJldHVybiBjb250ZXh0XG4gIH1cbiAgcmV0dXJuIGNvbnRleHRcbn1cblxuXG5sZXQgc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWU6IG51bWJlciA9IDAuNSk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpe1xuICAgICAgaWYodmFsdWUgPiAxKXtcbiAgICAgICAgY29uc29sZS5pbmZvKCdtYXhpbWFsIHZvbHVtZSBpcyAxLjAsIHZvbHVtZSBpcyBzZXQgdG8gMS4wJyk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWU7XG4gICAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gICAgc2V0TWFzdGVyVm9sdW1lKHZhbHVlKVxuICB9XG59XG5cblxubGV0IGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGdldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gbWFzdGVyR2Fpbi5nYWluLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRNYXN0ZXJWb2x1bWUoKVxuICB9XG59XG5cblxubGV0IGdldENvbXByZXNzaW9uUmVkdWN0aW9uID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpXG4gIH1cbn1cblxuXG5sZXQgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGVuYWJsZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihmbGFnOiBib29sZWFuKXtcbiAgICAgIGlmKGZsYWcpe1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb21wcmVzc29yKTtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBjb21wcmVzc29yLmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29tcHJlc3Nvci5kaXNjb25uZWN0KDApO1xuICAgICAgICBtYXN0ZXJHYWluLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvcigpXG4gIH1cbn1cblxuXG5sZXQgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyk6IHZvaWR7XG4gIC8qXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIGtuZWU7IC8vIGluIERlY2liZWxzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByYXRpbzsgLy8gdW5pdC1sZXNzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG5cbiAgICAgIEBzZWU6IGh0dHA6Ly93ZWJhdWRpby5naXRodWIuaW8vd2ViLWF1ZGlvLWFwaS8jdGhlLWR5bmFtaWNzY29tcHJlc3Nvcm5vZGUtaW50ZXJmYWNlXG4gICovXG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IgPSBmdW5jdGlvbihjZmc6IHt9KXtcbiAgICAgICh7XG4gICAgICAgIGF0dGFjazogY29tcHJlc3Nvci5hdHRhY2sgPSAwLjAwMyxcbiAgICAgICAga25lZTogY29tcHJlc3Nvci5rbmVlID0gMzAsXG4gICAgICAgIHJhdGlvOiBjb21wcmVzc29yLnJhdGlvID0gMTIsXG4gICAgICAgIHJlZHVjdGlvbjogY29tcHJlc3Nvci5yZWR1Y3Rpb24gPSAwLFxuICAgICAgICByZWxlYXNlOiBjb21wcmVzc29yLnJlbGVhc2UgPSAwLjI1MCxcbiAgICAgICAgdGhyZXNob2xkOiBjb21wcmVzc29yLnRocmVzaG9sZCA9IC0yNCxcbiAgICAgIH0gPSBjZmcpXG4gICAgfVxuICAgIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3IoY2ZnKVxuICB9XG59XG5cbmV4cG9ydCB7Z2V0QXVkaW9Db250ZXh0LCBzZXRNYXN0ZXJWb2x1bWUsIGdldE1hc3RlclZvbHVtZSwgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24sIGVuYWJsZU1hc3RlckNvbXByZXNzb3IsIGNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3J9XG4iLCJpbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7Y3JlYXRlU2FtcGxlfSBmcm9tICcuL3NhbXBsZSdcbmltcG9ydCB7Z2V0QXVkaW9Db250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge1xuICBDUkVBVEVfSU5TVFJVTUVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxuY29uc3QgY29udGV4dCA9IGdldEF1ZGlvQ29udGV4dCgpXG5sZXQgaW5zdHJ1bWVudEluZGV4ID0gMFxuXG5jbGFzcyBJbnN0cnVtZW50e1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcsIHR5cGU6IHN0cmluZyl7XG4gICAgdGhpcy5pZCA9IGlkXG4gICAgdGhpcy50eXBlID0gdHlwZVxuICAgIHRoaXMuc2NoZWR1bGVkID0ge31cbiAgICB0aGlzLnN1c3RhaW5lZCA9IFtdXG4gICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgfVxuXG4gIHByb2Nlc3NNSURJRXZlbnQoZXZlbnQsIHRpbWUsIG91dHB1dCl7XG4gICAgbGV0IHNhbXBsZVxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDE0NCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSBjcmVhdGVTYW1wbGUoLTEsIGV2ZW50KVxuICAgICAgdGhpcy5zY2hlZHVsZWRbZXZlbnQubWlkaU5vdGVJZF0gPSBzYW1wbGVcbiAgICAgIHNhbXBsZS5vdXRwdXQuY29ubmVjdChvdXRwdXQpXG4gICAgICBzYW1wbGUuc3RhcnQodGltZSlcbiAgICAgIC8vY29uc29sZS5sb2coJ3N0YXJ0JywgZXZlbnQubWlkaU5vdGVJZClcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgLy9jb25zb2xlLmxvZygxMjgsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuICAgICAgc2FtcGxlID0gdGhpcy5zY2hlZHVsZWRbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29uc29sZS5lcnJvcignc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIHRoaXMuc3VzdGFpbmVkLnB1c2goZXZlbnQubWlkaU5vdGVJZClcbiAgICAgIH1lbHNle1xuICAgICAgICBzYW1wbGUuc3RvcCh0aW1lLCAoKSA9PiB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkW2V2ZW50Lm1pZGlOb3RlSWRdXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vIHN1c3RhaW4gcGVkYWxcbiAgICAgIGlmKGV2ZW50LmRhdGExID09PSA2NCl7XG4gICAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAxMjcpe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IHRydWVcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIGRvd24nKVxuICAgICAgICAgIC8vZGlzcGF0Y2hFdmVudCh0aGlzLnRyYWNrLnNvbmcsICdzdXN0YWluX3BlZGFsJywgJ2Rvd24nKTtcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICAgIHRoaXMuc3VzdGFpblBlZGFsRG93biA9IGZhbHNlXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWQuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRbbWlkaU5vdGVJZF0uc3RvcChldmVudC50aW1lLCAoKSA9PiB7XG4gICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBtaWRpTm90ZUlkKVxuICAgICAgICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRbbWlkaU5vdGVJZF1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSlcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdXN0YWluIHBlZGFsIHVwJywgdGhpcy5zdXN0YWluZWQpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWQgPSBbXVxuICAgICAgICAgIC8vZGlzcGF0Y2hFdmVudCh0aGlzLnRyYWNrLnNvbmcsICdzdXN0YWluX3BlZGFsJywgJ3VwJyk7XG4gICAgICAgICAgLy90aGlzLnN0b3BTdXN0YWluKHRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgIC8vIHBhbm5pbmdcbiAgICAgIH1lbHNlIGlmKGV2ZW50LmRhdGExID09PSAxMCl7XG4gICAgICAgIC8vIHBhbm5pbmcgaXMgKm5vdCogZXhhY3RseSB0aW1lZCAtPiBub3QgcG9zc2libGUgKHlldCkgd2l0aCBXZWJBdWRpb1xuICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEyLCByZW1hcChkYXRhMiwgMCwgMTI3LCAtMSwgMSkpO1xuICAgICAgICAvL3RyYWNrLnNldFBhbm5pbmcocmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcblxuICAgICAgLy8gdm9sdW1lXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gNyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc3RvcEFsbFNvdW5kcygpe1xuICAgIE9iamVjdC5rZXlzKHRoaXMuc2NoZWR1bGVkKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgICAgdGhpcy5zY2hlZHVsZWRbc2FtcGxlSWRdLnN0b3AoMCwgKCkgPT4ge1xuICAgICAgICBkZWxldGUgdGhpcy5zY2hlZHVsZWRbc2FtcGxlSWRdXG4gICAgICB9KVxuICAgIH0pXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluc3RydW1lbnQodHlwZTogc3RyaW5nKXtcbiAgbGV0IGlkID0gYElOXyR7aW5zdHJ1bWVudEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgaW5zdHJ1bWVudCA9IG5ldyBJbnN0cnVtZW50KGlkLCB0eXBlKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX0lOU1RSVU1FTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBpbnN0cnVtZW50XG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnQge1xuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCh0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSk6IHN0cmluZ3tcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBzb3J0SW5kZXg6IHRpY2tzICsgdHlwZSxcbiAgICAgIGZyZXF1ZW5jeTogNDQwICogTWF0aC5wb3coMiwgKGRhdGExIC0gNjkpIC8gMTIpLFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRNSURJRXZlbnRJZCgpOiBzdHJpbmd7XG4gIHJldHVybiBgTUVfJHttaWRpRXZlbnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1vdmVNSURJRXZlbnQoaWQ6IHN0cmluZywgdGlja3NfdG9fbW92ZTogbnVtYmVyKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgbGV0IGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgbGV0IHRpY2tzID0gZXZlbnQudGlja3MgKyB0aWNrc190b19tb3ZlXG4gIHRpY2tzID0gdGlja3MgPCAwID8gMCA6IHRpY2tzXG4gIC8vY29uc29sZS5sb2codGlja3MsIGV2ZW50LnRpY2tzKVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudFRvKGlkOiBzdHJpbmcsIHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogVVBEQVRFX01JRElfRVZFTlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aWNrcyxcbiAgICAgIHNvcnRJbmRleDogdGlja3MgKyBldmVudC50eXBlXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCJcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgQ1JFQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNSURJTm90ZShpZCwgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpKXtcbiAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbaWRdXG4gIGxldCBldmVudHMgPSBzdGF0ZS5taWRpRXZlbnRzXG4gIGxldCBzdGFydCA9IGV2ZW50c1tub3RlLm5vdGVvbl1cbiAgbGV0IGVuZCA9IGV2ZW50c1tub3RlLm5vdGVvZmZdXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBzdGFydDogc3RhcnQudGlja3MsXG4gICAgICBlbmQ6IGVuZC50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IGVuZC50aWNrcyAtIHN0YXJ0LnRpY2tzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESU5vdGUobm90ZW9uOiBzdHJpbmcsIG5vdGVvZmY6IHN0cmluZyl7XG4gIGxldCBldmVudHMgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvci5taWRpRXZlbnRzXG4gIGxldCBvbiA9IGV2ZW50c1tub3Rlb25dXG4gIGxldCBvZmYgPSBldmVudHNbbm90ZW9mZl1cbiAgaWYob24uZGF0YTEgIT09IG9mZi5kYXRhMSl7XG4gICAgY29uc29sZS5lcnJvcignY2FuXFwndCBjcmVhdGUgTUlESSBub3RlOiBldmVudHMgbXVzdCBoYXZlIHRoZSBzYW1lIGRhdGExIHZhbHVlLCBpLmUuIHRoZSBzYW1lIHBpdGNoJylcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX01JRElfTk9URSxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5vdGVvbixcbiAgICAgIG5vdGVvZmYsXG4gICAgICBzdGFydDogb24udGlja3MsXG4gICAgICBlbmQ6IG9mZi50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IG9mZi50aWNrcyAtIG9uLnRpY2tzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcyxcbiAgcHJldmlvdXNFdmVudDtcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIC8vIGlmKGRpZmZUaWNrcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgLy8gfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cyl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4vKlxuICAgIC8vIG5vdGVvZmYgY29tZXMgYmVmb3JlIG5vdGVvblxuXG4gICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAvLyBpZihhLnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyAgIHJldHVybiAtMVxuICAgICAgLy8gfWVsc2UgaWYoYi50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gMVxuICAgICAgLy8gfVxuICAgICAgLy8gc2hvcnQ6XG5cbiAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgaWYoYS50eXBlID09PSAxNzYgJiYgYi50eXBlID09PSAxNDQpe1xuICAgICAgICByID0gLTFcbiAgICAgIH1cbiAgICAgIHJldHVybiByXG4gICAgfVxuXG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4qL1xuICB9KTtcbiAgZXZlbnQgPSBldmVudHNbMF1cbiAgLy9jb25zb2xlLmxvZyhldmVudClcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gICAgICAgIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljayxldmVudC5taWxsaXNQZXJUaWNrKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGF0YTI7XG4gICAgICAgIG51bVNpeHRlZW50aCA9IGV2ZW50Lm51bVNpeHRlZW50aDtcbiAgICAgICAgdGlja3NQZXJCYXIgPSBldmVudC50aWNrc1BlckJhcjtcbiAgICAgICAgdGlja3NQZXJCZWF0ID0gZXZlbnQudGlja3NQZXJCZWF0O1xuICAgICAgICB0aWNrc1BlclNpeHRlZW50aCA9IGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG5cbiAgICAgICAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrc1xuICAgICAgICB0aWNrICs9IGRpZmZUaWNrc1xuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuXG4gICAgICAgIC8vIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50LmRhdGEyLCBldmVudC5iYXJzQXNTdHJpbmcpXG4gICAgICAgIC8vIH1cblxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpe1xuICBsZXQgbm90ZXMgPSB7fVxuICBsZXQgbm90ZXNJblRyYWNrXG4gIGxldCBuID0gMFxuICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgaWYodHlwZW9mIGV2ZW50LnBhcnRJZCA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIGV2ZW50LnRyYWNrSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBwYXJ0IGFuZC9vciB0cmFjayBzZXQnKVxuICAgICAgY29udGludWVcbiAgICB9XG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdXG4gICAgICBpZih0eXBlb2Ygbm90ZXNJblRyYWNrID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIG5vdGVzSW5UcmFjayA9IG5vdGVzW2V2ZW50LnRyYWNrSWRdID0ge31cbiAgICAgIH1cbiAgICAgIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC50cmFja0lkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBjb3JyZXNwb25kaW5nIG5vdGVvbiBldmVudCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdXG4gICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50XG4gICAgICBpZih0eXBlb2Ygbm90ZU9uID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIC8vY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGVvbiBldmVudCBmb3IgZXZlbnQnLCBldmVudC5pZClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgbGV0IGlkID0gYE1OXyR7bWlkaU5vdGVJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgICAgIG5vdGVPbi5taWRpTm90ZUlkID0gaWRcbiAgICAgIG5vdGVPbi5vZmYgPSBub3RlT2ZmLmlkXG4gICAgICBub3RlT2ZmLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgbm90ZU9mZi5vbiA9IG5vdGVPbi5pZFxuICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgIH1cbiAgfVxuICBPYmplY3Qua2V5cyhub3RlcykuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGRlbGV0ZSBub3Rlc1trZXldXG4gIH0pXG4gIC8vY29uc29sZS5sb2cobm90ZXMsIG5vdGVzSW5UcmFjaylcbn1cblxuXG4vLyBub3QgaW4gdXNlIVxuZXhwb3J0IGZ1bmN0aW9uIGZpbHRlckV2ZW50cyhldmVudHMpe1xuICBsZXQgc3VzdGFpbiA9IHt9XG4gIGxldCB0bXBSZXN1bHQgPSB7fVxuICBsZXQgcmVzdWx0ID0gW11cbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE3NiAmJiBldmVudC5kYXRhMSA9PT0gNjQpe1xuICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDApe1xuICAgICAgICBpZih0eXBlb2Ygc3VzdGFpbltldmVudC50cmFja0lkXSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1lbHNlIGlmKHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09IGV2ZW50LnRpY2tzKXtcbiAgICAgICAgICBkZWxldGUgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cbiAgICAgICAgdG1wUmVzdWx0W2V2ZW50LnRpY2tzXSA9IGV2ZW50XG4gICAgICAgIGRlbGV0ZSBzdXN0YWluW2V2ZW50LnRyYWNrSWRdXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMTI3KXtcbiAgICAgICAgc3VzdGFpbltldmVudC50cmFja0lkXSA9IGV2ZW50LnRpY2tzXG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgfVxuICAgIH1lbHNle1xuICAgICAgcmVzdWx0LnB1c2goZXZlbnQpXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKHN1c3RhaW4pXG4gIE9iamVjdC5rZXlzKHRtcFJlc3VsdCkuZm9yRWFjaChmdW5jdGlvbihrZXkpe1xuICAgIGxldCBzdXN0YWluRXZlbnQgPSB0bXBSZXN1bHRba2V5XVxuICAgIGNvbnNvbGUubG9nKHN1c3RhaW5FdmVudClcbiAgICByZXN1bHQucHVzaChzdXN0YWluRXZlbnQpXG4gIH0pXG4gIHJldHVybiByZXN1bHRcbn1cbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9NSURJX0VWRU5UUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHBhcnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoXG4gIHNldHRpbmdzOiB7XG4gICAgbmFtZTogc3RyaW5nLFxuICAgIHRyYWNrSWQ6IHN0cmluZyxcbiAgICBtaWRpRXZlbnRJZHM6QXJyYXk8c3RyaW5nPixcbiAgICBtaWRpTm90ZUlkczpBcnJheTxzdHJpbmc+LFxuICB9ID0ge31cbil7XG4gIGxldCBpZCA9IGBNUF8ke3BhcnRJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgbWlkaUV2ZW50SWRzID0gW10sXG4gICAgbWlkaU5vdGVJZHMgPSBbXSxcbiAgICB0cmFja0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfUEFSVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBtaWRpRXZlbnRJZHMsXG4gICAgICBtaWRpTm90ZUlkcyxcbiAgICAgIHRyYWNrSWQsXG4gICAgICBtdXRlOiBmYWxzZVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzKHBhcnRfaWQ6IHN0cmluZywgLi4ubWlkaV9ldmVudF9pZHMpe1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHBhcnRfaWQsXG4gICAgICBtaWRpX2V2ZW50X2lkc1xuICAgIH1cbiAgfSlcbn1cbiIsImltcG9ydCB7XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxufSBmcm9tICcuL21pZGlfZXZlbnQnXG5cbmltcG9ydHtcbiAgY3JlYXRlTUlESU5vdGUsXG59IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbn0gZnJvbSAnLi9zb25nJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbn0gZnJvbSAnLi90cmFjaydcblxuaW1wb3J0e1xuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxufSBmcm9tICcuL3BhcnQnXG5cbmltcG9ydCB7XG4gIHBhcnNlTUlESUZpbGVcbn0gZnJvbSAnLi9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgc29uZ0Zyb21NSURJRmlsZVxufSBmcm9tICcuL3NvbmdfZnJvbV9taWRpZmlsZSdcblxuaW1wb3J0IHtcbiAgaW5pdCxcbn0gZnJvbSAnLi9pbml0J1xuXG5pbXBvcnQge1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcbn0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzAuMC4xJyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuXG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgY3JlYXRlTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBjcmVhdGVUcmFjayxcbiAgYWRkUGFydHMsXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcblxuICBwYXJzZU1JRElGaWxlLFxuICBzb25nRnJvbU1JRElGaWxlLFxuXG4gIGxvZzogZnVuY3Rpb24oaWQpe1xuICAgIGlmKGlkID09PSAnZnVuY3Rpb25zJyl7XG4gICAgICBjb25zb2xlLmxvZyhgZnVuY3Rpb25zOlxuICAgICAgICBjcmVhdGVNSURJRXZlbnRcbiAgICAgICAgbW92ZU1JRElFdmVudFxuICAgICAgICBtb3ZlTUlESUV2ZW50VG9cbiAgICAgICAgY3JlYXRlTUlESU5vdGVcbiAgICAgICAgY3JlYXRlU29uZ1xuICAgICAgICBhZGRUcmFja3NcbiAgICAgICAgY3JlYXRlVHJhY2tcbiAgICAgICAgYWRkUGFydHNcbiAgICAgICAgY3JlYXRlUGFydFxuICAgICAgICBhZGRNSURJRXZlbnRzXG4gICAgICBgKVxuICAgIH1cbiAgfVxufVxuXG4vLyBzdGFuZGFyZCBNSURJIGV2ZW50c1xuLy9jb25zdCBNSURJID0ge31cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ05PVEVfT0ZGJywge3ZhbHVlOiAweDgwfSk7IC8vMTI4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSk7IC8vMTQ0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQT0xZX1BSRVNTVVJFJywge3ZhbHVlOiAweEEwfSk7IC8vMTYwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDT05UUk9MX0NIQU5HRScsIHt2YWx1ZTogMHhCMH0pOyAvLzE3NlxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KTsgLy8xOTJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0NIQU5ORUxfUFJFU1NVUkUnLCB7dmFsdWU6IDB4RDB9KTsgLy8yMDhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BJVENIX0JFTkQnLCB7dmFsdWU6IDB4RTB9KTsgLy8yMjRcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KTsgLy8yNDBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ01JRElfVElNRUNPREUnLCB7dmFsdWU6IDI0MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU09OR19QT1NJVElPTicsIHt2YWx1ZTogMjQyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUVU5FX1JFUVVFU1QnLCB7dmFsdWU6IDI0Nn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnRU9YJywge3ZhbHVlOiAyNDd9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTVEFSVCcsIHt2YWx1ZTogMjUwfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDT05USU5VRScsIHt2YWx1ZTogMjUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTVE9QJywge3ZhbHVlOiAyNTJ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0FDVElWRV9TRU5TSU5HJywge3ZhbHVlOiAyNTR9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NZU1RFTV9SRVNFVCcsIHt2YWx1ZTogMjU1fSk7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RJTUVfU0lHTkFUVVJFJywge3ZhbHVlOiAweDU4fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdFTkRfT0ZfVFJBQ0snLCB7dmFsdWU6IDB4MkZ9KTtcblxuZXhwb3J0IGRlZmF1bHQgcWFtYmlcblxuZXhwb3J0IHtcbiAgLy8gZnJvbSAuL2luaXRcbiAgaW5pdCxcblxuICAvLyBmcm9tIC4vaW5pdF9hdWRpb1xuICBnZXRBdWRpb0NvbnRleHQsXG4gIGdldE1hc3RlclZvbHVtZSxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbi8vICBNSURJLFxuXG4gIHBhcnNlTUlESUZpbGUsXG4gIHNvbmdGcm9tTUlESUZpbGUsXG59XG4iLCJpbXBvcnQge2NvbWJpbmVSZWR1Y2Vyc30gZnJvbSAncmVkdXgnXG5pbXBvcnQge1xuICAvLyBmb3IgZWRpdG9yXG4gIENSRUFURV9TT05HLFxuICBDUkVBVEVfVFJBQ0ssXG4gIENSRUFURV9QQVJULFxuICBBRERfUEFSVFMsXG4gIEFERF9UUkFDS1MsXG4gIEFERF9NSURJX05PVEVTLFxuICBBRERfTUlESV9FVkVOVFMsXG4gIEFERF9USU1FX0VWRU5UUyxcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIENSRUFURV9NSURJX05PVEUsXG4gIEFERF9FVkVOVFNfVE9fU09ORyxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX05PVEUsXG4gIFVQREFURV9TT05HLFxuICBTRVRfSU5TVFJVTUVOVCxcblxuICAvLyBmb3Igc2VxdWVuY2VyIG9ubHlcbiAgU09OR19QT1NJVElPTixcbiAgU1RBUlRfU0NIRURVTEVSLFxuICBTVE9QX1NDSEVEVUxFUixcblxuICAvLyBmb3IgaW5zdHJ1bWVudCBvbmx5XG4gIENSRUFURV9JTlNUUlVNRU5ULFxuICBTVE9SRV9TQU1QTEVTLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICBzb25nczoge30sXG4gIHRyYWNrczoge30sXG4gIHBhcnRzOiB7fSxcbiAgbWlkaUV2ZW50czoge30sXG4gIG1pZGlOb3Rlczoge30sXG59XG5cblxuZnVuY3Rpb24gZWRpdG9yKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pe1xuXG4gIGxldFxuICAgIGV2ZW50LCBldmVudElkLFxuICAgIHNvbmcsIHNvbmdJZCxcbiAgICBtaWRpRXZlbnRzXG5cbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgQ1JFQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9UUkFDSzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIENSRUFURV9QQVJUOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5wYXJ0c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9FVkVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaUV2ZW50c1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5taWRpTm90ZXNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1RSQUNLUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc29uZ0lkID0gYWN0aW9uLnBheWxvYWQuc29uZ19pZFxuICAgICAgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdJZF1cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBsZXQgdHJhY2tJZHMgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZHNcbiAgICAgICAgdHJhY2tJZHMuZm9yRWFjaChmdW5jdGlvbih0cmFja0lkKXtcbiAgICAgICAgICBsZXQgdHJhY2sgPSBzdGF0ZS50cmFja3NbdHJhY2tJZF1cbiAgICAgICAgICBpZih0cmFjayl7XG4gICAgICAgICAgICBzb25nLnRyYWNrSWRzLnB1c2godHJhY2tJZClcbiAgICAgICAgICAgIHRyYWNrLnNvbmdJZCA9IHNvbmdJZFxuICAgICAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IFtdXG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24ocGFydElkKXtcbiAgICAgICAgICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICAgICAgICAgIHNvbmcucGFydElkcy5wdXNoKHBhcnRJZClcbiAgICAgICAgICAgICAgbWlkaUV2ZW50SWRzLnB1c2goLi4ucGFydC5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaCguLi5taWRpRXZlbnRJZHMpXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHRyYWNrIHdpdGggaWQgJHt0cmFja0lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9QQVJUUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHRyYWNrSWQgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZFxuICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIC8vdHJhY2sucGFydHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5wYXJ0X2lkcylcbiAgICAgICAgbGV0IHBhcnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkc1xuICAgICAgICBwYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbaWRdXG4gICAgICAgICAgaWYocGFydCl7XG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBwYXJ0LnRyYWNrSWQgPSB0cmFja0lkXG4gICAgICAgICAgICBwYXJ0Lm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgICAgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICAgICAgICAgICAgICBldmVudC50cmFja0lkID0gdHJhY2tJZFxuICAgICAgICAgICAgICBldmVudC5pbnN0cnVtZW50SWQgPSB0cmFjay5pbnN0cnVtZW50SWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHBhcnQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgZm91bmQgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX01JRElfRVZFTlRTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgcGFydElkID0gYWN0aW9uLnBheWxvYWQucGFydF9pZFxuICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5wYXJ0c1twYXJ0SWRdXG4gICAgICBpZihwYXJ0KXtcbiAgICAgICAgLy9wYXJ0Lm1pZGlFdmVudHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkcylcbiAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IGFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzXG4gICAgICAgIG1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgbWlkaUV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgICAgICAgICBpZihtaWRpRXZlbnQpe1xuICAgICAgICAgICAgcGFydC5taWRpRXZlbnRJZHMucHVzaChpZClcbiAgICAgICAgICAgIG1pZGlFdmVudC5wYXJ0SWQgPSBwYXJ0SWRcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7aWR9YClcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBwYXJ0IGZvdW5kIHdpdGggaWQgJHtwYXJ0SWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX01JRElfRVZFTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGV2ZW50SWQgPSBhY3Rpb24ucGF5bG9hZC5pZFxuICAgICAgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50SWRdO1xuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICAoe1xuICAgICAgICAgIHRpY2tzOiBldmVudC50aWNrcyA9IGV2ZW50LnRpY2tzLFxuICAgICAgICAgIGRhdGExOiBldmVudC5kYXRhMSA9IGV2ZW50LmRhdGExLFxuICAgICAgICAgIGRhdGEyOiBldmVudC5kYXRhMiA9IGV2ZW50LmRhdGEyLFxuICAgICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgY29uc29sZS53YXJuKGBubyBNSURJIGV2ZW50IGZvdW5kIHdpdGggaWQgJHtldmVudElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBub3RlID0gc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXTtcbiAgICAgICh7XG4gICAgICAgIC8vIGlmIHRoZSBwYXlsb2FkIGhhcyBhIHZhbHVlIGZvciAnc3RhcnQnIGl0IHdpbGwgYmUgYXNzaWduZWQgdG8gbm90ZS5zdGFydCwgb3RoZXJ3aXNlIG5vdGUuc3RhcnQgd2lsbCBrZWVwIGl0cyBjdXJyZW50IHZhbHVlXG4gICAgICAgIHN0YXJ0OiBub3RlLnN0YXJ0ID0gbm90ZS5zdGFydCxcbiAgICAgICAgZW5kOiBub3RlLmVuZCA9IG5vdGUuZW5kLFxuICAgICAgICBkdXJhdGlvblRpY2tzOiBub3RlLmR1cmF0aW9uVGlja3MgPSBub3RlLmR1cmF0aW9uVGlja3NcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgVVBEQVRFX1NPTkc6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX07XG4gICAgICAoe3NvbmdfaWQ6IHNvbmdJZCwgbWlkaV9ldmVudHM6IG1pZGlFdmVudHN9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ0lkXVxuICAgICAgc29uZy5taWRpRXZlbnRJZHMgPSBbXVxuICAgICAgbWlkaUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgLy8gcHV0IG1pZGkgZXZlbnQgaWRzIGluIGNvcnJlY3Qgb3JkZXJcbiAgICAgICAgc29uZy5taWRpRXZlbnRJZHMucHVzaChldmVudC5pZClcbiAgICAgICAgLy8gcmVwbGFjZSBldmVudCB3aXRoIHVwZGF0ZWQgZXZlbnRcbiAgICAgICAgc3RhdGUubWlkaUV2ZW50c1tldmVudC5pZF0gPSBldmVudDtcbiAgICAgIH0pXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNFVF9JTlNUUlVNRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9O1xuICAgICAgc3RhdGUudHJhY2tzW2FjdGlvbi5wYXlsb2FkLnRyYWNrSWRdLmluc3RydW1lbnRJZCA9IGFjdGlvbi5wYXlsb2FkLmluc3RydW1lbnRJZFxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlXG59XG5cbi8vIHN0YXRlIHdoZW4gYSBzb25nIGlzIHBsYXlpbmdcbmZ1bmN0aW9uIHNlcXVlbmNlcihzdGF0ZSA9IHtzb25nczoge319LCBhY3Rpb24pe1xuICBzd2l0Y2goYWN0aW9uLnR5cGUpe1xuXG4gICAgY2FzZSBVUERBVEVfU09ORzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0gPSB7XG4gICAgICAgIHNvbmdJZDogYWN0aW9uLnBheWxvYWQuc29uZ19pZCxcbiAgICAgICAgbWlkaUV2ZW50czogYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudHMsXG4gICAgICAgIHNldHRpbmdzOiBhY3Rpb24ucGF5bG9hZC5zZXR0aW5ncyxcbiAgICAgICAgcGxheWluZzogZmFsc2UsXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNUQVJUX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0uc2NoZWR1bGVyID0gYWN0aW9uLnBheWxvYWQuc2NoZWR1bGVyXG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXS5wbGF5aW5nID0gdHJ1ZVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTVE9QX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgZGVsZXRlIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnNjaGVkdWxlclxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ19pZF0ucGxheWluZyA9IGZhbHNlXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNPTkdfUE9TSVRJT046XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnBvc2l0aW9uID0gYWN0aW9uLnBheWxvYWQucG9zaXRpb25cbiAgICAgIGJyZWFrXG5cblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cbmZ1bmN0aW9uIGd1aShzdGF0ZSA9IHt9LCBhY3Rpb24pe1xuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gaW5zdHJ1bWVudHMoc3RhdGUgPSB7fSwgYWN0aW9uKXtcbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcbiAgICBjYXNlIENSRUFURV9JTlNUUlVNRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZVthY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZC5pbnN0cnVtZW50XG4gICAgICAvL3N0YXRlID0gey4uLnN0YXRlLCAuLi57W2FjdGlvbi5wYXlsb2FkLmlkXTogYWN0aW9uLnBheWxvYWQuaW5zdHJ1bWVudH19XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBTVE9SRV9TQU1QTEVTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBjb25zb2xlLmxvZyhhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5jb25zdCBzZXF1ZW5jZXJBcHAgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBndWksXG4gIGVkaXRvcixcbiAgc2VxdWVuY2VyLFxuICBpbnN0cnVtZW50cyxcbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyQXBwXG4iLCJcbmltcG9ydCB7Z2V0QXVkaW9Db250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8uanMnO1xuXG5jb25zdCBjb250ZXh0ID0gZ2V0QXVkaW9Db250ZXh0KClcblxuY2xhc3MgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBpZihzYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAvLyBjcmVhdGUgc2ltcGxlIHN5bnRoIHNhbXBsZVxuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICAgIHRoaXMuc291cmNlLnR5cGUgPSAnc2luZSc7XG4gICAgICB0aGlzLnNvdXJjZS5mcmVxdWVuY3kudmFsdWUgPSBldmVudC5mcmVxdWVuY3lcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5kO1xuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UpO1xuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKTtcbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2I7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKC4uLmFyZ3Mpe1xuICByZXR1cm4gbmV3IFNhbXBsZSguLi5hcmdzKTtcbn1cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJlbXB0eU9nZ1wiOiBcIlQyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz1cIixcbiAgXCJlbXB0eU1wM1wiOiBcIi8vc1F4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlU9XCIsXG4gIFwiaGlnaHRpY2tcIjogXCJVa2xHUmtRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVNBRkFBQ3gveGYvZEFET0FDd0JzUDNwKzZIK3pBR29CT2tDQ3dCWC9FSDVPdnhsQTRrSjJ3Y1NBclQ5RS91dCtIVDJldlV4OThuNk9BRjVDQ1VNd1F2ZkNPc0p4QXgwRFNJTUVBcTlCaUFCM3ZoejdtTGtUOXNSMTMzWXhOMnM1UUx2MHZyVUJud1JueHVRSmVFc1NEQ2lNZDh5RlM4YUtGSWhvaFVzQ0tqNjR1NjI1T3JhQTlIdXlQbkVsY1Ard3h2Sld0VzI1NjM3VlEwakhQZ25CVERETTFvMEN6S0xLKzhoemhnRkRPejhTZTRKNDdEWVZ0RzB6NWZRcTlMQjEycmZBK2o5OXJvSEFoZWxJeU13SWpkVE91VThtandJT0dveGhDYjVFNTMvaiszazMvZlRZOHBUdzR5L1RyK2V3OERNdmRzazhSY0hSUmtTS080eUdUa0hQa1Uvcnp6eU5jZ3NyUjk0RHAvNXIrWnMxN3pPbmNvRHhoZkUzOFdMeW4vVGVPTWk5cjBJUnhsUktJUXp5VGxPUEtvOXlqbVdNY29rRFJMYy9ZN3J1ZHRkenUvRDJMMUl1KzI3SmNHM3lZclZMdWpsKzNVT1p4MVVLNVEwcXptTlBEazhaamVlTVBvanpoSCsvakx0UGQ1bTBoSExIc1lJdzVURU1NbkEwanZqOGZTT0Jpd1hBU1pnTXpNOGRVQkdRYkkrcnpqcEtrSVp5Z1pUOVFmbGNkYVJ5cVhDejcrVndVUEg3ODRyM0s3cyt2MEtEdThidnllTE1iNDNOanJoT0lvMGRTdlFIaTBQblA2aTdvdmczTlR4eTQvR2Y4WDh5SC9RQnR2WDU1UDJZZ2IwRmNVanN5NExObUk1ZWppWE0zOHI3aUM4Rkp3SFB2b2s3ZERnUWRhSnpsVEtJc29GenNyVmt1QTg3ZC82cUFpN0ZRMGg5Q2xLTUxFejNUT3JNQmNxWVNEOEU5QUZkL2RTNmtUZjZkYlUwWG5RdjlJSDJNWGZaK2xuOURFQUZ3d2RGeThnaWliNkthd3FlQ2hnSS9VYkhCT1RDWmovdnZYZTdJbmxGdUROM1AzYjBkMUY0Z3pwaWZHMit1NEQ3UXcxRmZ3Ym5DRCtJbGdqV3lITEhQTVZvZzJtQkwzN3F2UCs3TnZuWXVUdjRydmpmdWJONmszd3BQWjAvV2tFT3d0aUVVc1djeG0rR2w0YU9oaGlGREFQSXdtYkF0bjdUUFZ5Nzd6cWNlZnI1WUhtSHVsbDdlbnlmUG1jQUhnSGV3MVJFcjhWaGhkL0YrQVYxUkowRGlrSldRTmMvWlAzZWZLZDdodnMydXI0NnJIczV1OGU5Ti80OC8waEEvOEhGZ3d1RDA0UlNCSVJFcXNRT2c3bUNzc0dNQUpXL1huNEcvVEs4TGJ1enUwSTdxVHZuUEp5OXNYNmJQODRCTFlJYkF3ZEQ4NFFZeEc3RU9jT0RBeHdDRk1FQVFDOSs3UDNTdlRYOFhIdyt1OVI4S1R4SXZTbzkrWDdWUUNVQkowSU13emlEajRRTGhBR0Q5VU1yZ25UQlpjQlJ2MXYrWHYyVWZTKzh0ZngrdkVTODd6MCt2YjMrWmY5WmdFUUJTRUlVQXJXQzhrTTJReXpDNUVKRUFkdkJIZ0JYUDVuKytyNEF2ZDg5V2owN2ZNdzlEMzFKdmZwK1VqOXhRRDlBOFFHNVFoWENsRUxyQXN2Qzl3SjdnZDZCV0lDM3Y2Tys3VDRQUFpOOUVIeld2TmY5UHoxRnZpdCtxTDlyUUNIQXdFRy93ZUNDWlVLRnd2RENuSUpjQWNRQldjQ2FmOFovQ0Q1NXZhQjlkRDB3UFNQOVVMM20vazcvTXorSndFeUF3OEZ6QVk3Q0JzSmFRazVDV2tJMmdhdEJDSUNZZitqL0ZyNnZmaVY5ODcyc2ZaUDkxejRwL2xSKzNIOXpmODlBcm9FRkFmakNQMEpjd284Q2pBSmRRZGdCU0VEa2dEUS9WajdaZm5SOTVUMjhmVWQ5djMyVnZnMituYjgrLzZ4QVdvRTRBYkRDUDRKcEFxYkNxUUowd2VFQmZnQ1RBQ1QvUjM3TS9tKzk2NzJJUFk2OWdiM2FmaFcrdFQ4cWYrTUFqMEZnZ2N1Q1NjS1hBcmlDY01JRUFmeUJKWUNGd0NQL1J6N0EvbDc5M3oyRi9abjltSDM3ZmpkK2kzOXlmOXBBdDBFRkFmUkNOa0pHQXFyQ1pZSXZnWlBCSjhCNlA0Ly9NMzUwdmR6OXEvMWxmVXE5bXozUlBtaSszSCtiZ0ZWQk9RRzN3Z0hDa3dLMEFtN0NDQUhDZ1dtQWpBQVwiLFxuICBcImxvd3RpY2tcIjogXCJVa2xHUmxRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVRBRkFBQjAvNXYrVS80VC8zZ0Ewd0ZUQXVVQitmOGQvblQ5MGYxcS91Yit0ZjQ2L21iLzh3RlFBOWdDN3dDZC9tcitGQUdSQTNjRTZ3SmYvaDM2ZXZtdis4di9Od1JIQlpVQzIvNjArLy81RXZ1Wi9hWC9iZ0ZPQXA4QXp2emg5d2Z6TFBGNjh6VDR5LzJCQXlnSWZRd2FFallZMHgzMUlyd2w4U09XSFZFU09nUGg5TmZwUmVGdDIybllIZGREMkJYY1plRGE1SW5xZ1BEeDluUCs2Z1M0Q0JZTG53MHpFUzBXWHh2NEhrY2dMaC8xRytFWDFSTnBENHdLaWdYSC82cjUvZk51N2xUcGorWnU1aEhvWE90TDcxYnlyL1FwOTFMNjR2Nk9CTzRKb1E1ekVza1UraFUxRmlRVmVSUDdFV2dQNFFyMEJJVCt0UGlkOUMzeTF2Q2g4RkR4SnZLMjh2dnl5L0xBOHBMelUvWFA5NXY2eHZ3NC91RC9SQUsyQlNrS2NnNkJFU2NUWkJNZUVxa1BUUXhqQ0tFRVZ3RmkvbnY3aC9ocDlhRHlBdkhQOE1meEx2TSs5UFgwdVBXMTlnLzRMZnI3L0M0QUtnTmFCWFFHeXdiMEJoSUhXUWZXQjFvSXpBanRDRjhJSHdkdEJha0RWd0tMQWVZQTh2OXcva2o4MS9uUTk0djI5L1hYOWJ6MWJQVVk5VXoxWi9hSCtIcjd5UDRNQWk0Rit3Y2ZDbllMTmd5ZkRQc01TdzBzRFVBTWZncmNCNUlFTXdGYi9pWDhUL3BUK08vMVgvTWY4Y2J2ck8rMThNTHl2ZlZQK1JmOXdnQW9CQ0VIcHduSUM1RU40UTVBRDN3TzFBeTBDcHNJdndidkJOY0NiUUFyL25YOE9mc2YrdmI0bXZkYTlyajF6L1dYOXBMM2EvaEgrWlg2Ui93bi92UC9lUUVTQS9BRSt3WURDY3dLRkF5UERDa01GUXVTQ2U0SFZRYlNCSFFEQ3dJOEFOTDlKUHVZK0hYMjh2VHE4MlB6ZFBNVjlBejFNZlo0OXpENWdmdHgvc1FCQlFYTEI4Y0ovZ3FwQ3c4TWlnd1dEWEVOWFEyckREVUw3UWdEQnN3Q2R2OFMvSzc0V1BWazhoWHdvdTRQN212dTErOVQ4cHoxVXZsaS9ab0J3Z1dSQ2NzTVBnL0NFRVFSNFJEQUR3b085d3VzQ1ZNSDRBUlNBcG4vdWZ6ZCtXajNidlg3OHh6engvTDY4cXp6MXZTRDlxWDRHZnZkL2MwQWh3Ty9CV3dIbWdodkNRRUtWUW9uQ2xzSkN3aUlCaDBGMGdPZ0FtMEJPd0F4LzAzK1hQMGcvTGI2Y1BtWCtGLzR2ZmgrK1RINnMvb3MrNy83Y3Z3TC9aejlYUDVPLzNJQTNBRjlBenNGOWdhVUNBQUtIZ3VlQ3pjTDl3bnRCM3NGNHdJekFJMzk2ZnAxK0d2Mkl2V245TjMwcC9YaTltNzRHL3J1KzlQOWsvOGFBWUVDMUFNVEJTSUcwd1l1QjFnSGtnY0FDR0VJU0FoVEJ6RUZXQUt0LzVMOTJmdVUrdlg1MGZtZitTUDVpL2diK0JmNG12aXYrU3I3a3Z5Yi9VaityLzRYLzhyLytnQ2lBbzBFVUFhUkJ6d0lTd2pxQjNJSEdRZkNCdjhGcGdUTUFwUUFLZjY3KzVuNS92Zm45anoyeVBWbjlTTDFSUFhxOVNQM0R2bXIrNmYrc1FHS0JBY0grd2hPQ2gwTGF3czNDMjhLTEFtREI1QUZmUU5vQVZQL1p2M2UrN1A2c2ZuTCtDdjR2UGVNOTViMzdmZVYrSm41MVBvcS9MTDltditZQVZZRDNnUXVCbWNIU0Fpa0NJRUk3QWYrQnVFRm5nUVhBMXNCdi85di9wZjlNUDNXL0ZqOHEvc1IrNkg2VS9vMyttUDZ5L3BOKy9mN3h2eWUvV0grSmY5bUFENENRQVFKQmlzSHRnZjZCdzBJOFFkc0Ixc0d5d1Q0QWdnQkNQL28vS1g2bVBnMTk1NzJqZmF6OXVmMlMvY00rRTM1RS90Vy9hZi81d0gxQThBRktnZmtCL0FIZ3dmeEJsQUdnUVZJQk1NQ0p3R3MvNDMrdlAwaS9acjhMZnpsKzlINzZmdmkrOWY3NWZzZi9JbjhCUDEwL2VqOWNmNE8vN2YvZEFBY0FhVUJFZ0tNQWhnRHBBTUVCQ0VFRHdUZkEzSUR4UUw4QVNvQlV3Q0cvODcrSi82aC9ScjlwUHhrL0diOG9Qd0ovWEg5dy8zOS9VRCtxUDQxLzlEL1d3RGVBR3NCQWdLZEFoRURRUU5BQTBzRGJ3T1ZBNVlEVndQT0FoZ0NWQUdSQUE9PVwiLFxufSIsIlxuY29uc3QgQlVGRkVSX1RJTUUgPSA0MDAgLy8gbWlsbGlzXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlcntcblxuICBjb25zdHJ1Y3RvcihkYXRhKXtcbiAgICAoe1xuICAgICAgc29uZ19pZDogdGhpcy5zb25nSWQsXG4gICAgICBzdGFydF9wb3NpdGlvbjogdGhpcy5zb25nU3RhcnRQb3NpdGlvbixcbiAgICAgIHRpbWVTdGFtcDogdGhpcy50aW1lU3RhbXAsXG4gICAgICBtaWRpRXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgIGluc3RydW1lbnRzOiB0aGlzLmluc3RydW1lbnRzLFxuICAgICAgcGFydHM6IHRoaXMucGFydHMsXG4gICAgICB0cmFja3M6IHRoaXMudHJhY2tzLFxuICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgYmFyczogdGhpcy5iYXJzLFxuICAgICAgICBsb29wOiB0aGlzLmxvb3BcbiAgICAgIH1cbiAgICB9ID0gZGF0YSlcbiAgICB0aGlzLm51bUV2ZW50cyA9IHRoaXMuZXZlbnRzLmxlbmd0aFxuICAgIHRoaXMuaW5kZXggPSAwXG4gICAgdGhpcy5zZXRJbmRleCh0aGlzLnNvbmdTdGFydFBvc2l0aW9uKVxuICB9XG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIGxldCBldmVudHMgPSBbXVxuICAgIC8vIG1haW4gbG9vcFxuICAgIGZvcihsZXQgaSA9IHRoaXMuaW5kZXg7IGkgPCB0aGlzLm51bUV2ZW50czsgaSsrKXtcbiAgICAgIGxldCBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5tYXh0aW1lKXtcblxuICAgICAgICAvL2V2ZW50LnRpbWUgPSB0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0UG9zaXRpb247XG5cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5kZXgrKztcbiAgICAgIH1lbHNle1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGV2ZW50cztcbiAgfVxuXG5cbiAgdXBkYXRlKHBvc2l0aW9uKXtcbiAgICB2YXIgaSxcbiAgICAgIGV2ZW50LFxuICAgICAgbnVtRXZlbnRzLFxuICAgICAgZXZlbnRzLFxuICAgICAgaW5zdHJ1bWVudFxuXG4gICAgdGhpcy5tYXh0aW1lID0gcG9zaXRpb24gKyBCVUZGRVJfVElNRVxuICAgIGV2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzKClcbiAgICBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoXG5cbiAgICBmb3IoaSA9IDA7IGkgPCBudW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IGV2ZW50c1tpXVxuICAgICAgaW5zdHJ1bWVudCA9IHRoaXMuaW5zdHJ1bWVudHNbZXZlbnQuaW5zdHJ1bWVudElkXVxuXG4gICAgICBpZih0eXBlb2YgaW5zdHJ1bWVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZih0aGlzLnBhcnRzW2V2ZW50LnBhcnRJZF0ubXV0ZSA9PT0gdHJ1ZSB8fCB0aGlzLnRyYWNrc1tldmVudC50cmFja0lkXS5tdXRlID09PSB0cnVlIHx8IGV2ZW50Lm11dGUgPT09IHRydWUpe1xuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICBpZigoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkgJiYgdHlwZW9mIGV2ZW50Lm1pZGlOb3RlSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy8gdGhpcyBpcyB1c3VhbGx5IGNhdXNlZCBieSB0aGUgc2FtZSBub3RlIG9uIHRoZSBzYW1lIHRpY2tzIHZhbHVlLCB3aGljaCBpcyBwcm9iYWJseSBhIGJ1ZyBpbiB0aGUgbWlkaSBmaWxlXG4gICAgICAgIGNvbnNvbGUuaW5mbygnbm8gbWlkaU5vdGVJZCcsIGV2ZW50KVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyBkZWJ1ZyBtaW51dGVfd2FsdHogZG91YmxlIGV2ZW50c1xuICAgICAgLy8gaWYoZXZlbnQudGlja3MgPiA0MDMwMCl7XG4gICAgICAvLyAgIGNvbnNvbGUuaW5mbyhldmVudClcbiAgICAgIC8vIH1cblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkXG4gICAgICB9ZWxzZSBpZihpbnN0cnVtZW50LnR5cGUgPT09ICdleHRlcm5hbCcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZDogcm91dGUgdG8gZXh0ZXJuYWwgbWlkaSBpbnN0cnVtZW50XG4gICAgICB9ZWxzZXtcbiAgICAgICAgbGV0IHRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uKVxuICAgICAgICB0aW1lIC89IDEwMDAgLy8gY29udmVydCB0byBzZWNvbmRzIGJlY2F1c2UgdGhlIGF1ZGlvIGNvbnRleHQgdXNlcyBzZWNvbmRzIGZvciBzY2hlZHVsaW5nXG4gICAgICAgIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudChldmVudCwgdGltZSwgdGhpcy50cmFja3NbZXZlbnQudHJhY2tJZF0ub3V0cHV0KVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBlbmQgb2Ygc29uZ1xuICB9XG5cblxuICBzdG9wQWxsU291bmRzKCl7XG4gICAgT2JqZWN0LmtleXModGhpcy5pbnN0cnVtZW50cykuZm9yRWFjaCgoaW5zdHJ1bWVudElkKSA9PiB7XG4gICAgICBpZihpbnN0cnVtZW50SWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgdGhpcy5pbnN0cnVtZW50c1tpbnN0cnVtZW50SWRdLnN0b3BBbGxTb3VuZHMoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxufVxuXG4iLCIvL0AgZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7cGFyc2VUaW1lRXZlbnRzLCBwYXJzZUV2ZW50cywgcGFyc2VNSURJTm90ZXMsIGZpbHRlckV2ZW50c30gZnJvbSAnLi9wYXJzZV9ldmVudHMnXG5pbXBvcnQge2dldE1JRElFdmVudElkfSBmcm9tICcuL21pZGlfZXZlbnQnXG5pbXBvcnQge2FkZFRhc2ssIHJlbW92ZVRhc2t9IGZyb20gJy4vaGVhcnRiZWF0J1xuaW1wb3J0IHtnZXRBdWRpb0NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge1xuICBDUkVBVEVfU09ORyxcbiAgQUREX1RSQUNLUyxcbiAgVVBEQVRFX1NPTkcsXG4gIFNPTkdfUE9TSVRJT04sXG4gIEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICBTVEFSVF9TQ0hFRFVMRVIsXG4gIFNUT1BfU0NIRURVTEVSLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcbmltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmNvbnN0IGNvbnRleHQgPSBnZXRBdWRpb0NvbnRleHQoKVxubGV0IHNvbmdJbmRleCA9IDBcblxuY29uc3QgZGVmYXVsdFNvbmcgPSB7XG4gIHBwcTogOTYwLFxuICBicG06IDEyMCxcbiAgYmFyczogMzAsXG4gIGxvd2VzdE5vdGU6IDAsXG4gIGhpZ2hlc3ROb3RlOiAxMjcsXG4gIG5vbWluYXRvcjogNCxcbiAgZGVub21pbmF0b3I6IDQsXG4gIHF1YW50aXplVmFsdWU6IDgsXG4gIGZpeGVkTGVuZ3RoVmFsdWU6IGZhbHNlLFxuICBwb3NpdGlvblR5cGU6ICdhbGwnLFxuICB1c2VNZXRyb25vbWU6IGZhbHNlLFxuICBhdXRvU2l6ZTogdHJ1ZSxcbiAgbG9vcDogZmFsc2UsXG4gIHBsYXliYWNrU3BlZWQ6IDEsXG4gIGF1dG9RdWFudGl6ZTogZmFsc2Vcbn1cbi8qXG50eXBlIHNvbmdTZXR0aW5ncyA9IHtcbiAgbmFtZTogc3RyaW5nLFxuICBwcHE6IG51bWJlcixcbiAgYnBtOiBudW1iZXIsXG4gIGJhcnM6IG51bWJlcixcbiAgbG93ZXN0Tm90ZTogbnVtYmVyLFxuICBoaWdoZXN0Tm90ZTogbnVtYmVyLFxuICBub21pbmF0b3I6IG51bWJlcixcbiAgZGVub21pbmF0b3I6IG51bWJlcixcbiAgcXVhbnRpemVWYWx1ZTogbnVtYmVyLFxuICBmaXhlZExlbmd0aFZhbHVlOiBudW1iZXIsXG4gIHBvc2l0aW9uVHlwZTogc3RyaW5nLFxuICB1c2VNZXRyb25vbWU6IGJvb2xlYW4sXG4gIGF1dG9TaXplOiBib29sZWFuLFxuICBsb29wOiBib29sZWFuLFxuICBwbGF5YmFja1NwZWVkOiBudW1iZXIsXG4gIGF1dG9RdWFudGl6ZTogYm9vbGVhblxufVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNvbmcoc2V0dGluZ3M6IHt9ID0ge30pOiBzdHJpbmd7XG4gIGxldCBpZCA9IGBTXyR7c29uZ0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgcyA9IHt9O1xuICAoe1xuICAgIG5hbWU6IHMubmFtZSA9IGlkLFxuICAgIHBwcTogcy5wcHEgPSBkZWZhdWx0U29uZy5wcHEsXG4gICAgYnBtOiBzLmJwbSA9IGRlZmF1bHRTb25nLmJwbSxcbiAgICBiYXJzOiBzLmJhcnMgPSBkZWZhdWx0U29uZy5iYXJzLFxuICAgIGxvd2VzdE5vdGU6IHMubG93ZXN0Tm90ZSA9IGRlZmF1bHRTb25nLmxvd2VzdE5vdGUsXG4gICAgaGlnaGVzdE5vdGU6IHMuaGlnaGVzdE5vdGUgPSBkZWZhdWx0U29uZy5oaWdoZXN0Tm90ZSxcbiAgICBub21pbmF0b3I6IHMubm9taW5hdG9yID0gZGVmYXVsdFNvbmcubm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yOiBzLmRlbm9taW5hdG9yID0gZGVmYXVsdFNvbmcuZGVub21pbmF0b3IsXG4gICAgcXVhbnRpemVWYWx1ZTogcy5xdWFudGl6ZVZhbHVlID0gZGVmYXVsdFNvbmcucXVhbnRpemVWYWx1ZSxcbiAgICBmaXhlZExlbmd0aFZhbHVlOiBzLmZpeGVkTGVuZ3RoVmFsdWUgPSBkZWZhdWx0U29uZy5maXhlZExlbmd0aFZhbHVlLFxuICAgIHBvc2l0aW9uVHlwZTogcy5wb3NpdGlvblR5cGUgPSBkZWZhdWx0U29uZy5wb3NpdGlvblR5cGUsXG4gICAgdXNlTWV0cm9ub21lOiBzLnVzZU1ldHJvbm9tZSA9IGRlZmF1bHRTb25nLnVzZU1ldHJvbm9tZSxcbiAgICBhdXRvU2l6ZTogcy5hdXRvU2l6ZSA9IGRlZmF1bHRTb25nLmF1dG9TaXplLFxuICAgIGxvb3A6IHMubG9vcCA9IGRlZmF1bHRTb25nLmxvb3AsXG4gICAgcGxheWJhY2tTcGVlZDogcy5wbGF5YmFja1NwZWVkID0gZGVmYXVsdFNvbmcucGxheWJhY2tTcGVlZCxcbiAgICBhdXRvUXVhbnRpemU6IHMuYXV0b1F1YW50aXplID0gZGVmYXVsdFNvbmcuYXV0b1F1YW50aXplLFxuICB9ID0gc2V0dGluZ3MpXG5cbiAgbGV0e1xuICAgIHRpbWVFdmVudHM6IHRpbWVFdmVudHMgPSBbXG4gICAgICB7aWQ6IGdldE1JRElFdmVudElkKCksIHNvbmc6IGlkLCB0aWNrczogMCwgdHlwZTogcWFtYmkuVEVNUE8sIGRhdGExOiBzLmJwbX0sXG4gICAgICB7aWQ6IGdldE1JRElFdmVudElkKCksIHNvbmc6IGlkLCB0aWNrczogMCwgdHlwZTogcWFtYmkuVElNRV9TSUdOQVRVUkUsIGRhdGExOiBzLm5vbWluYXRvciwgZGF0YTI6IHMuZGVub21pbmF0b3J9XG4gICAgXSxcbiAgICBtaWRpRXZlbnRJZHM6IG1pZGlFdmVudElkcyA9IFtdLFxuICAgIHBhcnRJZHM6IHBhcnRJZHMgPSBbXSxcbiAgICB0cmFja0lkczogdHJhY2tJZHMgPSBbXSxcbiAgfSA9IHNldHRpbmdzXG5cbiAgLy9wYXJzZVRpbWVFdmVudHMocywgdGltZUV2ZW50cylcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICB0aW1lRXZlbnRzLFxuICAgICAgbWlkaUV2ZW50SWRzLFxuICAgICAgcGFydElkcyxcbiAgICAgIHRyYWNrSWRzLFxuICAgICAgc2V0dGluZ3M6IHNcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUcmFja3Moc29uZ19pZDogc3RyaW5nLCAuLi50cmFja19pZHM6IHN0cmluZ1tdKTogdm9pZHtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9UUkFDS1MsXG4gICAgcGF5bG9hZDoge1xuICAgICAgc29uZ19pZCxcbiAgICAgIHRyYWNrX2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRpbWVFdmVudHMoLi4udGltZV9ldmVudHM6IHN0cmluZ1tdKTogdm9pZHtcblxufVxuXG5cbi8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU29uZyhzb25nX2lkOiBzdHJpbmcsIGZpbHRlcl9ldmVudHM6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWR7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yXG4gIGxldCBzb25nID0gc3RhdGUuc29uZ3Nbc29uZ19pZF1cbiAgaWYoc29uZyl7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGUgc29uZycpXG4gICAgLy9AVE9ETzogY2hlY2sgaWYgdGltZSBldmVudHMgYXJlIHVwZGF0ZWRcbiAgICBwYXJzZVRpbWVFdmVudHMoc29uZy5zZXR0aW5ncywgc29uZy50aW1lRXZlbnRzKVxuICAgIGxldCBtaWRpRXZlbnRzID0gWy4uLnNvbmcudGltZUV2ZW50c11cbiAgICBzb25nLm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50X2lkKXtcbiAgICAgIGxldCBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbZXZlbnRfaWRdXG4gICAgICBpZihldmVudCl7XG4gICAgICAgIG1pZGlFdmVudHMucHVzaCh7Li4uZXZlbnR9KVxuICAgICAgfVxuICAgIH0pXG4gICAgbWlkaUV2ZW50cyA9IHBhcnNlRXZlbnRzKG1pZGlFdmVudHMpXG4gICAgcGFyc2VNSURJTm90ZXMobWlkaUV2ZW50cylcbiAgICAvLyBtaWRpRXZlbnRzLmZvckVhY2goKGUpID0+IHtcbiAgICAvLyAgIGlmKGUuYmFyID49IDUgJiYgZS5iYXIgPD0gNil7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGUuYmFyc0FzU3RyaW5nLCBlLmRhdGExLCBlLmRhdGEyLCBlLnR5cGUpXG4gICAgLy8gICB9XG4gICAgLy8gfSlcbiAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICB0eXBlOiBVUERBVEVfU09ORyxcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ19pZCxcbiAgICAgICAgbWlkaV9ldmVudHM6IG1pZGlFdmVudHMsXG4gICAgICAgIHNldHRpbmdzOiBzb25nLnNldHRpbmdzIC8vIG5lZWRlZCBmb3IgdGhlIHNlcXVlbmNlciByZWR1Y2VyXG4gICAgICB9XG4gICAgfSlcbiAgICBjb25zb2xlLnRpbWVFbmQoJ3VwZGF0ZSBzb25nJylcbiAgfWVsc2V7XG4gICAgY29uc29sZS53YXJuKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRTb25nKHNvbmdfaWQ6IHN0cmluZywgc3RhcnRfcG9zaXRpb246IG51bWJlciA9IDApOiB2b2lke1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNjaGVkdWxlcigpe1xuICAgIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKClcbiAgICBsZXQgc29uZ0RhdGEgPSBzdGF0ZS5zZXF1ZW5jZXIuc29uZ3Nbc29uZ19pZF1cbiAgICBsZXQgcGFydHMgPSB7fVxuICAgIGxldCB0cmFja3MgPSB7fVxuICAgIGxldCBpbnN0cnVtZW50cyA9IHt9XG4gICAgbGV0IGkgPSAwXG4gICAgbGV0IG1pZGlFdmVudHMgPSBzb25nRGF0YS5taWRpRXZlbnRzLmZpbHRlcihmdW5jdGlvbihldmVudCl7XG4gICAgICAvLyBpZigoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkgJiYgdHlwZW9mIGV2ZW50Lm1pZGlOb3RlSWQgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vICAgY29uc29sZS5pbmZvKGkrKywgJ25vIG1pZGlOb3RlSWQnLCBldmVudC50aWNrcywgZXZlbnQudHlwZSwgZXZlbnQuZGF0YTEsIGV2ZW50LnRyYWNrSWQpXG4gICAgICAvLyAgIHJldHVybiBmYWxzZVxuICAgICAgLy8gfVxuICAgICAgbGV0IHBhcnQgPSBwYXJ0c1tldmVudC5wYXJ0SWRdXG4gICAgICBsZXQgdHJhY2sgPSB0cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgIGlmKHR5cGVvZiBwYXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHBhcnRzW2V2ZW50LnBhcnRJZF0gPSBwYXJ0ID0gc3RhdGUuZWRpdG9yLnBhcnRzW2V2ZW50LnBhcnRJZF1cbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiB0cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICB0cmFja3NbZXZlbnQudHJhY2tJZF0gPSB0cmFjayA9IHN0YXRlLmVkaXRvci50cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgICAgaW5zdHJ1bWVudHNbdHJhY2suaW5zdHJ1bWVudElkXSA9IHN0YXRlLmluc3RydW1lbnRzW3RyYWNrLmluc3RydW1lbnRJZF1cbiAgICAgIH1cbiAgICAgIC8vcmV0dXJuICghZXZlbnQubXV0ZSAmJiAhcGFydC5tdXRlICYmICF0cmFjay5tdXRlKVxuICAgICAgLy8gY2hlY2sgaWYgYSBub3RlLCBwYXJ0IG9yIHRyYWNrIGlzIG11dGVkIHNob3VsZCBiZSBkb25lIGluIHRoZSBzY2hlZHVsZXIgbG9vcFxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc3RhcnRfcG9zaXRpb25cbiAgICBsZXQgdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAgLy8gLT4gY29udmVydCB0byBtaWxsaXNcbiAgICBsZXQgc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7XG4gICAgICBzb25nX2lkLFxuICAgICAgc3RhcnRfcG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXAsXG4gICAgICBwYXJ0cyxcbiAgICAgIHRyYWNrcyxcbiAgICAgIGluc3RydW1lbnRzLFxuICAgICAgc2V0dGluZ3M6IHNvbmdEYXRhLnNldHRpbmdzLFxuICAgICAgbWlkaUV2ZW50czogbWlkaUV2ZW50cyxcbiAgICB9KVxuXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogU1RBUlRfU0NIRURVTEVSLFxuICAgICAgcGF5bG9hZDoge1xuICAgICAgICBzb25nX2lkLFxuICAgICAgICBzY2hlZHVsZXJcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBsZXRcbiAgICAgICAgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsXG4gICAgICAgIGRpZmYgPSBub3cgLSB0aW1lU3RhbXAsXG4gICAgICAgIGVuZE9mU29uZ1xuXG4gICAgICBwb3NpdGlvbiArPSBkaWZmIC8vIHBvc2l0aW9uIGlzIGluIG1pbGxpc1xuICAgICAgdGltZVN0YW1wID0gbm93XG4gICAgICBlbmRPZlNvbmcgPSBzY2hlZHVsZXIudXBkYXRlKHBvc2l0aW9uKVxuICAgICAgaWYoZW5kT2ZTb25nKXtcbiAgICAgICAgc3RvcFNvbmcoc29uZ19pZClcbiAgICAgIH1cbiAgICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgICAgdHlwZTogU09OR19QT1NJVElPTixcbiAgICAgICAgcGF5bG9hZDoge1xuICAgICAgICAgIHNvbmdfaWQsXG4gICAgICAgICAgcG9zaXRpb25cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBhZGRUYXNrKCdyZXBldGl0aXZlJywgc29uZ19pZCwgY3JlYXRlU2NoZWR1bGVyKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wU29uZyhzb25nX2lkOiBzdHJpbmcpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpXG4gIGxldCBzb25nRGF0YSA9IHN0YXRlLnNlcXVlbmNlci5zb25nc1tzb25nX2lkXVxuICBpZihzb25nRGF0YSl7XG4gICAgaWYoc29uZ0RhdGEucGxheWluZyl7XG4gICAgICByZW1vdmVUYXNrKCdyZXBldGl0aXZlJywgc29uZ19pZClcbiAgICAgIHNvbmdEYXRhLnNjaGVkdWxlci5zdG9wQWxsU291bmRzKClcbiAgICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgICAgdHlwZTogU1RPUF9TQ0hFRFVMRVIsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzb25nX2lkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmVycm9yKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMoXG4gIHNldHRpbmdzOiB7c29uZ19pZDogc3RyaW5nLCB0cmFja19pZDogc3RyaW5nLCBwYXJ0X2lkOiBzdHJpbmd9LFxuICBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+XG4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuLy8gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50c1RvU29uZyhzb25nX2lkOiBzdHJpbmcsIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cbiovIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBwYXJzZU1JRElGaWxlIGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge2NyZWF0ZU1JRElFdmVudCwgZ2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y3JlYXRlUGFydCwgYWRkTUlESUV2ZW50c30gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtjcmVhdGVUcmFjaywgYWRkUGFydHMsIHNldEluc3RydW1lbnR9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge2NyZWF0ZVNvbmcsIGFkZFRyYWNrcywgdXBkYXRlU29uZ30gZnJvbSAnLi9zb25nJ1xuaW1wb3J0IHtjcmVhdGVJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmNvbnN0IFBQUSA9IDk2MFxuXG5leHBvcnQgZnVuY3Rpb24gc29uZ0Zyb21NSURJRmlsZShkYXRhLCBzZXR0aW5ncyA9IHt9KXtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKHR5cGVvZiBkYXRhLmhlYWRlciAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIGRhdGEudHJhY2tzICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHRvU29uZyhkYXRhKTtcbiAgLy8gfWVsc2V7XG4gIC8vICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAvLyAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gIC8vICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gIC8vICAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIC8vICAgfWVsc2V7XG4gIC8vICAgICBlcnJvcignd3JvbmcgZGF0YScpO1xuICAvLyAgIH1cbiAgfVxuXG4gIC8vIHtcbiAgLy8gICBwcHEgPSBuZXdQUFEsXG4gIC8vICAgYnBtID0gbmV3QlBNLFxuICAvLyAgIHBsYXliYWNrU3BlZWQgPSBuZXdQbGF5YmFja1NwZWVkLFxuICAvLyB9ID0gc2V0dGluZ3Ncbn1cblxuXG5mdW5jdGlvbiB0b1NvbmcocGFyc2VkKXtcbiAgbGV0IHRyYWNrcyA9IHBhcnNlZC50cmFja3NcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0XG4gIGxldCBwcHFGYWN0b3IgPSBQUFEgLyBwcHEgLy9AVE9ETzogZ2V0IHBwcSBmcm9tIGNvbmZpZyAtPiBvbmx5IG5lY2Vzc2FyeSBpZiB5b3Ugd2FudCB0byBjaGFuZ2UgdGhlIHBwcSBvZiB0aGUgTUlESSBmaWxlICFcbiAgbGV0IHRpbWVFdmVudHMgPSBbXVxuICBsZXQgZXZlbnRJZHNcbiAgbGV0IGJwbSA9IC0xXG4gIGxldCBub21pbmF0b3IgPSAtMVxuICBsZXQgZGVub21pbmF0b3IgPSAtMVxuICBsZXQgdHJhY2tJZHMgPSBbXVxuICBsZXQgc29uZ0lkXG4gIGxldCBpbnN0cnVtZW50SWQgPSBjcmVhdGVJbnN0cnVtZW50KClcblxuXG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzLnZhbHVlcygpKXtcbiAgICBsZXQgbGFzdFRpY2tzLCBsYXN0VHlwZVxuICAgIGxldCB0aWNrcyA9IDBcbiAgICBsZXQgdHlwZVxuICAgIGxldCBjaGFubmVsID0gLTFcbiAgICBsZXQgdHJhY2tOYW1lXG4gICAgbGV0IHRyYWNrSW5zdHJ1bWVudE5hbWVcbiAgICBldmVudElkcyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxRmFjdG9yKTtcblxuICAgICAgaWYoY2hhbm5lbCA9PT0gLTEgJiYgdHlwZW9mIGV2ZW50LmNoYW5uZWwgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY2hhbm5lbCA9IGV2ZW50LmNoYW5uZWw7XG4gICAgICB9XG4gICAgICB0eXBlID0gZXZlbnQuc3VidHlwZTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuZGVsdGFUaW1lLCB0aWNrcywgdHlwZSk7XG5cbiAgICAgIHN3aXRjaChldmVudC5zdWJ0eXBlKXtcblxuICAgICAgICBjYXNlICd0cmFja05hbWUnOlxuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnaW5zdHJ1bWVudE5hbWUnOlxuICAgICAgICAgIGlmKGV2ZW50LnRleHQpe1xuICAgICAgICAgICAgdHJhY2tJbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4OTAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9mZic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4ODAsIGV2ZW50Lm5vdGVOdW1iZXIsIGV2ZW50LnZlbG9jaXR5KSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnc2V0VGVtcG8nOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRlbXBvIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBsZXQgdG1wID0gNjAwMDAwMDAgLyBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0O1xuXG4gICAgICAgICAgaWYodGlja3MgPT09IGxhc3RUaWNrcyAmJiB0eXBlID09PSBsYXN0VHlwZSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUuaW5mbygndGVtcG8gZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgdG1wKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYoYnBtID09PSAtMSl7XG4gICAgICAgICAgICBicG0gPSB0bXA7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MgKyAweDUxLCB0aWNrcywgdHlwZTogMHg1MSwgZGF0YTE6IHRtcH0pO1xuICAgICAgICAgIC8vdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcywgdGlja3MsIHR5cGU6IDB4NTEsIGRhdGExOiB0bXB9KTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICd0aW1lU2lnbmF0dXJlJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0aW1lIHNpZ25hdHVyZSBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgaWYobGFzdFRpY2tzID09PSB0aWNrcyAmJiBsYXN0VHlwZSA9PT0gdHlwZSl7XG4gICAgICAgICAgICBjb25zb2xlLmluZm8oJ3RpbWUgc2lnbmF0dXJlIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGV2ZW50Lm51bWVyYXRvciwgZXZlbnQuZGVub21pbmF0b3IpO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihub21pbmF0b3IgPT09IC0xKXtcbiAgICAgICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm51bWVyYXRvclxuICAgICAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvclxuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzICsgMHg1OCwgdGlja3MsIHR5cGU6IDB4NTgsIGRhdGExOiBldmVudC5udW1lcmF0b3IsIGRhdGEyOiBldmVudC5kZW5vbWluYXRvcn0pO1xuICAgICAgICAgIC8vdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcywgdGlja3MsIHR5cGU6IDB4NTgsIGRhdGExOiBldmVudC5udW1lcmF0b3IsIGRhdGEyOiBldmVudC5kZW5vbWluYXRvcn0pO1xuICAgICAgICAgIGJyZWFrO1xuXG5cbiAgICAgICAgY2FzZSAnY29udHJvbGxlcic6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4QjAsIGV2ZW50LmNvbnRyb2xsZXJUeXBlLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3Byb2dyYW1DaGFuZ2UnOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhFMCwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vY29uc29sZS5sb2codHJhY2submFtZSwgZXZlbnQudHlwZSk7XG4gICAgICB9XG5cbiAgICAgIGxhc3RUeXBlID0gdHlwZVxuICAgICAgbGFzdFRpY2tzID0gdGlja3NcbiAgICB9XG5cbiAgICBpZihldmVudElkcy5sZW5ndGggPiAwKXtcbiAgICAgIGxldCB0cmFja0lkID0gY3JlYXRlVHJhY2soe25hbWU6IHRyYWNrTmFtZX0pXG4gICAgICBzZXRJbnN0cnVtZW50KHRyYWNrSWQsIGluc3RydW1lbnRJZClcbiAgICAgIC8vbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWQsIG1pZGlFdmVudElkczogZXZlbnRJZHN9KVxuICAgICAgbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWR9KVxuICAgICAgYWRkTUlESUV2ZW50cyhwYXJ0SWQsIC4uLmV2ZW50SWRzKVxuICAgICAgYWRkUGFydHModHJhY2tJZCwgcGFydElkKVxuICAgICAgLy9hZGRUcmFja3Moc29uZ0lkLCB0cmFja0lkKVxuICAgICAgdHJhY2tJZHMucHVzaCh0cmFja0lkKVxuICAgIH1cbiAgfVxuXG4gIHNvbmdJZCA9IGNyZWF0ZVNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIC8vcGxheWJhY2tTcGVlZDogMSxcbiAgICAvL3BwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yLFxuICAgIHRpbWVFdmVudHMsXG4gIH0pXG4gIGFkZFRyYWNrcyhzb25nSWQsIC4uLnRyYWNrSWRzKVxuICB1cGRhdGVTb25nKHNvbmdJZClcbiAgcmV0dXJuIHNvbmdJZFxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBxYW1iaSwge1xuICBnZXRNYXN0ZXJWb2x1bWUsXG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxuICBjcmVhdGVNSURJTm90ZSxcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICBjcmVhdGVUcmFjayxcbiAgYWRkUGFydHMsXG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG4gIHVwZGF0ZVNvbmcsXG4gIHN0YXJ0U29uZyxcbiAgc3RvcFNvbmcsXG4gIHBhcnNlTUlESUZpbGUsXG4gIHNvbmdGcm9tTUlESUZpbGUsXG59IGZyb20gJy4vcWFtYmknXG5cbnFhbWJpLmdldE1hc3RlclZvbHVtZSgpXG5xYW1iaS5sb2coJ2Z1bmN0aW9ucycpXG5xYW1iaS5pbml0KGZ1bmN0aW9uKGRhdGEpe1xuICBjb25zb2xlLmxvZyhkYXRhLCBxYW1iaS5nZXRNYXN0ZXJWb2x1bWUoKSlcbn0pXG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCBmdW5jdGlvbigpe1xuXG4gIGxldCBidXR0b25TdGFydCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdGFydCcpXG4gIGxldCBidXR0b25TdG9wID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0b3AnKVxuICBidXR0b25TdGFydC5kaXNhYmxlZCA9IHRydWVcbiAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IHRydWVcblxuICBsZXQgdGVzdCA9IDJcbiAgbGV0IG5vdGVvbiwgbm90ZW9mZiwgbm90ZSwgc29uZ0lkLCB0cmFjaywgcGFydDEsIHBhcnQyXG5cbiAgaWYodGVzdCA9PT0gMSl7XG5cbiAgICBzb25nSWQgPSBjcmVhdGVTb25nKHtuYW1lOiAnTXkgRmlyc3QgU29uZycsIHBsYXliYWNrU3BlZWQ6IDEsIGxvb3A6IHRydWUsIGJwbTogNjB9KVxuICAgIHRyYWNrID0gY3JlYXRlVHJhY2soe25hbWU6ICdndWl0YXInLCBzb25nSWR9KVxuICAgIHBhcnQxID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8xJywgdHJhY2t9KVxuICAgIHBhcnQyID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8yJywgdHJhY2t9KVxuICAgIC8vbm90ZW9uID0gY3JlYXRlTUlESUV2ZW50KDk2MCwgMTQ0LCA2MCwgMTAwKVxuICAgIC8vbm90ZW9mZiA9IGNyZWF0ZU1JRElFdmVudCgxMDIwLCAxMjgsIDYwLCAwKVxuICAgIC8vYWRkTUlESUV2ZW50cyhwYXJ0MSwgbm90ZW9uLCBub3Rlb2ZmKVxuXG4gICAgLy9ub3RlID0gY3JlYXRlTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKVxuXG5cbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGUgPSAxNDRcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKyl7XG4gICAgICBldmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIHR5cGUsIDYwLCAxMDApKVxuICAgICAgaWYoaSAlIDIgPT09IDApe1xuICAgICAgICB0eXBlID0gMTI4XG4gICAgICAgIHRpY2tzICs9IDk2MFxuICAgICAgfWVsc2V7XG4gICAgICAgIHR5cGUgPSAxNDRcbiAgICAgICAgdGlja3MgKz0gOTYwXG4gICAgICB9XG4gICAgfVxuICAgIGFkZE1JRElFdmVudHMocGFydDEsIC4uLmV2ZW50cylcblxuICAgIGFkZFBhcnRzKHRyYWNrLCBwYXJ0MSwgcGFydDIpXG4gICAgYWRkVHJhY2tzKHNvbmdJZCwgdHJhY2spXG4gICAgdXBkYXRlU29uZyhzb25nSWQpXG4gICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICB9XG5cbi8qXG4gIC8vc3RhcnRTb25nKHNvbmcpXG4gIC8vIGxldCBzb25nMiA9IGNyZWF0ZVNvbmcoKVxuXG4gIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgLy8gICBzdGFydFNvbmcoc29uZzIsIDUwMDApXG4gIC8vIH0sIDEwMDApXG5cbi8vICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuLy8gICAgIHN0b3BTb25nKHNvbmcpXG4vLyAvLyAgICBzdG9wU29uZyhzb25nMilcbi8vICAgfSwgMjAwKVxuKi9cblxuICBpZih0ZXN0ID09PSAyKXtcbiAgICAvL2ZldGNoKCdtb3prNTQ1YS5taWQnKVxuICAgIGZldGNoKCdtaW51dGVfd2FsdHoubWlkJylcbiAgICAudGhlbihcbiAgICAgIChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgfVxuICAgIClcbiAgICAudGhlbigoYWIpID0+IHtcbiAgICAgIC8vc29uZ0lkID0gc29uZ0Zyb21NSURJRmlsZShwYXJzZU1JRElGaWxlKGFiKSlcbiAgICAgIGxldCBtZiA9IHBhcnNlTUlESUZpbGUoYWIpXG4gICAgICBzb25nSWQgPSBzb25nRnJvbU1JRElGaWxlKG1mKVxuICAgICAgLy9jb25zb2xlLmxvZygnaGVhZGVyOicsIG1mLmhlYWRlcilcbiAgICAgIC8vY29uc29sZS5sb2coJyMgdHJhY2tzOicsIG1mLnRyYWNrcy5zaXplKVxuICAgICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGJ1dHRvblN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzdGFydFNvbmcoc29uZ0lkLCAwKVxuICB9KVxuXG4gIGJ1dHRvblN0b3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHN0b3BTb25nKHNvbmdJZClcbiAgfSlcblxufSlcbiIsIlxuXG5pbXBvcnQge2dldEF1ZGlvQ29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge2NyZWF0ZUluc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7XG4gIENSRUFURV9UUkFDSyxcbiAgQUREX1BBUlRTLFxuICBTRVRfSU5TVFJVTUVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxuY29uc3QgY29udGV4dCA9IGdldEF1ZGlvQ29udGV4dCgpXG5sZXQgdHJhY2tJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVRyYWNrKFxuICBzZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydElkczpBcnJheTxzdHJpbmc+LCBzb25nSWQ6IHN0cmluZ30gPSB7fVxuICAvL3NldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0czpBcnJheTxzdHJpbmc+LCBzb25nOiBzdHJpbmd9ID0ge25hbWU6ICdhYXAnLCBwYXJ0czogW10sIHNvbmc6ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuICAvL3NldHRpbmdzID0ge25hbWU6IG5hbWUgPSAnYWFwJywgcGFydHM6IHBhcnRzID0gW10sIHNvbmc6IHNvbmcgPSAnbm8gc29uZyd9XG4pe1xuICBsZXQgaWQgPSBgTVRfJHt0cmFja0luZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQge1xuICAgIG5hbWUgPSBpZCxcbiAgICBwYXJ0SWRzID0gW10sXG4gICAgc29uZ0lkID0gJ25vbmUnXG4gIH0gPSBzZXR0aW5nc1xuICBsZXQgdm9sdW1lID0gMC41XG4gIGxldCBvdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICBvdXRwdXQuZ2Fpbi52YWx1ZSA9IHZvbHVtZVxuICBvdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKSAvL0BUT0RPOiByb3V0ZSB0byBtYXN0ZXIgY29tcHJlc3NvciBmaXJzdCFcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1RSQUNLLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbmFtZSxcbiAgICAgIHBhcnRJZHMsXG4gICAgICBzb25nSWQsXG4gICAgICB2b2x1bWUsXG4gICAgICBvdXRwdXQsXG4gICAgICBtdXRlOiBmYWxzZSxcbiAgICAgIC8vaW5zdHJ1bWVudElkOiBjcmVhdGVJbnN0cnVtZW50KCdzaW5ld2F2ZScpLFxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIGlkXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFBhcnRzKHRyYWNrX2lkOiBzdHJpbmcsIC4uLnBhcnRfaWRzOnN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfUEFSVFMsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdHJhY2tfaWQsXG4gICAgICBwYXJ0X2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEluc3RydW1lbnQodHJhY2tJZDogc3RyaW5nLCBpbnN0cnVtZW50SWQ6IHN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBTRVRfSU5TVFJVTUVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB0cmFja0lkLFxuICAgICAgaW5zdHJ1bWVudElkLFxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG11dGVUcmFjayhmbGFnOiBib29sZWFuKXtcblxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRWb2x1bWVUcmFjayhmbGFnOiBib29sZWFuKXtcblxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRQYW5uaW5nVHJhY2soZmxhZzogYm9vbGVhbil7XG5cbn1cbiIsIlxuaW1wb3J0IGZldGNoIGZyb20gJ2lzb21vcnBoaWMtZmV0Y2gnXG5pbXBvcnQge2dldEF1ZGlvQ29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuXG5cbmNvbnN0XG4gIGNvbnRleHQgPSBnZXRBdWRpb0NvbnRleHQoKSxcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgIHNlY29uZHMsXG4gICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcy8xMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcil7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogYnVmZmVyfSk7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHsnaWQnOiBpZCwgJ2J1ZmZlcic6IGJ1ZmZlcn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvbkVycm9yKGUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgLy9yZWplY3QoZSk7XG4gICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiB1bmRlZmluZWR9KTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICBsZXQgZXhlY3V0b3IgPSBmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuXG4gICAgZmV0Y2godXJsKS50aGVuKFxuICAgICAgZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICBpZihyZXNwb25zZS5vayl7XG4gICAgICAgICAgcmVzcG9uc2UuYmxvYigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICBwYXJzZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTYW1wbGVzKG1hcHBpbmcsIGV2ZXJ5ID0gZmFsc2Upe1xuICBsZXQga2V5LCBzYW1wbGUsXG4gICAgcHJvbWlzZXMgPSBbXSxcbiAgICB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKTtcblxuICBldmVyeSA9IHR5cGVTdHJpbmcoZXZlcnkpID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZTtcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgZm9yKGtleSBpbiBtYXBwaW5nKXtcbiAgICAgIGlmKG1hcHBpbmcuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgIHNhbXBsZSA9IG1hcHBpbmdba2V5XTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhjaGVja0lmQmFzZTY0KHNhbXBsZSkpXG4gICAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChwYXJzZVNhbXBsZShiYXNlNjRUb0JpbmFyeShzYW1wbGUpLCBrZXksIGV2ZXJ5KSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICBtYXBwaW5nLmZvckVhY2goZnVuY3Rpb24oc2FtcGxlKXtcbiAgICAgIGlmKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSl7XG4gICAgICAgIHByb21pc2VzLnB1c2gocGFyc2VTYW1wbGUoc2FtcGxlLCBldmVyeSkpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHByb21pc2VzLnB1c2gobG9hZEFuZFBhcnNlU2FtcGxlKHNhbXBsZSwgZXZlcnkpKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQodmFsdWVzKXtcbiAgICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgIGxldCBtYXBwaW5nID0ge307XG4gICAgICAgICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgICAgICAgbWFwcGluZ1t2YWx1ZS5pZF0gPSB2YWx1ZS5idWZmZXI7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhtYXBwaW5nKTtcbiAgICAgICAgICByZXNvbHZlKG1hcHBpbmcpO1xuICAgICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgICByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2VwZW4oKXtcbiAgY29uc29sZS5sb2coY29udGV4dClcbn1cblxuZnVuY3Rpb24gY2hlY2tJZkJhc2U2NChkYXRhKXtcbiAgbGV0IHBhc3NlZCA9IHRydWU7XG4gIHRyeXtcbiAgICBhdG9iKGRhdGEpO1xuICB9Y2F0Y2goZSl7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cbiJdfQ==
