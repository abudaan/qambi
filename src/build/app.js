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
var SET_MIDI_OUTPUT_IDS = exports.SET_MIDI_OUTPUT_IDS = 'set_midi_output_ids';

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

},{"./reducer":30,"redux":12}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.addTask = addTask;
exports.removeTask = removeTask;

var _init = require('./init');

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
  (0, _init.requestAnimationFrame)(heartbeat);
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

},{"./init":18,"./init_audio":19}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Blob = exports.requestAnimationFrame = exports.getUserMedia = undefined;
exports.init = init;

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _create_store = require('./create_store');

var _action_types = require('./action_types');

var store = (0, _create_store.getStore)();

var getUserMedia = exports.getUserMedia = function () {
  if (typeof navigator !== 'undefined') {
    return navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  }
  return function () {
    console.warn('getUserMedia is not available');
  };
}();

var requestAnimationFrame = exports.requestAnimationFrame = function () {
  if (typeof navigator !== 'undefined') {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  }
  return function () {
    console.warn('requestAnimationFrame is not available');
  };
}();

var Blob = exports.Blob = function () {
  if (typeof navigator !== 'undefined') {
    return window.Blob || window.webkitBlob;
  }
  return function () {
    console.warn('Blob is not available');
  };
}();

function init() {
  return new Promise(function (resolve, reject) {

    Promise.all([(0, _init_audio.initAudio)(), (0, _init_midi.initMIDI)()]).then(function (data) {
      // parseAudio
      var dataAudio = data[0];

      store.dispatch({
        type: _action_types.STORE_SAMPLES,
        payload: {
          lowTick: dataAudio.lowtick,
          highTick: dataAudio.hightick
        }
      });

      // parseMIDI
      var dataMidi = data[1];

      resolve({
        legacy: dataAudio.legacy,
        mp3: dataAudio.mp3,
        ogg: dataAudio.ogg,
        midi: dataMidi.midi,
        webmidi: dataMidi.webmidi
      });
    }, function (error) {
      reject(error);
    });
  });
}

},{"./action_types":15,"./create_store":16,"./init_audio":19,"./init_midi":20}],19:[function(require,module,exports){
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
  var ctx = void 0;
  if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext !== 'undefined') {
      ctx = new AudioContext();
    }
  }
  if (typeof ctx === 'undefined') {
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
  return ctx;
}();

function initAudio() {

  if (typeof context.createGainNode === 'undefined') {
    context.createGainNode = context.createGain;
  }
  // check for older implementations of WebAudio
  var data = {};
  var source = context.createBufferSource();
  data.legacy = false;
  if (typeof source.start === 'undefined') {
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
    console.warn('please call qambi.init() first');
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
    console.warn('please call qambi.init() first');
  } else {
    exports.getMasterVolume = _getMasterVolume = function getMasterVolume() {
      return masterGain.gain.value;
    };
    return _getMasterVolume();
  }
};

var _getCompressionReduction = function getCompressionReduction() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getCompressionReduction = _getCompressionReduction = function getCompressionReduction() {
      return compressor.reduction.value;
    };
    return _getCompressionReduction();
  }
};

var _enableMasterCompressor = function enableMasterCompressor() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
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
    console.warn('please call qambi.init() first');
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

},{"./samples":32,"./util":38}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getMIDIInputById = exports.getMIDIOutputById = exports.getMIDIInputIds = exports.getMIDIOutputIds = exports.getMIDIInputs = exports.getMIDIOutputs = exports.getMIDIAccess = undefined;
exports.initMIDI = initMIDI;

var _util = require('./util');

var MIDIAccess = void 0; /*
                           Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
                         */

var initialized = false;
var inputs = [];
var outputs = [];
var inputIds = [];
var outputIds = [];
var inputsById = new Map();
var outputsById = new Map();

var songMidiEventListener = void 0;
var midiEventListenerId = 0;

function getMIDIports() {
  inputs = Array.from(MIDIAccess.inputs.values());

  //sort ports by name ascending
  inputs.sort(function (a, b) {
    return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
  });

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = inputs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var port = _step.value;

      inputsById.set(port.id, port);
      inputIds.push(port.id);
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

  outputs = Array.from(MIDIAccess.outputs.values());

  //sort ports by name ascending
  outputs.sort(function (a, b) {
    return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
  });

  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = outputs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var _port = _step2.value;

      outputsById.set(_port.id, _port);
      outputIds.push(_port.id);
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
}

function initMIDI() {

  return new Promise(function executor(resolve, reject) {

    if (typeof navigator === 'undefined') {
      initialized = true;
      resolve({ midi: false });
    } else if (typeof navigator.requestMIDIAccess !== 'undefined') {
      (function () {

        var jazz = void 0,
            midi = void 0,
            webmidi = void 0;

        navigator.requestMIDIAccess().then(function onFulFilled(midiAccess) {
          MIDIAccess = midiAccess;
          if (typeof midiAccess._jazzInstances !== 'undefined') {
            jazz = midiAccess._jazzInstances[0]._Jazz.version;
            midi = true;
          } else {
            webmidi = true;
            midi = true;
          }

          getMIDIports();

          // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
          midiAccess.addEventListener('onconnect', function (e) {
            console.log('device connected', e);
            getMIDIports();
          }, false);

          midiAccess.addEventListener('ondisconnect', function (e) {
            console.log('device disconnected', e);
            getMIDIports();
          }, false);

          initialized = true;
          resolve({
            jazz: jazz,
            midi: midi,
            webmidi: webmidi,
            inputs: inputs,
            outputs: outputs,
            inputsById: inputsById,
            outputsById: outputsById
          });
        }, function onReject(e) {
          //console.log(e);
          reject('Something went wrong while requesting MIDIAccess', e);
        });
        // browsers without WebMIDI API
      })();
    } else {
        initialized = true;
        resolve({ midi: false });
      }
  });
}

var _getMIDIAccess = function getMIDIAccess() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIAccess = _getMIDIAccess = function getMIDIAccess() {
      return MIDIAccess;
    };
    return _getMIDIAccess();
  }
  return false;
};

exports.getMIDIAccess = _getMIDIAccess;
var _getMIDIOutputs = function getMIDIOutputs() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputs = _getMIDIOutputs = function getMIDIOutputs() {
      return outputs;
    };
    return _getMIDIOutputs();
  }
  return false;
};

exports.getMIDIOutputs = _getMIDIOutputs;
var _getMIDIInputs = function getMIDIInputs() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputs = _getMIDIInputs = function getMIDIInputs() {
      return inputs;
    };
    return _getMIDIInputs();
  }
  return false;
};

exports.getMIDIInputs = _getMIDIInputs;
var _getMIDIOutputIds = function getMIDIOutputIds() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputIds = _getMIDIOutputIds = function getMIDIOutputIds() {
      return outputIds;
    };
    return _getMIDIOutputIds();
  }
  return false;
};

exports.getMIDIOutputIds = _getMIDIOutputIds;
var _getMIDIInputIds = function getMIDIInputIds() {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputIds = _getMIDIInputIds = function getMIDIInputIds() {
      return inputIds;
    };
    return _getMIDIInputIds();
  }
  return false;
};

exports.getMIDIInputIds = _getMIDIInputIds;
var _getMIDIOutputById = function getMIDIOutputById(id) {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIOutputById = _getMIDIOutputById = function getMIDIOutputById() {
      return outputsById.get(id);
    };
    return _getMIDIOutputById(id);
  }
  return false;
};

exports.getMIDIOutputById = _getMIDIOutputById;
var _getMIDIInputById = function getMIDIInputById(id) {
  if (initialized === false) {
    console.warn('please call qambi.init() first');
  } else {
    exports.getMIDIInputById = _getMIDIInputById = function getMIDIInputById() {
      return outputsById.get(id);
    };
    return _getMIDIInputById(id);
  }
  return false;
};

/*
export function initMidiSong(song){

  songMidiEventListener = function(e){
    //console.log(e);
    handleMidiMessageSong(song, e, this);
  };

  // by default a song listens to all available midi-in ports
  inputs.forEach(function(port){
    port.addEventListener('midimessage', songMidiEventListener);
    song.midiInputs.set(port.id, port);
  });

  outputs.forEach(function(port){
    song.midiOutputs.set(port.id, port);
  });
}


export function setMidiInputSong(song, id, flag){
  let input = inputs.get(id);

  if(input === undefined){
    warn('no midi input with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiInputs.delete(id);
    input.removeEventListener('midimessage', songMidiEventListener);
  }else{
    song.midiInputs.set(id, input);
    input.addEventListener('midimessage', songMidiEventListener);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiInput(id, flag);
  }
}



export function setMidiOutputSong(song, id, flag){
  let output = outputs.get(id);

  if(output === undefined){
    warn('no midi output with id', id, 'found');
    return;
  }

  if(flag === false){
    song.midiOutputs.delete(id);
    let time = song.scheduler.lastEventTime + 100;
    output.send([0xB0, 0x7B, 0x00], time); // stop all notes
    output.send([0xB0, 0x79, 0x00], time); // reset all controllers
  }else{
    song.midiOutputs.set(id, output);
  }

  let tracks = song.tracks;
  for(let track of tracks){
    track.setMidiOutput(id, flag);
  }
}



function handleMidiMessageSong(song, midiMessageEvent, input){
  let midiEvent = new MidiEvent(song.ticks, ...midiMessageEvent.data);

  //console.log(midiMessageEvent.data);

  let tracks = song.tracks;
  for(let track of tracks){
    //console.log(track.midiInputs, input);


    //if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
    //  handleMidiMessageTrack(midiEvent, track);
    //}


    // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
    // set track.monitor to false if you don't want to receive midi events on a certain track
    // note that track.monitor is by default set to false and that track.monitor is automatically set to true
    // if you are recording on that track
    //console.log(track.monitor, track.id, input.id);
    if(track.monitor === true && track.midiInputs.get(input.id) !== undefined){
      handleMidiMessageTrack(midiEvent, track, input);
    }
  }

  let listeners = song.midiEventListeners.get(midiEvent.type);
  if(listeners !== undefined){
    for(let listener of listeners){
      listener(midiEvent, input);
    }
  }
}


function handleMidiMessageTrack(track, midiEvent, input){
  let song = track.song,
    note, listeners, channel;
    //data = midiMessageEvent.data,
    //midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  //midiEvent.source = midiMessageEvent.srcElement.name;
  //console.log(midiMessageEvent)
  //console.log('---->', midiEvent.type);

  // add the exact time of this event so we can calculate its ticks position
  midiEvent.recordMillis = context.currentTime * 1000; // millis
  midiEvent.state = 'recorded';

  if(midiEvent.type === 144){
    note = createMidiNote(midiEvent);
    track.recordingNotes[midiEvent.data1] = note;
    //track.song.recordingNotes[note.id] = note;
  }else if(midiEvent.type === 128){
    note = track.recordingNotes[midiEvent.data1];
    // check if the note exists: if the user plays notes on her keyboard before the midi system has
    // been fully initialized, it can happen that the first incoming midi event is a NOTE OFF event
    if(note === undefined){
      return;
    }
    note.addNoteOff(midiEvent);
    delete track.recordingNotes[midiEvent.data1];
    //delete track.song.recordingNotes[note.id];
  }

  //console.log(song.preroll, song.recording, track.recordEnabled);

  if((song.prerolling || song.recording) && track.recordEnabled === 'midi'){
    if(midiEvent.type === 144){
      track.song.recordedNotes.push(note);
    }
    track.recordPart.addEvent(midiEvent);
    // song.recordedEvents is used in the key editor
    track.song.recordedEvents.push(midiEvent);
  }else if(track.enableRetrospectiveRecording){
    track.retrospectiveRecording.push(midiEvent);
  }

  // call all midi event listeners
  listeners = track.midiEventListeners[midiEvent.type];
  if(listeners !== undefined){
    objectForEach(listeners, function(listener){
      listener(midiEvent, input);
    });
  }

  channel = track.channel;
  if(channel === 'any' || channel === undefined || isNaN(channel) === true){
    channel = 0;
  }

  objectForEach(track.midiOutputs, function(output){
    //console.log('midi out', output, midiEvent.type);
    if(midiEvent.type === 128 || midiEvent.type === 144 || midiEvent.type === 176){
      //console.log(midiEvent.type, midiEvent.data1, midiEvent.data2);
      output.send([midiEvent.type, midiEvent.data1, midiEvent.data2]);
    // }else if(midiEvent.type === 192){
    //     output.send([midiEvent.type + channel, midiEvent.data1]);
    }
    //output.send([midiEvent.status + channel, midiEvent.data1, midiEvent.data2]);
  });

  // @TODO: maybe a track should be able to send its event to both a midi-out port and an internal heartbeat song?
  //console.log(track.routeToMidiOut);
  if(track.routeToMidiOut === false){
    midiEvent.track = track;
    track.instrument.processEvent(midiEvent);
  }
}


function addMidiEventListener(...args){ // caller can be a track or a song

  let id = midiEventListenerId++;
  let listener;
    types = {},
    ids = [],
    loop;


  // should I inline this?
  loop = function(args){
    for(let arg of args){
      let type = typeString(arg);
      //console.log(type);
      if(type === 'array'){
        loop(arg);
      }else if(type === 'function'){
        listener = arg;
      }else if(isNaN(arg) === false){
        arg = parseInt(arg, 10);
        if(sequencer.checkEventType(arg) !== false){
          types[arg] = arg;
        }
      }else if(type === 'string'){
        if(sequencer.checkEventType(arg) !== false){
          arg = sequencer.midiEventNumberByName(arg);
          types[arg] = arg;
        }
      }
    }
  };

  loop(args, 0, args.length);
  //console.log('types', types, 'listener', listener);

  objectForEach(types, function(type){
    //console.log(type);
    if(obj.midiEventListeners[type] === undefined){
      obj.midiEventListeners[type] = {};
    }
    obj.midiEventListeners[type][id] = listener;
    ids.push(type + '_' + id);
  });

  //console.log(obj.midiEventListeners);
  return ids.length === 1 ? ids[0] : ids;
}


function removeMidiEventListener(id, obj){
  var type;
  id = id.split('_');
  type = id[0];
  id = id[1];
  delete obj.midiEventListeners[type][id];
}


function removeMidiEventListeners(){

}

*/
exports.getMIDIInputById = _getMIDIInputById;

},{"./util":38}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrument = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _sample = require('./sample');

var _init_audio = require('./init_audio');

var _note = require('./note');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Instrument = exports.Instrument = function () {
  function Instrument(id, type) {
    _classCallCheck(this, Instrument);

    this.id = id;
    this.type = type;
    // create a samples data object for all 128 velocity levels of all 128 notes
    this.samplesData = new Array(128).fill(-1);
    this.samplesData = this.samplesData.map(function () {
      return new Array(128).fill(-1);
    });

    this.scheduledSamples = {};
    this.sustainedSamples = [];
    this.sustainPedalDown = false;
  }

  _createClass(Instrument, [{
    key: 'connect',
    value: function connect(output) {
      this.output = output;
    }
  }, {
    key: 'processMIDIEvent',
    value: function processMIDIEvent(event, time) {
      var _this = this;

      var sample = void 0,
          sampleData = void 0;
      time = time || event.ticks * 0.0025;
      //console.log(time)

      if (event.type === 144) {
        //console.log(144, ':', time, context.currentTime, event.millis)

        sampleData = this.samplesData[event.data1][event.data2];
        sample = (0, _sample.createSample)(sampleData, event);
        this.scheduledSamples[event.midiNoteId] = sample;
        sample.output.connect(this.output || _init_audio.context.destination);
        sample.start(time);
        //console.log('start', event.midiNoteId)
      } else if (event.type === 128) {
          //console.log(128, ':', time, context.currentTime, event.millis)
          sample = this.scheduledSamples[event.midiNoteId];
          if (typeof sample === 'undefined') {
            console.error('sample not found for event', event);
            return;
          }
          if (this.sustainPedalDown === true) {
            //console.log(event.midiNoteId)
            this.sustainedSamples.push(event.midiNoteId);
          } else {
            sample.stop(time, function () {
              //console.log('stop', event.midiNoteId)
              delete _this.scheduledSamples[event.midiNoteId];
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
                this.sustainedSamples.forEach(function (midiNoteId) {
                  _this.scheduledSamples[midiNoteId].stop(time, function () {
                    //console.log('stop', midiNoteId)
                    delete _this.scheduledSamples[midiNoteId];
                  });
                });
                //console.log('sustain pedal up', this.sustainedSamples)
                this.sustainedSamples = [];
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

    /*
      @param noteId can be note name (C4) or note number (60)
      @param audio buffer
      @param config (optional)
        {
          sustain: [sustainStart, sustainEnd], // optional, in millis
          release: [releaseDuration, releaseEnvelope], // optional
          pan: panPosition // optional
          velocity: [velocityStart, velocityEnd] // optional, for multi-layered instruments
        }
    */

  }, {
    key: 'addSampleData',
    value: function addSampleData(noteId, audioBuffer) {
      var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var _ref$sustain = _ref.sustain;
      var sustain = _ref$sustain === undefined ? [false, false] : _ref$sustain;
      var _ref$release = _ref.release;
      var release = _ref$release === undefined ? [false, 'default'] : _ref$release;
      var _ref$pan = _ref.pan;
      var pan = _ref$pan === undefined ? false : _ref$pan;
      var _ref$velocity = _ref.velocity;
      var velocity = _ref$velocity === undefined ? [0, 127] : _ref$velocity;


      if (audioBuffer instanceof AudioBuffer === false) {
        console.warn('not a valid AudioBuffer instance');
        return;
      }

      var _sustain = _slicedToArray(sustain, 2);

      var sustainStart = _sustain[0];
      var sustainEnd = _sustain[1];

      var _release = _slicedToArray(release, 2);

      var releaseDuration = _release[0];
      var releaseEnvelope = _release[1];

      var _velocity = _slicedToArray(velocity, 2);

      var velocityStart = _velocity[0];
      var velocityEnd = _velocity[1];


      if (sustain.length !== 2) {
        sustainStart = sustainEnd = false;
      }

      if (releaseDuration === false) {
        releaseEnvelope = false;
      }

      // log(sustainStart, sustainEnd);
      // log(releaseDuration, releaseEnvelope);
      // log(panPosition);
      // log(velocityStart, velocityEnd);

      var note = (0, _note.createNote)(noteId);
      console.log(note);
      if (note === false) {
        return;
      }
      noteId = note.number;

      this.samplesData[noteId].fill({
        n: noteId,
        d: audioBuffer,
        s1: sustainStart,
        s2: sustainEnd,
        r: releaseDuration,
        e: releaseEnvelope,
        p: pan
      }, velocityStart, velocityEnd + 1);

      //console.log(this.samplesData[noteId]);
    }
  }, {
    key: 'stopAllSounds',
    value: function stopAllSounds() {
      var _this2 = this;

      console.log('stopAllSounds');
      Object.keys(this.scheduledSamples).forEach(function (sampleId) {
        _this2.scheduledSamples[sampleId].stop(0, function () {
          delete _this2.scheduledSamples[sampleId];
        });
      });
    }
  }]);

  return Instrument;
}();

},{"./init_audio":19,"./note":26,"./sample":31}],22:[function(require,module,exports){
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
      frequency: 440 * Math.pow(2, (data1 - 69) / 12)
    }
  });
  return id;
}

function getMIDIEventId() {
  return 'ME_' + midiEventIndex++ + '_' + new Date().getTime();
}

function moveMIDIEvent(eventId, ticks_to_move) {
  var state = store.getState().editor;
  //let event = state.entities[id]

  var song = state.entities[eventId];
  var event = song.midiEvents[0];
  //console.log(event)

  var ticks = event.ticks + ticks_to_move;
  ticks = ticks < 0 ? 0 : ticks;
  var songId = event.songId || false;
  if (songId) {
    songId = state.entities[songId] ? songId : false;
  }
  //console.log(ticks, songId, event)
  store.dispatch({
    type: _action_types.UPDATE_MIDI_EVENT,
    payload: {
      eventId: event.id,
      ticks: ticks,
      songId: songId
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
  var event = state.entities[id];
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
  var events = state.entities;
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
  var events = store.getState().editor.entities;
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
/*
  Adds a function to create a note object that contains information about a musical note:
    - name, e.g. 'C'
    - octave,  -1 - 9
    - fullName: 'C1'
    - frequency: 234.16, based on the basic pitch
    - number: 60 midi note number

  Adds several utility methods organised around the note object
*/

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNote = createNote;
exports.getNoteNumber = getNoteNumber;
exports.getNoteName = getNoteName;
exports.getNoteOctave = getNoteOctave;
exports.getFullNoteName = getFullNoteName;
exports.getFrequency = getFrequency;
exports.isBlackKey = isBlackKey;

var _util = require('./util');

var errorMsg = void 0,
    warningMsg = void 0,
    pow = Math.pow,
    floor = Math.floor;

var noteNames = {
  'sharp': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  'flat': ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};

/*
  arguments
  - noteNumber: 60
  - noteNumber and notename mode: 60, 'sharp'
  - noteName: 'C#4'
  - name and octave: 'C#', 4
  - note name, octave, note name mode: 'D', 4, 'sharp'
  - data object:
    {
      name: 'C',
      octave: 4
    }
    or
    {
      frequency: 234.16
    }
*/

function createNote() {
  var numArgs = arguments.length,
      data = void 0,
      octave = void 0,
      noteName = void 0,
      noteNumber = void 0,
      noteNameMode = void 0,
      arg0 = arguments.length <= 0 ? undefined : arguments[0],
      arg1 = arguments.length <= 1 ? undefined : arguments[1],
      arg2 = arguments.length <= 2 ? undefined : arguments[2],
      type0 = (0, _util.typeString)(arg0),
      type1 = (0, _util.typeString)(arg1),
      type2 = (0, _util.typeString)(arg2);

  errorMsg = '';
  warningMsg = '';

  // argument: note number
  if (numArgs === 1 && type0 === 'number') {
    if (arg0 < 0 || arg0 > 127) {
      errorMsg = 'please provide a note number >= 0 and <= 127 ' + arg0;
    } else {
      noteNumber = arg0;
      data = _getNoteName(noteNumber);
      noteName = data[0];
      octave = data[1];
    }

    // arguments: full note name
  } else if (numArgs === 1 && type0 === 'string') {
      data = _checkNoteName(arg0);
      if (errorMsg === '') {
        noteName = data[0];
        octave = data[1];
        noteNumber = _getNoteNumber(noteName, octave);
      }

      // arguments: note name, octave
    } else if (numArgs === 2 && type0 === 'string' && type1 === 'number') {
        data = _checkNoteName(arg0, arg1);
        if (errorMsg === '') {
          noteName = data[0];
          octave = data[1];
          noteNumber = _getNoteNumber(noteName, octave);
        }

        // arguments: full note name, note name mode -> for converting between note name modes
      } else if (numArgs === 2 && type0 === 'string' && type1 === 'string') {
          data = _checkNoteName(arg0);
          if (errorMsg === '') {
            noteNameMode = _checkNoteNameMode(arg1);
            noteName = data[0];
            octave = data[1];
            noteNumber = _getNoteNumber(noteName, octave);
          }

          // arguments: note number, note name mode
        } else if (numArgs === 2 && (0, _util.typeString)(arg0) === 'number' && (0, _util.typeString)(arg1) === 'string') {
            if (arg0 < 0 || arg0 > 127) {
              errorMsg = 'please provide a note number >= 0 and <= 127 ' + arg0;
            } else {
              noteNameMode = _checkNoteNameMode(arg1);
              noteNumber = arg0;
              data = _getNoteName(noteNumber, noteNameMode);
              noteName = data[0];
              octave = data[1];
            }

            // arguments: note name, octave, note name mode
          } else if (numArgs === 3 && type0 === 'string' && type1 === 'number' && type2 === 'string') {
              data = _checkNoteName(arg0, arg1);
              if (errorMsg === '') {
                noteNameMode = _checkNoteNameMode(arg2);
                noteName = data[0];
                octave = data[1];
                noteNumber = _getNoteNumber(noteName, octave);
              }
            } else {
              errorMsg = 'wrong arguments, please consult documentation';
            }

  if (errorMsg) {
    console.error(errorMsg);
    return false;
  }

  if (warningMsg) {
    console.warn(warningMsg);
  }

  var note = {
    name: noteName,
    octave: octave,
    fullName: noteName + octave,
    number: noteNumber,
    frequency: _getFrequency(noteNumber),
    blackKey: _isBlackKey(noteNumber)
  };
  Object.freeze(note);
  return note;
}

//function _getNoteName(number, mode = config.get('noteNameMode')) {
function _getNoteName(number) {
  var mode = arguments.length <= 1 || arguments[1] === undefined ? 'sharp' : arguments[1];

  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  var octave = floor(number / 12 - 1);
  var noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}

function _getNoteNumber(name, octave) {
  var keys = Object.keys(noteNames);
  var index = void 0;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var key = _step.value;

      var mode = noteNames[key];
      index = mode.findIndex(function (x) {
        return x === name;
      });
      if (index !== -1) {
        break;
      }
    }

    //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
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

  var number = index + 12 + octave * 12; // → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if (number < 0 || number > 127) {
    errorMsg = 'please provide a note between C0 and G10';
    return;
  }
  return number;
}

function _getFrequency(number) {
  //return config.get('pitch') * pow(2,(number - 69)/12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
  return 440 * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}

// TODO: calculate note from frequency
function _getPitch(hertz) {
  //fm  =  2(m−69)/12(440 Hz).
}

function _checkNoteNameMode(mode) {
  var keys = Object.keys(noteNames);
  var result = keys.find(function (x) {
    return x === mode;
  }) !== undefined;
  if (result === false) {
    //mode = config.get('noteNameMode');
    mode = 'sharp';
    warningMsg = mode + ' is not a valid note name mode, using "' + mode + '" instead';
  }
  return mode;
}

function _checkNoteName() {
  var numArgs = arguments.length,
      arg0 = arguments.length <= 0 ? undefined : arguments[0],
      arg1 = arguments.length <= 1 ? undefined : arguments[1],
      char = void 0,
      name = '',
      octave = '';

  // extract octave from note name
  if (numArgs === 1) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = arg0[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        char = _step2.value;

        if (isNaN(char) && char !== '-') {
          name += char;
        } else {
          octave += char;
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

    if (octave === '') {
      octave = 0;
    }
  } else if (numArgs === 2) {
    name = arg0;
    octave = arg1;
  }

  // check if note name is valid
  var keys = Object.keys(noteNames);
  var index = -1;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      var mode = noteNames[key];
      index = mode.findIndex(function (x) {
        return x === name;
      });
      if (index !== -1) {
        break;
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

  if (index === -1) {
    errorMsg = arg0 + ' is not a valid note name, please use letters A - G and if necessary an accidental like #, ##, b or bb, followed by a number for the octave';
    return;
  }

  if (octave < -1 || octave > 9) {
    errorMsg = 'please provide an octave between -1 and 9';
    return;
  }

  octave = parseInt(octave, 10);
  name = name.substring(0, 1).toUpperCase() + name.substring(1);

  //console.log(name,'|',octave);
  return [name, octave];
}

function _isBlackKey(noteNumber) {
  var black = void 0;

  switch (true) {
    case noteNumber % 12 === 1: //C#
    case noteNumber % 12 === 3: //D#
    case noteNumber % 12 === 6: //F#
    case noteNumber % 12 === 8: //G#
    case noteNumber % 12 === 10:
      //A#
      black = true;
      break;
    default:
      black = false;
  }

  return black;
}

function getNoteNumber() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.number;
  }
  return errorMsg;
}

function getNoteName() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.name;
  }
  return false;
}

function getNoteOctave() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.octave;
  }
  return false;
}

function getFullNoteName() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.fullName;
  }
  return false;
}

function getFrequency() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.frequency;
  }
  return false;
}

function isBlackKey() {
  var note = createNote.apply(undefined, arguments);
  if (note) {
    return note.blackKey;
  }
  return false;
}

},{"./util":38}],27:[function(require,module,exports){
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
  if (diffTicks < 0) {
    console.log(diffTicks, event.ticks, previousEvent.ticks, previousEvent.type);
  }
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

  // noteoff comes before noteon

  /*
    events.sort(function(a, b){
      return a.sortIndex - b.sortIndex;
    })
  */

  events.sort(function (a, b) {
    if (a.ticks === b.ticks) {
      // if(a.type === 128){
      //   return -1
      // }else if(b.type === 128){
      //   return 1
      // }
      // short:
      var r = a.type - b.type;
      if (a.type === 176 && b.type === 144) {
        r = -1;
      }
      return r;
    }
    return a.ticks - b.ticks;
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

},{"./util":38}],28:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],29:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = exports.parseMIDIFile = exports.Instrument = exports.addMIDIEvents = exports.createPart = exports.setMIDIOutputIds = exports.setInstrument = exports.addParts = exports.createTrack = exports.getTrackIds = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = exports.getMIDIOutputsById = exports.getMIDIInputsById = exports.getMIDIOutputIds = exports.getMIDIInputIds = exports.getMIDIOutputs = exports.getMIDIInputs = exports.getMIDIAccess = exports.setMasterVolume = exports.getMasterVolume = exports.getAudioContext = exports.init = exports.parseSamples = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var _midifile = require('./midifile');

var _song_from_midifile = require('./song_from_midifile');

var _instrument = require('./instrument');

var _init = require('./init');

var _init_audio = require('./init_audio');

var _init_midi = require('./init_midi');

var _util = require('./util');

var getAudioContext = function getAudioContext() {
  return _init_audio.context;
};

var qambi = {
  version: '0.0.1',

  // from ./util
  parseSamples: _util.parseSamples,

  // from ./init
  init: _init.init,

  // from ./init_audio
  getAudioContext: getAudioContext,
  getMasterVolume: _init_audio.getMasterVolume,
  setMasterVolume: _init_audio.setMasterVolume,

  // ./init_midi
  getMIDIAccess: _init_midi.getMIDIAccess,
  getMIDIInputs: _init_midi.getMIDIInputs,
  getMIDIOutputs: _init_midi.getMIDIOutputs,
  getMIDIInputIds: _init_midi.getMIDIInputIds,
  getMIDIOutputIds: _init_midi.getMIDIOutputIds,
  getMIDIInputsById: _init_midi.getMIDIInputsById,
  getMIDIOutputsById: _init_midi.getMIDIOutputsById,

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
  getTrackIds: _song.getTrackIds,

  // from ./track
  createTrack: _track.createTrack,
  addParts: _track.addParts,
  setInstrument: _track.setInstrument,
  setMIDIOutputIds: _track.setMIDIOutputIds,

  // from ./part
  createPart: _part.createPart,
  addMIDIEvents: _part.addMIDIEvents,

  // from ./instrument
  Instrument: _instrument.Instrument,

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
// from ./util
parseSamples = _util.parseSamples;
exports.

// from ./init
init = _init.init;
exports.

// from ./init_audio
getAudioContext = getAudioContext;
exports.getMasterVolume = _init_audio.getMasterVolume;
exports.setMasterVolume = _init_audio.setMasterVolume;
exports.

// ./init_midi
getMIDIAccess = _init_midi.getMIDIAccess;
exports.getMIDIInputs = _init_midi.getMIDIInputs;
exports.getMIDIOutputs = _init_midi.getMIDIOutputs;
exports.getMIDIInputIds = _init_midi.getMIDIInputIds;
exports.getMIDIOutputIds = _init_midi.getMIDIOutputIds;
exports.getMIDIInputsById = _init_midi.getMIDIInputsById;
exports.getMIDIOutputsById = _init_midi.getMIDIOutputsById;
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
exports.getTrackIds = _song.getTrackIds;
exports.

// from ./track
createTrack = _track.createTrack;
exports.addParts = _track.addParts;
exports.setInstrument = _track.setInstrument;
exports.setMIDIOutputIds = _track.setMIDIOutputIds;
exports.

// from ./part
createPart = _part.createPart;
exports.addMIDIEvents = _part.addMIDIEvents;
exports.

// from ./instrument
Instrument = _instrument.Instrument;
exports.

//  MIDI,

parseMIDIFile = _midifile.parseMIDIFile;
exports.songFromMIDIFile = _song_from_midifile.songFromMIDIFile;

},{"./init":18,"./init_audio":19,"./init_midi":20,"./instrument":21,"./midi_event":22,"./midi_note":23,"./midifile":25,"./part":28,"./song":34,"./song_from_midifile":35,"./track":37,"./util":38}],30:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _redux = require('redux');

var _action_types = require('./action_types');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var initialState = {
  entities: {}
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
    case _action_types.CREATE_TRACK:
    case _action_types.CREATE_PART:
    case _action_types.CREATE_MIDI_EVENT:
    case _action_types.CREATE_MIDI_NOTE:
      state = _extends({}, state);
      state.entities[action.payload.id] = action.payload;
      break;

    case _action_types.ADD_TRACKS:
      state = _extends({}, state);
      songId = action.payload.song_id;
      song = state.entities[songId];
      if (song) {
        var trackIds = action.payload.track_ids;
        trackIds.forEach(function (trackId) {
          var track = state.entities[trackId];
          if (track) {
            (function () {
              var _song$newEventIds;

              song.trackIds.push(trackId);
              track.songId = songId;
              var midiEventIds = [];
              track.partIds.forEach(function (partId) {
                var part = state.entities[partId];
                song.partIds.push(partId);
                midiEventIds.push.apply(midiEventIds, _toConsumableArray(part.midiEventIds));
              });
              midiEventIds.forEach(function (eventId) {
                event = state.entities[eventId];
                event.songId = songId;
              });
              (_song$newEventIds = song.newEventIds).push.apply(_song$newEventIds, midiEventIds);
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
      var track = state.entities[trackId];
      if (track) {
        //track.parts.push(...action.payload.part_ids)
        var partIds = action.payload.part_ids;
        partIds.forEach(function (id) {
          var part = state.entities[id];
          if (part) {
            track.partIds.push(id);
            part.trackId = trackId;
            part.midiEventIds.forEach(function (id) {
              event = state.entities[id];
              event.trackId = trackId;
              //event.instrumentId = track.instrumentId
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
      var part = state.entities[partId];
      if (part) {
        //part.midiEvents.push(...action.payload.midi_event_ids)
        var midiEventIds = action.payload.midi_event_ids;
        midiEventIds.forEach(function (id) {
          var midiEvent = state.entities[id];
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
      eventId = action.payload.eventId;
      event = state.entities[eventId];
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
      if (action.payload.songId !== false) {
        song = state.entities[action.payload.songId];
        song.movedEventIds.push(eventId);
      }
      break;

    case _action_types.UPDATE_MIDI_NOTE:
      state = _extends({}, state);
      var note = state.entities[action.payload.id];
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
      song = state.entities[action.payload.songId];


      // song.midiEventsMap.forEach(function(eventId, event){
      //   // replace event with updated event
      //   state.entities[eventId] = event;
      // })
      var _action$payload3 = action.payload;
      song.updateTimeEvents = _action$payload3.updateTimeEvents;
      song.midiEvents = _action$payload3.midiEvents;
      song.midiEventsMap = _action$payload3.midiEventsMap;
      song.newEventIds = _action$payload3.newEventIds;
      song.movedEventIds = _action$payload3.movedEventIds;
      song.removedEventIds = _action$payload3.removedEventIds;
      song.midiEvents.forEach(function (event) {
        // replace event with updated event
        state.entities[event.id] = event;
      });
      break;

    case _action_types.SET_INSTRUMENT:
      state = _extends({}, state);
      state.entities[action.payload.trackId].instrument = action.payload.instrument;
      break;

    case _action_types.SET_MIDI_OUTPUT_IDS:
      state = _extends({}, state);
      state.entities[action.payload.trackId].MIDIOutputIds = action.payload.outputIds;
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
      state.songs[action.payload.songId] = {
        songId: action.payload.songId,
        midiEvents: action.payload.midiEvents,
        settings: action.payload.settings,
        playing: false
      };
      break;

    case _action_types.START_SCHEDULER:
      state = _extends({}, state);
      state.songs[action.payload.songId].scheduler = action.payload.scheduler;
      state.songs[action.payload.songId].playing = true;
      break;

    case _action_types.STOP_SCHEDULER:
      state = _extends({}, state);
      delete state.songs[action.payload.songId].scheduler;
      state.songs[action.payload.songId].playing = false;
      break;

    case _action_types.SONG_POSITION:
      state = _extends({}, state);
      state.songs[action.payload.songId].position = action.payload.position;
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

},{"./action_types":15,"redux":12}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.fadeOut = fadeOut;
exports.getEqualPowerCurve = getEqualPowerCurve;
exports.createSample = createSample;

var _init_audio = require('./init_audio.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//import {getEqualPowerCurve} from './util.js'

var Sample = function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    this.event = event;
    this.sampleData = sampleData;
    if (this.sampleData === -1) {
      // create simple synth sample
      this.source = _init_audio.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
    } else {
      this.source = _init_audio.context.createBufferSource();
      this.source.buffer = sampleData.d;
      //console.log(this.source.buffer)
    }
    this.output = _init_audio.context.createGain();
    this.volume = event.data2 / 127;
    this.output.gain.value = this.volume;
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
      if (this.sampleData.r && this.sampleData.e) {
        this.source.stop(time + this.sampleData.r);
        fadeOut(this.output, {
          releaseEnvelope: this.sampleData.e,
          releaseDuration: this.sampleData.r
        });
      } else {
        this.source.stop(time);
      }

      this.source.onended = cb;
    }
  }]);

  return Sample;
}();

function fadeOut(gainNode, settings) {
  var now = _init_audio.context.currentTime;
  var values = void 0,
      i = void 0,
      maxi = void 0;

  //console.log(settings.releaseEnvelope)
  switch (settings.releaseEnvelope) {

    case 'linear':
      gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now);
      gainNode.gain.linearRampToValueAtTime(0, now + settings.releaseDuration);
      break;

    case 'equal power':
      values = getEqualPowerCurve(100, 'fadeOut', gainNode.gain.value);
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration);
      break;

    case 'array':
      maxi = settings.releaseEnvelopeArray.length;
      values = new Float32Array(maxi);
      for (i = 0; i < maxi; i++) {
        values[i] = settings.releaseEnvelopeArray[i] * gainNode.gain.value;
      }
      gainNode.gain.setValueCurveAtTime(values, now, settings.releaseDuration);
      break;

    default:
  }
}

function getEqualPowerCurve(numSteps, type, maxValue) {
  var i = void 0,
      value = void 0,
      percent = void 0,
      values = new Float32Array(numSteps);

  for (i = 0; i < numSteps; i++) {
    percent = i / numSteps;
    if (type === 'fadeIn') {
      value = Math.cos((1.0 - percent) * 0.5 * Math.PI) * maxValue;
    } else if (type === 'fadeOut') {
      value = Math.cos(percent * 0.5 * Math.PI) * maxValue;
    }
    values[i] = value;
    if (i === numSteps - 1) {
      values[i] = type === 'fadeIn' ? 1 : 0;
    }
  }
  return values;
}

function createSample() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  return new (Function.prototype.bind.apply(Sample, [null].concat(args)))();
}

},{"./init_audio.js":19}],32:[function(require,module,exports){
module.exports={
  "emptyOgg": "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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=",
  "emptyMp3": "//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=",
  "hightick": "UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA",
  "lowtick": "UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==",
}
},{}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _init_midi = require('./init_midi');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BUFFER_TIME = 200; // millis
var PRE_BUFFER = 200;

var Scheduler = function () {
  function Scheduler(data) {
    _classCallCheck(this, Scheduler);

    this.songId = data.songId;
    this.songStartPosition = data.startPosition;
    this.timeStamp = data.timeStamp;
    this.events = data.midiEvents;
    this.parts = data.parts;
    this.tracks = data.tracks;
    var _data$settings = data.settings;
    this.bars = _data$settings.bars;
    this.loop = _data$settings.loop;

    this.numEvents = this.events.length;
    this.time = 0;
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
      var i, event, numEvents, track, events, instrument;

      this.maxtime = position + BUFFER_TIME;
      events = this.getEvents();
      numEvents = events.length;

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = this.tracks[event.trackId];
        instrument = track.instrument;

        // if(typeof instrument === 'undefined'){
        //   continue
        // }

        if (this.parts[event.partId].mute === true || track.mute === true || event.mute === true) {
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

        this.time = this.timeStamp + event.millis - this.songStartPosition;

        if (event.type === 'audio') {
          // to be implemented
        } else {
            var channel = track.channel;
            var time = this.time + BUFFER_TIME;
            // send to external hardware or software instrument
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = track.MIDIOutputIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var portId = _step2.value;

                var port = (0, _init_midi.getMIDIOutputById)(portId);
                if (event.type === 128 || event.type === 144 || event.type === 176) {
                  //midiOutput.send([event.type, event.data1, event.data2], this.time + sequencer.midiOutLatency);
                  port.send([event.type + channel, event.data1, event.data2], time);
                } else if (event.type === 192 || event.type === 224) {
                  port.send([event.type + channel, event.data1], time);
                }
              }

              // send to javascript instrument
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

            if (typeof instrument !== 'undefined') {
              this.time /= 1000; // convert to seconds because the audio context uses seconds for scheduling
              instrument.processMIDIEvent(event, this.time, this.tracks[event.trackId].output);
            }
          }
      }
      //console.log(this.index, this.numEvents)
      //return this.index >= 10
      return this.index >= this.numEvents; // end of song
    }
  }, {
    key: 'stopAllSounds',
    value: function stopAllSounds(time) {
      var _this = this;

      Object.keys(this.tracks).forEach(function (trackId) {
        var track = _this.tracks[trackId];
        var instrument = track.instrument;
        if (typeof instrument !== 'undefined') {
          instrument.stopAllSounds();
        }
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = track.MIDIOutputIds[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var portId = _step3.value;

            var port = (0, _init_midi.getMIDIOutputById)(portId);
            port.send([0xB0, 0x7B, 0x00], _this.time + 0.0); // stop all notes
            port.send([0xB0, 0x79, 0x00], _this.time + 0.0); // reset all controllers
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
      });
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

},{"./init_midi":20}],34:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createSong = createSong;
exports.addTracks = addTracks;
exports.getTrackIds = getTrackIds;
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

function getSong(songId) {
  var state = store.getState().editor;
  var song = state.entities[songId];
  if (typeof song === 'undefined') {
    return false;
  }
  return song;
}

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
  var midiEventIds = _settings$midiEventId === undefined ? {} : _settings$midiEventId;
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
      midiEvents: [],
      // midiEventsMap: {},
      midiEventsMap: new Map(),
      partIds: partIds,
      trackIds: trackIds,
      dirty: false,
      updateTimeEvents: true,
      settings: s,
      newEventIds: [],
      movedEventIds: [],
      transposedEventIds: [],
      removedEventIds: []
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

function getTrackIds(songId) {
  var song = getSong(songId);
  if (song === false) {
    console.warn('no song found with id ' + songId);
    return [];
  }
  return [].concat(_toConsumableArray(song.trackIds));
}

function addTimeEvents() {}

// prepare song events for playback
function updateSong(songId) {
  var filter_events = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var state = store.getState().editor;
  var song = _extends({}, state.entities[songId]); // clone!
  if (typeof song !== 'undefined') {
    (function () {
      console.time('update song');

      // check if time events are updated
      if (song.updateTimeEvents === true) {
        console.log('updateTimeEvents', song.timeEvents.length);
        (0, _parse_events.parseTimeEvents)(song.settings, song.timeEvents);
        song.updateTimeEvents = false;
      }

      // only parse new and moved events
      var tobeParsed = [];

      // filter removed events
      song.removedEventIds.forEach(function (eventId) {
        song.midiEventsMap.delete(eventId);
        //delete song.midiEventsMap[eventId]
      });

      // add new events
      song.newEventIds.forEach(function (eventId) {
        var event = state.entities[eventId];
        song.midiEventsMap.set(eventId, event);
        //song.midiEventsMap[eventId] = event
        tobeParsed.push(event);
      });

      // moved events need to be parsed
      song.movedEventIds.forEach(function (eventId) {
        var event = state.entities[eventId];
        tobeParsed.push(event);
      });

      //console.time('parse')
      if (tobeParsed.length > 0) {
        tobeParsed = [].concat(_toConsumableArray(tobeParsed), _toConsumableArray(song.timeEvents));
        console.log('parseEvents', tobeParsed.length - song.timeEvents.length);
        tobeParsed = (0, _parse_events.parseEvents)(tobeParsed);
        (0, _parse_events.parseMIDINotes)(tobeParsed);
      }
      //console.timeEnd('parse')

      //console.time('sort')
      var midiEvents = Array.from(song.midiEventsMap.values());
      /*
      let midiEvents = []
      let midiEventsMap = song.midiEventsMap
      Object.keys(midiEventsMap).forEach(function(key){
        midiEvents.push(midiEventsMap[key])
      })
      */

      midiEvents.sort(function (a, b) {
        if (a.ticks === b.ticks) {
          var r = a.type - b.type;
          if (a.type === 176 && b.type === 144) {
            r = -1;
          }
          return r;
        }
        return a.ticks - b.ticks;
      });
      //console.timeEnd('sort')

      store.dispatch({
        type: _action_types.UPDATE_SONG,
        payload: {
          songId: songId,
          midiEvents: midiEvents,
          midiEventsMap: song.midiEventsMap,
          newEventIds: [],
          movedEventIds: [],
          removedEventIds: [],
          updateTimeEvents: false,
          settings: song.settings // needed for the sequencer reducer
        }
      });
      console.timeEnd('update song');
    })();
  } else {
    console.warn('no song found with id ' + songId);
  }
}

function getParts(songId) {
  var entities = store.getState().editor.entities;
}

function startSong(songId) {
  var startPosition = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


  function createScheduler() {
    var entities = store.getState().editor.entities;
    var songData = entities[songId];
    // console.log(songData)
    var parts = {};
    songData.partIds.forEach(function (partId) {
      parts[partId] = entities[partId];
    });
    var tracks = {};
    songData.trackIds.forEach(function (trackId) {
      tracks[trackId] = entities[trackId];
    });

    var midiEvents = songData.midiEvents; //Array.from(store.getState().sequencer.songs[songId].midiEvents.values())
    var position = startPosition;
    var timeStamp = _init_audio.context.currentTime * 1000; // -> convert to millis
    var scheduler = new _scheduler2.default({
      songId: songId,
      startPosition: startPosition,
      timeStamp: timeStamp,
      parts: parts,
      tracks: tracks,
      midiEvents: midiEvents,
      settings: songData.settings
    });

    store.dispatch({
      type: _action_types.START_SCHEDULER,
      payload: {
        songId: songId,
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
        stopSong(songId);
      }
      store.dispatch({
        type: _action_types.SONG_POSITION,
        payload: {
          songId: songId,
          position: position
        }
      });
    };
  }

  (0, _heartbeat.addTask)('repetitive', songId, createScheduler());
}

function stopSong(songId) {
  var state = store.getState();
  var songData = state.sequencer.songs[songId];
  if (songData) {
    if (songData.playing) {
      (0, _heartbeat.removeTask)('repetitive', songId);
      songData.scheduler.stopAllSounds(_init_audio.context.currentTime);
      store.dispatch({
        type: _action_types.STOP_SCHEDULER,
        payload: {
          songId: songId
        }
      });
    }
  } else {
    console.error('no song found with id ' + songId);
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

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./init_audio":19,"./midi_event":22,"./parse_events":27,"./qambi":29,"./scheduler":33}],35:[function(require,module,exports){
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

},{"./instrument":21,"./midi_event":22,"./midifile":25,"./part":28,"./song":34,"./track":37,"isomorphic-fetch":1}],36:[function(require,module,exports){
'use strict';

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

_qambi2.default.getMasterVolume();
_qambi2.default.log('functions');
_qambi2.default.init().then(function (data) {
  console.log(data, _qambi2.default.getMasterVolume());
  (0, _qambi.setMasterVolume)(0.5);
});

document.addEventListener('DOMContentLoaded', function () {

  var buttonStart = document.getElementById('start');
  var buttonStop = document.getElementById('stop');
  var buttonMove = document.getElementById('move');
  buttonStart.disabled = true;
  buttonStop.disabled = true;

  var test = 4;
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
    var _ticks = 0;
    var type = 144;

    for (var i = 0; i < 100; i++) {
      events.push((0, _qambi.createMIDIEvent)(_ticks, type, 60, 100));
      if (i % 2 === 0) {
        type = 128;
        _ticks += 960;
      } else {
        type = 144;
        _ticks += 960;
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
      var instrument = new _qambi.Instrument();
      (0, _qambi.getTrackIds)(songId).forEach(function (trackId) {
        (0, _qambi.setInstrument)(trackId, instrument);
        _qambi.setMIDIOutputIds.apply(undefined, [trackId].concat(_toConsumableArray((0, _qambi.getMIDIOutputIds)())));
      });
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      buttonStart.disabled = false;
      buttonStop.disabled = false;
    });
  }

  if (test === 3) {
    (function () {
      var instrument = new _qambi.Instrument();
      (0, _qambi.parseSamples)({
        c4: '../data/TP01d-ElectricPiano-000-060-c3.wav'
      }).then(function onFulfilled(buffers) {
        //console.log(buffers);
        instrument.addSampleData(60, buffers.c4, {
          sustain: [0],
          release: [4, 'equal power']
        });
        instrument.processMIDIEvent({ ticks: 0, type: 144, data1: 60, data2: 100 });
        instrument.processMIDIEvent({ ticks: 200, type: 128, data1: 60, data2: 0 });
        // instrument.processMIDIEvent({ticks: 240, type: 144, data1: 60, data2: 100})
        // instrument.processMIDIEvent({ticks: 440, type: 128, data1: 60, data2: 0})
        // instrument.processMIDIEvent({ticks: 480, type: 144, data1: 60, data2: 100})
        // instrument.processMIDIEvent({ticks: 720, type: 128, data1: 60, data2: 0})
      }, function onRejected(e) {
        console.warn(e);
      });
    })();
  }

  var ticks = 0;
  var midiEventId = 0;

  if (test === 4) {
    //fetch('mozk545a.mid')
    (0, _isomorphicFetch2.default)('minute_waltz.mid').then(function (response) {
      return response.arrayBuffer();
    }, function (error) {
      console.error(error);
    }).then(function (ab) {
      //songId = songFromMIDIFile(parseMIDIFile(ab))
      var mf = (0, _qambi.parseMIDIFile)(ab);
      songId = (0, _qambi.songFromMIDIFile)(mf);
      var instrument = new _qambi.Instrument();
      (0, _qambi.getTrackIds)(songId).forEach(function (trackId) {
        (0, _qambi.setInstrument)(trackId, instrument);
        _qambi.setMIDIOutputIds.apply(undefined, [trackId].concat(_toConsumableArray((0, _qambi.getMIDIOutputIds)())));
      });
      //console.log('header:', mf.header)
      //console.log('# tracks:', mf.tracks.size)
      buttonStart.disabled = false;
      buttonStop.disabled = false;
      //midiEventId = getEvent
    });
  }

  buttonStart.addEventListener('click', function () {
    (0, _qambi.startSong)(songId, 0);
  });

  buttonStop.addEventListener('click', function () {
    (0, _qambi.stopSong)(songId);
  });

  buttonMove.addEventListener('click', function () {
    //moveMIDIEvent(midiEventId, ++ticks)
    (0, _qambi.moveMIDIEvent)(songId, ++ticks);
    (0, _qambi.updateSong)(songId);
  });
});

},{"./qambi":29,"isomorphic-fetch":1}],37:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTrack = createTrack;
exports.addParts = addParts;
exports.setInstrument = setInstrument;
exports.setMIDIOutputIds = setMIDIOutputIds;
exports.muteTrack = muteTrack;
exports.setVolumeTrack = setVolumeTrack;
exports.setPanningTrack = setPanningTrack;

var _init_audio = require('./init_audio');

var _create_store = require('./create_store');

var _instrument = require('./instrument');

var _instrument2 = _interopRequireDefault(_instrument);

var _action_types = require('./action_types');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var store = (0, _create_store.getStore)();
var trackIndex = 0;

function getTrack(trackId) {
  var track = store.getState().editor.entities[trackId];
  if (typeof track === 'undefined') {
    console.warn('No track found with id ' + trackId);
    return false;
  }
  return track;
}

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
      channel: 0,
      mute: false,
      MIDIOutputIds: []
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

function setInstrument(trackId, instrument) {
  var track = getTrack(trackId);
  if (track === false) {
    return;
  }

  if (typeof instrument.connect !== 'function' || typeof instrument.processMIDIEvent !== 'function' || typeof instrument.stopAllSounds !== 'function') {
    console.warn('An instrument should implement the methods processMIDIEvent() and stopAllSounds()');
    return;
  }

  instrument.connect(track.output);

  store.dispatch({
    type: _action_types.SET_INSTRUMENT,
    payload: {
      trackId: trackId,
      instrument: instrument
    }
  });
}

function setMIDIOutputIds(trackId) {
  for (var _len2 = arguments.length, outputIds = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    outputIds[_key2 - 1] = arguments[_key2];
  }

  if (getTrack(trackId) === false) {
    return;
  }
  store.dispatch({
    type: _action_types.SET_MIDI_OUTPUT_IDS,
    payload: {
      trackId: trackId,
      outputIds: outputIds
    }
  });
  //console.log(trackId, outputIds)
}

function muteTrack(flag) {}

function setVolumeTrack(flag) {}

function setPanningTrack(flag) {}

},{"./action_types":15,"./create_store":16,"./init_audio":19,"./instrument":21}],38:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.getNiceTime = getNiceTime;
exports.parseSample = parseSample;
exports.parseSamples = parseSamples;
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
        if (typeof id !== 'undefined') {
          resolve({ id: id, buffer: buffer });
          if (every) {
            every({ id: id, buffer: buffer });
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
        if (typeof id !== 'undefined') {
          resolve({ id: id });
        } else {
          resolve();
        }
      });
    } catch (e) {
      //console.log('error decoding audiodata', id, e);
      //reject(e); -> do not reject, this stops parsing the ohter samples
      if (typeof id !== 'undefined') {
        resolve({ id: id });
      } else {
        resolve();
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  var executor = function executor(resolve, reject) {
    (0, _isomorphicFetch2.default)(url).then(function (response) {
      if (response.ok) {
        response.arrayBuffer().then(function (data) {
          //console.log(data)
          parseSample(data, id, every).then(resolve, reject);
        });
      } else {
        if (typeof id !== 'undefined') {
          resolve({ id: id });
        } else {
          resolve();
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
    Promise.all(promises).then(function (values) {
      if (type === 'object') {
        mapping = {};
        values.forEach(function (value) {
          mapping[value.id] = value.buffer;
        });
        resolve(mapping);
      } else if (type === 'array') {
        resolve(values);
      }
    });
  });
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

},{"./init_audio":19,"isomorphic-fetch":1}]},{},[36])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSG9zdE9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pbml0LmpzIiwic3JjL2luaXRfYXVkaW8uanMiLCJzcmMvaW5pdF9taWRpLmpzIiwic3JjL2luc3RydW1lbnQuanMiLCJzcmMvbWlkaV9ldmVudC5qcyIsInNyYy9taWRpX25vdGUuanMiLCJzcmMvbWlkaV9zdHJlYW0uanMiLCJzcmMvbWlkaWZpbGUuanMiLCJzcmMvbm90ZS5qcyIsInNyYy9wYXJzZV9ldmVudHMuanMiLCJzcmMvcGFydC5qcyIsInNyYy9xYW1iaS5qcyIsInNyYy9yZWR1Y2VyLmpzIiwic3JjL3NhbXBsZS5qcyIsInNyYy9zYW1wbGVzLmpzb24iLCJzcmMvc2NoZWR1bGVyLmpzIiwic3JjL3NvbmcuanMiLCJzcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwic3JjL3Rlc3Rfd2ViLmpzIiwic3JjL3RyYWNrLmpzIiwic3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzlIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ3ZOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7OztBQzNYTyxJQUFNLHNDQUFlLGNBQWY7QUFDTixJQUFNLGdDQUFZLFdBQVo7QUFDTixJQUFNLDBDQUFpQixnQkFBakI7QUFDTixJQUFNLG9EQUFzQixxQkFBdEI7OztBQUlOLElBQU0sb0NBQWMsYUFBZDtBQUNOLElBQU0sa0NBQWEsWUFBYjtBQUNOLElBQU0sNENBQWtCLGlCQUFsQjtBQUNOLElBQU0sb0NBQWMsYUFBZDtBQUNOLElBQU0sNENBQWtCLGlCQUFsQjs7O0FBSU4sSUFBTSxvQ0FBYyxhQUFkOzs7QUFJTixJQUFNLGdEQUFvQixtQkFBcEI7QUFDTixJQUFNLGdEQUFvQixtQkFBcEI7OztBQUlOLElBQU0sd0NBQWdCLGVBQWhCO0FBQ04sSUFBTSxnQ0FBWSxXQUFaO0FBQ04sSUFBTSxrQ0FBYSxZQUFiO0FBQ04sSUFBTSxnQ0FBWSxXQUFaO0FBQ04sSUFBTSw0Q0FBa0IsaUJBQWxCO0FBQ04sSUFBTSwwQ0FBaUIsZ0JBQWpCOzs7QUFJTixJQUFNLHdDQUFnQixlQUFoQjs7Ozs7Ozs7O1FDdEJHOztBQXJCaEI7O0FBR0E7Ozs7OztBQUVPLElBQU0sc0JBQVEsWUFBVTs7QUFFN0IsU0FBTyxNQUFQLENBRjZCO0NBQVYsRUFBUjs7Ozs7QUFLYixJQUFNLFFBQVEsMENBQVI7Ozs7Ozs7Ozs7O0FBV0MsU0FBUyxRQUFULEdBQW1COztBQUV4QixTQUFPLEtBQVAsQ0FGd0I7Q0FBbkI7Ozs7Ozs7Ozs7O1FDb0JTO1FBS0E7O0FBN0NoQjs7QUFDQTs7QUFHQSxJQUFJLGFBQWEsSUFBSSxHQUFKLEVBQWI7QUFDSixJQUFJLGtCQUFrQixJQUFJLEdBQUosRUFBbEI7QUFDSixJQUFJLGlCQUFpQixJQUFJLEdBQUosRUFBakI7QUFDSixJQUFJLFFBQVEsSUFBSSxHQUFKLEVBQVI7QUFDSixJQUFJLHNCQUFKOztBQUVBLFNBQVMsU0FBVCxDQUFtQixTQUFuQixFQUE2QjtBQUMzQixNQUFJLE1BQU0sb0JBQVEsV0FBUjs7O0FBRGlCOzs7OztBQUkzQix5QkFBdUIsb0NBQXZCLG9HQUFrQzs7O1VBQXpCLHFCQUF5QjtVQUFwQixzQkFBb0I7O0FBQ2hDLFVBQUcsS0FBSyxJQUFMLElBQWEsR0FBYixFQUFpQjtBQUNsQixhQUFLLE9BQUwsQ0FBYSxHQUFiLEVBRGtCO0FBRWxCLG1CQUFXLE1BQVgsQ0FBa0IsR0FBbEIsRUFGa0I7T0FBcEI7S0FERjs7Ozs7Ozs7Ozs7Ozs7OztHQUoyQjs7Ozs7OztBQWEzQiwwQkFBZ0IsZUFBZSxNQUFmLDZCQUFoQix3R0FBd0M7VUFBaEMsb0JBQWdDOztBQUN0QyxXQUFLLEdBQUwsRUFEc0M7S0FBeEM7Ozs7Ozs7Ozs7Ozs7Ozs7R0FiMkI7Ozs7Ozs7QUFrQjNCLDBCQUFnQixnQkFBZ0IsTUFBaEIsNkJBQWhCLHdHQUF5QztVQUFqQyxxQkFBaUM7O0FBQ3ZDLFlBQUssR0FBTCxFQUR1QztLQUF6Qzs7Ozs7Ozs7Ozs7Ozs7R0FsQjJCOztBQXNCM0Isa0JBQWdCLFNBQWhCLENBdEIyQjtBQXVCM0IsaUJBQWUsS0FBZjs7O0FBdkIyQixrQ0EwQjNCLENBQXNCLFNBQXRCLEVBMUIyQjtDQUE3Qjs7QUE4Qk8sU0FBUyxPQUFULENBQWlCLElBQWpCLEVBQXVCLEVBQXZCLEVBQTJCLElBQTNCLEVBQWdDO0FBQ3JDLE1BQUksTUFBTSxNQUFNLEdBQU4sQ0FBVSxJQUFWLENBQU4sQ0FEaUM7QUFFckMsTUFBSSxHQUFKLENBQVEsRUFBUixFQUFZLElBQVosRUFGcUM7Q0FBaEM7O0FBS0EsU0FBUyxVQUFULENBQW9CLElBQXBCLEVBQTBCLEVBQTFCLEVBQTZCO0FBQ2xDLE1BQUksTUFBTSxNQUFNLEdBQU4sQ0FBVSxJQUFWLENBQU4sQ0FEOEI7QUFFbEMsTUFBSSxNQUFKLENBQVcsRUFBWCxFQUZrQztDQUE3Qjs7QUFLUCxDQUFDLFNBQVMsS0FBVCxHQUFnQjtBQUNmLFFBQU0sR0FBTixDQUFVLE9BQVYsRUFBbUIsVUFBbkIsRUFEZTtBQUVmLFFBQU0sR0FBTixDQUFVLFlBQVYsRUFBd0IsZUFBeEIsRUFGZTtBQUdmLFFBQU0sR0FBTixDQUFVLFdBQVYsRUFBdUIsY0FBdkIsRUFIZTtBQUlmLGNBSmU7Q0FBaEIsR0FBRDs7Ozs7Ozs7O1FDZGdCOztBQXJDaEI7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBRUEsSUFBTSxRQUFRLDZCQUFSOztBQUVDLElBQUksc0NBQWUsWUFBTztBQUMvQixNQUFHLE9BQU8sU0FBUCxLQUFxQixXQUFyQixFQUFpQztBQUNsQyxXQUFPLFVBQVUsWUFBVixJQUEwQixVQUFVLGtCQUFWLElBQWdDLFVBQVUsZUFBVixJQUE2QixVQUFVLGNBQVYsQ0FENUQ7R0FBcEM7QUFHQSxTQUFPLFlBQVU7QUFDZixZQUFRLElBQVIsQ0FBYSwrQkFBYixFQURlO0dBQVYsQ0FKd0I7Q0FBTixFQUFoQjs7QUFVSixJQUFJLHdEQUF3QixZQUFPO0FBQ3hDLE1BQUcsT0FBTyxTQUFQLEtBQXFCLFdBQXJCLEVBQWlDO0FBQ2xDLFdBQU8sT0FBTyxxQkFBUCxJQUFnQyxPQUFPLDJCQUFQLENBREw7R0FBcEM7QUFHQSxTQUFPLFlBQVU7QUFDZixZQUFRLElBQVIsQ0FBYSx3Q0FBYixFQURlO0dBQVYsQ0FKaUM7Q0FBTixFQUF6Qjs7QUFVSixJQUFJLHNCQUFPLFlBQU87QUFDdkIsTUFBRyxPQUFPLFNBQVAsS0FBcUIsV0FBckIsRUFBaUM7QUFDbEMsV0FBTyxPQUFPLElBQVAsSUFBZSxPQUFPLFVBQVAsQ0FEWTtHQUFwQztBQUdBLFNBQU8sWUFBVTtBQUNmLFlBQVEsSUFBUixDQUFhLHVCQUFiLEVBRGU7R0FBVixDQUpnQjtDQUFOLEVBQVI7O0FBVUosU0FBUyxJQUFULEdBQXFCO0FBQzFCLFNBQU8sSUFBSSxPQUFKLENBQVksVUFBQyxPQUFELEVBQVUsTUFBVixFQUFxQjs7QUFFdEMsWUFBUSxHQUFSLENBQVksQ0FBQyw0QkFBRCxFQUFjLDBCQUFkLENBQVosRUFDQyxJQURELENBRUEsVUFBQyxJQUFELEVBQVU7O0FBRVIsVUFBSSxZQUFZLEtBQUssQ0FBTCxDQUFaLENBRkk7O0FBSVIsWUFBTSxRQUFOLENBQWU7QUFDYix5Q0FEYTtBQUViLGlCQUFTO0FBQ1AsbUJBQVMsVUFBVSxPQUFWO0FBQ1Qsb0JBQVUsVUFBVSxRQUFWO1NBRlo7T0FGRjs7O0FBSlEsVUFhSixXQUFXLEtBQUssQ0FBTCxDQUFYLENBYkk7O0FBZVIsY0FBUTtBQUNOLGdCQUFRLFVBQVUsTUFBVjtBQUNSLGFBQUssVUFBVSxHQUFWO0FBQ0wsYUFBSyxVQUFVLEdBQVY7QUFDTCxjQUFNLFNBQVMsSUFBVDtBQUNOLGlCQUFTLFNBQVMsT0FBVDtPQUxYLEVBZlE7S0FBVixFQXVCQSxVQUFDLEtBQUQsRUFBVztBQUNULGFBQU8sS0FBUCxFQURTO0tBQVgsQ0F6QkEsQ0FGc0M7R0FBckIsQ0FBbkIsQ0FEMEI7Q0FBckI7Ozs7Ozs7Ozs7Ozs7O1FDRFM7O0FBaENoQjs7OztBQUNBOzs7O0FBRUEsSUFDRSxtQkFERjtJQUVFLG1CQUZGO0lBR0UsY0FBYyxLQUFkOztBQUVLLElBQUksNEJBQVcsWUFBVTtBQUM5QixVQUFRLEdBQVIsQ0FBWSxtQkFBWixFQUQ4QjtBQUU5QixNQUFJLFlBQUosQ0FGOEI7QUFHOUIsTUFBRyxRQUFPLHVEQUFQLEtBQWtCLFFBQWxCLEVBQTJCO0FBQzVCLFFBQUksZUFBZSxPQUFPLFlBQVAsSUFBdUIsT0FBTyxrQkFBUCxDQURkO0FBRTVCLFFBQUcsaUJBQWlCLFdBQWpCLEVBQTZCO0FBQzlCLFlBQU0sSUFBSSxZQUFKLEVBQU4sQ0FEOEI7S0FBaEM7R0FGRjtBQU1BLE1BQUcsT0FBTyxHQUFQLEtBQWUsV0FBZixFQUEyQjs7QUFFNUIsWUFYTyxVQVdQLFVBQVU7QUFDUixrQkFBWSxzQkFBVTtBQUNwQixlQUFPO0FBQ0wsZ0JBQU0sQ0FBTjtTQURGLENBRG9CO09BQVY7QUFLWix3QkFBa0IsNEJBQVUsRUFBVjtLQU5wQixDQUY0QjtHQUE5QjtBQVdBLFNBQU8sR0FBUCxDQXBCOEI7Q0FBVixFQUFYOztBQXdCSixTQUFTLFNBQVQsR0FBb0I7O0FBRXpCLE1BQUcsT0FBTyxRQUFRLGNBQVIsS0FBMkIsV0FBbEMsRUFBOEM7QUFDL0MsWUFBUSxjQUFSLEdBQXlCLFFBQVEsVUFBUixDQURzQjtHQUFqRDs7QUFGeUIsTUFNckIsT0FBTyxFQUFQLENBTnFCO0FBT3pCLE1BQUksU0FBUyxRQUFRLGtCQUFSLEVBQVQsQ0FQcUI7QUFRekIsT0FBSyxNQUFMLEdBQWMsS0FBZCxDQVJ5QjtBQVN6QixNQUFHLE9BQU8sT0FBTyxLQUFQLEtBQWlCLFdBQXhCLEVBQW9DO0FBQ3JDLFNBQUssTUFBTCxHQUFjLElBQWQsQ0FEcUM7R0FBdkM7OztBQVR5QixVQXFJTyxtQkF2SGhDLGFBQWEsUUFBUSx3QkFBUixFQUFiLENBZHlCO0FBZXpCLGFBQVcsT0FBWCxDQUFtQixRQUFRLFdBQVIsQ0FBbkIsQ0FmeUI7QUFnQnpCLFVBcUhNLGFBckhOLGFBQWEsUUFBUSxjQUFSLEVBQWIsQ0FoQnlCO0FBaUJ6QixhQUFXLE9BQVgsQ0FBbUIsUUFBUSxXQUFSLENBQW5CLENBakJ5QjtBQWtCekIsYUFBVyxJQUFYLENBQWdCLEtBQWhCLEdBQXdCLEdBQXhCLENBbEJ5QjtBQW1CekIsZ0JBQWMsSUFBZCxDQW5CeUI7O0FBcUJ6QixTQUFPLElBQUksT0FBSixDQUFZLFVBQUMsT0FBRCxFQUFVLE1BQVYsRUFBcUI7O0FBRXRDLCtDQUFzQixJQUF0QixDQUNFLFNBQVMsV0FBVCxDQUFxQixPQUFyQixFQUE2Qjs7QUFFM0IsV0FBSyxHQUFMLEdBQVcsUUFBUSxRQUFSLEtBQXFCLFNBQXJCLENBRmdCO0FBRzNCLFdBQUssR0FBTCxHQUFXLFFBQVEsUUFBUixLQUFxQixTQUFyQixDQUhnQjtBQUkzQixXQUFLLE9BQUwsR0FBZSxRQUFRLE9BQVIsQ0FKWTtBQUszQixXQUFLLFFBQUwsR0FBZ0IsUUFBUSxRQUFSLENBTFc7QUFNM0IsVUFBRyxLQUFLLEdBQUwsS0FBYSxLQUFiLElBQXNCLEtBQUssR0FBTCxLQUFhLEtBQWIsRUFBbUI7QUFDMUMsZUFBTyw2QkFBUCxFQUQwQztPQUE1QyxNQUVLO0FBQ0gsZ0JBQVEsSUFBUixFQURHO09BRkw7S0FORixFQVlBLFNBQVMsVUFBVCxHQUFxQjtBQUNuQixhQUFPLCtDQUFQLEVBRG1CO0tBQXJCLENBYkYsQ0FGc0M7R0FBckIsQ0FBbkIsQ0FyQnlCO0NBQXBCOztBQTRDUCxJQUFJLG1CQUFrQiwyQkFBbUM7TUFBMUIsOERBQWdCLG1CQUFVOztBQUN2RCxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osWUFxRmdELGtCQXJGaEQsbUJBQWtCLDJCQUE2QjtVQUFwQiw4REFBZ0IsbUJBQUk7O0FBQzdDLFVBQUcsUUFBUSxDQUFSLEVBQVU7QUFDWCxnQkFBUSxJQUFSLENBQWEsNkNBQWIsRUFEVztPQUFiO0FBR0EsY0FBUSxRQUFRLENBQVIsR0FBWSxDQUFaLEdBQWdCLFFBQVEsQ0FBUixHQUFZLENBQVosR0FBZ0IsS0FBaEIsQ0FKcUI7QUFLN0MsaUJBQVcsSUFBWCxDQUFnQixLQUFoQixHQUF3QixLQUF4QixDQUw2QztLQUE3QixDQURkO0FBUUoscUJBQWdCLEtBQWhCLEVBUkk7R0FGTjtDQURvQjs7QUFnQnRCLElBQUksbUJBQWtCLDJCQUFnQjtBQUNwQyxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osWUFxRWlFLGtCQXJFakUsbUJBQWtCLDJCQUFVO0FBQzFCLGFBQU8sV0FBVyxJQUFYLENBQWdCLEtBQWhCLENBRG1CO0tBQVYsQ0FEZDtBQUlKLFdBQU8sa0JBQVAsQ0FKSTtHQUZOO0NBRG9COztBQVl0QixJQUFJLDJCQUEwQixtQ0FBZ0I7QUFDNUMsTUFBRyxnQkFBZ0IsS0FBaEIsRUFBc0I7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWIsRUFEdUI7R0FBekIsTUFFTTtBQUNKLFlBeURrRiwwQkF6RGxGLDJCQUEwQixtQ0FBVTtBQUNsQyxhQUFPLFdBQVcsU0FBWCxDQUFxQixLQUFyQixDQUQyQjtLQUFWLENBRHRCO0FBSUosV0FBTywwQkFBUCxDQUpJO0dBRk47Q0FENEI7O0FBWTlCLElBQUksMEJBQXlCLGtDQUFnQjtBQUMzQyxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osWUE2QzJHLHlCQTdDM0csMEJBQXlCLGdDQUFTLElBQVQsRUFBdUI7QUFDOUMsVUFBRyxJQUFILEVBQVE7QUFDTixtQkFBVyxVQUFYLENBQXNCLENBQXRCLEVBRE07QUFFTixtQkFBVyxPQUFYLENBQW1CLFVBQW5CLEVBRk07QUFHTixtQkFBVyxVQUFYLENBQXNCLENBQXRCLEVBSE07QUFJTixtQkFBVyxPQUFYLENBQW1CLFFBQVEsV0FBUixDQUFuQixDQUpNO09BQVIsTUFLSztBQUNILG1CQUFXLFVBQVgsQ0FBc0IsQ0FBdEIsRUFERztBQUVILG1CQUFXLFVBQVgsQ0FBc0IsQ0FBdEIsRUFGRztBQUdILG1CQUFXLE9BQVgsQ0FBbUIsUUFBUSxXQUFSLENBQW5CLENBSEc7T0FMTDtLQUR1QixDQURyQjtBQWFKLDhCQWJJO0dBRk47Q0FEMkI7O0FBcUI3QixJQUFJLDZCQUE0QixtQ0FBUyxHQUFULEVBQW1COzs7Ozs7Ozs7O0FBV2pELE1BQUcsZ0JBQWdCLEtBQWhCLEVBQXNCO0FBQ3ZCLFlBQVEsSUFBUixDQUFhLGdDQUFiLEVBRHVCO0dBQXpCLE1BRU07QUFDSixZQWNtSSw0QkFkbkksNkJBQTRCLG1DQUFTLEdBQVQsRUFBaUI7d0JBUXZDLElBTkYsT0FGeUM7QUFFakMsaUJBQVcsTUFBWCwrQkFBb0Isb0JBRmE7c0JBUXZDLElBTEYsS0FIeUM7QUFHbkMsaUJBQVcsSUFBWCw2QkFBa0IsZUFIaUI7dUJBUXZDLElBSkYsTUFKeUM7QUFJbEMsaUJBQVcsS0FBWCw4QkFBbUIsZ0JBSmU7MkJBUXZDLElBSEYsVUFMeUM7QUFLOUIsaUJBQVcsU0FBWCxrQ0FBdUIsbUJBTE87eUJBUXZDLElBRkYsUUFOeUM7QUFNaEMsaUJBQVcsT0FBWCxnQ0FBcUIscUJBTlc7MkJBUXZDLElBREYsVUFQeUM7QUFPOUIsaUJBQVcsU0FBWCxrQ0FBdUIsQ0FBQyxFQUFELGtCQVBPO0tBQWpCLENBRHhCO0FBV0osK0JBQTBCLEdBQTFCLEVBWEk7R0FGTjtDQVg4Qjs7UUE0QnhCO1FBQTBCLG1CQUFkO1FBQWdDO1FBQWlCO1FBQWlCO1FBQXlCO1FBQXdCOzs7Ozs7Ozs7UUM5SHZIOztBQXZDaEI7O0FBR0EsSUFBSSxtQkFBSjs7OztBQUNBLElBQUksY0FBYyxLQUFkO0FBQ0osSUFBSSxTQUFTLEVBQVQ7QUFDSixJQUFJLFVBQVUsRUFBVjtBQUNKLElBQUksV0FBVyxFQUFYO0FBQ0osSUFBSSxZQUFZLEVBQVo7QUFDSixJQUFJLGFBQWEsSUFBSSxHQUFKLEVBQWI7QUFDSixJQUFJLGNBQWMsSUFBSSxHQUFKLEVBQWQ7O0FBRUosSUFBSSw4QkFBSjtBQUNBLElBQUksc0JBQXNCLENBQXRCOztBQUdKLFNBQVMsWUFBVCxHQUF1QjtBQUNyQixXQUFTLE1BQU0sSUFBTixDQUFXLFdBQVcsTUFBWCxDQUFrQixNQUFsQixFQUFYLENBQVQ7OztBQURxQixRQUlyQixDQUFPLElBQVAsQ0FBWSxVQUFDLENBQUQsRUFBSSxDQUFKO1dBQVUsRUFBRSxJQUFGLENBQU8sV0FBUCxNQUF3QixFQUFFLElBQUYsQ0FBTyxXQUFQLEVBQXhCLEdBQStDLENBQS9DLEdBQW1ELENBQUMsQ0FBRDtHQUE3RCxDQUFaLENBSnFCOzs7Ozs7O0FBTXJCLHlCQUFnQixnQ0FBaEIsb0dBQXVCO1VBQWYsbUJBQWU7O0FBQ3JCLGlCQUFXLEdBQVgsQ0FBZSxLQUFLLEVBQUwsRUFBUyxJQUF4QixFQURxQjtBQUVyQixlQUFTLElBQVQsQ0FBYyxLQUFLLEVBQUwsQ0FBZCxDQUZxQjtLQUF2Qjs7Ozs7Ozs7Ozs7Ozs7R0FOcUI7O0FBV3JCLFlBQVUsTUFBTSxJQUFOLENBQVcsV0FBVyxPQUFYLENBQW1CLE1BQW5CLEVBQVgsQ0FBVjs7O0FBWHFCLFNBY3JCLENBQVEsSUFBUixDQUFhLFVBQUMsQ0FBRCxFQUFJLENBQUo7V0FBVSxFQUFFLElBQUYsQ0FBTyxXQUFQLE1BQXdCLEVBQUUsSUFBRixDQUFPLFdBQVAsRUFBeEIsR0FBK0MsQ0FBL0MsR0FBbUQsQ0FBQyxDQUFEO0dBQTdELENBQWIsQ0FkcUI7Ozs7Ozs7QUFnQnJCLDBCQUFnQixrQ0FBaEIsd0dBQXdCO1VBQWhCLHFCQUFnQjs7QUFDdEIsa0JBQVksR0FBWixDQUFnQixNQUFLLEVBQUwsRUFBUyxLQUF6QixFQURzQjtBQUV0QixnQkFBVSxJQUFWLENBQWUsTUFBSyxFQUFMLENBQWYsQ0FGc0I7S0FBeEI7Ozs7Ozs7Ozs7Ozs7O0dBaEJxQjtDQUF2Qjs7QUF1Qk8sU0FBUyxRQUFULEdBQW1COztBQUV4QixTQUFPLElBQUksT0FBSixDQUFZLFNBQVMsUUFBVCxDQUFrQixPQUFsQixFQUEyQixNQUEzQixFQUFrQzs7QUFFbkQsUUFBRyxPQUFPLFNBQVAsS0FBcUIsV0FBckIsRUFBaUM7QUFDbEMsb0JBQWMsSUFBZCxDQURrQztBQUVsQyxjQUFRLEVBQUMsTUFBTSxLQUFOLEVBQVQsRUFGa0M7S0FBcEMsTUFHTSxJQUFHLE9BQU8sVUFBVSxpQkFBVixLQUFnQyxXQUF2QyxFQUFtRDs7O0FBRTFELFlBQUksYUFBSjtZQUFVLGFBQVY7WUFBZ0IsZ0JBQWhCOztBQUVBLGtCQUFVLGlCQUFWLEdBQThCLElBQTlCLENBRUUsU0FBUyxXQUFULENBQXFCLFVBQXJCLEVBQWdDO0FBQzlCLHVCQUFhLFVBQWIsQ0FEOEI7QUFFOUIsY0FBRyxPQUFPLFdBQVcsY0FBWCxLQUE4QixXQUFyQyxFQUFpRDtBQUNsRCxtQkFBTyxXQUFXLGNBQVgsQ0FBMEIsQ0FBMUIsRUFBNkIsS0FBN0IsQ0FBbUMsT0FBbkMsQ0FEMkM7QUFFbEQsbUJBQU8sSUFBUCxDQUZrRDtXQUFwRCxNQUdLO0FBQ0gsc0JBQVUsSUFBVixDQURHO0FBRUgsbUJBQU8sSUFBUCxDQUZHO1dBSEw7O0FBUUE7OztBQVY4QixvQkFhOUIsQ0FBVyxnQkFBWCxDQUE0QixXQUE1QixFQUF5QyxVQUFTLENBQVQsRUFBVztBQUNsRCxvQkFBUSxHQUFSLENBQVksa0JBQVosRUFBZ0MsQ0FBaEMsRUFEa0Q7QUFFbEQsMkJBRmtEO1dBQVgsRUFHdEMsS0FISCxFQWI4Qjs7QUFrQjlCLHFCQUFXLGdCQUFYLENBQTRCLGNBQTVCLEVBQTRDLFVBQVMsQ0FBVCxFQUFXO0FBQ3JELG9CQUFRLEdBQVIsQ0FBWSxxQkFBWixFQUFtQyxDQUFuQyxFQURxRDtBQUVyRCwyQkFGcUQ7V0FBWCxFQUd6QyxLQUhILEVBbEI4Qjs7QUF1QjlCLHdCQUFjLElBQWQsQ0F2QjhCO0FBd0I5QixrQkFBUTtBQUNOLHNCQURNO0FBRU4sc0JBRk07QUFHTiw0QkFITTtBQUlOLDBCQUpNO0FBS04sNEJBTE07QUFNTixrQ0FOTTtBQU9OLG9DQVBNO1dBQVIsRUF4QjhCO1NBQWhDLEVBbUNBLFNBQVMsUUFBVCxDQUFrQixDQUFsQixFQUFvQjs7QUFFbEIsaUJBQU8sa0RBQVAsRUFBMkQsQ0FBM0QsRUFGa0I7U0FBcEIsQ0FyQ0Y7O1dBSjBEO0tBQXRELE1BK0NEO0FBQ0gsc0JBQWMsSUFBZCxDQURHO0FBRUgsZ0JBQVEsRUFBQyxNQUFNLEtBQU4sRUFBVCxFQUZHO09BL0NDO0dBTFcsQ0FBbkIsQ0FGd0I7Q0FBbkI7O0FBOERBLElBQUksaUJBQWdCLHlCQUFVO0FBQ25DLE1BQUcsZ0JBQWdCLEtBQWhCLEVBQXNCO0FBQ3ZCLFlBQVEsSUFBUixDQUFhLGdDQUFiLEVBRHVCO0dBQXpCLE1BRU07QUFDSiw2Q0FBZ0IseUJBQVU7QUFDeEIsYUFBTyxVQUFQLENBRHdCO0tBQVYsQ0FEWjtBQUlKLFdBQU8sZ0JBQVAsQ0FKSTtHQUZOO0FBUUEsU0FBTyxLQUFQLENBVG1DO0NBQVY7OztBQWFwQixJQUFJLGtCQUFpQiwwQkFBVTtBQUNwQyxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osK0NBQWlCLDBCQUFVO0FBQ3pCLGFBQU8sT0FBUCxDQUR5QjtLQUFWLENBRGI7QUFJSixXQUFPLGlCQUFQLENBSkk7R0FGTjtBQVFBLFNBQU8sS0FBUCxDQVRvQztDQUFWOzs7QUFhckIsSUFBSSxpQkFBZ0IseUJBQVU7QUFDbkMsTUFBRyxnQkFBZ0IsS0FBaEIsRUFBc0I7QUFDdkIsWUFBUSxJQUFSLENBQWEsZ0NBQWIsRUFEdUI7R0FBekIsTUFFTTtBQUNKLDZDQUFnQix5QkFBVTtBQUN4QixhQUFPLE1BQVAsQ0FEd0I7S0FBVixDQURaO0FBSUosV0FBTyxnQkFBUCxDQUpJO0dBRk47QUFRQSxTQUFPLEtBQVAsQ0FUbUM7Q0FBVjs7O0FBWXBCLElBQUksb0JBQW1CLDRCQUFVO0FBQ3RDLE1BQUcsZ0JBQWdCLEtBQWhCLEVBQXNCO0FBQ3ZCLFlBQVEsSUFBUixDQUFhLGdDQUFiLEVBRHVCO0dBQXpCLE1BRU07QUFDSixtREFBbUIsNEJBQVU7QUFDM0IsYUFBTyxTQUFQLENBRDJCO0tBQVYsQ0FEZjtBQUlKLFdBQU8sbUJBQVAsQ0FKSTtHQUZOO0FBUUEsU0FBTyxLQUFQLENBVHNDO0NBQVY7OztBQWF2QixJQUFJLG1CQUFrQiwyQkFBVTtBQUNyQyxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osaURBQWtCLDJCQUFVO0FBQzFCLGFBQU8sUUFBUCxDQUQwQjtLQUFWLENBRGQ7QUFJSixXQUFPLGtCQUFQLENBSkk7R0FGTjtBQVFBLFNBQU8sS0FBUCxDQVRxQztDQUFWOzs7QUFhdEIsSUFBSSxxQkFBb0IsMkJBQVMsRUFBVCxFQUFvQjtBQUNqRCxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0oscURBQW9CLDZCQUFVO0FBQzVCLGFBQU8sWUFBWSxHQUFaLENBQWdCLEVBQWhCLENBQVAsQ0FENEI7S0FBVixDQURoQjtBQUlKLFdBQU8sbUJBQWtCLEVBQWxCLENBQVAsQ0FKSTtHQUZOO0FBUUEsU0FBTyxLQUFQLENBVGlEO0NBQXBCOzs7QUFheEIsSUFBSSxvQkFBbUIsMEJBQVMsRUFBVCxFQUFvQjtBQUNoRCxNQUFHLGdCQUFnQixLQUFoQixFQUFzQjtBQUN2QixZQUFRLElBQVIsQ0FBYSxnQ0FBYixFQUR1QjtHQUF6QixNQUVNO0FBQ0osbURBQW1CLDRCQUFVO0FBQzNCLGFBQU8sWUFBWSxHQUFaLENBQWdCLEVBQWhCLENBQVAsQ0FEMkI7S0FBVixDQURmO0FBSUosV0FBTyxrQkFBaUIsRUFBakIsQ0FBUCxDQUpJO0dBRk47QUFRQSxTQUFPLEtBQVAsQ0FUZ0Q7Q0FBcEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RMOUI7O0FBQ0E7O0FBQ0E7Ozs7SUFFYTtBQUVYLFdBRlcsVUFFWCxDQUFZLEVBQVosRUFBd0IsSUFBeEIsRUFBcUM7MEJBRjFCLFlBRTBCOztBQUNuQyxTQUFLLEVBQUwsR0FBVSxFQUFWLENBRG1DO0FBRW5DLFNBQUssSUFBTCxHQUFZLElBQVo7O0FBRm1DLFFBSW5DLENBQUssV0FBTCxHQUFtQixJQUFJLEtBQUosQ0FBVSxHQUFWLEVBQWUsSUFBZixDQUFvQixDQUFDLENBQUQsQ0FBdkMsQ0FKbUM7QUFLbkMsU0FBSyxXQUFMLEdBQW1CLEtBQUssV0FBTCxDQUFpQixHQUFqQixDQUFxQixZQUFVO0FBQ2hELGFBQU8sSUFBSSxLQUFKLENBQVUsR0FBVixFQUFlLElBQWYsQ0FBb0IsQ0FBQyxDQUFELENBQTNCLENBRGdEO0tBQVYsQ0FBeEMsQ0FMbUM7O0FBU25DLFNBQUssZ0JBQUwsR0FBd0IsRUFBeEIsQ0FUbUM7QUFVbkMsU0FBSyxnQkFBTCxHQUF3QixFQUF4QixDQVZtQztBQVduQyxTQUFLLGdCQUFMLEdBQXdCLEtBQXhCLENBWG1DO0dBQXJDOztlQUZXOzs0QkFnQkgsUUFBTztBQUNiLFdBQUssTUFBTCxHQUFjLE1BQWQsQ0FEYTs7OztxQ0FJRSxPQUFPLE1BQUs7OztBQUMzQixVQUFJLGVBQUo7VUFBWSxtQkFBWixDQUQyQjtBQUUzQixhQUFPLFFBQVEsTUFBTSxLQUFOLEdBQWMsTUFBZDs7O0FBRlksVUFLeEIsTUFBTSxJQUFOLEtBQWUsR0FBZixFQUFtQjs7O0FBR3BCLHFCQUFhLEtBQUssV0FBTCxDQUFpQixNQUFNLEtBQU4sQ0FBakIsQ0FBOEIsTUFBTSxLQUFOLENBQTNDLENBSG9CO0FBSXBCLGlCQUFTLDBCQUFhLFVBQWIsRUFBeUIsS0FBekIsQ0FBVCxDQUpvQjtBQUtwQixhQUFLLGdCQUFMLENBQXNCLE1BQU0sVUFBTixDQUF0QixHQUEwQyxNQUExQyxDQUxvQjtBQU1wQixlQUFPLE1BQVAsQ0FBYyxPQUFkLENBQXNCLEtBQUssTUFBTCxJQUFlLG9CQUFRLFdBQVIsQ0FBckMsQ0FOb0I7QUFPcEIsZUFBTyxLQUFQLENBQWEsSUFBYjs7QUFQb0IsT0FBdEIsTUFTTSxJQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsRUFBbUI7O0FBRTFCLG1CQUFTLEtBQUssZ0JBQUwsQ0FBc0IsTUFBTSxVQUFOLENBQS9CLENBRjBCO0FBRzFCLGNBQUcsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEVBQThCO0FBQy9CLG9CQUFRLEtBQVIsQ0FBYyw0QkFBZCxFQUE0QyxLQUE1QyxFQUQrQjtBQUUvQixtQkFGK0I7V0FBakM7QUFJQSxjQUFHLEtBQUssZ0JBQUwsS0FBMEIsSUFBMUIsRUFBK0I7O0FBRWhDLGlCQUFLLGdCQUFMLENBQXNCLElBQXRCLENBQTJCLE1BQU0sVUFBTixDQUEzQixDQUZnQztXQUFsQyxNQUdLO0FBQ0gsbUJBQU8sSUFBUCxDQUFZLElBQVosRUFBa0IsWUFBTTs7QUFFdEIscUJBQU8sTUFBSyxnQkFBTCxDQUFzQixNQUFNLFVBQU4sQ0FBN0IsQ0FGc0I7YUFBTixDQUFsQixDQURHO1dBSEw7U0FQSSxNQWdCQSxJQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsRUFBbUI7O0FBRTFCLGNBQUcsTUFBTSxLQUFOLEtBQWdCLEVBQWhCLEVBQW1CO0FBQ3BCLGdCQUFHLE1BQU0sS0FBTixLQUFnQixHQUFoQixFQUFvQjtBQUNyQixtQkFBSyxnQkFBTCxHQUF3QixJQUF4Qjs7O0FBRHFCLGFBQXZCLE1BSU0sSUFBRyxNQUFNLEtBQU4sS0FBZ0IsQ0FBaEIsRUFBa0I7QUFDekIscUJBQUssZ0JBQUwsR0FBd0IsS0FBeEIsQ0FEeUI7QUFFekIscUJBQUssZ0JBQUwsQ0FBc0IsT0FBdEIsQ0FBOEIsVUFBQyxVQUFELEVBQWdCO0FBQzVDLHdCQUFLLGdCQUFMLENBQXNCLFVBQXRCLEVBQWtDLElBQWxDLENBQXVDLElBQXZDLEVBQTZDLFlBQU07O0FBRWpELDJCQUFPLE1BQUssZ0JBQUwsQ0FBc0IsVUFBdEIsQ0FBUCxDQUZpRDttQkFBTixDQUE3QyxDQUQ0QztpQkFBaEIsQ0FBOUI7O0FBRnlCLG9CQVN6QixDQUFLLGdCQUFMLEdBQXdCLEVBQXhCOzs7QUFUeUIsZUFBckI7OztBQUxjLFdBQXRCLE1Bb0JNLElBQUcsTUFBTSxLQUFOLEtBQWdCLEVBQWhCLEVBQW1COzs7Ozs7YUFBdEIsTUFNQSxJQUFHLE1BQU0sS0FBTixLQUFnQixDQUFoQixFQUFrQjs7ZUFBckI7U0E1QkY7Ozs7Ozs7Ozs7Ozs7Ozs7O2tDQTZDTSxRQUFRLGFBTWI7dUVBQUgsa0JBQUc7OzhCQUpMLFFBSUs7VUFKTCx1Q0FBVSxDQUFDLEtBQUQsRUFBUSxLQUFSLGlCQUlMOzhCQUhMLFFBR0s7VUFITCx1Q0FBVSxDQUFDLEtBQUQsRUFBUSxTQUFSLGlCQUdMOzBCQUZMLElBRUs7VUFGTCwrQkFBTSxpQkFFRDsrQkFETCxTQUNLO1VBREwseUNBQVcsQ0FBQyxDQUFELEVBQUksR0FBSixrQkFDTjs7O0FBRVAsVUFBRyx1QkFBdUIsV0FBdkIsS0FBdUMsS0FBdkMsRUFBNkM7QUFDOUMsZ0JBQVEsSUFBUixDQUFhLGtDQUFiLEVBRDhDO0FBRTlDLGVBRjhDO09BQWhEOztvQ0FLaUMsWUFQMUI7O1VBT0YsMkJBUEU7VUFPWSx5QkFQWjs7b0NBUWtDLFlBUmxDOztVQVFGLDhCQVJFO1VBUWUsOEJBUmY7O3FDQVM0QixhQVQ1Qjs7VUFTRiw2QkFURTtVQVNhLDJCQVRiOzs7QUFXUCxVQUFHLFFBQVEsTUFBUixLQUFtQixDQUFuQixFQUFxQjtBQUN0Qix1QkFBZSxhQUFhLEtBQWIsQ0FETztPQUF4Qjs7QUFJQSxVQUFHLG9CQUFvQixLQUFwQixFQUEwQjtBQUMzQiwwQkFBa0IsS0FBbEIsQ0FEMkI7T0FBN0I7Ozs7Ozs7QUFmTyxVQXdCSCxPQUFPLHNCQUFXLE1BQVgsQ0FBUCxDQXhCRztBQXlCUCxjQUFRLEdBQVIsQ0FBWSxJQUFaLEVBekJPO0FBMEJQLFVBQUcsU0FBUyxLQUFULEVBQWU7QUFDaEIsZUFEZ0I7T0FBbEI7QUFHQSxlQUFTLEtBQUssTUFBTCxDQTdCRjs7QUErQlAsV0FBSyxXQUFMLENBQWlCLE1BQWpCLEVBQXlCLElBQXpCLENBQThCO0FBQzVCLFdBQUcsTUFBSDtBQUNBLFdBQUcsV0FBSDtBQUNBLFlBQUksWUFBSjtBQUNBLFlBQUksVUFBSjtBQUNBLFdBQUcsZUFBSDtBQUNBLFdBQUcsZUFBSDtBQUNBLFdBQUcsR0FBSDtPQVBGLEVBUUcsYUFSSCxFQVFrQixjQUFjLENBQWQsQ0FSbEI7OztBQS9CTzs7O29DQTZDTTs7O0FBQ2IsY0FBUSxHQUFSLENBQVksZUFBWixFQURhO0FBRWIsYUFBTyxJQUFQLENBQVksS0FBSyxnQkFBTCxDQUFaLENBQW1DLE9BQW5DLENBQTJDLFVBQUMsUUFBRCxFQUFjO0FBQ3ZELGVBQUssZ0JBQUwsQ0FBc0IsUUFBdEIsRUFBZ0MsSUFBaEMsQ0FBcUMsQ0FBckMsRUFBd0MsWUFBTTtBQUM1QyxpQkFBTyxPQUFLLGdCQUFMLENBQXNCLFFBQXRCLENBQVAsQ0FENEM7U0FBTixDQUF4QyxDQUR1RDtPQUFkLENBQTNDLENBRmE7Ozs7U0FsSko7Ozs7Ozs7OztRQ1NHO1FBZ0JBO1FBSUE7UUE4QkE7O0FBN0RoQjs7QUFDQTs7QUFFQTs7QUFLQSxJQUFNLFFBQVEsNkJBQVI7QUFDTixJQUFJLGlCQUFpQixDQUFqQjs7QUFFRyxTQUFTLGVBQVQsQ0FBeUIsS0FBekIsRUFBd0MsSUFBeEMsRUFBc0QsS0FBdEQsRUFBZ0c7TUFBM0IsOERBQWdCLENBQUMsQ0FBRCxnQkFBVzs7QUFDckcsTUFBSSxhQUFXLHlCQUFvQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQS9CLENBRGlHO0FBRXJHLFFBQU0sUUFBTixDQUFlO0FBQ2IseUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGtCQUZPO0FBR1AsZ0JBSE87QUFJUCxrQkFKTztBQUtQLGtCQUxPO0FBTVAsaUJBQVcsTUFBTSxLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQyxRQUFRLEVBQVIsQ0FBRCxHQUFlLEVBQWYsQ0FBbEI7S0FOYjtHQUZGLEVBRnFHO0FBYXJHLFNBQU8sRUFBUCxDQWJxRztDQUFoRzs7QUFnQkEsU0FBUyxjQUFULEdBQWlDO0FBQ3RDLGlCQUFhLHlCQUFvQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQWpDLENBRHNDO0NBQWpDOztBQUlBLFNBQVMsYUFBVCxDQUF1QixPQUF2QixFQUF3QyxhQUF4QyxFQUFvRTtBQUN6RSxNQUFJLFFBQVEsTUFBTSxRQUFOLEdBQWlCLE1BQWpCOzs7QUFENkQsTUFJckUsT0FBTyxNQUFNLFFBQU4sQ0FBZSxPQUFmLENBQVAsQ0FKcUU7QUFLekUsTUFBSSxRQUFRLEtBQUssVUFBTCxDQUFnQixDQUFoQixDQUFSOzs7QUFMcUUsTUFRckUsUUFBUSxNQUFNLEtBQU4sR0FBYyxhQUFkLENBUjZEO0FBU3pFLFVBQVEsUUFBUSxDQUFSLEdBQVksQ0FBWixHQUFnQixLQUFoQixDQVRpRTtBQVV6RSxNQUFJLFNBQVMsTUFBTSxNQUFOLElBQWdCLEtBQWhCLENBVjREO0FBV3pFLE1BQUcsTUFBSCxFQUFVO0FBQ1IsYUFBUyxNQUFNLFFBQU4sQ0FBZSxNQUFmLElBQXlCLE1BQXpCLEdBQWtDLEtBQWxDLENBREQ7R0FBVjs7QUFYeUUsT0FlekUsQ0FBTSxRQUFOLENBQWU7QUFDYix5Q0FEYTtBQUViLGFBQVM7QUFDUCxlQUFTLE1BQU0sRUFBTjtBQUNULGtCQUZPO0FBR1Asb0JBSE87S0FBVDtHQUZGOztBQWZ5RSxNQXdCckUsVUFBVSxNQUFNLElBQU4sQ0F4QjJEO0FBeUJ6RSxNQUFHLE9BQUgsRUFBVztBQUNULG1DQUFlLE9BQWYsRUFBd0IsS0FBeEIsRUFEUztHQUFYO0NBekJLOztBQThCQSxTQUFTLGVBQVQsQ0FBeUIsRUFBekIsRUFBcUMsS0FBckMsRUFBeUQ7QUFDOUQsTUFBSSxRQUFRLE1BQU0sUUFBTixHQUFpQixNQUFqQixDQURrRDtBQUU5RCxNQUFJLFFBQVEsTUFBTSxRQUFOLENBQWUsRUFBZixDQUFSLENBRjBEO0FBRzlELFFBQU0sUUFBTixDQUFlO0FBQ2IseUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGtCQUZPO0tBQVQ7R0FGRixFQUg4RDtBQVU5RCxNQUFHLE9BQU8sS0FBUCxLQUFpQixXQUFqQixFQUE2QjtBQUM5QixZQUFRLEtBQVIsQ0FBYyxvQkFBZDtBQUQ4QixHQUFoQzs7QUFWOEQsTUFjMUQsVUFBVSxNQUFNLElBQU4sQ0FkZ0Q7QUFlOUQsTUFBRyxPQUFILEVBQVc7QUFDVCxtQ0FBZSxPQUFmLEVBQXdCLEtBQXhCLEVBRFM7R0FBWDtDQWZLOzs7Ozs7OztRQ3JEUztRQWlCQTs7QUExQmhCOztBQUNBOztBQUtBLElBQU0sUUFBUSw2QkFBUjtBQUNOLElBQUksZ0JBQWdCLENBQWhCOztBQUVHLFNBQVMsY0FBVCxDQUF3QixFQUF4QixFQUFxRDtNQUF6Qiw4REFBUSxNQUFNLFFBQU4sa0JBQWlCOztBQUMxRCxNQUFJLE9BQU8sTUFBTSxTQUFOLENBQWdCLEVBQWhCLENBQVAsQ0FEc0Q7QUFFMUQsTUFBSSxTQUFTLE1BQU0sUUFBTixDQUY2QztBQUcxRCxNQUFJLFFBQVEsT0FBTyxLQUFLLE1BQUwsQ0FBZixDQUhzRDtBQUkxRCxNQUFJLE1BQU0sT0FBTyxLQUFLLE9BQUwsQ0FBYixDQUpzRDs7QUFNMUQsUUFBTSxRQUFOLENBQWU7QUFDYix3Q0FEYTtBQUViLGFBQVM7QUFDUCxZQURPO0FBRVAsYUFBTyxNQUFNLEtBQU47QUFDUCxXQUFLLElBQUksS0FBSjtBQUNMLHFCQUFlLElBQUksS0FBSixHQUFZLE1BQU0sS0FBTjtLQUo3QjtHQUZGLEVBTjBEO0NBQXJEOztBQWlCQSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBd0MsT0FBeEMsRUFBd0Q7QUFDN0QsTUFBSSxTQUFTLE1BQU0sUUFBTixHQUFpQixNQUFqQixDQUF3QixRQUF4QixDQURnRDtBQUU3RCxNQUFJLEtBQUssT0FBTyxNQUFQLENBQUwsQ0FGeUQ7QUFHN0QsTUFBSSxNQUFNLE9BQU8sT0FBUCxDQUFOLENBSHlEO0FBSTdELE1BQUcsR0FBRyxLQUFILEtBQWEsSUFBSSxLQUFKLEVBQVU7QUFDeEIsWUFBUSxLQUFSLENBQWMscUZBQWQsRUFEd0I7QUFFeEIsV0FBTyxDQUFDLENBQUQsQ0FGaUI7R0FBMUI7O0FBS0EsTUFBSSxhQUFXLHdCQUFtQixJQUFJLElBQUosR0FBVyxPQUFYLEVBQTlCLENBVHlEO0FBVTdELFFBQU0sUUFBTixDQUFlO0FBQ2Isd0NBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLG9CQUZPO0FBR1Asc0JBSE87QUFJUCxhQUFPLEdBQUcsS0FBSDtBQUNQLFdBQUssSUFBSSxLQUFKO0FBQ0wscUJBQWUsSUFBSSxLQUFKLEdBQVksR0FBRyxLQUFIO0tBTjdCO0dBRkYsRUFWNkQ7QUFxQjdELFNBQU8sRUFBUCxDQXJCNkQ7Q0FBeEQ7Ozs7Ozs7Ozs7QUNuQlA7Ozs7Ozs7Ozs7QUFFQSxJQUFNLE1BQU0sT0FBTyxZQUFQOztJQUVTOzs7O0FBR25CLFdBSG1CLFVBR25CLENBQVksTUFBWixFQUFtQjswQkFIQSxZQUdBOztBQUNqQixTQUFLLE1BQUwsR0FBYyxNQUFkLENBRGlCO0FBRWpCLFNBQUssUUFBTCxHQUFnQixDQUFoQixDQUZpQjtHQUFuQjs7Ozs7ZUFIbUI7O3lCQVNkLFFBQXlCO1VBQWpCLGlFQUFXLG9CQUFNOztBQUM1QixVQUFJLGVBQUosQ0FENEI7O0FBRzVCLFVBQUcsUUFBSCxFQUFZO0FBQ1YsaUJBQVMsRUFBVCxDQURVO0FBRVYsYUFBSSxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksTUFBSixFQUFZLEtBQUssS0FBSyxRQUFMLEVBQUwsRUFBcUI7QUFDOUMsb0JBQVUsSUFBSSxLQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQUwsQ0FBaEIsQ0FBVixDQUQ4QztTQUFoRDtBQUdBLGVBQU8sTUFBUCxDQUxVO09BQVosTUFNSztBQUNILGlCQUFTLEVBQVQsQ0FERztBQUVILGFBQUksSUFBSSxLQUFJLENBQUosRUFBTyxLQUFJLE1BQUosRUFBWSxNQUFLLEtBQUssUUFBTCxFQUFMLEVBQXFCO0FBQzlDLGlCQUFPLElBQVAsQ0FBWSxLQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQUwsQ0FBeEIsRUFEOEM7U0FBaEQ7QUFHQSxlQUFPLE1BQVAsQ0FMRztPQU5MOzs7Ozs7O2dDQWdCVTtBQUNWLFVBQUksU0FDRixDQUFDLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxDQUFaLElBQThCLEVBQTlCLENBQUQsSUFDQyxLQUFLLE1BQUwsQ0FBWSxLQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FBWixJQUFrQyxFQUFsQyxDQURELElBRUMsS0FBSyxNQUFMLENBQVksS0FBSyxRQUFMLEdBQWdCLENBQWhCLENBQVosSUFBa0MsQ0FBbEMsQ0FGRCxHQUdBLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxHQUFnQixDQUFoQixDQUhaLENBRlE7QUFPVixXQUFLLFFBQUwsSUFBaUIsQ0FBakIsQ0FQVTtBQVFWLGFBQU8sTUFBUCxDQVJVOzs7Ozs7O2dDQVlBO0FBQ1YsVUFBSSxTQUNGLENBQUMsS0FBSyxNQUFMLENBQVksS0FBSyxRQUFMLENBQVosSUFBOEIsQ0FBOUIsQ0FBRCxHQUNBLEtBQUssTUFBTCxDQUFZLEtBQUssUUFBTCxHQUFnQixDQUFoQixDQURaLENBRlE7QUFLVixXQUFLLFFBQUwsSUFBaUIsQ0FBakIsQ0FMVTtBQU1WLGFBQU8sTUFBUCxDQU5VOzs7Ozs7OzZCQVVILFFBQVE7QUFDZixVQUFJLFNBQVMsS0FBSyxNQUFMLENBQVksS0FBSyxRQUFMLENBQXJCLENBRFc7QUFFZixVQUFHLFVBQVUsU0FBUyxHQUFULEVBQWE7QUFDeEIsa0JBQVUsR0FBVixDQUR3QjtPQUExQjtBQUdBLFdBQUssUUFBTCxJQUFpQixDQUFqQixDQUxlO0FBTWYsYUFBTyxNQUFQLENBTmU7Ozs7MEJBU1g7QUFDSixhQUFPLEtBQUssUUFBTCxJQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUFaLENBRHBCOzs7Ozs7Ozs7O2lDQVFPO0FBQ1gsVUFBSSxTQUFTLENBQVQsQ0FETztBQUVYLGFBQU0sSUFBTixFQUFZO0FBQ1YsWUFBSSxJQUFJLEtBQUssUUFBTCxFQUFKLENBRE07QUFFVixZQUFJLElBQUksSUFBSixFQUFVO0FBQ1osb0JBQVcsSUFBSSxJQUFKLENBREM7QUFFWixxQkFBVyxDQUFYLENBRlk7U0FBZCxNQUdPOztBQUVMLGlCQUFPLFNBQVMsQ0FBVCxDQUZGO1NBSFA7T0FGRjs7Ozs0QkFZSztBQUNMLFdBQUssUUFBTCxHQUFnQixDQUFoQixDQURLOzs7O2dDQUlLLEdBQUU7QUFDWixXQUFLLFFBQUwsR0FBZ0IsQ0FBaEIsQ0FEWTs7OztTQXJGSzs7Ozs7Ozs7Ozs7O0FDTnJCOzs7OztRQTRPZ0I7O0FBMU9oQjs7Ozs7O0FBRUEsSUFDRSwwQkFERjtJQUVFLGtCQUZGOztBQUtBLFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEwQjtBQUN4QixNQUFJLEtBQUssT0FBTyxJQUFQLENBQVksQ0FBWixFQUFlLElBQWYsQ0FBTCxDQURvQjtBQUV4QixNQUFJLFNBQVMsT0FBTyxTQUFQLEVBQVQ7O0FBRm9CLFNBSWxCO0FBQ0osVUFBTSxFQUFOO0FBQ0EsY0FBVSxNQUFWO0FBQ0EsWUFBUSxPQUFPLElBQVAsQ0FBWSxNQUFaLEVBQW9CLEtBQXBCLENBQVI7R0FIRixDQUp3QjtDQUExQjs7QUFZQSxTQUFTLFNBQVQsQ0FBbUIsTUFBbkIsRUFBMEI7QUFDeEIsTUFBSSxRQUFRLEVBQVIsQ0FEb0I7QUFFeEIsTUFBSSxNQUFKLENBRndCO0FBR3hCLFFBQU0sU0FBTixHQUFrQixPQUFPLFVBQVAsRUFBbEIsQ0FId0I7QUFJeEIsTUFBSSxnQkFBZ0IsT0FBTyxRQUFQLEVBQWhCOztBQUpvQixNQU1yQixDQUFDLGdCQUFnQixJQUFoQixDQUFELElBQTBCLElBQTFCLEVBQStCOztBQUVoQyxRQUFHLGlCQUFpQixJQUFqQixFQUFzQjs7QUFFdkIsWUFBTSxJQUFOLEdBQWEsTUFBYixDQUZ1QjtBQUd2QixVQUFJLGNBQWMsT0FBTyxRQUFQLEVBQWQsQ0FIbUI7QUFJdkIsZUFBUyxPQUFPLFVBQVAsRUFBVCxDQUp1QjtBQUt2QixjQUFPLFdBQVA7QUFDRSxhQUFLLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGdCQUFoQixDQURGO0FBRUUsY0FBRyxXQUFXLENBQVgsRUFBYTtBQUNkLGtCQUFNLHdEQUF3RCxNQUF4RCxDQURRO1dBQWhCO0FBR0EsZ0JBQU0sTUFBTixHQUFlLE9BQU8sU0FBUCxFQUFmLENBTEY7QUFNRSxpQkFBTyxLQUFQLENBTkY7QUFERixhQVFPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLE1BQWhCLENBREY7QUFFRSxnQkFBTSxJQUFOLEdBQWEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFiLENBRkY7QUFHRSxpQkFBTyxLQUFQLENBSEY7QUFSRixhQVlPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGlCQUFoQixDQURGO0FBRUUsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYixDQUZGO0FBR0UsaUJBQU8sS0FBUCxDQUhGO0FBWkYsYUFnQk8sSUFBTDtBQUNFLGdCQUFNLE9BQU4sR0FBZ0IsV0FBaEIsQ0FERjtBQUVFLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWIsQ0FGRjtBQUdFLHNCQUFZLE1BQU0sSUFBTixDQUhkO0FBSUUsaUJBQU8sS0FBUCxDQUpGO0FBaEJGLGFBcUJPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGdCQUFoQixDQURGO0FBRUUsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYixDQUZGO0FBR0UsaUJBQU8sS0FBUCxDQUhGO0FBckJGLGFBeUJPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFFBQWhCLENBREY7QUFFRSxnQkFBTSxJQUFOLEdBQWEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFiLENBRkY7QUFHRSxpQkFBTyxLQUFQLENBSEY7QUF6QkYsYUE2Qk8sSUFBTDtBQUNFLGdCQUFNLE9BQU4sR0FBZ0IsUUFBaEIsQ0FERjtBQUVFLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWIsQ0FGRjtBQUdFLGlCQUFPLEtBQVAsQ0FIRjtBQTdCRixhQWlDTyxJQUFMO0FBQ0UsZ0JBQU0sT0FBTixHQUFnQixVQUFoQixDQURGO0FBRUUsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYixDQUZGO0FBR0UsaUJBQU8sS0FBUCxDQUhGO0FBakNGLGFBcUNPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLG1CQUFoQixDQURGO0FBRUUsY0FBRyxXQUFXLENBQVgsRUFBYTtBQUNkLGtCQUFNLDJEQUEyRCxNQUEzRCxDQURRO1dBQWhCO0FBR0EsZ0JBQU0sT0FBTixHQUFnQixPQUFPLFFBQVAsRUFBaEIsQ0FMRjtBQU1FLGlCQUFPLEtBQVAsQ0FORjtBQXJDRixhQTRDTyxJQUFMO0FBQ0UsZ0JBQU0sT0FBTixHQUFnQixZQUFoQixDQURGO0FBRUUsY0FBRyxXQUFXLENBQVgsRUFBYTtBQUNkLGtCQUFNLG9EQUFvRCxNQUFwRCxDQURRO1dBQWhCO0FBR0EsaUJBQU8sS0FBUCxDQUxGO0FBNUNGLGFBa0RPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLFVBQWhCLENBREY7QUFFRSxjQUFHLFdBQVcsQ0FBWCxFQUFhO0FBQ2Qsa0JBQU0sa0RBQWtELE1BQWxELENBRFE7V0FBaEI7QUFHQSxnQkFBTSxtQkFBTixHQUNFLENBQUMsT0FBTyxRQUFQLE1BQXFCLEVBQXJCLENBQUQsSUFDQyxPQUFPLFFBQVAsTUFBcUIsQ0FBckIsQ0FERCxHQUVBLE9BQU8sUUFBUCxFQUZBLENBTko7QUFVRSxpQkFBTyxLQUFQLENBVkY7QUFsREYsYUE2RE8sSUFBTDtBQUNFLGdCQUFNLE9BQU4sR0FBZ0IsYUFBaEIsQ0FERjtBQUVFLGNBQUcsV0FBVyxDQUFYLEVBQWE7QUFDZCxrQkFBTSxxREFBcUQsTUFBckQsQ0FEUTtXQUFoQjtBQUdBLGNBQUksV0FBVyxPQUFPLFFBQVAsRUFBWCxDQUxOO0FBTUUsZ0JBQU0sU0FBTixHQUFpQjtBQUNmLGtCQUFNLEVBQU4sRUFBVSxNQUFNLEVBQU4sRUFBVSxNQUFNLEVBQU4sRUFBVSxNQUFNLEVBQU47V0FEZixDQUVmLFdBQVcsSUFBWCxDQUZGLENBTkY7QUFTRSxnQkFBTSxJQUFOLEdBQWEsV0FBVyxJQUFYLENBVGY7QUFVRSxnQkFBTSxHQUFOLEdBQVksT0FBTyxRQUFQLEVBQVosQ0FWRjtBQVdFLGdCQUFNLEdBQU4sR0FBWSxPQUFPLFFBQVAsRUFBWixDQVhGO0FBWUUsZ0JBQU0sS0FBTixHQUFjLE9BQU8sUUFBUCxFQUFkLENBWkY7QUFhRSxnQkFBTSxRQUFOLEdBQWlCLE9BQU8sUUFBUCxFQUFqQixDQWJGO0FBY0UsaUJBQU8sS0FBUCxDQWRGO0FBN0RGLGFBNEVPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGVBQWhCLENBREY7QUFFRSxjQUFHLFdBQVcsQ0FBWCxFQUFhO0FBQ2Qsa0JBQU0sdURBQXVELE1BQXZELENBRFE7V0FBaEI7QUFHQSxnQkFBTSxTQUFOLEdBQWtCLE9BQU8sUUFBUCxFQUFsQixDQUxGO0FBTUUsZ0JBQU0sV0FBTixHQUFvQixLQUFLLEdBQUwsQ0FBUyxDQUFULEVBQVksT0FBTyxRQUFQLEVBQVosQ0FBcEIsQ0FORjtBQU9FLGdCQUFNLFNBQU4sR0FBa0IsT0FBTyxRQUFQLEVBQWxCLENBUEY7QUFRRSxnQkFBTSxhQUFOLEdBQXNCLE9BQU8sUUFBUCxFQUF0QixDQVJGO0FBU0UsaUJBQU8sS0FBUCxDQVRGO0FBNUVGLGFBc0ZPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLGNBQWhCLENBREY7QUFFRSxjQUFHLFdBQVcsQ0FBWCxFQUFhO0FBQ2Qsa0JBQU0sc0RBQXNELE1BQXRELENBRFE7V0FBaEI7QUFHQSxnQkFBTSxHQUFOLEdBQVksT0FBTyxRQUFQLENBQWdCLElBQWhCLENBQVosQ0FMRjtBQU1FLGdCQUFNLEtBQU4sR0FBYyxPQUFPLFFBQVAsRUFBZCxDQU5GO0FBT0UsaUJBQU8sS0FBUCxDQVBGO0FBdEZGLGFBOEZPLElBQUw7QUFDRSxnQkFBTSxPQUFOLEdBQWdCLG1CQUFoQixDQURGO0FBRUUsZ0JBQU0sSUFBTixHQUFhLE9BQU8sSUFBUCxDQUFZLE1BQVosQ0FBYixDQUZGO0FBR0UsaUJBQU8sS0FBUCxDQUhGO0FBOUZGOzs7O0FBc0dJLGdCQUFNLE9BQU4sR0FBZ0IsU0FBaEIsQ0FKRjtBQUtFLGdCQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWIsQ0FMRjtBQU1FLGlCQUFPLEtBQVAsQ0FORjtBQWxHRixPQUx1QjtBQStHdkIsWUFBTSxJQUFOLEdBQWEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFiLENBL0d1QjtBQWdIdkIsYUFBTyxLQUFQLENBaEh1QjtLQUF6QixNQWlITSxJQUFHLGlCQUFpQixJQUFqQixFQUFzQjtBQUM3QixZQUFNLElBQU4sR0FBYSxPQUFiLENBRDZCO0FBRTdCLGVBQVMsT0FBTyxVQUFQLEVBQVQsQ0FGNkI7QUFHN0IsWUFBTSxJQUFOLEdBQWEsT0FBTyxJQUFQLENBQVksTUFBWixDQUFiLENBSDZCO0FBSTdCLGFBQU8sS0FBUCxDQUo2QjtLQUF6QixNQUtBLElBQUcsaUJBQWlCLElBQWpCLEVBQXNCO0FBQzdCLFlBQU0sSUFBTixHQUFhLGNBQWIsQ0FENkI7QUFFN0IsZUFBUyxPQUFPLFVBQVAsRUFBVCxDQUY2QjtBQUc3QixZQUFNLElBQU4sR0FBYSxPQUFPLElBQVAsQ0FBWSxNQUFaLENBQWIsQ0FINkI7QUFJN0IsYUFBTyxLQUFQLENBSjZCO0tBQXpCLE1BS0Q7QUFDSCxZQUFNLHdDQUF3QyxhQUF4QyxDQURIO0tBTEM7R0F4SFIsTUFnSUs7O0FBRUgsUUFBSSxlQUFKLENBRkc7QUFHSCxRQUFHLENBQUMsZ0JBQWdCLElBQWhCLENBQUQsS0FBMkIsQ0FBM0IsRUFBNkI7Ozs7O0FBSzlCLGVBQVMsYUFBVCxDQUw4QjtBQU05QixzQkFBZ0IsaUJBQWhCLENBTjhCO0tBQWhDLE1BT0s7QUFDSCxlQUFTLE9BQU8sUUFBUCxFQUFUOztBQURHLHVCQUdILEdBQW9CLGFBQXBCLENBSEc7S0FQTDtBQVlBLFFBQUksWUFBWSxpQkFBaUIsQ0FBakIsQ0FmYjtBQWdCSCxVQUFNLE9BQU4sR0FBZ0IsZ0JBQWdCLElBQWhCLENBaEJiO0FBaUJILFVBQU0sSUFBTixHQUFhLFNBQWIsQ0FqQkc7QUFrQkgsWUFBUSxTQUFSO0FBQ0UsV0FBSyxJQUFMO0FBQ0UsY0FBTSxPQUFOLEdBQWdCLFNBQWhCLENBREY7QUFFRSxjQUFNLFVBQU4sR0FBbUIsTUFBbkIsQ0FGRjtBQUdFLGNBQU0sUUFBTixHQUFpQixPQUFPLFFBQVAsRUFBakIsQ0FIRjtBQUlFLGVBQU8sS0FBUCxDQUpGO0FBREYsV0FNTyxJQUFMO0FBQ0UsY0FBTSxVQUFOLEdBQW1CLE1BQW5CLENBREY7QUFFRSxjQUFNLFFBQU4sR0FBaUIsT0FBTyxRQUFQLEVBQWpCLENBRkY7QUFHRSxZQUFHLE1BQU0sUUFBTixLQUFtQixDQUFuQixFQUFxQjtBQUN0QixnQkFBTSxPQUFOLEdBQWdCLFNBQWhCLENBRHNCO1NBQXhCLE1BRUs7QUFDSCxnQkFBTSxPQUFOLEdBQWdCLFFBQWhCOztBQURHLFNBRkw7QUFNQSxlQUFPLEtBQVAsQ0FURjtBQU5GLFdBZ0JPLElBQUw7QUFDRSxjQUFNLE9BQU4sR0FBZ0IsZ0JBQWhCLENBREY7QUFFRSxjQUFNLFVBQU4sR0FBbUIsTUFBbkIsQ0FGRjtBQUdFLGNBQU0sTUFBTixHQUFlLE9BQU8sUUFBUCxFQUFmLENBSEY7QUFJRSxlQUFPLEtBQVAsQ0FKRjtBQWhCRixXQXFCTyxJQUFMO0FBQ0UsY0FBTSxPQUFOLEdBQWdCLFlBQWhCLENBREY7QUFFRSxjQUFNLGNBQU4sR0FBdUIsTUFBdkIsQ0FGRjtBQUdFLGNBQU0sS0FBTixHQUFjLE9BQU8sUUFBUCxFQUFkLENBSEY7QUFJRSxlQUFPLEtBQVAsQ0FKRjtBQXJCRixXQTBCTyxJQUFMO0FBQ0UsY0FBTSxPQUFOLEdBQWdCLGVBQWhCLENBREY7QUFFRSxjQUFNLGFBQU4sR0FBc0IsTUFBdEIsQ0FGRjtBQUdFLGVBQU8sS0FBUCxDQUhGO0FBMUJGLFdBOEJPLElBQUw7QUFDRSxjQUFNLE9BQU4sR0FBZ0IsbUJBQWhCLENBREY7QUFFRSxjQUFNLE1BQU4sR0FBZSxNQUFmOzs7O0FBRkYsZUFNUyxLQUFQLENBTkY7QUE5QkYsV0FxQ08sSUFBTDtBQUNFLGNBQU0sT0FBTixHQUFnQixXQUFoQixDQURGO0FBRUUsY0FBTSxLQUFOLEdBQWMsVUFBVSxPQUFPLFFBQVAsTUFBcUIsQ0FBckIsQ0FBVixDQUZoQjtBQUdFLGVBQU8sS0FBUCxDQUhGO0FBckNGOzs7Ozs7QUErQ0ksY0FBTSxLQUFOLEdBQWMsT0FBTyxRQUFQLEVBQWQsQ0FORjtBQU9FLGNBQU0sT0FBTixHQUFnQixTQUFoQjs7Ozs7Ozs7O0FBUEYsZUFnQlMsS0FBUCxDQWhCRjtBQXpDRixLQWxCRztHQWhJTDtDQU5GOztBQXVOTyxTQUFTLGFBQVQsQ0FBdUIsTUFBdkIsRUFBOEI7QUFDbkMsTUFBRyxrQkFBa0IsVUFBbEIsS0FBaUMsS0FBakMsSUFBMEMsa0JBQWtCLFdBQWxCLEtBQWtDLEtBQWxDLEVBQXdDO0FBQ25GLFlBQVEsS0FBUixDQUFjLDJEQUFkLEVBRG1GO0FBRW5GLFdBRm1GO0dBQXJGO0FBSUEsTUFBRyxrQkFBa0IsV0FBbEIsRUFBOEI7QUFDL0IsYUFBUyxJQUFJLFVBQUosQ0FBZSxNQUFmLENBQVQsQ0FEK0I7R0FBakM7QUFHQSxNQUFJLFNBQVMsSUFBSSxHQUFKLEVBQVQsQ0FSK0I7QUFTbkMsTUFBSSxTQUFTLDBCQUFlLE1BQWYsQ0FBVCxDQVQrQjs7QUFXbkMsTUFBSSxjQUFjLFVBQVUsTUFBVixDQUFkLENBWCtCO0FBWW5DLE1BQUcsWUFBWSxFQUFaLEtBQW1CLE1BQW5CLElBQTZCLFlBQVksTUFBWixLQUF1QixDQUF2QixFQUF5QjtBQUN2RCxVQUFNLGtDQUFOLENBRHVEO0dBQXpEOztBQUlBLE1BQUksZUFBZSwwQkFBZSxZQUFZLElBQVosQ0FBOUIsQ0FoQitCO0FBaUJuQyxNQUFJLGFBQWEsYUFBYSxTQUFiLEVBQWIsQ0FqQitCO0FBa0JuQyxNQUFJLGFBQWEsYUFBYSxTQUFiLEVBQWIsQ0FsQitCO0FBbUJuQyxNQUFJLGVBQWUsYUFBYSxTQUFiLEVBQWYsQ0FuQitCOztBQXFCbkMsTUFBRyxlQUFlLE1BQWYsRUFBc0I7QUFDdkIsVUFBTSwrREFBTixDQUR1QjtHQUF6Qjs7QUFJQSxNQUFJLFNBQVE7QUFDVixrQkFBYyxVQUFkO0FBQ0Esa0JBQWMsVUFBZDtBQUNBLG9CQUFnQixZQUFoQjtHQUhFLENBekIrQjs7QUErQm5DLE9BQUksSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFVBQUosRUFBZ0IsR0FBL0IsRUFBbUM7QUFDakMsZ0JBQVksV0FBVyxDQUFYLENBRHFCO0FBRWpDLFFBQUksUUFBUSxFQUFSLENBRjZCO0FBR2pDLFFBQUksYUFBYSxVQUFVLE1BQVYsQ0FBYixDQUg2QjtBQUlqQyxRQUFHLFdBQVcsRUFBWCxLQUFrQixNQUFsQixFQUF5QjtBQUMxQixZQUFNLDJDQUEwQyxXQUFXLEVBQVgsQ0FEdEI7S0FBNUI7QUFHQSxRQUFJLGNBQWMsMEJBQWUsV0FBVyxJQUFYLENBQTdCLENBUDZCO0FBUWpDLFdBQU0sQ0FBQyxZQUFZLEdBQVosRUFBRCxFQUFtQjtBQUN2QixVQUFJLFFBQVEsVUFBVSxXQUFWLENBQVIsQ0FEbUI7QUFFdkIsWUFBTSxJQUFOLENBQVcsS0FBWCxFQUZ1QjtLQUF6QjtBQUlBLFdBQU8sR0FBUCxDQUFXLFNBQVgsRUFBc0IsS0FBdEIsRUFaaUM7R0FBbkM7O0FBZUEsU0FBTTtBQUNKLGNBQVUsTUFBVjtBQUNBLGNBQVUsTUFBVjtHQUZGLENBOUNtQztDQUE5Qjs7Ozs7Ozs7Ozs7Ozs7QUN2T1A7Ozs7O1FBb0NnQjtRQWtQQTtRQVNBO1FBU0E7UUFTQTtRQVNBO1FBU0E7O0FBalVoQjs7QUFFQSxJQUNFLGlCQURGO0lBRUUsbUJBRkY7SUFHRSxNQUFNLEtBQUssR0FBTDtJQUNOLFFBQVEsS0FBSyxLQUFMOztBQUVWLElBQU0sWUFBWTtBQUNoQixXQUFVLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLEdBQXZCLEVBQTRCLEdBQTVCLEVBQWlDLElBQWpDLEVBQXVDLEdBQXZDLEVBQTRDLElBQTVDLEVBQWtELEdBQWxELEVBQXVELElBQXZELEVBQTZELEdBQTdELENBQVY7QUFDQSxVQUFTLENBQUMsR0FBRCxFQUFNLElBQU4sRUFBWSxHQUFaLEVBQWlCLElBQWpCLEVBQXVCLEdBQXZCLEVBQTRCLEdBQTVCLEVBQWlDLElBQWpDLEVBQXVDLEdBQXZDLEVBQTRDLElBQTVDLEVBQWtELEdBQWxELEVBQXVELElBQXZELEVBQTZELEdBQTdELENBQVQ7QUFDQSxzQkFBcUIsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLEtBQWIsRUFBb0IsSUFBcEIsRUFBMEIsS0FBMUIsRUFBaUMsSUFBakMsRUFBdUMsSUFBdkMsRUFBNkMsS0FBN0MsRUFBb0QsSUFBcEQsRUFBMEQsS0FBMUQsRUFBaUUsSUFBakUsRUFBdUUsS0FBdkUsQ0FBckI7QUFDQSxxQkFBb0IsQ0FBQyxLQUFELEVBQVEsSUFBUixFQUFjLEtBQWQsRUFBcUIsSUFBckIsRUFBMkIsSUFBM0IsRUFBaUMsS0FBakMsRUFBd0MsSUFBeEMsRUFBOEMsS0FBOUMsRUFBcUQsSUFBckQsRUFBMkQsS0FBM0QsRUFBa0UsSUFBbEUsRUFBd0UsSUFBeEUsQ0FBcEI7Q0FKSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEwQkMsU0FBUyxVQUFULEdBQTRCO0FBQ2pDLE1BQ0UsVUFBVSxVQUFLLE1BQUw7TUFDVixhQUZGO01BR0UsZUFIRjtNQUlFLGlCQUpGO01BS0UsbUJBTEY7TUFNRSxxQkFORjtNQU9FLHVEQVBGO01BUUUsdURBUkY7TUFTRSx1REFURjtNQVVFLFFBQVEsc0JBQVcsSUFBWCxDQUFSO01BQ0EsUUFBUSxzQkFBVyxJQUFYLENBQVI7TUFDQSxRQUFRLHNCQUFXLElBQVgsQ0FBUixDQWIrQjs7QUFlakMsYUFBVyxFQUFYLENBZmlDO0FBZ0JqQyxlQUFhLEVBQWI7OztBQWhCaUMsTUFtQjlCLFlBQVksQ0FBWixJQUFpQixVQUFVLFFBQVYsRUFBbUI7QUFDckMsUUFBRyxPQUFPLENBQVAsSUFBWSxPQUFPLEdBQVAsRUFBVztBQUN4QixpQkFBVyxrREFBbUQsSUFBbkQsQ0FEYTtLQUExQixNQUVLO0FBQ0gsbUJBQWEsSUFBYixDQURHO0FBRUgsYUFBTyxhQUFhLFVBQWIsQ0FBUCxDQUZHO0FBR0gsaUJBQVcsS0FBSyxDQUFMLENBQVgsQ0FIRztBQUlILGVBQVMsS0FBSyxDQUFMLENBQVQsQ0FKRztLQUZMOzs7QUFEcUMsR0FBdkMsTUFZTSxJQUFHLFlBQVksQ0FBWixJQUFpQixVQUFVLFFBQVYsRUFBbUI7QUFDM0MsYUFBTyxlQUFlLElBQWYsQ0FBUCxDQUQyQztBQUUzQyxVQUFHLGFBQWEsRUFBYixFQUFnQjtBQUNqQixtQkFBVyxLQUFLLENBQUwsQ0FBWCxDQURpQjtBQUVqQixpQkFBUyxLQUFLLENBQUwsQ0FBVCxDQUZpQjtBQUdqQixxQkFBYSxlQUFlLFFBQWYsRUFBeUIsTUFBekIsQ0FBYixDQUhpQjtPQUFuQjs7O0FBRjJDLEtBQXZDLE1BU0EsSUFBRyxZQUFZLENBQVosSUFBaUIsVUFBVSxRQUFWLElBQXNCLFVBQVUsUUFBVixFQUFtQjtBQUNqRSxlQUFPLGVBQWUsSUFBZixFQUFxQixJQUFyQixDQUFQLENBRGlFO0FBRWpFLFlBQUcsYUFBYSxFQUFiLEVBQWdCO0FBQ2pCLHFCQUFXLEtBQUssQ0FBTCxDQUFYLENBRGlCO0FBRWpCLG1CQUFTLEtBQUssQ0FBTCxDQUFULENBRmlCO0FBR2pCLHVCQUFhLGVBQWUsUUFBZixFQUF5QixNQUF6QixDQUFiLENBSGlCO1NBQW5COzs7QUFGaUUsT0FBN0QsTUFTQSxJQUFHLFlBQVksQ0FBWixJQUFpQixVQUFVLFFBQVYsSUFBc0IsVUFBVSxRQUFWLEVBQW1CO0FBQ2pFLGlCQUFPLGVBQWUsSUFBZixDQUFQLENBRGlFO0FBRWpFLGNBQUcsYUFBYSxFQUFiLEVBQWdCO0FBQ2pCLDJCQUFlLG1CQUFtQixJQUFuQixDQUFmLENBRGlCO0FBRWpCLHVCQUFXLEtBQUssQ0FBTCxDQUFYLENBRmlCO0FBR2pCLHFCQUFTLEtBQUssQ0FBTCxDQUFULENBSGlCO0FBSWpCLHlCQUFhLGVBQWUsUUFBZixFQUF5QixNQUF6QixDQUFiLENBSmlCO1dBQW5COzs7QUFGaUUsU0FBN0QsTUFXQSxJQUFHLFlBQVksQ0FBWixJQUFpQixzQkFBVyxJQUFYLE1BQXFCLFFBQXJCLElBQWlDLHNCQUFXLElBQVgsTUFBcUIsUUFBckIsRUFBOEI7QUFDdkYsZ0JBQUcsT0FBTyxDQUFQLElBQVksT0FBTyxHQUFQLEVBQVc7QUFDeEIseUJBQVcsa0RBQWtELElBQWxELENBRGE7YUFBMUIsTUFFSztBQUNILDZCQUFlLG1CQUFtQixJQUFuQixDQUFmLENBREc7QUFFSCwyQkFBYSxJQUFiLENBRkc7QUFHSCxxQkFBTyxhQUFhLFVBQWIsRUFBeUIsWUFBekIsQ0FBUCxDQUhHO0FBSUgseUJBQVcsS0FBSyxDQUFMLENBQVgsQ0FKRztBQUtILHVCQUFTLEtBQUssQ0FBTCxDQUFULENBTEc7YUFGTDs7O0FBRHVGLFdBQW5GLE1BYUEsSUFBRyxZQUFZLENBQVosSUFBaUIsVUFBVSxRQUFWLElBQXNCLFVBQVUsUUFBVixJQUFzQixVQUFVLFFBQVYsRUFBbUI7QUFDdkYscUJBQU8sZUFBZSxJQUFmLEVBQXFCLElBQXJCLENBQVAsQ0FEdUY7QUFFdkYsa0JBQUcsYUFBYSxFQUFiLEVBQWdCO0FBQ2pCLCtCQUFlLG1CQUFtQixJQUFuQixDQUFmLENBRGlCO0FBRWpCLDJCQUFXLEtBQUssQ0FBTCxDQUFYLENBRmlCO0FBR2pCLHlCQUFTLEtBQUssQ0FBTCxDQUFULENBSGlCO0FBSWpCLDZCQUFhLGVBQWUsUUFBZixFQUF3QixNQUF4QixDQUFiLENBSmlCO2VBQW5CO2FBRkksTUFTRDtBQUNILHlCQUFXLCtDQUFYLENBREc7YUFUQzs7QUFhTixNQUFHLFFBQUgsRUFBWTtBQUNWLFlBQVEsS0FBUixDQUFjLFFBQWQsRUFEVTtBQUVWLFdBQU8sS0FBUCxDQUZVO0dBQVo7O0FBS0EsTUFBRyxVQUFILEVBQWM7QUFDWixZQUFRLElBQVIsQ0FBYSxVQUFiLEVBRFk7R0FBZDs7QUFJQSxNQUFJLE9BQU87QUFDVCxVQUFNLFFBQU47QUFDQSxZQUFRLE1BQVI7QUFDQSxjQUFVLFdBQVcsTUFBWDtBQUNWLFlBQVEsVUFBUjtBQUNBLGVBQVcsY0FBYyxVQUFkLENBQVg7QUFDQSxjQUFVLFlBQVksVUFBWixDQUFWO0dBTkUsQ0EvRjZCO0FBdUdqQyxTQUFPLE1BQVAsQ0FBYyxJQUFkLEVBdkdpQztBQXdHakMsU0FBTyxJQUFQLENBeEdpQztDQUE1Qjs7O0FBNkdQLFNBQVMsWUFBVCxDQUFzQixNQUF0QixFQUE4QztNQUFoQiw2REFBTyx1QkFBUzs7O0FBRTVDLE1BQUksU0FBUyxNQUFNLE1BQUMsR0FBUyxFQUFULEdBQWUsQ0FBaEIsQ0FBZixDQUZ3QztBQUc1QyxNQUFJLFdBQVcsVUFBVSxJQUFWLEVBQWdCLFNBQVMsRUFBVCxDQUEzQixDQUh3QztBQUk1QyxTQUFPLENBQUMsUUFBRCxFQUFXLE1BQVgsQ0FBUCxDQUo0QztDQUE5Qzs7QUFRQSxTQUFTLGNBQVQsQ0FBd0IsSUFBeEIsRUFBOEIsTUFBOUIsRUFBc0M7QUFDcEMsTUFBSSxPQUFPLE9BQU8sSUFBUCxDQUFZLFNBQVosQ0FBUCxDQURnQztBQUVwQyxNQUFJLGNBQUosQ0FGb0M7Ozs7Ozs7QUFJcEMseUJBQWUsOEJBQWYsb0dBQW9CO1VBQVosa0JBQVk7O0FBQ2xCLFVBQUksT0FBTyxVQUFVLEdBQVYsQ0FBUCxDQURjO0FBRWxCLGNBQVEsS0FBSyxTQUFMLENBQWU7ZUFBSyxNQUFNLElBQU47T0FBTCxDQUF2QixDQUZrQjtBQUdsQixVQUFHLFVBQVUsQ0FBQyxDQUFELEVBQUc7QUFDZCxjQURjO09BQWhCO0tBSEY7Ozs7Ozs7Ozs7Ozs7Ozs7R0FKb0M7O0FBYXBDLE1BQUksU0FBUyxLQUFDLEdBQVEsRUFBUixHQUFlLFNBQVMsRUFBVDs7QUFiTyxNQWVqQyxTQUFTLENBQVQsSUFBYyxTQUFTLEdBQVQsRUFBYTtBQUM1QixlQUFXLDBDQUFYLENBRDRCO0FBRTVCLFdBRjRCO0dBQTlCO0FBSUEsU0FBTyxNQUFQLENBbkJvQztDQUF0Qzs7QUF1QkEsU0FBUyxhQUFULENBQXVCLE1BQXZCLEVBQThCOztBQUU1QixTQUFPLE1BQU0sSUFBSSxDQUFKLEVBQU0sQ0FBQyxTQUFTLEVBQVQsQ0FBRCxHQUFjLEVBQWQsQ0FBWjtBQUZxQixDQUE5Qjs7O0FBT0EsU0FBUyxTQUFULENBQW1CLEtBQW5CLEVBQXlCOztDQUF6Qjs7QUFLQSxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWlDO0FBQy9CLE1BQUksT0FBTyxPQUFPLElBQVAsQ0FBWSxTQUFaLENBQVAsQ0FEMkI7QUFFL0IsTUFBSSxTQUFTLEtBQUssSUFBTCxDQUFVO1dBQUssTUFBTSxJQUFOO0dBQUwsQ0FBVixLQUErQixTQUEvQixDQUZrQjtBQUcvQixNQUFHLFdBQVcsS0FBWCxFQUFpQjs7QUFFbEIsV0FBTyxPQUFQLENBRmtCO0FBR2xCLGlCQUFhLE9BQU8seUNBQVAsR0FBbUQsSUFBbkQsR0FBMEQsV0FBMUQsQ0FISztHQUFwQjtBQUtBLFNBQU8sSUFBUCxDQVIrQjtDQUFqQzs7QUFZQSxTQUFTLGNBQVQsR0FBZ0M7QUFDOUIsTUFDRSxVQUFVLFVBQUssTUFBTDtNQUNWLHVEQUZGO01BR0UsdURBSEY7TUFJRSxhQUpGO01BS0UsT0FBTyxFQUFQO01BQ0EsU0FBUyxFQUFUOzs7QUFQNEIsTUFVM0IsWUFBWSxDQUFaLEVBQWM7Ozs7OztBQUNmLDRCQUFZLCtCQUFaLHdHQUFpQjtBQUFiLDRCQUFhOztBQUNmLFlBQUcsTUFBTSxJQUFOLEtBQWUsU0FBUyxHQUFULEVBQWE7QUFDN0Isa0JBQVEsSUFBUixDQUQ2QjtTQUEvQixNQUVLO0FBQ0gsb0JBQVUsSUFBVixDQURHO1NBRkw7T0FERjs7Ozs7Ozs7Ozs7Ozs7S0FEZTs7QUFRZixRQUFHLFdBQVcsRUFBWCxFQUFjO0FBQ2YsZUFBUyxDQUFULENBRGU7S0FBakI7R0FSRixNQVdNLElBQUcsWUFBWSxDQUFaLEVBQWM7QUFDckIsV0FBTyxJQUFQLENBRHFCO0FBRXJCLGFBQVMsSUFBVCxDQUZxQjtHQUFqQjs7O0FBckJ3QixNQTJCMUIsT0FBTyxPQUFPLElBQVAsQ0FBWSxTQUFaLENBQVAsQ0EzQjBCO0FBNEI5QixNQUFJLFFBQVEsQ0FBQyxDQUFELENBNUJrQjs7Ozs7OztBQThCOUIsMEJBQWUsK0JBQWYsd0dBQW9CO1VBQVosbUJBQVk7O0FBQ2xCLFVBQUksT0FBTyxVQUFVLEdBQVYsQ0FBUCxDQURjO0FBRWxCLGNBQVEsS0FBSyxTQUFMLENBQWU7ZUFBSyxNQUFNLElBQU47T0FBTCxDQUF2QixDQUZrQjtBQUdsQixVQUFHLFVBQVUsQ0FBQyxDQUFELEVBQUc7QUFDZCxjQURjO09BQWhCO0tBSEY7Ozs7Ozs7Ozs7Ozs7O0dBOUI4Qjs7QUFzQzlCLE1BQUcsVUFBVSxDQUFDLENBQUQsRUFBRztBQUNkLGVBQVcsT0FBTyw2SUFBUCxDQURHO0FBRWQsV0FGYztHQUFoQjs7QUFLQSxNQUFHLFNBQVMsQ0FBQyxDQUFELElBQU0sU0FBUyxDQUFULEVBQVc7QUFDM0IsZUFBVywyQ0FBWCxDQUQyQjtBQUUzQixXQUYyQjtHQUE3Qjs7QUFLQSxXQUFTLFNBQVMsTUFBVCxFQUFpQixFQUFqQixDQUFULENBaEQ4QjtBQWlEOUIsU0FBTyxLQUFLLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLENBQWxCLEVBQXFCLFdBQXJCLEtBQXFDLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBckM7OztBQWpEdUIsU0FvRHZCLENBQUMsSUFBRCxFQUFPLE1BQVAsQ0FBUCxDQXBEOEI7Q0FBaEM7O0FBeURBLFNBQVMsV0FBVCxDQUFxQixVQUFyQixFQUFnQztBQUM5QixNQUFJLGNBQUosQ0FEOEI7O0FBRzlCLFVBQU8sSUFBUDtBQUNFLFNBQUssYUFBYSxFQUFiLEtBQW9CLENBQXBCO0FBRFAsU0FFTyxhQUFhLEVBQWIsS0FBb0IsQ0FBcEI7QUFGUCxTQUdPLGFBQWEsRUFBYixLQUFvQixDQUFwQjtBQUhQLFNBSU8sYUFBYSxFQUFiLEtBQW9CLENBQXBCO0FBSlAsU0FLTyxhQUFhLEVBQWIsS0FBb0IsRUFBcEI7O0FBQ0gsY0FBUSxJQUFSLENBREY7QUFFRSxZQUZGO0FBTEY7QUFTSSxjQUFRLEtBQVIsQ0FERjtBQVJGLEdBSDhCOztBQWU5QixTQUFPLEtBQVAsQ0FmOEI7Q0FBaEM7O0FBcUJPLFNBQVMsYUFBVCxHQUErQjtBQUNwQyxNQUFJLE9BQU8sc0NBQVAsQ0FEZ0M7QUFFcEMsTUFBRyxJQUFILEVBQVE7QUFDTixXQUFPLEtBQUssTUFBTCxDQUREO0dBQVI7QUFHQSxTQUFPLFFBQVAsQ0FMb0M7Q0FBL0I7O0FBU0EsU0FBUyxXQUFULEdBQTZCO0FBQ2xDLE1BQUksT0FBTyxzQ0FBUCxDQUQ4QjtBQUVsQyxNQUFHLElBQUgsRUFBUTtBQUNOLFdBQU8sS0FBSyxJQUFMLENBREQ7R0FBUjtBQUdBLFNBQU8sS0FBUCxDQUxrQztDQUE3Qjs7QUFTQSxTQUFTLGFBQVQsR0FBK0I7QUFDcEMsTUFBSSxPQUFPLHNDQUFQLENBRGdDO0FBRXBDLE1BQUcsSUFBSCxFQUFRO0FBQ04sV0FBTyxLQUFLLE1BQUwsQ0FERDtHQUFSO0FBR0EsU0FBTyxLQUFQLENBTG9DO0NBQS9COztBQVNBLFNBQVMsZUFBVCxHQUFpQztBQUN0QyxNQUFJLE9BQU8sc0NBQVAsQ0FEa0M7QUFFdEMsTUFBRyxJQUFILEVBQVE7QUFDTixXQUFPLEtBQUssUUFBTCxDQUREO0dBQVI7QUFHQSxTQUFPLEtBQVAsQ0FMc0M7Q0FBakM7O0FBU0EsU0FBUyxZQUFULEdBQThCO0FBQ25DLE1BQUksT0FBTyxzQ0FBUCxDQUQrQjtBQUVuQyxNQUFHLElBQUgsRUFBUTtBQUNOLFdBQU8sS0FBSyxTQUFMLENBREQ7R0FBUjtBQUdBLFNBQU8sS0FBUCxDQUxtQztDQUE5Qjs7QUFTQSxTQUFTLFVBQVQsR0FBNEI7QUFDakMsTUFBSSxPQUFPLHNDQUFQLENBRDZCO0FBRWpDLE1BQUcsSUFBSCxFQUFRO0FBQ04sV0FBTyxLQUFLLFFBQUwsQ0FERDtHQUFSO0FBR0EsU0FBTyxLQUFQLENBTGlDO0NBQTVCOzs7QUM5VVA7Ozs7O1FBMkVnQjtRQTBEQTtRQW1MQTtRQTRDQTs7QUFsV2hCOztBQUVBLElBQ0UsWUFERjtJQUVFLFlBRkY7SUFHRSxlQUhGO0lBSUUsa0JBSkY7SUFLRSxvQkFMRjtJQU1FLHNCQU5GO0lBUUUsWUFSRjtJQVNFLGFBVEY7SUFVRSxrQkFWRjtJQVdFLGFBWEY7SUFZRSxjQVpGO0lBYUUsZUFiRjtJQWVFLHNCQWZGO0lBZ0JFLHVCQWhCRjtJQWtCRSxxQkFsQkY7SUFtQkUsb0JBbkJGO0lBb0JFLDBCQXBCRjtJQXFCRSxxQkFyQkY7SUF1QkUsa0JBdkJGO0lBd0JFLHNCQXhCRjs7QUEyQkEsU0FBUyxlQUFULEdBQTBCO0FBQ3hCLG1CQUFpQixDQUFDLEdBQUksYUFBSixHQUFvQixFQUFwQixHQUEwQixHQUEzQixHQUFpQyxHQUFqQyxDQURPO0FBRXhCLGtCQUFnQixpQkFBaUIsSUFBakI7OztBQUZRLENBQTFCOztBQVFBLFNBQVMsZUFBVCxHQUEwQjtBQUN4QixXQUFVLElBQUksV0FBSixDQURjO0FBRXhCLGlCQUFlLFNBQVMsQ0FBVCxDQUZTO0FBR3hCLGlCQUFlLE1BQU0sTUFBTixDQUhTO0FBSXhCLGdCQUFjLGVBQWUsU0FBZixDQUpVO0FBS3hCLHNCQUFvQixNQUFNLENBQU47O0FBTEksQ0FBMUI7O0FBVUEsU0FBUyxjQUFULENBQXdCLEtBQXhCLEVBQThCO0FBQzVCLGNBQVksTUFBTSxLQUFOLEdBQWMsS0FBZCxDQURnQjtBQUU1QixNQUFHLFlBQVksQ0FBWixFQUFjO0FBQ2YsWUFBUSxHQUFSLENBQVksU0FBWixFQUF1QixNQUFNLEtBQU4sRUFBYSxjQUFjLEtBQWQsRUFBcUIsY0FBYyxJQUFkLENBQXpELENBRGU7R0FBakI7QUFHQSxVQUFRLFNBQVIsQ0FMNEI7QUFNNUIsVUFBUSxNQUFNLEtBQU4sQ0FOb0I7QUFPNUIsa0JBQWdCLEtBQWhCOztBQVA0QixRQVM1QixJQUFVLFlBQVksYUFBWixDQVRrQjs7QUFXNUIsU0FBTSxRQUFRLGlCQUFSLEVBQTBCO0FBQzlCLGdCQUQ4QjtBQUU5QixZQUFRLGlCQUFSLENBRjhCO0FBRzlCLFdBQU0sWUFBWSxZQUFaLEVBQXlCO0FBQzdCLG1CQUFhLFlBQWIsQ0FENkI7QUFFN0IsYUFGNkI7QUFHN0IsYUFBTSxPQUFPLFNBQVAsRUFBaUI7QUFDckIsZ0JBQVEsU0FBUixDQURxQjtBQUVyQixjQUZxQjtPQUF2QjtLQUhGO0dBSEY7Q0FYRjs7QUEwQk8sU0FBUyxlQUFULENBQXlCLFFBQXpCLEVBQW1DLFVBQW5DLEVBQThDOztBQUVuRCxNQUFJLGFBQUosQ0FGbUQ7QUFHbkQsTUFBSSxjQUFKLENBSG1EOztBQUtuRCxRQUFNLFNBQVMsR0FBVCxDQUw2QztBQU1uRCxRQUFNLFNBQVMsR0FBVCxDQU42QztBQU9uRCxjQUFZLFNBQVMsU0FBVCxDQVB1QztBQVFuRCxnQkFBYyxTQUFTLFdBQVQsQ0FScUM7QUFTbkQsa0JBQWdCLFNBQVMsYUFBVCxDQVRtQztBQVVuRCxRQUFNLENBQU4sQ0FWbUQ7QUFXbkQsU0FBTyxDQUFQLENBWG1EO0FBWW5ELGNBQVksQ0FBWixDQVptRDtBQWFuRCxTQUFPLENBQVAsQ0FibUQ7QUFjbkQsVUFBUSxDQUFSLENBZG1EO0FBZW5ELFdBQVMsQ0FBVCxDQWZtRDs7QUFpQm5ELG9CQWpCbUQ7QUFrQm5ELG9CQWxCbUQ7O0FBb0JuRCxhQUFXLElBQVgsQ0FBZ0IsVUFBQyxDQUFELEVBQUksQ0FBSjtXQUFVLENBQUMsQ0FBRSxLQUFGLElBQVcsRUFBRSxLQUFGLEdBQVcsQ0FBQyxDQUFELEdBQUssQ0FBNUI7R0FBVixDQUFoQixDQXBCbUQ7QUFxQm5ELE1BQUksSUFBSSxDQUFKLENBckIrQzs7Ozs7O0FBc0JuRCx5QkFBYSxvQ0FBYixvR0FBd0I7QUFBcEIsMEJBQW9COzs7O0FBR3RCLGFBQU8sTUFBTSxJQUFOLENBSGU7QUFJdEIscUJBQWUsS0FBZixFQUpzQjs7QUFNdEIsY0FBTyxJQUFQOztBQUVFLGFBQUssSUFBTDtBQUNFLGdCQUFNLE1BQU0sS0FBTjs7QUFEUix5QkFHRSxHQUhGO0FBSUUsZ0JBSkY7O0FBRkYsYUFRTyxJQUFMO0FBQ0Usc0JBQVksTUFBTSxLQUFOLENBRGQ7QUFFRSx3QkFBYyxNQUFNLEtBQU4sQ0FGaEI7QUFHRSw0QkFIRjtBQUlFLGdCQUpGOztBQVJGO0FBZUksbUJBREY7QUFkRjs7O0FBTnNCLGlCQXlCdEIsQ0FBWSxLQUFaOztBQXpCc0IsS0FBeEI7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXRCbUQ7Q0FBOUM7OztBQTBEQSxTQUFTLFdBQVQsQ0FBcUIsTUFBckIsRUFBNEI7O0FBRWpDLE1BQUksY0FBSixDQUZpQztBQUdqQyxNQUFJLGFBQWEsQ0FBYixDQUg2QjtBQUlqQyxNQUFJLGdCQUFnQixDQUFoQixDQUo2QjtBQUtqQyxNQUFJLFNBQVMsRUFBVCxDQUw2Qjs7QUFPakMsU0FBTyxDQUFQLENBUGlDO0FBUWpDLFVBQVEsQ0FBUixDQVJpQztBQVNqQyxjQUFZLENBQVo7OztBQVRpQyxNQVk3QixZQUFZLE9BQU8sTUFBUDs7Ozs7Ozs7Ozs7QUFaaUIsUUF1QmpDLENBQU8sSUFBUCxDQUFZLFVBQVMsQ0FBVCxFQUFZLENBQVosRUFBYztBQUN4QixRQUFHLEVBQUUsS0FBRixLQUFZLEVBQUUsS0FBRixFQUFROzs7Ozs7O0FBT3JCLFVBQUksSUFBSSxFQUFFLElBQUYsR0FBUyxFQUFFLElBQUYsQ0FQSTtBQVFyQixVQUFHLEVBQUUsSUFBRixLQUFXLEdBQVgsSUFBa0IsRUFBRSxJQUFGLEtBQVcsR0FBWCxFQUFlO0FBQ2xDLFlBQUksQ0FBQyxDQUFELENBRDhCO09BQXBDO0FBR0EsYUFBTyxDQUFQLENBWHFCO0tBQXZCO0FBYUEsV0FBTyxFQUFFLEtBQUYsR0FBVSxFQUFFLEtBQUYsQ0FkTztHQUFkLENBQVosQ0F2QmlDO0FBdUNqQyxVQUFRLE9BQU8sQ0FBUCxDQUFSOzs7QUF2Q2lDLEtBMENqQyxHQUFNLE1BQU0sR0FBTixDQTFDMkI7QUEyQ2pDLFdBQVMsTUFBTSxNQUFOLENBM0N3QjtBQTRDakMsY0FBWSxNQUFNLFNBQU4sQ0E1Q3FCO0FBNkNqQyxnQkFBYyxNQUFNLFdBQU4sQ0E3Q21COztBQStDakMsZ0JBQWMsTUFBTSxXQUFOLENBL0NtQjtBQWdEakMsaUJBQWUsTUFBTSxZQUFOLENBaERrQjtBQWlEakMsc0JBQW9CLE1BQU0saUJBQU4sQ0FqRGE7O0FBbURqQyxpQkFBZSxNQUFNLFlBQU4sQ0FuRGtCOztBQXFEakMsa0JBQWdCLE1BQU0sYUFBTixDQXJEaUI7QUFzRGpDLG1CQUFpQixNQUFNLGNBQU4sQ0F0RGdCOztBQXdEakMsV0FBUyxNQUFNLE1BQU4sQ0F4RHdCOztBQTBEakMsUUFBTSxNQUFNLEdBQU4sQ0ExRDJCO0FBMkRqQyxTQUFPLE1BQU0sSUFBTixDQTNEMEI7QUE0RGpDLGNBQVksTUFBTSxTQUFOLENBNURxQjtBQTZEakMsU0FBTyxNQUFNLElBQU4sQ0E3RDBCOztBQWdFakMsT0FBSSxJQUFJLElBQUksVUFBSixFQUFnQixJQUFJLFNBQUosRUFBZSxHQUF2QyxFQUEyQzs7QUFFekMsWUFBUSxPQUFPLENBQVAsQ0FBUixDQUZ5Qzs7QUFJekMsWUFBTyxNQUFNLElBQU47O0FBRUwsV0FBSyxJQUFMO0FBQ0UsY0FBTSxNQUFNLEtBQU4sQ0FEUjtBQUVFLGlCQUFTLE1BQU0sTUFBTixDQUZYO0FBR0Usd0JBQWdCLE1BQU0sYUFBTixDQUhsQjtBQUlFLHlCQUFpQixNQUFNLGNBQU4sQ0FKbkI7O0FBTUUsb0JBQVksTUFBTSxLQUFOLEdBQWMsS0FBZCxDQU5kO0FBT0UsZ0JBQVEsU0FBUixDQVBGO0FBUUUsZ0JBQVEsTUFBTSxLQUFOOzs7QUFSVjs7QUFGRixXQWVPLElBQUw7QUFDRSxpQkFBUyxNQUFNLE1BQU4sQ0FEWDtBQUVFLG9CQUFZLE1BQU0sS0FBTixDQUZkO0FBR0Usc0JBQWMsTUFBTSxLQUFOLENBSGhCO0FBSUUsdUJBQWUsTUFBTSxZQUFOLENBSmpCO0FBS0Usc0JBQWMsTUFBTSxXQUFOLENBTGhCO0FBTUUsdUJBQWUsTUFBTSxZQUFOLENBTmpCO0FBT0UsNEJBQW9CLE1BQU0saUJBQU4sQ0FQdEI7QUFRRSxpQkFBUyxNQUFNLE1BQU4sQ0FSWDs7QUFVRSxvQkFBWSxNQUFNLEtBQU4sR0FBYyxLQUFkLENBVmQ7QUFXRSxnQkFBUSxTQUFSLENBWEY7QUFZRSxnQkFBUSxNQUFNLEtBQU47Ozs7QUFaVjs7QUFmRjs7O0FBcUNJLHVCQUFlLEtBQWYsRUFIRjtBQUlFLG9CQUFZLEtBQVosRUFKRjtBQUtFLGVBQU8sSUFBUCxDQUFZLEtBQVosRUFMRjs7Ozs7O0FBbENGOzs7Ozs7O0FBSnlDLGlCQXlEekMsR0FBZ0IsTUFBTSxLQUFOLENBekR5QjtHQUEzQztBQTJEQSxTQUFPLE1BQVA7O0FBM0hpQyxDQUE1Qjs7QUFnSVAsU0FBUyxXQUFULENBQXFCLEtBQXJCLEVBQTJCOzs7O0FBSXpCLFFBQU0sR0FBTixHQUFZLEdBQVosQ0FKeUI7QUFLekIsUUFBTSxTQUFOLEdBQWtCLFNBQWxCLENBTHlCO0FBTXpCLFFBQU0sV0FBTixHQUFvQixXQUFwQixDQU55Qjs7QUFRekIsUUFBTSxXQUFOLEdBQW9CLFdBQXBCLENBUnlCO0FBU3pCLFFBQU0sWUFBTixHQUFxQixZQUFyQixDQVR5QjtBQVV6QixRQUFNLGlCQUFOLEdBQTBCLGlCQUExQixDQVZ5Qjs7QUFZekIsUUFBTSxNQUFOLEdBQWUsTUFBZixDQVp5QjtBQWF6QixRQUFNLFlBQU4sR0FBcUIsWUFBckIsQ0FieUI7QUFjekIsUUFBTSxjQUFOLEdBQXVCLGNBQXZCLENBZHlCO0FBZXpCLFFBQU0sYUFBTixHQUFzQixhQUF0QixDQWZ5Qjs7QUFrQnpCLFFBQU0sS0FBTixHQUFjLEtBQWQsQ0FsQnlCOztBQW9CekIsUUFBTSxNQUFOLEdBQWUsTUFBZixDQXBCeUI7QUFxQnpCLFFBQU0sT0FBTixHQUFnQixTQUFTLElBQVQsQ0FyQlM7O0FBd0J6QixRQUFNLEdBQU4sR0FBWSxHQUFaLENBeEJ5QjtBQXlCekIsUUFBTSxJQUFOLEdBQWEsSUFBYixDQXpCeUI7QUEwQnpCLFFBQU0sU0FBTixHQUFrQixTQUFsQixDQTFCeUI7QUEyQnpCLFFBQU0sSUFBTixHQUFhLElBQWI7O0FBM0J5QixNQTZCckIsZUFBZSxTQUFTLENBQVQsR0FBYSxLQUFiLEdBQXFCLE9BQU8sRUFBUCxHQUFZLE9BQU8sSUFBUCxHQUFjLE9BQU8sR0FBUCxHQUFhLE1BQU0sSUFBTixHQUFhLElBQTFCLENBN0J6QztBQThCekIsUUFBTSxZQUFOLEdBQXFCLE1BQU0sR0FBTixHQUFZLElBQVosR0FBbUIsR0FBbkIsR0FBeUIsU0FBekIsR0FBcUMsR0FBckMsR0FBMkMsWUFBM0MsQ0E5Qkk7QUErQnpCLFFBQU0sV0FBTixHQUFvQixDQUFDLEdBQUQsRUFBTSxJQUFOLEVBQVksU0FBWixFQUF1QixJQUF2QixDQUFwQixDQS9CeUI7O0FBa0N6QixNQUFJLFdBQVcsdUJBQVksTUFBWixDQUFYLENBbENxQjs7QUFvQ3pCLFFBQU0sSUFBTixHQUFhLFNBQVMsSUFBVCxDQXBDWTtBQXFDekIsUUFBTSxNQUFOLEdBQWUsU0FBUyxNQUFULENBckNVO0FBc0N6QixRQUFNLE1BQU4sR0FBZSxTQUFTLE1BQVQsQ0F0Q1U7QUF1Q3pCLFFBQU0sV0FBTixHQUFvQixTQUFTLFdBQVQsQ0F2Q0s7QUF3Q3pCLFFBQU0sWUFBTixHQUFxQixTQUFTLFlBQVQsQ0F4Q0k7QUF5Q3pCLFFBQU0sV0FBTixHQUFvQixTQUFTLFdBQVQ7Ozs7O0FBekNLLENBQTNCOztBQWlEQSxJQUFJLGdCQUFnQixDQUFoQjs7QUFFRyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsRUFBK0I7QUFDcEMsTUFBSSxRQUFRLEVBQVIsQ0FEZ0M7QUFFcEMsTUFBSSxxQkFBSixDQUZvQztBQUdwQyxNQUFJLElBQUksQ0FBSixDQUhnQzs7Ozs7O0FBSXBDLDBCQUFpQixpQ0FBakIsd0dBQXdCO1VBQWhCLHFCQUFnQjs7QUFDdEIsVUFBRyxPQUFPLE1BQU0sTUFBTixLQUFpQixXQUF4QixJQUF1QyxPQUFPLE1BQU0sT0FBTixLQUFrQixXQUF6QixFQUFxQztBQUM3RSxnQkFBUSxHQUFSLENBQVksMEJBQVosRUFENkU7QUFFN0UsaUJBRjZFO09BQS9FO0FBSUEsVUFBRyxNQUFNLElBQU4sS0FBZSxHQUFmLEVBQW1CO0FBQ3BCLHVCQUFlLE1BQU0sTUFBTSxPQUFOLENBQXJCLENBRG9CO0FBRXBCLFlBQUcsT0FBTyxZQUFQLEtBQXdCLFdBQXhCLEVBQW9DO0FBQ3JDLHlCQUFlLE1BQU0sTUFBTSxPQUFOLENBQU4sR0FBdUIsRUFBdkIsQ0FEc0I7U0FBdkM7QUFHQSxxQkFBYSxNQUFNLEtBQU4sQ0FBYixHQUE0QixLQUE1QixDQUxvQjtPQUF0QixNQU1NLElBQUcsTUFBTSxJQUFOLEtBQWUsR0FBZixFQUFtQjtBQUMxQix1QkFBZSxNQUFNLE1BQU0sT0FBTixDQUFyQixDQUQwQjtBQUUxQixZQUFHLE9BQU8sWUFBUCxLQUF3QixXQUF4QixFQUFvQzs7QUFFckMsbUJBRnFDO1NBQXZDO0FBSUEsWUFBSSxTQUFTLGFBQWEsTUFBTSxLQUFOLENBQXRCLENBTnNCO0FBTzFCLFlBQUksVUFBVSxLQUFWLENBUHNCO0FBUTFCLFlBQUcsT0FBTyxNQUFQLEtBQWtCLFdBQWxCLEVBQThCOztBQUUvQixpQkFBTyxNQUFNLE1BQU0sT0FBTixDQUFOLENBQXFCLE1BQU0sS0FBTixDQUE1QixDQUYrQjtBQUcvQixtQkFIK0I7U0FBakM7QUFLQSxZQUFJLGFBQVcsd0JBQW1CLElBQUksSUFBSixHQUFXLE9BQVgsRUFBOUIsQ0Fic0I7QUFjMUIsZUFBTyxVQUFQLEdBQW9CLEVBQXBCLENBZDBCO0FBZTFCLGVBQU8sR0FBUCxHQUFhLFFBQVEsRUFBUixDQWZhO0FBZ0IxQixnQkFBUSxVQUFSLEdBQXFCLEVBQXJCLENBaEIwQjtBQWlCMUIsZ0JBQVEsRUFBUixHQUFhLE9BQU8sRUFBUCxDQWpCYTtBQWtCMUIsZUFBTyxNQUFNLE1BQU0sT0FBTixDQUFOLENBQXFCLE1BQU0sS0FBTixDQUE1QixDQWxCMEI7T0FBdEI7S0FYUjs7Ozs7Ozs7Ozs7Ozs7R0FKb0M7O0FBb0NwQyxTQUFPLElBQVAsQ0FBWSxLQUFaLEVBQW1CLE9BQW5CLENBQTJCLFVBQVMsR0FBVCxFQUFhO0FBQ3RDLFdBQU8sTUFBTSxHQUFOLENBQVAsQ0FEc0M7R0FBYixDQUEzQjs7QUFwQ29DLENBQS9COzs7QUE0Q0EsU0FBUyxZQUFULENBQXNCLE1BQXRCLEVBQTZCO0FBQ2xDLE1BQUksVUFBVSxFQUFWLENBRDhCO0FBRWxDLE1BQUksWUFBWSxFQUFaLENBRjhCO0FBR2xDLE1BQUksU0FBUyxFQUFULENBSDhCOzs7Ozs7QUFJbEMsMEJBQWlCLGlDQUFqQix3R0FBd0I7VUFBaEIscUJBQWdCOztBQUN0QixVQUFHLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxLQUFOLEtBQWdCLEVBQWhCLEVBQW1CO0FBQzFDLFlBQUcsTUFBTSxLQUFOLEtBQWdCLENBQWhCLEVBQWtCO0FBQ25CLGNBQUcsT0FBTyxRQUFRLE1BQU0sT0FBTixDQUFmLEtBQWtDLFdBQWxDLEVBQThDO0FBQy9DLHFCQUQrQztXQUFqRCxNQUVNLElBQUcsUUFBUSxNQUFNLE9BQU4sQ0FBUixLQUEyQixNQUFNLEtBQU4sRUFBWTtBQUM5QyxtQkFBTyxVQUFVLE1BQU0sS0FBTixDQUFqQixDQUQ4QztBQUU5QyxxQkFGOEM7V0FBMUM7QUFJTixvQkFBVSxNQUFNLEtBQU4sQ0FBVixHQUF5QixLQUF6QixDQVBtQjtBQVFuQixpQkFBTyxRQUFRLE1BQU0sT0FBTixDQUFmLENBUm1CO1NBQXJCLE1BU00sSUFBRyxNQUFNLEtBQU4sS0FBZ0IsR0FBaEIsRUFBb0I7QUFDM0Isa0JBQVEsTUFBTSxPQUFOLENBQVIsR0FBeUIsTUFBTSxLQUFOLENBREU7QUFFM0Isb0JBQVUsTUFBTSxLQUFOLENBQVYsR0FBeUIsS0FBekIsQ0FGMkI7U0FBdkI7T0FWUixNQWNLO0FBQ0gsZUFBTyxJQUFQLENBQVksS0FBWixFQURHO09BZEw7S0FERjs7Ozs7Ozs7Ozs7Ozs7R0FKa0M7O0FBdUJsQyxVQUFRLEdBQVIsQ0FBWSxPQUFaLEVBdkJrQztBQXdCbEMsU0FBTyxJQUFQLENBQVksU0FBWixFQUF1QixPQUF2QixDQUErQixVQUFTLEdBQVQsRUFBYTtBQUMxQyxRQUFJLGVBQWUsVUFBVSxHQUFWLENBQWYsQ0FEc0M7QUFFMUMsWUFBUSxHQUFSLENBQVksWUFBWixFQUYwQztBQUcxQyxXQUFPLElBQVAsQ0FBWSxZQUFaLEVBSDBDO0dBQWIsQ0FBL0IsQ0F4QmtDO0FBNkJsQyxTQUFPLE1BQVAsQ0E3QmtDO0NBQTdCOzs7Ozs7OztRQzNWUztRQThCQTs7QUF2Q2hCOztBQUNBOztBQUtBLElBQU0sUUFBUSw2QkFBUjtBQUNOLElBQUksWUFBWSxDQUFaOztBQUVHLFNBQVMsVUFBVCxHQU9OO01BTkMsaUVBS0ksa0JBQ0w7O0FBQ0MsTUFBSSxhQUFXLG9CQUFlLElBQUksSUFBSixHQUFXLE9BQVgsRUFBMUIsQ0FETDt1QkFPSyxTQUpGLEtBSEg7TUFHRyxzQ0FBTyxvQkFIVjs4QkFPSyxTQUhGLGFBSkg7TUFJRyxxREFBZSwyQkFKbEI7OEJBT0ssU0FGRixZQUxIO01BS0csb0RBQWMsMkJBTGpCOzBCQU9LLFNBREYsUUFOSDtNQU1HLDRDQUFVLDJCQU5iOzs7QUFTQyxRQUFNLFFBQU4sQ0FBZTtBQUNiLG1DQURhO0FBRWIsYUFBUztBQUNQLFlBRE87QUFFUCxnQkFGTztBQUdQLGdDQUhPO0FBSVAsOEJBSk87QUFLUCxzQkFMTztBQU1QLFlBQU0sS0FBTjtLQU5GO0dBRkYsRUFURDtBQW9CQyxTQUFPLEVBQVAsQ0FwQkQ7Q0FQTTs7QUE4QkEsU0FBUyxhQUFULENBQXVCLE9BQXZCLEVBQTBEO29DQUFmOztHQUFlOztBQUMvRCxRQUFNLFFBQU4sQ0FBZTtBQUNiLHVDQURhO0FBRWIsYUFBUztBQUNQLHNCQURPO0FBRVAsb0NBRk87S0FBVDtHQUZGLEVBRCtEO0NBQTFEOzs7Ozs7Ozs7O0FDdkNQOztBQU1BOztBQUlBOztBQVNBOztBQU9BOztBQUtBOztBQUlBOztBQUlBOztBQUlBOztBQUlBOztBQU1BOztBQVVBOztBQUtBLElBQU0sa0JBQWtCLFNBQWxCLGVBQWtCLEdBQVU7QUFDaEMsNkJBRGdDO0NBQVY7O0FBSXhCLElBQU0sUUFBUTtBQUNaLFdBQVMsT0FBVDs7O0FBR0Esa0NBSlk7OztBQU9aLGtCQVBZOzs7QUFVWixrQ0FWWTtBQVdaLDhDQVhZO0FBWVosOENBWlk7OztBQWVaLHlDQWZZO0FBZ0JaLHlDQWhCWTtBQWlCWiwyQ0FqQlk7QUFrQlosNkNBbEJZO0FBbUJaLCtDQW5CWTtBQW9CWixpREFwQlk7QUFxQlosbURBckJZOzs7QUF3QlosOENBeEJZO0FBeUJaLDBDQXpCWTtBQTBCWiw4Q0ExQlk7OztBQTZCWiwyQ0E3Qlk7OztBQWdDWiw4QkFoQ1k7QUFpQ1osNEJBakNZO0FBa0NaLDhCQWxDWTtBQW1DWiw0QkFuQ1k7QUFvQ1osMEJBcENZO0FBcUNaLGdDQXJDWTs7O0FBd0NaLGlDQXhDWTtBQXlDWiwyQkF6Q1k7QUEwQ1oscUNBMUNZO0FBMkNaLDJDQTNDWTs7O0FBOENaLDhCQTlDWTtBQStDWixvQ0EvQ1k7OztBQWtEWixvQ0FsRFk7O0FBb0RaLHdDQXBEWTtBQXFEWix3REFyRFk7O0FBdURaLE9BQUssYUFBUyxFQUFULEVBQVk7QUFDZixRQUFHLE9BQU8sV0FBUCxFQUFtQjtBQUNwQixjQUFRLEdBQVIsaVBBRG9CO0tBQXRCO0dBREc7Q0F2REQ7Ozs7QUEyRU4sT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLFVBQTdCLEVBQXlDLEVBQUMsT0FBTyxJQUFQLEVBQTFDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLFNBQTdCLEVBQXdDLEVBQUMsT0FBTyxJQUFQLEVBQXpDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGVBQTdCLEVBQThDLEVBQUMsT0FBTyxJQUFQLEVBQS9DO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGdCQUE3QixFQUErQyxFQUFDLE9BQU8sSUFBUCxFQUFoRDtBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixnQkFBN0IsRUFBK0MsRUFBQyxPQUFPLElBQVAsRUFBaEQ7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsS0FBdEIsRUFBNkIsa0JBQTdCLEVBQWlELEVBQUMsT0FBTyxJQUFQLEVBQWxEO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLFlBQTdCLEVBQTJDLEVBQUMsT0FBTyxJQUFQLEVBQTVDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGtCQUE3QixFQUFpRCxFQUFDLE9BQU8sSUFBUCxFQUFsRDtBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixlQUE3QixFQUE4QyxFQUFDLE9BQU8sR0FBUCxFQUEvQztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixlQUE3QixFQUE4QyxFQUFDLE9BQU8sR0FBUCxFQUEvQztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixhQUE3QixFQUE0QyxFQUFDLE9BQU8sR0FBUCxFQUE3QztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixjQUE3QixFQUE2QyxFQUFDLE9BQU8sR0FBUCxFQUE5QztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixLQUE3QixFQUFvQyxFQUFDLE9BQU8sR0FBUCxFQUFyQztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixjQUE3QixFQUE2QyxFQUFDLE9BQU8sR0FBUCxFQUE5QztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixPQUE3QixFQUFzQyxFQUFDLE9BQU8sR0FBUCxFQUF2QztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixVQUE3QixFQUF5QyxFQUFDLE9BQU8sR0FBUCxFQUExQztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixNQUE3QixFQUFxQyxFQUFDLE9BQU8sR0FBUCxFQUF0QztBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixnQkFBN0IsRUFBK0MsRUFBQyxPQUFPLEdBQVAsRUFBaEQ7QUFDQSxPQUFPLGNBQVAsQ0FBc0IsS0FBdEIsRUFBNkIsY0FBN0IsRUFBNkMsRUFBQyxPQUFPLEdBQVAsRUFBOUM7O0FBR0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLE9BQTdCLEVBQXNDLEVBQUMsT0FBTyxJQUFQLEVBQXZDO0FBQ0EsT0FBTyxjQUFQLENBQXNCLEtBQXRCLEVBQTZCLGdCQUE3QixFQUErQyxFQUFDLE9BQU8sSUFBUCxFQUFoRDtBQUNBLE9BQU8sY0FBUCxDQUFzQixLQUF0QixFQUE2QixjQUE3QixFQUE2QyxFQUFDLE9BQU8sSUFBUCxFQUE5Qzs7a0JBRWU7OztBQUliOzs7O0FBR0E7Ozs7QUFHQTtRQUNBO1FBQ0E7Ozs7QUFHQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7OztBQUdBO1FBQ0E7UUFDQTs7OztBQUdBOzs7O0FBR0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOzs7O0FBR0E7UUFDQTtRQUNBO1FBQ0E7Ozs7QUFHQTtRQUNBOzs7O0FBR0E7Ozs7O0FBSUE7UUFDQTs7Ozs7Ozs7Ozs7QUNuT0Y7O0FBQ0E7Ozs7QUE2QkEsSUFBTSxlQUFlO0FBQ25CLFlBQVUsRUFBVjtDQURJOztBQUtOLFNBQVMsTUFBVCxHQUE2QztNQUE3Qiw4REFBUSw0QkFBcUI7TUFBUCxzQkFBTzs7O0FBRTNDLE1BQ0UsY0FERjtNQUNTLGdCQURUO01BRUUsYUFGRjtNQUVRLGVBRlI7TUFHRSxtQkFIRixDQUYyQzs7QUFPM0MsVUFBTyxPQUFPLElBQVA7O0FBRUwsbUNBRkY7QUFHRSxvQ0FIRjtBQUlFLG1DQUpGO0FBS0UseUNBTEY7QUFNRTtBQUNFLDJCQUFZLE1BQVosQ0FERjtBQUVFLFlBQU0sUUFBTixDQUFlLE9BQU8sT0FBUCxDQUFlLEVBQWYsQ0FBZixHQUFvQyxPQUFPLE9BQVAsQ0FGdEM7QUFHRSxZQUhGOztBQU5GLGlDQVlFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsZUFBUyxPQUFPLE9BQVAsQ0FBZSxPQUFmLENBRlg7QUFHRSxhQUFPLE1BQU0sUUFBTixDQUFlLE1BQWYsQ0FBUCxDQUhGO0FBSUUsVUFBRyxJQUFILEVBQVE7QUFDTixZQUFJLFdBQVcsT0FBTyxPQUFQLENBQWUsU0FBZixDQURUO0FBRU4saUJBQVMsT0FBVCxDQUFpQixVQUFTLE9BQVQsRUFBaUI7QUFDaEMsY0FBSSxRQUFRLE1BQU0sUUFBTixDQUFlLE9BQWYsQ0FBUixDQUQ0QjtBQUVoQyxjQUFHLEtBQUgsRUFBUzs7OztBQUNQLG1CQUFLLFFBQUwsQ0FBYyxJQUFkLENBQW1CLE9BQW5CO0FBQ0Esb0JBQU0sTUFBTixHQUFlLE1BQWY7QUFDQSxrQkFBSSxlQUFlLEVBQWY7QUFDSixvQkFBTSxPQUFOLENBQWMsT0FBZCxDQUFzQixVQUFTLE1BQVQsRUFBZ0I7QUFDcEMsb0JBQUksT0FBTyxNQUFNLFFBQU4sQ0FBZSxNQUFmLENBQVAsQ0FEZ0M7QUFFcEMscUJBQUssT0FBTCxDQUFhLElBQWIsQ0FBa0IsTUFBbEIsRUFGb0M7QUFHcEMsNkJBQWEsSUFBYix3Q0FBcUIsS0FBSyxZQUFMLENBQXJCLEVBSG9DO2VBQWhCLENBQXRCO0FBS0EsMkJBQWEsT0FBYixDQUFxQixVQUFTLE9BQVQsRUFBaUI7QUFDcEMsd0JBQVEsTUFBTSxRQUFOLENBQWUsT0FBZixDQUFSLENBRG9DO0FBRXBDLHNCQUFNLE1BQU4sR0FBZSxNQUFmLENBRm9DO2VBQWpCLENBQXJCO0FBSUEsd0NBQUssV0FBTCxFQUFpQixJQUFqQiwwQkFBeUIsWUFBekI7aUJBYk87V0FBVCxNQWNLO0FBQ0gsb0JBQVEsSUFBUix1QkFBaUMsT0FBakMsRUFERztXQWRMO1NBRmUsQ0FBakIsQ0FGTTtPQUFSLE1Bc0JLO0FBQ0gsZ0JBQVEsSUFBUiw0QkFBc0MsTUFBdEMsRUFERztPQXRCTDtBQXlCQSxZQTdCRjs7QUFaRixnQ0E0Q0U7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxVQUFJLFVBQVUsT0FBTyxPQUFQLENBQWUsUUFBZixDQUZoQjtBQUdFLFVBQUksUUFBUSxNQUFNLFFBQU4sQ0FBZSxPQUFmLENBQVIsQ0FITjtBQUlFLFVBQUcsS0FBSCxFQUFTOztBQUVQLFlBQUksVUFBVSxPQUFPLE9BQVAsQ0FBZSxRQUFmLENBRlA7QUFHUCxnQkFBUSxPQUFSLENBQWdCLFVBQVMsRUFBVCxFQUFZO0FBQzFCLGNBQUksT0FBTyxNQUFNLFFBQU4sQ0FBZSxFQUFmLENBQVAsQ0FEc0I7QUFFMUIsY0FBRyxJQUFILEVBQVE7QUFDTixrQkFBTSxPQUFOLENBQWMsSUFBZCxDQUFtQixFQUFuQixFQURNO0FBRU4saUJBQUssT0FBTCxHQUFlLE9BQWYsQ0FGTTtBQUdOLGlCQUFLLFlBQUwsQ0FBa0IsT0FBbEIsQ0FBMEIsVUFBUyxFQUFULEVBQVk7QUFDcEMsc0JBQVEsTUFBTSxRQUFOLENBQWUsRUFBZixDQUFSLENBRG9DO0FBRXBDLG9CQUFNLE9BQU4sR0FBZ0IsT0FBaEI7O0FBRm9DLGFBQVosQ0FBMUIsQ0FITTtXQUFSLE1BUUs7QUFDSCxzQkFBUSxJQUFSLHNCQUFnQyxFQUFoQyxFQURHO2FBUkw7U0FGYyxDQUFoQixDQUhPO09BQVQsTUFpQks7QUFDSCxnQkFBUSxJQUFSLDZCQUF1QyxPQUF2QyxFQURHO09BakJMO0FBb0JBLFlBeEJGOztBQTVDRixzQ0F1RUU7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxVQUFJLFNBQVMsT0FBTyxPQUFQLENBQWUsT0FBZixDQUZmO0FBR0UsVUFBSSxPQUFPLE1BQU0sUUFBTixDQUFlLE1BQWYsQ0FBUCxDQUhOO0FBSUUsVUFBRyxJQUFILEVBQVE7O0FBRU4sWUFBSSxlQUFlLE9BQU8sT0FBUCxDQUFlLGNBQWYsQ0FGYjtBQUdOLHFCQUFhLE9BQWIsQ0FBcUIsVUFBUyxFQUFULEVBQVk7QUFDL0IsY0FBSSxZQUFZLE1BQU0sUUFBTixDQUFlLEVBQWYsQ0FBWixDQUQyQjtBQUUvQixjQUFHLFNBQUgsRUFBYTtBQUNYLGlCQUFLLFlBQUwsQ0FBa0IsSUFBbEIsQ0FBdUIsRUFBdkIsRUFEVztBQUVYLHNCQUFVLE1BQVYsR0FBbUIsTUFBbkIsQ0FGVztXQUFiLE1BR0s7QUFDSCxvQkFBUSxJQUFSLGtDQUE0QyxFQUE1QyxFQURHO1dBSEw7U0FGbUIsQ0FBckIsQ0FITTtPQUFSLE1BWUs7QUFDSCxnQkFBUSxJQUFSLDRCQUFzQyxNQUF0QyxFQURHO09BWkw7QUFlQSxZQW5CRjs7QUF2RUYsd0NBNkZFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsZ0JBQVUsT0FBTyxPQUFQLENBQWUsT0FBZixDQUZaO0FBR0UsY0FBUSxNQUFNLFFBQU4sQ0FBZSxPQUFmLENBQVIsQ0FIRjtBQUlFLFVBQUcsS0FBSCxFQUFTOzhCQUtILE9BQU8sT0FBUCxDQUxHO29EQUVMLE1BRks7QUFFRSxjQUFNLEtBQU4seUNBQWMsTUFBTSxLQUFOLHlCQUZoQjttREFHTCxNQUhLO0FBR0UsY0FBTSxLQUFOLHdDQUFjLE1BQU0sS0FBTix3QkFIaEI7b0RBSUwsTUFKSztBQUlFLGNBQU0sS0FBTix5Q0FBYyxNQUFNLEtBQU4seUJBSmhCO09BQVQsTUFNSztBQUNILGdCQUFRLElBQVIsa0NBQTRDLE9BQTVDLEVBREc7T0FOTDtBQVNBLFVBQUcsT0FBTyxPQUFQLENBQWUsTUFBZixLQUEwQixLQUExQixFQUFnQztBQUNqQyxlQUFPLE1BQU0sUUFBTixDQUFlLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBdEIsQ0FEaUM7QUFFakMsYUFBSyxhQUFMLENBQW1CLElBQW5CLENBQXdCLE9BQXhCLEVBRmlDO09BQW5DO0FBSUEsWUFqQkY7O0FBN0ZGLHVDQWlIRTtBQUNFLDJCQUFZLE1BQVosQ0FERjtBQUVFLFVBQUksT0FBTyxNQUFNLFFBQU4sQ0FBZSxPQUFPLE9BQVAsQ0FBZSxFQUFmLENBQXRCLENBRk47NkJBUU0sT0FBTyxPQUFQLENBUk47bURBS0ksTUFMSjtBQUtXLFdBQUssS0FBTCx5Q0FBYSxLQUFLLEtBQUwseUJBTHhCO2tEQU1JLElBTko7QUFNUyxXQUFLLEdBQUwsd0NBQVcsS0FBSyxHQUFMLHdCQU5wQjttREFPSSxjQVBKO0FBT21CLFdBQUssYUFBTCx5Q0FBcUIsS0FBSyxhQUFMLHlCQVB4Qzs7QUFTRSxZQVRGOztBQWpIRixrQ0E2SEU7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxhQUFPLE1BQU0sUUFBTixDQUFlLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBdEIsQ0FGRjs7Ozs7Ozs2QkFVTSxPQUFPLE9BQVAsQ0FWTjtBQUlzQixXQUFLLGdCQUFMLG9CQUFsQixpQkFKSjtBQUtnQixXQUFLLFVBQUwsb0JBQVosV0FMSjtBQU1tQixXQUFLLGFBQUwsb0JBQWYsY0FOSjtBQU9pQixXQUFLLFdBQUwsb0JBQWIsWUFQSjtBQVFtQixXQUFLLGFBQUwsb0JBQWYsY0FSSjtBQVNxQixXQUFLLGVBQUwsb0JBQWpCLGdCQVRKO0FBZ0JFLFdBQUssVUFBTCxDQUFnQixPQUFoQixDQUF3QixVQUFTLEtBQVQsRUFBZTs7QUFFckMsY0FBTSxRQUFOLENBQWUsTUFBTSxFQUFOLENBQWYsR0FBMkIsS0FBM0IsQ0FGcUM7T0FBZixDQUF4QixDQWhCRjtBQW9CRSxZQXBCRjs7QUE3SEYscUNBb0pFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxRQUFOLENBQWUsT0FBTyxPQUFQLENBQWUsT0FBZixDQUFmLENBQXVDLFVBQXZDLEdBQW9ELE9BQU8sT0FBUCxDQUFlLFVBQWYsQ0FGdEQ7QUFHRSxZQUhGOztBQXBKRiwwQ0EwSkU7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxZQUFNLFFBQU4sQ0FBZSxPQUFPLE9BQVAsQ0FBZSxPQUFmLENBQWYsQ0FBdUMsYUFBdkMsR0FBdUQsT0FBTyxPQUFQLENBQWUsU0FBZixDQUZ6RDtBQUdFLFlBSEY7O0FBMUpGOztHQVAyQztBQXlLM0MsU0FBTyxLQUFQLENBeksyQztDQUE3Qzs7O0FBNktBLFNBQVMsU0FBVCxHQUErQztNQUE1Qiw4REFBUSxFQUFDLE9BQU8sRUFBUCxrQkFBbUI7TUFBUCxzQkFBTzs7QUFDN0MsVUFBTyxPQUFPLElBQVA7O0FBRUw7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxZQUFNLEtBQU4sQ0FBWSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQVosR0FBcUM7QUFDbkMsZ0JBQVEsT0FBTyxPQUFQLENBQWUsTUFBZjtBQUNSLG9CQUFZLE9BQU8sT0FBUCxDQUFlLFVBQWY7QUFDWixrQkFBVSxPQUFPLE9BQVAsQ0FBZSxRQUFmO0FBQ1YsaUJBQVMsS0FBVDtPQUpGLENBRkY7QUFRRSxZQVJGOztBQUZGLHNDQWFFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxLQUFOLENBQVksT0FBTyxPQUFQLENBQWUsTUFBZixDQUFaLENBQW1DLFNBQW5DLEdBQStDLE9BQU8sT0FBUCxDQUFlLFNBQWYsQ0FGakQ7QUFHRSxZQUFNLEtBQU4sQ0FBWSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQVosQ0FBbUMsT0FBbkMsR0FBNkMsSUFBN0MsQ0FIRjtBQUlFLFlBSkY7O0FBYkYscUNBb0JFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsYUFBTyxNQUFNLEtBQU4sQ0FBWSxPQUFPLE9BQVAsQ0FBZSxNQUFmLENBQVosQ0FBbUMsU0FBbkMsQ0FGVDtBQUdFLFlBQU0sS0FBTixDQUFZLE9BQU8sT0FBUCxDQUFlLE1BQWYsQ0FBWixDQUFtQyxPQUFuQyxHQUE2QyxLQUE3QyxDQUhGO0FBSUUsWUFKRjs7QUFwQkYsb0NBMkJFO0FBQ0UsMkJBQVksTUFBWixDQURGO0FBRUUsWUFBTSxLQUFOLENBQVksT0FBTyxPQUFQLENBQWUsTUFBZixDQUFaLENBQW1DLFFBQW5DLEdBQThDLE9BQU8sT0FBUCxDQUFlLFFBQWYsQ0FGaEQ7QUFHRSxZQUhGOztBQTNCRjs7R0FENkM7QUFxQzdDLFNBQU8sS0FBUCxDQXJDNkM7Q0FBL0M7O0FBeUNBLFNBQVMsR0FBVCxHQUFnQztNQUFuQiw4REFBUSxrQkFBVztNQUFQLHNCQUFPOztBQUM5QixTQUFPLEtBQVAsQ0FEOEI7Q0FBaEM7O0FBS0EsU0FBUyxXQUFULEdBQXdDO01BQW5CLDhEQUFRLGtCQUFXO01BQVAsc0JBQU87O0FBQ3RDLFVBQU8sT0FBTyxJQUFQO0FBQ0w7QUFDRSwyQkFBWSxNQUFaLENBREY7QUFFRSxZQUFNLE9BQU8sT0FBUCxDQUFlLEVBQWYsQ0FBTixHQUEyQixPQUFPLE9BQVAsQ0FBZSxVQUFmOztBQUY3Qjs7QUFERixvQ0FPRTtBQUNFLDJCQUFZLE1BQVosQ0FERjtBQUVFLGNBQVEsR0FBUixDQUFZLE9BQU8sT0FBUCxDQUFaLENBRkY7QUFHRSxZQUhGOztBQVBGO0dBRHNDO0FBZXRDLFNBQU8sS0FBUCxDQWZzQztDQUF4Qzs7QUFtQkEsSUFBTSxlQUFlLDRCQUFnQjtBQUNuQyxVQURtQztBQUVuQyxnQkFGbUM7QUFHbkMsc0JBSG1DO0FBSW5DLDBCQUptQztDQUFoQixDQUFmOztrQkFRUzs7Ozs7Ozs7Ozs7UUMxT0M7UUErQkE7UUFvQkE7O0FBbEdoQjs7Ozs7O0lBSU07QUFFSixXQUZJLE1BRUosQ0FBWSxVQUFaLEVBQXdCLEtBQXhCLEVBQThCOzBCQUYxQixRQUUwQjs7QUFDNUIsU0FBSyxLQUFMLEdBQWEsS0FBYixDQUQ0QjtBQUU1QixTQUFLLFVBQUwsR0FBa0IsVUFBbEIsQ0FGNEI7QUFHNUIsUUFBRyxLQUFLLFVBQUwsS0FBb0IsQ0FBQyxDQUFELEVBQUc7O0FBRXhCLFdBQUssTUFBTCxHQUFjLG9CQUFRLGdCQUFSLEVBQWQsQ0FGd0I7QUFHeEIsV0FBSyxNQUFMLENBQVksSUFBWixHQUFtQixNQUFuQixDQUh3QjtBQUl4QixXQUFLLE1BQUwsQ0FBWSxTQUFaLENBQXNCLEtBQXRCLEdBQThCLE1BQU0sU0FBTixDQUpOO0tBQTFCLE1BS0s7QUFDSCxXQUFLLE1BQUwsR0FBYyxvQkFBUSxrQkFBUixFQUFkLENBREc7QUFFSCxXQUFLLE1BQUwsQ0FBWSxNQUFaLEdBQXFCLFdBQVcsQ0FBWDs7QUFGbEIsS0FMTDtBQVVBLFNBQUssTUFBTCxHQUFjLG9CQUFRLFVBQVIsRUFBZCxDQWI0QjtBQWM1QixTQUFLLE1BQUwsR0FBYyxNQUFNLEtBQU4sR0FBYyxHQUFkLENBZGM7QUFlNUIsU0FBSyxNQUFMLENBQVksSUFBWixDQUFpQixLQUFqQixHQUF5QixLQUFLLE1BQUwsQ0FmRztBQWdCNUIsU0FBSyxNQUFMLENBQVksT0FBWixDQUFvQixLQUFLLE1BQUwsQ0FBcEI7O0FBaEI0QixHQUE5Qjs7ZUFGSTs7MEJBc0JFLE1BQUs7O0FBRVQsV0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixJQUFsQixFQUZTOzs7O3lCQUtOLE1BQU0sSUFBRztBQUNaLFVBQUcsS0FBSyxVQUFMLENBQWdCLENBQWhCLElBQXFCLEtBQUssVUFBTCxDQUFnQixDQUFoQixFQUFrQjtBQUN4QyxhQUFLLE1BQUwsQ0FBWSxJQUFaLENBQWlCLE9BQU8sS0FBSyxVQUFMLENBQWdCLENBQWhCLENBQXhCLENBRHdDO0FBRXhDLGdCQUFRLEtBQUssTUFBTCxFQUFhO0FBQ25CLDJCQUFpQixLQUFLLFVBQUwsQ0FBZ0IsQ0FBaEI7QUFDakIsMkJBQWlCLEtBQUssVUFBTCxDQUFnQixDQUFoQjtTQUZuQixFQUZ3QztPQUExQyxNQU1LO0FBQ0gsYUFBSyxNQUFMLENBQVksSUFBWixDQUFpQixJQUFqQixFQURHO09BTkw7O0FBVUEsV0FBSyxNQUFMLENBQVksT0FBWixHQUFzQixFQUF0QixDQVhZOzs7O1NBM0JWOzs7QUEyQ0MsU0FBUyxPQUFULENBQWlCLFFBQWpCLEVBQTJCLFFBQTNCLEVBQW9DO0FBQ3pDLE1BQUksTUFBTSxvQkFBUSxXQUFSLENBRCtCO0FBRXpDLE1BQUksZUFBSjtNQUFZLFVBQVo7TUFBZSxhQUFmOzs7QUFGeUMsVUFLbEMsU0FBUyxlQUFUOztBQUVMLFNBQUssUUFBTDtBQUNFLGVBQVMsSUFBVCxDQUFjLHVCQUFkLENBQXNDLFNBQVMsSUFBVCxDQUFjLEtBQWQsRUFBcUIsR0FBM0QsRUFERjtBQUVFLGVBQVMsSUFBVCxDQUFjLHVCQUFkLENBQXNDLENBQXRDLEVBQXlDLE1BQU0sU0FBUyxlQUFULENBQS9DLENBRkY7QUFHRSxZQUhGOztBQUZGLFNBT08sYUFBTDtBQUNFLGVBQVMsbUJBQW1CLEdBQW5CLEVBQXdCLFNBQXhCLEVBQW1DLFNBQVMsSUFBVCxDQUFjLEtBQWQsQ0FBNUMsQ0FERjtBQUVFLGVBQVMsSUFBVCxDQUFjLG1CQUFkLENBQWtDLE1BQWxDLEVBQTBDLEdBQTFDLEVBQStDLFNBQVMsZUFBVCxDQUEvQyxDQUZGO0FBR0UsWUFIRjs7QUFQRixTQVlPLE9BQUw7QUFDRSxhQUFPLFNBQVMsb0JBQVQsQ0FBOEIsTUFBOUIsQ0FEVDtBQUVFLGVBQVMsSUFBSSxZQUFKLENBQWlCLElBQWpCLENBQVQsQ0FGRjtBQUdFLFdBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxJQUFKLEVBQVUsR0FBckIsRUFBeUI7QUFDdkIsZUFBTyxDQUFQLElBQVksU0FBUyxvQkFBVCxDQUE4QixDQUE5QixJQUFtQyxTQUFTLElBQVQsQ0FBYyxLQUFkLENBRHhCO09BQXpCO0FBR0EsZUFBUyxJQUFULENBQWMsbUJBQWQsQ0FBa0MsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0MsU0FBUyxlQUFULENBQS9DLENBTkY7QUFPRSxZQVBGOztBQVpGO0dBTHlDO0NBQXBDOztBQStCQSxTQUFTLGtCQUFULENBQTRCLFFBQTVCLEVBQXNDLElBQXRDLEVBQTRDLFFBQTVDLEVBQXNEO0FBQzNELE1BQUksVUFBSjtNQUFPLGNBQVA7TUFBYyxnQkFBZDtNQUNFLFNBQVMsSUFBSSxZQUFKLENBQWlCLFFBQWpCLENBQVQsQ0FGeUQ7O0FBSTNELE9BQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxRQUFKLEVBQWMsR0FBekIsRUFBNkI7QUFDM0IsY0FBVSxJQUFJLFFBQUosQ0FEaUI7QUFFM0IsUUFBRyxTQUFTLFFBQVQsRUFBa0I7QUFDbkIsY0FBUSxLQUFLLEdBQUwsQ0FBUyxDQUFDLE1BQU0sT0FBTixDQUFELEdBQWtCLEdBQWxCLEdBQXdCLEtBQUssRUFBTCxDQUFqQyxHQUE0QyxRQUE1QyxDQURXO0tBQXJCLE1BRU0sSUFBRyxTQUFTLFNBQVQsRUFBbUI7QUFDMUIsY0FBUSxLQUFLLEdBQUwsQ0FBUyxVQUFVLEdBQVYsR0FBZ0IsS0FBSyxFQUFMLENBQXpCLEdBQW9DLFFBQXBDLENBRGtCO0tBQXRCO0FBR04sV0FBTyxDQUFQLElBQVksS0FBWixDQVAyQjtBQVEzQixRQUFHLE1BQU0sV0FBVyxDQUFYLEVBQWE7QUFDcEIsYUFBTyxDQUFQLElBQVksU0FBUyxRQUFULEdBQW9CLENBQXBCLEdBQXdCLENBQXhCLENBRFE7S0FBdEI7R0FSRjtBQVlBLFNBQU8sTUFBUCxDQWhCMkQ7Q0FBdEQ7O0FBb0JBLFNBQVMsWUFBVCxHQUE4QjtvQ0FBTDs7R0FBSzs7QUFDbkMsNENBQVcsc0JBQVUsU0FBckIsQ0FEbUM7Q0FBOUI7OztBQ2xHUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7QUNMQTs7OztBQUVBLElBQU0sY0FBYyxHQUFkO0FBQ04sSUFBTSxhQUFhLEdBQWI7O0lBRWU7QUFFbkIsV0FGbUIsU0FFbkIsQ0FBWSxJQUFaLEVBQWlCOzBCQUZFLFdBRUY7O0FBRUwsU0FBSyxNQUFMLEdBVU4sS0FWRixPQUZhO0FBR0UsU0FBSyxpQkFBTCxHQVNiLEtBVEYsY0FIYTtBQUlGLFNBQUssU0FBTCxHQVFULEtBUkYsVUFKYTtBQUtELFNBQUssTUFBTCxHQU9WLEtBUEYsV0FMYTtBQU1OLFNBQUssS0FBTCxHQU1MLEtBTkYsTUFOYTtBQU9MLFNBQUssTUFBTCxHQUtOLEtBTEYsT0FQYTt5QkFZWCxLQUpGLFNBUmE7QUFTTCxTQUFLLElBQUwsa0JBQU4sS0FUVztBQVVMLFNBQUssSUFBTCxrQkFBTixLQVZXOztBQWFmLFNBQUssU0FBTCxHQUFpQixLQUFLLE1BQUwsQ0FBWSxNQUFaLENBYkY7QUFjZixTQUFLLElBQUwsR0FBWSxDQUFaLENBZGU7QUFlZixTQUFLLEtBQUwsR0FBYSxDQUFiLENBZmU7QUFnQmYsU0FBSyxRQUFMLENBQWMsS0FBSyxpQkFBTCxDQUFkLENBaEJlO0dBQWpCOzs7OztlQUZtQjs7NkJBc0JWLFFBQU87QUFDZCxVQUFJLElBQUksQ0FBSixDQURVOzs7Ozs7QUFFZCw2QkFBaUIsS0FBSyxNQUFMLDBCQUFqQixvR0FBNkI7Y0FBckIsb0JBQXFCOztBQUMzQixjQUFHLE1BQU0sTUFBTixJQUFnQixNQUFoQixFQUF1QjtBQUN4QixpQkFBSyxLQUFMLEdBQWEsQ0FBYixDQUR3QjtBQUV4QixrQkFGd0I7V0FBMUI7QUFJQSxjQUwyQjtTQUE3Qjs7Ozs7Ozs7Ozs7Ozs7T0FGYzs7OztnQ0FZTDtBQUNULFVBQUksU0FBUyxFQUFUOztBQURLLFdBR0wsSUFBSSxJQUFJLEtBQUssS0FBTCxFQUFZLElBQUksS0FBSyxTQUFMLEVBQWdCLEdBQTVDLEVBQWdEO0FBQzlDLFlBQUksUUFBUSxLQUFLLE1BQUwsQ0FBWSxDQUFaLENBQVIsQ0FEMEM7QUFFOUMsWUFBRyxNQUFNLE1BQU4sR0FBZSxLQUFLLE9BQUwsRUFBYTs7OztBQUk3QixjQUFHLE1BQU0sSUFBTixLQUFlLE9BQWYsRUFBdUI7O1dBQTFCLE1BRUs7QUFDSCxxQkFBTyxJQUFQLENBQVksS0FBWixFQURHO2FBRkw7QUFLQSxlQUFLLEtBQUwsR0FUNkI7U0FBL0IsTUFVSztBQUNILGdCQURHO1NBVkw7T0FGRjtBQWdCQSxhQUFPLE1BQVAsQ0FuQlM7Ozs7MkJBdUJKLFVBQVM7QUFDZCxVQUFJLENBQUosRUFDRSxLQURGLEVBRUUsU0FGRixFQUdFLEtBSEYsRUFJRSxNQUpGLEVBS0UsVUFMRixDQURjOztBQVFkLFdBQUssT0FBTCxHQUFlLFdBQVcsV0FBWCxDQVJEO0FBU2QsZUFBUyxLQUFLLFNBQUwsRUFBVCxDQVRjO0FBVWQsa0JBQVksT0FBTyxNQUFQLENBVkU7O0FBWWQsV0FBSSxJQUFJLENBQUosRUFBTyxJQUFJLFNBQUosRUFBZSxHQUExQixFQUE4QjtBQUM1QixnQkFBUSxPQUFPLENBQVAsQ0FBUixDQUQ0QjtBQUU1QixnQkFBUSxLQUFLLE1BQUwsQ0FBWSxNQUFNLE9BQU4sQ0FBcEIsQ0FGNEI7QUFHNUIscUJBQWEsTUFBTSxVQUFOOzs7Ozs7QUFIZSxZQVN6QixLQUFLLEtBQUwsQ0FBVyxNQUFNLE1BQU4sQ0FBWCxDQUF5QixJQUF6QixLQUFrQyxJQUFsQyxJQUEwQyxNQUFNLElBQU4sS0FBZSxJQUFmLElBQXVCLE1BQU0sSUFBTixLQUFlLElBQWYsRUFBb0I7QUFDdEYsbUJBRHNGO1NBQXhGOztBQUlBLFlBQUcsQ0FBQyxNQUFNLElBQU4sS0FBZSxHQUFmLElBQXNCLE1BQU0sSUFBTixLQUFlLEdBQWYsQ0FBdkIsSUFBOEMsT0FBTyxNQUFNLFVBQU4sS0FBcUIsV0FBNUIsRUFBd0M7O0FBRXZGLGtCQUFRLElBQVIsQ0FBYSxlQUFiLEVBQThCLEtBQTlCLEVBRnVGO0FBR3ZGLG1CQUh1RjtTQUF6Rjs7Ozs7OztBQWI0QixZQXdCNUIsQ0FBSyxJQUFMLEdBQWEsS0FBSyxTQUFMLEdBQWlCLE1BQU0sTUFBTixHQUFlLEtBQUssaUJBQUwsQ0F4QmpCOztBQTBCNUIsWUFBRyxNQUFNLElBQU4sS0FBZSxPQUFmLEVBQXVCOztTQUExQixNQUVLO0FBQ0gsZ0JBQUksVUFBVSxNQUFNLE9BQU4sQ0FEWDtBQUVILGdCQUFJLE9BQU8sS0FBSyxJQUFMLEdBQVksV0FBWjs7QUFGUjs7Ozs7QUFJSCxvQ0FBa0IsTUFBTSxhQUFOLDJCQUFsQix3R0FBc0M7b0JBQTlCLHNCQUE4Qjs7QUFDcEMsb0JBQUksT0FBTyxrQ0FBa0IsTUFBbEIsQ0FBUCxDQURnQztBQUVwQyxvQkFBRyxNQUFNLElBQU4sS0FBZSxHQUFmLElBQXNCLE1BQU0sSUFBTixLQUFlLEdBQWYsSUFBc0IsTUFBTSxJQUFOLEtBQWUsR0FBZixFQUFtQjs7QUFFaEUsdUJBQUssSUFBTCxDQUFVLENBQUMsTUFBTSxJQUFOLEdBQWEsT0FBYixFQUFzQixNQUFNLEtBQU4sRUFBYSxNQUFNLEtBQU4sQ0FBOUMsRUFBNEQsSUFBNUQsRUFGZ0U7aUJBQWxFLE1BR00sSUFBRyxNQUFNLElBQU4sS0FBZSxHQUFmLElBQXNCLE1BQU0sSUFBTixLQUFlLEdBQWYsRUFBbUI7QUFDaEQsdUJBQUssSUFBTCxDQUFVLENBQUMsTUFBTSxJQUFOLEdBQWEsT0FBYixFQUFzQixNQUFNLEtBQU4sQ0FBakMsRUFBK0MsSUFBL0MsRUFEZ0Q7aUJBQTVDO2VBTFI7Ozs7Ozs7Ozs7Ozs7Ozs7YUFKRzs7QUFlSCxnQkFBRyxPQUFPLFVBQVAsS0FBc0IsV0FBdEIsRUFBa0M7QUFDbkMsbUJBQUssSUFBTCxJQUFhLElBQWI7QUFEbUMsd0JBRW5DLENBQVcsZ0JBQVgsQ0FBNEIsS0FBNUIsRUFBbUMsS0FBSyxJQUFMLEVBQVcsS0FBSyxNQUFMLENBQVksTUFBTSxPQUFOLENBQVosQ0FBMkIsTUFBM0IsQ0FBOUMsQ0FGbUM7YUFBckM7V0FqQkY7T0ExQkY7OztBQVpjLGFBK0RQLEtBQUssS0FBTCxJQUFjLEtBQUssU0FBTDtBQS9EUDs7O2tDQW1FRixNQUFLOzs7QUFDakIsYUFBTyxJQUFQLENBQVksS0FBSyxNQUFMLENBQVosQ0FBeUIsT0FBekIsQ0FBaUMsVUFBQyxPQUFELEVBQWE7QUFDNUMsWUFBSSxRQUFRLE1BQUssTUFBTCxDQUFZLE9BQVosQ0FBUixDQUR3QztBQUU1QyxZQUFJLGFBQWEsTUFBTSxVQUFOLENBRjJCO0FBRzVDLFlBQUcsT0FBTyxVQUFQLEtBQXNCLFdBQXRCLEVBQWtDO0FBQ25DLHFCQUFXLGFBQVgsR0FEbUM7U0FBckM7OENBSDRDOzs7OztBQU01QyxnQ0FBa0IsTUFBTSxhQUFOLDJCQUFsQix3R0FBc0M7Z0JBQTlCLHNCQUE4Qjs7QUFDcEMsZ0JBQUksT0FBTyxrQ0FBa0IsTUFBbEIsQ0FBUCxDQURnQztBQUVwQyxpQkFBSyxJQUFMLENBQVUsQ0FBQyxJQUFELEVBQU8sSUFBUCxFQUFhLElBQWIsQ0FBVixFQUE4QixNQUFLLElBQUwsR0FBWSxHQUFaLENBQTlCO0FBRm9DLGdCQUdwQyxDQUFLLElBQUwsQ0FBVSxDQUFDLElBQUQsRUFBTyxJQUFQLEVBQWEsSUFBYixDQUFWLEVBQThCLE1BQUssSUFBTCxHQUFZLEdBQVosQ0FBOUI7QUFIb0MsV0FBdEM7Ozs7Ozs7Ozs7Ozs7O1NBTjRDO09BQWIsQ0FBakMsQ0FEaUI7Ozs7U0E1SEE7Ozs7Ozs7Ozs7Ozs7O1FDaUVMO1FBeURBO1FBV0E7UUFVQTtRQUtBO1FBZ0dBO1FBNkRBOztBQXBUaEI7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7Ozs7QUFDQTs7QUFTQTs7Ozs7Ozs7QUFFQSxJQUFNLFFBQVEsNkJBQVI7QUFDTixJQUFJLFlBQVksQ0FBWjs7QUFFSixJQUFNLGNBQWM7QUFDbEIsT0FBSyxHQUFMO0FBQ0EsT0FBSyxHQUFMO0FBQ0EsUUFBTSxFQUFOO0FBQ0EsY0FBWSxDQUFaO0FBQ0EsZUFBYSxHQUFiO0FBQ0EsYUFBVyxDQUFYO0FBQ0EsZUFBYSxDQUFiO0FBQ0EsaUJBQWUsQ0FBZjtBQUNBLG9CQUFrQixLQUFsQjtBQUNBLGdCQUFjLEtBQWQ7QUFDQSxnQkFBYyxLQUFkO0FBQ0EsWUFBVSxJQUFWO0FBQ0EsUUFBTSxLQUFOO0FBQ0EsaUJBQWUsQ0FBZjtBQUNBLGdCQUFjLEtBQWQ7Q0FmSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNDTixTQUFTLE9BQVQsQ0FBaUIsTUFBakIsRUFBZ0M7QUFDOUIsTUFBSSxRQUFRLE1BQU0sUUFBTixHQUFpQixNQUFqQixDQURrQjtBQUU5QixNQUFJLE9BQU8sTUFBTSxRQUFOLENBQWUsTUFBZixDQUFQLENBRjBCO0FBRzlCLE1BQUcsT0FBTyxJQUFQLEtBQWdCLFdBQWhCLEVBQTRCO0FBQzdCLFdBQU8sS0FBUCxDQUQ2QjtHQUEvQjtBQUdBLFNBQU8sSUFBUCxDQU44QjtDQUFoQzs7QUFVTyxTQUFTLFVBQVQsR0FBOEM7TUFBMUIsaUVBQWUsa0JBQVc7O0FBQ25ELE1BQUksWUFBVSxvQkFBZSxJQUFJLElBQUosR0FBVyxPQUFYLEVBQXpCLENBRCtDO0FBRW5ELE1BQUksSUFBSSxFQUFKLENBRitDO3VCQW9CL0MsU0FoQkYsS0FKaUQ7QUFJM0MsSUFBRSxJQUFGLGtDQUFTLG9CQUprQztzQkFvQi9DLFNBZkYsSUFMaUQ7QUFLNUMsSUFBRSxHQUFGLGlDQUFRLFlBQVksR0FBWixpQkFMb0M7c0JBb0IvQyxTQWRGLElBTmlEO0FBTTVDLElBQUUsR0FBRixpQ0FBUSxZQUFZLEdBQVosaUJBTm9DO3VCQW9CL0MsU0FiRixLQVBpRDtBQU8zQyxJQUFFLElBQUYsa0NBQVMsWUFBWSxJQUFaLGtCQVBrQzs2QkFvQi9DLFNBWkYsV0FSaUQ7QUFRckMsSUFBRSxVQUFGLHdDQUFlLFlBQVksVUFBWix3QkFSc0I7OEJBb0IvQyxTQVhGLFlBVGlEO0FBU3BDLElBQUUsV0FBRix5Q0FBZ0IsWUFBWSxXQUFaLHlCQVRvQjs0QkFvQi9DLFNBVkYsVUFWaUQ7QUFVdEMsSUFBRSxTQUFGLHVDQUFjLFlBQVksU0FBWix1QkFWd0I7OEJBb0IvQyxTQVRGLFlBWGlEO0FBV3BDLElBQUUsV0FBRix5Q0FBZ0IsWUFBWSxXQUFaLHlCQVhvQjs4QkFvQi9DLFNBUkYsY0FaaUQ7QUFZbEMsSUFBRSxhQUFGLHlDQUFrQixZQUFZLGFBQVoseUJBWmdCOzhCQW9CL0MsU0FQRixpQkFiaUQ7QUFhL0IsSUFBRSxnQkFBRix5Q0FBcUIsWUFBWSxnQkFBWix5QkFiVTs4QkFvQi9DLFNBTkYsYUFkaUQ7QUFjbkMsSUFBRSxZQUFGLHlDQUFpQixZQUFZLFlBQVoseUJBZGtCOzhCQW9CL0MsU0FMRixhQWZpRDtBQWVuQyxJQUFFLFlBQUYseUNBQWlCLFlBQVksWUFBWix5QkFma0I7MkJBb0IvQyxTQUpGLFNBaEJpRDtBQWdCdkMsSUFBRSxRQUFGLHNDQUFhLFlBQVksUUFBWixzQkFoQjBCO3VCQW9CL0MsU0FIRixLQWpCaUQ7QUFpQjNDLElBQUUsSUFBRixrQ0FBUyxZQUFZLElBQVosa0JBakJrQzs4QkFvQi9DLFNBRkYsY0FsQmlEO0FBa0JsQyxJQUFFLGFBQUYseUNBQWtCLFlBQVksYUFBWix5QkFsQmdCOzhCQW9CL0MsU0FERixhQW5CaUQ7QUFtQm5DLElBQUUsWUFBRix5Q0FBaUIsWUFBWSxZQUFaLHlCQW5Ca0I7NkJBOEIvQyxTQVBGLFdBdkJpRDtNQXVCckMsa0RBQWEsQ0FDdkIsRUFBQyxJQUFJLGlDQUFKLEVBQXNCLE1BQU0sRUFBTixFQUFVLE9BQU8sQ0FBUCxFQUFVLE1BQU0sZ0JBQU0sS0FBTixFQUFhLE9BQU8sRUFBRSxHQUFGLEVBRDlDLEVBRXZCLEVBQUMsSUFBSSxpQ0FBSixFQUFzQixNQUFNLEVBQU4sRUFBVSxPQUFPLENBQVAsRUFBVSxNQUFNLGdCQUFNLGNBQU4sRUFBc0IsT0FBTyxFQUFFLFNBQUYsRUFBYSxPQUFPLEVBQUUsV0FBRixFQUYzRSx5QkF2QndCOzhCQThCL0MsU0FIRixhQTNCaUQ7TUEyQm5DLHFEQUFlLDJCQTNCb0I7MEJBOEIvQyxTQUZGLFFBNUJpRDtNQTRCeEMsNENBQVUsdUJBNUI4QjsyQkE4Qi9DLFNBREYsU0E3QmlEO01BNkJ2Qyw4Q0FBVzs7OztBQTdCNEIsT0FrQ25ELENBQU0sUUFBTixDQUFlO0FBQ2IsbUNBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLDRCQUZPO0FBR1Asa0JBQVksRUFBWjs7QUFFQSxxQkFBZSxJQUFJLEdBQUosRUFBZjtBQUNBLHNCQU5PO0FBT1Asd0JBUE87QUFRUCxhQUFPLEtBQVA7QUFDQSx3QkFBa0IsSUFBbEI7QUFDQSxnQkFBVSxDQUFWO0FBQ0EsbUJBQWEsRUFBYjtBQUNBLHFCQUFlLEVBQWY7QUFDQSwwQkFBb0IsRUFBcEI7QUFDQSx1QkFBaUIsRUFBakI7S0FkRjtHQUZGLEVBbENtRDtBQXFEbkQsU0FBTyxFQUFQLENBckRtRDtDQUE5Qzs7QUF5REEsU0FBUyxTQUFULENBQW1CLE9BQW5CLEVBQWlFO29DQUExQjs7R0FBMEI7O0FBQ3RFLFFBQU0sUUFBTixDQUFlO0FBQ2Isa0NBRGE7QUFFYixhQUFTO0FBQ1Asc0JBRE87QUFFUCwwQkFGTztLQUFUO0dBRkYsRUFEc0U7Q0FBakU7O0FBV0EsU0FBUyxXQUFULENBQXFCLE1BQXJCLEVBQThDO0FBQ25ELE1BQUksT0FBTyxRQUFRLE1BQVIsQ0FBUCxDQUQrQztBQUVuRCxNQUFHLFNBQVMsS0FBVCxFQUFlO0FBQ2hCLFlBQVEsSUFBUiw0QkFBc0MsTUFBdEMsRUFEZ0I7QUFFaEIsV0FBTyxFQUFQLENBRmdCO0dBQWxCO0FBSUEsc0NBQVcsS0FBSyxRQUFMLEVBQVgsQ0FObUQ7Q0FBOUM7O0FBVUEsU0FBUyxhQUFULEdBQXNELEVBQXREOzs7QUFLQSxTQUFTLFVBQVQsQ0FBb0IsTUFBcEIsRUFBeUU7TUFBckMsc0VBQXlCLHFCQUFZOztBQUM5RSxNQUFJLFFBQVEsTUFBTSxRQUFOLEdBQWlCLE1BQWpCLENBRGtFO0FBRTlFLE1BQUksb0JBQVcsTUFBTSxRQUFOLENBQWUsTUFBZixFQUFYO0FBRjBFLE1BRzNFLE9BQU8sSUFBUCxLQUFnQixXQUFoQixFQUE0Qjs7QUFDN0IsY0FBUSxJQUFSLENBQWEsYUFBYjs7O0FBR0EsVUFBRyxLQUFLLGdCQUFMLEtBQTBCLElBQTFCLEVBQStCO0FBQ2hDLGdCQUFRLEdBQVIsQ0FBWSxrQkFBWixFQUFnQyxLQUFLLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBaEMsQ0FEZ0M7QUFFaEMsMkNBQWdCLEtBQUssUUFBTCxFQUFlLEtBQUssVUFBTCxDQUEvQixDQUZnQztBQUdoQyxhQUFLLGdCQUFMLEdBQXdCLEtBQXhCLENBSGdDO09BQWxDOzs7QUFPQSxVQUFJLGFBQWEsRUFBYjs7O0FBSUosV0FBSyxlQUFMLENBQXFCLE9BQXJCLENBQTZCLFVBQVMsT0FBVCxFQUFpQjtBQUM1QyxhQUFLLGFBQUwsQ0FBbUIsTUFBbkIsQ0FBMEIsT0FBMUI7O0FBRDRDLE9BQWpCLENBQTdCOzs7QUFPQSxXQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsVUFBUyxPQUFULEVBQWlCO0FBQ3hDLFlBQUksUUFBUSxNQUFNLFFBQU4sQ0FBZSxPQUFmLENBQVIsQ0FEb0M7QUFFeEMsYUFBSyxhQUFMLENBQW1CLEdBQW5CLENBQXVCLE9BQXZCLEVBQWdDLEtBQWhDOztBQUZ3QyxrQkFJeEMsQ0FBVyxJQUFYLENBQWdCLEtBQWhCLEVBSndDO09BQWpCLENBQXpCOzs7QUFTQSxXQUFLLGFBQUwsQ0FBbUIsT0FBbkIsQ0FBMkIsVUFBUyxPQUFULEVBQWlCO0FBQzFDLFlBQUksUUFBUSxNQUFNLFFBQU4sQ0FBZSxPQUFmLENBQVIsQ0FEc0M7QUFFMUMsbUJBQVcsSUFBWCxDQUFnQixLQUFoQixFQUYwQztPQUFqQixDQUEzQjs7O0FBT0EsVUFBRyxXQUFXLE1BQVgsR0FBb0IsQ0FBcEIsRUFBc0I7QUFDdkIsa0RBQWlCLGdDQUFlLEtBQUssVUFBTCxFQUFoQyxDQUR1QjtBQUV2QixnQkFBUSxHQUFSLENBQVksYUFBWixFQUEyQixXQUFXLE1BQVgsR0FBb0IsS0FBSyxVQUFMLENBQWdCLE1BQWhCLENBQS9DLENBRnVCO0FBR3ZCLHFCQUFhLCtCQUFZLFVBQVosQ0FBYixDQUh1QjtBQUl2QiwwQ0FBZSxVQUFmLEVBSnVCO09BQXpCOzs7O0FBU0EsVUFBSSxhQUFhLE1BQU0sSUFBTixDQUFXLEtBQUssYUFBTCxDQUFtQixNQUFuQixFQUFYLENBQWI7Ozs7Ozs7OztBQVNKLGlCQUFXLElBQVgsQ0FBZ0IsVUFBUyxDQUFULEVBQVksQ0FBWixFQUFjO0FBQzVCLFlBQUcsRUFBRSxLQUFGLEtBQVksRUFBRSxLQUFGLEVBQVE7QUFDckIsY0FBSSxJQUFJLEVBQUUsSUFBRixHQUFTLEVBQUUsSUFBRixDQURJO0FBRXJCLGNBQUcsRUFBRSxJQUFGLEtBQVcsR0FBWCxJQUFrQixFQUFFLElBQUYsS0FBVyxHQUFYLEVBQWU7QUFDbEMsZ0JBQUksQ0FBQyxDQUFELENBRDhCO1dBQXBDO0FBR0EsaUJBQU8sQ0FBUCxDQUxxQjtTQUF2QjtBQU9BLGVBQU8sRUFBRSxLQUFGLEdBQVUsRUFBRSxLQUFGLENBUlc7T0FBZCxDQUFoQjs7O0FBWUEsWUFBTSxRQUFOLENBQWU7QUFDYix1Q0FEYTtBQUViLGlCQUFTO0FBQ1Asd0JBRE87QUFFUCxnQ0FGTztBQUdQLHlCQUFlLEtBQUssYUFBTDtBQUNmLHVCQUFhLEVBQWI7QUFDQSx5QkFBZSxFQUFmO0FBQ0EsMkJBQWlCLEVBQWpCO0FBQ0EsNEJBQWtCLEtBQWxCO0FBQ0Esb0JBQVUsS0FBSyxRQUFMO0FBUkgsU0FBVDtPQUZGO0FBYUEsY0FBUSxPQUFSLENBQWdCLGFBQWhCO1NBakY2QjtHQUEvQixNQWtGSztBQUNILFlBQVEsSUFBUiw0QkFBc0MsTUFBdEMsRUFERztHQWxGTDtDQUhLOztBQTBGUCxTQUFTLFFBQVQsQ0FBa0IsTUFBbEIsRUFBaUM7QUFDL0IsTUFBSSxXQUFXLE1BQU0sUUFBTixHQUFpQixNQUFqQixDQUF3QixRQUF4QixDQURnQjtDQUFqQzs7QUFNTyxTQUFTLFNBQVQsQ0FBbUIsTUFBbkIsRUFBbUU7TUFBaEMsc0VBQXdCLGlCQUFROzs7QUFFeEUsV0FBUyxlQUFULEdBQTBCO0FBQ3hCLFFBQUksV0FBVyxNQUFNLFFBQU4sR0FBaUIsTUFBakIsQ0FBd0IsUUFBeEIsQ0FEUztBQUV4QixRQUFJLFdBQVcsU0FBUyxNQUFULENBQVg7O0FBRm9CLFFBSXBCLFFBQVEsRUFBUixDQUpvQjtBQUt4QixhQUFTLE9BQVQsQ0FBaUIsT0FBakIsQ0FBeUIsVUFBUyxNQUFULEVBQWdCO0FBQ3ZDLFlBQU0sTUFBTixJQUFnQixTQUFTLE1BQVQsQ0FBaEIsQ0FEdUM7S0FBaEIsQ0FBekIsQ0FMd0I7QUFReEIsUUFBSSxTQUFTLEVBQVQsQ0FSb0I7QUFTeEIsYUFBUyxRQUFULENBQWtCLE9BQWxCLENBQTBCLFVBQVMsT0FBVCxFQUFpQjtBQUN6QyxhQUFPLE9BQVAsSUFBa0IsU0FBUyxPQUFULENBQWxCLENBRHlDO0tBQWpCLENBQTFCLENBVHdCOztBQWF4QixRQUFJLGFBQWEsU0FBUyxVQUFUO0FBYk8sUUFjcEIsV0FBVyxhQUFYLENBZG9CO0FBZXhCLFFBQUksWUFBWSxvQkFBUSxXQUFSLEdBQXNCLElBQXRCO0FBZlEsUUFnQnBCLFlBQVksd0JBQWM7QUFDNUIsb0JBRDRCO0FBRTVCLGtDQUY0QjtBQUc1QiwwQkFINEI7QUFJNUIsa0JBSjRCO0FBSzVCLG9CQUw0QjtBQU01Qiw0QkFONEI7QUFPNUIsZ0JBQVUsU0FBUyxRQUFUO0tBUEksQ0FBWixDQWhCb0I7O0FBMEJ4QixVQUFNLFFBQU4sQ0FBZTtBQUNiLHlDQURhO0FBRWIsZUFBUztBQUNQLHNCQURPO0FBRVAsNEJBRk87T0FBVDtLQUZGLEVBMUJ3Qjs7QUFrQ3hCLFdBQU8sWUFBVTtBQUNmLFVBQ0UsTUFBTSxvQkFBUSxXQUFSLEdBQXNCLElBQXRCO1VBQ04sT0FBTyxNQUFNLFNBQU47VUFDUCxrQkFIRixDQURlOztBQU1mLGtCQUFZLElBQVo7QUFOZSxlQU9mLEdBQVksR0FBWixDQVBlO0FBUWYsa0JBQVksVUFBVSxNQUFWLENBQWlCLFFBQWpCLENBQVosQ0FSZTtBQVNmLFVBQUcsU0FBSCxFQUFhO0FBQ1gsaUJBQVMsTUFBVCxFQURXO09BQWI7QUFHQSxZQUFNLFFBQU4sQ0FBZTtBQUNiLHlDQURhO0FBRWIsaUJBQVM7QUFDUCx3QkFETztBQUVQLDRCQUZPO1NBQVQ7T0FGRixFQVplO0tBQVYsQ0FsQ2lCO0dBQTFCOztBQXdEQSwwQkFBUSxZQUFSLEVBQXNCLE1BQXRCLEVBQThCLGlCQUE5QixFQTFEd0U7Q0FBbkU7O0FBNkRBLFNBQVMsUUFBVCxDQUFrQixNQUFsQixFQUF1QztBQUM1QyxNQUFJLFFBQVEsTUFBTSxRQUFOLEVBQVIsQ0FEd0M7QUFFNUMsTUFBSSxXQUFXLE1BQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixNQUF0QixDQUFYLENBRndDO0FBRzVDLE1BQUcsUUFBSCxFQUFZO0FBQ1YsUUFBRyxTQUFTLE9BQVQsRUFBaUI7QUFDbEIsaUNBQVcsWUFBWCxFQUF5QixNQUF6QixFQURrQjtBQUVsQixlQUFTLFNBQVQsQ0FBbUIsYUFBbkIsQ0FBaUMsb0JBQVEsV0FBUixDQUFqQyxDQUZrQjtBQUdsQixZQUFNLFFBQU4sQ0FBZTtBQUNiLDBDQURhO0FBRWIsaUJBQVM7QUFDUCx3QkFETztTQUFUO09BRkYsRUFIa0I7S0FBcEI7R0FERixNQVdLO0FBQ0gsWUFBUSxLQUFSLDRCQUF1QyxNQUF2QyxFQURHO0dBWEw7Q0FISzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7UUMzU1M7O0FBVmhCOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7QUFDQTs7Ozs7O0FBRUEsSUFBTSxNQUFNLEdBQU47O0FBRUMsU0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUE4QztNQUFkLGlFQUFXLGtCQUFHOzs7QUFFbkQsTUFBRyxnQkFBZ0IsV0FBaEIsS0FBZ0MsSUFBaEMsRUFBcUM7QUFDdEMsUUFBSSxTQUFTLElBQUksVUFBSixDQUFlLElBQWYsQ0FBVCxDQURrQztBQUV0QyxXQUFPLE9BQU8sd0JBQWMsTUFBZCxDQUFQLENBQVAsQ0FGc0M7R0FBeEMsTUFHTSxJQUFHLE9BQU8sS0FBSyxNQUFMLEtBQWdCLFdBQXZCLElBQXNDLE9BQU8sS0FBSyxNQUFMLEtBQWdCLFdBQXZCLEVBQW1DO0FBQ2hGLFdBQU8sT0FBTyxJQUFQLENBQVA7Ozs7Ozs7OztBQURnRixHQUE1RTs7Ozs7OztBQUw2QyxDQUE5Qzs7QUF5QlAsU0FBUyxNQUFULENBQWdCLE1BQWhCLEVBQXVCO0FBQ3JCLE1BQUksU0FBUyxPQUFPLE1BQVAsQ0FEUTtBQUVyQixNQUFJLE1BQU0sT0FBTyxNQUFQLENBQWMsWUFBZCxDQUZXO0FBR3JCLE1BQUksWUFBWSxNQUFNLEdBQU47QUFISyxNQUlqQixhQUFhLEVBQWIsQ0FKaUI7QUFLckIsTUFBSSxpQkFBSixDQUxxQjtBQU1yQixNQUFJLE1BQU0sQ0FBQyxDQUFELENBTlc7QUFPckIsTUFBSSxZQUFZLENBQUMsQ0FBRCxDQVBLO0FBUXJCLE1BQUksY0FBYyxDQUFDLENBQUQsQ0FSRztBQVNyQixNQUFJLFdBQVcsRUFBWCxDQVRpQjtBQVVyQixNQUFJLGVBQUosQ0FWcUI7Ozs7Ozs7QUFZckIseUJBQWlCLE9BQU8sTUFBUCw0QkFBakIsb0dBQWlDO1VBQXpCLG9CQUF5Qjs7QUFDL0IsVUFBSSxrQkFBSjtVQUFlLGlCQUFmLENBRCtCO0FBRS9CLFVBQUksUUFBUSxDQUFSLENBRjJCO0FBRy9CLFVBQUksYUFBSixDQUgrQjtBQUkvQixVQUFJLFVBQVUsQ0FBQyxDQUFELENBSmlCO0FBSy9CLFVBQUksa0JBQUosQ0FMK0I7QUFNL0IsVUFBSSw0QkFBSixDQU4rQjtBQU8vQixpQkFBVyxFQUFYLENBUCtCOzs7Ozs7O0FBUy9CLDhCQUFpQixnQ0FBakIsd0dBQXVCO2NBQWYscUJBQWU7O0FBQ3JCLG1CQUFVLE1BQU0sU0FBTixHQUFrQixTQUFsQixDQURXOztBQUdyQixjQUFHLFlBQVksQ0FBQyxDQUFELElBQU0sT0FBTyxNQUFNLE9BQU4sS0FBa0IsV0FBekIsRUFBcUM7QUFDeEQsc0JBQVUsTUFBTSxPQUFOLENBRDhDO1dBQTFEO0FBR0EsaUJBQU8sTUFBTSxPQUFOOzs7QUFOYyxrQkFTZCxNQUFNLE9BQU47O0FBRUwsaUJBQUssV0FBTDtBQUNFLDBCQUFZLE1BQU0sSUFBTixDQURkO0FBRUUsb0JBRkY7O0FBRkYsaUJBTU8sZ0JBQUw7QUFDRSxrQkFBRyxNQUFNLElBQU4sRUFBVztBQUNaLHNDQUFzQixNQUFNLElBQU4sQ0FEVjtlQUFkO0FBR0Esb0JBSkY7O0FBTkYsaUJBWU8sUUFBTDtBQUNFLHVCQUFTLElBQVQsQ0FBYyxpQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsRUFBNkIsTUFBTSxVQUFOLEVBQWtCLE1BQU0sUUFBTixDQUE3RCxFQURGO0FBRUUsb0JBRkY7O0FBWkYsaUJBZ0JPLFNBQUw7QUFDRSx1QkFBUyxJQUFULENBQWMsaUNBQWdCLEtBQWhCLEVBQXVCLElBQXZCLEVBQTZCLE1BQU0sVUFBTixFQUFrQixNQUFNLFFBQU4sQ0FBN0QsRUFERjtBQUVFLG9CQUZGOztBQWhCRixpQkFvQk8sVUFBTDs7O0FBR0Usa0JBQUksTUFBTSxXQUFXLE1BQU0sbUJBQU4sQ0FIdkI7O0FBS0Usa0JBQUcsVUFBVSxTQUFWLElBQXVCLFNBQVMsUUFBVCxFQUFrQjs7QUFFMUMsMkJBQVcsR0FBWCxHQUYwQztlQUE1Qzs7QUFLQSxrQkFBRyxRQUFRLENBQUMsQ0FBRCxFQUFHO0FBQ1osc0JBQU0sR0FBTixDQURZO2VBQWQ7QUFHQSx5QkFBVyxJQUFYLENBQWdCLEVBQUMsSUFBSSxpQ0FBSixFQUFzQixXQUFXLFFBQVEsSUFBUixFQUFjLFlBQWhELEVBQXVELE1BQU0sSUFBTixFQUFZLE9BQU8sR0FBUCxFQUFuRjs7QUFiRjs7QUFwQkYsaUJBcUNPLGVBQUw7OztBQUdFLGtCQUFHLGNBQWMsS0FBZCxJQUF1QixhQUFhLElBQWIsRUFBa0I7QUFDMUMsd0JBQVEsSUFBUixDQUFhLHdDQUFiLEVBQXVELEtBQXZELEVBQThELE1BQU0sU0FBTixFQUFpQixNQUFNLFdBQU4sQ0FBL0UsQ0FEMEM7QUFFMUMsMkJBQVcsR0FBWCxHQUYwQztlQUE1Qzs7QUFLQSxrQkFBRyxjQUFjLENBQUMsQ0FBRCxFQUFHO0FBQ2xCLDRCQUFZLE1BQU0sU0FBTixDQURNO0FBRWxCLDhCQUFjLE1BQU0sV0FBTixDQUZJO2VBQXBCO0FBSUEseUJBQVcsSUFBWCxDQUFnQixFQUFDLElBQUksaUNBQUosRUFBc0IsV0FBVyxRQUFRLElBQVIsRUFBYyxZQUFoRCxFQUF1RCxNQUFNLElBQU4sRUFBWSxPQUFPLE1BQU0sU0FBTixFQUFpQixPQUFPLE1BQU0sV0FBTixFQUFsSDs7QUFaRjs7QUFyQ0YsaUJBc0RPLFlBQUw7QUFDRSx1QkFBUyxJQUFULENBQWMsaUNBQWdCLEtBQWhCLEVBQXVCLElBQXZCLEVBQTZCLE1BQU0sY0FBTixFQUFzQixNQUFNLEtBQU4sQ0FBakUsRUFERjtBQUVFLG9CQUZGOztBQXRERixpQkEwRE8sZUFBTDtBQUNFLHVCQUFTLElBQVQsQ0FBYyxpQ0FBZ0IsS0FBaEIsRUFBdUIsSUFBdkIsRUFBNkIsTUFBTSxhQUFOLENBQTNDLEVBREY7QUFFRSxvQkFGRjs7QUExREYsaUJBOERPLFdBQUw7QUFDRSx1QkFBUyxJQUFULENBQWMsaUNBQWdCLEtBQWhCLEVBQXVCLElBQXZCLEVBQTZCLE1BQU0sS0FBTixDQUEzQyxFQURGO0FBRUUsb0JBRkY7O0FBOURGOztXQVRxQjs7QUErRXJCLHFCQUFXLElBQVgsQ0EvRXFCO0FBZ0ZyQixzQkFBWSxLQUFaLENBaEZxQjtTQUF2Qjs7Ozs7Ozs7Ozs7Ozs7T0FUK0I7O0FBNEYvQixVQUFHLFNBQVMsTUFBVCxHQUFrQixDQUFsQixFQUFvQjtBQUNyQixZQUFJLFVBQVUsd0JBQVksRUFBQyxNQUFNLFNBQU4sRUFBYixDQUFWOztBQURpQixZQUdqQixTQUFTLHNCQUFXLEVBQUMsZ0JBQUQsRUFBWCxDQUFULENBSGlCO0FBSXJCLDhDQUFjLGtDQUFXLFVBQXpCLEVBSnFCO0FBS3JCLDZCQUFTLE9BQVQsRUFBa0IsTUFBbEI7O0FBTHFCLGdCQU9yQixDQUFTLElBQVQsQ0FBYyxPQUFkLEVBUHFCO09BQXZCO0tBNUZGOzs7Ozs7Ozs7Ozs7OztHQVpxQjs7QUFtSHJCLFdBQVMsc0JBQVc7QUFDbEIsU0FBSyxHQUFMOzs7QUFHQSxZQUprQjtBQUtsQix3QkFMa0I7QUFNbEIsNEJBTmtCO0FBT2xCLDBCQVBrQjtHQUFYLENBQVQsQ0FuSHFCO0FBNEhyQixvQ0FBVSxlQUFXLFNBQXJCLEVBNUhxQjtBQTZIckIsd0JBQVcsTUFBWCxFQTdIcUI7QUE4SHJCLFNBQU8sTUFBUCxDQTlIcUI7Q0FBdkI7Ozs7O0FDbkNBOzs7O0FBQ0E7Ozs7Ozs7O0FBMEJBLGdCQUFNLGVBQU47QUFDQSxnQkFBTSxHQUFOLENBQVUsV0FBVjtBQUNBLGdCQUFNLElBQU4sR0FBYSxJQUFiLENBQWtCLFVBQVMsSUFBVCxFQUFjO0FBQzlCLFVBQVEsR0FBUixDQUFZLElBQVosRUFBa0IsZ0JBQU0sZUFBTixFQUFsQixFQUQ4QjtBQUU5Qiw4QkFBZ0IsR0FBaEIsRUFGOEI7Q0FBZCxDQUFsQjs7QUFLQSxTQUFTLGdCQUFULENBQTBCLGtCQUExQixFQUE4QyxZQUFVOztBQUV0RCxNQUFJLGNBQWMsU0FBUyxjQUFULENBQXdCLE9BQXhCLENBQWQsQ0FGa0Q7QUFHdEQsTUFBSSxhQUFhLFNBQVMsY0FBVCxDQUF3QixNQUF4QixDQUFiLENBSGtEO0FBSXRELE1BQUksYUFBYSxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBYixDQUprRDtBQUt0RCxjQUFZLFFBQVosR0FBdUIsSUFBdkIsQ0FMc0Q7QUFNdEQsYUFBVyxRQUFYLEdBQXNCLElBQXRCLENBTnNEOztBQVF0RCxNQUFJLE9BQU8sQ0FBUCxDQVJrRDtBQVN0RCxNQUFJLGVBQUo7TUFBWSxnQkFBWjtNQUFxQixhQUFyQjtNQUEyQixlQUEzQjtNQUFtQyxjQUFuQztNQUEwQyxjQUExQztNQUFpRCxjQUFqRCxDQVRzRDs7QUFXdEQsTUFBRyxTQUFTLENBQVQsRUFBVzs7QUFFWixhQUFTLHVCQUFXLEVBQUMsTUFBTSxlQUFOLEVBQXVCLGVBQWUsQ0FBZixFQUFrQixNQUFNLElBQU4sRUFBWSxLQUFLLEVBQUwsRUFBakUsQ0FBVCxDQUZZO0FBR1osWUFBUSx3QkFBWSxFQUFDLE1BQU0sUUFBTixFQUFnQixjQUFqQixFQUFaLENBQVIsQ0FIWTtBQUlaLFlBQVEsdUJBQVcsRUFBQyxNQUFNLE9BQU4sRUFBZSxZQUFoQixFQUFYLENBQVIsQ0FKWTtBQUtaLFlBQVEsdUJBQVcsRUFBQyxNQUFNLE9BQU4sRUFBZSxZQUFoQixFQUFYLENBQVI7Ozs7Ozs7QUFMWSxRQWFSLFNBQVMsRUFBVCxDQWJRO0FBY1osUUFBSSxTQUFRLENBQVIsQ0FkUTtBQWVaLFFBQUksT0FBTyxHQUFQLENBZlE7O0FBaUJaLFNBQUksSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLEdBQUosRUFBUyxHQUF4QixFQUE0QjtBQUMxQixhQUFPLElBQVAsQ0FBWSw0QkFBZ0IsTUFBaEIsRUFBdUIsSUFBdkIsRUFBNkIsRUFBN0IsRUFBaUMsR0FBakMsQ0FBWixFQUQwQjtBQUUxQixVQUFHLElBQUksQ0FBSixLQUFVLENBQVYsRUFBWTtBQUNiLGVBQU8sR0FBUCxDQURhO0FBRWIsa0JBQVMsR0FBVCxDQUZhO09BQWYsTUFHSztBQUNILGVBQU8sR0FBUCxDQURHO0FBRUgsa0JBQVMsR0FBVCxDQUZHO09BSEw7S0FGRjtBQVVBLDJDQUFjLGNBQVUsT0FBeEIsRUEzQlk7O0FBNkJaLHlCQUFTLEtBQVQsRUFBZ0IsS0FBaEIsRUFBdUIsS0FBdkIsRUE3Qlk7QUE4QlosMEJBQVUsTUFBVixFQUFrQixLQUFsQixFQTlCWTtBQStCWiwyQkFBVyxNQUFYLEVBL0JZO0FBZ0NaLGdCQUFZLFFBQVosR0FBdUIsS0FBdkIsQ0FoQ1k7R0FBZDs7Ozs7Ozs7Ozs7Ozs7OztBQVhzRCxNQTREbkQsU0FBUyxDQUFULEVBQVc7O0FBRVosbUNBQU0sa0JBQU4sRUFDQyxJQURELENBRUUsVUFBQyxRQUFELEVBQWM7QUFDWixhQUFPLFNBQVMsV0FBVCxFQUFQLENBRFk7S0FBZCxFQUdBLFVBQUMsS0FBRCxFQUFXO0FBQ1QsY0FBUSxLQUFSLENBQWMsS0FBZCxFQURTO0tBQVgsQ0FMRixDQVNDLElBVEQsQ0FTTSxVQUFDLEVBQUQsRUFBUTs7QUFFWixVQUFJLEtBQUssMEJBQWMsRUFBZCxDQUFMLENBRlE7QUFHWixlQUFTLDZCQUFpQixFQUFqQixDQUFULENBSFk7QUFJWixVQUFJLGFBQWEsdUJBQWIsQ0FKUTtBQUtaLDhCQUFZLE1BQVosRUFBb0IsT0FBcEIsQ0FBNEIsVUFBUyxPQUFULEVBQWlCO0FBQzNDLGtDQUFjLE9BQWQsRUFBdUIsVUFBdkIsRUFEMkM7QUFFM0Msa0RBQWlCLG1DQUFZLGdDQUE3QixFQUYyQztPQUFqQixDQUE1Qjs7O0FBTFksaUJBV1osQ0FBWSxRQUFaLEdBQXVCLEtBQXZCLENBWFk7QUFZWixpQkFBVyxRQUFYLEdBQXNCLEtBQXRCLENBWlk7S0FBUixDQVROLENBRlk7R0FBZDs7QUE0QkEsTUFBRyxTQUFTLENBQVQsRUFBVzs7QUFDWixVQUFJLGFBQWEsdUJBQWI7QUFDSiwrQkFBYTtBQUNYLFlBQUksNENBQUo7T0FERixFQUVHLElBRkgsQ0FHRSxTQUFTLFdBQVQsQ0FBcUIsT0FBckIsRUFBNkI7O0FBRTNCLG1CQUFXLGFBQVgsQ0FBeUIsRUFBekIsRUFBNkIsUUFBUSxFQUFSLEVBQVk7QUFDdkMsbUJBQVMsQ0FBQyxDQUFELENBQVQ7QUFDQSxtQkFBUyxDQUFDLENBQUQsRUFBSSxhQUFKLENBQVQ7U0FGRixFQUYyQjtBQU0zQixtQkFBVyxnQkFBWCxDQUE0QixFQUFDLE9BQU8sQ0FBUCxFQUFVLE1BQU0sR0FBTixFQUFXLE9BQU8sRUFBUCxFQUFXLE9BQU8sR0FBUCxFQUE3RCxFQU4yQjtBQU8zQixtQkFBVyxnQkFBWCxDQUE0QixFQUFDLE9BQU8sR0FBUCxFQUFZLE1BQU0sR0FBTixFQUFXLE9BQU8sRUFBUCxFQUFXLE9BQU8sQ0FBUCxFQUEvRDs7Ozs7QUFQMkIsT0FBN0IsRUFhQSxTQUFTLFVBQVQsQ0FBb0IsQ0FBcEIsRUFBc0I7QUFDcEIsZ0JBQVEsSUFBUixDQUFhLENBQWIsRUFEb0I7T0FBdEIsQ0FoQkY7U0FGWTtHQUFkOztBQXdCQSxNQUFJLFFBQVEsQ0FBUixDQWhIa0Q7QUFpSHRELE1BQUksY0FBYyxDQUFkLENBakhrRDs7QUFtSHRELE1BQUcsU0FBUyxDQUFULEVBQVc7O0FBRVosbUNBQU0sa0JBQU4sRUFDQyxJQURELENBRUUsVUFBQyxRQUFELEVBQWM7QUFDWixhQUFPLFNBQVMsV0FBVCxFQUFQLENBRFk7S0FBZCxFQUdBLFVBQUMsS0FBRCxFQUFXO0FBQ1QsY0FBUSxLQUFSLENBQWMsS0FBZCxFQURTO0tBQVgsQ0FMRixDQVNDLElBVEQsQ0FTTSxVQUFDLEVBQUQsRUFBUTs7QUFFWixVQUFJLEtBQUssMEJBQWMsRUFBZCxDQUFMLENBRlE7QUFHWixlQUFTLDZCQUFpQixFQUFqQixDQUFULENBSFk7QUFJWixVQUFJLGFBQWEsdUJBQWIsQ0FKUTtBQUtaLDhCQUFZLE1BQVosRUFBb0IsT0FBcEIsQ0FBNEIsVUFBUyxPQUFULEVBQWlCO0FBQzNDLGtDQUFjLE9BQWQsRUFBdUIsVUFBdkIsRUFEMkM7QUFFM0Msa0RBQWlCLG1DQUFZLGdDQUE3QixFQUYyQztPQUFqQixDQUE1Qjs7O0FBTFksaUJBV1osQ0FBWSxRQUFaLEdBQXVCLEtBQXZCLENBWFk7QUFZWixpQkFBVyxRQUFYLEdBQXNCLEtBQXRCOztBQVpZLEtBQVIsQ0FUTixDQUZZO0dBQWQ7O0FBNEJBLGNBQVksZ0JBQVosQ0FBNkIsT0FBN0IsRUFBc0MsWUFBVTtBQUM5QywwQkFBVSxNQUFWLEVBQWtCLENBQWxCLEVBRDhDO0dBQVYsQ0FBdEMsQ0EvSXNEOztBQW1KdEQsYUFBVyxnQkFBWCxDQUE0QixPQUE1QixFQUFxQyxZQUFVO0FBQzdDLHlCQUFTLE1BQVQsRUFENkM7R0FBVixDQUFyQyxDQW5Kc0Q7O0FBdUp0RCxhQUFXLGdCQUFYLENBQTRCLE9BQTVCLEVBQXFDLFlBQVU7O0FBRTdDLDhCQUFjLE1BQWQsRUFBc0IsRUFBRSxLQUFGLENBQXRCLENBRjZDO0FBRzdDLDJCQUFXLE1BQVgsRUFINkM7R0FBVixDQUFyQyxDQXZKc0Q7Q0FBVixDQUE5Qzs7Ozs7Ozs7UUNYZ0I7UUFtQ0E7UUFXQTtRQXNCQTtRQWVBO1FBS0E7UUFLQTs7QUFySGhCOztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFPQSxJQUFNLFFBQVEsNkJBQVI7QUFDTixJQUFJLGFBQWEsQ0FBYjs7QUFFSixTQUFTLFFBQVQsQ0FBa0IsT0FBbEIsRUFBa0M7QUFDaEMsTUFBSSxRQUFRLE1BQU0sUUFBTixHQUFpQixNQUFqQixDQUF3QixRQUF4QixDQUFpQyxPQUFqQyxDQUFSLENBRDRCO0FBRWhDLE1BQUcsT0FBTyxLQUFQLEtBQWlCLFdBQWpCLEVBQTZCO0FBQzlCLFlBQVEsSUFBUiw2QkFBdUMsT0FBdkMsRUFEOEI7QUFFOUIsV0FBTyxLQUFQLENBRjhCO0dBQWhDO0FBSUEsU0FBTyxLQUFQLENBTmdDO0NBQWxDOztBQVVPLFNBQVMsV0FBVDs7OztBQUtOO01BSkMsaUVBQWtFLGtCQUluRTs7QUFDQyxNQUFJLGFBQVcscUJBQWdCLElBQUksSUFBSixHQUFXLE9BQVgsRUFBM0IsQ0FETDt1QkFNSyxTQUhGLEtBSEg7TUFHRyxzQ0FBTyxvQkFIVjswQkFNSyxTQUZGLFFBSkg7TUFJRyw0Q0FBVSx1QkFKYjt5QkFNSyxTQURGLE9BTEg7TUFLRywwQ0FBUywwQkFMWjs7QUFPQyxNQUFJLFNBQVMsR0FBVCxDQVBMO0FBUUMsTUFBSSxTQUFTLG9CQUFRLFVBQVIsRUFBVCxDQVJMO0FBU0MsU0FBTyxJQUFQLENBQVksS0FBWixHQUFvQixNQUFwQixDQVREO0FBVUMsU0FBTyxPQUFQLHlCQVZEOztBQVlDLFFBQU0sUUFBTixDQUFlO0FBQ2Isb0NBRGE7QUFFYixhQUFTO0FBQ1AsWUFETztBQUVQLGdCQUZPO0FBR1Asc0JBSE87QUFJUCxvQkFKTztBQUtQLG9CQUxPO0FBTVAsb0JBTk87QUFPUCxlQUFTLENBQVQ7QUFDQSxZQUFNLEtBQU47QUFDQSxxQkFBZSxFQUFmO0tBVEY7R0FGRixFQVpEO0FBMEJDLFNBQU8sRUFBUCxDQTFCRDtDQUxNOztBQW1DQSxTQUFTLFFBQVQsQ0FBa0IsUUFBbEIsRUFBdUQ7b0NBQWhCOztHQUFnQjs7QUFDNUQsUUFBTSxRQUFOLENBQWU7QUFDYixpQ0FEYTtBQUViLGFBQVM7QUFDUCx3QkFETztBQUVQLHdCQUZPO0tBQVQ7R0FGRixFQUQ0RDtDQUF2RDs7QUFXQSxTQUFTLGFBQVQsQ0FBdUIsT0FBdkIsRUFBd0MsVUFBeEMsRUFBK0Q7QUFDcEUsTUFBSSxRQUFRLFNBQVMsT0FBVCxDQUFSLENBRGdFO0FBRXBFLE1BQUcsVUFBVSxLQUFWLEVBQWdCO0FBQ2pCLFdBRGlCO0dBQW5COztBQUlBLE1BQUcsT0FBTyxXQUFXLE9BQVgsS0FBdUIsVUFBOUIsSUFBNEMsT0FBTyxXQUFXLGdCQUFYLEtBQWdDLFVBQXZDLElBQXFELE9BQU8sV0FBVyxhQUFYLEtBQTZCLFVBQXBDLEVBQStDO0FBQ2pKLFlBQVEsSUFBUixDQUFhLG1GQUFiLEVBRGlKO0FBRWpKLFdBRmlKO0dBQW5KOztBQUtBLGFBQVcsT0FBWCxDQUFtQixNQUFNLE1BQU4sQ0FBbkIsQ0FYb0U7O0FBYXBFLFFBQU0sUUFBTixDQUFlO0FBQ2Isc0NBRGE7QUFFYixhQUFTO0FBQ1Asc0JBRE87QUFFUCw0QkFGTztLQUFUO0dBRkYsRUFib0U7Q0FBL0Q7O0FBc0JBLFNBQVMsZ0JBQVQsQ0FBMEIsT0FBMUIsRUFBZ0U7cUNBQWxCOztHQUFrQjs7QUFDckUsTUFBRyxTQUFTLE9BQVQsTUFBc0IsS0FBdEIsRUFBNEI7QUFDN0IsV0FENkI7R0FBL0I7QUFHQSxRQUFNLFFBQU4sQ0FBZTtBQUNiLDJDQURhO0FBRWIsYUFBUztBQUNQLHNCQURPO0FBRVAsMEJBRk87S0FBVDtHQUZGOztBQUpxRSxDQUFoRTs7QUFlQSxTQUFTLFNBQVQsQ0FBbUIsSUFBbkIsRUFBaUMsRUFBakM7O0FBS0EsU0FBUyxjQUFULENBQXdCLElBQXhCLEVBQXNDLEVBQXRDOztBQUtBLFNBQVMsZUFBVCxDQUF5QixJQUF6QixFQUF1QyxFQUF2Qzs7Ozs7Ozs7Ozs7UUN6R1M7UUE4QkE7UUFrRUE7UUFpR0E7O0FBNU1oQjs7OztBQUNBOzs7O0FBR0EsSUFDRSxPQUFPLEtBQUssR0FBTDtJQUNQLFNBQVMsS0FBSyxLQUFMO0lBQ1QsU0FBUyxLQUFLLEtBQUw7SUFDVCxVQUFVLEtBQUssTUFBTDs7QUFHTCxTQUFTLFdBQVQsQ0FBcUIsTUFBckIsRUFBNEI7QUFDakMsTUFBSSxVQUFKO01BQU8sVUFBUDtNQUFVLFVBQVY7TUFBYSxXQUFiO01BQ0UsZ0JBREY7TUFFRSxlQUFlLEVBQWYsQ0FIK0I7O0FBS2pDLFlBQVUsU0FBTyxJQUFQO0FBTHVCLEdBTWpDLEdBQUksT0FBTyxXQUFXLEtBQUssRUFBTCxDQUFYLENBQVgsQ0FOaUM7QUFPakMsTUFBSSxPQUFPLE9BQUMsSUFBVyxLQUFLLEVBQUwsQ0FBWCxHQUF1QixFQUF4QixDQUFYLENBUGlDO0FBUWpDLE1BQUksT0FBTyxVQUFXLEVBQVgsQ0FBWCxDQVJpQztBQVNqQyxPQUFLLE9BQU8sQ0FBQyxVQUFXLElBQUksSUFBSixHQUFhLElBQUksRUFBSixHQUFVLENBQWxDLENBQUQsR0FBd0MsSUFBeEMsQ0FBWixDQVRpQzs7QUFXakMsa0JBQWdCLElBQUksR0FBSixDQVhpQjtBQVlqQyxrQkFBZ0IsSUFBSSxFQUFKLEdBQVMsTUFBTSxDQUFOLEdBQVUsQ0FBbkIsQ0FaaUI7QUFhakMsa0JBQWdCLEdBQWhCLENBYmlDO0FBY2pDLGtCQUFnQixJQUFJLEVBQUosR0FBUyxNQUFNLENBQU4sR0FBVSxDQUFuQixDQWRpQjtBQWVqQyxrQkFBZ0IsR0FBaEIsQ0FmaUM7QUFnQmpDLGtCQUFnQixPQUFPLENBQVAsR0FBVyxLQUFYLEdBQW1CLEtBQUssRUFBTCxHQUFVLE9BQU8sRUFBUCxHQUFZLEtBQUssR0FBTCxHQUFXLE1BQU0sRUFBTixHQUFXLEVBQXRCOzs7QUFoQnhCLFNBbUIxQjtBQUNMLFVBQU0sQ0FBTjtBQUNBLFlBQVEsQ0FBUjtBQUNBLFlBQVEsQ0FBUjtBQUNBLGlCQUFhLEVBQWI7QUFDQSxrQkFBYyxZQUFkO0FBQ0EsaUJBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxFQUFWLENBQWI7R0FORixDQW5CaUM7Q0FBNUI7O0FBOEJBLFNBQVMsV0FBVCxDQUFxQixNQUFyQixFQUE2QixFQUE3QixFQUFpQyxLQUFqQyxFQUF1QztBQUM1QyxTQUFPLElBQUksT0FBSixDQUFZLFVBQVMsT0FBVCxFQUFrQixNQUFsQixFQUF5QjtBQUMxQyxRQUFHO0FBQ0QsMEJBQVEsZUFBUixDQUF3QixNQUF4QixFQUVFLFNBQVMsU0FBVCxDQUFtQixNQUFuQixFQUEwQjs7QUFFeEIsWUFBRyxPQUFPLEVBQVAsS0FBYyxXQUFkLEVBQTBCO0FBQzNCLGtCQUFRLEVBQUMsTUFBRCxFQUFLLGNBQUwsRUFBUixFQUQyQjtBQUUzQixjQUFHLEtBQUgsRUFBUztBQUNQLGtCQUFNLEVBQUMsTUFBRCxFQUFLLGNBQUwsRUFBTixFQURPO1dBQVQ7U0FGRixNQUtLO0FBQ0gsa0JBQVEsTUFBUixFQURHO0FBRUgsY0FBRyxLQUFILEVBQVM7QUFDUCxrQkFBTSxNQUFOLEVBRE87V0FBVDtTQVBGO09BRkYsRUFlQSxTQUFTLE9BQVQsQ0FBaUIsQ0FBakIsRUFBbUI7OztBQUdqQixZQUFHLE9BQU8sRUFBUCxLQUFjLFdBQWQsRUFBMEI7QUFDM0Isa0JBQVEsRUFBQyxNQUFELEVBQVIsRUFEMkI7U0FBN0IsTUFFSztBQUNILG9CQURHO1NBRkw7T0FIRixDQWpCRixDQURDO0tBQUgsQ0E0QkMsT0FBTSxDQUFOLEVBQVE7OztBQUdQLFVBQUcsT0FBTyxFQUFQLEtBQWMsV0FBZCxFQUEwQjtBQUMzQixnQkFBUSxFQUFDLE1BQUQsRUFBUixFQUQyQjtPQUE3QixNQUVLO0FBQ0gsa0JBREc7T0FGTDtLQUhEO0dBN0JnQixDQUFuQixDQUQ0QztDQUF2Qzs7QUEyQ1AsU0FBUyxrQkFBVCxDQUE0QixHQUE1QixFQUFpQyxFQUFqQyxFQUFxQyxLQUFyQyxFQUEyQztBQUN6QyxNQUFJLFdBQVcsU0FBWCxRQUFXLENBQVMsT0FBVCxFQUFrQixNQUFsQixFQUF5QjtBQUN0QyxtQ0FBTSxHQUFOLEVBQVcsSUFBWCxDQUNFLFVBQVMsUUFBVCxFQUFrQjtBQUNoQixVQUFHLFNBQVMsRUFBVCxFQUFZO0FBQ2IsaUJBQVMsV0FBVCxHQUF1QixJQUF2QixDQUE0QixVQUFTLElBQVQsRUFBYzs7QUFFeEMsc0JBQVksSUFBWixFQUFrQixFQUFsQixFQUFzQixLQUF0QixFQUE2QixJQUE3QixDQUFrQyxPQUFsQyxFQUEyQyxNQUEzQyxFQUZ3QztTQUFkLENBQTVCLENBRGE7T0FBZixNQUtLO0FBQ0gsWUFBRyxPQUFPLEVBQVAsS0FBYyxXQUFkLEVBQTBCO0FBQzNCLGtCQUFRLEVBQUMsTUFBRCxFQUFSLEVBRDJCO1NBQTdCLE1BRUs7QUFDSCxvQkFERztTQUZMO09BTkY7S0FERixDQURGLENBRHNDO0dBQXpCLENBRDBCO0FBbUJ6QyxTQUFPLElBQUksT0FBSixDQUFZLFFBQVosQ0FBUCxDQW5CeUM7Q0FBM0M7O0FBdUJPLFNBQVMsWUFBVCxDQUFzQixPQUF0QixFQUE2QztNQUFkLDhEQUFRLHFCQUFNOztBQUNsRCxNQUFJLFlBQUo7TUFBUyxlQUFUO01BQ0UsV0FBVyxFQUFYO01BQ0EsT0FBTyxXQUFXLE9BQVgsQ0FBUCxDQUhnRDs7QUFLbEQsVUFBUSxXQUFXLEtBQVgsTUFBc0IsVUFBdEIsR0FBbUMsS0FBbkMsR0FBMkMsS0FBM0M7O0FBTDBDLE1BTy9DLFNBQVMsUUFBVCxFQUFrQjtBQUNuQixTQUFJLEdBQUosSUFBVyxPQUFYLEVBQW1CO0FBQ2pCLFVBQUcsUUFBUSxjQUFSLENBQXVCLEdBQXZCLENBQUgsRUFBK0I7QUFDN0IsaUJBQVMsUUFBUSxHQUFSLENBQVQ7O0FBRDZCLFlBRzFCLGNBQWMsTUFBZCxDQUFILEVBQXlCO0FBQ3ZCLG1CQUFTLElBQVQsQ0FBYyxZQUFZLGVBQWUsTUFBZixDQUFaLEVBQW9DLEdBQXBDLEVBQXlDLEtBQXpDLENBQWQsRUFEdUI7U0FBekIsTUFFSztBQUNILG1CQUFTLElBQVQsQ0FBYyxtQkFBbUIsTUFBbkIsRUFBMkIsR0FBM0IsRUFBZ0MsS0FBaEMsQ0FBZCxFQURHO1NBRkw7T0FIRjtLQURGO0dBREYsTUFZTSxJQUFHLFNBQVMsT0FBVCxFQUFpQjtBQUN4QixZQUFRLE9BQVIsQ0FBZ0IsVUFBUyxNQUFULEVBQWdCO0FBQzlCLFVBQUcsY0FBYyxNQUFkLENBQUgsRUFBeUI7QUFDdkIsaUJBQVMsSUFBVCxDQUFjLFlBQVksTUFBWixFQUFvQixLQUFwQixDQUFkLEVBRHVCO09BQXpCLE1BRUs7QUFDSCxpQkFBUyxJQUFULENBQWMsbUJBQW1CLE1BQW5CLEVBQTJCLEtBQTNCLENBQWQsRUFERztPQUZMO0tBRGMsQ0FBaEIsQ0FEd0I7R0FBcEI7O0FBVU4sU0FBTyxJQUFJLE9BQUosQ0FBWSxVQUFTLE9BQVQsRUFBa0IsTUFBbEIsRUFBeUI7QUFDMUMsWUFBUSxHQUFSLENBQVksUUFBWixFQUNDLElBREQsQ0FDTSxVQUFDLE1BQUQsRUFBWTtBQUNoQixVQUFHLFNBQVMsUUFBVCxFQUFrQjtBQUNuQixrQkFBVSxFQUFWLENBRG1CO0FBRW5CLGVBQU8sT0FBUCxDQUFlLFVBQVMsS0FBVCxFQUFlO0FBQzVCLGtCQUFRLE1BQU0sRUFBTixDQUFSLEdBQW9CLE1BQU0sTUFBTixDQURRO1NBQWYsQ0FBZixDQUZtQjtBQUtuQixnQkFBUSxPQUFSLEVBTG1CO09BQXJCLE1BTU0sSUFBRyxTQUFTLE9BQVQsRUFBaUI7QUFDeEIsZ0JBQVEsTUFBUixFQUR3QjtPQUFwQjtLQVBGLENBRE4sQ0FEMEM7R0FBekIsQ0FBbkIsQ0E3QmtEO0NBQTdDOztBQThDUCxTQUFTLGFBQVQsQ0FBdUIsSUFBdkIsRUFBNEI7QUFDMUIsTUFBSSxTQUFTLElBQVQsQ0FEc0I7QUFFMUIsTUFBRztBQUNELFNBQUssSUFBTCxFQURDO0dBQUgsQ0FFQyxPQUFNLENBQU4sRUFBUTtBQUNQLGFBQVMsS0FBVCxDQURPO0dBQVI7QUFHRCxTQUFPLE1BQVAsQ0FQMEI7Q0FBNUI7OztBQVlBLFNBQVMsY0FBVCxDQUF3QixLQUF4QixFQUE4QjtBQUM1QixNQUFJLFNBQVMsbUVBQVQ7TUFDRixjQURGO01BQ1MsZUFEVDtNQUNpQixlQURqQjtNQUVFLGNBRkY7TUFFUyxjQUZUO01BR0UsYUFIRjtNQUdRLGFBSFI7TUFHYyxhQUhkO01BSUUsYUFKRjtNQUlRLGFBSlI7TUFJYyxhQUpkO01BSW9CLGFBSnBCO01BS0UsVUFMRjtNQUtLLElBQUksQ0FBSixDQU51Qjs7QUFRNUIsVUFBUSxLQUFLLElBQUwsQ0FBVSxDQUFDLEdBQUksTUFBTSxNQUFOLEdBQWdCLEdBQXJCLENBQWxCLENBUjRCO0FBUzVCLFdBQVMsSUFBSSxXQUFKLENBQWdCLEtBQWhCLENBQVQsQ0FUNEI7QUFVNUIsV0FBUyxJQUFJLFVBQUosQ0FBZSxNQUFmLENBQVQsQ0FWNEI7O0FBWTVCLFVBQVEsT0FBTyxPQUFQLENBQWUsTUFBTSxNQUFOLENBQWEsTUFBTSxNQUFOLEdBQWEsQ0FBYixDQUE1QixDQUFSLENBWjRCO0FBYTVCLFVBQVEsT0FBTyxPQUFQLENBQWUsTUFBTSxNQUFOLENBQWEsTUFBTSxNQUFOLEdBQWEsQ0FBYixDQUE1QixDQUFSLENBYjRCO0FBYzVCLE1BQUcsU0FBUyxFQUFULEVBQWEsUUFBaEI7QUFkNEIsTUFlekIsU0FBUyxFQUFULEVBQWEsUUFBaEI7O0FBZjRCLE9BaUI1QixHQUFRLE1BQU0sT0FBTixDQUFjLHFCQUFkLEVBQXFDLEVBQXJDLENBQVIsQ0FqQjRCOztBQW1CNUIsT0FBSSxJQUFJLENBQUosRUFBTyxJQUFJLEtBQUosRUFBVyxLQUFLLENBQUwsRUFBUTs7QUFFNUIsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFNLE1BQU4sQ0FBYSxHQUFiLENBQWYsQ0FBUCxDQUY0QjtBQUc1QixXQUFPLE9BQU8sT0FBUCxDQUFlLE1BQU0sTUFBTixDQUFhLEdBQWIsQ0FBZixDQUFQLENBSDRCO0FBSTVCLFdBQU8sT0FBTyxPQUFQLENBQWUsTUFBTSxNQUFOLENBQWEsR0FBYixDQUFmLENBQVAsQ0FKNEI7QUFLNUIsV0FBTyxPQUFPLE9BQVAsQ0FBZSxNQUFNLE1BQU4sQ0FBYSxHQUFiLENBQWYsQ0FBUCxDQUw0Qjs7QUFPNUIsV0FBTyxJQUFDLElBQVEsQ0FBUixHQUFjLFFBQVEsQ0FBUixDQVBNO0FBUTVCLFdBQU8sQ0FBRSxPQUFPLEVBQVAsQ0FBRCxJQUFlLENBQWYsR0FBcUIsUUFBUSxDQUFSLENBUkQ7QUFTNUIsV0FBTyxDQUFFLE9BQU8sQ0FBUCxDQUFELElBQWMsQ0FBZCxHQUFtQixJQUFwQixDQVRxQjs7QUFXNUIsV0FBTyxDQUFQLElBQVksSUFBWixDQVg0QjtBQVk1QixRQUFHLFFBQVEsRUFBUixFQUFZLE9BQU8sSUFBRSxDQUFGLENBQVAsR0FBYyxJQUFkLENBQWY7QUFDQSxRQUFHLFFBQVEsRUFBUixFQUFZLE9BQU8sSUFBRSxDQUFGLENBQVAsR0FBYyxJQUFkLENBQWY7R0FiRjs7QUFuQjRCLFNBbUNyQixNQUFQLENBbkM0QjtDQUE5Qjs7QUF1Q08sU0FBUyxVQUFULENBQW9CLENBQXBCLEVBQXNCO0FBQzNCLE1BQUcsUUFBTyw2Q0FBUCxJQUFZLFFBQVosRUFBcUI7QUFDdEIsa0JBQWMsNENBQWQsQ0FEc0I7R0FBeEI7O0FBSUEsTUFBRyxNQUFNLElBQU4sRUFBVztBQUNaLFdBQU8sTUFBUCxDQURZO0dBQWQ7OztBQUwyQixNQVV2QixnQkFBZ0IsT0FBTyxTQUFQLENBQWlCLFFBQWpCLENBQTBCLElBQTFCLENBQStCLENBQS9CLEVBQWtDLEtBQWxDLENBQXdDLG1CQUF4QyxFQUE2RCxDQUE3RCxDQUFoQixDQVZ1QjtBQVczQixTQUFPLGNBQWMsV0FBZCxFQUFQLENBWDJCO0NBQXRCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vIHRoZSB3aGF0d2ctZmV0Y2ggcG9seWZpbGwgaW5zdGFsbHMgdGhlIGZldGNoKCkgZnVuY3Rpb25cbi8vIG9uIHRoZSBnbG9iYWwgb2JqZWN0ICh3aW5kb3cgb3Igc2VsZilcbi8vXG4vLyBSZXR1cm4gdGhhdCBhcyB0aGUgZXhwb3J0IGZvciB1c2UgaW4gV2VicGFjaywgQnJvd3NlcmlmeSBldGMuXG5yZXF1aXJlKCd3aGF0d2ctZmV0Y2gnKTtcbm1vZHVsZS5leHBvcnRzID0gc2VsZi5mZXRjaC5iaW5kKHNlbGYpO1xuIiwiLyogQnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMgZm9yIHRob3NlIHdpdGggdGhlIHNhbWUgbmFtZSBhcyBvdGhlciBgbG9kYXNoYCBtZXRob2RzLiAqL1xudmFyIG5hdGl2ZUdldFByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZjtcblxuLyoqXG4gKiBHZXRzIHRoZSBgW1tQcm90b3R5cGVdXWAgb2YgYHZhbHVlYC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gcXVlcnkuXG4gKiBAcmV0dXJucyB7bnVsbHxPYmplY3R9IFJldHVybnMgdGhlIGBbW1Byb3RvdHlwZV1dYC5cbiAqL1xuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKHZhbHVlKSB7XG4gIHJldHVybiBuYXRpdmVHZXRQcm90b3R5cGUoT2JqZWN0KHZhbHVlKSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZ2V0UHJvdG90eXBlO1xuIiwiLyoqXG4gKiBDaGVja3MgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0IGluIElFIDwgOS5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIGhvc3Qgb2JqZWN0LCBlbHNlIGBmYWxzZWAuXG4gKi9cbmZ1bmN0aW9uIGlzSG9zdE9iamVjdCh2YWx1ZSkge1xuICAvLyBNYW55IGhvc3Qgb2JqZWN0cyBhcmUgYE9iamVjdGAgb2JqZWN0cyB0aGF0IGNhbiBjb2VyY2UgdG8gc3RyaW5nc1xuICAvLyBkZXNwaXRlIGhhdmluZyBpbXByb3Blcmx5IGRlZmluZWQgYHRvU3RyaW5nYCBtZXRob2RzLlxuICB2YXIgcmVzdWx0ID0gZmFsc2U7XG4gIGlmICh2YWx1ZSAhPSBudWxsICYmIHR5cGVvZiB2YWx1ZS50b1N0cmluZyAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc3VsdCA9ICEhKHZhbHVlICsgJycpO1xuICAgIH0gY2F0Y2ggKGUpIHt9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc0hvc3RPYmplY3Q7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLiBBIHZhbHVlIGlzIG9iamVjdC1saWtlIGlmIGl0J3Mgbm90IGBudWxsYFxuICogYW5kIGhhcyBhIGB0eXBlb2ZgIHJlc3VsdCBvZiBcIm9iamVjdFwiLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgNC4wLjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIG9iamVjdC1saWtlLCBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKHt9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzT2JqZWN0TGlrZShbMSwgMiwgM10pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKF8ubm9vcCk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKG51bGwpO1xuICogLy8gPT4gZmFsc2VcbiAqL1xuZnVuY3Rpb24gaXNPYmplY3RMaWtlKHZhbHVlKSB7XG4gIHJldHVybiAhIXZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PSAnb2JqZWN0Jztcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc09iamVjdExpa2U7XG4iLCJ2YXIgZ2V0UHJvdG90eXBlID0gcmVxdWlyZSgnLi9fZ2V0UHJvdG90eXBlJyksXG4gICAgaXNIb3N0T2JqZWN0ID0gcmVxdWlyZSgnLi9faXNIb3N0T2JqZWN0JyksXG4gICAgaXNPYmplY3RMaWtlID0gcmVxdWlyZSgnLi9pc09iamVjdExpa2UnKTtcblxuLyoqIGBPYmplY3QjdG9TdHJpbmdgIHJlc3VsdCByZWZlcmVuY2VzLiAqL1xudmFyIG9iamVjdFRhZyA9ICdbb2JqZWN0IE9iamVjdF0nO1xuXG4vKiogVXNlZCBmb3IgYnVpbHQtaW4gbWV0aG9kIHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xuXG4vKiogVXNlZCB0byByZXNvbHZlIHRoZSBkZWNvbXBpbGVkIHNvdXJjZSBvZiBmdW5jdGlvbnMuICovXG52YXIgZnVuY1RvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKiogVXNlZCB0byBjaGVjayBvYmplY3RzIGZvciBvd24gcHJvcGVydGllcy4gKi9cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IG9iamVjdFByb3RvLmhhc093blByb3BlcnR5O1xuXG4vKiogVXNlZCB0byBpbmZlciB0aGUgYE9iamVjdGAgY29uc3RydWN0b3IuICovXG52YXIgb2JqZWN0Q3RvclN0cmluZyA9IGZ1bmNUb1N0cmluZy5jYWxsKE9iamVjdCk7XG5cbi8qKlxuICogVXNlZCB0byByZXNvbHZlIHRoZVxuICogW2B0b1N0cmluZ1RhZ2BdKGh0dHA6Ly9lY21hLWludGVybmF0aW9uYWwub3JnL2VjbWEtMjYyLzYuMC8jc2VjLW9iamVjdC5wcm90b3R5cGUudG9zdHJpbmcpXG4gKiBvZiB2YWx1ZXMuXG4gKi9cbnZhciBvYmplY3RUb1N0cmluZyA9IG9iamVjdFByb3RvLnRvU3RyaW5nO1xuXG4vKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LCB0aGF0IGlzLCBhbiBvYmplY3QgY3JlYXRlZCBieSB0aGVcbiAqIGBPYmplY3RgIGNvbnN0cnVjdG9yIG9yIG9uZSB3aXRoIGEgYFtbUHJvdG90eXBlXV1gIG9mIGBudWxsYC5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyT2YgX1xuICogQHNpbmNlIDAuOC4wXG4gKiBAY2F0ZWdvcnkgTGFuZ1xuICogQHBhcmFtIHsqfSB2YWx1ZSBUaGUgdmFsdWUgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn0gUmV0dXJucyBgdHJ1ZWAgaWYgYHZhbHVlYCBpcyBhIHBsYWluIG9iamVjdCxcbiAqICBlbHNlIGBmYWxzZWAuXG4gKiBAZXhhbXBsZVxuICpcbiAqIGZ1bmN0aW9uIEZvbygpIHtcbiAqICAgdGhpcy5hID0gMTtcbiAqIH1cbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QobmV3IEZvbyk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChbMSwgMiwgM10pO1xuICogLy8gPT4gZmFsc2VcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoeyAneCc6IDAsICd5JzogMCB9KTtcbiAqIC8vID0+IHRydWVcbiAqXG4gKiBfLmlzUGxhaW5PYmplY3QoT2JqZWN0LmNyZWF0ZShudWxsKSk7XG4gKiAvLyA9PiB0cnVlXG4gKi9cbmZ1bmN0aW9uIGlzUGxhaW5PYmplY3QodmFsdWUpIHtcbiAgaWYgKCFpc09iamVjdExpa2UodmFsdWUpIHx8XG4gICAgICBvYmplY3RUb1N0cmluZy5jYWxsKHZhbHVlKSAhPSBvYmplY3RUYWcgfHwgaXNIb3N0T2JqZWN0KHZhbHVlKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICB2YXIgcHJvdG8gPSBnZXRQcm90b3R5cGUodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICB2YXIgQ3RvciA9IGhhc093blByb3BlcnR5LmNhbGwocHJvdG8sICdjb25zdHJ1Y3RvcicpICYmIHByb3RvLmNvbnN0cnVjdG9yO1xuICByZXR1cm4gKHR5cGVvZiBDdG9yID09ICdmdW5jdGlvbicgJiZcbiAgICBDdG9yIGluc3RhbmNlb2YgQ3RvciAmJiBmdW5jVG9TdHJpbmcuY2FsbChDdG9yKSA9PSBvYmplY3RDdG9yU3RyaW5nKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBpc1BsYWluT2JqZWN0O1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHNldFRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBfZXh0ZW5kcyA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24gKHRhcmdldCkgeyBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykgeyB2YXIgc291cmNlID0gYXJndW1lbnRzW2ldOyBmb3IgKHZhciBrZXkgaW4gc291cmNlKSB7IGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoc291cmNlLCBrZXkpKSB7IHRhcmdldFtrZXldID0gc291cmNlW2tleV07IH0gfSB9IHJldHVybiB0YXJnZXQ7IH07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGFwcGx5TWlkZGxld2FyZTtcblxudmFyIF9jb21wb3NlID0gcmVxdWlyZSgnLi9jb21wb3NlJyk7XG5cbnZhciBfY29tcG9zZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jb21wb3NlKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0b3JlIGVuaGFuY2VyIHRoYXQgYXBwbGllcyBtaWRkbGV3YXJlIHRvIHRoZSBkaXNwYXRjaCBtZXRob2RcbiAqIG9mIHRoZSBSZWR1eCBzdG9yZS4gVGhpcyBpcyBoYW5keSBmb3IgYSB2YXJpZXR5IG9mIHRhc2tzLCBzdWNoIGFzIGV4cHJlc3NpbmdcbiAqIGFzeW5jaHJvbm91cyBhY3Rpb25zIGluIGEgY29uY2lzZSBtYW5uZXIsIG9yIGxvZ2dpbmcgZXZlcnkgYWN0aW9uIHBheWxvYWQuXG4gKlxuICogU2VlIGByZWR1eC10aHVua2AgcGFja2FnZSBhcyBhbiBleGFtcGxlIG9mIHRoZSBSZWR1eCBtaWRkbGV3YXJlLlxuICpcbiAqIEJlY2F1c2UgbWlkZGxld2FyZSBpcyBwb3RlbnRpYWxseSBhc3luY2hyb25vdXMsIHRoaXMgc2hvdWxkIGJlIHRoZSBmaXJzdFxuICogc3RvcmUgZW5oYW5jZXIgaW4gdGhlIGNvbXBvc2l0aW9uIGNoYWluLlxuICpcbiAqIE5vdGUgdGhhdCBlYWNoIG1pZGRsZXdhcmUgd2lsbCBiZSBnaXZlbiB0aGUgYGRpc3BhdGNoYCBhbmQgYGdldFN0YXRlYCBmdW5jdGlvbnNcbiAqIGFzIG5hbWVkIGFyZ3VtZW50cy5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBtaWRkbGV3YXJlcyBUaGUgbWlkZGxld2FyZSBjaGFpbiB0byBiZSBhcHBsaWVkLlxuICogQHJldHVybnMge0Z1bmN0aW9ufSBBIHN0b3JlIGVuaGFuY2VyIGFwcGx5aW5nIHRoZSBtaWRkbGV3YXJlLlxuICovXG5mdW5jdGlvbiBhcHBseU1pZGRsZXdhcmUoKSB7XG4gIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBtaWRkbGV3YXJlcyA9IEFycmF5KF9sZW4pLCBfa2V5ID0gMDsgX2tleSA8IF9sZW47IF9rZXkrKykge1xuICAgIG1pZGRsZXdhcmVzW19rZXldID0gYXJndW1lbnRzW19rZXldO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChjcmVhdGVTdG9yZSkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICAgICAgdmFyIHN0b3JlID0gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcik7XG4gICAgICB2YXIgX2Rpc3BhdGNoID0gc3RvcmUuZGlzcGF0Y2g7XG4gICAgICB2YXIgY2hhaW4gPSBbXTtcblxuICAgICAgdmFyIG1pZGRsZXdhcmVBUEkgPSB7XG4gICAgICAgIGdldFN0YXRlOiBzdG9yZS5nZXRTdGF0ZSxcbiAgICAgICAgZGlzcGF0Y2g6IGZ1bmN0aW9uIGRpc3BhdGNoKGFjdGlvbikge1xuICAgICAgICAgIHJldHVybiBfZGlzcGF0Y2goYWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGNoYWluID0gbWlkZGxld2FyZXMubWFwKGZ1bmN0aW9uIChtaWRkbGV3YXJlKSB7XG4gICAgICAgIHJldHVybiBtaWRkbGV3YXJlKG1pZGRsZXdhcmVBUEkpO1xuICAgICAgfSk7XG4gICAgICBfZGlzcGF0Y2ggPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdLmFwcGx5KHVuZGVmaW5lZCwgY2hhaW4pKHN0b3JlLmRpc3BhdGNoKTtcblxuICAgICAgcmV0dXJuIF9leHRlbmRzKHt9LCBzdG9yZSwge1xuICAgICAgICBkaXNwYXRjaDogX2Rpc3BhdGNoXG4gICAgICB9KTtcbiAgICB9O1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYmluZEFjdGlvbkNyZWF0b3JzO1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2goYWN0aW9uQ3JlYXRvci5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvbiBjcmVhdG9ycywgaW50byBhbiBvYmplY3Qgd2l0aCB0aGVcbiAqIHNhbWUga2V5cywgYnV0IHdpdGggZXZlcnkgZnVuY3Rpb24gd3JhcHBlZCBpbnRvIGEgYGRpc3BhdGNoYCBjYWxsIHNvIHRoZXlcbiAqIG1heSBiZSBpbnZva2VkIGRpcmVjdGx5LiBUaGlzIGlzIGp1c3QgYSBjb252ZW5pZW5jZSBtZXRob2QsIGFzIHlvdSBjYW4gY2FsbFxuICogYHN0b3JlLmRpc3BhdGNoKE15QWN0aW9uQ3JlYXRvcnMuZG9Tb21ldGhpbmcoKSlgIHlvdXJzZWxmIGp1c3QgZmluZS5cbiAqXG4gKiBGb3IgY29udmVuaWVuY2UsIHlvdSBjYW4gYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCxcbiAqIGFuZCBnZXQgYSBmdW5jdGlvbiBpbiByZXR1cm4uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbnxPYmplY3R9IGFjdGlvbkNyZWF0b3JzIEFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGFjdGlvblxuICogY3JlYXRvciBmdW5jdGlvbnMuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluIGl0IGlzIHRvIHVzZSBFUzYgYGltcG9ydCAqIGFzYFxuICogc3ludGF4LiBZb3UgbWF5IGFsc28gcGFzcyBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBkaXNwYXRjaCBUaGUgYGRpc3BhdGNoYCBmdW5jdGlvbiBhdmFpbGFibGUgb24geW91ciBSZWR1eFxuICogc3RvcmUuXG4gKlxuICogQHJldHVybnMge0Z1bmN0aW9ufE9iamVjdH0gVGhlIG9iamVjdCBtaW1pY2tpbmcgdGhlIG9yaWdpbmFsIG9iamVjdCwgYnV0IHdpdGhcbiAqIGV2ZXJ5IGFjdGlvbiBjcmVhdG9yIHdyYXBwZWQgaW50byB0aGUgYGRpc3BhdGNoYCBjYWxsLiBJZiB5b3UgcGFzc2VkIGFcbiAqIGZ1bmN0aW9uIGFzIGBhY3Rpb25DcmVhdG9yc2AsIHRoZSByZXR1cm4gdmFsdWUgd2lsbCBhbHNvIGJlIGEgc2luZ2xlXG4gKiBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gYmluZEFjdGlvbkNyZWF0b3JzKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCkge1xuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3JzLCBkaXNwYXRjaCk7XG4gIH1cblxuICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3JzICE9PSAnb2JqZWN0JyB8fCBhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmluZEFjdGlvbkNyZWF0b3JzIGV4cGVjdGVkIGFuIG9iamVjdCBvciBhIGZ1bmN0aW9uLCBpbnN0ZWFkIHJlY2VpdmVkICcgKyAoYWN0aW9uQ3JlYXRvcnMgPT09IG51bGwgPyAnbnVsbCcgOiB0eXBlb2YgYWN0aW9uQ3JlYXRvcnMpICsgJy4gJyArICdEaWQgeW91IHdyaXRlIFwiaW1wb3J0IEFjdGlvbkNyZWF0b3JzIGZyb21cIiBpbnN0ZWFkIG9mIFwiaW1wb3J0ICogYXMgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiPycpO1xuICB9XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhhY3Rpb25DcmVhdG9ycyk7XG4gIHZhciBib3VuZEFjdGlvbkNyZWF0b3JzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIHZhciBhY3Rpb25DcmVhdG9yID0gYWN0aW9uQ3JlYXRvcnNba2V5XTtcbiAgICBpZiAodHlwZW9mIGFjdGlvbkNyZWF0b3IgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGJvdW5kQWN0aW9uQ3JlYXRvcnNba2V5XSA9IGJpbmRBY3Rpb25DcmVhdG9yKGFjdGlvbkNyZWF0b3IsIGRpc3BhdGNoKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJvdW5kQWN0aW9uQ3JlYXRvcnM7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21iaW5lUmVkdWNlcnM7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2xvZGFzaC9pc1BsYWluT2JqZWN0Jyk7XG5cbnZhciBfaXNQbGFpbk9iamVjdDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pc1BsYWluT2JqZWN0KTtcblxudmFyIF93YXJuaW5nID0gcmVxdWlyZSgnLi91dGlscy93YXJuaW5nJyk7XG5cbnZhciBfd2FybmluZzIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF93YXJuaW5nKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgXCJkZWZhdWx0XCI6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIGdldFVuZGVmaW5lZFN0YXRlRXJyb3JNZXNzYWdlKGtleSwgYWN0aW9uKSB7XG4gIHZhciBhY3Rpb25UeXBlID0gYWN0aW9uICYmIGFjdGlvbi50eXBlO1xuICB2YXIgYWN0aW9uTmFtZSA9IGFjdGlvblR5cGUgJiYgJ1wiJyArIGFjdGlvblR5cGUudG9TdHJpbmcoKSArICdcIicgfHwgJ2FuIGFjdGlvbic7XG5cbiAgcmV0dXJuICdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgaGFuZGxpbmcgJyArIGFjdGlvbk5hbWUgKyAnLiAnICsgJ1RvIGlnbm9yZSBhbiBhY3Rpb24sIHlvdSBtdXN0IGV4cGxpY2l0bHkgcmV0dXJuIHRoZSBwcmV2aW91cyBzdGF0ZS4nO1xufVxuXG5mdW5jdGlvbiBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKGlucHV0U3RhdGUsIHJlZHVjZXJzLCBhY3Rpb24pIHtcbiAgdmFyIHJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMocmVkdWNlcnMpO1xuICB2YXIgYXJndW1lbnROYW1lID0gYWN0aW9uICYmIGFjdGlvbi50eXBlID09PSBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCA/ICdpbml0aWFsU3RhdGUgYXJndW1lbnQgcGFzc2VkIHRvIGNyZWF0ZVN0b3JlJyA6ICdwcmV2aW91cyBzdGF0ZSByZWNlaXZlZCBieSB0aGUgcmVkdWNlcic7XG5cbiAgaWYgKHJlZHVjZXJLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAnU3RvcmUgZG9lcyBub3QgaGF2ZSBhIHZhbGlkIHJlZHVjZXIuIE1ha2Ugc3VyZSB0aGUgYXJndW1lbnQgcGFzc2VkICcgKyAndG8gY29tYmluZVJlZHVjZXJzIGlzIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIHJlZHVjZXJzLic7XG4gIH1cblxuICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShpbnB1dFN0YXRlKSkge1xuICAgIHJldHVybiAnVGhlICcgKyBhcmd1bWVudE5hbWUgKyAnIGhhcyB1bmV4cGVjdGVkIHR5cGUgb2YgXCInICsge30udG9TdHJpbmcuY2FsbChpbnB1dFN0YXRlKS5tYXRjaCgvXFxzKFthLXp8QS1aXSspLylbMV0gKyAnXCIuIEV4cGVjdGVkIGFyZ3VtZW50IHRvIGJlIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgJyArICgna2V5czogXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCInKTtcbiAgfVxuXG4gIHZhciB1bmV4cGVjdGVkS2V5cyA9IE9iamVjdC5rZXlzKGlucHV0U3RhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG4gICAgcmV0dXJuICFyZWR1Y2Vycy5oYXNPd25Qcm9wZXJ0eShrZXkpO1xuICB9KTtcblxuICBpZiAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnVW5leHBlY3RlZCAnICsgKHVuZXhwZWN0ZWRLZXlzLmxlbmd0aCA+IDEgPyAna2V5cycgOiAna2V5JykgKyAnICcgKyAoJ1wiJyArIHVuZXhwZWN0ZWRLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiIGZvdW5kIGluICcgKyBhcmd1bWVudE5hbWUgKyAnLiAnKSArICdFeHBlY3RlZCB0byBmaW5kIG9uZSBvZiB0aGUga25vd24gcmVkdWNlciBrZXlzIGluc3RlYWQ6ICcgKyAoJ1wiJyArIHJlZHVjZXJLZXlzLmpvaW4oJ1wiLCBcIicpICsgJ1wiLiBVbmV4cGVjdGVkIGtleXMgd2lsbCBiZSBpZ25vcmVkLicpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFJlZHVjZXJTYW5pdHkocmVkdWNlcnMpIHtcbiAgT2JqZWN0LmtleXMocmVkdWNlcnMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgIHZhciByZWR1Y2VyID0gcmVkdWNlcnNba2V5XTtcbiAgICB2YXIgaW5pdGlhbFN0YXRlID0gcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIGR1cmluZyBpbml0aWFsaXphdGlvbi4gJyArICdJZiB0aGUgc3RhdGUgcGFzc2VkIHRvIHRoZSByZWR1Y2VyIGlzIHVuZGVmaW5lZCwgeW91IG11c3QgJyArICdleHBsaWNpdGx5IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS4gVGhlIGluaXRpYWwgc3RhdGUgbWF5ICcgKyAnbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG5cbiAgICB2YXIgdHlwZSA9ICdAQHJlZHV4L1BST0JFX1VOS05PV05fQUNUSU9OXycgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNykuc3BsaXQoJycpLmpvaW4oJy4nKTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXIodW5kZWZpbmVkLCB7IHR5cGU6IHR5cGUgfSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCB3aGVuIHByb2JlZCB3aXRoIGEgcmFuZG9tIHR5cGUuICcgKyAoJ0RvblxcJ3QgdHJ5IHRvIGhhbmRsZSAnICsgX2NyZWF0ZVN0b3JlLkFjdGlvblR5cGVzLklOSVQgKyAnIG9yIG90aGVyIGFjdGlvbnMgaW4gXCJyZWR1eC8qXCIgJykgKyAnbmFtZXNwYWNlLiBUaGV5IGFyZSBjb25zaWRlcmVkIHByaXZhdGUuIEluc3RlYWQsIHlvdSBtdXN0IHJldHVybiB0aGUgJyArICdjdXJyZW50IHN0YXRlIGZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB1bmxlc3MgaXQgaXMgdW5kZWZpbmVkLCAnICsgJ2luIHdoaWNoIGNhc2UgeW91IG11c3QgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLCByZWdhcmRsZXNzIG9mIHRoZSAnICsgJ2FjdGlvbiB0eXBlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgbm90IGJlIHVuZGVmaW5lZC4nKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFR1cm5zIGFuIG9iamVjdCB3aG9zZSB2YWx1ZXMgYXJlIGRpZmZlcmVudCByZWR1Y2VyIGZ1bmN0aW9ucywgaW50byBhIHNpbmdsZVxuICogcmVkdWNlciBmdW5jdGlvbi4gSXQgd2lsbCBjYWxsIGV2ZXJ5IGNoaWxkIHJlZHVjZXIsIGFuZCBnYXRoZXIgdGhlaXIgcmVzdWx0c1xuICogaW50byBhIHNpbmdsZSBzdGF0ZSBvYmplY3QsIHdob3NlIGtleXMgY29ycmVzcG9uZCB0byB0aGUga2V5cyBvZiB0aGUgcGFzc2VkXG4gKiByZWR1Y2VyIGZ1bmN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcmVkdWNlcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBjb3JyZXNwb25kIHRvIGRpZmZlcmVudFxuICogcmVkdWNlciBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIGNvbWJpbmVkIGludG8gb25lLiBPbmUgaGFuZHkgd2F5IHRvIG9idGFpblxuICogaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXMgcmVkdWNlcnNgIHN5bnRheC4gVGhlIHJlZHVjZXJzIG1heSBuZXZlciByZXR1cm5cbiAqIHVuZGVmaW5lZCBmb3IgYW55IGFjdGlvbi4gSW5zdGVhZCwgdGhleSBzaG91bGQgcmV0dXJuIHRoZWlyIGluaXRpYWwgc3RhdGVcbiAqIGlmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlbSB3YXMgdW5kZWZpbmVkLCBhbmQgdGhlIGN1cnJlbnQgc3RhdGUgZm9yIGFueVxuICogdW5yZWNvZ25pemVkIGFjdGlvbi5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgcmVkdWNlciBmdW5jdGlvbiB0aGF0IGludm9rZXMgZXZlcnkgcmVkdWNlciBpbnNpZGUgdGhlXG4gKiBwYXNzZWQgb2JqZWN0LCBhbmQgYnVpbGRzIGEgc3RhdGUgb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUuXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVSZWR1Y2VycyhyZWR1Y2Vycykge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBmaW5hbFJlZHVjZXJzID0ge307XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgcmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIga2V5ID0gcmVkdWNlcktleXNbaV07XG4gICAgaWYgKHR5cGVvZiByZWR1Y2Vyc1trZXldID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBmaW5hbFJlZHVjZXJzW2tleV0gPSByZWR1Y2Vyc1trZXldO1xuICAgIH1cbiAgfVxuICB2YXIgZmluYWxSZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKGZpbmFsUmVkdWNlcnMpO1xuXG4gIHZhciBzYW5pdHlFcnJvcjtcbiAgdHJ5IHtcbiAgICBhc3NlcnRSZWR1Y2VyU2FuaXR5KGZpbmFsUmVkdWNlcnMpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgc2FuaXR5RXJyb3IgPSBlO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGNvbWJpbmF0aW9uKCkge1xuICAgIHZhciBzdGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBhY3Rpb24gPSBhcmd1bWVudHNbMV07XG5cbiAgICBpZiAoc2FuaXR5RXJyb3IpIHtcbiAgICAgIHRocm93IHNhbml0eUVycm9yO1xuICAgIH1cblxuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgd2FybmluZ01lc3NhZ2UgPSBnZXRVbmV4cGVjdGVkU3RhdGVTaGFwZVdhcm5pbmdNZXNzYWdlKHN0YXRlLCBmaW5hbFJlZHVjZXJzLCBhY3Rpb24pO1xuICAgICAgaWYgKHdhcm5pbmdNZXNzYWdlKSB7XG4gICAgICAgICgwLCBfd2FybmluZzJbXCJkZWZhdWx0XCJdKSh3YXJuaW5nTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFyIGhhc0NoYW5nZWQgPSBmYWxzZTtcbiAgICB2YXIgbmV4dFN0YXRlID0ge307XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaW5hbFJlZHVjZXJLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0gZmluYWxSZWR1Y2VyS2V5c1tpXTtcbiAgICAgIHZhciByZWR1Y2VyID0gZmluYWxSZWR1Y2Vyc1trZXldO1xuICAgICAgdmFyIHByZXZpb3VzU3RhdGVGb3JLZXkgPSBzdGF0ZVtrZXldO1xuICAgICAgdmFyIG5leHRTdGF0ZUZvcktleSA9IHJlZHVjZXIocHJldmlvdXNTdGF0ZUZvcktleSwgYWN0aW9uKTtcbiAgICAgIGlmICh0eXBlb2YgbmV4dFN0YXRlRm9yS2V5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YXIgZXJyb3JNZXNzYWdlID0gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICAgIG5leHRTdGF0ZVtrZXldID0gbmV4dFN0YXRlRm9yS2V5O1xuICAgICAgaGFzQ2hhbmdlZCA9IGhhc0NoYW5nZWQgfHwgbmV4dFN0YXRlRm9yS2V5ICE9PSBwcmV2aW91c1N0YXRlRm9yS2V5O1xuICAgIH1cbiAgICByZXR1cm4gaGFzQ2hhbmdlZCA/IG5leHRTdGF0ZSA6IHN0YXRlO1xuICB9O1xufSIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjb21wb3NlO1xuLyoqXG4gKiBDb21wb3NlcyBzaW5nbGUtYXJndW1lbnQgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG8gbGVmdC5cbiAqXG4gKiBAcGFyYW0gey4uLkZ1bmN0aW9ufSBmdW5jcyBUaGUgZnVuY3Rpb25zIHRvIGNvbXBvc2UuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gb2J0YWluZWQgYnkgY29tcG9zaW5nIGZ1bmN0aW9ucyBmcm9tIHJpZ2h0IHRvXG4gKiBsZWZ0LiBGb3IgZXhhbXBsZSwgY29tcG9zZShmLCBnLCBoKSBpcyBpZGVudGljYWwgdG8gYXJnID0+IGYoZyhoKGFyZykpKS5cbiAqL1xuZnVuY3Rpb24gY29tcG9zZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGZ1bmNzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgZnVuY3NbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIGlmIChmdW5jcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDw9IDAgPyB1bmRlZmluZWQgOiBhcmd1bWVudHNbMF07XG4gICAgfVxuXG4gICAgdmFyIGxhc3QgPSBmdW5jc1tmdW5jcy5sZW5ndGggLSAxXTtcbiAgICB2YXIgcmVzdCA9IGZ1bmNzLnNsaWNlKDAsIC0xKTtcblxuICAgIHJldHVybiByZXN0LnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChjb21wb3NlZCwgZikge1xuICAgICAgcmV0dXJuIGYoY29tcG9zZWQpO1xuICAgIH0sIGxhc3QuYXBwbHkodW5kZWZpbmVkLCBhcmd1bWVudHMpKTtcbiAgfTtcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLkFjdGlvblR5cGVzID0gdW5kZWZpbmVkO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBjcmVhdGVTdG9yZTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBUaGVzZSBhcmUgcHJpdmF0ZSBhY3Rpb24gdHlwZXMgcmVzZXJ2ZWQgYnkgUmVkdXguXG4gKiBGb3IgYW55IHVua25vd24gYWN0aW9ucywgeW91IG11c3QgcmV0dXJuIHRoZSBjdXJyZW50IHN0YXRlLlxuICogSWYgdGhlIGN1cnJlbnQgc3RhdGUgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUuXG4gKiBEbyBub3QgcmVmZXJlbmNlIHRoZXNlIGFjdGlvbiB0eXBlcyBkaXJlY3RseSBpbiB5b3VyIGNvZGUuXG4gKi9cbnZhciBBY3Rpb25UeXBlcyA9IGV4cG9ydHMuQWN0aW9uVHlwZXMgPSB7XG4gIElOSVQ6ICdAQHJlZHV4L0lOSVQnXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBSZWR1eCBzdG9yZSB0aGF0IGhvbGRzIHRoZSBzdGF0ZSB0cmVlLlxuICogVGhlIG9ubHkgd2F5IHRvIGNoYW5nZSB0aGUgZGF0YSBpbiB0aGUgc3RvcmUgaXMgdG8gY2FsbCBgZGlzcGF0Y2goKWAgb24gaXQuXG4gKlxuICogVGhlcmUgc2hvdWxkIG9ubHkgYmUgYSBzaW5nbGUgc3RvcmUgaW4geW91ciBhcHAuIFRvIHNwZWNpZnkgaG93IGRpZmZlcmVudFxuICogcGFydHMgb2YgdGhlIHN0YXRlIHRyZWUgcmVzcG9uZCB0byBhY3Rpb25zLCB5b3UgbWF5IGNvbWJpbmUgc2V2ZXJhbCByZWR1Y2Vyc1xuICogaW50byBhIHNpbmdsZSByZWR1Y2VyIGZ1bmN0aW9uIGJ5IHVzaW5nIGBjb21iaW5lUmVkdWNlcnNgLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IHJlZHVjZXIgQSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIG5leHQgc3RhdGUgdHJlZSwgZ2l2ZW5cbiAqIHRoZSBjdXJyZW50IHN0YXRlIHRyZWUgYW5kIHRoZSBhY3Rpb24gdG8gaGFuZGxlLlxuICpcbiAqIEBwYXJhbSB7YW55fSBbaW5pdGlhbFN0YXRlXSBUaGUgaW5pdGlhbCBzdGF0ZS4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGh5ZHJhdGUgdGhlIHN0YXRlIGZyb20gdGhlIHNlcnZlciBpbiB1bml2ZXJzYWwgYXBwcywgb3IgdG8gcmVzdG9yZSBhXG4gKiBwcmV2aW91c2x5IHNlcmlhbGl6ZWQgdXNlciBzZXNzaW9uLlxuICogSWYgeW91IHVzZSBgY29tYmluZVJlZHVjZXJzYCB0byBwcm9kdWNlIHRoZSByb290IHJlZHVjZXIgZnVuY3Rpb24sIHRoaXMgbXVzdCBiZVxuICogYW4gb2JqZWN0IHdpdGggdGhlIHNhbWUgc2hhcGUgYXMgYGNvbWJpbmVSZWR1Y2Vyc2Aga2V5cy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBlbmhhbmNlciBUaGUgc3RvcmUgZW5oYW5jZXIuIFlvdSBtYXkgb3B0aW9uYWxseSBzcGVjaWZ5IGl0XG4gKiB0byBlbmhhbmNlIHRoZSBzdG9yZSB3aXRoIHRoaXJkLXBhcnR5IGNhcGFiaWxpdGllcyBzdWNoIGFzIG1pZGRsZXdhcmUsXG4gKiB0aW1lIHRyYXZlbCwgcGVyc2lzdGVuY2UsIGV0Yy4gVGhlIG9ubHkgc3RvcmUgZW5oYW5jZXIgdGhhdCBzaGlwcyB3aXRoIFJlZHV4XG4gKiBpcyBgYXBwbHlNaWRkbGV3YXJlKClgLlxuICpcbiAqIEByZXR1cm5zIHtTdG9yZX0gQSBSZWR1eCBzdG9yZSB0aGF0IGxldHMgeW91IHJlYWQgdGhlIHN0YXRlLCBkaXNwYXRjaCBhY3Rpb25zXG4gKiBhbmQgc3Vic2NyaWJlIHRvIGNoYW5nZXMuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVN0b3JlKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSwgZW5oYW5jZXIpIHtcbiAgaWYgKHR5cGVvZiBpbml0aWFsU3RhdGUgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGVuaGFuY2VyID09PSAndW5kZWZpbmVkJykge1xuICAgIGVuaGFuY2VyID0gaW5pdGlhbFN0YXRlO1xuICAgIGluaXRpYWxTdGF0ZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW5oYW5jZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgZW5oYW5jZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5oYW5jZXIoY3JlYXRlU3RvcmUpKHJlZHVjZXIsIGluaXRpYWxTdGF0ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHJlZHVjZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSByZWR1Y2VyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gIH1cblxuICB2YXIgY3VycmVudFJlZHVjZXIgPSByZWR1Y2VyO1xuICB2YXIgY3VycmVudFN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICB2YXIgY3VycmVudExpc3RlbmVycyA9IFtdO1xuICB2YXIgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnM7XG4gIHZhciBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpIHtcbiAgICBpZiAobmV4dExpc3RlbmVycyA9PT0gY3VycmVudExpc3RlbmVycykge1xuICAgICAgbmV4dExpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMuc2xpY2UoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIHN0YXRlIHRyZWUgbWFuYWdlZCBieSB0aGUgc3RvcmUuXG4gICAqXG4gICAqIEByZXR1cm5zIHthbnl9IFRoZSBjdXJyZW50IHN0YXRlIHRyZWUgb2YgeW91ciBhcHBsaWNhdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIGdldFN0YXRlKCkge1xuICAgIHJldHVybiBjdXJyZW50U3RhdGU7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGNoYW5nZSBsaXN0ZW5lci4gSXQgd2lsbCBiZSBjYWxsZWQgYW55IHRpbWUgYW4gYWN0aW9uIGlzIGRpc3BhdGNoZWQsXG4gICAqIGFuZCBzb21lIHBhcnQgb2YgdGhlIHN0YXRlIHRyZWUgbWF5IHBvdGVudGlhbGx5IGhhdmUgY2hhbmdlZC4gWW91IG1heSB0aGVuXG4gICAqIGNhbGwgYGdldFN0YXRlKClgIHRvIHJlYWQgdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBpbnNpZGUgdGhlIGNhbGxiYWNrLlxuICAgKlxuICAgKiBZb3UgbWF5IGNhbGwgYGRpc3BhdGNoKClgIGZyb20gYSBjaGFuZ2UgbGlzdGVuZXIsIHdpdGggdGhlIGZvbGxvd2luZ1xuICAgKiBjYXZlYXRzOlxuICAgKlxuICAgKiAxLiBUaGUgc3Vic2NyaXB0aW9ucyBhcmUgc25hcHNob3R0ZWQganVzdCBiZWZvcmUgZXZlcnkgYGRpc3BhdGNoKClgIGNhbGwuXG4gICAqIElmIHlvdSBzdWJzY3JpYmUgb3IgdW5zdWJzY3JpYmUgd2hpbGUgdGhlIGxpc3RlbmVycyBhcmUgYmVpbmcgaW52b2tlZCwgdGhpc1xuICAgKiB3aWxsIG5vdCBoYXZlIGFueSBlZmZlY3Qgb24gdGhlIGBkaXNwYXRjaCgpYCB0aGF0IGlzIGN1cnJlbnRseSBpbiBwcm9ncmVzcy5cbiAgICogSG93ZXZlciwgdGhlIG5leHQgYGRpc3BhdGNoKClgIGNhbGwsIHdoZXRoZXIgbmVzdGVkIG9yIG5vdCwgd2lsbCB1c2UgYSBtb3JlXG4gICAqIHJlY2VudCBzbmFwc2hvdCBvZiB0aGUgc3Vic2NyaXB0aW9uIGxpc3QuXG4gICAqXG4gICAqIDIuIFRoZSBsaXN0ZW5lciBzaG91bGQgbm90IGV4cGVjdCB0byBzZWUgYWxsIHN0YXRlcyBjaGFuZ2VzLCBhcyB0aGUgc3RhdGVcbiAgICogbWlnaHQgaGF2ZSBiZWVuIHVwZGF0ZWQgbXVsdGlwbGUgdGltZXMgZHVyaW5nIGEgbmVzdGVkIGBkaXNwYXRjaCgpYCBiZWZvcmVcbiAgICogdGhlIGxpc3RlbmVyIGlzIGNhbGxlZC4gSXQgaXMsIGhvd2V2ZXIsIGd1YXJhbnRlZWQgdGhhdCBhbGwgc3Vic2NyaWJlcnNcbiAgICogcmVnaXN0ZXJlZCBiZWZvcmUgdGhlIGBkaXNwYXRjaCgpYCBzdGFydGVkIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlIGxhdGVzdFxuICAgKiBzdGF0ZSBieSB0aGUgdGltZSBpdCBleGl0cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgQSBjYWxsYmFjayB0byBiZSBpbnZva2VkIG9uIGV2ZXJ5IGRpc3BhdGNoLlxuICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdG8gcmVtb3ZlIHRoaXMgY2hhbmdlIGxpc3RlbmVyLlxuICAgKi9cbiAgZnVuY3Rpb24gc3Vic2NyaWJlKGxpc3RlbmVyKSB7XG4gICAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBsaXN0ZW5lciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHZhciBpc1N1YnNjcmliZWQgPSB0cnVlO1xuXG4gICAgZW5zdXJlQ2FuTXV0YXRlTmV4dExpc3RlbmVycygpO1xuICAgIG5leHRMaXN0ZW5lcnMucHVzaChsaXN0ZW5lcik7XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gdW5zdWJzY3JpYmUoKSB7XG4gICAgICBpZiAoIWlzU3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlzU3Vic2NyaWJlZCA9IGZhbHNlO1xuXG4gICAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgICB2YXIgaW5kZXggPSBuZXh0TGlzdGVuZXJzLmluZGV4T2YobGlzdGVuZXIpO1xuICAgICAgbmV4dExpc3RlbmVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogRGlzcGF0Y2hlcyBhbiBhY3Rpb24uIEl0IGlzIHRoZSBvbmx5IHdheSB0byB0cmlnZ2VyIGEgc3RhdGUgY2hhbmdlLlxuICAgKlxuICAgKiBUaGUgYHJlZHVjZXJgIGZ1bmN0aW9uLCB1c2VkIHRvIGNyZWF0ZSB0aGUgc3RvcmUsIHdpbGwgYmUgY2FsbGVkIHdpdGggdGhlXG4gICAqIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGdpdmVuIGBhY3Rpb25gLiBJdHMgcmV0dXJuIHZhbHVlIHdpbGxcbiAgICogYmUgY29uc2lkZXJlZCB0aGUgKipuZXh0Kiogc3RhdGUgb2YgdGhlIHRyZWUsIGFuZCB0aGUgY2hhbmdlIGxpc3RlbmVyc1xuICAgKiB3aWxsIGJlIG5vdGlmaWVkLlxuICAgKlxuICAgKiBUaGUgYmFzZSBpbXBsZW1lbnRhdGlvbiBvbmx5IHN1cHBvcnRzIHBsYWluIG9iamVjdCBhY3Rpb25zLiBJZiB5b3Ugd2FudCB0b1xuICAgKiBkaXNwYXRjaCBhIFByb21pc2UsIGFuIE9ic2VydmFibGUsIGEgdGh1bmssIG9yIHNvbWV0aGluZyBlbHNlLCB5b3UgbmVlZCB0b1xuICAgKiB3cmFwIHlvdXIgc3RvcmUgY3JlYXRpbmcgZnVuY3Rpb24gaW50byB0aGUgY29ycmVzcG9uZGluZyBtaWRkbGV3YXJlLiBGb3JcbiAgICogZXhhbXBsZSwgc2VlIHRoZSBkb2N1bWVudGF0aW9uIGZvciB0aGUgYHJlZHV4LXRodW5rYCBwYWNrYWdlLiBFdmVuIHRoZVxuICAgKiBtaWRkbGV3YXJlIHdpbGwgZXZlbnR1YWxseSBkaXNwYXRjaCBwbGFpbiBvYmplY3QgYWN0aW9ucyB1c2luZyB0aGlzIG1ldGhvZC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGFjdGlvbiBBIHBsYWluIG9iamVjdCByZXByZXNlbnRpbmcg4oCcd2hhdCBjaGFuZ2Vk4oCdLiBJdCBpc1xuICAgKiBhIGdvb2QgaWRlYSB0byBrZWVwIGFjdGlvbnMgc2VyaWFsaXphYmxlIHNvIHlvdSBjYW4gcmVjb3JkIGFuZCByZXBsYXkgdXNlclxuICAgKiBzZXNzaW9ucywgb3IgdXNlIHRoZSB0aW1lIHRyYXZlbGxpbmcgYHJlZHV4LWRldnRvb2xzYC4gQW4gYWN0aW9uIG11c3QgaGF2ZVxuICAgKiBhIGB0eXBlYCBwcm9wZXJ0eSB3aGljaCBtYXkgbm90IGJlIGB1bmRlZmluZWRgLiBJdCBpcyBhIGdvb2QgaWRlYSB0byB1c2VcbiAgICogc3RyaW5nIGNvbnN0YW50cyBmb3IgYWN0aW9uIHR5cGVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7T2JqZWN0fSBGb3IgY29udmVuaWVuY2UsIHRoZSBzYW1lIGFjdGlvbiBvYmplY3QgeW91IGRpc3BhdGNoZWQuXG4gICAqXG4gICAqIE5vdGUgdGhhdCwgaWYgeW91IHVzZSBhIGN1c3RvbSBtaWRkbGV3YXJlLCBpdCBtYXkgd3JhcCBgZGlzcGF0Y2goKWAgdG9cbiAgICogcmV0dXJuIHNvbWV0aGluZyBlbHNlIChmb3IgZXhhbXBsZSwgYSBQcm9taXNlIHlvdSBjYW4gYXdhaXQpLlxuICAgKi9cbiAgZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgaWYgKCEoMCwgX2lzUGxhaW5PYmplY3QyW1wiZGVmYXVsdFwiXSkoYWN0aW9uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG11c3QgYmUgcGxhaW4gb2JqZWN0cy4gJyArICdVc2UgY3VzdG9tIG1pZGRsZXdhcmUgZm9yIGFzeW5jIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhY3Rpb24udHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQWN0aW9ucyBtYXkgbm90IGhhdmUgYW4gdW5kZWZpbmVkIFwidHlwZVwiIHByb3BlcnR5LiAnICsgJ0hhdmUgeW91IG1pc3NwZWxsZWQgYSBjb25zdGFudD8nKTtcbiAgICB9XG5cbiAgICBpZiAoaXNEaXNwYXRjaGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VycyBtYXkgbm90IGRpc3BhdGNoIGFjdGlvbnMuJyk7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSB0cnVlO1xuICAgICAgY3VycmVudFN0YXRlID0gY3VycmVudFJlZHVjZXIoY3VycmVudFN0YXRlLCBhY3Rpb24pO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpc0Rpc3BhdGNoaW5nID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIGxpc3RlbmVycyA9IGN1cnJlbnRMaXN0ZW5lcnMgPSBuZXh0TGlzdGVuZXJzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBsaXN0ZW5lcnNbaV0oKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWN0aW9uO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcGxhY2VzIHRoZSByZWR1Y2VyIGN1cnJlbnRseSB1c2VkIGJ5IHRoZSBzdG9yZSB0byBjYWxjdWxhdGUgdGhlIHN0YXRlLlxuICAgKlxuICAgKiBZb3UgbWlnaHQgbmVlZCB0aGlzIGlmIHlvdXIgYXBwIGltcGxlbWVudHMgY29kZSBzcGxpdHRpbmcgYW5kIHlvdSB3YW50IHRvXG4gICAqIGxvYWQgc29tZSBvZiB0aGUgcmVkdWNlcnMgZHluYW1pY2FsbHkuIFlvdSBtaWdodCBhbHNvIG5lZWQgdGhpcyBpZiB5b3VcbiAgICogaW1wbGVtZW50IGEgaG90IHJlbG9hZGluZyBtZWNoYW5pc20gZm9yIFJlZHV4LlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBuZXh0UmVkdWNlciBUaGUgcmVkdWNlciBmb3IgdGhlIHN0b3JlIHRvIHVzZSBpbnN0ZWFkLlxuICAgKiBAcmV0dXJucyB7dm9pZH1cbiAgICovXG4gIGZ1bmN0aW9uIHJlcGxhY2VSZWR1Y2VyKG5leHRSZWR1Y2VyKSB7XG4gICAgaWYgKHR5cGVvZiBuZXh0UmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCB0aGUgbmV4dFJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgICB9XG5cbiAgICBjdXJyZW50UmVkdWNlciA9IG5leHRSZWR1Y2VyO1xuICAgIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcbiAgfVxuXG4gIC8vIFdoZW4gYSBzdG9yZSBpcyBjcmVhdGVkLCBhbiBcIklOSVRcIiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCBzbyB0aGF0IGV2ZXJ5XG4gIC8vIHJlZHVjZXIgcmV0dXJucyB0aGVpciBpbml0aWFsIHN0YXRlLiBUaGlzIGVmZmVjdGl2ZWx5IHBvcHVsYXRlc1xuICAvLyB0aGUgaW5pdGlhbCBzdGF0ZSB0cmVlLlxuICBkaXNwYXRjaCh7IHR5cGU6IEFjdGlvblR5cGVzLklOSVQgfSk7XG5cbiAgcmV0dXJuIHtcbiAgICBkaXNwYXRjaDogZGlzcGF0Y2gsXG4gICAgc3Vic2NyaWJlOiBzdWJzY3JpYmUsXG4gICAgZ2V0U3RhdGU6IGdldFN0YXRlLFxuICAgIHJlcGxhY2VSZWR1Y2VyOiByZXBsYWNlUmVkdWNlclxuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuY29tcG9zZSA9IGV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gZXhwb3J0cy5iaW5kQWN0aW9uQ3JlYXRvcnMgPSBleHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IGV4cG9ydHMuY3JlYXRlU3RvcmUgPSB1bmRlZmluZWQ7XG5cbnZhciBfY3JlYXRlU3RvcmUgPSByZXF1aXJlKCcuL2NyZWF0ZVN0b3JlJyk7XG5cbnZhciBfY3JlYXRlU3RvcmUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlU3RvcmUpO1xuXG52YXIgX2NvbWJpbmVSZWR1Y2VycyA9IHJlcXVpcmUoJy4vY29tYmluZVJlZHVjZXJzJyk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbWJpbmVSZWR1Y2Vycyk7XG5cbnZhciBfYmluZEFjdGlvbkNyZWF0b3JzID0gcmVxdWlyZSgnLi9iaW5kQWN0aW9uQ3JlYXRvcnMnKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfYmluZEFjdGlvbkNyZWF0b3JzKTtcblxudmFyIF9hcHBseU1pZGRsZXdhcmUgPSByZXF1aXJlKCcuL2FwcGx5TWlkZGxld2FyZScpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9hcHBseU1pZGRsZXdhcmUpO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLypcbiogVGhpcyBpcyBhIGR1bW15IGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBmdW5jdGlvbiBuYW1lIGhhcyBiZWVuIGFsdGVyZWQgYnkgbWluaWZpY2F0aW9uLlxuKiBJZiB0aGUgZnVuY3Rpb24gaGFzIGJlZW4gbWluaWZpZWQgYW5kIE5PREVfRU5WICE9PSAncHJvZHVjdGlvbicsIHdhcm4gdGhlIHVzZXIuXG4qL1xuZnVuY3Rpb24gaXNDcnVzaGVkKCkge31cblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGlzQ3J1c2hlZC5uYW1lID09PSAnc3RyaW5nJyAmJiBpc0NydXNoZWQubmFtZSAhPT0gJ2lzQ3J1c2hlZCcpIHtcbiAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKCdZb3UgYXJlIGN1cnJlbnRseSB1c2luZyBtaW5pZmllZCBjb2RlIG91dHNpZGUgb2YgTk9ERV9FTlYgPT09IFxcJ3Byb2R1Y3Rpb25cXCcuICcgKyAnVGhpcyBtZWFucyB0aGF0IHlvdSBhcmUgcnVubmluZyBhIHNsb3dlciBkZXZlbG9wbWVudCBidWlsZCBvZiBSZWR1eC4gJyArICdZb3UgY2FuIHVzZSBsb29zZS1lbnZpZnkgKGh0dHBzOi8vZ2l0aHViLmNvbS96ZXJ0b3NoL2xvb3NlLWVudmlmeSkgZm9yIGJyb3dzZXJpZnkgJyArICdvciBEZWZpbmVQbHVnaW4gZm9yIHdlYnBhY2sgKGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMzAwMzAwMzEpICcgKyAndG8gZW5zdXJlIHlvdSBoYXZlIHRoZSBjb3JyZWN0IGNvZGUgZm9yIHlvdXIgcHJvZHVjdGlvbiBidWlsZC4nKTtcbn1cblxuZXhwb3J0cy5jcmVhdGVTdG9yZSA9IF9jcmVhdGVTdG9yZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21iaW5lUmVkdWNlcnMgPSBfY29tYmluZVJlZHVjZXJzMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IF9iaW5kQWN0aW9uQ3JlYXRvcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYXBwbHlNaWRkbGV3YXJlID0gX2FwcGx5TWlkZGxld2FyZTJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5jb21wb3NlID0gX2NvbXBvc2UyW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IHdhcm5pbmc7XG4vKipcbiAqIFByaW50cyBhIHdhcm5pbmcgaW4gdGhlIGNvbnNvbGUgaWYgaXQgZXhpc3RzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSB3YXJuaW5nIG1lc3NhZ2UuXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gd2FybmluZyhtZXNzYWdlKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUgKi9cbiAgaWYgKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gIH1cbiAgLyogZXNsaW50LWVuYWJsZSBuby1jb25zb2xlICovXG4gIHRyeSB7XG4gICAgLy8gVGhpcyBlcnJvciB3YXMgdGhyb3duIGFzIGEgY29udmVuaWVuY2Ugc28gdGhhdCB5b3UgY2FuIHVzZSB0aGlzIHN0YWNrXG4gICAgLy8gdG8gZmluZCB0aGUgY2FsbHNpdGUgdGhhdCBjYXVzZWQgdGhpcyB3YXJuaW5nIHRvIGZpcmUuXG4gICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIC8qIGVzbGludC1kaXNhYmxlIG5vLWVtcHR5ICovXG4gIH0gY2F0Y2ggKGUpIHt9XG4gIC8qIGVzbGludC1lbmFibGUgbm8tZW1wdHkgKi9cbn0iLCIoZnVuY3Rpb24oc2VsZikge1xuICAndXNlIHN0cmljdCc7XG5cbiAgaWYgKHNlbGYuZmV0Y2gpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZU5hbWUobmFtZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIG5hbWUgPSBTdHJpbmcobmFtZSlcbiAgICB9XG4gICAgaWYgKC9bXmEtejAtOVxcLSMkJSYnKisuXFxeX2B8fl0vaS50ZXN0KG5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGNoYXJhY3RlciBpbiBoZWFkZXIgZmllbGQgbmFtZScpXG4gICAgfVxuICAgIHJldHVybiBuYW1lLnRvTG93ZXJDYXNlKClcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vcm1hbGl6ZVZhbHVlKHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhbHVlID0gU3RyaW5nKHZhbHVlKVxuICAgIH1cbiAgICByZXR1cm4gdmFsdWVcbiAgfVxuXG4gIGZ1bmN0aW9uIEhlYWRlcnMoaGVhZGVycykge1xuICAgIHRoaXMubWFwID0ge31cblxuICAgIGlmIChoZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycykge1xuICAgICAgaGVhZGVycy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIHZhbHVlKVxuICAgICAgfSwgdGhpcylcblxuICAgIH0gZWxzZSBpZiAoaGVhZGVycykge1xuICAgICAgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaGVhZGVycykuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuYXBwZW5kKG5hbWUsIGhlYWRlcnNbbmFtZV0pXG4gICAgICB9LCB0aGlzKVxuICAgIH1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmFwcGVuZCA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IG5vcm1hbGl6ZU5hbWUobmFtZSlcbiAgICB2YWx1ZSA9IG5vcm1hbGl6ZVZhbHVlKHZhbHVlKVxuICAgIHZhciBsaXN0ID0gdGhpcy5tYXBbbmFtZV1cbiAgICBpZiAoIWxpc3QpIHtcbiAgICAgIGxpc3QgPSBbXVxuICAgICAgdGhpcy5tYXBbbmFtZV0gPSBsaXN0XG4gICAgfVxuICAgIGxpc3QucHVzaCh2YWx1ZSlcbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlWydkZWxldGUnXSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgdmFsdWVzID0gdGhpcy5tYXBbbm9ybWFsaXplTmFtZShuYW1lKV1cbiAgICByZXR1cm4gdmFsdWVzID8gdmFsdWVzWzBdIDogbnVsbFxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0QWxsID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSB8fCBbXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLm1hcC5oYXNPd25Qcm9wZXJ0eShub3JtYWxpemVOYW1lKG5hbWUpKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXSA9IFtub3JtYWxpemVWYWx1ZSh2YWx1ZSldXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oY2FsbGJhY2ssIHRoaXNBcmcpIHtcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0aGlzLm1hcCkuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICB0aGlzLm1hcFtuYW1lXS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIGNhbGxiYWNrLmNhbGwodGhpc0FyZywgdmFsdWUsIG5hbWUsIHRoaXMpXG4gICAgICB9LCB0aGlzKVxuICAgIH0sIHRoaXMpXG4gIH1cblxuICBmdW5jdGlvbiBjb25zdW1lZChib2R5KSB7XG4gICAgaWYgKGJvZHkuYm9keVVzZWQpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKSlcbiAgICB9XG4gICAgYm9keS5ib2R5VXNlZCA9IHRydWVcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc29sdmUocmVhZGVyLnJlc3VsdClcbiAgICAgIH1cbiAgICAgIHJlYWRlci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlamVjdChyZWFkZXIuZXJyb3IpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNBcnJheUJ1ZmZlcihibG9iKSB7XG4gICAgdmFyIHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKClcbiAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWRCbG9iQXNUZXh0KGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNUZXh0KGJsb2IpXG4gICAgcmV0dXJuIGZpbGVSZWFkZXJSZWFkeShyZWFkZXIpXG4gIH1cblxuICB2YXIgc3VwcG9ydCA9IHtcbiAgICBibG9iOiAnRmlsZVJlYWRlcicgaW4gc2VsZiAmJiAnQmxvYicgaW4gc2VsZiAmJiAoZnVuY3Rpb24oKSB7XG4gICAgICB0cnkge1xuICAgICAgICBuZXcgQmxvYigpO1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pKCksXG4gICAgZm9ybURhdGE6ICdGb3JtRGF0YScgaW4gc2VsZixcbiAgICBhcnJheUJ1ZmZlcjogJ0FycmF5QnVmZmVyJyBpbiBzZWxmXG4gIH1cblxuICBmdW5jdGlvbiBCb2R5KCkge1xuICAgIHRoaXMuYm9keVVzZWQgPSBmYWxzZVxuXG5cbiAgICB0aGlzLl9pbml0Qm9keSA9IGZ1bmN0aW9uKGJvZHkpIHtcbiAgICAgIHRoaXMuX2JvZHlJbml0ID0gYm9keVxuICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5ibG9iICYmIEJsb2IucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUJsb2IgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuZm9ybURhdGEgJiYgRm9ybURhdGEucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgdGhpcy5fYm9keUZvcm1EYXRhID0gYm9keVxuICAgICAgfSBlbHNlIGlmICghYm9keSkge1xuICAgICAgICB0aGlzLl9ib2R5VGV4dCA9ICcnXG4gICAgICB9IGVsc2UgaWYgKHN1cHBvcnQuYXJyYXlCdWZmZXIgJiYgQXJyYXlCdWZmZXIucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoYm9keSkpIHtcbiAgICAgICAgLy8gT25seSBzdXBwb3J0IEFycmF5QnVmZmVycyBmb3IgUE9TVCBtZXRob2QuXG4gICAgICAgIC8vIFJlY2VpdmluZyBBcnJheUJ1ZmZlcnMgaGFwcGVucyB2aWEgQmxvYnMsIGluc3RlYWQuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Vuc3VwcG9ydGVkIEJvZHlJbml0IHR5cGUnKVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuaGVhZGVycy5nZXQoJ2NvbnRlbnQtdHlwZScpKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCAndGV4dC9wbGFpbjtjaGFyc2V0PVVURi04JylcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5QmxvYiAmJiB0aGlzLl9ib2R5QmxvYi50eXBlKSB7XG4gICAgICAgICAgdGhpcy5oZWFkZXJzLnNldCgnY29udGVudC10eXBlJywgdGhpcy5fYm9keUJsb2IudHlwZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzdXBwb3J0LmJsb2IpIHtcbiAgICAgIHRoaXMuYmxvYiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keUJsb2IpXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYm9keUZvcm1EYXRhKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb3VsZCBub3QgcmVhZCBGb3JtRGF0YSBib2R5IGFzIGJsb2InKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobmV3IEJsb2IoW3RoaXMuX2JvZHlUZXh0XSkpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5hcnJheUJ1ZmZlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9iKCkudGhlbihyZWFkQmxvYkFzQXJyYXlCdWZmZXIpXG4gICAgICB9XG5cbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICBpZiAocmVqZWN0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0ZWRcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9ib2R5QmxvYikge1xuICAgICAgICAgIHJldHVybiByZWFkQmxvYkFzVGV4dCh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgdGV4dCcpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHJlamVjdGVkID0gY29uc3VtZWQodGhpcylcbiAgICAgICAgcmV0dXJuIHJlamVjdGVkID8gcmVqZWN0ZWQgOiBQcm9taXNlLnJlc29sdmUodGhpcy5fYm9keVRleHQpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuZm9ybURhdGEpIHtcbiAgICAgIHRoaXMuZm9ybURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oZGVjb2RlKVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuanNvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudGV4dCgpLnRoZW4oSlNPTi5wYXJzZSlcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLy8gSFRUUCBtZXRob2RzIHdob3NlIGNhcGl0YWxpemF0aW9uIHNob3VsZCBiZSBub3JtYWxpemVkXG4gIHZhciBtZXRob2RzID0gWydERUxFVEUnLCAnR0VUJywgJ0hFQUQnLCAnT1BUSU9OUycsICdQT1NUJywgJ1BVVCddXG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTWV0aG9kKG1ldGhvZCkge1xuICAgIHZhciB1cGNhc2VkID0gbWV0aG9kLnRvVXBwZXJDYXNlKClcbiAgICByZXR1cm4gKG1ldGhvZHMuaW5kZXhPZih1cGNhc2VkKSA+IC0xKSA/IHVwY2FzZWQgOiBtZXRob2RcbiAgfVxuXG4gIGZ1bmN0aW9uIFJlcXVlc3QoaW5wdXQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICAgIHZhciBib2R5ID0gb3B0aW9ucy5ib2R5XG4gICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpKSB7XG4gICAgICBpZiAoaW5wdXQuYm9keVVzZWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQWxyZWFkeSByZWFkJylcbiAgICAgIH1cbiAgICAgIHRoaXMudXJsID0gaW5wdXQudXJsXG4gICAgICB0aGlzLmNyZWRlbnRpYWxzID0gaW5wdXQuY3JlZGVudGlhbHNcbiAgICAgIGlmICghb3B0aW9ucy5oZWFkZXJzKSB7XG4gICAgICAgIHRoaXMuaGVhZGVycyA9IG5ldyBIZWFkZXJzKGlucHV0LmhlYWRlcnMpXG4gICAgICB9XG4gICAgICB0aGlzLm1ldGhvZCA9IGlucHV0Lm1ldGhvZFxuICAgICAgdGhpcy5tb2RlID0gaW5wdXQubW9kZVxuICAgICAgaWYgKCFib2R5KSB7XG4gICAgICAgIGJvZHkgPSBpbnB1dC5fYm9keUluaXRcbiAgICAgICAgaW5wdXQuYm9keVVzZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudXJsID0gaW5wdXRcbiAgICB9XG5cbiAgICB0aGlzLmNyZWRlbnRpYWxzID0gb3B0aW9ucy5jcmVkZW50aWFscyB8fCB0aGlzLmNyZWRlbnRpYWxzIHx8ICdvbWl0J1xuICAgIGlmIChvcHRpb25zLmhlYWRlcnMgfHwgIXRoaXMuaGVhZGVycykge1xuICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIH1cbiAgICB0aGlzLm1ldGhvZCA9IG5vcm1hbGl6ZU1ldGhvZChvcHRpb25zLm1ldGhvZCB8fCB0aGlzLm1ldGhvZCB8fCAnR0VUJylcbiAgICB0aGlzLm1vZGUgPSBvcHRpb25zLm1vZGUgfHwgdGhpcy5tb2RlIHx8IG51bGxcbiAgICB0aGlzLnJlZmVycmVyID0gbnVsbFxuXG4gICAgaWYgKCh0aGlzLm1ldGhvZCA9PT0gJ0dFVCcgfHwgdGhpcy5tZXRob2QgPT09ICdIRUFEJykgJiYgYm9keSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQm9keSBub3QgYWxsb3dlZCBmb3IgR0VUIG9yIEhFQUQgcmVxdWVzdHMnKVxuICAgIH1cbiAgICB0aGlzLl9pbml0Qm9keShib2R5KVxuICB9XG5cbiAgUmVxdWVzdC5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QodGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZShib2R5KSB7XG4gICAgdmFyIGZvcm0gPSBuZXcgRm9ybURhdGEoKVxuICAgIGJvZHkudHJpbSgpLnNwbGl0KCcmJykuZm9yRWFjaChmdW5jdGlvbihieXRlcykge1xuICAgICAgaWYgKGJ5dGVzKSB7XG4gICAgICAgIHZhciBzcGxpdCA9IGJ5dGVzLnNwbGl0KCc9JylcbiAgICAgICAgdmFyIG5hbWUgPSBzcGxpdC5zaGlmdCgpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIHZhciB2YWx1ZSA9IHNwbGl0LmpvaW4oJz0nKS5yZXBsYWNlKC9cXCsvZywgJyAnKVxuICAgICAgICBmb3JtLmFwcGVuZChkZWNvZGVVUklDb21wb25lbnQobmFtZSksIGRlY29kZVVSSUNvbXBvbmVudCh2YWx1ZSkpXG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gZm9ybVxuICB9XG5cbiAgZnVuY3Rpb24gaGVhZGVycyh4aHIpIHtcbiAgICB2YXIgaGVhZCA9IG5ldyBIZWFkZXJzKClcbiAgICB2YXIgcGFpcnMgPSB4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkudHJpbSgpLnNwbGl0KCdcXG4nKVxuICAgIHBhaXJzLmZvckVhY2goZnVuY3Rpb24oaGVhZGVyKSB7XG4gICAgICB2YXIgc3BsaXQgPSBoZWFkZXIudHJpbSgpLnNwbGl0KCc6JylcbiAgICAgIHZhciBrZXkgPSBzcGxpdC5zaGlmdCgpLnRyaW0oKVxuICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignOicpLnRyaW0oKVxuICAgICAgaGVhZC5hcHBlbmQoa2V5LCB2YWx1ZSlcbiAgICB9KVxuICAgIHJldHVybiBoZWFkXG4gIH1cblxuICBCb2R5LmNhbGwoUmVxdWVzdC5wcm90b3R5cGUpXG5cbiAgZnVuY3Rpb24gUmVzcG9uc2UoYm9keUluaXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgIG9wdGlvbnMgPSB7fVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9ICdkZWZhdWx0J1xuICAgIHRoaXMuc3RhdHVzID0gb3B0aW9ucy5zdGF0dXNcbiAgICB0aGlzLm9rID0gdGhpcy5zdGF0dXMgPj0gMjAwICYmIHRoaXMuc3RhdHVzIDwgMzAwXG4gICAgdGhpcy5zdGF0dXNUZXh0ID0gb3B0aW9ucy5zdGF0dXNUZXh0XG4gICAgdGhpcy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIGluc3RhbmNlb2YgSGVhZGVycyA/IG9wdGlvbnMuaGVhZGVycyA6IG5ldyBIZWFkZXJzKG9wdGlvbnMuaGVhZGVycylcbiAgICB0aGlzLnVybCA9IG9wdGlvbnMudXJsIHx8ICcnXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gIH1cblxuICBCb2R5LmNhbGwoUmVzcG9uc2UucHJvdG90eXBlKVxuXG4gIFJlc3BvbnNlLnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVzcG9uc2UodGhpcy5fYm9keUluaXQsIHtcbiAgICAgIHN0YXR1czogdGhpcy5zdGF0dXMsXG4gICAgICBzdGF0dXNUZXh0OiB0aGlzLnN0YXR1c1RleHQsXG4gICAgICBoZWFkZXJzOiBuZXcgSGVhZGVycyh0aGlzLmhlYWRlcnMpLFxuICAgICAgdXJsOiB0aGlzLnVybFxuICAgIH0pXG4gIH1cblxuICBSZXNwb25zZS5lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXNwb25zZSA9IG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiAwLCBzdGF0dXNUZXh0OiAnJ30pXG4gICAgcmVzcG9uc2UudHlwZSA9ICdlcnJvcidcbiAgICByZXR1cm4gcmVzcG9uc2VcbiAgfVxuXG4gIHZhciByZWRpcmVjdFN0YXR1c2VzID0gWzMwMSwgMzAyLCAzMDMsIDMwNywgMzA4XVxuXG4gIFJlc3BvbnNlLnJlZGlyZWN0ID0gZnVuY3Rpb24odXJsLCBzdGF0dXMpIHtcbiAgICBpZiAocmVkaXJlY3RTdGF0dXNlcy5pbmRleE9mKHN0YXR1cykgPT09IC0xKSB7XG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCBzdGF0dXMgY29kZScpXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZShudWxsLCB7c3RhdHVzOiBzdGF0dXMsIGhlYWRlcnM6IHtsb2NhdGlvbjogdXJsfX0pXG4gIH1cblxuICBzZWxmLkhlYWRlcnMgPSBIZWFkZXJzO1xuICBzZWxmLlJlcXVlc3QgPSBSZXF1ZXN0O1xuICBzZWxmLlJlc3BvbnNlID0gUmVzcG9uc2U7XG5cbiAgc2VsZi5mZXRjaCA9IGZ1bmN0aW9uKGlucHV0LCBpbml0KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgdmFyIHJlcXVlc3RcbiAgICAgIGlmIChSZXF1ZXN0LnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGlucHV0KSAmJiAhaW5pdCkge1xuICAgICAgICByZXF1ZXN0ID0gaW5wdXRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcXVlc3QgPSBuZXcgUmVxdWVzdChpbnB1dCwgaW5pdClcbiAgICAgIH1cblxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpXG5cbiAgICAgIGZ1bmN0aW9uIHJlc3BvbnNlVVJMKCkge1xuICAgICAgICBpZiAoJ3Jlc3BvbnNlVVJMJyBpbiB4aHIpIHtcbiAgICAgICAgICByZXR1cm4geGhyLnJlc3BvbnNlVVJMXG4gICAgICAgIH1cblxuICAgICAgICAvLyBBdm9pZCBzZWN1cml0eSB3YXJuaW5ncyBvbiBnZXRSZXNwb25zZUhlYWRlciB3aGVuIG5vdCBhbGxvd2VkIGJ5IENPUlNcbiAgICAgICAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICAgICAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJylcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgc3RhdHVzID0gKHhoci5zdGF0dXMgPT09IDEyMjMpID8gMjA0IDogeGhyLnN0YXR1c1xuICAgICAgICBpZiAoc3RhdHVzIDwgMTAwIHx8IHN0YXR1cyA+IDU5OSkge1xuICAgICAgICAgIHJlamVjdChuZXcgVHlwZUVycm9yKCdOZXR3b3JrIHJlcXVlc3QgZmFpbGVkJykpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgc3RhdHVzOiBzdGF0dXMsXG4gICAgICAgICAgc3RhdHVzVGV4dDogeGhyLnN0YXR1c1RleHQsXG4gICAgICAgICAgaGVhZGVyczogaGVhZGVycyh4aHIpLFxuICAgICAgICAgIHVybDogcmVzcG9uc2VVUkwoKVxuICAgICAgICB9XG4gICAgICAgIHZhciBib2R5ID0gJ3Jlc3BvbnNlJyBpbiB4aHIgPyB4aHIucmVzcG9uc2UgOiB4aHIucmVzcG9uc2VUZXh0O1xuICAgICAgICByZXNvbHZlKG5ldyBSZXNwb25zZShib2R5LCBvcHRpb25zKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgIH1cblxuICAgICAgeGhyLm9wZW4ocmVxdWVzdC5tZXRob2QsIHJlcXVlc3QudXJsLCB0cnVlKVxuXG4gICAgICBpZiAocmVxdWVzdC5jcmVkZW50aWFscyA9PT0gJ2luY2x1ZGUnKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlXG4gICAgICB9XG5cbiAgICAgIGlmICgncmVzcG9uc2VUeXBlJyBpbiB4aHIgJiYgc3VwcG9ydC5ibG9iKSB7XG4gICAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYmxvYidcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5oZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpXG4gICAgICB9KVxuXG4gICAgICB4aHIuc2VuZCh0eXBlb2YgcmVxdWVzdC5fYm9keUluaXQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHJlcXVlc3QuX2JvZHlJbml0KVxuICAgIH0pXG4gIH1cbiAgc2VsZi5mZXRjaC5wb2x5ZmlsbCA9IHRydWVcbn0pKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB0aGlzKTtcbiIsIi8vIGV4cG9ydCBjb25zdCBBRERfTUlESV9OT1RFUyA9ICdhZGRfbWlkaV9ub3Rlcydcbi8vIGV4cG9ydCBjb25zdCBDUkVBVEVfTUlESV9OT1RFID0gJ2NyZWF0ZV9taWRpX25vdGUnXG4vLyBleHBvcnQgY29uc3QgQUREX0VWRU5UU19UT19TT05HID0gJ2FkZF9ldmVudHNfdG9fc29uZydcbi8vIGV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFNfVE9fU09ORyA9ICdhZGRfbWlkaV9ldmVudHNfdG9fc29uZydcbi8vIGV4cG9ydCBjb25zdCBBRERfVFJBQ0sgPSAnYWRkX3RyYWNrJ1xuLy8gZXhwb3J0IGNvbnN0IEFERF9QQVJUID0gJ2FkZF9wYXJ0J1xuLy8gZXhwb3J0IGNvbnN0IFVQREFURV9NSURJX05PVEUgPSAndXBkYXRlX21pZGlfbm90ZSdcblxuXG4vLyB0cmFjayBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX1RSQUNLID0gJ2NyZWF0ZV90cmFjaydcbmV4cG9ydCBjb25zdCBBRERfUEFSVFMgPSAnYWRkX3BhcnRzJ1xuZXhwb3J0IGNvbnN0IFNFVF9JTlNUUlVNRU5UID0gJ3NldF9pbnN0cnVtZW50J1xuZXhwb3J0IGNvbnN0IFNFVF9NSURJX09VVFBVVF9JRFMgPSAnc2V0X21pZGlfb3V0cHV0X2lkcydcblxuXG4vLyBzb25nIGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfU09ORyA9ICdjcmVhdGVfc29uZydcbmV4cG9ydCBjb25zdCBBRERfVFJBQ0tTID0gJ2FkZF90cmFja3MnXG5leHBvcnQgY29uc3QgQUREX1RJTUVfRVZFTlRTID0gJ2FkZF90aW1lX2V2ZW50cydcbmV4cG9ydCBjb25zdCBVUERBVEVfU09ORyA9ICd1cGRhdGVfc29uZydcbmV4cG9ydCBjb25zdCBBRERfTUlESV9FVkVOVFMgPSAnYWRkX21pZGlfZXZlbnRzJ1xuXG5cbi8vIHBhcnQgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IENSRUFURV9QQVJUID0gJ2NyZWF0ZV9wYXJ0J1xuXG5cbi8vIG1pZGlldmVudCBhY3Rpb25zXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfRVZFTlQgPSAnY3JlYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfRVZFTlQgPSAndXBkYXRlX21pZGlfZXZlbnQnXG5cblxuLy8gc2VxdWVuY2VyIGFjdGlvbnNcbmV4cG9ydCBjb25zdCBTT05HX1BPU0lUSU9OID0gJ3NvbmdfcG9zaXRpb24nXG5leHBvcnQgY29uc3QgUExBWV9TT05HID0gJ3BsYXlfc29uZydcbmV4cG9ydCBjb25zdCBQQVVTRV9TT05HID0gJ3BhdXNlX3NvbmcnXG5leHBvcnQgY29uc3QgU1RPUF9TT05HID0gJ3N0b3Bfc29uZydcbmV4cG9ydCBjb25zdCBTVEFSVF9TQ0hFRFVMRVIgPSAnU1RBUlRfU0NIRURVTEVSJ1xuZXhwb3J0IGNvbnN0IFNUT1BfU0NIRURVTEVSID0gJ1NUT1BfU0NIRURVTEVSJ1xuXG5cbi8vIGluc3RydW1lbnQgYWN0aW9uc1xuZXhwb3J0IGNvbnN0IFNUT1JFX1NBTVBMRVMgPSAnc3RvcmVfc2FtcGxlcydcblxuXG4iLCJpbXBvcnQge2NyZWF0ZVN0b3JlLCBhcHBseU1pZGRsZXdhcmUsIGNvbXBvc2V9IGZyb20gJ3JlZHV4J1xuLy9pbXBvcnQgdGh1bmsgZnJvbSAncmVkdXgtdGh1bmsnO1xuLy9pbXBvcnQgY3JlYXRlTG9nZ2VyIGZyb20gJ3JlZHV4LWxvZ2dlcic7XG5pbXBvcnQgc2VxdWVuY2VyQXBwIGZyb20gJy4vcmVkdWNlcidcblxuZXhwb3J0IGNvbnN0IHRlc3QgPSAoZnVuY3Rpb24oKXtcbiAgLy9jb25zb2xlLmxvZygncnVuIG9uY2UnKVxuICByZXR1cm4gJ3Rlc3QnXG59KCkpXG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwKTtcblxuLypcbi8vIGRvbid0IHVzZSB0aGUgcmVkdXggZGV2IHRvb2wgYmVjYXVzZSBpdCB1c2UgdG9vIG11Y2ggQ1BVIGFuZCBtZW1vcnkhXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKTtcbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwLCB7fSwgY29tcG9zZShcbiAgYXBwbHlNaWRkbGV3YXJlKGxvZ2dlciksXG4gIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24gIT09ICd1bmRlZmluZWQnID8gd2luZG93LmRldlRvb2xzRXh0ZW5zaW9uKCkgOiBmID0+IGZcbikpO1xuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0b3JlKCl7XG4gIC8vY29uc29sZS5sb2coJ2dldFN0b3JlKCkgY2FsbGVkJylcbiAgcmV0dXJuIHN0b3JlXG59XG5cblxuIiwiXG5pbXBvcnQge3JlcXVlc3RBbmltYXRpb25GcmFtZX0gZnJvbSAnLi9pbml0JztcbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJztcblxuXG5sZXQgdGltZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCByZXBldGl0aXZlVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgc2NoZWR1bGVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgdGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgbGFzdFRpbWVTdGFtcDtcblxuZnVuY3Rpb24gaGVhcnRiZWF0KHRpbWVzdGFtcCl7XG4gIGxldCBub3cgPSBjb250ZXh0LmN1cnJlbnRUaW1lO1xuXG4gIC8vIGZvciBpbnN0YW5jZTogdGhlIGNhbGxiYWNrIG9mIHNhbXBsZS51bnNjaGVkdWxlO1xuICBmb3IobGV0IFtrZXksIHRhc2tdIG9mIHRpbWVkVGFza3Mpe1xuICAgIGlmKHRhc2sudGltZSA+PSBub3cpe1xuICAgICAgdGFzay5leGVjdXRlKG5vdyk7XG4gICAgICB0aW1lZFRhc2tzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnVwZGF0ZSgpO1xuICBmb3IobGV0IHRhc2sgb2Ygc2NoZWR1bGVkVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIC8vIGZvciBpbnN0YW5jZTogc29uZy5wdWxzZSgpO1xuICBmb3IobGV0IHRhc2sgb2YgcmVwZXRpdGl2ZVRhc2tzLnZhbHVlcygpKXtcbiAgICB0YXNrKG5vdyk7XG4gIH1cblxuICBsYXN0VGltZVN0YW1wID0gdGltZXN0YW1wO1xuICBzY2hlZHVsZWRUYXNrcy5jbGVhcigpO1xuXG4gIC8vc2V0VGltZW91dChoZWFydGJlYXQsIDEwMDAwKTtcbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhlYXJ0YmVhdCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRhc2sodHlwZSwgaWQsIHRhc2spe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuc2V0KGlkLCB0YXNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVRhc2sodHlwZSwgaWQpe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuZGVsZXRlKGlkKTtcbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCl7XG4gIHRhc2tzLnNldCgndGltZWQnLCB0aW1lZFRhc2tzKTtcbiAgdGFza3Muc2V0KCdyZXBldGl0aXZlJywgcmVwZXRpdGl2ZVRhc2tzKTtcbiAgdGFza3Muc2V0KCdzY2hlZHVsZWQnLCBzY2hlZHVsZWRUYXNrcyk7XG4gIGhlYXJ0YmVhdCgpO1xufSgpKVxuIiwiaW1wb3J0IHtpbml0QXVkaW99IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCB7aW5pdE1JREl9IGZyb20gJy4vaW5pdF9taWRpJ1xuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge1NUT1JFX1NBTVBMRVN9IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcblxuZXhwb3J0IGxldCBnZXRVc2VyTWVkaWEgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLndlYmtpdEdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3IubW96R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignZ2V0VXNlck1lZGlhIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSAoKCkgPT4ge1xuICBpZih0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyl7XG4gICAgcmV0dXJuIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93LndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybigncmVxdWVzdEFuaW1hdGlvbkZyYW1lIGlzIG5vdCBhdmFpbGFibGUnKVxuICB9XG59KSgpXG5cblxuZXhwb3J0IGxldCBCbG9iID0gKCgpID0+IHtcbiAgaWYodHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB3aW5kb3cuQmxvYiB8fCB3aW5kb3cud2Via2l0QmxvYlxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpe1xuICAgIGNvbnNvbGUud2FybignQmxvYiBpcyBub3QgYXZhaWxhYmxlJylcbiAgfVxufSkoKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0KCk6IHZvaWR7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICBQcm9taXNlLmFsbChbaW5pdEF1ZGlvKCksIGluaXRNSURJKCldKVxuICAgIC50aGVuKFxuICAgIChkYXRhKSA9PiB7XG4gICAgICAvLyBwYXJzZUF1ZGlvXG4gICAgICBsZXQgZGF0YUF1ZGlvID0gZGF0YVswXVxuXG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNUT1JFX1NBTVBMRVMsXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBsb3dUaWNrOiBkYXRhQXVkaW8ubG93dGljayxcbiAgICAgICAgICBoaWdoVGljazogZGF0YUF1ZGlvLmhpZ2h0aWNrLFxuICAgICAgICB9XG4gICAgICB9KVxuXG4gICAgICAvLyBwYXJzZU1JRElcbiAgICAgIGxldCBkYXRhTWlkaSA9IGRhdGFbMV1cblxuICAgICAgcmVzb2x2ZSh7XG4gICAgICAgIGxlZ2FjeTogZGF0YUF1ZGlvLmxlZ2FjeSxcbiAgICAgICAgbXAzOiBkYXRhQXVkaW8ubXAzLFxuICAgICAgICBvZ2c6IGRhdGFBdWRpby5vZ2csXG4gICAgICAgIG1pZGk6IGRhdGFNaWRpLm1pZGksXG4gICAgICAgIHdlYm1pZGk6IGRhdGFNaWRpLndlYm1pZGksXG4gICAgICB9KVxuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgfSlcbiAgfSlcbn1cbiIsIi8qXG4gIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuKi9cblxuaW1wb3J0IHNhbXBsZXMgZnJvbSAnLi9zYW1wbGVzJ1xuaW1wb3J0IHtwYXJzZVNhbXBsZXN9IGZyb20gJy4vdXRpbCdcblxubGV0XG4gIG1hc3RlckdhaW4sXG4gIGNvbXByZXNzb3IsXG4gIGluaXRpYWxpemVkID0gZmFsc2VcblxuZXhwb3J0IGxldCBjb250ZXh0ID0gKGZ1bmN0aW9uKCl7XG4gIGNvbnNvbGUubG9nKCdpbml0IEF1ZGlvQ29udGV4dCcpXG4gIGxldCBjdHhcbiAgaWYodHlwZW9mIHdpbmRvdyA9PT0gJ29iamVjdCcpe1xuICAgIGxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHRcbiAgICBpZihBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgIGN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKVxuICAgIH1cbiAgfVxuICBpZih0eXBlb2YgY3R4ID09PSAndW5kZWZpbmVkJyl7XG4gICAgLy9AVE9ETzogY3JlYXRlIGR1bW15IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUsIHNlZTogaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvYXVkaW8tY29udGV4dFxuICAgIGNvbnRleHQgPSB7XG4gICAgICBjcmVhdGVHYWluOiBmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGdhaW46IDFcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZU9zY2lsbGF0b3I6IGZ1bmN0aW9uKCl7fSxcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGN0eFxufSgpKVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0QXVkaW8oKXtcblxuICBpZih0eXBlb2YgY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW5cbiAgfVxuICAvLyBjaGVjayBmb3Igb2xkZXIgaW1wbGVtZW50YXRpb25zIG9mIFdlYkF1ZGlvXG4gIGxldCBkYXRhID0ge31cbiAgbGV0IHNvdXJjZSA9IGNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKClcbiAgZGF0YS5sZWdhY3kgPSBmYWxzZVxuICBpZih0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgZGF0YS5sZWdhY3kgPSB0cnVlXG4gIH1cblxuICAvLyBzZXQgdXAgdGhlIGVsZW1lbnRhcnkgYXVkaW8gbm9kZXNcbiAgY29tcHJlc3NvciA9IGNvbnRleHQuY3JlYXRlRHluYW1pY3NDb21wcmVzc29yKClcbiAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4gPSBjb250ZXh0LmNyZWF0ZUdhaW5Ob2RlKClcbiAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pXG4gIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDAuNVxuICBpbml0aWFsaXplZCA9IHRydWVcblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgcGFyc2VTYW1wbGVzKHNhbXBsZXMpLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKVxuICAgICAgICBkYXRhLm9nZyA9IGJ1ZmZlcnMuZW1wdHlPZ2cgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLm1wMyA9IGJ1ZmZlcnMuZW1wdHlNcDMgIT09IHVuZGVmaW5lZFxuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2tcbiAgICAgICAgZGF0YS5oaWdodGljayA9IGJ1ZmZlcnMuaGlnaHRpY2tcbiAgICAgICAgaWYoZGF0YS5vZ2cgPT09IGZhbHNlICYmIGRhdGEubXAzID09PSBmYWxzZSl7XG4gICAgICAgICAgcmVqZWN0KCdObyBzdXBwb3J0IGZvciBvZ2cgbm9yIG1wMyEnKVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgaW5pdGlhbGl6aW5nIEF1ZGlvJylcbiAgICAgIH1cbiAgICApXG4gIH0pXG59XG5cblxubGV0IHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpOiB2b2lke1xuICBpZihpbml0aWFsaXplZCA9PT0gZmFsc2Upe1xuICAgIGNvbnNvbGUud2FybigncGxlYXNlIGNhbGwgcWFtYmkuaW5pdCgpIGZpcnN0JylcbiAgfWVsc2Uge1xuICAgIHNldE1hc3RlclZvbHVtZSA9IGZ1bmN0aW9uKHZhbHVlOiBudW1iZXIgPSAwLjUpe1xuICAgICAgaWYodmFsdWUgPiAxKXtcbiAgICAgICAgY29uc29sZS5pbmZvKCdtYXhpbWFsIHZvbHVtZSBpcyAxLjAsIHZvbHVtZSBpcyBzZXQgdG8gMS4wJyk7XG4gICAgICB9XG4gICAgICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWVcbiAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZhbHVlO1xuICAgIH1cbiAgICBzZXRNYXN0ZXJWb2x1bWUodmFsdWUpXG4gIH1cbn1cblxuXG5sZXQgZ2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24oKTogdm9pZHtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TWFzdGVyVm9sdW1lKClcbiAgfVxufVxuXG5cbmxldCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0Q29tcHJlc3Npb25SZWR1Y3Rpb24gPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGNvbXByZXNzb3IucmVkdWN0aW9uLnZhbHVlXG4gICAgfVxuICAgIHJldHVybiBnZXRDb21wcmVzc2lvblJlZHVjdGlvbigpXG4gIH1cbn1cblxuXG5sZXQgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKCk6IHZvaWR7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGZsYWc6IGJvb2xlYW4pe1xuICAgICAgaWYoZmxhZyl7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbXByZXNzb3IpO1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgIG1hc3RlckdhaW4uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgbWFzdGVyR2Fpbi5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgICAgfVxuICAgIH1cbiAgICBlbmFibGVNYXN0ZXJDb21wcmVzc29yKClcbiAgfVxufVxuXG5cbmxldCBjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oY2ZnKTogdm9pZHtcbiAgLypcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBhdHRhY2s7IC8vIGluIFNlY29uZHNcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHJhdGlvOyAvLyB1bml0LWxlc3NcbiAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWR1Y3Rpb247IC8vIGluIERlY2liZWxzXG4gICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVsZWFzZTsgLy8gaW4gU2Vjb25kc1xuICAgIHJlYWRvbmx5IGF0dHJpYnV0ZSBBdWRpb1BhcmFtIHRocmVzaG9sZDsgLy8gaW4gRGVjaWJlbHNcblxuICAgIEBzZWU6IGh0dHA6Ly93ZWJhdWRpby5naXRodWIuaW8vd2ViLWF1ZGlvLWFwaS8jdGhlLWR5bmFtaWNzY29tcHJlc3Nvcm5vZGUtaW50ZXJmYWNlXG4gICovXG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZzoge30pe1xuICAgICAgKHtcbiAgICAgICAgYXR0YWNrOiBjb21wcmVzc29yLmF0dGFjayA9IDAuMDAzLFxuICAgICAgICBrbmVlOiBjb21wcmVzc29yLmtuZWUgPSAzMCxcbiAgICAgICAgcmF0aW86IGNvbXByZXNzb3IucmF0aW8gPSAxMixcbiAgICAgICAgcmVkdWN0aW9uOiBjb21wcmVzc29yLnJlZHVjdGlvbiA9IDAsXG4gICAgICAgIHJlbGVhc2U6IGNvbXByZXNzb3IucmVsZWFzZSA9IDAuMjUwLFxuICAgICAgICB0aHJlc2hvbGQ6IGNvbXByZXNzb3IudGhyZXNob2xkID0gLTI0LFxuICAgICAgfSA9IGNmZylcbiAgICB9XG4gICAgY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvcihjZmcpXG4gIH1cbn1cblxuZXhwb3J0IHttYXN0ZXJHYWluLCBjb21wcmVzc29yIGFzIG1hc3RlckNvbXByZXNzb3IsIHNldE1hc3RlclZvbHVtZSwgZ2V0TWFzdGVyVm9sdW1lLCBnZXRDb21wcmVzc2lvblJlZHVjdGlvbiwgZW5hYmxlTWFzdGVyQ29tcHJlc3NvciwgY29uZmlndXJlTWFzdGVyQ29tcHJlc3Nvcn1cbiIsIi8qXG4gIFJlcXVlc3RzIE1JREkgYWNjZXNzLCBxdWVyaWVzIGFsbCBpbnB1dHMgYW5kIG91dHB1dHMgYW5kIHN0b3JlcyB0aGVtIGluIGFscGhhYmV0aWNhbCBvcmRlclxuKi9cblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnXG5cblxubGV0IE1JRElBY2Nlc3NcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlXG5sZXQgaW5wdXRzID0gW11cbmxldCBvdXRwdXRzID0gW11cbmxldCBpbnB1dElkcyA9IFtdXG5sZXQgb3V0cHV0SWRzID0gW11cbmxldCBpbnB1dHNCeUlkID0gbmV3IE1hcCgpXG5sZXQgb3V0cHV0c0J5SWQgPSBuZXcgTWFwKClcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lclxubGV0IG1pZGlFdmVudExpc3RlbmVySWQgPSAwXG5cblxuZnVuY3Rpb24gZ2V0TUlESXBvcnRzKCl7XG4gIGlucHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5pbnB1dHMudmFsdWVzKCkpXG5cbiAgLy9zb3J0IHBvcnRzIGJ5IG5hbWUgYXNjZW5kaW5nXG4gIGlucHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSk7XG5cbiAgZm9yKGxldCBwb3J0IG9mIGlucHV0cyl7XG4gICAgaW5wdXRzQnlJZC5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgaW5wdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG5cbiAgb3V0cHV0cyA9IEFycmF5LmZyb20oTUlESUFjY2Vzcy5vdXRwdXRzLnZhbHVlcygpKTtcblxuICAvL3NvcnQgcG9ydHMgYnkgbmFtZSBhc2NlbmRpbmdcbiAgb3V0cHV0cy5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSk7XG5cbiAgZm9yKGxldCBwb3J0IG9mIG91dHB1dHMpe1xuICAgIG91dHB1dHNCeUlkLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgICBvdXRwdXRJZHMucHVzaChwb3J0LmlkKVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNSURJKCl7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG5cbiAgICBpZih0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWVcbiAgICAgIHJlc29sdmUoe21pZGk6IGZhbHNlfSlcbiAgICB9ZWxzZSBpZih0eXBlb2YgbmF2aWdhdG9yLnJlcXVlc3RNSURJQWNjZXNzICE9PSAndW5kZWZpbmVkJyl7XG5cbiAgICAgIGxldCBqYXp6LCBtaWRpLCB3ZWJtaWRpXG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaUFjY2Vzcyl7XG4gICAgICAgICAgTUlESUFjY2VzcyA9IG1pZGlBY2Nlc3NcbiAgICAgICAgICBpZih0eXBlb2YgbWlkaUFjY2Vzcy5famF6ekluc3RhbmNlcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgamF6eiA9IG1pZGlBY2Nlc3MuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvblxuICAgICAgICAgICAgbWlkaSA9IHRydWVcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHdlYm1pZGkgPSB0cnVlXG4gICAgICAgICAgICBtaWRpID0gdHJ1ZVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGdldE1JRElwb3J0cygpXG5cbiAgICAgICAgICAvLyBvbmNvbm5lY3QgYW5kIG9uZGlzY29ubmVjdCBhcmUgbm90IHlldCBpbXBsZW1lbnRlZCBpbiBDaHJvbWUgYW5kIENocm9taXVtXG4gICAgICAgICAgbWlkaUFjY2Vzcy5hZGRFdmVudExpc3RlbmVyKCdvbmNvbm5lY3QnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgbWlkaUFjY2Vzcy5hZGRFdmVudExpc3RlbmVyKCdvbmRpc2Nvbm5lY3QnLCBmdW5jdGlvbihlKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSlcbiAgICAgICAgICAgIGdldE1JRElwb3J0cygpXG4gICAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlXG4gICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICBqYXp6LFxuICAgICAgICAgICAgbWlkaSxcbiAgICAgICAgICAgIHdlYm1pZGksXG4gICAgICAgICAgICBpbnB1dHMsXG4gICAgICAgICAgICBvdXRwdXRzLFxuICAgICAgICAgICAgaW5wdXRzQnlJZCxcbiAgICAgICAgICAgIG91dHB1dHNCeUlkLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0KGUpe1xuICAgICAgICAgIC8vY29uc29sZS5sb2coZSk7XG4gICAgICAgICAgcmVqZWN0KCdTb21ldGhpbmcgd2VudCB3cm9uZyB3aGlsZSByZXF1ZXN0aW5nIE1JRElBY2Nlc3MnLCBlKVxuICAgICAgICB9XG4gICAgICApO1xuICAgIC8vIGJyb3dzZXJzIHdpdGhvdXQgV2ViTUlESSBBUElcbiAgICB9ZWxzZXtcbiAgICAgIGluaXRpYWxpemVkID0gdHJ1ZVxuICAgICAgcmVzb2x2ZSh7bWlkaTogZmFsc2V9KVxuICAgIH1cbiAgfSk7XG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJQWNjZXNzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBNSURJQWNjZXNzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJQWNjZXNzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG5leHBvcnQgbGV0IGdldE1JRElPdXRwdXRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c1xuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0cyA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gaW5wdXRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRzKClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuZXhwb3J0IGxldCBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBvdXRwdXRJZHNcbiAgICB9XG4gICAgcmV0dXJuIGdldE1JRElPdXRwdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESUlucHV0SWRzID0gZnVuY3Rpb24oKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJSW5wdXRJZHMgPSBmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGlucHV0SWRzXG4gICAgfVxuICAgIHJldHVybiBnZXRNSURJSW5wdXRJZHMoKVxuICB9XG4gIHJldHVybiBmYWxzZVxufVxuXG5cbmV4cG9ydCBsZXQgZ2V0TUlESU91dHB1dEJ5SWQgPSBmdW5jdGlvbihpZDogc3RyaW5nKXtcbiAgaWYoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oJ3BsZWFzZSBjYWxsIHFhbWJpLmluaXQoKSBmaXJzdCcpXG4gIH1lbHNlIHtcbiAgICBnZXRNSURJT3V0cHV0QnlJZCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KGlkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESU91dHB1dEJ5SWQoaWQpXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cblxuZXhwb3J0IGxldCBnZXRNSURJSW5wdXRCeUlkID0gZnVuY3Rpb24oaWQ6IHN0cmluZyl7XG4gIGlmKGluaXRpYWxpemVkID09PSBmYWxzZSl7XG4gICAgY29uc29sZS53YXJuKCdwbGVhc2UgY2FsbCBxYW1iaS5pbml0KCkgZmlyc3QnKVxuICB9ZWxzZSB7XG4gICAgZ2V0TUlESUlucHV0QnlJZCA9IGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gb3V0cHV0c0J5SWQuZ2V0KGlkKVxuICAgIH1cbiAgICByZXR1cm4gZ2V0TUlESUlucHV0QnlJZChpZClcbiAgfVxuICByZXR1cm4gZmFsc2Vcbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaWRpU29uZyhzb25nKXtcblxuICBzb25nTWlkaUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihlKXtcbiAgICAvL2NvbnNvbGUubG9nKGUpO1xuICAgIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBlLCB0aGlzKTtcbiAgfTtcblxuICAvLyBieSBkZWZhdWx0IGEgc29uZyBsaXN0ZW5zIHRvIGFsbCBhdmFpbGFibGUgbWlkaS1pbiBwb3J0c1xuICBpbnB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBwb3J0LmFkZEV2ZW50TGlzdGVuZXIoJ21pZGltZXNzYWdlJywgc29uZ01pZGlFdmVudExpc3RlbmVyKTtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICB9KTtcblxuICBvdXRwdXRzLmZvckVhY2goZnVuY3Rpb24ocG9ydCl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNaWRpSW5wdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IGlucHV0ID0gaW5wdXRzLmdldChpZCk7XG5cbiAgaWYoaW5wdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBpbnB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlJbnB1dHMuZGVsZXRlKGlkKTtcbiAgICBpbnB1dC5yZW1vdmVFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1lbHNle1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQoaWQsIGlucHV0KTtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKCdtaWRpbWVzc2FnZScsIHNvbmdNaWRpRXZlbnRMaXN0ZW5lcik7XG4gIH1cblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICB0cmFjay5zZXRNaWRpSW5wdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaU91dHB1dFNvbmcoc29uZywgaWQsIGZsYWcpe1xuICBsZXQgb3V0cHV0ID0gb3V0cHV0cy5nZXQoaWQpO1xuXG4gIGlmKG91dHB1dCA9PT0gdW5kZWZpbmVkKXtcbiAgICB3YXJuKCdubyBtaWRpIG91dHB1dCB3aXRoIGlkJywgaWQsICdmb3VuZCcpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmKGZsYWcgPT09IGZhbHNlKXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLmRlbGV0ZShpZCk7XG4gICAgbGV0IHRpbWUgPSBzb25nLnNjaGVkdWxlci5sYXN0RXZlbnRUaW1lICsgMTAwO1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDdCLCAweDAwXSwgdGltZSk7IC8vIHN0b3AgYWxsIG5vdGVzXG4gICAgb3V0cHV0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aW1lKTsgLy8gcmVzZXQgYWxsIGNvbnRyb2xsZXJzXG4gIH1lbHNle1xuICAgIHNvbmcubWlkaU91dHB1dHMuc2V0KGlkLCBvdXRwdXQpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaU91dHB1dChpZCwgZmxhZyk7XG4gIH1cbn1cblxuXG5cbmZ1bmN0aW9uIGhhbmRsZU1pZGlNZXNzYWdlU29uZyhzb25nLCBtaWRpTWVzc2FnZUV2ZW50LCBpbnB1dCl7XG4gIGxldCBtaWRpRXZlbnQgPSBuZXcgTWlkaUV2ZW50KHNvbmcudGlja3MsIC4uLm1pZGlNZXNzYWdlRXZlbnQuZGF0YSk7XG5cbiAgLy9jb25zb2xlLmxvZyhtaWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIC8vY29uc29sZS5sb2codHJhY2subWlkaUlucHV0cywgaW5wdXQpO1xuXG5cbiAgICAvL2lmKG1pZGlFdmVudC5jaGFubmVsID09PSB0cmFjay5jaGFubmVsIHx8IHRyYWNrLmNoYW5uZWwgPT09IDAgfHwgdHJhY2suY2hhbm5lbCA9PT0gJ2FueScpe1xuICAgIC8vICBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKG1pZGlFdmVudCwgdHJhY2spO1xuICAgIC8vfVxuXG5cbiAgICAvLyBsaWtlIGluIEN1YmFzZSwgbWlkaSBldmVudHMgZnJvbSBhbGwgZGV2aWNlcywgc2VudCBvbiBhbnkgbWlkaSBjaGFubmVsIGFyZSBmb3J3YXJkZWQgdG8gYWxsIHRyYWNrc1xuICAgIC8vIHNldCB0cmFjay5tb25pdG9yIHRvIGZhbHNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHJlY2VpdmUgbWlkaSBldmVudHMgb24gYSBjZXJ0YWluIHRyYWNrXG4gICAgLy8gbm90ZSB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYnkgZGVmYXVsdCBzZXQgdG8gZmFsc2UgYW5kIHRoYXQgdHJhY2subW9uaXRvciBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlXG4gICAgLy8gaWYgeW91IGFyZSByZWNvcmRpbmcgb24gdGhhdCB0cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2subW9uaXRvciwgdHJhY2suaWQsIGlucHV0LmlkKTtcbiAgICBpZih0cmFjay5tb25pdG9yID09PSB0cnVlICYmIHRyYWNrLm1pZGlJbnB1dHMuZ2V0KGlucHV0LmlkKSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjaywgaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBsaXN0ZW5lcnMgPSBzb25nLm1pZGlFdmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50LnR5cGUpO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yKGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfVxuICB9XG59XG5cblxuZnVuY3Rpb24gaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayh0cmFjaywgbWlkaUV2ZW50LCBpbnB1dCl7XG4gIGxldCBzb25nID0gdHJhY2suc29uZyxcbiAgICBub3RlLCBsaXN0ZW5lcnMsIGNoYW5uZWw7XG4gICAgLy9kYXRhID0gbWlkaU1lc3NhZ2VFdmVudC5kYXRhLFxuICAgIC8vbWlkaUV2ZW50ID0gY3JlYXRlTWlkaUV2ZW50KHNvbmcudGlja3MsIGRhdGFbMF0sIGRhdGFbMV0sIGRhdGFbMl0pO1xuXG4gIC8vbWlkaUV2ZW50LnNvdXJjZSA9IG1pZGlNZXNzYWdlRXZlbnQuc3JjRWxlbWVudC5uYW1lO1xuICAvL2NvbnNvbGUubG9nKG1pZGlNZXNzYWdlRXZlbnQpXG4gIC8vY29uc29sZS5sb2coJy0tLS0+JywgbWlkaUV2ZW50LnR5cGUpO1xuXG4gIC8vIGFkZCB0aGUgZXhhY3QgdGltZSBvZiB0aGlzIGV2ZW50IHNvIHdlIGNhbiBjYWxjdWxhdGUgaXRzIHRpY2tzIHBvc2l0aW9uXG4gIG1pZGlFdmVudC5yZWNvcmRNaWxsaXMgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMDsgLy8gbWlsbGlzXG4gIG1pZGlFdmVudC5zdGF0ZSA9ICdyZWNvcmRlZCc7XG5cbiAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgbm90ZSA9IGNyZWF0ZU1pZGlOb3RlKG1pZGlFdmVudCk7XG4gICAgdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXSA9IG5vdGU7XG4gICAgLy90cmFjay5zb25nLnJlY29yZGluZ05vdGVzW25vdGUuaWRdID0gbm90ZTtcbiAgfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgbm90ZSA9IHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy8gY2hlY2sgaWYgdGhlIG5vdGUgZXhpc3RzOiBpZiB0aGUgdXNlciBwbGF5cyBub3RlcyBvbiBoZXIga2V5Ym9hcmQgYmVmb3JlIHRoZSBtaWRpIHN5c3RlbSBoYXNcbiAgICAvLyBiZWVuIGZ1bGx5IGluaXRpYWxpemVkLCBpdCBjYW4gaGFwcGVuIHRoYXQgdGhlIGZpcnN0IGluY29taW5nIG1pZGkgZXZlbnQgaXMgYSBOT1RFIE9GRiBldmVudFxuICAgIGlmKG5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIG5vdGUuYWRkTm90ZU9mZihtaWRpRXZlbnQpO1xuICAgIGRlbGV0ZSB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdO1xuICAgIC8vZGVsZXRlIHRyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF07XG4gIH1cblxuICAvL2NvbnNvbGUubG9nKHNvbmcucHJlcm9sbCwgc29uZy5yZWNvcmRpbmcsIHRyYWNrLnJlY29yZEVuYWJsZWQpO1xuXG4gIGlmKChzb25nLnByZXJvbGxpbmcgfHwgc29uZy5yZWNvcmRpbmcpICYmIHRyYWNrLnJlY29yZEVuYWJsZWQgPT09ICdtaWRpJyl7XG4gICAgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICB0cmFjay5zb25nLnJlY29yZGVkTm90ZXMucHVzaChub3RlKTtcbiAgICB9XG4gICAgdHJhY2sucmVjb3JkUGFydC5hZGRFdmVudChtaWRpRXZlbnQpO1xuICAgIC8vIHNvbmcucmVjb3JkZWRFdmVudHMgaXMgdXNlZCBpbiB0aGUga2V5IGVkaXRvclxuICAgIHRyYWNrLnNvbmcucmVjb3JkZWRFdmVudHMucHVzaChtaWRpRXZlbnQpO1xuICB9ZWxzZSBpZih0cmFjay5lbmFibGVSZXRyb3NwZWN0aXZlUmVjb3JkaW5nKXtcbiAgICB0cmFjay5yZXRyb3NwZWN0aXZlUmVjb3JkaW5nLnB1c2gobWlkaUV2ZW50KTtcbiAgfVxuXG4gIC8vIGNhbGwgYWxsIG1pZGkgZXZlbnQgbGlzdGVuZXJzXG4gIGxpc3RlbmVycyA9IHRyYWNrLm1pZGlFdmVudExpc3RlbmVyc1ttaWRpRXZlbnQudHlwZV07XG4gIGlmKGxpc3RlbmVycyAhPT0gdW5kZWZpbmVkKXtcbiAgICBvYmplY3RGb3JFYWNoKGxpc3RlbmVycywgZnVuY3Rpb24obGlzdGVuZXIpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfSk7XG4gIH1cblxuICBjaGFubmVsID0gdHJhY2suY2hhbm5lbDtcbiAgaWYoY2hhbm5lbCA9PT0gJ2FueScgfHwgY2hhbm5lbCA9PT0gdW5kZWZpbmVkIHx8IGlzTmFOKGNoYW5uZWwpID09PSB0cnVlKXtcbiAgICBjaGFubmVsID0gMDtcbiAgfVxuXG4gIG9iamVjdEZvckVhY2godHJhY2subWlkaU91dHB1dHMsIGZ1bmN0aW9uKG91dHB1dCl7XG4gICAgLy9jb25zb2xlLmxvZygnbWlkaSBvdXQnLCBvdXRwdXQsIG1pZGlFdmVudC50eXBlKTtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4IHx8IG1pZGlFdmVudC50eXBlID09PSAxNDQgfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE3Nil7XG4gICAgICAvL2NvbnNvbGUubG9nKG1pZGlFdmVudC50eXBlLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMik7XG4gICAgICBvdXRwdXQuc2VuZChbbWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyXSk7XG4gICAgLy8gfWVsc2UgaWYobWlkaUV2ZW50LnR5cGUgPT09IDE5Mil7XG4gICAgLy8gICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSArIGNoYW5uZWwsIG1pZGlFdmVudC5kYXRhMV0pO1xuICAgIH1cbiAgICAvL291dHB1dC5zZW5kKFttaWRpRXZlbnQuc3RhdHVzICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgfSk7XG5cbiAgLy8gQFRPRE86IG1heWJlIGEgdHJhY2sgc2hvdWxkIGJlIGFibGUgdG8gc2VuZCBpdHMgZXZlbnQgdG8gYm90aCBhIG1pZGktb3V0IHBvcnQgYW5kIGFuIGludGVybmFsIGhlYXJ0YmVhdCBzb25nP1xuICAvL2NvbnNvbGUubG9nKHRyYWNrLnJvdXRlVG9NaWRpT3V0KTtcbiAgaWYodHJhY2sucm91dGVUb01pZGlPdXQgPT09IGZhbHNlKXtcbiAgICBtaWRpRXZlbnQudHJhY2sgPSB0cmFjaztcbiAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChtaWRpRXZlbnQpO1xuICB9XG59XG5cblxuZnVuY3Rpb24gYWRkTWlkaUV2ZW50TGlzdGVuZXIoLi4uYXJncyl7IC8vIGNhbGxlciBjYW4gYmUgYSB0cmFjayBvciBhIHNvbmdcblxuICBsZXQgaWQgPSBtaWRpRXZlbnRMaXN0ZW5lcklkKys7XG4gIGxldCBsaXN0ZW5lcjtcbiAgICB0eXBlcyA9IHt9LFxuICAgIGlkcyA9IFtdLFxuICAgIGxvb3A7XG5cblxuICAvLyBzaG91bGQgSSBpbmxpbmUgdGhpcz9cbiAgbG9vcCA9IGZ1bmN0aW9uKGFyZ3Mpe1xuICAgIGZvcihsZXQgYXJnIG9mIGFyZ3Mpe1xuICAgICAgbGV0IHR5cGUgPSB0eXBlU3RyaW5nKGFyZyk7XG4gICAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgICAgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgIGxvb3AoYXJnKTtcbiAgICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmdW5jdGlvbicpe1xuICAgICAgICBsaXN0ZW5lciA9IGFyZztcbiAgICAgIH1lbHNlIGlmKGlzTmFOKGFyZykgPT09IGZhbHNlKXtcbiAgICAgICAgYXJnID0gcGFyc2VJbnQoYXJnLCAxMCk7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgdHlwZXNbYXJnXSA9IGFyZztcbiAgICAgICAgfVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3N0cmluZycpe1xuICAgICAgICBpZihzZXF1ZW5jZXIuY2hlY2tFdmVudFR5cGUoYXJnKSAhPT0gZmFsc2Upe1xuICAgICAgICAgIGFyZyA9IHNlcXVlbmNlci5taWRpRXZlbnROdW1iZXJCeU5hbWUoYXJnKTtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGxvb3AoYXJncywgMCwgYXJncy5sZW5ndGgpO1xuICAvL2NvbnNvbGUubG9nKCd0eXBlcycsIHR5cGVzLCAnbGlzdGVuZXInLCBsaXN0ZW5lcik7XG5cbiAgb2JqZWN0Rm9yRWFjaCh0eXBlcywgZnVuY3Rpb24odHlwZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0eXBlKTtcbiAgICBpZihvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID09PSB1bmRlZmluZWQpe1xuICAgICAgb2JqLm1pZGlFdmVudExpc3RlbmVyc1t0eXBlXSA9IHt9O1xuICAgIH1cbiAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXSA9IGxpc3RlbmVyO1xuICAgIGlkcy5wdXNoKHR5cGUgKyAnXycgKyBpZCk7XG4gIH0pO1xuXG4gIC8vY29uc29sZS5sb2cob2JqLm1pZGlFdmVudExpc3RlbmVycyk7XG4gIHJldHVybiBpZHMubGVuZ3RoID09PSAxID8gaWRzWzBdIDogaWRzO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVyKGlkLCBvYmope1xuICB2YXIgdHlwZTtcbiAgaWQgPSBpZC5zcGxpdCgnXycpO1xuICB0eXBlID0gaWRbMF07XG4gIGlkID0gaWRbMV07XG4gIGRlbGV0ZSBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdW2lkXTtcbn1cblxuXG5mdW5jdGlvbiByZW1vdmVNaWRpRXZlbnRMaXN0ZW5lcnMoKXtcblxufVxuXG4qL1xuIiwiaW1wb3J0IHtjcmVhdGVTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5pbXBvcnQge2NyZWF0ZU5vdGUsIGdldE5vdGVOdW1iZXJ9IGZyb20gJy4vbm90ZSdcblxuZXhwb3J0IGNsYXNzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgdHlwZTogc3RyaW5nKXtcbiAgICB0aGlzLmlkID0gaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgLy8gY3JlYXRlIGEgc2FtcGxlcyBkYXRhIG9iamVjdCBmb3IgYWxsIDEyOCB2ZWxvY2l0eSBsZXZlbHMgb2YgYWxsIDEyOCBub3Rlc1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2NoZWR1bGVkU2FtcGxlcyA9IHt9XG4gICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICB0aGlzLnN1c3RhaW5QZWRhbERvd24gPSBmYWxzZVxuICB9XG5cbiAgY29ubmVjdChvdXRwdXQpe1xuICAgIHRoaXMub3V0cHV0ID0gb3V0cHV0XG4gIH1cblxuICBwcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aW1lKXtcbiAgICBsZXQgc2FtcGxlLCBzYW1wbGVEYXRhXG4gICAgdGltZSA9IHRpbWUgfHwgZXZlbnQudGlja3MgKiAwLjAwMjVcbiAgICAvL2NvbnNvbGUubG9nKHRpbWUpXG5cbiAgICBpZihldmVudC50eXBlID09PSAxNDQpe1xuICAgICAgLy9jb25zb2xlLmxvZygxNDQsICc6JywgdGltZSwgY29udGV4dC5jdXJyZW50VGltZSwgZXZlbnQubWlsbGlzKVxuXG4gICAgICBzYW1wbGVEYXRhID0gdGhpcy5zYW1wbGVzRGF0YVtldmVudC5kYXRhMV1bZXZlbnQuZGF0YTJdO1xuICAgICAgc2FtcGxlID0gY3JlYXRlU2FtcGxlKHNhbXBsZURhdGEsIGV2ZW50KVxuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW2V2ZW50Lm1pZGlOb3RlSWRdID0gc2FtcGxlXG4gICAgICBzYW1wbGUub3V0cHV0LmNvbm5lY3QodGhpcy5vdXRwdXQgfHwgY29udGV4dC5kZXN0aW5hdGlvbilcbiAgICAgIHNhbXBsZS5zdGFydCh0aW1lKVxuICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgIGlmKHR5cGVvZiBzYW1wbGUgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29uc29sZS5lcnJvcignc2FtcGxlIG5vdCBmb3VuZCBmb3IgZXZlbnQnLCBldmVudClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICBpZih0aGlzLnN1c3RhaW5QZWRhbERvd24gPT09IHRydWUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIHRoaXMuc3VzdGFpbmVkU2FtcGxlcy5wdXNoKGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICB9ZWxzZXtcbiAgICAgICAgc2FtcGxlLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N0b3AnLCBldmVudC5taWRpTm90ZUlkKVxuICAgICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFNhbXBsZXNbZXZlbnQubWlkaU5vdGVJZF1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgLy8gc3VzdGFpbiBwZWRhbFxuICAgICAgaWYoZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gdHJ1ZVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgZG93bicpXG4gICAgICAgICAgLy9kaXNwYXRjaEV2ZW50KHRoaXMudHJhY2suc29uZywgJ3N1c3RhaW5fcGVkYWwnLCAnZG93bicpO1xuICAgICAgICB9ZWxzZSBpZihldmVudC5kYXRhMiA9PT0gMCl7XG4gICAgICAgICAgdGhpcy5zdXN0YWluUGVkYWxEb3duID0gZmFsc2VcbiAgICAgICAgICB0aGlzLnN1c3RhaW5lZFNhbXBsZXMuZm9yRWFjaCgobWlkaU5vdGVJZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW21pZGlOb3RlSWRdLnN0b3AodGltZSwgKCkgPT4ge1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdzdG9wJywgbWlkaU5vdGVJZClcbiAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1ttaWRpTm90ZUlkXVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3N1c3RhaW4gcGVkYWwgdXAnLCB0aGlzLnN1c3RhaW5lZFNhbXBsZXMpXG4gICAgICAgICAgdGhpcy5zdXN0YWluZWRTYW1wbGVzID0gW11cbiAgICAgICAgICAvL2Rpc3BhdGNoRXZlbnQodGhpcy50cmFjay5zb25nLCAnc3VzdGFpbl9wZWRhbCcsICd1cCcpO1xuICAgICAgICAgIC8vdGhpcy5zdG9wU3VzdGFpbih0aW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAvLyBwYW5uaW5nXG4gICAgICB9ZWxzZSBpZihldmVudC5kYXRhMSA9PT0gMTApe1xuICAgICAgICAvLyBwYW5uaW5nIGlzICpub3QqIGV4YWN0bHkgdGltZWQgLT4gbm90IHBvc3NpYmxlICh5ZXQpIHdpdGggV2ViQXVkaW9cbiAgICAgICAgLy9jb25zb2xlLmxvZyhkYXRhMiwgcmVtYXAoZGF0YTIsIDAsIDEyNywgLTEsIDEpKTtcbiAgICAgICAgLy90cmFjay5zZXRQYW5uaW5nKHJlbWFwKGRhdGEyLCAwLCAxMjcsIC0xLCAxKSk7XG5cbiAgICAgIC8vIHZvbHVtZVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTEgPT09IDcpe1xuICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAgQHBhcmFtIG5vdGVJZCBjYW4gYmUgbm90ZSBuYW1lIChDNCkgb3Igbm90ZSBudW1iZXIgKDYwKVxuICAgIEBwYXJhbSBhdWRpbyBidWZmZXJcbiAgICBAcGFyYW0gY29uZmlnIChvcHRpb25hbClcbiAgICAgIHtcbiAgICAgICAgc3VzdGFpbjogW3N1c3RhaW5TdGFydCwgc3VzdGFpbkVuZF0sIC8vIG9wdGlvbmFsLCBpbiBtaWxsaXNcbiAgICAgICAgcmVsZWFzZTogW3JlbGVhc2VEdXJhdGlvbiwgcmVsZWFzZUVudmVsb3BlXSwgLy8gb3B0aW9uYWxcbiAgICAgICAgcGFuOiBwYW5Qb3NpdGlvbiAvLyBvcHRpb25hbFxuICAgICAgICB2ZWxvY2l0eTogW3ZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kXSAvLyBvcHRpb25hbCwgZm9yIG11bHRpLWxheWVyZWQgaW5zdHJ1bWVudHNcbiAgICAgIH1cbiAgKi9cbiAgYWRkU2FtcGxlRGF0YShub3RlSWQsIGF1ZGlvQnVmZmVyLFxuICAgIHtcbiAgICAgIHN1c3RhaW4gPSBbZmFsc2UsIGZhbHNlXSxcbiAgICAgIHJlbGVhc2UgPSBbZmFsc2UsICdkZWZhdWx0J10sXG4gICAgICBwYW4gPSBmYWxzZSxcbiAgICAgIHZlbG9jaXR5ID0gWzAsIDEyN11cbiAgICB9ID0ge30pe1xuXG4gICAgaWYoYXVkaW9CdWZmZXIgaW5zdGFuY2VvZiBBdWRpb0J1ZmZlciA9PT0gZmFsc2Upe1xuICAgICAgY29uc29sZS53YXJuKCdub3QgYSB2YWxpZCBBdWRpb0J1ZmZlciBpbnN0YW5jZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSA9IHN1c3RhaW47XG4gICAgbGV0IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0gPSByZWxlYXNlO1xuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHk7XG5cbiAgICBpZihzdXN0YWluLmxlbmd0aCAhPT0gMil7XG4gICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBmYWxzZSl7XG4gICAgICByZWxlYXNlRW52ZWxvcGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBsb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKTtcbiAgICAvLyBsb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpO1xuICAgIC8vIGxvZyhwYW5Qb3NpdGlvbik7XG4gICAgLy8gbG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKTtcblxuICAgIGxldCBub3RlID0gY3JlYXRlTm90ZShub3RlSWQpXG4gICAgY29uc29sZS5sb2cobm90ZSlcbiAgICBpZihub3RlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbm90ZUlkID0gbm90ZS5udW1iZXI7XG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVJZF0uZmlsbCh7XG4gICAgICBuOiBub3RlSWQsXG4gICAgICBkOiBhdWRpb0J1ZmZlcixcbiAgICAgIHMxOiBzdXN0YWluU3RhcnQsXG4gICAgICBzMjogc3VzdGFpbkVuZCxcbiAgICAgIHI6IHJlbGVhc2VEdXJhdGlvbixcbiAgICAgIGU6IHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgIHA6IHBhblxuICAgIH0sIHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kICsgMSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuc2FtcGxlc0RhdGFbbm90ZUlkXSk7XG4gIH1cblxuXG4gIHN0b3BBbGxTb3VuZHMoKXtcbiAgICBjb25zb2xlLmxvZygnc3RvcEFsbFNvdW5kcycpXG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWRTYW1wbGVzKS5mb3JFYWNoKChzYW1wbGVJZCkgPT4ge1xuICAgICAgdGhpcy5zY2hlZHVsZWRTYW1wbGVzW3NhbXBsZUlkXS5zdG9wKDAsICgpID0+IHtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkU2FtcGxlc1tzYW1wbGVJZF1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuXG5pbXBvcnQge1xuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCh0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSk6IHN0cmluZ3tcbiAgbGV0IGlkID0gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBmcmVxdWVuY3k6IDQ0MCAqIE1hdGgucG93KDIsIChkYXRhMSAtIDY5KSAvIDEyKSxcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TUlESUV2ZW50SWQoKTogc3RyaW5ne1xuICByZXR1cm4gYE1FXyR7bWlkaUV2ZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlTUlESUV2ZW50KGV2ZW50SWQ6IHN0cmluZywgdGlja3NfdG9fbW92ZTogbnVtYmVyKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgLy9sZXQgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tpZF1cblxuICBsZXQgc29uZyA9IHN0YXRlLmVudGl0aWVzW2V2ZW50SWRdXG4gIGxldCBldmVudCA9IHNvbmcubWlkaUV2ZW50c1swXVxuICAvL2NvbnNvbGUubG9nKGV2ZW50KVxuXG4gIGxldCB0aWNrcyA9IGV2ZW50LnRpY2tzICsgdGlja3NfdG9fbW92ZVxuICB0aWNrcyA9IHRpY2tzIDwgMCA/IDAgOiB0aWNrc1xuICBsZXQgc29uZ0lkID0gZXZlbnQuc29uZ0lkIHx8IGZhbHNlXG4gIGlmKHNvbmdJZCl7XG4gICAgc29uZ0lkID0gc3RhdGUuZW50aXRpZXNbc29uZ0lkXSA/IHNvbmdJZCA6IGZhbHNlXG4gIH1cbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgc29uZ0lkLCBldmVudClcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGV2ZW50SWQ6IGV2ZW50LmlkLFxuICAgICAgdGlja3MsXG4gICAgICBzb25nSWQsXG4gICAgfVxuICB9KVxuICAvLyBpZiB0aGUgZXZlbnQgaXMgcGFydCBvZiBhIG1pZGkgbm90ZSwgdXBkYXRlIGl0XG4gIGxldCBub3RlX2lkID0gZXZlbnQubm90ZVxuICBpZihub3RlX2lkKXtcbiAgICB1cGRhdGVNSURJTm90ZShub3RlX2lkLCBzdGF0ZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudFRvKGlkOiBzdHJpbmcsIHRpY2tzOiBudW1iZXIpOiB2b2lke1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tpZF1cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX0VWRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGlja3MsXG4gICAgfVxuICB9KVxuICBpZih0eXBlb2YgZXZlbnQgPT09ICd1bmRlZmluZWQnKXtcbiAgICBjb25zb2xlLmVycm9yKCdldmVudCBpcyB1bmRlZmluZWQnKSAvL3RoaXMgc2hvdWxkJ3QgaGFwcGVuIVxuICB9XG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG4iLCJcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgQ1JFQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNSURJTm90ZShpZCwgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpKXtcbiAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbaWRdXG4gIGxldCBldmVudHMgPSBzdGF0ZS5lbnRpdGllc1xuICBsZXQgc3RhcnQgPSBldmVudHNbbm90ZS5ub3Rlb25dXG4gIGxldCBlbmQgPSBldmVudHNbbm90ZS5ub3Rlb2ZmXVxuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9OT1RFLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgc3RhcnQ6IHN0YXJ0LnRpY2tzLFxuICAgICAgZW5kOiBlbmQudGlja3MsXG4gICAgICBkdXJhdGlvblRpY2tzOiBlbmQudGlja3MgLSBzdGFydC50aWNrc1xuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElOb3RlKG5vdGVvbjogc3RyaW5nLCBub3Rlb2ZmOiBzdHJpbmcpe1xuICBsZXQgZXZlbnRzID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3IuZW50aXRpZXNcbiAgbGV0IG9uID0gZXZlbnRzW25vdGVvbl1cbiAgbGV0IG9mZiA9IGV2ZW50c1tub3Rlb2ZmXVxuICBpZihvbi5kYXRhMSAhPT0gb2ZmLmRhdGExKXtcbiAgICBjb25zb2xlLmVycm9yKCdjYW5cXCd0IGNyZWF0ZSBNSURJIG5vdGU6IGV2ZW50cyBtdXN0IGhhdmUgdGhlIHNhbWUgZGF0YTEgdmFsdWUsIGkuZS4gdGhlIHNhbWUgcGl0Y2gnKVxuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9OT1RFLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbm90ZW9uLFxuICAgICAgbm90ZW9mZixcbiAgICAgIHN0YXJ0OiBvbi50aWNrcyxcbiAgICAgIGVuZDogb2ZmLnRpY2tzLFxuICAgICAgZHVyYXRpb25UaWNrczogb2ZmLnRpY2tzIC0gb24udGlja3NcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuIiwiLypcbiAgV3JhcHBlciBmb3IgYWNjZXNzaW5nIGJ5dGVzIHRocm91Z2ggc2VxdWVudGlhbCByZWFkc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuICBhZGFwdGVkIHRvIHdvcmsgd2l0aCBBcnJheUJ1ZmZlciAtPiBVaW50OEFycmF5XG4qL1xuXG5cbid1c2Ugc3RyaWN0JztcblxuY29uc3QgZmNjID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTUlESVN0cmVhbXtcblxuICAvLyBidWZmZXIgaXMgVWludDhBcnJheVxuICBjb25zdHJ1Y3RvcihidWZmZXIpe1xuICAgIHRoaXMuYnVmZmVyID0gYnVmZmVyO1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgLyogcmVhZCBzdHJpbmcgb3IgYW55IG51bWJlciBvZiBieXRlcyAqL1xuICByZWFkKGxlbmd0aCwgdG9TdHJpbmcgPSB0cnVlKSB7XG4gICAgbGV0IHJlc3VsdDtcblxuICAgIGlmKHRvU3RyaW5nKXtcbiAgICAgIHJlc3VsdCA9ICcnO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQgKz0gZmNjKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfWVsc2V7XG4gICAgICByZXN1bHQgPSBbXTtcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0LnB1c2godGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAzMi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MzIoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCAyNCkgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXSA8PCAxNikgK1xuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAyXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgM11cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gNDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMTYtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDE2KCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDI7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYW4gOC1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50OChzaWduZWQpIHtcbiAgICBsZXQgcmVzdWx0ID0gdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl07XG4gICAgaWYoc2lnbmVkICYmIHJlc3VsdCA+IDEyNyl7XG4gICAgICByZXN1bHQgLT0gMjU2O1xuICAgIH1cbiAgICB0aGlzLnBvc2l0aW9uICs9IDE7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGVvZigpIHtcbiAgICByZXR1cm4gdGhpcy5wb3NpdGlvbiA+PSB0aGlzLmJ1ZmZlci5sZW5ndGg7XG4gIH1cblxuICAvKiByZWFkIGEgTUlESS1zdHlsZSBsZXRpYWJsZS1sZW5ndGggaW50ZWdlclxuICAgIChiaWctZW5kaWFuIHZhbHVlIGluIGdyb3VwcyBvZiA3IGJpdHMsXG4gICAgd2l0aCB0b3AgYml0IHNldCB0byBzaWduaWZ5IHRoYXQgYW5vdGhlciBieXRlIGZvbGxvd3MpXG4gICovXG4gIHJlYWRWYXJJbnQoKSB7XG4gICAgbGV0IHJlc3VsdCA9IDA7XG4gICAgd2hpbGUodHJ1ZSkge1xuICAgICAgbGV0IGIgPSB0aGlzLnJlYWRJbnQ4KCk7XG4gICAgICBpZiAoYiAmIDB4ODApIHtcbiAgICAgICAgcmVzdWx0ICs9IChiICYgMHg3Zik7XG4gICAgICAgIHJlc3VsdCA8PD0gNztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8qIGIgaXMgdGhlIGxhc3QgYnl0ZSAqL1xuICAgICAgICByZXR1cm4gcmVzdWx0ICsgYjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXNldCgpe1xuICAgIHRoaXMucG9zaXRpb24gPSAwO1xuICB9XG5cbiAgc2V0UG9zaXRpb24ocCl7XG4gICAgdGhpcy5wb3NpdGlvbiA9IHA7XG4gIH1cbn1cbiIsIi8qXG4gIEV4dHJhY3RzIGFsbCBtaWRpIGV2ZW50cyBmcm9tIGEgYmluYXJ5IG1pZGkgZmlsZSwgdXNlcyBtaWRpX3N0cmVhbS5qc1xuXG4gIGJhc2VkIG9uOiBodHRwczovL2dpdGh1Yi5jb20vZ2FzbWFuL2phc21pZFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgTUlESVN0cmVhbSBmcm9tICcuL21pZGlfc3RyZWFtJztcblxubGV0XG4gIGxhc3RFdmVudFR5cGVCeXRlLFxuICB0cmFja05hbWU7XG5cblxuZnVuY3Rpb24gcmVhZENodW5rKHN0cmVhbSl7XG4gIGxldCBpZCA9IHN0cmVhbS5yZWFkKDQsIHRydWUpO1xuICBsZXQgbGVuZ3RoID0gc3RyZWFtLnJlYWRJbnQzMigpO1xuICAvL2NvbnNvbGUubG9nKGxlbmd0aCk7XG4gIHJldHVybntcbiAgICAnaWQnOiBpZCxcbiAgICAnbGVuZ3RoJzogbGVuZ3RoLFxuICAgICdkYXRhJzogc3RyZWFtLnJlYWQobGVuZ3RoLCBmYWxzZSlcbiAgfTtcbn1cblxuXG5mdW5jdGlvbiByZWFkRXZlbnQoc3RyZWFtKXtcbiAgdmFyIGV2ZW50ID0ge307XG4gIHZhciBsZW5ndGg7XG4gIGV2ZW50LmRlbHRhVGltZSA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gIGxldCBldmVudFR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gIC8vY29uc29sZS5sb2coZXZlbnRUeXBlQnl0ZSwgZXZlbnRUeXBlQnl0ZSAmIDB4ODAsIDE0NiAmIDB4MGYpO1xuICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ZjApID09IDB4ZjApe1xuICAgIC8qIHN5c3RlbSAvIG1ldGEgZXZlbnQgKi9cbiAgICBpZihldmVudFR5cGVCeXRlID09IDB4ZmYpe1xuICAgICAgLyogbWV0YSBldmVudCAqL1xuICAgICAgZXZlbnQudHlwZSA9ICdtZXRhJztcbiAgICAgIGxldCBzdWJ0eXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIHN3aXRjaChzdWJ0eXBlQnl0ZSl7XG4gICAgICAgIGNhc2UgMHgwMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlTnVtYmVyJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2VxdWVuY2VOdW1iZXIgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWJlciA9IHN0cmVhbS5yZWFkSW50MTYoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RleHQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAyOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29weXJpZ2h0Tm90aWNlJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RyYWNrTmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2luc3RydW1lbnROYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2x5cmljcyc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtYXJrZXInO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA3OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY3VlUG9pbnQnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDIwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWlkaUNoYW5uZWxQcmVmaXgnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBtaWRpQ2hhbm5lbFByZWZpeCBldmVudCBpcyAxLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQuY2hhbm5lbCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDJmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnZW5kT2ZUcmFjayc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAwKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGVuZE9mVHJhY2sgZXZlbnQgaXMgMCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDUxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2V0VGVtcG8nO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMyl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXRUZW1wbyBldmVudCBpcyAzLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdCA9IChcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCAxNikgK1xuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDgpICtcbiAgICAgICAgICAgIHN0cmVhbS5yZWFkSW50OCgpXG4gICAgICAgICAgKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1NDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NtcHRlT2Zmc2V0JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDUpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc21wdGVPZmZzZXQgZXZlbnQgaXMgNSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBob3VyQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lUmF0ZSA9e1xuICAgICAgICAgICAgMHgwMDogMjQsIDB4MjA6IDI1LCAweDQwOiAyOSwgMHg2MDogMzBcbiAgICAgICAgICB9W2hvdXJCeXRlICYgMHg2MF07XG4gICAgICAgICAgZXZlbnQuaG91ciA9IGhvdXJCeXRlICYgMHgxZjtcbiAgICAgICAgICBldmVudC5taW4gPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zZWMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnN1YmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTg6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0aW1lU2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDQpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgdGltZVNpZ25hdHVyZSBldmVudCBpcyA0LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtZXJhdG9yID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZGVub21pbmF0b3IgPSBNYXRoLnBvdygyLCBzdHJlYW0ucmVhZEludDgoKSk7XG4gICAgICAgICAgZXZlbnQubWV0cm9ub21lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQudGhpcnR5c2Vjb25kcyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU5OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAna2V5U2lnbmF0dXJlJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDIpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Iga2V5U2lnbmF0dXJlIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5rZXkgPSBzdHJlYW0ucmVhZEludDgodHJ1ZSk7XG4gICAgICAgICAgZXZlbnQuc2NhbGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg3ZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NlcXVlbmNlclNwZWNpZmljJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9pZihzZXF1ZW5jZXIuZGVidWcgPj0gMil7XG4gICAgICAgICAgLy8gICAgY29uc29sZS53YXJuKCdVbnJlY29nbmlzZWQgbWV0YSBldmVudCBzdWJ0eXBlOiAnICsgc3VidHlwZUJ5dGUpO1xuICAgICAgICAgIC8vfVxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgfVxuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGYwKXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnc3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmNyl7XG4gICAgICBldmVudC50eXBlID0gJ2RpdmlkZWRTeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2V7XG4gICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZSBieXRlOiAnICsgZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gIH1lbHNle1xuICAgIC8qIGNoYW5uZWwgZXZlbnQgKi9cbiAgICBsZXQgcGFyYW0xO1xuICAgIGlmKChldmVudFR5cGVCeXRlICYgMHg4MCkgPT09IDApe1xuICAgICAgLyogcnVubmluZyBzdGF0dXMgLSByZXVzZSBsYXN0RXZlbnRUeXBlQnl0ZSBhcyB0aGUgZXZlbnQgdHlwZS5cbiAgICAgICAgZXZlbnRUeXBlQnl0ZSBpcyBhY3R1YWxseSB0aGUgZmlyc3QgcGFyYW1ldGVyXG4gICAgICAqL1xuICAgICAgLy9jb25zb2xlLmxvZygncnVubmluZyBzdGF0dXMnKTtcbiAgICAgIHBhcmFtMSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgICBldmVudFR5cGVCeXRlID0gbGFzdEV2ZW50VHlwZUJ5dGU7XG4gICAgfWVsc2V7XG4gICAgICBwYXJhbTEgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIC8vY29uc29sZS5sb2coJ2xhc3QnLCBldmVudFR5cGVCeXRlKTtcbiAgICAgIGxhc3RFdmVudFR5cGVCeXRlID0gZXZlbnRUeXBlQnl0ZTtcbiAgICB9XG4gICAgbGV0IGV2ZW50VHlwZSA9IGV2ZW50VHlwZUJ5dGUgPj4gNDtcbiAgICBldmVudC5jaGFubmVsID0gZXZlbnRUeXBlQnl0ZSAmIDB4MGY7XG4gICAgZXZlbnQudHlwZSA9ICdjaGFubmVsJztcbiAgICBzd2l0Y2ggKGV2ZW50VHlwZSl7XG4gICAgICBjYXNlIDB4MDg6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwOTpcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgaWYoZXZlbnQudmVsb2NpdHkgPT09IDApe1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9mZic7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdub3RlT24nKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGE6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZUFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC5hbW91bnQgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBiOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvbnRyb2xsZXInO1xuICAgICAgICBldmVudC5jb250cm9sbGVyVHlwZSA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBjOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Byb2dyYW1DaGFuZ2UnO1xuICAgICAgICBldmVudC5wcm9ncmFtTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGQ6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY2hhbm5lbEFmdGVydG91Y2gnO1xuICAgICAgICBldmVudC5hbW91bnQgPSBwYXJhbTE7XG4gICAgICAgIC8vaWYodHJhY2tOYW1lID09PSAnU0gtUzEtNDQtQzA5IEw9U01MIElOPTMnKXtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coJ2NoYW5uZWwgcHJlc3N1cmUnLCB0cmFja05hbWUsIHBhcmFtMSk7XG4gICAgICAgIC8vfVxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGU6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncGl0Y2hCZW5kJztcbiAgICAgICAgZXZlbnQudmFsdWUgPSBwYXJhbTEgKyAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgNyk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIC8qXG4gICAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlO1xuICAgICAgICBjb25zb2xlLmxvZygnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZSk7XG4gICAgICAgICovXG5cbiAgICAgICAgZXZlbnQudmFsdWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4vKlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgIGNvbnNvbGUubG9nKCd3ZWlyZG8nLCB0cmFja05hbWUsIHBhcmFtMSwgZXZlbnQudmVsb2NpdHkpO1xuKi9cblxuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlTUlESUZpbGUoYnVmZmVyKXtcbiAgaWYoYnVmZmVyIGluc3RhbmNlb2YgVWludDhBcnJheSA9PT0gZmFsc2UgJiYgYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLmVycm9yKCdidWZmZXIgc2hvdWxkIGJlIGFuIGluc3RhbmNlIG9mIFVpbnQ4QXJyYXkgb2YgQXJyYXlCdWZmZXInKVxuICAgIHJldHVyblxuICB9XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXtcbiAgICBidWZmZXIgPSBuZXcgVWludDhBcnJheShidWZmZXIpXG4gIH1cbiAgbGV0IHRyYWNrcyA9IG5ldyBNYXAoKTtcbiAgbGV0IHN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG5cbiAgbGV0IGhlYWRlckNodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gIGlmKGhlYWRlckNodW5rLmlkICE9PSAnTVRoZCcgfHwgaGVhZGVyQ2h1bmsubGVuZ3RoICE9PSA2KXtcbiAgICB0aHJvdyAnQmFkIC5taWQgZmlsZSAtIGhlYWRlciBub3QgZm91bmQnO1xuICB9XG5cbiAgbGV0IGhlYWRlclN0cmVhbSA9IG5ldyBNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IG5ldyBNSURJU3RyZWFtKHRyYWNrQ2h1bmsuZGF0YSk7XG4gICAgd2hpbGUoIXRyYWNrU3RyZWFtLmVvZigpKXtcbiAgICAgIGxldCBldmVudCA9IHJlYWRFdmVudCh0cmFja1N0cmVhbSk7XG4gICAgICB0cmFjay5wdXNoKGV2ZW50KTtcbiAgICB9XG4gICAgdHJhY2tzLnNldCh0cmFja05hbWUsIHRyYWNrKTtcbiAgfVxuXG4gIHJldHVybntcbiAgICAnaGVhZGVyJzogaGVhZGVyLFxuICAgICd0cmFja3MnOiB0cmFja3NcbiAgfTtcbn0iLCIvKlxuICBBZGRzIGEgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbm90ZSBvYmplY3QgdGhhdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIG11c2ljYWwgbm90ZTpcbiAgICAtIG5hbWUsIGUuZy4gJ0MnXG4gICAgLSBvY3RhdmUsICAtMSAtIDlcbiAgICAtIGZ1bGxOYW1lOiAnQzEnXG4gICAgLSBmcmVxdWVuY3k6IDIzNC4xNiwgYmFzZWQgb24gdGhlIGJhc2ljIHBpdGNoXG4gICAgLSBudW1iZXI6IDYwIG1pZGkgbm90ZSBudW1iZXJcblxuICBBZGRzIHNldmVyYWwgdXRpbGl0eSBtZXRob2RzIG9yZ2FuaXNlZCBhcm91bmQgdGhlIG5vdGUgb2JqZWN0XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7dHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIGVycm9yTXNnLFxuICB3YXJuaW5nTXNnLFxuICBwb3cgPSBNYXRoLnBvdyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gICdzaGFycCcgOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnIDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJyA6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JyA6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG5cbi8qXG4gIGFyZ3VtZW50c1xuICAtIG5vdGVOdW1iZXI6IDYwXG4gIC0gbm90ZU51bWJlciBhbmQgbm90ZW5hbWUgbW9kZTogNjAsICdzaGFycCdcbiAgLSBub3RlTmFtZTogJ0MjNCdcbiAgLSBuYW1lIGFuZCBvY3RhdmU6ICdDIycsIDRcbiAgLSBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGU6ICdEJywgNCwgJ3NoYXJwJ1xuICAtIGRhdGEgb2JqZWN0OlxuICAgIHtcbiAgICAgIG5hbWU6ICdDJyxcbiAgICAgIG9jdGF2ZTogNFxuICAgIH1cbiAgICBvclxuICAgIHtcbiAgICAgIGZyZXF1ZW5jeTogMjM0LjE2XG4gICAgfVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdGUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBkYXRhLFxuICAgIG9jdGF2ZSxcbiAgICBub3RlTmFtZSxcbiAgICBub3RlTnVtYmVyLFxuICAgIG5vdGVOYW1lTW9kZSxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBhcmcyID0gYXJnc1syXSxcbiAgICB0eXBlMCA9IHR5cGVTdHJpbmcoYXJnMCksXG4gICAgdHlwZTEgPSB0eXBlU3RyaW5nKGFyZzEpLFxuICAgIHR5cGUyID0gdHlwZVN0cmluZyhhcmcyKTtcblxuICBlcnJvck1zZyA9ICcnO1xuICB3YXJuaW5nTXNnID0gJyc7XG5cbiAgLy8gYXJndW1lbnQ6IG5vdGUgbnVtYmVyXG4gIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdudW1iZXInKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyAgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lLCBub3RlIG5hbWUgbW9kZSAtPiBmb3IgY29udmVydGluZyBiZXR3ZWVuIG5vdGUgbmFtZSBtb2Rlc1xuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbnVtYmVyLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGVTdHJpbmcoYXJnMCkgPT09ICdudW1iZXInICYmIHR5cGVTdHJpbmcoYXJnMSkgPT09ICdzdHJpbmcnKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSxvY3RhdmUpO1xuICAgIH1cblxuICB9ZWxzZXtcbiAgICBlcnJvck1zZyA9ICd3cm9uZyBhcmd1bWVudHMsIHBsZWFzZSBjb25zdWx0IGRvY3VtZW50YXRpb24nO1xuICB9XG5cbiAgaWYoZXJyb3JNc2cpe1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3JNc2cpO1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmKHdhcm5pbmdNc2cpe1xuICAgIGNvbnNvbGUud2Fybih3YXJuaW5nTXNnKTtcbiAgfVxuXG4gIGxldCBub3RlID0ge1xuICAgIG5hbWU6IG5vdGVOYW1lLFxuICAgIG9jdGF2ZTogb2N0YXZlLFxuICAgIGZ1bGxOYW1lOiBub3RlTmFtZSArIG9jdGF2ZSxcbiAgICBudW1iZXI6IG5vdGVOdW1iZXIsXG4gICAgZnJlcXVlbmN5OiBfZ2V0RnJlcXVlbmN5KG5vdGVOdW1iZXIpLFxuICAgIGJsYWNrS2V5OiBfaXNCbGFja0tleShub3RlTnVtYmVyKVxuICB9XG4gIE9iamVjdC5mcmVlemUobm90ZSk7XG4gIHJldHVybiBub3RlO1xufVxuXG5cbi8vZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpKSB7XG5mdW5jdGlvbiBfZ2V0Tm90ZU5hbWUobnVtYmVyLCBtb2RlID0gJ3NoYXJwJykge1xuICAvL2xldCBvY3RhdmUgPSBNYXRoLmZsb29yKChudW1iZXIgLyAxMikgLSAyKSwgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBvY3RhdmUgPSBmbG9vcigobnVtYmVyIC8gMTIpIC0gMSk7XG4gIGxldCBub3RlTmFtZSA9IG5vdGVOYW1lc1ttb2RlXVtudW1iZXIgJSAxMl07XG4gIHJldHVybiBbbm90ZU5hbWUsIG9jdGF2ZV07XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOdW1iZXIobmFtZSwgb2N0YXZlKSB7XG4gIGxldCBrZXlzID0gT2JqZWN0LmtleXMobm90ZU5hbWVzKTtcbiAgbGV0IGluZGV4O1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICAvL251bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMikgKyAxMjsgLy8g4oaSIGluIEN1YmFzZSBjZW50cmFsIEMgPSBDMyBpbnN0ZWFkIG9mIEM0XG4gIGxldCBudW1iZXIgPSAoaW5kZXggKyAxMikgKyAob2N0YXZlICogMTIpOy8vIOKGkiBtaWRpIHN0YW5kYXJkICsgc2NpZW50aWZpYyBuYW1pbmcsIHNlZTogaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9NaWRkbGVfQyBhbmQgaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9TY2llbnRpZmljX3BpdGNoX25vdGF0aW9uXG5cbiAgaWYobnVtYmVyIDwgMCB8fCBudW1iZXIgPiAxMjcpe1xuICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBiZXR3ZWVuIEMwIGFuZCBHMTAnO1xuICAgIHJldHVybjtcbiAgfVxuICByZXR1cm4gbnVtYmVyO1xufVxuXG5cbmZ1bmN0aW9uIF9nZXRGcmVxdWVuY3kobnVtYmVyKXtcbiAgLy9yZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbiAgcmV0dXJuIDQ0MCAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vLyBUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCByZXN1bHQgPSBrZXlzLmZpbmQoeCA9PiB4ID09PSBtb2RlKSAhPT0gdW5kZWZpbmVkO1xuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICAvL21vZGUgPSBjb25maWcuZ2V0KCdub3RlTmFtZU1vZGUnKTtcbiAgICBtb2RlID0gJ3NoYXJwJztcbiAgICB3YXJuaW5nTXNnID0gbW9kZSArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lIG1vZGUsIHVzaW5nIFwiJyArIG1vZGUgKyAnXCIgaW5zdGVhZCc7XG4gIH1cbiAgcmV0dXJuIG1vZGU7XG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBjaGFyLFxuICAgIG5hbWUgPSAnJyxcbiAgICBvY3RhdmUgPSAnJztcblxuICAvLyBleHRyYWN0IG9jdGF2ZSBmcm9tIG5vdGUgbmFtZVxuICBpZihudW1BcmdzID09PSAxKXtcbiAgICBmb3IoY2hhciBvZiBhcmcwKXtcbiAgICAgIGlmKGlzTmFOKGNoYXIpICYmIGNoYXIgIT09ICctJyl7XG4gICAgICAgIG5hbWUgKz0gY2hhcjtcbiAgICAgIH1lbHNle1xuICAgICAgICBvY3RhdmUgKz0gY2hhcjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYob2N0YXZlID09PSAnJyl7XG4gICAgICBvY3RhdmUgPSAwO1xuICAgIH1cbiAgfWVsc2UgaWYobnVtQXJncyA9PT0gMil7XG4gICAgbmFtZSA9IGFyZzA7XG4gICAgb2N0YXZlID0gYXJnMTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG5vdGUgbmFtZSBpcyB2YWxpZFxuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCBpbmRleCA9IC0xO1xuXG4gIGZvcihsZXQga2V5IG9mIGtleXMpe1xuICAgIGxldCBtb2RlID0gbm90ZU5hbWVzW2tleV07XG4gICAgaW5kZXggPSBtb2RlLmZpbmRJbmRleCh4ID0+IHggPT09IG5hbWUpO1xuICAgIGlmKGluZGV4ICE9PSAtMSl7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBpZihpbmRleCA9PT0gLTEpe1xuICAgIGVycm9yTXNnID0gYXJnMCArICcgaXMgbm90IGEgdmFsaWQgbm90ZSBuYW1lLCBwbGVhc2UgdXNlIGxldHRlcnMgQSAtIEcgYW5kIGlmIG5lY2Vzc2FyeSBhbiBhY2NpZGVudGFsIGxpa2UgIywgIyMsIGIgb3IgYmIsIGZvbGxvd2VkIGJ5IGEgbnVtYmVyIGZvciB0aGUgb2N0YXZlJztcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihvY3RhdmUgPCAtMSB8fCBvY3RhdmUgPiA5KXtcbiAgICBlcnJvck1zZyA9ICdwbGVhc2UgcHJvdmlkZSBhbiBvY3RhdmUgYmV0d2VlbiAtMSBhbmQgOSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgb2N0YXZlID0gcGFyc2VJbnQob2N0YXZlLCAxMCk7XG4gIG5hbWUgPSBuYW1lLnN1YnN0cmluZygwLCAxKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHJpbmcoMSk7XG5cbiAgLy9jb25zb2xlLmxvZyhuYW1lLCd8JyxvY3RhdmUpO1xuICByZXR1cm4gW25hbWUsIG9jdGF2ZV07XG59XG5cblxuXG5mdW5jdGlvbiBfaXNCbGFja0tleShub3RlTnVtYmVyKXtcbiAgbGV0IGJsYWNrO1xuXG4gIHN3aXRjaCh0cnVlKXtcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gMTovL0MjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDM6Ly9EI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSA2Oi8vRiNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gODovL0cjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDEwOi8vQSNcbiAgICAgIGJsYWNrID0gdHJ1ZTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBibGFjayA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJsYWNrO1xufVxuXG5cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU51bWJlciguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5udW1iZXI7XG4gIH1cbiAgcmV0dXJuIGVycm9yTXNnO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROb3RlTmFtZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5uYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU9jdGF2ZSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5vY3RhdmU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGdWxsTm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnVsbE5hbWU7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGcmVxdWVuY3koLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuZnJlcXVlbmN5O1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNCbGFja0tleSguLi5hcmdzKXtcbiAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKC4uLmFyZ3MpO1xuICBpZihub3RlKXtcbiAgICByZXR1cm4gbm90ZS5ibGFja0tleTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcyxcbiAgcHJldmlvdXNFdmVudDtcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIG1pbGxpc1BlclRpY2sgPSBzZWNvbmRzUGVyVGljayAqIDEwMDA7XG4gIC8vY29uc29sZS5sb2cobWlsbGlzUGVyVGljaywgYnBtLCBwcHEsIHBsYXliYWNrU3BlZWQsIChwcHEgKiBtaWxsaXNQZXJUaWNrKSk7XG4gIC8vY29uc29sZS5sb2cocHBxKTtcbn1cblxuXG5mdW5jdGlvbiBzZXRUaWNrc1BlckJlYXQoKXtcbiAgZmFjdG9yID0gKDQgLyBkZW5vbWluYXRvcik7XG4gIG51bVNpeHRlZW50aCA9IGZhY3RvciAqIDQ7XG4gIHRpY2tzUGVyQmVhdCA9IHBwcSAqIGZhY3RvcjtcbiAgdGlja3NQZXJCYXIgPSB0aWNrc1BlckJlYXQgKiBub21pbmF0b3I7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gcHBxIC8gNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIGlmKGRpZmZUaWNrcyA8IDApe1xuICAgIGNvbnNvbGUubG9nKGRpZmZUaWNrcywgZXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudGlja3MsIHByZXZpb3VzRXZlbnQudHlwZSlcbiAgfVxuICB0aWNrICs9IGRpZmZUaWNrcztcbiAgdGlja3MgPSBldmVudC50aWNrcztcbiAgcHJldmlvdXNFdmVudCA9IGV2ZW50XG4gIC8vY29uc29sZS5sb2coZGlmZlRpY2tzLCBtaWxsaXNQZXJUaWNrKTtcbiAgbWlsbGlzICs9IGRpZmZUaWNrcyAqIG1pbGxpc1BlclRpY2s7XG5cbiAgd2hpbGUodGljayA+PSB0aWNrc1BlclNpeHRlZW50aCl7XG4gICAgc2l4dGVlbnRoKys7XG4gICAgdGljayAtPSB0aWNrc1BlclNpeHRlZW50aDtcbiAgICB3aGlsZShzaXh0ZWVudGggPiBudW1TaXh0ZWVudGgpe1xuICAgICAgc2l4dGVlbnRoIC09IG51bVNpeHRlZW50aDtcbiAgICAgIGJlYXQrKztcbiAgICAgIHdoaWxlKGJlYXQgPiBub21pbmF0b3Ipe1xuICAgICAgICBiZWF0IC09IG5vbWluYXRvcjtcbiAgICAgICAgYmFyKys7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGltZUV2ZW50cyhzZXR0aW5ncywgdGltZUV2ZW50cyl7XG4gIC8vY29uc29sZS5sb2coJ3BhcnNlIHRpbWUgZXZlbnRzJylcbiAgbGV0IHR5cGU7XG4gIGxldCBldmVudDtcblxuICBwcHEgPSBzZXR0aW5ncy5wcHE7XG4gIGJwbSA9IHNldHRpbmdzLmJwbTtcbiAgbm9taW5hdG9yID0gc2V0dGluZ3Mubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IHNldHRpbmdzLmRlbm9taW5hdG9yO1xuICBwbGF5YmFja1NwZWVkID0gc2V0dGluZ3MucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICBsZXQgZSA9IDA7XG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICAvL2NvbnNvbGUubG9nKGUrKywgZXZlbnQudGlja3MsIGV2ZW50LnR5cGUpXG4gICAgLy9ldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuZGF0YTE7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpXG4gICAgICAgIHNldFRpY2tEdXJhdGlvbigpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgc2V0VGlja3NQZXJCZWF0KCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICAvL3RpbWUgZGF0YSBvZiB0aW1lIGV2ZW50IGlzIHZhbGlkIGZyb20gKGFuZCBpbmNsdWRlZCkgdGhlIHBvc2l0aW9uIG9mIHRoZSB0aW1lIGV2ZW50XG4gICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nKTtcbiAgfVxuXG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuLy9leHBvcnQgZnVuY3Rpb24gcGFyc2VFdmVudHMoc29uZywgZXZlbnRzKXtcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhldmVudHMpe1xuICAvL2NvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2sgPSAwXG4gIHRpY2tzID0gMFxuICBkaWZmVGlja3MgPSAwXG5cbiAgLy9sZXQgZXZlbnRzID0gW10uY29uY2F0KGV2dHMsIHNvbmcuX3RpbWVFdmVudHMpO1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuICAvL2NvbnNvbGUubG9nKGV2ZW50cylcblxuICAvLyBub3Rlb2ZmIGNvbWVzIGJlZm9yZSBub3Rlb25cblxuLypcbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pXG4qL1xuXG4gIGV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgLy8gaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgLy8gICByZXR1cm4gLTFcbiAgICAgIC8vIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgIC8vICAgcmV0dXJuIDFcbiAgICAgIC8vIH1cbiAgICAgIC8vIHNob3J0OlxuICAgICAgbGV0IHIgPSBhLnR5cGUgLSBiLnR5cGU7XG4gICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgIHIgPSAtMVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJcbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzXG4gIH0pXG4gIGV2ZW50ID0gZXZlbnRzWzBdXG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuXG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG5cbiAgZm9yKGxldCBpID0gc3RhcnRFdmVudDsgaSA8IG51bUV2ZW50czsgaSsrKXtcblxuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3NcbiAgICAgICAgdGljayArPSBkaWZmVGlja3NcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrc1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssZXZlbnQubWlsbGlzUGVyVGljayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG4gICAgICAgIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gICAgICAgIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgICAgICAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcbiAgICAgICAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gICAgICAgIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3NcbiAgICAgICAgdGljayArPSBkaWZmVGlja3NcbiAgICAgICAgdGlja3MgPSBldmVudC50aWNrc1xuICAgICAgICAvL2NvbnNvbGUubG9nKG5vbWluYXRvcixudW1TaXh0ZWVudGgsdGlja3NQZXJTaXh0ZWVudGgpO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcblxuXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgLy9jYXNlIDEyODpcbiAgICAgIC8vY2FzZSAxNDQ6XG4gICAgICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcbiAgICAgICAgdXBkYXRlRXZlbnQoZXZlbnQpO1xuICAgICAgICByZXN1bHQucHVzaChldmVudClcblxuICAgICAgICAvLyBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgICAgLy8gICBjb25zb2xlLmxvZyhldmVudC5kYXRhMiwgZXZlbnQuYmFyc0FzU3RyaW5nKVxuICAgICAgICAvLyB9XG5cbiAgICB9XG5cblxuICAgIC8vIGlmKGkgPCAxMDAgJiYgKGV2ZW50LnR5cGUgPT09IDgxIHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpKXtcbiAgICAvLyAgIC8vY29uc29sZS5sb2coaSwgdGlja3MsIGRpZmZUaWNrcywgbWlsbGlzLCBtaWxsaXNQZXJUaWNrKVxuICAgIC8vICAgY29uc29sZS5sb2coZXZlbnQudHlwZSwgZXZlbnQubWlsbGlzLCAnbm90ZScsIGV2ZW50LmRhdGExLCAndmVsbycsIGV2ZW50LmRhdGEyKVxuICAgIC8vIH1cblxuICAgIGxhc3RFdmVudFRpY2sgPSBldmVudC50aWNrcztcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xuICAvL3NvbmcubGFzdEV2ZW50VG1wID0gZXZlbnQ7XG59XG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQpe1xuICAvL2NvbnNvbGUubG9nKGJhciwgYmVhdCwgdGlja3MpXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzIC8gMTAwMDtcblxuXG4gIGV2ZW50LmJhciA9IGJhcjtcbiAgZXZlbnQuYmVhdCA9IGJlYXQ7XG4gIGV2ZW50LnNpeHRlZW50aCA9IHNpeHRlZW50aDtcbiAgZXZlbnQudGljayA9IHRpY2s7XG4gIC8vZXZlbnQuYmFyc0FzU3RyaW5nID0gKGJhciArIDEpICsgJzonICsgKGJlYXQgKyAxKSArICc6JyArIChzaXh0ZWVudGggKyAxKSArICc6JyArIHRpY2s7XG4gIHZhciB0aWNrQXNTdHJpbmcgPSB0aWNrID09PSAwID8gJzAwMCcgOiB0aWNrIDwgMTAgPyAnMDAnICsgdGljayA6IHRpY2sgPCAxMDAgPyAnMCcgKyB0aWNrIDogdGljaztcbiAgZXZlbnQuYmFyc0FzU3RyaW5nID0gYmFyICsgJzonICsgYmVhdCArICc6JyArIHNpeHRlZW50aCArICc6JyArIHRpY2tBc1N0cmluZztcbiAgZXZlbnQuYmFyc0FzQXJyYXkgPSBbYmFyLCBiZWF0LCBzaXh0ZWVudGgsIHRpY2tdO1xuXG5cbiAgdmFyIHRpbWVEYXRhID0gZ2V0TmljZVRpbWUobWlsbGlzKTtcblxuICBldmVudC5ob3VyID0gdGltZURhdGEuaG91cjtcbiAgZXZlbnQubWludXRlID0gdGltZURhdGEubWludXRlO1xuICBldmVudC5zZWNvbmQgPSB0aW1lRGF0YS5zZWNvbmQ7XG4gIGV2ZW50Lm1pbGxpc2Vjb25kID0gdGltZURhdGEubWlsbGlzZWNvbmQ7XG4gIGV2ZW50LnRpbWVBc1N0cmluZyA9IHRpbWVEYXRhLnRpbWVBc1N0cmluZztcbiAgZXZlbnQudGltZUFzQXJyYXkgPSB0aW1lRGF0YS50aW1lQXNBcnJheTtcblxuICAvLyBpZihtaWxsaXMgPCAwKXtcbiAgLy8gICBjb25zb2xlLmxvZyhldmVudClcbiAgLy8gfVxufVxuXG5cbmxldCBtaWRpTm90ZUluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VNSURJTm90ZXMoZXZlbnRzKXtcbiAgbGV0IG5vdGVzID0ge31cbiAgbGV0IG5vdGVzSW5UcmFja1xuICBsZXQgbiA9IDBcbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKHR5cGVvZiBldmVudC5wYXJ0SWQgPT09ICd1bmRlZmluZWQnIHx8IHR5cGVvZiBldmVudC50cmFja0lkID09PSAndW5kZWZpbmVkJyl7XG4gICAgICBjb25zb2xlLmxvZygnbm8gcGFydCBhbmQvb3IgdHJhY2sgc2V0JylcbiAgICAgIGNvbnRpbnVlXG4gICAgfVxuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC50cmFja0lkXVxuICAgICAgaWYodHlwZW9mIG5vdGVzSW5UcmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBub3Rlc0luVHJhY2sgPSBub3Rlc1tldmVudC50cmFja0lkXSA9IHt9XG4gICAgICB9XG4gICAgICBub3Rlc0luVHJhY2tbZXZlbnQuZGF0YTFdID0gZXZlbnRcbiAgICB9ZWxzZSBpZihldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQudHJhY2tJZF1cbiAgICAgIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgLy9jb25zb2xlLmluZm8obisrLCAnbm8gY29ycmVzcG9uZGluZyBub3Rlb24gZXZlbnQgZm91bmQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG4gICAgICBsZXQgbm90ZU9uID0gbm90ZXNJblRyYWNrW2V2ZW50LmRhdGExXVxuICAgICAgbGV0IG5vdGVPZmYgPSBldmVudFxuICAgICAgaWYodHlwZW9mIG5vdGVPbiA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvL2NvbnNvbGUuaW5mbyhuKyssICdubyBub3Rlb24gZXZlbnQgZm9yIGV2ZW50JywgZXZlbnQuaWQpXG4gICAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC50cmFja0lkXVtldmVudC5kYXRhMV1cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cbiAgICAgIGxldCBpZCA9IGBNTl8ke21pZGlOb3RlSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gICAgICBub3RlT24ubWlkaU5vdGVJZCA9IGlkXG4gICAgICBub3RlT24ub2ZmID0gbm90ZU9mZi5pZFxuICAgICAgbm90ZU9mZi5taWRpTm90ZUlkID0gaWRcbiAgICAgIG5vdGVPZmYub24gPSBub3RlT24uaWRcbiAgICAgIGRlbGV0ZSBub3Rlc1tldmVudC50cmFja0lkXVtldmVudC5kYXRhMV1cbiAgICB9XG4gIH1cbiAgT2JqZWN0LmtleXMobm90ZXMpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBkZWxldGUgbm90ZXNba2V5XVxuICB9KVxuICAvL2NvbnNvbGUubG9nKG5vdGVzLCBub3Rlc0luVHJhY2spXG59XG5cblxuLy8gbm90IGluIHVzZSFcbmV4cG9ydCBmdW5jdGlvbiBmaWx0ZXJFdmVudHMoZXZlbnRzKXtcbiAgbGV0IHN1c3RhaW4gPSB7fVxuICBsZXQgdG1wUmVzdWx0ID0ge31cbiAgbGV0IHJlc3VsdCA9IFtdXG4gIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICBpZihldmVudC50eXBlID09PSAxNzYgJiYgZXZlbnQuZGF0YTEgPT09IDY0KXtcbiAgICAgIGlmKGV2ZW50LmRhdGEyID09PSAwKXtcbiAgICAgICAgaWYodHlwZW9mIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9ZWxzZSBpZihzdXN0YWluW2V2ZW50LnRyYWNrSWRdID09PSBldmVudC50aWNrcyl7XG4gICAgICAgICAgZGVsZXRlIHRtcFJlc3VsdFtldmVudC50aWNrc11cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG4gICAgICAgIHRtcFJlc3VsdFtldmVudC50aWNrc10gPSBldmVudFxuICAgICAgICBkZWxldGUgc3VzdGFpbltldmVudC50cmFja0lkXVxuICAgICAgfWVsc2UgaWYoZXZlbnQuZGF0YTIgPT09IDEyNyl7XG4gICAgICAgIHN1c3RhaW5bZXZlbnQudHJhY2tJZF0gPSBldmVudC50aWNrc1xuICAgICAgICB0bXBSZXN1bHRbZXZlbnQudGlja3NdID0gZXZlbnRcbiAgICAgIH1cbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cbiAgfVxuICBjb25zb2xlLmxvZyhzdXN0YWluKVxuICBPYmplY3Qua2V5cyh0bXBSZXN1bHQpLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICBsZXQgc3VzdGFpbkV2ZW50ID0gdG1wUmVzdWx0W2tleV1cbiAgICBjb25zb2xlLmxvZyhzdXN0YWluRXZlbnQpXG4gICAgcmVzdWx0LnB1c2goc3VzdGFpbkV2ZW50KVxuICB9KVxuICByZXR1cm4gcmVzdWx0XG59XG4iLCJpbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7XG4gIENSRUFURV9QQVJULFxuICBBRERfTUlESV9FVkVOVFMsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBwYXJ0SW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVQYXJ0KFxuICBzZXR0aW5nczoge1xuICAgIG5hbWU6IHN0cmluZyxcbiAgICB0cmFja0lkOiBzdHJpbmcsXG4gICAgbWlkaUV2ZW50SWRzOkFycmF5PHN0cmluZz4sXG4gICAgbWlkaU5vdGVJZHM6QXJyYXk8c3RyaW5nPixcbiAgfSA9IHt9XG4pe1xuICBsZXQgaWQgPSBgTVBfJHtwYXJ0SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCB7XG4gICAgbmFtZSA9IGlkLFxuICAgIG1pZGlFdmVudElkcyA9IFtdLFxuICAgIG1pZGlOb3RlSWRzID0gW10sXG4gICAgdHJhY2tJZCA9ICdub25lJ1xuICB9ID0gc2V0dGluZ3NcblxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX1BBUlQsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBuYW1lLFxuICAgICAgbWlkaUV2ZW50SWRzLFxuICAgICAgbWlkaU5vdGVJZHMsXG4gICAgICB0cmFja0lkLFxuICAgICAgbXV0ZTogZmFsc2VcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50cyhwYXJ0X2lkOiBzdHJpbmcsIC4uLm1pZGlfZXZlbnRfaWRzKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9NSURJX0VWRU5UUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBwYXJ0X2lkLFxuICAgICAgbWlkaV9ldmVudF9pZHNcbiAgICB9XG4gIH0pXG59XG4iLCJpbXBvcnQge1xuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcbn0gZnJvbSAnLi9taWRpX2V2ZW50J1xuXG5pbXBvcnR7XG4gIGNyZWF0ZU1JRElOb3RlLFxufSBmcm9tICcuL21pZGlfbm90ZSdcblxuaW1wb3J0e1xuICBjcmVhdGVTb25nLFxuICBhZGRUcmFja3MsXG4gIHVwZGF0ZVNvbmcsXG4gIHN0YXJ0U29uZyxcbiAgc3RvcFNvbmcsXG4gIGdldFRyYWNrSWRzLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydHtcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuICBzZXRJbnN0cnVtZW50LFxuICBzZXRNSURJT3V0cHV0SWRzLFxufSBmcm9tICcuL3RyYWNrJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0IHtcbiAgcGFyc2VNSURJRmlsZVxufSBmcm9tICcuL21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBzb25nRnJvbU1JRElGaWxlXG59IGZyb20gJy4vc29uZ19mcm9tX21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBJbnN0cnVtZW50LFxufSBmcm9tICcuL2luc3RydW1lbnQnXG5cbmltcG9ydCB7XG4gIGluaXQsXG59IGZyb20gJy4vaW5pdCdcblxuaW1wb3J0IHtcbiAgY29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG59IGZyb20gJy4vaW5pdF9hdWRpbydcblxuaW1wb3J0IHtcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcbn0gZnJvbSAnLi9pbml0X21pZGknXG5cbmltcG9ydCB7XG4gIHBhcnNlU2FtcGxlcyxcbn0gZnJvbSAnLi91dGlsJ1xuXG5cbmNvbnN0IGdldEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiBjb250ZXh0XG59XG5cbmNvbnN0IHFhbWJpID0ge1xuICB2ZXJzaW9uOiAnMC4wLjEnLFxuXG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbiAgZ2V0VHJhY2tJZHMsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgc2V0SW5zdHJ1bWVudCxcbiAgc2V0TUlESU91dHB1dElkcyxcblxuICAvLyBmcm9tIC4vcGFydFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcblxuICBsb2c6IGZ1bmN0aW9uKGlkKXtcbiAgICBpZihpZCA9PT0gJ2Z1bmN0aW9ucycpe1xuICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgY3JlYXRlTUlESUV2ZW50XG4gICAgICAgIG1vdmVNSURJRXZlbnRcbiAgICAgICAgbW92ZU1JRElFdmVudFRvXG4gICAgICAgIGNyZWF0ZU1JRElOb3RlXG4gICAgICAgIGNyZWF0ZVNvbmdcbiAgICAgICAgYWRkVHJhY2tzXG4gICAgICAgIGNyZWF0ZVRyYWNrXG4gICAgICAgIGFkZFBhcnRzXG4gICAgICAgIGNyZWF0ZVBhcnRcbiAgICAgICAgYWRkTUlESUV2ZW50c1xuICAgICAgYClcbiAgICB9XG4gIH1cbn1cblxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbi8vY29uc3QgTUlESSA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0VPWCcsIHt2YWx1ZTogMjQ3fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSk7XG5cbmV4cG9ydCBkZWZhdWx0IHFhbWJpXG5cbmV4cG9ydCB7XG4gIC8vIGZyb20gLi91dGlsXG4gIHBhcnNlU2FtcGxlcyxcblxuICAvLyBmcm9tIC4vaW5pdFxuICBpbml0LFxuXG4gIC8vIGZyb20gLi9pbml0X2F1ZGlvXG4gIGdldEF1ZGlvQ29udGV4dCxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBzZXRNYXN0ZXJWb2x1bWUsXG5cbiAgLy8gLi9pbml0X21pZGlcbiAgZ2V0TUlESUFjY2VzcyxcbiAgZ2V0TUlESUlucHV0cyxcbiAgZ2V0TUlESU91dHB1dHMsXG4gIGdldE1JRElJbnB1dElkcyxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgZ2V0TUlESUlucHV0c0J5SWQsXG4gIGdldE1JRElPdXRwdXRzQnlJZCxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcbiAgZ2V0VHJhY2tJZHMsXG5cbiAgLy8gZnJvbSAuL3RyYWNrXG4gIGNyZWF0ZVRyYWNrLFxuICBhZGRQYXJ0cyxcbiAgc2V0SW5zdHJ1bWVudCxcbiAgc2V0TUlESU91dHB1dElkcyxcblxuICAvLyBmcm9tIC4vcGFydFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuXG4gIC8vIGZyb20gLi9pbnN0cnVtZW50XG4gIEluc3RydW1lbnQsXG5cbi8vICBNSURJLFxuXG4gIHBhcnNlTUlESUZpbGUsXG4gIHNvbmdGcm9tTUlESUZpbGUsXG59XG4iLCJpbXBvcnQge2NvbWJpbmVSZWR1Y2Vyc30gZnJvbSAncmVkdXgnXG5pbXBvcnQge1xuICAvLyBmb3IgZWRpdG9yXG4gIENSRUFURV9TT05HLFxuICBDUkVBVEVfVFJBQ0ssXG4gIENSRUFURV9QQVJULFxuICBBRERfUEFSVFMsXG4gIEFERF9UUkFDS1MsXG4gIEFERF9NSURJX05PVEVTLFxuICBBRERfTUlESV9FVkVOVFMsXG4gIEFERF9USU1FX0VWRU5UUyxcbiAgQ1JFQVRFX01JRElfRVZFTlQsXG4gIENSRUFURV9NSURJX05PVEUsXG4gIEFERF9FVkVOVFNfVE9fU09ORyxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG4gIFVQREFURV9NSURJX05PVEUsXG4gIFVQREFURV9TT05HLFxuICBTRVRfSU5TVFJVTUVOVCxcbiAgU0VUX01JRElfT1VUUFVUX0lEUyxcblxuICAvLyBmb3Igc2VxdWVuY2VyIG9ubHlcbiAgU09OR19QT1NJVElPTixcbiAgU1RBUlRfU0NIRURVTEVSLFxuICBTVE9QX1NDSEVEVUxFUixcblxuICAvLyBmb3IgaW5zdHJ1bWVudCBvbmx5XG4gIENSRUFURV9JTlNUUlVNRU5ULFxuICBTVE9SRV9TQU1QTEVTLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3QgaW5pdGlhbFN0YXRlID0ge1xuICBlbnRpdGllczoge30sXG59XG5cblxuZnVuY3Rpb24gZWRpdG9yKHN0YXRlID0gaW5pdGlhbFN0YXRlLCBhY3Rpb24pe1xuXG4gIGxldFxuICAgIGV2ZW50LCBldmVudElkLFxuICAgIHNvbmcsIHNvbmdJZCxcbiAgICBtaWRpRXZlbnRzXG5cbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcblxuICAgIGNhc2UgQ1JFQVRFX1NPTkc6XG4gICAgY2FzZSBDUkVBVEVfVFJBQ0s6XG4gICAgY2FzZSBDUkVBVEVfUEFSVDpcbiAgICBjYXNlIENSRUFURV9NSURJX0VWRU5UOlxuICAgIGNhc2UgQ1JFQVRFX01JRElfTk9URTpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUuZW50aXRpZXNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX1RSQUNLUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc29uZ0lkID0gYWN0aW9uLnBheWxvYWQuc29uZ19pZFxuICAgICAgc29uZyA9IHN0YXRlLmVudGl0aWVzW3NvbmdJZF1cbiAgICAgIGlmKHNvbmcpe1xuICAgICAgICBsZXQgdHJhY2tJZHMgPSBhY3Rpb24ucGF5bG9hZC50cmFja19pZHNcbiAgICAgICAgdHJhY2tJZHMuZm9yRWFjaChmdW5jdGlvbih0cmFja0lkKXtcbiAgICAgICAgICBsZXQgdHJhY2sgPSBzdGF0ZS5lbnRpdGllc1t0cmFja0lkXVxuICAgICAgICAgIGlmKHRyYWNrKXtcbiAgICAgICAgICAgIHNvbmcudHJhY2tJZHMucHVzaCh0cmFja0lkKVxuICAgICAgICAgICAgdHJhY2suc29uZ0lkID0gc29uZ0lkXG4gICAgICAgICAgICBsZXQgbWlkaUV2ZW50SWRzID0gW11cbiAgICAgICAgICAgIHRyYWNrLnBhcnRJZHMuZm9yRWFjaChmdW5jdGlvbihwYXJ0SWQpe1xuICAgICAgICAgICAgICBsZXQgcGFydCA9IHN0YXRlLmVudGl0aWVzW3BhcnRJZF1cbiAgICAgICAgICAgICAgc29uZy5wYXJ0SWRzLnB1c2gocGFydElkKVxuICAgICAgICAgICAgICBtaWRpRXZlbnRJZHMucHVzaCguLi5wYXJ0Lm1pZGlFdmVudElkcylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBtaWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihldmVudElkKXtcbiAgICAgICAgICAgICAgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tldmVudElkXVxuICAgICAgICAgICAgICBldmVudC5zb25nSWQgPSBzb25nSWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBzb25nLm5ld0V2ZW50SWRzLnB1c2goLi4ubWlkaUV2ZW50SWRzKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyB0cmFjayB3aXRoIGlkICR7dHJhY2tJZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHNvbmcgZm91bmQgd2l0aCBpZCAke3NvbmdJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfUEFSVFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCB0cmFja0lkID0gYWN0aW9uLnBheWxvYWQudHJhY2tfaWRcbiAgICAgIGxldCB0cmFjayA9IHN0YXRlLmVudGl0aWVzW3RyYWNrSWRdXG4gICAgICBpZih0cmFjayl7XG4gICAgICAgIC8vdHJhY2sucGFydHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5wYXJ0X2lkcylcbiAgICAgICAgbGV0IHBhcnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5wYXJ0X2lkc1xuICAgICAgICBwYXJ0SWRzLmZvckVhY2goZnVuY3Rpb24oaWQpe1xuICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUuZW50aXRpZXNbaWRdXG4gICAgICAgICAgaWYocGFydCl7XG4gICAgICAgICAgICB0cmFjay5wYXJ0SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBwYXJ0LnRyYWNrSWQgPSB0cmFja0lkXG4gICAgICAgICAgICBwYXJ0Lm1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICAgICAgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tpZF1cbiAgICAgICAgICAgICAgZXZlbnQudHJhY2tJZCA9IHRyYWNrSWRcbiAgICAgICAgICAgICAgLy9ldmVudC5pbnN0cnVtZW50SWQgPSB0cmFjay5pbnN0cnVtZW50SWRcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIHBhcnQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gdHJhY2sgZm91bmQgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQUREX01JRElfRVZFTlRTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgcGFydElkID0gYWN0aW9uLnBheWxvYWQucGFydF9pZFxuICAgICAgbGV0IHBhcnQgPSBzdGF0ZS5lbnRpdGllc1twYXJ0SWRdXG4gICAgICBpZihwYXJ0KXtcbiAgICAgICAgLy9wYXJ0Lm1pZGlFdmVudHMucHVzaCguLi5hY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkcylcbiAgICAgICAgbGV0IG1pZGlFdmVudElkcyA9IGFjdGlvbi5wYXlsb2FkLm1pZGlfZXZlbnRfaWRzXG4gICAgICAgIG1pZGlFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgbWlkaUV2ZW50ID0gc3RhdGUuZW50aXRpZXNbaWRdXG4gICAgICAgICAgaWYobWlkaUV2ZW50KXtcbiAgICAgICAgICAgIHBhcnQubWlkaUV2ZW50SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBtaWRpRXZlbnQucGFydElkID0gcGFydElkXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIE1JREkgZXZlbnQgZm91bmQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCBmb3VuZCB3aXRoIGlkICR7cGFydElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX0VWRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBldmVudElkID0gYWN0aW9uLnBheWxvYWQuZXZlbnRJZFxuICAgICAgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tldmVudElkXTtcbiAgICAgIGlmKGV2ZW50KXtcbiAgICAgICAgKHtcbiAgICAgICAgICB0aWNrczogZXZlbnQudGlja3MgPSBldmVudC50aWNrcyxcbiAgICAgICAgICBkYXRhMTogZXZlbnQuZGF0YTEgPSBldmVudC5kYXRhMSxcbiAgICAgICAgICBkYXRhMjogZXZlbnQuZGF0YTIgPSBldmVudC5kYXRhMixcbiAgICAgICAgfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7ZXZlbnRJZH1gKVxuICAgICAgfVxuICAgICAgaWYoYWN0aW9uLnBheWxvYWQuc29uZ0lkICE9PSBmYWxzZSl7XG4gICAgICAgIHNvbmcgPSBzdGF0ZS5lbnRpdGllc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdXG4gICAgICAgIHNvbmcubW92ZWRFdmVudElkcy5wdXNoKGV2ZW50SWQpXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX05PVEU6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCBub3RlID0gc3RhdGUuZW50aXRpZXNbYWN0aW9uLnBheWxvYWQuaWRdO1xuICAgICAgKHtcbiAgICAgICAgLy8gaWYgdGhlIHBheWxvYWQgaGFzIGEgdmFsdWUgZm9yICdzdGFydCcgaXQgd2lsbCBiZSBhc3NpZ25lZCB0byBub3RlLnN0YXJ0LCBvdGhlcndpc2Ugbm90ZS5zdGFydCB3aWxsIGtlZXAgaXRzIGN1cnJlbnQgdmFsdWVcbiAgICAgICAgc3RhcnQ6IG5vdGUuc3RhcnQgPSBub3RlLnN0YXJ0LFxuICAgICAgICBlbmQ6IG5vdGUuZW5kID0gbm90ZS5lbmQsXG4gICAgICAgIGR1cmF0aW9uVGlja3M6IG5vdGUuZHVyYXRpb25UaWNrcyA9IG5vdGUuZHVyYXRpb25UaWNrc1xuICAgICAgfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBVUERBVEVfU09ORzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfTtcbiAgICAgIHNvbmcgPSBzdGF0ZS5lbnRpdGllc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdO1xuICAgICAgKHtcbiAgICAgICAgdXBkYXRlVGltZUV2ZW50czogc29uZy51cGRhdGVUaW1lRXZlbnRzLFxuICAgICAgICBtaWRpRXZlbnRzOiBzb25nLm1pZGlFdmVudHMsXG4gICAgICAgIG1pZGlFdmVudHNNYXA6IHNvbmcubWlkaUV2ZW50c01hcCxcbiAgICAgICAgbmV3RXZlbnRJZHM6IHNvbmcubmV3RXZlbnRJZHMsXG4gICAgICAgIG1vdmVkRXZlbnRJZHM6IHNvbmcubW92ZWRFdmVudElkcyxcbiAgICAgICAgcmVtb3ZlZEV2ZW50SWRzOiBzb25nLnJlbW92ZWRFdmVudElkcyxcbiAgICAgIH0gPSBhY3Rpb24ucGF5bG9hZClcblxuICAgICAgLy8gc29uZy5taWRpRXZlbnRzTWFwLmZvckVhY2goZnVuY3Rpb24oZXZlbnRJZCwgZXZlbnQpe1xuICAgICAgLy8gICAvLyByZXBsYWNlIGV2ZW50IHdpdGggdXBkYXRlZCBldmVudFxuICAgICAgLy8gICBzdGF0ZS5lbnRpdGllc1tldmVudElkXSA9IGV2ZW50O1xuICAgICAgLy8gfSlcbiAgICAgIHNvbmcubWlkaUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgLy8gcmVwbGFjZSBldmVudCB3aXRoIHVwZGF0ZWQgZXZlbnRcbiAgICAgICAgc3RhdGUuZW50aXRpZXNbZXZlbnQuaWRdID0gZXZlbnQ7XG4gICAgICB9KVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTRVRfSU5TVFJVTUVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfTtcbiAgICAgIHN0YXRlLmVudGl0aWVzW2FjdGlvbi5wYXlsb2FkLnRyYWNrSWRdLmluc3RydW1lbnQgPSBhY3Rpb24ucGF5bG9hZC5pbnN0cnVtZW50XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFNFVF9NSURJX09VVFBVVF9JRFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX07XG4gICAgICBzdGF0ZS5lbnRpdGllc1thY3Rpb24ucGF5bG9hZC50cmFja0lkXS5NSURJT3V0cHV0SWRzID0gYWN0aW9uLnBheWxvYWQub3V0cHV0SWRzXG4gICAgICBicmVha1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxuICByZXR1cm4gc3RhdGVcbn1cblxuLy8gc3RhdGUgd2hlbiBhIHNvbmcgaXMgcGxheWluZ1xuZnVuY3Rpb24gc2VxdWVuY2VyKHN0YXRlID0ge3NvbmdzOiB7fX0sIGFjdGlvbil7XG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG5cbiAgICBjYXNlIFVQREFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdID0ge1xuICAgICAgICBzb25nSWQ6IGFjdGlvbi5wYXlsb2FkLnNvbmdJZCxcbiAgICAgICAgbWlkaUV2ZW50czogYWN0aW9uLnBheWxvYWQubWlkaUV2ZW50cyxcbiAgICAgICAgc2V0dGluZ3M6IGFjdGlvbi5wYXlsb2FkLnNldHRpbmdzLFxuICAgICAgICBwbGF5aW5nOiBmYWxzZSxcbiAgICAgIH1cbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgU1RBUlRfU0NIRURVTEVSOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdLnNjaGVkdWxlciA9IGFjdGlvbi5wYXlsb2FkLnNjaGVkdWxlclxuICAgICAgc3RhdGUuc29uZ3NbYWN0aW9uLnBheWxvYWQuc29uZ0lkXS5wbGF5aW5nID0gdHJ1ZVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTVE9QX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgZGVsZXRlIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdJZF0uc2NoZWR1bGVyXG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdLnBsYXlpbmcgPSBmYWxzZVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTT05HX1BPU0lUSU9OOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nSWRdLnBvc2l0aW9uID0gYWN0aW9uLnBheWxvYWQucG9zaXRpb25cbiAgICAgIGJyZWFrXG5cblxuICAgIGRlZmF1bHQ6XG4gICAgICAvLyBkbyBub3RoaW5nXG4gIH1cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cbmZ1bmN0aW9uIGd1aShzdGF0ZSA9IHt9LCBhY3Rpb24pe1xuICByZXR1cm4gc3RhdGU7XG59XG5cblxuZnVuY3Rpb24gaW5zdHJ1bWVudHMoc3RhdGUgPSB7fSwgYWN0aW9uKXtcbiAgc3dpdGNoKGFjdGlvbi50eXBlKXtcbiAgICBjYXNlIENSRUFURV9JTlNUUlVNRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZVthY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZC5pbnN0cnVtZW50XG4gICAgICAvL3N0YXRlID0gey4uLnN0YXRlLCAuLi57W2FjdGlvbi5wYXlsb2FkLmlkXTogYWN0aW9uLnBheWxvYWQuaW5zdHJ1bWVudH19XG4gICAgICBicmVha1xuXG4gICAgY2FzZSBTVE9SRV9TQU1QTEVTOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBjb25zb2xlLmxvZyhhY3Rpb24ucGF5bG9hZClcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5jb25zdCBzZXF1ZW5jZXJBcHAgPSBjb21iaW5lUmVkdWNlcnMoe1xuICBndWksXG4gIGVkaXRvcixcbiAgc2VxdWVuY2VyLFxuICBpbnN0cnVtZW50cyxcbn0pXG5cblxuZXhwb3J0IGRlZmF1bHQgc2VxdWVuY2VyQXBwXG4iLCJpbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpby5qcydcbi8vaW1wb3J0IHtnZXRFcXVhbFBvd2VyQ3VydmV9IGZyb20gJy4vdXRpbC5qcydcblxuXG5jbGFzcyBTYW1wbGV7XG5cbiAgY29uc3RydWN0b3Ioc2FtcGxlRGF0YSwgZXZlbnQpe1xuICAgIHRoaXMuZXZlbnQgPSBldmVudFxuICAgIHRoaXMuc2FtcGxlRGF0YSA9IHNhbXBsZURhdGFcbiAgICBpZih0aGlzLnNhbXBsZURhdGEgPT09IC0xKXtcbiAgICAgIC8vIGNyZWF0ZSBzaW1wbGUgc3ludGggc2FtcGxlXG4gICAgICB0aGlzLnNvdXJjZSA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzaW5lJztcbiAgICAgIHRoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpXG4gICAgICB0aGlzLnNvdXJjZS5idWZmZXIgPSBzYW1wbGVEYXRhLmQ7XG4gICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc291cmNlLmJ1ZmZlcilcbiAgICB9XG4gICAgdGhpcy5vdXRwdXQgPSBjb250ZXh0LmNyZWF0ZUdhaW4oKVxuICAgIHRoaXMudm9sdW1lID0gZXZlbnQuZGF0YTIgLyAxMjdcbiAgICB0aGlzLm91dHB1dC5nYWluLnZhbHVlID0gdGhpcy52b2x1bWVcbiAgICB0aGlzLnNvdXJjZS5jb25uZWN0KHRoaXMub3V0cHV0KVxuICAgIC8vdGhpcy5vdXRwdXQuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuICB9XG5cbiAgc3RhcnQodGltZSl7XG4gICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvdXJjZSk7XG4gICAgdGhpcy5zb3VyY2Uuc3RhcnQodGltZSk7XG4gIH1cblxuICBzdG9wKHRpbWUsIGNiKXtcbiAgICBpZih0aGlzLnNhbXBsZURhdGEuciAmJiB0aGlzLnNhbXBsZURhdGEuZSl7XG4gICAgICB0aGlzLnNvdXJjZS5zdG9wKHRpbWUgKyB0aGlzLnNhbXBsZURhdGEucik7XG4gICAgICBmYWRlT3V0KHRoaXMub3V0cHV0LCB7XG4gICAgICAgIHJlbGVhc2VFbnZlbG9wZTogdGhpcy5zYW1wbGVEYXRhLmUsXG4gICAgICAgIHJlbGVhc2VEdXJhdGlvbjogdGhpcy5zYW1wbGVEYXRhLnIsXG4gICAgICB9KVxuICAgIH1lbHNle1xuICAgICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKTtcbiAgICB9XG5cbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2I7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZmFkZU91dChnYWluTm9kZSwgc2V0dGluZ3Mpe1xuICBsZXQgbm93ID0gY29udGV4dC5jdXJyZW50VGltZVxuICBsZXQgdmFsdWVzLCBpLCBtYXhpXG5cbiAgLy9jb25zb2xlLmxvZyhzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpXG4gIHN3aXRjaChzZXR0aW5ncy5yZWxlYXNlRW52ZWxvcGUpe1xuXG4gICAgY2FzZSAnbGluZWFyJzpcbiAgICAgIGdhaW5Ob2RlLmdhaW4ubGluZWFyUmFtcFRvVmFsdWVBdFRpbWUoZ2Fpbk5vZGUuZ2Fpbi52YWx1ZSwgbm93KVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSgwLCBub3cgKyBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnZXF1YWwgcG93ZXInOlxuICAgICAgdmFsdWVzID0gZ2V0RXF1YWxQb3dlckN1cnZlKDEwMCwgJ2ZhZGVPdXQnLCBnYWluTm9kZS5nYWluLnZhbHVlKVxuICAgICAgZ2Fpbk5vZGUuZ2Fpbi5zZXRWYWx1ZUN1cnZlQXRUaW1lKHZhbHVlcywgbm93LCBzZXR0aW5ncy5yZWxlYXNlRHVyYXRpb24pXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAnYXJyYXknOlxuICAgICAgbWF4aSA9IHNldHRpbmdzLnJlbGVhc2VFbnZlbG9wZUFycmF5Lmxlbmd0aFxuICAgICAgdmFsdWVzID0gbmV3IEZsb2F0MzJBcnJheShtYXhpKVxuICAgICAgZm9yKGkgPSAwOyBpIDwgbWF4aTsgaSsrKXtcbiAgICAgICAgdmFsdWVzW2ldID0gc2V0dGluZ3MucmVsZWFzZUVudmVsb3BlQXJyYXlbaV0gKiBnYWluTm9kZS5nYWluLnZhbHVlXG4gICAgICB9XG4gICAgICBnYWluTm9kZS5nYWluLnNldFZhbHVlQ3VydmVBdFRpbWUodmFsdWVzLCBub3csIHNldHRpbmdzLnJlbGVhc2VEdXJhdGlvbilcbiAgICAgIGJyZWFrXG5cbiAgICBkZWZhdWx0OlxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEVxdWFsUG93ZXJDdXJ2ZShudW1TdGVwcywgdHlwZSwgbWF4VmFsdWUpIHtcbiAgbGV0IGksIHZhbHVlLCBwZXJjZW50LFxuICAgIHZhbHVlcyA9IG5ldyBGbG9hdDMyQXJyYXkobnVtU3RlcHMpO1xuXG4gIGZvcihpID0gMDsgaSA8IG51bVN0ZXBzOyBpKyspe1xuICAgIHBlcmNlbnQgPSBpIC8gbnVtU3RlcHM7XG4gICAgaWYodHlwZSA9PT0gJ2ZhZGVJbicpe1xuICAgICAgdmFsdWUgPSBNYXRoLmNvcygoMS4wIC0gcGVyY2VudCkgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlO1xuICAgIH1lbHNlIGlmKHR5cGUgPT09ICdmYWRlT3V0Jyl7XG4gICAgICB2YWx1ZSA9IE1hdGguY29zKHBlcmNlbnQgKiAwLjUgKiBNYXRoLlBJKSAqIG1heFZhbHVlO1xuICAgIH1cbiAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICBpZihpID09PSBudW1TdGVwcyAtIDEpe1xuICAgICAgdmFsdWVzW2ldID0gdHlwZSA9PT0gJ2ZhZGVJbicgPyAxIDogMDtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKC4uLmFyZ3Mpe1xuICByZXR1cm4gbmV3IFNhbXBsZSguLi5hcmdzKVxufVxuXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJlbXB0eU9nZ1wiOiBcIlQyZG5Vd0FDQUFBQUFBQUFBQUJkeGQ0WEFBQUFBRGFTMGpRQkhnRjJiM0ppYVhNQUFBQUFBVVNzQUFBQUFBQUFnTHNBQUFBQUFBQzRBVTluWjFNQUFBQUFBQUFBQUFBQVhjWGVGd0VBQUFBYVhLK1FEejMvLy8vLy8vLy8vLy8vLy8vL01nTjJiM0ppYVhNdEFBQUFXR2x3YUM1UGNtY2diR2xpVm05eVltbHpJRWtnTWpBeE1ERXhNREVnS0ZOamFHRjFabVZ1ZFdkblpYUXBBQUFBQUFFRmRtOXlZbWx6SDBKRFZnRUFBQUVBR0dOVUtVYVpVdEpLaVJsemxERkdtV0tTU29tbGhCWkNTSjF6RkZPcE9kZWNhNnk1dFNDRUVCcFRVQ2tGbVZLT1Vta1pZNUFwQlpsU0VFdEpKWFFTT2llZFl4QmJTY0hXbUd1TFFiWWNoQTJhVWt3cHhKUlNpa0lJR1ZPTUtjV1VVa3BDQnlWMERqcm1IRk9PU2loQnVKeHpxN1dXbG1PTHFYU1NTdWNrWkV4Q1NDbUZra29IcFZOT1FrZzFsdFpTS1IxelVsSnFRZWdnaEJCQ3RpQ0VEWUxRa0ZVQUFBRUF3RUFRR3JJS0FGQUFBQkNLb1JpS0FvU0dyQUlBTWdBQUJLQW9qdUlvamlNNWttTkpGaEFhc2dvQUFBSUFFQUFBd0hBVVNaRVV5YkVrUzlJc1M5TkVVVlY5MVRaVlZmWjFYZGQxWGRkMUlEUmtGUUFBQVFCQVNLZVpwUm9nd2d4a0dBZ05XUVVBSUFBQUFFWW93aEFEUWtOV0FRQUFBUUFBWWlnNWlDYTA1bnh6am9ObU9XZ3F4ZVowY0NMVjVrbHVLdWJtbkhQT09TZWJjOFk0NTV4emluSm1NV2dtdE9hY2N4S0RaaWxvSnJUbW5IT2V4T1pCYTZxMDVweHp4am1uZzNGR0dPZWNjNXEwNWtGcU50Ym1uSE1XdEtZNWFpN0Y1cHh6SXVYbVNXMHUxZWFjYzg0NTU1eHp6am5ubkhPcUY2ZHpjRTQ0NTV4em92Ym1XbTVDRitlY2N6NFpwM3R6UWpqbm5IUE9PZWVjYzg0NTU1eHpndENRVlFBQUVBQUFRUmcyaG5HbklFaWZvNEVZUllocHlLUUgzYVBESkdnTWNncXBSNk9qa1ZMcUlKUlV4a2twblNBMFpCVUFBQWdBQUNHRUZGSklJWVVVVWtnaGhSUlNpQ0dHR0dMSUthZWNnZ29xcWFTaWlqTEtMTFBNTXNzc3M4d3k2N0N6empyc01NUVFRd3l0dEJKTFRiWFZXR090dWVlY2F3N1NXbW10dGRaS0thV1VVa29wQ0ExWkJRQ0FBQUFRQ0Jsa2tFRkdJWVVVVW9naHBweHl5aW1vb0FKQ1ExWUJBSUFBQUFJQUFBQTh5WE5FUjNSRVIzUkVSM1JFUjNSRXgzTThSNVJFU1pSRVNiUk15OVJNVHhWVjFaVmRXOVpsM2ZadFlSZDIzZmQxMy9kMTQ5ZUZZVm1XWlZtV1pWbVdaVm1XWlZtV1pWbUMwSkJWQUFBSUFBQ0FFRUlJSVlVVVVrZ2hwUmhqekRIbm9KTlFRaUEwWkJVQUFBZ0FJQUFBQU1CUkhNVnhKRWR5Sk1tU0xFbVRORXV6UE0zVFBFMzBSRkVVVGROVVJWZDBSZDIwUmRtVVRkZDBUZGwwVlZtMVhWbTJiZG5XYlYrV2JkLzNmZC8zZmQvM2ZkLzNmZC8zZFIwSURWa0ZBRWdBQU9oSWpxUklpcVJJanVNNGtpUUJvU0dyQUFBWkFBQUJBQ2lLb3ppTzQwaVNKRW1XcEVtZTVWbWlabXFtWjNxcXFBS2hJYXNBQUVBQUFBRUFBQUFBQUNpYTRpbW00aW1pNGptaUkwcWlaVnFpcG1xdUtKdXk2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3b3VFQnF5Q2dDUUFBRFFrUnpKa1J4SmtSUkprUnpKQVVKRFZnRUFNZ0FBQWdCd0RNZVFGTW14TEV2VFBNM1RQRTMwUkUvMFRFOFZYZEVGUWtOV0FRQ0FBQUFDQUFBQUFBQXdKTU5TTEVkek5FbVVWRXUxVkUyMVZFc1ZWVTlWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVTFUZE0wVFNBMFpDVUFBQVFBd0dLTndlVWdJU1VsNWQ0UXdoQ1RuakVtSWJWZUlRU1JrdDR4QmhXRG5qS2lESExlUXVNUWd4NElEVmtSQUVRQkFBREdJTWNRYzhnNVI2bVRFam5ucUhTVUd1Y2NwWTVTWnluRm1HTE5LSlhZVXF5TmM0NVNSNjJqbEdJc0xYYVVVbzJweGdJQUFBSWNBQUFDTElSQ1ExWUVBRkVBQUlReFNDbWtGR0tNT2FlY1E0d3A1NWh6aGpIbUhIT09PZWVnZEZJcTU1eDBUa3JFR0hPT09hZWNjMUk2SjVWelRrb25vUUFBZ0FBSEFJQUFDNkhRa0JVQlFKd0FnRUdTUEUveU5GR1VORThVUlZOMFhWRTBYZGZ5UE5YMFRGTlZQZEZVVlZOVmJkbFVWVm1XUE04MFBkTlVWYzgwVmRWVVZWazJWVldXUlZYVmJkTjFkZHQwVmQyV2JkdjNYVnNXZGxGVmJkMVVYZHMzVmRmMlhkbjJmVm5XZFdQeVBGWDFUTk4xUGROMFpkVjFiVnQxWFYzM1RGT1dUZGVWWmROMWJkdVZaVjEzWmRuM05kTjBYZE5WWmRsMFhkbDJaVmUzWFZuMmZkTjFoZCtWWlY5WFpWa1lkbDMzaFZ2WGxlVjBYZDFYWlZjM1ZsbjJmVnZYaGVIV2RXR1pQRTlWUGROMFhjODBYVmQxWFY5WFhkZldOZE9VWmROMWJkbFVYVmwyWmRuM1hWZldkYzgwWmRsMFhkczJYVmVXWFZuMmZWZVdkZDEwWFY5WFpWbjRWVmYyZFZuWGxlSFdiZUUzWGRmM1ZWbjJoVmVXZGVIV2RXRzVkVjBZUGxYMWZWTjJoZUYwWmQvWGhkOVpibDA0bHRGMWZXR1ZiZUZZWlZrNWZ1RllsdDMzbFdWMFhWOVliZGtZVmxrV2hsLzRuZVgyZmVONGRWMFpidDNuekxydkRNZnZwUHZLMDlWdFk1bDkzVmxtWDNlTzRSZzZ2L0RqcWFxdm02NHJES2NzQzcvdDY4YXorNzZ5aks3cis2b3NDNzhxMjhLeDY3N3ovTDZ3TEtQcytzSnF5OEt3MnJZeDNMNXVMTDl3SE10cjY4b3g2NzVSdG5WOFgzZ0t3L04wZFYxNVpsM0g5blYwNDBjNGZzb0FBSUFCQndDQUFCUEtRS0VoS3dLQU9BRUFqeVNKb21SWm9paFpsaWlLcHVpNm9taTZycVJwcHFscG5tbGFtbWVhcG1tcXNpbWFyaXhwbW1sYW5tYWFtcWVacG1pYXJtdWFwcXlLcGluTHBtcktzbW1hc3V5NnNtMjdybXpib21uS3NtbWFzbXlhcGl5N3NxdmJydXpxdXFSWnBxbDVubWxxbm1lYXBtcktzbW1hcnF0NW5tcDZubWlxbmlpcXFtcXFxcTJxcWl4Ym5tZWFtdWlwcGllS3FtcXFwcTJhcWlyTHBxcmFzbW1xdG15cXFtMjdxdXo2c20zcnVtbXFzbTJxcGkyYnFtcmJydXpxc2l6YnVpOXBtbWxxbm1lYW11ZVpwbW1hc215YXFpdGJucWVhbmlpcXF1YUpwbXFxcWl5YnBxcktsdWVacWllS3F1cUpubXVhcWlyTHBtcmFxbW1hdG15cXFpMmJwaXJMcm0zN3Z1dktzbTZxcW15YnFtcnJwbXJLc216THZ1L0txdTZLcGluTHBxcmFzbW1xc2kzYnN1L0xzcXo3b21uS3NtbXFzbTJxcWk3THNtMGJzMno3dW1pYXNtMnFwaTJicWlyYnNpMzd1aXpidXUvS3JtK3JxcXpyc2kzN3V1NzZybkRydWpDOHNtejdxcXo2dWl2YnVtL3JNdHYyZlVUVGxHVlROVzNiVkZWWmRtWFo5bVhiOW4zUk5HMWJWVlZiTmszVnRtVlo5bjFadG0xaE5FM1pObFZWMWszVnRHMVpsbTFodG1YaGRtWFp0MlZiOW5YWGxYVmYxMzNqMTJYZDVycXk3Y3V5cmZ1cXEvcTI3dnZDY091dThBb0FBQmh3QUFBSU1LRU1GQnF5RWdDSUFnQUFqR0dNTVFpTlVzNDVCNkZSeWpubklHVE9RUWdobGN3NUNDR1VramtIb1pTVU11Y2dsSkpTQ0tHVWxGb0xJWlNVVW1zRkFBQVVPQUFBQk5pZ0tiRTRRS0VoS3dHQVZBQUFnK05ZbHVlWm9tcmFzbU5KbmllS3FxbXF0dTFJbHVlSm9tbXFxbTFibmllS3BxbXFydXZybXVlSm9tbXFxdXZxdW1pYXBxbXFydXU2dWk2YW9xbXFxdXU2c3E2YnBxcXFyaXU3c3V6cnBxcXFxdXZLcml6N3dxcTZyaXZMc20zcndyQ3FydXZLc216YnRtL2N1cTdydnUvN3dwR3Q2N291L01JeERFY0JBT0FKRGdCQUJUYXNqbkJTTkJaWWFNaEtBQ0FEQUlBd0JpR0RFRUlHSVlTUVVrb2hwWlFTQUFBdzRBQUFFR0JDR1NnMFpFVUFFQ2NBQUJoREthU1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSklLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktxYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLWlZTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVnb0FrSXB3QUpCNk1LRU1GQnF5RWdCSUJRQUFqRkZLS2NhY2d4QXg1aGhqMEVrb0tXTE1PY1ljbEpKUzVSeUVFRkpwTGJmS09RZ2hwTlJTYlpselVscUxNZVlZTStla3BCUmJ6VG1IVWxLTHNlYWFhKzZrdEZacnJqWG5XbHFyTmRlY2M4MjV0QlpycmpuWG5IUExNZGVjYzg0NTV4aHp6am5ubkhQT0JRRGdORGdBZ0I3WXNEckNTZEZZWUtFaEt3R0FWQUFBQWhtbEdIUE9PZWdRVW93NTV4eUVFQ0tGR0hQT09RZ2hWSXc1NXh4MEVFS29HSFBNT1FnaGhKQTU1eHlFRUVJSUlYTU9PdWdnaEJCQ0J4MkVFRUlJb1pUT1FRZ2hoQkJLS0NHRUVFSUlJWVFRT2dnaGhCQkNDQ0dFRUVJSUlZUlNTZ2doaEJCQ0NhR1VVQUFBWUlFREFFQ0FEYXNqbkJTTkJSWWFzaElBQUFJQWdCeVdvRkxPaEVHT1FZOE5RY3BSTXcxQ1REblJtV0pPYWpNVlU1QTVFSjEwRWhscVFkbGVNZ3NBQUlBZ0FDREFCQkFZSUNqNFFnaUlNUUFBUVlqTUVBbUZWYkRBb0F3YUhPWUJ3QU5FaEVRQWtKaWdTTHU0Z0M0RFhOREZYUWRDQ0VJUWdsZ2NRQUVKT0RqaGhpZmU4SVFibktCVFZPb2dBQUFBQUFBTUFPQUJBT0NnQUNJaW1xdXd1TURJME5qZzZQQUlBQUFBQUFBV0FQZ0FBRGcrZ0lpSTVpb3NMakF5TkRZNE9qd0NBQUFBQUFBQUFBQ0FnSUFBQUFBQUFFQUFBQUNBZ0U5bloxTUFCQUVBQUFBQUFBQUFYY1hlRndJQUFBQnEybnB4QWdFQkFBbz1cIixcbiAgXCJlbXB0eU1wM1wiOiBcIi8vc1F4QUFEd0FBQnBBQUFBQ0FBQURTQUFBQUVURUZOUlRNdU9Ua3VOVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlU9XCIsXG4gIFwiaGlnaHRpY2tcIjogXCJVa2xHUmtRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVNBRkFBQ3gveGYvZEFET0FDd0JzUDNwKzZIK3pBR29CT2tDQ3dCWC9FSDVPdnhsQTRrSjJ3Y1NBclQ5RS91dCtIVDJldlV4OThuNk9BRjVDQ1VNd1F2ZkNPc0p4QXgwRFNJTUVBcTlCaUFCM3ZoejdtTGtUOXNSMTMzWXhOMnM1UUx2MHZyVUJud1JueHVRSmVFc1NEQ2lNZDh5RlM4YUtGSWhvaFVzQ0tqNjR1NjI1T3JhQTlIdXlQbkVsY1Ard3h2Sld0VzI1NjM3VlEwakhQZ25CVERETTFvMEN6S0xLKzhoemhnRkRPejhTZTRKNDdEWVZ0RzB6NWZRcTlMQjEycmZBK2o5OXJvSEFoZWxJeU13SWpkVE91VThtandJT0dveGhDYjVFNTMvaiszazMvZlRZOHBUdzR5L1RyK2V3OERNdmRzazhSY0hSUmtTS080eUdUa0hQa1Uvcnp6eU5jZ3NyUjk0RHAvNXIrWnMxN3pPbmNvRHhoZkUzOFdMeW4vVGVPTWk5cjBJUnhsUktJUXp5VGxPUEtvOXlqbVdNY29rRFJMYy9ZN3J1ZHRkenUvRDJMMUl1KzI3SmNHM3lZclZMdWpsKzNVT1p4MVVLNVEwcXptTlBEazhaamVlTVBvanpoSCsvakx0UGQ1bTBoSExIc1lJdzVURU1NbkEwanZqOGZTT0Jpd1hBU1pnTXpNOGRVQkdRYkkrcnpqcEtrSVp5Z1pUOVFmbGNkYVJ5cVhDejcrVndVUEg3ODRyM0s3cyt2MEtEdThidnllTE1iNDNOanJoT0lvMGRTdlFIaTBQblA2aTdvdmczTlR4eTQvR2Y4WDh5SC9RQnR2WDU1UDJZZ2IwRmNVanN5NExObUk1ZWppWE0zOHI3aUM4Rkp3SFB2b2s3ZERnUWRhSnpsVEtJc29GenNyVmt1QTg3ZC82cUFpN0ZRMGg5Q2xLTUxFejNUT3JNQmNxWVNEOEU5QUZkL2RTNmtUZjZkYlUwWG5RdjlJSDJNWGZaK2xuOURFQUZ3d2RGeThnaWliNkthd3FlQ2hnSS9VYkhCT1RDWmovdnZYZTdJbmxGdUROM1AzYjBkMUY0Z3pwaWZHMit1NEQ3UXcxRmZ3Ym5DRCtJbGdqV3lITEhQTVZvZzJtQkwzN3F2UCs3TnZuWXVUdjRydmpmdWJONmszd3BQWjAvV2tFT3d0aUVVc1djeG0rR2w0YU9oaGlGREFQSXdtYkF0bjdUUFZ5Nzd6cWNlZnI1WUhtSHVsbDdlbnlmUG1jQUhnSGV3MVJFcjhWaGhkL0YrQVYxUkowRGlrSldRTmMvWlAzZWZLZDdodnMydXI0NnJIczV1OGU5Ti80OC8waEEvOEhGZ3d1RDA0UlNCSVJFcXNRT2c3bUNzc0dNQUpXL1huNEcvVEs4TGJ1enUwSTdxVHZuUEp5OXNYNmJQODRCTFlJYkF3ZEQ4NFFZeEc3RU9jT0RBeHdDRk1FQVFDOSs3UDNTdlRYOFhIdyt1OVI4S1R4SXZTbzkrWDdWUUNVQkowSU13emlEajRRTGhBR0Q5VU1yZ25UQlpjQlJ2MXYrWHYyVWZTKzh0ZngrdkVTODd6MCt2YjMrWmY5WmdFUUJTRUlVQXJXQzhrTTJReXpDNUVKRUFkdkJIZ0JYUDVuKytyNEF2ZDg5V2owN2ZNdzlEMzFKdmZwK1VqOXhRRDlBOFFHNVFoWENsRUxyQXN2Qzl3SjdnZDZCV0lDM3Y2Tys3VDRQUFpOOUVIeld2TmY5UHoxRnZpdCtxTDlyUUNIQXdFRy93ZUNDWlVLRnd2RENuSUpjQWNRQldjQ2FmOFovQ0Q1NXZhQjlkRDB3UFNQOVVMM20vazcvTXorSndFeUF3OEZ6QVk3Q0JzSmFRazVDV2tJMmdhdEJDSUNZZitqL0ZyNnZmaVY5ODcyc2ZaUDkxejRwL2xSKzNIOXpmODlBcm9FRkFmakNQMEpjd284Q2pBSmRRZGdCU0VEa2dEUS9WajdaZm5SOTVUMjhmVWQ5djMyVnZnMituYjgrLzZ4QVdvRTRBYkRDUDRKcEFxYkNxUUowd2VFQmZnQ1RBQ1QvUjM3TS9tKzk2NzJJUFk2OWdiM2FmaFcrdFQ4cWYrTUFqMEZnZ2N1Q1NjS1hBcmlDY01JRUFmeUJKWUNGd0NQL1J6N0EvbDc5M3oyRi9abjltSDM3ZmpkK2kzOXlmOXBBdDBFRkFmUkNOa0pHQXFyQ1pZSXZnWlBCSjhCNlA0Ly9NMzUwdmR6OXEvMWxmVXE5bXozUlBtaSszSCtiZ0ZWQk9RRzN3Z0hDa3dLMEFtN0NDQUhDZ1dtQWpBQVwiLFxuICBcImxvd3RpY2tcIjogXCJVa2xHUmxRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVRBRkFBQjAvNXYrVS80VC8zZ0Ewd0ZUQXVVQitmOGQvblQ5MGYxcS91Yit0ZjQ2L21iLzh3RlFBOWdDN3dDZC9tcitGQUdSQTNjRTZ3SmYvaDM2ZXZtdis4di9Od1JIQlpVQzIvNjArLy81RXZ1Wi9hWC9iZ0ZPQXA4QXp2emg5d2Z6TFBGNjh6VDR5LzJCQXlnSWZRd2FFallZMHgzMUlyd2w4U09XSFZFU09nUGg5TmZwUmVGdDIybllIZGREMkJYY1plRGE1SW5xZ1BEeDluUCs2Z1M0Q0JZTG53MHpFUzBXWHh2NEhrY2dMaC8xRytFWDFSTnBENHdLaWdYSC82cjUvZk51N2xUcGorWnU1aEhvWE90TDcxYnlyL1FwOTFMNjR2Nk9CTzRKb1E1ekVza1UraFUxRmlRVmVSUDdFV2dQNFFyMEJJVCt0UGlkOUMzeTF2Q2g4RkR4SnZLMjh2dnl5L0xBOHBMelUvWFA5NXY2eHZ3NC91RC9SQUsyQlNrS2NnNkJFU2NUWkJNZUVxa1BUUXhqQ0tFRVZ3RmkvbnY3aC9ocDlhRHlBdkhQOE1meEx2TSs5UFgwdVBXMTlnLzRMZnI3L0M0QUtnTmFCWFFHeXdiMEJoSUhXUWZXQjFvSXpBanRDRjhJSHdkdEJha0RWd0tMQWVZQTh2OXcva2o4MS9uUTk0djI5L1hYOWJ6MWJQVVk5VXoxWi9hSCtIcjd5UDRNQWk0Rit3Y2ZDbllMTmd5ZkRQc01TdzBzRFVBTWZncmNCNUlFTXdGYi9pWDhUL3BUK08vMVgvTWY4Y2J2ck8rMThNTHl2ZlZQK1JmOXdnQW9CQ0VIcHduSUM1RU40UTVBRDN3TzFBeTBDcHNJdndidkJOY0NiUUFyL25YOE9mc2YrdmI0bXZkYTlyajF6L1dYOXBMM2EvaEgrWlg2Ui93bi92UC9lUUVTQS9BRSt3WURDY3dLRkF5UERDa01GUXVTQ2U0SFZRYlNCSFFEQ3dJOEFOTDlKUHVZK0hYMjh2VHE4MlB6ZFBNVjlBejFNZlo0OXpENWdmdHgvc1FCQlFYTEI4Y0ovZ3FwQ3c4TWlnd1dEWEVOWFEyckREVUw3UWdEQnN3Q2R2OFMvSzc0V1BWazhoWHdvdTRQN212dTErOVQ4cHoxVXZsaS9ab0J3Z1dSQ2NzTVBnL0NFRVFSNFJEQUR3b085d3VzQ1ZNSDRBUlNBcG4vdWZ6ZCtXajNidlg3OHh6engvTDY4cXp6MXZTRDlxWDRHZnZkL2MwQWh3Ty9CV3dIbWdodkNRRUtWUW9uQ2xzSkN3aUlCaDBGMGdPZ0FtMEJPd0F4LzAzK1hQMGcvTGI2Y1BtWCtGLzR2ZmgrK1RINnMvb3MrNy83Y3Z3TC9aejlYUDVPLzNJQTNBRjlBenNGOWdhVUNBQUtIZ3VlQ3pjTDl3bnRCM3NGNHdJekFJMzk2ZnAxK0d2Mkl2V245TjMwcC9YaTltNzRHL3J1KzlQOWsvOGFBWUVDMUFNVEJTSUcwd1l1QjFnSGtnY0FDR0VJU0FoVEJ6RUZXQUt0LzVMOTJmdVUrdlg1MGZtZitTUDVpL2diK0JmNG12aXYrU3I3a3Z5Yi9VaityLzRYLzhyLytnQ2lBbzBFVUFhUkJ6d0lTd2pxQjNJSEdRZkNCdjhGcGdUTUFwUUFLZjY3KzVuNS92Zm45anoyeVBWbjlTTDFSUFhxOVNQM0R2bXIrNmYrc1FHS0JBY0grd2hPQ2gwTGF3czNDMjhLTEFtREI1QUZmUU5vQVZQL1p2M2UrN1A2c2ZuTCtDdjR2UGVNOTViMzdmZVYrSm41MVBvcS9MTDltditZQVZZRDNnUXVCbWNIU0Fpa0NJRUk3QWYrQnVFRm5nUVhBMXNCdi85di9wZjlNUDNXL0ZqOHEvc1IrNkg2VS9vMyttUDZ5L3BOKy9mN3h2eWUvV0grSmY5bUFENENRQVFKQmlzSHRnZjZCdzBJOFFkc0Ixc0d5d1Q0QWdnQkNQL28vS1g2bVBnMTk1NzJqZmF6OXVmMlMvY00rRTM1RS90Vy9hZi81d0gxQThBRktnZmtCL0FIZ3dmeEJsQUdnUVZJQk1NQ0p3R3MvNDMrdlAwaS9acjhMZnpsKzlINzZmdmkrOWY3NWZzZi9JbjhCUDEwL2VqOWNmNE8vN2YvZEFBY0FhVUJFZ0tNQWhnRHBBTUVCQ0VFRHdUZkEzSUR4UUw4QVNvQlV3Q0cvODcrSi82aC9ScjlwUHhrL0diOG9Qd0ovWEg5dy8zOS9VRCtxUDQxLzlEL1d3RGVBR3NCQWdLZEFoRURRUU5BQTBzRGJ3T1ZBNVlEVndQT0FoZ0NWQUdSQUE9PVwiLFxufSIsImltcG9ydCB7Z2V0TUlESU91dHB1dEJ5SWR9IGZyb20gJy4vaW5pdF9taWRpJ1xuXG5jb25zdCBCVUZGRVJfVElNRSA9IDIwMCAvLyBtaWxsaXNcbmNvbnN0IFBSRV9CVUZGRVIgPSAyMDBcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVye1xuXG4gIGNvbnN0cnVjdG9yKGRhdGEpe1xuICAgICh7XG4gICAgICBzb25nSWQ6IHRoaXMuc29uZ0lkLFxuICAgICAgc3RhcnRQb3NpdGlvbjogdGhpcy5zb25nU3RhcnRQb3NpdGlvbixcbiAgICAgIHRpbWVTdGFtcDogdGhpcy50aW1lU3RhbXAsXG4gICAgICBtaWRpRXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgIHBhcnRzOiB0aGlzLnBhcnRzLFxuICAgICAgdHJhY2tzOiB0aGlzLnRyYWNrcyxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGJhcnM6IHRoaXMuYmFycyxcbiAgICAgICAgbG9vcDogdGhpcy5sb29wXG4gICAgICB9XG4gICAgfSA9IGRhdGEpXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLnRpbWUgPSAwXG4gICAgdGhpcy5pbmRleCA9IDBcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZ1N0YXJ0UG9zaXRpb24pXG4gIH1cblxuICAvLyBnZXQgdGhlIGluZGV4IG9mIHRoZSBldmVudCB0aGF0IGhhcyBpdHMgbWlsbGlzIHZhbHVlIGF0IG9yIHJpZ2h0IGFmdGVyIHRoZSBwcm92aWRlZCBtaWxsaXMgdmFsdWVcbiAgc2V0SW5kZXgobWlsbGlzKXtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yKGxldCBldmVudCBvZiB0aGlzLmV2ZW50cyl7XG4gICAgICBpZihldmVudC5taWxsaXMgPj0gbWlsbGlzKXtcbiAgICAgICAgdGhpcy5pbmRleCA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgaSsrO1xuICAgIH1cbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgLy8gbWFpbiBsb29wXG4gICAgZm9yKGxldCBpID0gdGhpcy5pbmRleDsgaSA8IHRoaXMubnVtRXZlbnRzOyBpKyspe1xuICAgICAgbGV0IGV2ZW50ID0gdGhpcy5ldmVudHNbaV07XG4gICAgICBpZihldmVudC5taWxsaXMgPCB0aGlzLm1heHRpbWUpe1xuXG4gICAgICAgIC8vZXZlbnQudGltZSA9IHRoaXMudGltZVN0YW1wICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRQb3NpdGlvbjtcblxuICAgICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgICAvLyB0byBiZSBpbXBsZW1lbnRlZFxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUocG9zaXRpb24pe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGV2ZW50cyxcbiAgICAgIGluc3RydW1lbnRcblxuICAgIHRoaXMubWF4dGltZSA9IHBvc2l0aW9uICsgQlVGRkVSX1RJTUVcbiAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSBldmVudHNbaV1cbiAgICAgIHRyYWNrID0gdGhpcy50cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5pbnN0cnVtZW50XG5cbiAgICAgIC8vIGlmKHR5cGVvZiBpbnN0cnVtZW50ID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAvLyAgIGNvbnRpbnVlXG4gICAgICAvLyB9XG5cbiAgICAgIGlmKHRoaXMucGFydHNbZXZlbnQucGFydElkXS5tdXRlID09PSB0cnVlIHx8IHRyYWNrLm11dGUgPT09IHRydWUgfHwgZXZlbnQubXV0ZSA9PT0gdHJ1ZSl7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmKChldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTI4KSAmJiB0eXBlb2YgZXZlbnQubWlkaU5vdGVJZCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAvLyB0aGlzIGlzIHVzdWFsbHkgY2F1c2VkIGJ5IHRoZSBzYW1lIG5vdGUgb24gdGhlIHNhbWUgdGlja3MgdmFsdWUsIHdoaWNoIGlzIHByb2JhYmx5IGEgYnVnIGluIHRoZSBtaWRpIGZpbGVcbiAgICAgICAgY29uc29sZS5pbmZvKCdubyBtaWRpTm90ZUlkJywgZXZlbnQpXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIGRlYnVnIG1pbnV0ZV93YWx0eiBkb3VibGUgZXZlbnRzXG4gICAgICAvLyBpZihldmVudC50aWNrcyA+IDQwMzAwKXtcbiAgICAgIC8vICAgY29uc29sZS5pbmZvKGV2ZW50KVxuICAgICAgLy8gfVxuXG4gICAgICB0aGlzLnRpbWUgPSAodGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uKVxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgY2hhbm5lbCA9IHRyYWNrLmNoYW5uZWxcbiAgICAgICAgbGV0IHRpbWUgPSB0aGlzLnRpbWUgKyBCVUZGRVJfVElNRVxuICAgICAgICAvLyBzZW5kIHRvIGV4dGVybmFsIGhhcmR3YXJlIG9yIHNvZnR3YXJlIGluc3RydW1lbnRcbiAgICAgICAgZm9yKGxldCBwb3J0SWQgb2YgdHJhY2suTUlESU91dHB1dElkcyl7XG4gICAgICAgICAgbGV0IHBvcnQgPSBnZXRNSURJT3V0cHV0QnlJZChwb3J0SWQpXG4gICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTI4IHx8IGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxNzYpe1xuICAgICAgICAgICAgLy9taWRpT3V0cHV0LnNlbmQoW2V2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIHRoaXMudGltZSArIHNlcXVlbmNlci5taWRpT3V0TGF0ZW5jeSk7XG4gICAgICAgICAgICBwb3J0LnNlbmQoW2V2ZW50LnR5cGUgKyBjaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCB0aW1lKVxuICAgICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAgICAgcG9ydC5zZW5kKFtldmVudC50eXBlICsgY2hhbm5lbCwgZXZlbnQuZGF0YTFdLCB0aW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHNlbmQgdG8gamF2YXNjcmlwdCBpbnN0cnVtZW50XG4gICAgICAgIGlmKHR5cGVvZiBpbnN0cnVtZW50ICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgICAgdGhpcy50aW1lIC89IDEwMDAgLy8gY29udmVydCB0byBzZWNvbmRzIGJlY2F1c2UgdGhlIGF1ZGlvIGNvbnRleHQgdXNlcyBzZWNvbmRzIGZvciBzY2hlZHVsaW5nXG4gICAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aGlzLnRpbWUsIHRoaXMudHJhY2tzW2V2ZW50LnRyYWNrSWRdLm91dHB1dClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKVxuICAgIC8vcmV0dXJuIHRoaXMuaW5kZXggPj0gMTBcbiAgICByZXR1cm4gdGhpcy5pbmRleCA+PSB0aGlzLm51bUV2ZW50cyAvLyBlbmQgb2Ygc29uZ1xuICB9XG5cblxuICBzdG9wQWxsU291bmRzKHRpbWUpe1xuICAgIE9iamVjdC5rZXlzKHRoaXMudHJhY2tzKS5mb3JFYWNoKCh0cmFja0lkKSA9PiB7XG4gICAgICBsZXQgdHJhY2sgPSB0aGlzLnRyYWNrc1t0cmFja0lkXVxuICAgICAgbGV0IGluc3RydW1lbnQgPSB0cmFjay5pbnN0cnVtZW50XG4gICAgICBpZih0eXBlb2YgaW5zdHJ1bWVudCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBpbnN0cnVtZW50LnN0b3BBbGxTb3VuZHMoKVxuICAgICAgfVxuICAgICAgZm9yKGxldCBwb3J0SWQgb2YgdHJhY2suTUlESU91dHB1dElkcyl7XG4gICAgICAgIGxldCBwb3J0ID0gZ2V0TUlESU91dHB1dEJ5SWQocG9ydElkKVxuICAgICAgICBwb3J0LnNlbmQoWzB4QjAsIDB4N0IsIDB4MDBdLCB0aGlzLnRpbWUgKyAwLjApOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgICAgICBwb3J0LnNlbmQoWzB4QjAsIDB4NzksIDB4MDBdLCB0aGlzLnRpbWUgKyAwLjApOyAvLyByZXNldCBhbGwgY29udHJvbGxlcnNcbiAgICAgIH1cbiAgICB9KVxuICB9XG59XG5cbiIsIi8vQCBmbG93XG5cbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtwYXJzZVRpbWVFdmVudHMsIHBhcnNlRXZlbnRzLCBwYXJzZU1JRElOb3RlcywgZmlsdGVyRXZlbnRzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Z2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7YWRkVGFzaywgcmVtb3ZlVGFza30gZnJvbSAnLi9oZWFydGJlYXQnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBTY2hlZHVsZXIgZnJvbSAnLi9zY2hlZHVsZXInXG5pbXBvcnQge1xuICBDUkVBVEVfU09ORyxcbiAgQUREX1RSQUNLUyxcbiAgVVBEQVRFX1NPTkcsXG4gIFNPTkdfUE9TSVRJT04sXG4gIEFERF9NSURJX0VWRU5UU19UT19TT05HLFxuICBTVEFSVF9TQ0hFRFVMRVIsXG4gIFNUT1BfU0NIRURVTEVSLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcbmltcG9ydCBxYW1iaSBmcm9tICcuL3FhbWJpJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBzb25nSW5kZXggPSAwXG5cbmNvbnN0IGRlZmF1bHRTb25nID0ge1xuICBwcHE6IDk2MCxcbiAgYnBtOiAxMjAsXG4gIGJhcnM6IDMwLFxuICBsb3dlc3ROb3RlOiAwLFxuICBoaWdoZXN0Tm90ZTogMTI3LFxuICBub21pbmF0b3I6IDQsXG4gIGRlbm9taW5hdG9yOiA0LFxuICBxdWFudGl6ZVZhbHVlOiA4LFxuICBmaXhlZExlbmd0aFZhbHVlOiBmYWxzZSxcbiAgcG9zaXRpb25UeXBlOiAnYWxsJyxcbiAgdXNlTWV0cm9ub21lOiBmYWxzZSxcbiAgYXV0b1NpemU6IHRydWUsXG4gIGxvb3A6IGZhbHNlLFxuICBwbGF5YmFja1NwZWVkOiAxLFxuICBhdXRvUXVhbnRpemU6IGZhbHNlXG59XG4vKlxudHlwZSBzb25nU2V0dGluZ3MgPSB7XG4gIG5hbWU6IHN0cmluZyxcbiAgcHBxOiBudW1iZXIsXG4gIGJwbTogbnVtYmVyLFxuICBiYXJzOiBudW1iZXIsXG4gIGxvd2VzdE5vdGU6IG51bWJlcixcbiAgaGlnaGVzdE5vdGU6IG51bWJlcixcbiAgbm9taW5hdG9yOiBudW1iZXIsXG4gIGRlbm9taW5hdG9yOiBudW1iZXIsXG4gIHF1YW50aXplVmFsdWU6IG51bWJlcixcbiAgZml4ZWRMZW5ndGhWYWx1ZTogbnVtYmVyLFxuICBwb3NpdGlvblR5cGU6IHN0cmluZyxcbiAgdXNlTWV0cm9ub21lOiBib29sZWFuLFxuICBhdXRvU2l6ZTogYm9vbGVhbixcbiAgbG9vcDogYm9vbGVhbixcbiAgcGxheWJhY2tTcGVlZDogbnVtYmVyLFxuICBhdXRvUXVhbnRpemU6IGJvb2xlYW5cbn1cbiovXG5cbmZ1bmN0aW9uIGdldFNvbmcoc29uZ0lkOiBzdHJpbmcpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgc29uZyA9IHN0YXRlLmVudGl0aWVzW3NvbmdJZF1cbiAgaWYodHlwZW9mIHNvbmcgPT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gc29uZ1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzOiB7fSA9IHt9KTogc3RyaW5ne1xuICBsZXQgaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHMgPSB7fTtcbiAgKHtcbiAgICBuYW1lOiBzLm5hbWUgPSBpZCxcbiAgICBwcHE6IHMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgIGJwbTogcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgYmFyczogcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICBsb3dlc3ROb3RlOiBzLmxvd2VzdE5vdGUgPSBkZWZhdWx0U29uZy5sb3dlc3ROb3RlLFxuICAgIGhpZ2hlc3ROb3RlOiBzLmhpZ2hlc3ROb3RlID0gZGVmYXVsdFNvbmcuaGlnaGVzdE5vdGUsXG4gICAgbm9taW5hdG9yOiBzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgIHF1YW50aXplVmFsdWU6IHMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICBwb3NpdGlvblR5cGU6IHMucG9zaXRpb25UeXBlID0gZGVmYXVsdFNvbmcucG9zaXRpb25UeXBlLFxuICAgIHVzZU1ldHJvbm9tZTogcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICBsb29wOiBzLmxvb3AgPSBkZWZhdWx0U29uZy5sb29wLFxuICAgIHBsYXliYWNrU3BlZWQ6IHMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgfSA9IHNldHRpbmdzKVxuXG4gIGxldHtcbiAgICB0aW1lRXZlbnRzOiB0aW1lRXZlbnRzID0gW1xuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRFTVBPLCBkYXRhMTogcy5icG19LFxuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRJTUVfU0lHTkFUVVJFLCBkYXRhMTogcy5ub21pbmF0b3IsIGRhdGEyOiBzLmRlbm9taW5hdG9yfVxuICAgIF0sXG4gICAgbWlkaUV2ZW50SWRzOiBtaWRpRXZlbnRJZHMgPSB7fSwgLy8gQFRPRE86IGNvbnZlcnQgYXJyYXkgdG8gb2JqZWN0IGlmIE1JRElFdmVudCBpZHMgYXJlIHByb3ZpZGVkXG4gICAgcGFydElkczogcGFydElkcyA9IFtdLFxuICAgIHRyYWNrSWRzOiB0cmFja0lkcyA9IFtdLFxuICB9ID0gc2V0dGluZ3NcblxuICAvL3BhcnNlVGltZUV2ZW50cyhzLCB0aW1lRXZlbnRzKVxuXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfU09ORyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpbWVFdmVudHMsXG4gICAgICBtaWRpRXZlbnRzOiBbXSxcbiAgICAgIC8vIG1pZGlFdmVudHNNYXA6IHt9LFxuICAgICAgbWlkaUV2ZW50c01hcDogbmV3IE1hcCgpLFxuICAgICAgcGFydElkcyxcbiAgICAgIHRyYWNrSWRzLFxuICAgICAgZGlydHk6IGZhbHNlLFxuICAgICAgdXBkYXRlVGltZUV2ZW50czogdHJ1ZSxcbiAgICAgIHNldHRpbmdzOiBzLFxuICAgICAgbmV3RXZlbnRJZHM6IFtdLFxuICAgICAgbW92ZWRFdmVudElkczogW10sXG4gICAgICB0cmFuc3Bvc2VkRXZlbnRJZHM6IFtdLFxuICAgICAgcmVtb3ZlZEV2ZW50SWRzOiBbXSxcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUcmFja3Moc29uZ19pZDogc3RyaW5nLCAuLi50cmFja19pZHM6IHN0cmluZ1tdKTogdm9pZHtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9UUkFDS1MsXG4gICAgcGF5bG9hZDoge1xuICAgICAgc29uZ19pZCxcbiAgICAgIHRyYWNrX2lkcyxcbiAgICB9XG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYWNrSWRzKHNvbmdJZDogc3RyaW5nKTogc3RyaW5nW117XG4gIGxldCBzb25nID0gZ2V0U29uZyhzb25nSWQpXG4gIGlmKHNvbmcgPT09IGZhbHNlKXtcbiAgICBjb25zb2xlLndhcm4oYG5vIHNvbmcgZm91bmQgd2l0aCBpZCAke3NvbmdJZH1gKVxuICAgIHJldHVybiBbXVxuICB9XG4gIHJldHVybiBbLi4uc29uZy50cmFja0lkc11cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVGltZUV2ZW50cyguLi50aW1lX2V2ZW50czogc3RyaW5nW10pOiB2b2lke1xufVxuXG5cbi8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU29uZyhzb25nSWQ6IHN0cmluZywgZmlsdGVyX2V2ZW50czogYm9vbGVhbiA9IGZhbHNlKTogdm9pZHtcbiAgbGV0IHN0YXRlID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3JcbiAgbGV0IHNvbmcgPSB7Li4uc3RhdGUuZW50aXRpZXNbc29uZ0lkXX0gLy8gY2xvbmUhXG4gIGlmKHR5cGVvZiBzb25nICE9PSAndW5kZWZpbmVkJyl7XG4gICAgY29uc29sZS50aW1lKCd1cGRhdGUgc29uZycpXG5cbiAgICAvLyBjaGVjayBpZiB0aW1lIGV2ZW50cyBhcmUgdXBkYXRlZFxuICAgIGlmKHNvbmcudXBkYXRlVGltZUV2ZW50cyA9PT0gdHJ1ZSl7XG4gICAgICBjb25zb2xlLmxvZygndXBkYXRlVGltZUV2ZW50cycsIHNvbmcudGltZUV2ZW50cy5sZW5ndGgpXG4gICAgICBwYXJzZVRpbWVFdmVudHMoc29uZy5zZXR0aW5ncywgc29uZy50aW1lRXZlbnRzKVxuICAgICAgc29uZy51cGRhdGVUaW1lRXZlbnRzID0gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBvbmx5IHBhcnNlIG5ldyBhbmQgbW92ZWQgZXZlbnRzXG4gICAgbGV0IHRvYmVQYXJzZWQgPSBbXVxuXG5cbiAgICAvLyBmaWx0ZXIgcmVtb3ZlZCBldmVudHNcbiAgICBzb25nLnJlbW92ZWRFdmVudElkcy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50SWQpe1xuICAgICAgc29uZy5taWRpRXZlbnRzTWFwLmRlbGV0ZShldmVudElkKVxuICAgICAgLy9kZWxldGUgc29uZy5taWRpRXZlbnRzTWFwW2V2ZW50SWRdXG4gICAgfSlcblxuXG4gICAgLy8gYWRkIG5ldyBldmVudHNcbiAgICBzb25nLm5ld0V2ZW50SWRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnRJZCl7XG4gICAgICBsZXQgZXZlbnQgPSBzdGF0ZS5lbnRpdGllc1tldmVudElkXVxuICAgICAgc29uZy5taWRpRXZlbnRzTWFwLnNldChldmVudElkLCBldmVudClcbiAgICAgIC8vc29uZy5taWRpRXZlbnRzTWFwW2V2ZW50SWRdID0gZXZlbnRcbiAgICAgIHRvYmVQYXJzZWQucHVzaChldmVudClcbiAgICB9KVxuXG5cbiAgICAvLyBtb3ZlZCBldmVudHMgbmVlZCB0byBiZSBwYXJzZWRcbiAgICBzb25nLm1vdmVkRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihldmVudElkKXtcbiAgICAgIGxldCBldmVudCA9IHN0YXRlLmVudGl0aWVzW2V2ZW50SWRdXG4gICAgICB0b2JlUGFyc2VkLnB1c2goZXZlbnQpXG4gICAgfSlcblxuXG4gICAgLy9jb25zb2xlLnRpbWUoJ3BhcnNlJylcbiAgICBpZih0b2JlUGFyc2VkLmxlbmd0aCA+IDApe1xuICAgICAgdG9iZVBhcnNlZCA9IFsuLi50b2JlUGFyc2VkLCAuLi5zb25nLnRpbWVFdmVudHNdXG4gICAgICBjb25zb2xlLmxvZygncGFyc2VFdmVudHMnLCB0b2JlUGFyc2VkLmxlbmd0aCAtIHNvbmcudGltZUV2ZW50cy5sZW5ndGgpXG4gICAgICB0b2JlUGFyc2VkID0gcGFyc2VFdmVudHModG9iZVBhcnNlZClcbiAgICAgIHBhcnNlTUlESU5vdGVzKHRvYmVQYXJzZWQpXG4gICAgfVxuICAgIC8vY29uc29sZS50aW1lRW5kKCdwYXJzZScpXG5cbiAgICAvL2NvbnNvbGUudGltZSgnc29ydCcpXG4gICAgbGV0IG1pZGlFdmVudHMgPSBBcnJheS5mcm9tKHNvbmcubWlkaUV2ZW50c01hcC52YWx1ZXMoKSlcbiAgICAvKlxuICAgIGxldCBtaWRpRXZlbnRzID0gW11cbiAgICBsZXQgbWlkaUV2ZW50c01hcCA9IHNvbmcubWlkaUV2ZW50c01hcFxuICAgIE9iamVjdC5rZXlzKG1pZGlFdmVudHNNYXApLmZvckVhY2goZnVuY3Rpb24oa2V5KXtcbiAgICAgIG1pZGlFdmVudHMucHVzaChtaWRpRXZlbnRzTWFwW2tleV0pXG4gICAgfSlcbiAgICAqL1xuXG4gICAgbWlkaUV2ZW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgaWYoYS50aWNrcyA9PT0gYi50aWNrcyl7XG4gICAgICAgIGxldCByID0gYS50eXBlIC0gYi50eXBlO1xuICAgICAgICBpZihhLnR5cGUgPT09IDE3NiAmJiBiLnR5cGUgPT09IDE0NCl7XG4gICAgICAgICAgciA9IC0xXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJcbiAgICAgIH1cbiAgICAgIHJldHVybiBhLnRpY2tzIC0gYi50aWNrc1xuICAgIH0pXG4gICAgLy9jb25zb2xlLnRpbWVFbmQoJ3NvcnQnKVxuXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogVVBEQVRFX1NPTkcsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHNvbmdJZCxcbiAgICAgICAgbWlkaUV2ZW50cyxcbiAgICAgICAgbWlkaUV2ZW50c01hcDogc29uZy5taWRpRXZlbnRzTWFwLFxuICAgICAgICBuZXdFdmVudElkczogW10sXG4gICAgICAgIG1vdmVkRXZlbnRJZHM6IFtdLFxuICAgICAgICByZW1vdmVkRXZlbnRJZHM6IFtdLFxuICAgICAgICB1cGRhdGVUaW1lRXZlbnRzOiBmYWxzZSxcbiAgICAgICAgc2V0dGluZ3M6IHNvbmcuc2V0dGluZ3MgLy8gbmVlZGVkIGZvciB0aGUgc2VxdWVuY2VyIHJlZHVjZXJcbiAgICAgIH1cbiAgICB9KVxuICAgIGNvbnNvbGUudGltZUVuZCgndXBkYXRlIHNvbmcnKVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLndhcm4oYG5vIHNvbmcgZm91bmQgd2l0aCBpZCAke3NvbmdJZH1gKVxuICB9XG59XG5cbmZ1bmN0aW9uIGdldFBhcnRzKHNvbmdJZDogc3RyaW5nKXtcbiAgbGV0IGVudGl0aWVzID0gc3RvcmUuZ2V0U3RhdGUoKS5lZGl0b3IuZW50aXRpZXNcblxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzdGFydFNvbmcoc29uZ0lkOiBzdHJpbmcsIHN0YXJ0UG9zaXRpb246IG51bWJlciA9IDApOiB2b2lke1xuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNjaGVkdWxlcigpe1xuICAgIGxldCBlbnRpdGllcyA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yLmVudGl0aWVzXG4gICAgbGV0IHNvbmdEYXRhID0gZW50aXRpZXNbc29uZ0lkXVxuICAgIC8vIGNvbnNvbGUubG9nKHNvbmdEYXRhKVxuICAgIGxldCBwYXJ0cyA9IHt9XG4gICAgc29uZ0RhdGEucGFydElkcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRJZCl7XG4gICAgICBwYXJ0c1twYXJ0SWRdID0gZW50aXRpZXNbcGFydElkXVxuICAgIH0pXG4gICAgbGV0IHRyYWNrcyA9IHt9XG4gICAgc29uZ0RhdGEudHJhY2tJZHMuZm9yRWFjaChmdW5jdGlvbih0cmFja0lkKXtcbiAgICAgIHRyYWNrc1t0cmFja0lkXSA9IGVudGl0aWVzW3RyYWNrSWRdXG4gICAgfSlcblxuICAgIGxldCBtaWRpRXZlbnRzID0gc29uZ0RhdGEubWlkaUV2ZW50cy8vQXJyYXkuZnJvbShzdG9yZS5nZXRTdGF0ZSgpLnNlcXVlbmNlci5zb25nc1tzb25nSWRdLm1pZGlFdmVudHMudmFsdWVzKCkpXG4gICAgbGV0IHBvc2l0aW9uID0gc3RhcnRQb3NpdGlvblxuICAgIGxldCB0aW1lU3RhbXAgPSBjb250ZXh0LmN1cnJlbnRUaW1lICogMTAwMCAvLyAtPiBjb252ZXJ0IHRvIG1pbGxpc1xuICAgIGxldCBzY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHtcbiAgICAgIHNvbmdJZCxcbiAgICAgIHN0YXJ0UG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXAsXG4gICAgICBwYXJ0cyxcbiAgICAgIHRyYWNrcyxcbiAgICAgIG1pZGlFdmVudHMsXG4gICAgICBzZXR0aW5nczogc29uZ0RhdGEuc2V0dGluZ3MsXG4gICAgfSlcblxuICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFNUQVJUX1NDSEVEVUxFUixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ0lkLFxuICAgICAgICBzY2hlZHVsZXJcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICBsZXRcbiAgICAgICAgbm93ID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAsXG4gICAgICAgIGRpZmYgPSBub3cgLSB0aW1lU3RhbXAsXG4gICAgICAgIGVuZE9mU29uZ1xuXG4gICAgICBwb3NpdGlvbiArPSBkaWZmIC8vIHBvc2l0aW9uIGlzIGluIG1pbGxpc1xuICAgICAgdGltZVN0YW1wID0gbm93XG4gICAgICBlbmRPZlNvbmcgPSBzY2hlZHVsZXIudXBkYXRlKHBvc2l0aW9uKVxuICAgICAgaWYoZW5kT2ZTb25nKXtcbiAgICAgICAgc3RvcFNvbmcoc29uZ0lkKVxuICAgICAgfVxuICAgICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBTT05HX1BPU0lUSU9OLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgc29uZ0lkLFxuICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgYWRkVGFzaygncmVwZXRpdGl2ZScsIHNvbmdJZCwgY3JlYXRlU2NoZWR1bGVyKCkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdG9wU29uZyhzb25nSWQ6IHN0cmluZyk6IHZvaWR7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKClcbiAgbGV0IHNvbmdEYXRhID0gc3RhdGUuc2VxdWVuY2VyLnNvbmdzW3NvbmdJZF1cbiAgaWYoc29uZ0RhdGEpe1xuICAgIGlmKHNvbmdEYXRhLnBsYXlpbmcpe1xuICAgICAgcmVtb3ZlVGFzaygncmVwZXRpdGl2ZScsIHNvbmdJZClcbiAgICAgIHNvbmdEYXRhLnNjaGVkdWxlci5zdG9wQWxsU291bmRzKGNvbnRleHQuY3VycmVudFRpbWUpXG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNUT1BfU0NIRURVTEVSLFxuICAgICAgICBwYXlsb2FkOiB7XG4gICAgICAgICAgc29uZ0lkXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmVycm9yKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nSWR9YClcbiAgfVxufVxuXG5cbi8qXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50cyhcbiAgc2V0dGluZ3M6IHtzb25nX2lkOiBzdHJpbmcsIHRyYWNrX2lkOiBzdHJpbmcsIHBhcnRfaWQ6IHN0cmluZ30sXG4gIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT5cbil7XG4gIC8vQHRvZG86IGNyZWF0ZSBwYXJ0LCBhZGQgZXZlbnRzIHRvIHBhcnQsIGNyZWF0ZSB0cmFjaywgYWRkIHBhcnQgdG8gdHJhY2ssIGFkZCB0cmFjayB0byBzb25nXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbiAgICBwYXlsb2FkOiB7XG4vLyAgICAgIGlkOiBzb25nX2lkLFxuICAgICAgbWlkaV9ldmVudHNcbiAgICB9XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNSURJRXZlbnRzVG9Tb25nKHNvbmdfaWQ6IHN0cmluZywgbWlkaV9ldmVudHM6IEFycmF5PHt0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXJ9Pil7XG4gIC8vQHRvZG86IGNyZWF0ZSBwYXJ0LCBhZGQgZXZlbnRzIHRvIHBhcnQsIGNyZWF0ZSB0cmFjaywgYWRkIHBhcnQgdG8gdHJhY2ssIGFkZCB0cmFjayB0byBzb25nXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuKi8iLCJcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHBhcnNlTUlESUZpbGUgZnJvbSAnLi9taWRpZmlsZSdcbmltcG9ydCB7Y3JlYXRlTUlESUV2ZW50LCBnZXRNSURJRXZlbnRJZH0gZnJvbSAnLi9taWRpX2V2ZW50J1xuaW1wb3J0IHtjcmVhdGVQYXJ0LCBhZGRNSURJRXZlbnRzfSBmcm9tICcuL3BhcnQnXG5pbXBvcnQge2NyZWF0ZVRyYWNrLCBhZGRQYXJ0cywgc2V0SW5zdHJ1bWVudH0gZnJvbSAnLi90cmFjaydcbmltcG9ydCB7Y3JlYXRlU29uZywgYWRkVHJhY2tzLCB1cGRhdGVTb25nfSBmcm9tICcuL3NvbmcnXG5pbXBvcnQge2NyZWF0ZUluc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudCdcblxuY29uc3QgUFBRID0gOTYwXG5cbmV4cG9ydCBmdW5jdGlvbiBzb25nRnJvbU1JRElGaWxlKGRhdGEsIHNldHRpbmdzID0ge30pe1xuXG4gIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAgIHJldHVybiB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgfWVsc2UgaWYodHlwZW9mIGRhdGEuaGVhZGVyICE9PSAndW5kZWZpbmVkJyAmJiB0eXBlb2YgZGF0YS50cmFja3MgIT09ICd1bmRlZmluZWQnKXtcbiAgICByZXR1cm4gdG9Tb25nKGRhdGEpO1xuICAvLyB9ZWxzZXtcbiAgLy8gICBkYXRhID0gYmFzZTY0VG9CaW5hcnkoZGF0YSk7XG4gIC8vICAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgLy8gICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgLy8gICAgIHJldHVybiB0b1NvbmcocGFyc2VNSURJRmlsZShidWZmZXIpKTtcbiAgLy8gICB9ZWxzZXtcbiAgLy8gICAgIGVycm9yKCd3cm9uZyBkYXRhJyk7XG4gIC8vICAgfVxuICB9XG5cbiAgLy8ge1xuICAvLyAgIHBwcSA9IG5ld1BQUSxcbiAgLy8gICBicG0gPSBuZXdCUE0sXG4gIC8vICAgcGxheWJhY2tTcGVlZCA9IG5ld1BsYXliYWNrU3BlZWQsXG4gIC8vIH0gPSBzZXR0aW5nc1xufVxuXG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQpe1xuICBsZXQgdHJhY2tzID0gcGFyc2VkLnRyYWNrc1xuICBsZXQgcHBxID0gcGFyc2VkLmhlYWRlci50aWNrc1BlckJlYXRcbiAgbGV0IHBwcUZhY3RvciA9IFBQUSAvIHBwcSAvL0BUT0RPOiBnZXQgcHBxIGZyb20gY29uZmlnIC0+IG9ubHkgbmVjZXNzYXJ5IGlmIHlvdSB3YW50IHRvIGNoYW5nZSB0aGUgcHBxIG9mIHRoZSBNSURJIGZpbGUgIVxuICBsZXQgdGltZUV2ZW50cyA9IFtdXG4gIGxldCBldmVudElkc1xuICBsZXQgYnBtID0gLTFcbiAgbGV0IG5vbWluYXRvciA9IC0xXG4gIGxldCBkZW5vbWluYXRvciA9IC0xXG4gIGxldCB0cmFja0lkcyA9IFtdXG4gIGxldCBzb25nSWRcblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGVcbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGVcbiAgICBsZXQgY2hhbm5lbCA9IC0xXG4gICAgbGV0IHRyYWNrTmFtZVxuICAgIGxldCB0cmFja0luc3RydW1lbnROYW1lXG4gICAgZXZlbnRJZHMgPSBbXTtcblxuICAgIGZvcihsZXQgZXZlbnQgb2YgdHJhY2spe1xuICAgICAgdGlja3MgKz0gKGV2ZW50LmRlbHRhVGltZSAqIHBwcUZhY3Rvcik7XG5cbiAgICAgIGlmKGNoYW5uZWwgPT09IC0xICYmIHR5cGVvZiBldmVudC5jaGFubmVsICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgfVxuICAgICAgdHlwZSA9IGV2ZW50LnN1YnR5cGU7XG4gICAgICAvL2NvbnNvbGUubG9nKGV2ZW50LmRlbHRhVGltZSwgdGlja3MsIHR5cGUpO1xuXG4gICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSl7XG5cbiAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ2luc3RydW1lbnROYW1lJzpcbiAgICAgICAgICBpZihldmVudC50ZXh0KXtcbiAgICAgICAgICAgIHRyYWNrSW5zdHJ1bWVudE5hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT24nOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDkwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPZmYnOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweDgwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IHRtcCA9IDYwMDAwMDAwIC8gZXZlbnQubWljcm9zZWNvbmRzUGVyQmVhdDtcblxuICAgICAgICAgIGlmKHRpY2tzID09PSBsYXN0VGlja3MgJiYgdHlwZSA9PT0gbGFzdFR5cGUpe1xuICAgICAgICAgICAgLy9jb25zb2xlLmluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIHRtcCk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGJwbSA9PT0gLTEpe1xuICAgICAgICAgICAgYnBtID0gdG1wO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzICsgMHg1MSwgdGlja3MsIHR5cGU6IDB4NTEsIGRhdGExOiB0bXB9KTtcbiAgICAgICAgICAvL3RpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MsIHRpY2tzLCB0eXBlOiAweDUxLCBkYXRhMTogdG1wfSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgY29uc29sZS5pbmZvKCd0aW1lIHNpZ25hdHVyZSBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKTtcbiAgICAgICAgICAgIHRpbWVFdmVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYobm9taW5hdG9yID09PSAtMSl7XG4gICAgICAgICAgICBub21pbmF0b3IgPSBldmVudC5udW1lcmF0b3JcbiAgICAgICAgICAgIGRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3JcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcyArIDB4NTgsIHRpY2tzLCB0eXBlOiAweDU4LCBkYXRhMTogZXZlbnQubnVtZXJhdG9yLCBkYXRhMjogZXZlbnQuZGVub21pbmF0b3J9KTtcbiAgICAgICAgICAvL3RpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MsIHRpY2tzLCB0eXBlOiAweDU4LCBkYXRhMTogZXZlbnQubnVtZXJhdG9yLCBkYXRhMjogZXZlbnQuZGVub21pbmF0b3J9KTtcbiAgICAgICAgICBicmVhaztcblxuXG4gICAgICAgIGNhc2UgJ2NvbnRyb2xsZXInOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhDMCwgZXZlbnQucHJvZ3JhbU51bWJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3BpdGNoQmVuZCc6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4RTAsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm5hbWUsIGV2ZW50LnR5cGUpO1xuICAgICAgfVxuXG4gICAgICBsYXN0VHlwZSA9IHR5cGVcbiAgICAgIGxhc3RUaWNrcyA9IHRpY2tzXG4gICAgfVxuXG4gICAgaWYoZXZlbnRJZHMubGVuZ3RoID4gMCl7XG4gICAgICBsZXQgdHJhY2tJZCA9IGNyZWF0ZVRyYWNrKHtuYW1lOiB0cmFja05hbWV9KVxuICAgICAgLy9sZXQgcGFydElkID0gY3JlYXRlUGFydCh7dHJhY2tJZCwgbWlkaUV2ZW50SWRzOiBldmVudElkc30pXG4gICAgICBsZXQgcGFydElkID0gY3JlYXRlUGFydCh7dHJhY2tJZH0pXG4gICAgICBhZGRNSURJRXZlbnRzKHBhcnRJZCwgLi4uZXZlbnRJZHMpXG4gICAgICBhZGRQYXJ0cyh0cmFja0lkLCBwYXJ0SWQpXG4gICAgICAvL2FkZFRyYWNrcyhzb25nSWQsIHRyYWNrSWQpXG4gICAgICB0cmFja0lkcy5wdXNoKHRyYWNrSWQpXG4gICAgfVxuICB9XG5cbiAgc29uZ0lkID0gY3JlYXRlU29uZyh7XG4gICAgcHBxOiBQUFEsXG4gICAgLy9wbGF5YmFja1NwZWVkOiAxLFxuICAgIC8vcHBxLFxuICAgIGJwbSxcbiAgICBub21pbmF0b3IsXG4gICAgZGVub21pbmF0b3IsXG4gICAgdGltZUV2ZW50cyxcbiAgfSlcbiAgYWRkVHJhY2tzKHNvbmdJZCwgLi4udHJhY2tJZHMpXG4gIHVwZGF0ZVNvbmcoc29uZ0lkKVxuICByZXR1cm4gc29uZ0lkXG59XG4iLCJcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHFhbWJpLCB7XG4gIHNldE1hc3RlclZvbHVtZSxcbiAgZ2V0TWFzdGVyVm9sdW1lLFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcbiAgY3JlYXRlTUlESU5vdGUsXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxuICBwYXJzZU1JRElGaWxlLFxuICBzb25nRnJvbU1JRElGaWxlLFxuICBnZXRUcmFja0lkcyxcbiAgSW5zdHJ1bWVudCxcbiAgc2V0SW5zdHJ1bWVudCxcbiAgZ2V0TUlESU91dHB1dElkcyxcbiAgc2V0TUlESU91dHB1dElkcyxcbiAgcGFyc2VTYW1wbGVzLFxufSBmcm9tICcuL3FhbWJpJ1xuXG5xYW1iaS5nZXRNYXN0ZXJWb2x1bWUoKVxucWFtYmkubG9nKCdmdW5jdGlvbnMnKVxucWFtYmkuaW5pdCgpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gIGNvbnNvbGUubG9nKGRhdGEsIHFhbWJpLmdldE1hc3RlclZvbHVtZSgpKVxuICBzZXRNYXN0ZXJWb2x1bWUoMC41KVxufSlcblxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignRE9NQ29udGVudExvYWRlZCcsIGZ1bmN0aW9uKCl7XG5cbiAgbGV0IGJ1dHRvblN0YXJ0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3N0YXJ0JylcbiAgbGV0IGJ1dHRvblN0b3AgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RvcCcpXG4gIGxldCBidXR0b25Nb3ZlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21vdmUnKVxuICBidXR0b25TdGFydC5kaXNhYmxlZCA9IHRydWVcbiAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IHRydWVcblxuICBsZXQgdGVzdCA9IDRcbiAgbGV0IG5vdGVvbiwgbm90ZW9mZiwgbm90ZSwgc29uZ0lkLCB0cmFjaywgcGFydDEsIHBhcnQyXG5cbiAgaWYodGVzdCA9PT0gMSl7XG5cbiAgICBzb25nSWQgPSBjcmVhdGVTb25nKHtuYW1lOiAnTXkgRmlyc3QgU29uZycsIHBsYXliYWNrU3BlZWQ6IDEsIGxvb3A6IHRydWUsIGJwbTogNjB9KVxuICAgIHRyYWNrID0gY3JlYXRlVHJhY2soe25hbWU6ICdndWl0YXInLCBzb25nSWR9KVxuICAgIHBhcnQxID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8xJywgdHJhY2t9KVxuICAgIHBhcnQyID0gY3JlYXRlUGFydCh7bmFtZTogJ3NvbG8yJywgdHJhY2t9KVxuICAgIC8vbm90ZW9uID0gY3JlYXRlTUlESUV2ZW50KDk2MCwgMTQ0LCA2MCwgMTAwKVxuICAgIC8vbm90ZW9mZiA9IGNyZWF0ZU1JRElFdmVudCgxMDIwLCAxMjgsIDYwLCAwKVxuICAgIC8vYWRkTUlESUV2ZW50cyhwYXJ0MSwgbm90ZW9uLCBub3Rlb2ZmKVxuXG4gICAgLy9ub3RlID0gY3JlYXRlTUlESU5vdGUobm90ZW9uLCBub3Rlb2ZmKVxuXG5cbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICBsZXQgdGlja3MgPSAwXG4gICAgbGV0IHR5cGUgPSAxNDRcblxuICAgIGZvcihsZXQgaSA9IDA7IGkgPCAxMDA7IGkrKyl7XG4gICAgICBldmVudHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIHR5cGUsIDYwLCAxMDApKVxuICAgICAgaWYoaSAlIDIgPT09IDApe1xuICAgICAgICB0eXBlID0gMTI4XG4gICAgICAgIHRpY2tzICs9IDk2MFxuICAgICAgfWVsc2V7XG4gICAgICAgIHR5cGUgPSAxNDRcbiAgICAgICAgdGlja3MgKz0gOTYwXG4gICAgICB9XG4gICAgfVxuICAgIGFkZE1JRElFdmVudHMocGFydDEsIC4uLmV2ZW50cylcblxuICAgIGFkZFBhcnRzKHRyYWNrLCBwYXJ0MSwgcGFydDIpXG4gICAgYWRkVHJhY2tzKHNvbmdJZCwgdHJhY2spXG4gICAgdXBkYXRlU29uZyhzb25nSWQpXG4gICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICB9XG5cbi8qXG4gIC8vc3RhcnRTb25nKHNvbmcpXG4gIC8vIGxldCBzb25nMiA9IGNyZWF0ZVNvbmcoKVxuXG4gIC8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgLy8gICBzdGFydFNvbmcoc29uZzIsIDUwMDApXG4gIC8vIH0sIDEwMDApXG5cbi8vICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuLy8gICAgIHN0b3BTb25nKHNvbmcpXG4vLyAvLyAgICBzdG9wU29uZyhzb25nMilcbi8vICAgfSwgMjAwKVxuKi9cblxuICBpZih0ZXN0ID09PSAyKXtcbiAgICAvL2ZldGNoKCdtb3prNTQ1YS5taWQnKVxuICAgIGZldGNoKCdtaW51dGVfd2FsdHoubWlkJylcbiAgICAudGhlbihcbiAgICAgIChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgfVxuICAgIClcbiAgICAudGhlbigoYWIpID0+IHtcbiAgICAgIC8vc29uZ0lkID0gc29uZ0Zyb21NSURJRmlsZShwYXJzZU1JRElGaWxlKGFiKSlcbiAgICAgIGxldCBtZiA9IHBhcnNlTUlESUZpbGUoYWIpXG4gICAgICBzb25nSWQgPSBzb25nRnJvbU1JRElGaWxlKG1mKVxuICAgICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgpXG4gICAgICBnZXRUcmFja0lkcyhzb25nSWQpLmZvckVhY2goZnVuY3Rpb24odHJhY2tJZCl7XG4gICAgICAgIHNldEluc3RydW1lbnQodHJhY2tJZCwgaW5zdHJ1bWVudClcbiAgICAgICAgc2V0TUlESU91dHB1dElkcyh0cmFja0lkLCAuLi5nZXRNSURJT3V0cHV0SWRzKCkpXG4gICAgICB9KVxuICAgICAgLy9jb25zb2xlLmxvZygnaGVhZGVyOicsIG1mLmhlYWRlcilcbiAgICAgIC8vY29uc29sZS5sb2coJyMgdHJhY2tzOicsIG1mLnRyYWNrcy5zaXplKVxuICAgICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG5cbiAgaWYodGVzdCA9PT0gMyl7XG4gICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgpXG4gICAgcGFyc2VTYW1wbGVzKHtcbiAgICAgIGM0OiAnLi4vZGF0YS9UUDAxZC1FbGVjdHJpY1BpYW5vLTAwMC0wNjAtYzMud2F2J1xuICAgIH0pLnRoZW4oXG4gICAgICBmdW5jdGlvbiBvbkZ1bGZpbGxlZChidWZmZXJzKXtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhidWZmZXJzKTtcbiAgICAgICAgaW5zdHJ1bWVudC5hZGRTYW1wbGVEYXRhKDYwLCBidWZmZXJzLmM0LCB7XG4gICAgICAgICAgc3VzdGFpbjogWzBdLFxuICAgICAgICAgIHJlbGVhc2U6IFs0LCAnZXF1YWwgcG93ZXInXSxcbiAgICAgICAgfSk7XG4gICAgICAgIGluc3RydW1lbnQucHJvY2Vzc01JRElFdmVudCh7dGlja3M6IDAsIHR5cGU6IDE0NCwgZGF0YTE6IDYwLCBkYXRhMjogMTAwfSlcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KHt0aWNrczogMjAwLCB0eXBlOiAxMjgsIGRhdGExOiA2MCwgZGF0YTI6IDB9KVxuICAgICAgICAvLyBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoe3RpY2tzOiAyNDAsIHR5cGU6IDE0NCwgZGF0YTE6IDYwLCBkYXRhMjogMTAwfSlcbiAgICAgICAgLy8gaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KHt0aWNrczogNDQwLCB0eXBlOiAxMjgsIGRhdGExOiA2MCwgZGF0YTI6IDB9KVxuICAgICAgICAvLyBpbnN0cnVtZW50LnByb2Nlc3NNSURJRXZlbnQoe3RpY2tzOiA0ODAsIHR5cGU6IDE0NCwgZGF0YTE6IDYwLCBkYXRhMjogMTAwfSlcbiAgICAgICAgLy8gaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KHt0aWNrczogNzIwLCB0eXBlOiAxMjgsIGRhdGExOiA2MCwgZGF0YTI6IDB9KVxuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIG9uUmVqZWN0ZWQoZSl7XG4gICAgICAgIGNvbnNvbGUud2FybihlKTtcbiAgICAgIH1cbiAgICApXG4gIH1cblxuICBsZXQgdGlja3MgPSAwXG4gIGxldCBtaWRpRXZlbnRJZCA9IDBcblxuICBpZih0ZXN0ID09PSA0KXtcbiAgICAvL2ZldGNoKCdtb3prNTQ1YS5taWQnKVxuICAgIGZldGNoKCdtaW51dGVfd2FsdHoubWlkJylcbiAgICAudGhlbihcbiAgICAgIChyZXNwb25zZSkgPT4ge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuYXJyYXlCdWZmZXIoKVxuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBjb25zb2xlLmVycm9yKGVycm9yKVxuICAgICAgfVxuICAgIClcbiAgICAudGhlbigoYWIpID0+IHtcbiAgICAgIC8vc29uZ0lkID0gc29uZ0Zyb21NSURJRmlsZShwYXJzZU1JRElGaWxlKGFiKSlcbiAgICAgIGxldCBtZiA9IHBhcnNlTUlESUZpbGUoYWIpXG4gICAgICBzb25nSWQgPSBzb25nRnJvbU1JRElGaWxlKG1mKVxuICAgICAgbGV0IGluc3RydW1lbnQgPSBuZXcgSW5zdHJ1bWVudCgpXG4gICAgICBnZXRUcmFja0lkcyhzb25nSWQpLmZvckVhY2goZnVuY3Rpb24odHJhY2tJZCl7XG4gICAgICAgIHNldEluc3RydW1lbnQodHJhY2tJZCwgaW5zdHJ1bWVudClcbiAgICAgICAgc2V0TUlESU91dHB1dElkcyh0cmFja0lkLCAuLi5nZXRNSURJT3V0cHV0SWRzKCkpXG4gICAgICB9KVxuICAgICAgLy9jb25zb2xlLmxvZygnaGVhZGVyOicsIG1mLmhlYWRlcilcbiAgICAgIC8vY29uc29sZS5sb2coJyMgdHJhY2tzOicsIG1mLnRyYWNrcy5zaXplKVxuICAgICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgICAvL21pZGlFdmVudElkID0gZ2V0RXZlbnRcbiAgICB9KVxuICB9XG5cbiAgYnV0dG9uU3RhcnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHN0YXJ0U29uZyhzb25nSWQsIDApXG4gIH0pXG5cbiAgYnV0dG9uU3RvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgc3RvcFNvbmcoc29uZ0lkKVxuICB9KVxuXG4gIGJ1dHRvbk1vdmUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIC8vbW92ZU1JRElFdmVudChtaWRpRXZlbnRJZCwgKyt0aWNrcylcbiAgICBtb3ZlTUlESUV2ZW50KHNvbmdJZCwgKyt0aWNrcylcbiAgICB1cGRhdGVTb25nKHNvbmdJZClcbiAgfSlcblxufSlcbiIsImltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbml0X2F1ZGlvJ1xuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge21hc3RlckdhaW59IGZyb20gJy4vaW5pdF9hdWRpbydcbmltcG9ydCBJbnN0cnVtZW50IGZyb20gJy4vaW5zdHJ1bWVudCdcbmltcG9ydCB7XG4gIENSRUFURV9UUkFDSyxcbiAgQUREX1BBUlRTLFxuICBTRVRfSU5TVFJVTUVOVCxcbiAgU0VUX01JRElfT1VUUFVUX0lEUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHRyYWNrSW5kZXggPSAwXG5cbmZ1bmN0aW9uIGdldFRyYWNrKHRyYWNrSWQ6IHN0cmluZyl7XG4gIGxldCB0cmFjayA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yLmVudGl0aWVzW3RyYWNrSWRdXG4gIGlmKHR5cGVvZiB0cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnNvbGUud2FybihgTm8gdHJhY2sgZm91bmQgd2l0aCBpZCAke3RyYWNrSWR9YClcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gdHJhY2tcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhY2soXG4gIHNldHRpbmdzOiB7bmFtZTogc3RyaW5nLCBwYXJ0SWRzOkFycmF5PHN0cmluZz4sIHNvbmdJZDogc3RyaW5nfSA9IHt9XG4gIC8vc2V0dGluZ3M6IHtuYW1lOiBzdHJpbmcsIHBhcnRzOkFycmF5PHN0cmluZz4sIHNvbmc6IHN0cmluZ30gPSB7bmFtZTogJ2FhcCcsIHBhcnRzOiBbXSwgc29uZzogJ25vIHNvbmcnfVxuICAvL3NldHRpbmdzID0ge25hbWU6IG5hbWUgPSAnYWFwJywgcGFydHM6IHBhcnRzID0gW10sIHNvbmc6IHNvbmcgPSAnbm8gc29uZyd9XG4gIC8vc2V0dGluZ3MgPSB7bmFtZTogbmFtZSA9ICdhYXAnLCBwYXJ0czogcGFydHMgPSBbXSwgc29uZzogc29uZyA9ICdubyBzb25nJ31cbil7XG4gIGxldCBpZCA9IGBNVF8ke3RyYWNrSW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCB7XG4gICAgbmFtZSA9IGlkLFxuICAgIHBhcnRJZHMgPSBbXSxcbiAgICBzb25nSWQgPSAnbm9uZSdcbiAgfSA9IHNldHRpbmdzXG4gIGxldCB2b2x1bWUgPSAwLjVcbiAgbGV0IG91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIG91dHB1dC5nYWluLnZhbHVlID0gdm9sdW1lXG4gIG91dHB1dC5jb25uZWN0KG1hc3RlckdhaW4pXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9UUkFDSyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBwYXJ0SWRzLFxuICAgICAgc29uZ0lkLFxuICAgICAgdm9sdW1lLFxuICAgICAgb3V0cHV0LFxuICAgICAgY2hhbm5lbDogMCxcbiAgICAgIG11dGU6IGZhbHNlLFxuICAgICAgTUlESU91dHB1dElkczogW10sXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkUGFydHModHJhY2tfaWQ6IHN0cmluZywgLi4ucGFydF9pZHM6c3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9QQVJUUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB0cmFja19pZCxcbiAgICAgIHBhcnRfaWRzLFxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SW5zdHJ1bWVudCh0cmFja0lkOiBzdHJpbmcsIGluc3RydW1lbnQ6IEluc3RydW1lbnQpe1xuICBsZXQgdHJhY2sgPSBnZXRUcmFjayh0cmFja0lkKVxuICBpZih0cmFjayA9PT0gZmFsc2Upe1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYodHlwZW9mIGluc3RydW1lbnQuY29ubmVjdCAhPT0gJ2Z1bmN0aW9uJyB8fCB0eXBlb2YgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50ICE9PSAnZnVuY3Rpb24nIHx8IHR5cGVvZiBpbnN0cnVtZW50LnN0b3BBbGxTb3VuZHMgIT09ICdmdW5jdGlvbicpe1xuICAgIGNvbnNvbGUud2FybignQW4gaW5zdHJ1bWVudCBzaG91bGQgaW1wbGVtZW50IHRoZSBtZXRob2RzIHByb2Nlc3NNSURJRXZlbnQoKSBhbmQgc3RvcEFsbFNvdW5kcygpJylcbiAgICByZXR1cm5cbiAgfVxuXG4gIGluc3RydW1lbnQuY29ubmVjdCh0cmFjay5vdXRwdXQpXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFNFVF9JTlNUUlVNRU5ULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHRyYWNrSWQsXG4gICAgICBpbnN0cnVtZW50LFxuICAgIH1cbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1JRElPdXRwdXRJZHModHJhY2tJZDogc3RyaW5nLCAuLi5vdXRwdXRJZHM6IHN0cmluZyl7XG4gIGlmKGdldFRyYWNrKHRyYWNrSWQpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuXG4gIH1cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFNFVF9NSURJX09VVFBVVF9JRFMsXG4gICAgcGF5bG9hZDoge1xuICAgICAgdHJhY2tJZCxcbiAgICAgIG91dHB1dElkcyxcbiAgICB9XG4gIH0pXG4gIC8vY29uc29sZS5sb2codHJhY2tJZCwgb3V0cHV0SWRzKVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBtdXRlVHJhY2soZmxhZzogYm9vbGVhbil7XG5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0Vm9sdW1lVHJhY2soZmxhZzogYm9vbGVhbil7XG5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0UGFubmluZ1RyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG4iLCJcbmltcG9ydCBmZXRjaCBmcm9tICdpc29tb3JwaGljLWZldGNoJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2luaXRfYXVkaW8nXG5cblxuY29uc3RcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb21cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TmljZVRpbWUobWlsbGlzKXtcbiAgbGV0IGgsIG0sIHMsIG1zLFxuICAgIHNlY29uZHMsXG4gICAgdGltZUFzU3RyaW5nID0gJyc7XG5cbiAgc2Vjb25kcyA9IG1pbGxpcy8xMDAwOyAvLyDihpIgbWlsbGlzIHRvIHNlY29uZHNcbiAgaCA9IG1GbG9vcihzZWNvbmRzIC8gKDYwICogNjApKTtcbiAgbSA9IG1GbG9vcigoc2Vjb25kcyAlICg2MCAqIDYwKSkgLyA2MCk7XG4gIHMgPSBtRmxvb3Ioc2Vjb25kcyAlICg2MCkpO1xuICBtcyA9IG1Sb3VuZCgoc2Vjb25kcyAtIChoICogMzYwMCkgLSAobSAqIDYwKSAtIHMpICogMTAwMCk7XG5cbiAgdGltZUFzU3RyaW5nICs9IGggKyAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtIDwgMTAgPyAnMCcgKyBtIDogbTtcbiAgdGltZUFzU3RyaW5nICs9ICc6JztcbiAgdGltZUFzU3RyaW5nICs9IHMgPCAxMCA/ICcwJyArIHMgOiBzO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gbXMgPT09IDAgPyAnMDAwJyA6IG1zIDwgMTAgPyAnMDAnICsgbXMgOiBtcyA8IDEwMCA/ICcwJyArIG1zIDogbXM7XG5cbiAgLy9jb25zb2xlLmxvZyhoLCBtLCBzLCBtcyk7XG4gIHJldHVybiB7XG4gICAgaG91cjogaCxcbiAgICBtaW51dGU6IG0sXG4gICAgc2Vjb25kOiBzLFxuICAgIG1pbGxpc2Vjb25kOiBtcyxcbiAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICB0aW1lQXNBcnJheTogW2gsIG0sIHMsIG1zXVxuICB9O1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZShzYW1wbGUsIGlkLCBldmVyeSl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3Qpe1xuICAgIHRyeXtcbiAgICAgIGNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3MoYnVmZmVyKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGlkLCBidWZmZXIpO1xuICAgICAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICAgICAgcmVzb2x2ZSh7aWQsIGJ1ZmZlcn0pXG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHtpZCwgYnVmZmVyfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoYnVmZmVyKTtcbiAgICAgICAgICAgIGlmKGV2ZXJ5KXtcbiAgICAgICAgICAgICAgZXZlcnkoYnVmZmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZnVuY3Rpb24gb25FcnJvcihlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgICAgLy9yZWplY3QoZSk7IC8vIGRvbid0IHVzZSByZWplY3QgYmVjYXVzZSB3ZSB1c2UgdGhpcyBhcyBhIG5lc3RlZCBwcm9taXNlIGFuZCB3ZSBkb24ndCB3YW50IHRoZSBwYXJlbnQgcHJvbWlzZSB0byByZWplY3RcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgKVxuICAgIH1jYXRjaChlKXtcbiAgICAgIC8vY29uc29sZS5sb2coJ2Vycm9yIGRlY29kaW5nIGF1ZGlvZGF0YScsIGlkLCBlKTtcbiAgICAgIC8vcmVqZWN0KGUpOyAtPiBkbyBub3QgcmVqZWN0LCB0aGlzIHN0b3BzIHBhcnNpbmcgdGhlIG9odGVyIHNhbXBsZXNcbiAgICAgIGlmKHR5cGVvZiBpZCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICByZXNvbHZlKHtpZH0pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG59XG5cblxuZnVuY3Rpb24gbG9hZEFuZFBhcnNlU2FtcGxlKHVybCwgaWQsIGV2ZXJ5KXtcbiAgbGV0IGV4ZWN1dG9yID0gZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBmZXRjaCh1cmwpLnRoZW4oXG4gICAgICBmdW5jdGlvbihyZXNwb25zZSl7XG4gICAgICAgIGlmKHJlc3BvbnNlLm9rKXtcbiAgICAgICAgICByZXNwb25zZS5hcnJheUJ1ZmZlcigpLnRoZW4oZnVuY3Rpb24oZGF0YSl7XG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEpXG4gICAgICAgICAgICBwYXJzZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9KVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBpZih0eXBlb2YgaWQgIT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgICAgIHJlc29sdmUoe2lkfSlcbiAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIClcbiAgfVxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMobWFwcGluZywgZXZlcnkgPSBmYWxzZSl7XG4gIGxldCBrZXksIHNhbXBsZSxcbiAgICBwcm9taXNlcyA9IFtdLFxuICAgIHR5cGUgPSB0eXBlU3RyaW5nKG1hcHBpbmcpO1xuXG4gIGV2ZXJ5ID0gdHlwZVN0cmluZyhldmVyeSkgPT09ICdmdW5jdGlvbicgPyBldmVyeSA6IGZhbHNlO1xuICAvL2NvbnNvbGUubG9nKHR5cGUsIG1hcHBpbmcpXG4gIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICBmb3Ioa2V5IGluIG1hcHBpbmcpe1xuICAgICAgaWYobWFwcGluZy5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcbiAgICAgICAgc2FtcGxlID0gbWFwcGluZ1trZXldO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGNoZWNrSWZCYXNlNjQoc2FtcGxlKSlcbiAgICAgICAgaWYoY2hlY2tJZkJhc2U2NChzYW1wbGUpKXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKHBhcnNlU2FtcGxlKGJhc2U2NFRvQmluYXJ5KHNhbXBsZSksIGtleSwgZXZlcnkpKTtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkQW5kUGFyc2VTYW1wbGUoc2FtcGxlLCBrZXksIGV2ZXJ5KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdhcnJheScpe1xuICAgIG1hcHBpbmcuZm9yRWFjaChmdW5jdGlvbihzYW1wbGUpe1xuICAgICAgaWYoY2hlY2tJZkJhc2U2NChzYW1wbGUpKXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChwYXJzZVNhbXBsZShzYW1wbGUsIGV2ZXJ5KSk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgcHJvbWlzZXMucHVzaChsb2FkQW5kUGFyc2VTYW1wbGUoc2FtcGxlLCBldmVyeSkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgUHJvbWlzZS5hbGwocHJvbWlzZXMpXG4gICAgLnRoZW4oKHZhbHVlcykgPT4ge1xuICAgICAgaWYodHlwZSA9PT0gJ29iamVjdCcpe1xuICAgICAgICBtYXBwaW5nID0ge307XG4gICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICBtYXBwaW5nW3ZhbHVlLmlkXSA9IHZhbHVlLmJ1ZmZlcjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJlc29sdmUobWFwcGluZyk7XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZnVuY3Rpb24gY2hlY2tJZkJhc2U2NChkYXRhKXtcbiAgbGV0IHBhc3NlZCA9IHRydWU7XG4gIHRyeXtcbiAgICBhdG9iKGRhdGEpO1xuICB9Y2F0Y2goZSl7XG4gICAgcGFzc2VkID0gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHBhc3NlZDtcbn1cblxuXG4vLyBhZGFwdGVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2Rhbmd1ZXIvYmxvZy1leGFtcGxlcy9ibG9iL21hc3Rlci9qcy9iYXNlNjQtYmluYXJ5LmpzXG5mdW5jdGlvbiBiYXNlNjRUb0JpbmFyeShpbnB1dCl7XG4gIGxldCBrZXlTdHIgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz0nLFxuICAgIGJ5dGVzLCB1YXJyYXksIGJ1ZmZlcixcbiAgICBsa2V5MSwgbGtleTIsXG4gICAgY2hyMSwgY2hyMiwgY2hyMyxcbiAgICBlbmMxLCBlbmMyLCBlbmMzLCBlbmM0LFxuICAgIGksIGogPSAwO1xuXG4gIGJ5dGVzID0gTWF0aC5jZWlsKCgzICogaW5wdXQubGVuZ3RoKSAvIDQuMCk7XG4gIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihieXRlcyk7XG4gIHVhcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlcik7XG5cbiAgbGtleTEgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgbGtleTIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaW5wdXQubGVuZ3RoLTEpKTtcbiAgaWYobGtleTEgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuICBpZihsa2V5MiA9PSA2NCkgYnl0ZXMtLTsgLy9wYWRkaW5nIGNoYXJzLCBzbyBza2lwXG5cbiAgaW5wdXQgPSBpbnB1dC5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL1xcPV0vZywgJycpO1xuXG4gIGZvcihpID0gMDsgaSA8IGJ5dGVzOyBpICs9IDMpIHtcbiAgICAvL2dldCB0aGUgMyBvY3RlY3RzIGluIDQgYXNjaWkgY2hhcnNcbiAgICBlbmMxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jMyA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmM0ID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuXG4gICAgY2hyMSA9IChlbmMxIDw8IDIpIHwgKGVuYzIgPj4gNCk7XG4gICAgY2hyMiA9ICgoZW5jMiAmIDE1KSA8PCA0KSB8IChlbmMzID4+IDIpO1xuICAgIGNocjMgPSAoKGVuYzMgJiAzKSA8PCA2KSB8IGVuYzQ7XG5cbiAgICB1YXJyYXlbaV0gPSBjaHIxO1xuICAgIGlmKGVuYzMgIT0gNjQpIHVhcnJheVtpKzFdID0gY2hyMjtcbiAgICBpZihlbmM0ICE9IDY0KSB1YXJyYXlbaSsyXSA9IGNocjM7XG4gIH1cbiAgLy9jb25zb2xlLmxvZyhidWZmZXIpO1xuICByZXR1cm4gYnVmZmVyO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cbiJdfQ==
