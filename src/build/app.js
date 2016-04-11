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

},{"./reducer":27,"redux":12}],17:[function(require,module,exports){
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

},{"./io.js":19}],18:[function(require,module,exports){
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
          sample.stop(time, function () {
            //console.log('stop', event.midiNoteId)
            delete _this.scheduled[event.midiNoteId];
          });
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

},{"./action_types":15,"./create_store":16,"./io":19,"./sample":28}],19:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});


var context = new window.AudioContext();

exports.context = context;

},{}],20:[function(require,module,exports){
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
//import {createNote} from './note.js';

var midiEventIndex = 0;

function createMIDIEvent(ticks, type, data1) {
  var data2 = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];

  var id = 'ME_' + midiEventIndex++ + '_' + new Date().getTime();
  var sortIndex = ticks + type;
  if (type === 144 || type === 128) {
    sortIndex = ticks + type;
  }
  store.dispatch({
    type: _action_types.CREATE_MIDI_EVENT,
    payload: {
      id: id,
      ticks: ticks,
      type: type,
      sortIndex: sortIndex,
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

},{"./action_types":15,"./create_store":16,"./midi_note":21}],21:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],22:[function(require,module,exports){
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

},{}],23:[function(require,module,exports){
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

},{"./midi_stream":22}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseTimeEvents = parseTimeEvents;
exports.parseEvents = parseEvents;
exports.parseMIDINotes = parseMIDINotes;

var _util = require('./util');

var ppq, bpm, factor, nominator, denominator, playbackSpeed, bar, beat, sixteenth, tick, ticks, millis, millisPerTick, secondsPerTick, ticksPerBeat, ticksPerBar, ticksPerSixteenth, numSixteenth, diffTicks, previousEvent;

function setTickDuration() {
  secondsPerTick = 1 / playbackSpeed * 60 / bpm / ppq;
  //secondsPerTick = bpm / 60 / ppq;
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
  console.log('parseEvents');
  var event = void 0;
  var startEvent = 0;
  var lastEventTick = 0;
  var result = [];

  ticks = 0;

  //let events = [].concat(evts, song._timeEvents);
  var numEvents = events.length;
  //console.log(events)
  events.sort(function (a, b) {
    //return a.sortIndex - b.sortIndex;
    if (a.ticks === b.ticks) {
      if (a.type === 128) {
        return -1;
      } else if (b.type === 128) {
        return 1;
      }
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
  var n = 0;
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var event = _step2.value;

      if (event.type === 144) {
        if (!notes[event.trackId]) {
          notes[event.trackId] = {};
        }
        notes[event.trackId][event.data1] = event;
      } else if (event.type === 128) {
        // let notesInTrack = notes[event.trackId]
        // if(typeof notesInTrack === 'undefined'){
        //   console.info('no note on found event for ', event)
        //   delete notesInTrack[event.data1]
        //   continue
        // }
        var noteOn = notes[event.trackId][event.data1];
        //console.log(event.noteNumber, noteOn);
        var noteOff = event;
        if (typeof noteOn === 'undefined') {
          console.info(n++, 'no note on event', event);
          delete notes[event.trackId][event.data1];
          continue;
        }
        //let midiNote = new MIDINote(noteOn, noteOff);
        //this._notesMap.set(midiNote.id, midiNote);
        var id = 'MN_' + midiNoteIndex++ + '_' + new Date().getTime();
        noteOn.midiNoteId = id;
        noteOn.off = noteOff;
        noteOff.midiNoteId = id;
        noteOff.on = noteOn;
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

  console.log(notes);
}

},{"./util":34}],25:[function(require,module,exports){
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

},{"./action_types":15,"./create_store":16}],26:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.songFromMIDIFile = exports.parseMIDIFile = exports.addMIDIEvents = exports.createPart = exports.addParts = exports.createTrack = exports.stopSong = exports.startSong = exports.updateSong = exports.addTracks = exports.createSong = exports.createMIDINote = exports.moveMIDIEventTo = exports.moveMIDIEvent = exports.createMIDIEvent = undefined;

var _midi_event = require('./midi_event');

var _midi_note = require('./midi_note');

var _song = require('./song');

var _track = require('./track');

var _part = require('./part');

var _midifile = require('./midifile');

var _song_from_midifile = require('./song_from_midifile');

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

},{"./midi_event":20,"./midi_note":21,"./midifile":23,"./part":25,"./song":30,"./song_from_midifile":31,"./track":33}],27:[function(require,module,exports){
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
        settings: action.payload.settings
      };
      break;

    case _action_types.START_SCHEDULER:
      state = _extends({}, state);
      state.songs[action.payload.song_id].scheduler = action.payload.scheduler;
      break;

    case _action_types.STOP_SCHEDULER:
      state = _extends({}, state);
      delete state.songs[action.payload.song_id].scheduler;
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

},{"./action_types":15,"redux":12}],28:[function(require,module,exports){
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

},{"./io.js":19}],29:[function(require,module,exports){
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

          if (event.type === 144 || event.type === 128) {
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
      var i, event, numEvents, events, track, instrument;

      this.maxtime = position + BUFFER_TIME;
      events = this.getEvents();
      numEvents = events.length;

      for (i = 0; i < numEvents; i++) {
        event = events[i];
        //track = this.tracks[event.trackId]
        instrument = this.instruments[event.instrumentId];

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
        _this.instruments[instrumentId].stopAllSounds();
      });
    }
  }]);

  return Scheduler;
}();

exports.default = Scheduler;

},{}],30:[function(require,module,exports){
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
  var state = store.getState().editor;
  var song = state.songs[song_id];
  if (song) {
    (function () {
      (0, _parse_events.parseTimeEvents)(song.settings, song.timeEvents);
      var midiEvents = [].concat(_toConsumableArray(song.timeEvents));
      console.log(song);
      song.midiEventIds.forEach(function (event_id) {
        var event = state.midiEvents[event_id];
        if (event) {
          midiEvents.push(_extends({}, event));
        }
      });
      midiEvents = (0, _parse_events.parseEvents)(midiEvents);
      (0, _parse_events.parseMIDINotes)(midiEvents);
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
    var state = store.getState();
    var songData = state.sequencer.songs[song_id];
    var parts = {};
    var tracks = {};
    var instruments = {};
    var i = 0;
    var midiEvents = songData.midiEvents.filter(function (event) {
      if ((event.type === 144 || event.type === 128) && typeof event.midiNoteId === 'undefined') {
        console.info(i++, 'no midiNoteId', event);
        return false;
      }
      var part = parts[event.partId];
      var track = tracks[event.trackId];
      if (typeof part === 'undefined') {
        parts[event.partId] = part = state.editor.parts[event.partId];
      }
      if (typeof track === 'undefined') {
        tracks[event.trackId] = track = state.editor.tracks[event.trackId];
        instruments[track.instrumentId] = state.instruments[track.instrumentId];
      }
      //console.log(event.barsAsString, event)
      return !event.mute && !part.mute && !track.mute;
    });

    var position = start_position;
    var timeStamp = _io.context.currentTime * 1000; // -> convert to millis
    var scheduler = new _scheduler2.default({
      song_id: song_id,
      start_position: start_position,
      timeStamp: timeStamp,
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
  (0, _heartbeat.removeTask)('repetitive', song_id);
  var state = store.getState();
  var songData = state.sequencer.songs[song_id];
  if (songData) {
    songData.scheduler.stopAllSounds();
    store.dispatch({
      type: _action_types.STOP_SCHEDULER,
      payload: {
        song_id: song_id
      }
    });
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

},{"./action_types":15,"./create_store":16,"./heartbeat":17,"./io":19,"./midi_event":20,"./parse_events":24,"./qambi":26,"./scheduler":29}],31:[function(require,module,exports){
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

},{"./midi_event":20,"./midifile":23,"./part":25,"./song":30,"./track":33,"isomorphic-fetch":1}],32:[function(require,module,exports){
'use strict';

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _qambi = require('./qambi');

var _qambi2 = _interopRequireDefault(_qambi);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log(_qambi2.default.version);
_qambi2.default.log('functions');

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
      console.log('header:', mf.header);
      console.log('# tracks:', mf.tracks.size);
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

},{"./qambi":26,"isomorphic-fetch":1}],33:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTrack = createTrack;
exports.addParts = addParts;
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
      mute: false,
      instrumentId: (0, _instrument.createInstrument)('sinewave')
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

function muteTrack(flag) {}

function setVolumeTrack(flag) {}

function setPanningTrack(flag) {}

},{"./action_types":15,"./create_store":16,"./instrument":18,"./io":19}],34:[function(require,module,exports){
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

},{}]},{},[32])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvaXNvbW9ycGhpYy1mZXRjaC9mZXRjaC1ucG0tYnJvd3NlcmlmeS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2dldFByb3RvdHlwZS5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvX2lzSG9zdE9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy9sb2Rhc2gvaXNPYmplY3RMaWtlLmpzIiwibm9kZV9tb2R1bGVzL2xvZGFzaC9pc1BsYWluT2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvYXBwbHlNaWRkbGV3YXJlLmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi9iaW5kQWN0aW9uQ3JlYXRvcnMuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2NvbWJpbmVSZWR1Y2Vycy5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY29tcG9zZS5qcyIsIm5vZGVfbW9kdWxlcy9yZWR1eC9saWIvY3JlYXRlU3RvcmUuanMiLCJub2RlX21vZHVsZXMvcmVkdXgvbGliL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlZHV4L2xpYi91dGlscy93YXJuaW5nLmpzIiwibm9kZV9tb2R1bGVzL3doYXR3Zy1mZXRjaC9mZXRjaC5qcyIsInNyYy9hY3Rpb25fdHlwZXMuanMiLCJzcmMvY3JlYXRlX3N0b3JlLmpzIiwic3JjL2hlYXJ0YmVhdC5qcyIsInNyYy9pbnN0cnVtZW50LmpzIiwic3JjL2lvLmpzIiwic3JjL21pZGlfZXZlbnQuanMiLCJzcmMvbWlkaV9ub3RlLmpzIiwic3JjL21pZGlfc3RyZWFtLmpzIiwic3JjL21pZGlmaWxlLmpzIiwic3JjL3BhcnNlX2V2ZW50cy5qcyIsInNyYy9wYXJ0LmpzIiwic3JjL3FhbWJpLmpzIiwic3JjL3JlZHVjZXIuanMiLCJzcmMvc2FtcGxlLmpzIiwic3JjL3NjaGVkdWxlci5qcyIsInNyYy9zb25nLmpzIiwic3JjL3NvbmdfZnJvbV9taWRpZmlsZS5qcyIsInNyYy90ZXN0X3dlYi5qcyIsInNyYy90cmFjay5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUN2TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBLGlCQUFhLEVBQWI7QUFDQSxrQkFBYyxZQUFkO0FBQ0EsaUJBQWEsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxFQUFWLENBQWI7R0FORixDQW5CaUM7Q0FBNUIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gdGhlIHdoYXR3Zy1mZXRjaCBwb2x5ZmlsbCBpbnN0YWxscyB0aGUgZmV0Y2goKSBmdW5jdGlvblxuLy8gb24gdGhlIGdsb2JhbCBvYmplY3QgKHdpbmRvdyBvciBzZWxmKVxuLy9cbi8vIFJldHVybiB0aGF0IGFzIHRoZSBleHBvcnQgZm9yIHVzZSBpbiBXZWJwYWNrLCBCcm93c2VyaWZ5IGV0Yy5cbnJlcXVpcmUoJ3doYXR3Zy1mZXRjaCcpO1xubW9kdWxlLmV4cG9ydHMgPSBzZWxmLmZldGNoLmJpbmQoc2VsZik7XG4iLCIvKiBCdWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcyBmb3IgdGhvc2Ugd2l0aCB0aGUgc2FtZSBuYW1lIGFzIG90aGVyIGBsb2Rhc2hgIG1ldGhvZHMuICovXG52YXIgbmF0aXZlR2V0UHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mO1xuXG4vKipcbiAqIEdldHMgdGhlIGBbW1Byb3RvdHlwZV1dYCBvZiBgdmFsdWVgLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBxdWVyeS5cbiAqIEByZXR1cm5zIHtudWxsfE9iamVjdH0gUmV0dXJucyB0aGUgYFtbUHJvdG90eXBlXV1gLlxuICovXG5mdW5jdGlvbiBnZXRQcm90b3R5cGUodmFsdWUpIHtcbiAgcmV0dXJuIG5hdGl2ZUdldFByb3RvdHlwZShPYmplY3QodmFsdWUpKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBnZXRQcm90b3R5cGU7XG4iLCIvKipcbiAqIENoZWNrcyBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QgaW4gSUUgPCA5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgaG9zdCBvYmplY3QsIGVsc2UgYGZhbHNlYC5cbiAqL1xuZnVuY3Rpb24gaXNIb3N0T2JqZWN0KHZhbHVlKSB7XG4gIC8vIE1hbnkgaG9zdCBvYmplY3RzIGFyZSBgT2JqZWN0YCBvYmplY3RzIHRoYXQgY2FuIGNvZXJjZSB0byBzdHJpbmdzXG4gIC8vIGRlc3BpdGUgaGF2aW5nIGltcHJvcGVybHkgZGVmaW5lZCBgdG9TdHJpbmdgIG1ldGhvZHMuXG4gIHZhciByZXN1bHQgPSBmYWxzZTtcbiAgaWYgKHZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHZhbHVlLnRvU3RyaW5nICE9ICdmdW5jdGlvbicpIHtcbiAgICB0cnkge1xuICAgICAgcmVzdWx0ID0gISEodmFsdWUgKyAnJyk7XG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzSG9zdE9iamVjdDtcbiIsIi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UuIEEgdmFsdWUgaXMgb2JqZWN0LWxpa2UgaWYgaXQncyBub3QgYG51bGxgXG4gKiBhbmQgaGFzIGEgYHR5cGVvZmAgcmVzdWx0IG9mIFwib2JqZWN0XCIuXG4gKlxuICogQHN0YXRpY1xuICogQG1lbWJlck9mIF9cbiAqIEBzaW5jZSA0LjAuMFxuICogQGNhdGVnb3J5IExhbmdcbiAqIEBwYXJhbSB7Kn0gdmFsdWUgVGhlIHZhbHVlIHRvIGNoZWNrLlxuICogQHJldHVybnMge2Jvb2xlYW59IFJldHVybnMgYHRydWVgIGlmIGB2YWx1ZWAgaXMgb2JqZWN0LWxpa2UsIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogXy5pc09iamVjdExpa2Uoe30pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNPYmplY3RMaWtlKFsxLCAyLCAzXSk7XG4gKiAvLyA9PiB0cnVlXG4gKlxuICogXy5pc09iamVjdExpa2UoXy5ub29wKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc09iamVjdExpa2UobnVsbCk7XG4gKiAvLyA9PiBmYWxzZVxuICovXG5mdW5jdGlvbiBpc09iamVjdExpa2UodmFsdWUpIHtcbiAgcmV0dXJuICEhdmFsdWUgJiYgdHlwZW9mIHZhbHVlID09ICdvYmplY3QnO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzT2JqZWN0TGlrZTtcbiIsInZhciBnZXRQcm90b3R5cGUgPSByZXF1aXJlKCcuL19nZXRQcm90b3R5cGUnKSxcbiAgICBpc0hvc3RPYmplY3QgPSByZXF1aXJlKCcuL19pc0hvc3RPYmplY3QnKSxcbiAgICBpc09iamVjdExpa2UgPSByZXF1aXJlKCcuL2lzT2JqZWN0TGlrZScpO1xuXG4vKiogYE9iamVjdCN0b1N0cmluZ2AgcmVzdWx0IHJlZmVyZW5jZXMuICovXG52YXIgb2JqZWN0VGFnID0gJ1tvYmplY3QgT2JqZWN0XSc7XG5cbi8qKiBVc2VkIGZvciBidWlsdC1pbiBtZXRob2QgcmVmZXJlbmNlcy4gKi9cbnZhciBvYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XG5cbi8qKiBVc2VkIHRvIHJlc29sdmUgdGhlIGRlY29tcGlsZWQgc291cmNlIG9mIGZ1bmN0aW9ucy4gKi9cbnZhciBmdW5jVG9TdHJpbmcgPSBGdW5jdGlvbi5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKiBVc2VkIHRvIGNoZWNrIG9iamVjdHMgZm9yIG93biBwcm9wZXJ0aWVzLiAqL1xudmFyIGhhc093blByb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbi8qKiBVc2VkIHRvIGluZmVyIHRoZSBgT2JqZWN0YCBjb25zdHJ1Y3Rvci4gKi9cbnZhciBvYmplY3RDdG9yU3RyaW5nID0gZnVuY1RvU3RyaW5nLmNhbGwoT2JqZWN0KTtcblxuLyoqXG4gKiBVc2VkIHRvIHJlc29sdmUgdGhlXG4gKiBbYHRvU3RyaW5nVGFnYF0oaHR0cDovL2VjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtb2JqZWN0LnByb3RvdHlwZS50b3N0cmluZylcbiAqIG9mIHZhbHVlcy5cbiAqL1xudmFyIG9iamVjdFRvU3RyaW5nID0gb2JqZWN0UHJvdG8udG9TdHJpbmc7XG5cbi8qKlxuICogQ2hlY2tzIGlmIGB2YWx1ZWAgaXMgYSBwbGFpbiBvYmplY3QsIHRoYXQgaXMsIGFuIG9iamVjdCBjcmVhdGVkIGJ5IHRoZVxuICogYE9iamVjdGAgY29uc3RydWN0b3Igb3Igb25lIHdpdGggYSBgW1tQcm90b3R5cGVdXWAgb2YgYG51bGxgLlxuICpcbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJPZiBfXG4gKiBAc2luY2UgMC44LjBcbiAqIEBjYXRlZ29yeSBMYW5nXG4gKiBAcGFyYW0geyp9IHZhbHVlIFRoZSB2YWx1ZSB0byBjaGVjay5cbiAqIEByZXR1cm5zIHtib29sZWFufSBSZXR1cm5zIGB0cnVlYCBpZiBgdmFsdWVgIGlzIGEgcGxhaW4gb2JqZWN0LFxuICogIGVsc2UgYGZhbHNlYC5cbiAqIEBleGFtcGxlXG4gKlxuICogZnVuY3Rpb24gRm9vKCkge1xuICogICB0aGlzLmEgPSAxO1xuICogfVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChuZXcgRm9vKTtcbiAqIC8vID0+IGZhbHNlXG4gKlxuICogXy5pc1BsYWluT2JqZWN0KFsxLCAyLCAzXSk7XG4gKiAvLyA9PiBmYWxzZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdCh7ICd4JzogMCwgJ3knOiAwIH0pO1xuICogLy8gPT4gdHJ1ZVxuICpcbiAqIF8uaXNQbGFpbk9iamVjdChPYmplY3QuY3JlYXRlKG51bGwpKTtcbiAqIC8vID0+IHRydWVcbiAqL1xuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICBpZiAoIWlzT2JqZWN0TGlrZSh2YWx1ZSkgfHxcbiAgICAgIG9iamVjdFRvU3RyaW5nLmNhbGwodmFsdWUpICE9IG9iamVjdFRhZyB8fCBpc0hvc3RPYmplY3QodmFsdWUpKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHZhciBwcm90byA9IGdldFByb3RvdHlwZSh2YWx1ZSk7XG4gIGlmIChwcm90byA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIHZhciBDdG9yID0gaGFzT3duUHJvcGVydHkuY2FsbChwcm90bywgJ2NvbnN0cnVjdG9yJykgJiYgcHJvdG8uY29uc3RydWN0b3I7XG4gIHJldHVybiAodHlwZW9mIEN0b3IgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIEN0b3IgaW5zdGFuY2VvZiBDdG9yICYmIGZ1bmNUb1N0cmluZy5jYWxsKEN0b3IpID09IG9iamVjdEN0b3JTdHJpbmcpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzUGxhaW5PYmplY3Q7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gc2V0VGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgc2V0VGltZW91dChkcmFpblF1ZXVlLCAwKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gYXBwbHlNaWRkbGV3YXJlO1xuXG52YXIgX2NvbXBvc2UgPSByZXF1aXJlKCcuL2NvbXBvc2UnKTtcblxudmFyIF9jb21wb3NlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NvbXBvc2UpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3RvcmUgZW5oYW5jZXIgdGhhdCBhcHBsaWVzIG1pZGRsZXdhcmUgdG8gdGhlIGRpc3BhdGNoIG1ldGhvZFxuICogb2YgdGhlIFJlZHV4IHN0b3JlLiBUaGlzIGlzIGhhbmR5IGZvciBhIHZhcmlldHkgb2YgdGFza3MsIHN1Y2ggYXMgZXhwcmVzc2luZ1xuICogYXN5bmNocm9ub3VzIGFjdGlvbnMgaW4gYSBjb25jaXNlIG1hbm5lciwgb3IgbG9nZ2luZyBldmVyeSBhY3Rpb24gcGF5bG9hZC5cbiAqXG4gKiBTZWUgYHJlZHV4LXRodW5rYCBwYWNrYWdlIGFzIGFuIGV4YW1wbGUgb2YgdGhlIFJlZHV4IG1pZGRsZXdhcmUuXG4gKlxuICogQmVjYXVzZSBtaWRkbGV3YXJlIGlzIHBvdGVudGlhbGx5IGFzeW5jaHJvbm91cywgdGhpcyBzaG91bGQgYmUgdGhlIGZpcnN0XG4gKiBzdG9yZSBlbmhhbmNlciBpbiB0aGUgY29tcG9zaXRpb24gY2hhaW4uXG4gKlxuICogTm90ZSB0aGF0IGVhY2ggbWlkZGxld2FyZSB3aWxsIGJlIGdpdmVuIHRoZSBgZGlzcGF0Y2hgIGFuZCBgZ2V0U3RhdGVgIGZ1bmN0aW9uc1xuICogYXMgbmFtZWQgYXJndW1lbnRzLlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IG1pZGRsZXdhcmVzIFRoZSBtaWRkbGV3YXJlIGNoYWluIHRvIGJlIGFwcGxpZWQuXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgc3RvcmUgZW5oYW5jZXIgYXBwbHlpbmcgdGhlIG1pZGRsZXdhcmUuXG4gKi9cbmZ1bmN0aW9uIGFwcGx5TWlkZGxld2FyZSgpIHtcbiAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIG1pZGRsZXdhcmVzID0gQXJyYXkoX2xlbiksIF9rZXkgPSAwOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgbWlkZGxld2FyZXNbX2tleV0gPSBhcmd1bWVudHNbX2tleV07XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKGNyZWF0ZVN0b3JlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKSB7XG4gICAgICB2YXIgc3RvcmUgPSBjcmVhdGVTdG9yZShyZWR1Y2VyLCBpbml0aWFsU3RhdGUsIGVuaGFuY2VyKTtcbiAgICAgIHZhciBfZGlzcGF0Y2ggPSBzdG9yZS5kaXNwYXRjaDtcbiAgICAgIHZhciBjaGFpbiA9IFtdO1xuXG4gICAgICB2YXIgbWlkZGxld2FyZUFQSSA9IHtcbiAgICAgICAgZ2V0U3RhdGU6IHN0b3JlLmdldFN0YXRlLFxuICAgICAgICBkaXNwYXRjaDogZnVuY3Rpb24gZGlzcGF0Y2goYWN0aW9uKSB7XG4gICAgICAgICAgcmV0dXJuIF9kaXNwYXRjaChhY3Rpb24pO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY2hhaW4gPSBtaWRkbGV3YXJlcy5tYXAoZnVuY3Rpb24gKG1pZGRsZXdhcmUpIHtcbiAgICAgICAgcmV0dXJuIG1pZGRsZXdhcmUobWlkZGxld2FyZUFQSSk7XG4gICAgICB9KTtcbiAgICAgIF9kaXNwYXRjaCA9IF9jb21wb3NlMltcImRlZmF1bHRcIl0uYXBwbHkodW5kZWZpbmVkLCBjaGFpbikoc3RvcmUuZGlzcGF0Y2gpO1xuXG4gICAgICByZXR1cm4gX2V4dGVuZHMoe30sIHN0b3JlLCB7XG4gICAgICAgIGRpc3BhdGNoOiBfZGlzcGF0Y2hcbiAgICAgIH0pO1xuICAgIH07XG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBiaW5kQWN0aW9uQ3JlYXRvcnM7XG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcihhY3Rpb25DcmVhdG9yLCBkaXNwYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkaXNwYXRjaChhY3Rpb25DcmVhdG9yLmFwcGx5KHVuZGVmaW5lZCwgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uIGNyZWF0b3JzLCBpbnRvIGFuIG9iamVjdCB3aXRoIHRoZVxuICogc2FtZSBrZXlzLCBidXQgd2l0aCBldmVyeSBmdW5jdGlvbiB3cmFwcGVkIGludG8gYSBgZGlzcGF0Y2hgIGNhbGwgc28gdGhleVxuICogbWF5IGJlIGludm9rZWQgZGlyZWN0bHkuIFRoaXMgaXMganVzdCBhIGNvbnZlbmllbmNlIG1ldGhvZCwgYXMgeW91IGNhbiBjYWxsXG4gKiBgc3RvcmUuZGlzcGF0Y2goTXlBY3Rpb25DcmVhdG9ycy5kb1NvbWV0aGluZygpKWAgeW91cnNlbGYganVzdCBmaW5lLlxuICpcbiAqIEZvciBjb252ZW5pZW5jZSwgeW91IGNhbiBhbHNvIHBhc3MgYSBzaW5nbGUgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50LFxuICogYW5kIGdldCBhIGZ1bmN0aW9uIGluIHJldHVybi5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufE9iamVjdH0gYWN0aW9uQ3JlYXRvcnMgQW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgYWN0aW9uXG4gKiBjcmVhdG9yIGZ1bmN0aW9ucy4gT25lIGhhbmR5IHdheSB0byBvYnRhaW4gaXQgaXMgdG8gdXNlIEVTNiBgaW1wb3J0ICogYXNgXG4gKiBzeW50YXguIFlvdSBtYXkgYWxzbyBwYXNzIGEgc2luZ2xlIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRpc3BhdGNoIFRoZSBgZGlzcGF0Y2hgIGZ1bmN0aW9uIGF2YWlsYWJsZSBvbiB5b3VyIFJlZHV4XG4gKiBzdG9yZS5cbiAqXG4gKiBAcmV0dXJucyB7RnVuY3Rpb258T2JqZWN0fSBUaGUgb2JqZWN0IG1pbWlja2luZyB0aGUgb3JpZ2luYWwgb2JqZWN0LCBidXQgd2l0aFxuICogZXZlcnkgYWN0aW9uIGNyZWF0b3Igd3JhcHBlZCBpbnRvIHRoZSBgZGlzcGF0Y2hgIGNhbGwuIElmIHlvdSBwYXNzZWQgYVxuICogZnVuY3Rpb24gYXMgYGFjdGlvbkNyZWF0b3JzYCwgdGhlIHJldHVybiB2YWx1ZSB3aWxsIGFsc28gYmUgYSBzaW5nbGVcbiAqIGZ1bmN0aW9uLlxuICovXG5mdW5jdGlvbiBiaW5kQWN0aW9uQ3JlYXRvcnMoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKSB7XG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvcnMsIGRpc3BhdGNoKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvcnMgIT09ICdvYmplY3QnIHx8IGFjdGlvbkNyZWF0b3JzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWN0aW9uQ3JlYXRvcnMgZXhwZWN0ZWQgYW4gb2JqZWN0IG9yIGEgZnVuY3Rpb24sIGluc3RlYWQgcmVjZWl2ZWQgJyArIChhY3Rpb25DcmVhdG9ycyA9PT0gbnVsbCA/ICdudWxsJyA6IHR5cGVvZiBhY3Rpb25DcmVhdG9ycykgKyAnLiAnICsgJ0RpZCB5b3Ugd3JpdGUgXCJpbXBvcnQgQWN0aW9uQ3JlYXRvcnMgZnJvbVwiIGluc3RlYWQgb2YgXCJpbXBvcnQgKiBhcyBBY3Rpb25DcmVhdG9ycyBmcm9tXCI/Jyk7XG4gIH1cblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGFjdGlvbkNyZWF0b3JzKTtcbiAgdmFyIGJvdW5kQWN0aW9uQ3JlYXRvcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgdmFyIGFjdGlvbkNyZWF0b3IgPSBhY3Rpb25DcmVhdG9yc1trZXldO1xuICAgIGlmICh0eXBlb2YgYWN0aW9uQ3JlYXRvciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgYm91bmRBY3Rpb25DcmVhdG9yc1trZXldID0gYmluZEFjdGlvbkNyZWF0b3IoYWN0aW9uQ3JlYXRvciwgZGlzcGF0Y2gpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYm91bmRBY3Rpb25DcmVhdG9ycztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbWJpbmVSZWR1Y2VycztcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0ID0gcmVxdWlyZSgnbG9kYXNoL2lzUGxhaW5PYmplY3QnKTtcblxudmFyIF9pc1BsYWluT2JqZWN0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2lzUGxhaW5PYmplY3QpO1xuXG52YXIgX3dhcm5pbmcgPSByZXF1aXJlKCcuL3V0aWxzL3dhcm5pbmcnKTtcblxudmFyIF93YXJuaW5nMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dhcm5pbmcpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBcImRlZmF1bHRcIjogb2JqIH07IH1cblxuZnVuY3Rpb24gZ2V0VW5kZWZpbmVkU3RhdGVFcnJvck1lc3NhZ2Uoa2V5LCBhY3Rpb24pIHtcbiAgdmFyIGFjdGlvblR5cGUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGU7XG4gIHZhciBhY3Rpb25OYW1lID0gYWN0aW9uVHlwZSAmJiAnXCInICsgYWN0aW9uVHlwZS50b1N0cmluZygpICsgJ1wiJyB8fCAnYW4gYWN0aW9uJztcblxuICByZXR1cm4gJ1JlZHVjZXIgXCInICsga2V5ICsgJ1wiIHJldHVybmVkIHVuZGVmaW5lZCBoYW5kbGluZyAnICsgYWN0aW9uTmFtZSArICcuICcgKyAnVG8gaWdub3JlIGFuIGFjdGlvbiwgeW91IG11c3QgZXhwbGljaXRseSByZXR1cm4gdGhlIHByZXZpb3VzIHN0YXRlLic7XG59XG5cbmZ1bmN0aW9uIGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2UoaW5wdXRTdGF0ZSwgcmVkdWNlcnMsIGFjdGlvbikge1xuICB2YXIgcmVkdWNlcktleXMgPSBPYmplY3Qua2V5cyhyZWR1Y2Vycyk7XG4gIHZhciBhcmd1bWVudE5hbWUgPSBhY3Rpb24gJiYgYWN0aW9uLnR5cGUgPT09IF9jcmVhdGVTdG9yZS5BY3Rpb25UeXBlcy5JTklUID8gJ2luaXRpYWxTdGF0ZSBhcmd1bWVudCBwYXNzZWQgdG8gY3JlYXRlU3RvcmUnIDogJ3ByZXZpb3VzIHN0YXRlIHJlY2VpdmVkIGJ5IHRoZSByZWR1Y2VyJztcblxuICBpZiAocmVkdWNlcktleXMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuICdTdG9yZSBkb2VzIG5vdCBoYXZlIGEgdmFsaWQgcmVkdWNlci4gTWFrZSBzdXJlIHRoZSBhcmd1bWVudCBwYXNzZWQgJyArICd0byBjb21iaW5lUmVkdWNlcnMgaXMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgcmVkdWNlcnMuJztcbiAgfVxuXG4gIGlmICghKDAsIF9pc1BsYWluT2JqZWN0MltcImRlZmF1bHRcIl0pKGlucHV0U3RhdGUpKSB7XG4gICAgcmV0dXJuICdUaGUgJyArIGFyZ3VtZW50TmFtZSArICcgaGFzIHVuZXhwZWN0ZWQgdHlwZSBvZiBcIicgKyB7fS50b1N0cmluZy5jYWxsKGlucHV0U3RhdGUpLm1hdGNoKC9cXHMoW2EtenxBLVpdKykvKVsxXSArICdcIi4gRXhwZWN0ZWQgYXJndW1lbnQgdG8gYmUgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyAnICsgKCdrZXlzOiBcIicgKyByZWR1Y2VyS2V5cy5qb2luKCdcIiwgXCInKSArICdcIicpO1xuICB9XG5cbiAgdmFyIHVuZXhwZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoaW5wdXRTdGF0ZSkuZmlsdGVyKGZ1bmN0aW9uIChrZXkpIHtcbiAgICByZXR1cm4gIXJlZHVjZXJzLmhhc093blByb3BlcnR5KGtleSk7XG4gIH0pO1xuXG4gIGlmICh1bmV4cGVjdGVkS2V5cy5sZW5ndGggPiAwKSB7XG4gICAgcmV0dXJuICdVbmV4cGVjdGVkICcgKyAodW5leHBlY3RlZEtleXMubGVuZ3RoID4gMSA/ICdrZXlzJyA6ICdrZXknKSArICcgJyArICgnXCInICsgdW5leHBlY3RlZEtleXMuam9pbignXCIsIFwiJykgKyAnXCIgZm91bmQgaW4gJyArIGFyZ3VtZW50TmFtZSArICcuICcpICsgJ0V4cGVjdGVkIHRvIGZpbmQgb25lIG9mIHRoZSBrbm93biByZWR1Y2VyIGtleXMgaW5zdGVhZDogJyArICgnXCInICsgcmVkdWNlcktleXMuam9pbignXCIsIFwiJykgKyAnXCIuIFVuZXhwZWN0ZWQga2V5cyB3aWxsIGJlIGlnbm9yZWQuJyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0UmVkdWNlclNhbml0eShyZWR1Y2Vycykge1xuICBPYmplY3Qua2V5cyhyZWR1Y2VycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG4gICAgdmFyIHJlZHVjZXIgPSByZWR1Y2Vyc1trZXldO1xuICAgIHZhciBpbml0aWFsU3RhdGUgPSByZWR1Y2VyKHVuZGVmaW5lZCwgeyB0eXBlOiBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICAgIGlmICh0eXBlb2YgaW5pdGlhbFN0YXRlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWR1Y2VyIFwiJyArIGtleSArICdcIiByZXR1cm5lZCB1bmRlZmluZWQgZHVyaW5nIGluaXRpYWxpemF0aW9uLiAnICsgJ0lmIHRoZSBzdGF0ZSBwYXNzZWQgdG8gdGhlIHJlZHVjZXIgaXMgdW5kZWZpbmVkLCB5b3UgbXVzdCAnICsgJ2V4cGxpY2l0bHkgcmV0dXJuIHRoZSBpbml0aWFsIHN0YXRlLiBUaGUgaW5pdGlhbCBzdGF0ZSBtYXkgJyArICdub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cblxuICAgIHZhciB0eXBlID0gJ0BAcmVkdXgvUFJPQkVfVU5LTk9XTl9BQ1RJT05fJyArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZyg3KS5zcGxpdCgnJykuam9pbignLicpO1xuICAgIGlmICh0eXBlb2YgcmVkdWNlcih1bmRlZmluZWQsIHsgdHlwZTogdHlwZSB9KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUmVkdWNlciBcIicgKyBrZXkgKyAnXCIgcmV0dXJuZWQgdW5kZWZpbmVkIHdoZW4gcHJvYmVkIHdpdGggYSByYW5kb20gdHlwZS4gJyArICgnRG9uXFwndCB0cnkgdG8gaGFuZGxlICcgKyBfY3JlYXRlU3RvcmUuQWN0aW9uVHlwZXMuSU5JVCArICcgb3Igb3RoZXIgYWN0aW9ucyBpbiBcInJlZHV4LypcIiAnKSArICduYW1lc3BhY2UuIFRoZXkgYXJlIGNvbnNpZGVyZWQgcHJpdmF0ZS4gSW5zdGVhZCwgeW91IG11c3QgcmV0dXJuIHRoZSAnICsgJ2N1cnJlbnQgc3RhdGUgZm9yIGFueSB1bmtub3duIGFjdGlvbnMsIHVubGVzcyBpdCBpcyB1bmRlZmluZWQsICcgKyAnaW4gd2hpY2ggY2FzZSB5b3UgbXVzdCByZXR1cm4gdGhlIGluaXRpYWwgc3RhdGUsIHJlZ2FyZGxlc3Mgb2YgdGhlICcgKyAnYWN0aW9uIHR5cGUuIFRoZSBpbml0aWFsIHN0YXRlIG1heSBub3QgYmUgdW5kZWZpbmVkLicpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8qKlxuICogVHVybnMgYW4gb2JqZWN0IHdob3NlIHZhbHVlcyBhcmUgZGlmZmVyZW50IHJlZHVjZXIgZnVuY3Rpb25zLCBpbnRvIGEgc2luZ2xlXG4gKiByZWR1Y2VyIGZ1bmN0aW9uLiBJdCB3aWxsIGNhbGwgZXZlcnkgY2hpbGQgcmVkdWNlciwgYW5kIGdhdGhlciB0aGVpciByZXN1bHRzXG4gKiBpbnRvIGEgc2luZ2xlIHN0YXRlIG9iamVjdCwgd2hvc2Uga2V5cyBjb3JyZXNwb25kIHRvIHRoZSBrZXlzIG9mIHRoZSBwYXNzZWRcbiAqIHJlZHVjZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSByZWR1Y2VycyBBbiBvYmplY3Qgd2hvc2UgdmFsdWVzIGNvcnJlc3BvbmQgdG8gZGlmZmVyZW50XG4gKiByZWR1Y2VyIGZ1bmN0aW9ucyB0aGF0IG5lZWQgdG8gYmUgY29tYmluZWQgaW50byBvbmUuIE9uZSBoYW5keSB3YXkgdG8gb2J0YWluXG4gKiBpdCBpcyB0byB1c2UgRVM2IGBpbXBvcnQgKiBhcyByZWR1Y2Vyc2Agc3ludGF4LiBUaGUgcmVkdWNlcnMgbWF5IG5ldmVyIHJldHVyblxuICogdW5kZWZpbmVkIGZvciBhbnkgYWN0aW9uLiBJbnN0ZWFkLCB0aGV5IHNob3VsZCByZXR1cm4gdGhlaXIgaW5pdGlhbCBzdGF0ZVxuICogaWYgdGhlIHN0YXRlIHBhc3NlZCB0byB0aGVtIHdhcyB1bmRlZmluZWQsIGFuZCB0aGUgY3VycmVudCBzdGF0ZSBmb3IgYW55XG4gKiB1bnJlY29nbml6ZWQgYWN0aW9uLlxuICpcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSByZWR1Y2VyIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyBldmVyeSByZWR1Y2VyIGluc2lkZSB0aGVcbiAqIHBhc3NlZCBvYmplY3QsIGFuZCBidWlsZHMgYSBzdGF0ZSBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZS5cbiAqL1xuZnVuY3Rpb24gY29tYmluZVJlZHVjZXJzKHJlZHVjZXJzKSB7XG4gIHZhciByZWR1Y2VyS2V5cyA9IE9iamVjdC5rZXlzKHJlZHVjZXJzKTtcbiAgdmFyIGZpbmFsUmVkdWNlcnMgPSB7fTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWR1Y2VyS2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSByZWR1Y2VyS2V5c1tpXTtcbiAgICBpZiAodHlwZW9mIHJlZHVjZXJzW2tleV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGZpbmFsUmVkdWNlcnNba2V5XSA9IHJlZHVjZXJzW2tleV07XG4gICAgfVxuICB9XG4gIHZhciBmaW5hbFJlZHVjZXJLZXlzID0gT2JqZWN0LmtleXMoZmluYWxSZWR1Y2Vycyk7XG5cbiAgdmFyIHNhbml0eUVycm9yO1xuICB0cnkge1xuICAgIGFzc2VydFJlZHVjZXJTYW5pdHkoZmluYWxSZWR1Y2Vycyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBzYW5pdHlFcnJvciA9IGU7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gY29tYmluYXRpb24oKSB7XG4gICAgdmFyIHN0YXRlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAwIHx8IGFyZ3VtZW50c1swXSA9PT0gdW5kZWZpbmVkID8ge30gOiBhcmd1bWVudHNbMF07XG4gICAgdmFyIGFjdGlvbiA9IGFyZ3VtZW50c1sxXTtcblxuICAgIGlmIChzYW5pdHlFcnJvcikge1xuICAgICAgdGhyb3cgc2FuaXR5RXJyb3I7XG4gICAgfVxuXG4gICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICAgIHZhciB3YXJuaW5nTWVzc2FnZSA9IGdldFVuZXhwZWN0ZWRTdGF0ZVNoYXBlV2FybmluZ01lc3NhZ2Uoc3RhdGUsIGZpbmFsUmVkdWNlcnMsIGFjdGlvbik7XG4gICAgICBpZiAod2FybmluZ01lc3NhZ2UpIHtcbiAgICAgICAgKDAsIF93YXJuaW5nMltcImRlZmF1bHRcIl0pKHdhcm5pbmdNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgaGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIHZhciBuZXh0U3RhdGUgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGZpbmFsUmVkdWNlcktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBmaW5hbFJlZHVjZXJLZXlzW2ldO1xuICAgICAgdmFyIHJlZHVjZXIgPSBmaW5hbFJlZHVjZXJzW2tleV07XG4gICAgICB2YXIgcHJldmlvdXNTdGF0ZUZvcktleSA9IHN0YXRlW2tleV07XG4gICAgICB2YXIgbmV4dFN0YXRlRm9yS2V5ID0gcmVkdWNlcihwcmV2aW91c1N0YXRlRm9yS2V5LCBhY3Rpb24pO1xuICAgICAgaWYgKHR5cGVvZiBuZXh0U3RhdGVGb3JLZXkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBlcnJvck1lc3NhZ2UgPSBnZXRVbmRlZmluZWRTdGF0ZUVycm9yTWVzc2FnZShrZXksIGFjdGlvbik7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgICAgbmV4dFN0YXRlW2tleV0gPSBuZXh0U3RhdGVGb3JLZXk7XG4gICAgICBoYXNDaGFuZ2VkID0gaGFzQ2hhbmdlZCB8fCBuZXh0U3RhdGVGb3JLZXkgIT09IHByZXZpb3VzU3RhdGVGb3JLZXk7XG4gICAgfVxuICAgIHJldHVybiBoYXNDaGFuZ2VkID8gbmV4dFN0YXRlIDogc3RhdGU7XG4gIH07XG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNvbXBvc2U7XG4vKipcbiAqIENvbXBvc2VzIHNpbmdsZS1hcmd1bWVudCBmdW5jdGlvbnMgZnJvbSByaWdodCB0byBsZWZ0LlxuICpcbiAqIEBwYXJhbSB7Li4uRnVuY3Rpb259IGZ1bmNzIFRoZSBmdW5jdGlvbnMgdG8gY29tcG9zZS5cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiBvYnRhaW5lZCBieSBjb21wb3NpbmcgZnVuY3Rpb25zIGZyb20gcmlnaHQgdG9cbiAqIGxlZnQuIEZvciBleGFtcGxlLCBjb21wb3NlKGYsIGcsIGgpIGlzIGlkZW50aWNhbCB0byBhcmcgPT4gZihnKGgoYXJnKSkpLlxuICovXG5mdW5jdGlvbiBjb21wb3NlKCkge1xuICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgZnVuY3MgPSBBcnJheShfbGVuKSwgX2tleSA9IDA7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICBmdW5jc1tfa2V5XSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKGZ1bmNzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPD0gMCA/IHVuZGVmaW5lZCA6IGFyZ3VtZW50c1swXTtcbiAgICB9XG5cbiAgICB2YXIgbGFzdCA9IGZ1bmNzW2Z1bmNzLmxlbmd0aCAtIDFdO1xuICAgIHZhciByZXN0ID0gZnVuY3Muc2xpY2UoMCwgLTEpO1xuXG4gICAgcmV0dXJuIHJlc3QucmVkdWNlUmlnaHQoZnVuY3Rpb24gKGNvbXBvc2VkLCBmKSB7XG4gICAgICByZXR1cm4gZihjb21wb3NlZCk7XG4gICAgfSwgbGFzdC5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cykpO1xuICB9O1xufSIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHMuQWN0aW9uVHlwZXMgPSB1bmRlZmluZWQ7XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGNyZWF0ZVN0b3JlO1xuXG52YXIgX2lzUGxhaW5PYmplY3QgPSByZXF1aXJlKCdsb2Rhc2gvaXNQbGFpbk9iamVjdCcpO1xuXG52YXIgX2lzUGxhaW5PYmplY3QyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXNQbGFpbk9iamVjdCk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKipcbiAqIFRoZXNlIGFyZSBwcml2YXRlIGFjdGlvbiB0eXBlcyByZXNlcnZlZCBieSBSZWR1eC5cbiAqIEZvciBhbnkgdW5rbm93biBhY3Rpb25zLCB5b3UgbXVzdCByZXR1cm4gdGhlIGN1cnJlbnQgc3RhdGUuXG4gKiBJZiB0aGUgY3VycmVudCBzdGF0ZSBpcyB1bmRlZmluZWQsIHlvdSBtdXN0IHJldHVybiB0aGUgaW5pdGlhbCBzdGF0ZS5cbiAqIERvIG5vdCByZWZlcmVuY2UgdGhlc2UgYWN0aW9uIHR5cGVzIGRpcmVjdGx5IGluIHlvdXIgY29kZS5cbiAqL1xudmFyIEFjdGlvblR5cGVzID0gZXhwb3J0cy5BY3Rpb25UeXBlcyA9IHtcbiAgSU5JVDogJ0BAcmVkdXgvSU5JVCdcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIFJlZHV4IHN0b3JlIHRoYXQgaG9sZHMgdGhlIHN0YXRlIHRyZWUuXG4gKiBUaGUgb25seSB3YXkgdG8gY2hhbmdlIHRoZSBkYXRhIGluIHRoZSBzdG9yZSBpcyB0byBjYWxsIGBkaXNwYXRjaCgpYCBvbiBpdC5cbiAqXG4gKiBUaGVyZSBzaG91bGQgb25seSBiZSBhIHNpbmdsZSBzdG9yZSBpbiB5b3VyIGFwcC4gVG8gc3BlY2lmeSBob3cgZGlmZmVyZW50XG4gKiBwYXJ0cyBvZiB0aGUgc3RhdGUgdHJlZSByZXNwb25kIHRvIGFjdGlvbnMsIHlvdSBtYXkgY29tYmluZSBzZXZlcmFsIHJlZHVjZXJzXG4gKiBpbnRvIGEgc2luZ2xlIHJlZHVjZXIgZnVuY3Rpb24gYnkgdXNpbmcgYGNvbWJpbmVSZWR1Y2Vyc2AuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gcmVkdWNlciBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgbmV4dCBzdGF0ZSB0cmVlLCBnaXZlblxuICogdGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBhbmQgdGhlIGFjdGlvbiB0byBoYW5kbGUuXG4gKlxuICogQHBhcmFtIHthbnl9IFtpbml0aWFsU3RhdGVdIFRoZSBpbml0aWFsIHN0YXRlLiBZb3UgbWF5IG9wdGlvbmFsbHkgc3BlY2lmeSBpdFxuICogdG8gaHlkcmF0ZSB0aGUgc3RhdGUgZnJvbSB0aGUgc2VydmVyIGluIHVuaXZlcnNhbCBhcHBzLCBvciB0byByZXN0b3JlIGFcbiAqIHByZXZpb3VzbHkgc2VyaWFsaXplZCB1c2VyIHNlc3Npb24uXG4gKiBJZiB5b3UgdXNlIGBjb21iaW5lUmVkdWNlcnNgIHRvIHByb2R1Y2UgdGhlIHJvb3QgcmVkdWNlciBmdW5jdGlvbiwgdGhpcyBtdXN0IGJlXG4gKiBhbiBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzaGFwZSBhcyBgY29tYmluZVJlZHVjZXJzYCBrZXlzLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGVuaGFuY2VyIFRoZSBzdG9yZSBlbmhhbmNlci4gWW91IG1heSBvcHRpb25hbGx5IHNwZWNpZnkgaXRcbiAqIHRvIGVuaGFuY2UgdGhlIHN0b3JlIHdpdGggdGhpcmQtcGFydHkgY2FwYWJpbGl0aWVzIHN1Y2ggYXMgbWlkZGxld2FyZSxcbiAqIHRpbWUgdHJhdmVsLCBwZXJzaXN0ZW5jZSwgZXRjLiBUaGUgb25seSBzdG9yZSBlbmhhbmNlciB0aGF0IHNoaXBzIHdpdGggUmVkdXhcbiAqIGlzIGBhcHBseU1pZGRsZXdhcmUoKWAuXG4gKlxuICogQHJldHVybnMge1N0b3JlfSBBIFJlZHV4IHN0b3JlIHRoYXQgbGV0cyB5b3UgcmVhZCB0aGUgc3RhdGUsIGRpc3BhdGNoIGFjdGlvbnNcbiAqIGFuZCBzdWJzY3JpYmUgdG8gY2hhbmdlcy5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlU3RvcmUocmVkdWNlciwgaW5pdGlhbFN0YXRlLCBlbmhhbmNlcikge1xuICBpZiAodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZW5oYW5jZXIgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgZW5oYW5jZXIgPSBpbml0aWFsU3RhdGU7XG4gICAgaW5pdGlhbFN0YXRlID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbmhhbmNlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIGVuaGFuY2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBlbmhhbmNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIHJldHVybiBlbmhhbmNlcihjcmVhdGVTdG9yZSkocmVkdWNlciwgaW5pdGlhbFN0YXRlKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcmVkdWNlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgdGhlIHJlZHVjZXIgdG8gYmUgYSBmdW5jdGlvbi4nKTtcbiAgfVxuXG4gIHZhciBjdXJyZW50UmVkdWNlciA9IHJlZHVjZXI7XG4gIHZhciBjdXJyZW50U3RhdGUgPSBpbml0aWFsU3RhdGU7XG4gIHZhciBjdXJyZW50TGlzdGVuZXJzID0gW107XG4gIHZhciBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycztcbiAgdmFyIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCkge1xuICAgIGlmIChuZXh0TGlzdGVuZXJzID09PSBjdXJyZW50TGlzdGVuZXJzKSB7XG4gICAgICBuZXh0TGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycy5zbGljZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgc3RhdGUgdHJlZSBtYW5hZ2VkIGJ5IHRoZSBzdG9yZS5cbiAgICpcbiAgICogQHJldHVybnMge2FueX0gVGhlIGN1cnJlbnQgc3RhdGUgdHJlZSBvZiB5b3VyIGFwcGxpY2F0aW9uLlxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0U3RhdGUoKSB7XG4gICAgcmV0dXJuIGN1cnJlbnRTdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgY2hhbmdlIGxpc3RlbmVyLiBJdCB3aWxsIGJlIGNhbGxlZCBhbnkgdGltZSBhbiBhY3Rpb24gaXMgZGlzcGF0Y2hlZCxcbiAgICogYW5kIHNvbWUgcGFydCBvZiB0aGUgc3RhdGUgdHJlZSBtYXkgcG90ZW50aWFsbHkgaGF2ZSBjaGFuZ2VkLiBZb3UgbWF5IHRoZW5cbiAgICogY2FsbCBgZ2V0U3RhdGUoKWAgdG8gcmVhZCB0aGUgY3VycmVudCBzdGF0ZSB0cmVlIGluc2lkZSB0aGUgY2FsbGJhY2suXG4gICAqXG4gICAqIFlvdSBtYXkgY2FsbCBgZGlzcGF0Y2goKWAgZnJvbSBhIGNoYW5nZSBsaXN0ZW5lciwgd2l0aCB0aGUgZm9sbG93aW5nXG4gICAqIGNhdmVhdHM6XG4gICAqXG4gICAqIDEuIFRoZSBzdWJzY3JpcHRpb25zIGFyZSBzbmFwc2hvdHRlZCBqdXN0IGJlZm9yZSBldmVyeSBgZGlzcGF0Y2goKWAgY2FsbC5cbiAgICogSWYgeW91IHN1YnNjcmliZSBvciB1bnN1YnNjcmliZSB3aGlsZSB0aGUgbGlzdGVuZXJzIGFyZSBiZWluZyBpbnZva2VkLCB0aGlzXG4gICAqIHdpbGwgbm90IGhhdmUgYW55IGVmZmVjdCBvbiB0aGUgYGRpc3BhdGNoKClgIHRoYXQgaXMgY3VycmVudGx5IGluIHByb2dyZXNzLlxuICAgKiBIb3dldmVyLCB0aGUgbmV4dCBgZGlzcGF0Y2goKWAgY2FsbCwgd2hldGhlciBuZXN0ZWQgb3Igbm90LCB3aWxsIHVzZSBhIG1vcmVcbiAgICogcmVjZW50IHNuYXBzaG90IG9mIHRoZSBzdWJzY3JpcHRpb24gbGlzdC5cbiAgICpcbiAgICogMi4gVGhlIGxpc3RlbmVyIHNob3VsZCBub3QgZXhwZWN0IHRvIHNlZSBhbGwgc3RhdGVzIGNoYW5nZXMsIGFzIHRoZSBzdGF0ZVxuICAgKiBtaWdodCBoYXZlIGJlZW4gdXBkYXRlZCBtdWx0aXBsZSB0aW1lcyBkdXJpbmcgYSBuZXN0ZWQgYGRpc3BhdGNoKClgIGJlZm9yZVxuICAgKiB0aGUgbGlzdGVuZXIgaXMgY2FsbGVkLiBJdCBpcywgaG93ZXZlciwgZ3VhcmFudGVlZCB0aGF0IGFsbCBzdWJzY3JpYmVyc1xuICAgKiByZWdpc3RlcmVkIGJlZm9yZSB0aGUgYGRpc3BhdGNoKClgIHN0YXJ0ZWQgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGUgbGF0ZXN0XG4gICAqIHN0YXRlIGJ5IHRoZSB0aW1lIGl0IGV4aXRzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBBIGNhbGxiYWNrIHRvIGJlIGludm9rZWQgb24gZXZlcnkgZGlzcGF0Y2guXG4gICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBmdW5jdGlvbiB0byByZW1vdmUgdGhpcyBjaGFuZ2UgbGlzdGVuZXIuXG4gICAqL1xuICBmdW5jdGlvbiBzdWJzY3JpYmUobGlzdGVuZXIpIHtcbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGxpc3RlbmVyIHRvIGJlIGEgZnVuY3Rpb24uJyk7XG4gICAgfVxuXG4gICAgdmFyIGlzU3Vic2NyaWJlZCA9IHRydWU7XG5cbiAgICBlbnN1cmVDYW5NdXRhdGVOZXh0TGlzdGVuZXJzKCk7XG4gICAgbmV4dExpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgIHJldHVybiBmdW5jdGlvbiB1bnN1YnNjcmliZSgpIHtcbiAgICAgIGlmICghaXNTdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaXNTdWJzY3JpYmVkID0gZmFsc2U7XG5cbiAgICAgIGVuc3VyZUNhbk11dGF0ZU5leHRMaXN0ZW5lcnMoKTtcbiAgICAgIHZhciBpbmRleCA9IG5leHRMaXN0ZW5lcnMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgICBuZXh0TGlzdGVuZXJzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGFuIGFjdGlvbi4gSXQgaXMgdGhlIG9ubHkgd2F5IHRvIHRyaWdnZXIgYSBzdGF0ZSBjaGFuZ2UuXG4gICAqXG4gICAqIFRoZSBgcmVkdWNlcmAgZnVuY3Rpb24sIHVzZWQgdG8gY3JlYXRlIHRoZSBzdG9yZSwgd2lsbCBiZSBjYWxsZWQgd2l0aCB0aGVcbiAgICogY3VycmVudCBzdGF0ZSB0cmVlIGFuZCB0aGUgZ2l2ZW4gYGFjdGlvbmAuIEl0cyByZXR1cm4gdmFsdWUgd2lsbFxuICAgKiBiZSBjb25zaWRlcmVkIHRoZSAqKm5leHQqKiBzdGF0ZSBvZiB0aGUgdHJlZSwgYW5kIHRoZSBjaGFuZ2UgbGlzdGVuZXJzXG4gICAqIHdpbGwgYmUgbm90aWZpZWQuXG4gICAqXG4gICAqIFRoZSBiYXNlIGltcGxlbWVudGF0aW9uIG9ubHkgc3VwcG9ydHMgcGxhaW4gb2JqZWN0IGFjdGlvbnMuIElmIHlvdSB3YW50IHRvXG4gICAqIGRpc3BhdGNoIGEgUHJvbWlzZSwgYW4gT2JzZXJ2YWJsZSwgYSB0aHVuaywgb3Igc29tZXRoaW5nIGVsc2UsIHlvdSBuZWVkIHRvXG4gICAqIHdyYXAgeW91ciBzdG9yZSBjcmVhdGluZyBmdW5jdGlvbiBpbnRvIHRoZSBjb3JyZXNwb25kaW5nIG1pZGRsZXdhcmUuIEZvclxuICAgKiBleGFtcGxlLCBzZWUgdGhlIGRvY3VtZW50YXRpb24gZm9yIHRoZSBgcmVkdXgtdGh1bmtgIHBhY2thZ2UuIEV2ZW4gdGhlXG4gICAqIG1pZGRsZXdhcmUgd2lsbCBldmVudHVhbGx5IGRpc3BhdGNoIHBsYWluIG9iamVjdCBhY3Rpb25zIHVzaW5nIHRoaXMgbWV0aG9kLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYWN0aW9uIEEgcGxhaW4gb2JqZWN0IHJlcHJlc2VudGluZyDigJx3aGF0IGNoYW5nZWTigJ0uIEl0IGlzXG4gICAqIGEgZ29vZCBpZGVhIHRvIGtlZXAgYWN0aW9ucyBzZXJpYWxpemFibGUgc28geW91IGNhbiByZWNvcmQgYW5kIHJlcGxheSB1c2VyXG4gICAqIHNlc3Npb25zLCBvciB1c2UgdGhlIHRpbWUgdHJhdmVsbGluZyBgcmVkdXgtZGV2dG9vbHNgLiBBbiBhY3Rpb24gbXVzdCBoYXZlXG4gICAqIGEgYHR5cGVgIHByb3BlcnR5IHdoaWNoIG1heSBub3QgYmUgYHVuZGVmaW5lZGAuIEl0IGlzIGEgZ29vZCBpZGVhIHRvIHVzZVxuICAgKiBzdHJpbmcgY29uc3RhbnRzIGZvciBhY3Rpb24gdHlwZXMuXG4gICAqXG4gICAqIEByZXR1cm5zIHtPYmplY3R9IEZvciBjb252ZW5pZW5jZSwgdGhlIHNhbWUgYWN0aW9uIG9iamVjdCB5b3UgZGlzcGF0Y2hlZC5cbiAgICpcbiAgICogTm90ZSB0aGF0LCBpZiB5b3UgdXNlIGEgY3VzdG9tIG1pZGRsZXdhcmUsIGl0IG1heSB3cmFwIGBkaXNwYXRjaCgpYCB0b1xuICAgKiByZXR1cm4gc29tZXRoaW5nIGVsc2UgKGZvciBleGFtcGxlLCBhIFByb21pc2UgeW91IGNhbiBhd2FpdCkuXG4gICAqL1xuICBmdW5jdGlvbiBkaXNwYXRjaChhY3Rpb24pIHtcbiAgICBpZiAoISgwLCBfaXNQbGFpbk9iamVjdDJbXCJkZWZhdWx0XCJdKShhY3Rpb24pKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FjdGlvbnMgbXVzdCBiZSBwbGFpbiBvYmplY3RzLiAnICsgJ1VzZSBjdXN0b20gbWlkZGxld2FyZSBmb3IgYXN5bmMgYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGFjdGlvbi50eXBlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBY3Rpb25zIG1heSBub3QgaGF2ZSBhbiB1bmRlZmluZWQgXCJ0eXBlXCIgcHJvcGVydHkuICcgKyAnSGF2ZSB5b3UgbWlzc3BlbGxlZCBhIGNvbnN0YW50PycpO1xuICAgIH1cblxuICAgIGlmIChpc0Rpc3BhdGNoaW5nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlZHVjZXJzIG1heSBub3QgZGlzcGF0Y2ggYWN0aW9ucy4nKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaXNEaXNwYXRjaGluZyA9IHRydWU7XG4gICAgICBjdXJyZW50U3RhdGUgPSBjdXJyZW50UmVkdWNlcihjdXJyZW50U3RhdGUsIGFjdGlvbik7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlzRGlzcGF0Y2hpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgbGlzdGVuZXJzID0gY3VycmVudExpc3RlbmVycyA9IG5leHRMaXN0ZW5lcnM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxpc3RlbmVyc1tpXSgpO1xuICAgIH1cblxuICAgIHJldHVybiBhY3Rpb247XG4gIH1cblxuICAvKipcbiAgICogUmVwbGFjZXMgdGhlIHJlZHVjZXIgY3VycmVudGx5IHVzZWQgYnkgdGhlIHN0b3JlIHRvIGNhbGN1bGF0ZSB0aGUgc3RhdGUuXG4gICAqXG4gICAqIFlvdSBtaWdodCBuZWVkIHRoaXMgaWYgeW91ciBhcHAgaW1wbGVtZW50cyBjb2RlIHNwbGl0dGluZyBhbmQgeW91IHdhbnQgdG9cbiAgICogbG9hZCBzb21lIG9mIHRoZSByZWR1Y2VycyBkeW5hbWljYWxseS4gWW91IG1pZ2h0IGFsc28gbmVlZCB0aGlzIGlmIHlvdVxuICAgKiBpbXBsZW1lbnQgYSBob3QgcmVsb2FkaW5nIG1lY2hhbmlzbSBmb3IgUmVkdXguXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IG5leHRSZWR1Y2VyIFRoZSByZWR1Y2VyIGZvciB0aGUgc3RvcmUgdG8gdXNlIGluc3RlYWQuXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gcmVwbGFjZVJlZHVjZXIobmV4dFJlZHVjZXIpIHtcbiAgICBpZiAodHlwZW9mIG5leHRSZWR1Y2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIHRoZSBuZXh0UmVkdWNlciB0byBiZSBhIGZ1bmN0aW9uLicpO1xuICAgIH1cblxuICAgIGN1cnJlbnRSZWR1Y2VyID0gbmV4dFJlZHVjZXI7XG4gICAgZGlzcGF0Y2goeyB0eXBlOiBBY3Rpb25UeXBlcy5JTklUIH0pO1xuICB9XG5cbiAgLy8gV2hlbiBhIHN0b3JlIGlzIGNyZWF0ZWQsIGFuIFwiSU5JVFwiIGFjdGlvbiBpcyBkaXNwYXRjaGVkIHNvIHRoYXQgZXZlcnlcbiAgLy8gcmVkdWNlciByZXR1cm5zIHRoZWlyIGluaXRpYWwgc3RhdGUuIFRoaXMgZWZmZWN0aXZlbHkgcG9wdWxhdGVzXG4gIC8vIHRoZSBpbml0aWFsIHN0YXRlIHRyZWUuXG4gIGRpc3BhdGNoKHsgdHlwZTogQWN0aW9uVHlwZXMuSU5JVCB9KTtcblxuICByZXR1cm4ge1xuICAgIGRpc3BhdGNoOiBkaXNwYXRjaCxcbiAgICBzdWJzY3JpYmU6IHN1YnNjcmliZSxcbiAgICBnZXRTdGF0ZTogZ2V0U3RhdGUsXG4gICAgcmVwbGFjZVJlZHVjZXI6IHJlcGxhY2VSZWR1Y2VyXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5jb21wb3NlID0gZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBleHBvcnRzLmJpbmRBY3Rpb25DcmVhdG9ycyA9IGV4cG9ydHMuY29tYmluZVJlZHVjZXJzID0gZXhwb3J0cy5jcmVhdGVTdG9yZSA9IHVuZGVmaW5lZDtcblxudmFyIF9jcmVhdGVTdG9yZSA9IHJlcXVpcmUoJy4vY3JlYXRlU3RvcmUnKTtcblxudmFyIF9jcmVhdGVTdG9yZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9jcmVhdGVTdG9yZSk7XG5cbnZhciBfY29tYmluZVJlZHVjZXJzID0gcmVxdWlyZSgnLi9jb21iaW5lUmVkdWNlcnMnKTtcblxudmFyIF9jb21iaW5lUmVkdWNlcnMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tYmluZVJlZHVjZXJzKTtcblxudmFyIF9iaW5kQWN0aW9uQ3JlYXRvcnMgPSByZXF1aXJlKCcuL2JpbmRBY3Rpb25DcmVhdG9ycycpO1xuXG52YXIgX2JpbmRBY3Rpb25DcmVhdG9yczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9iaW5kQWN0aW9uQ3JlYXRvcnMpO1xuXG52YXIgX2FwcGx5TWlkZGxld2FyZSA9IHJlcXVpcmUoJy4vYXBwbHlNaWRkbGV3YXJlJyk7XG5cbnZhciBfYXBwbHlNaWRkbGV3YXJlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2FwcGx5TWlkZGxld2FyZSk7XG5cbnZhciBfY29tcG9zZSA9IHJlcXVpcmUoJy4vY29tcG9zZScpO1xuXG52YXIgX2NvbXBvc2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY29tcG9zZSk7XG5cbnZhciBfd2FybmluZyA9IHJlcXVpcmUoJy4vdXRpbHMvd2FybmluZycpO1xuXG52YXIgX3dhcm5pbmcyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfd2FybmluZyk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IFwiZGVmYXVsdFwiOiBvYmogfTsgfVxuXG4vKlxuKiBUaGlzIGlzIGEgZHVtbXkgZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIGZ1bmN0aW9uIG5hbWUgaGFzIGJlZW4gYWx0ZXJlZCBieSBtaW5pZmljYXRpb24uXG4qIElmIHRoZSBmdW5jdGlvbiBoYXMgYmVlbiBtaW5pZmllZCBhbmQgTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJywgd2FybiB0aGUgdXNlci5cbiovXG5mdW5jdGlvbiBpc0NydXNoZWQoKSB7fVxuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyAmJiB0eXBlb2YgaXNDcnVzaGVkLm5hbWUgPT09ICdzdHJpbmcnICYmIGlzQ3J1c2hlZC5uYW1lICE9PSAnaXNDcnVzaGVkJykge1xuICAoMCwgX3dhcm5pbmcyW1wiZGVmYXVsdFwiXSkoJ1lvdSBhcmUgY3VycmVudGx5IHVzaW5nIG1pbmlmaWVkIGNvZGUgb3V0c2lkZSBvZiBOT0RFX0VOViA9PT0gXFwncHJvZHVjdGlvblxcJy4gJyArICdUaGlzIG1lYW5zIHRoYXQgeW91IGFyZSBydW5uaW5nIGEgc2xvd2VyIGRldmVsb3BtZW50IGJ1aWxkIG9mIFJlZHV4LiAnICsgJ1lvdSBjYW4gdXNlIGxvb3NlLWVudmlmeSAoaHR0cHM6Ly9naXRodWIuY29tL3plcnRvc2gvbG9vc2UtZW52aWZ5KSBmb3IgYnJvd3NlcmlmeSAnICsgJ29yIERlZmluZVBsdWdpbiBmb3Igd2VicGFjayAoaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8zMDAzMDAzMSkgJyArICd0byBlbnN1cmUgeW91IGhhdmUgdGhlIGNvcnJlY3QgY29kZSBmb3IgeW91ciBwcm9kdWN0aW9uIGJ1aWxkLicpO1xufVxuXG5leHBvcnRzLmNyZWF0ZVN0b3JlID0gX2NyZWF0ZVN0b3JlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbWJpbmVSZWR1Y2VycyA9IF9jb21iaW5lUmVkdWNlcnMyW1wiZGVmYXVsdFwiXTtcbmV4cG9ydHMuYmluZEFjdGlvbkNyZWF0b3JzID0gX2JpbmRBY3Rpb25DcmVhdG9yczJbXCJkZWZhdWx0XCJdO1xuZXhwb3J0cy5hcHBseU1pZGRsZXdhcmUgPSBfYXBwbHlNaWRkbGV3YXJlMltcImRlZmF1bHRcIl07XG5leHBvcnRzLmNvbXBvc2UgPSBfY29tcG9zZTJbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gd2FybmluZztcbi8qKlxuICogUHJpbnRzIGEgd2FybmluZyBpbiB0aGUgY29uc29sZSBpZiBpdCBleGlzdHMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgVGhlIHdhcm5pbmcgbWVzc2FnZS5cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiB3YXJuaW5nKG1lc3NhZ2UpIHtcbiAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uc29sZS5lcnJvcihtZXNzYWdlKTtcbiAgfVxuICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgdHJ5IHtcbiAgICAvLyBUaGlzIGVycm9yIHdhcyB0aHJvd24gYXMgYSBjb252ZW5pZW5jZSBzbyB0aGF0IHlvdSBjYW4gdXNlIHRoaXMgc3RhY2tcbiAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gICAgLyogZXNsaW50LWRpc2FibGUgbm8tZW1wdHkgKi9cbiAgfSBjYXRjaCAoZSkge31cbiAgLyogZXNsaW50LWVuYWJsZSBuby1lbXB0eSAqL1xufSIsIihmdW5jdGlvbihzZWxmKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG5cbiAgICAgIGlmICghdGhpcy5oZWFkZXJzLmdldCgnY29udGVudC10eXBlJykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBib2R5ID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRoaXMuaGVhZGVycy5zZXQoJ2NvbnRlbnQtdHlwZScsICd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlCbG9iICYmIHRoaXMuX2JvZHlCbG9iLnR5cGUpIHtcbiAgICAgICAgICB0aGlzLmhlYWRlcnMuc2V0KCdjb250ZW50LXR5cGUnLCB0aGlzLl9ib2R5QmxvYi50eXBlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgICB0aGlzLl9pbml0Qm9keShib2R5SW5pdClcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gNTk5KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHRoaXMpO1xuIiwiZXhwb3J0IGNvbnN0IEFERF9NSURJX05PVEVTID0gJ2FkZF9taWRpX25vdGVzJ1xuZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UUyA9ICdhZGRfbWlkaV9ldmVudHMnXG4vL2V4cG9ydCBjb25zdCBBRERfVFJBQ0sgPSAnYWRkX3RyYWNrJ1xuLy9leHBvcnQgY29uc3QgQUREX1BBUlQgPSAnYWRkX3BhcnQnXG5cbmV4cG9ydCBjb25zdCBDUkVBVEVfVFJBQ0sgPSAnY3JlYXRlX3RyYWNrJ1xuZXhwb3J0IGNvbnN0IEFERF9QQVJUUyA9ICdhZGRfcGFydHMnXG5leHBvcnQgY29uc3QgQUREX1RSQUNLUyA9ICdhZGRfdHJhY2tzJ1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX1BBUlQgPSAnY3JlYXRlX3BhcnQnXG5leHBvcnQgY29uc3QgQUREX1RJTUVfRVZFTlRTID0gJ2FkZF90aW1lX2V2ZW50cydcblxuZXhwb3J0IGNvbnN0IENSRUFURV9TT05HID0gJ2NyZWF0ZV9zb25nJ1xuZXhwb3J0IGNvbnN0IEFERF9NSURJX0VWRU5UU19UT19TT05HID0gJ2FkZF9taWRpX2V2ZW50c190b19zb25nJ1xuXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfRVZFTlQgPSAnY3JlYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgQ1JFQVRFX01JRElfTk9URSA9ICdjcmVhdGVfbWlkaV9ub3RlJ1xuZXhwb3J0IGNvbnN0IEFERF9FVkVOVFNfVE9fU09ORyA9ICdhZGRfZXZlbnRzX3RvX3NvbmcnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfRVZFTlQgPSAndXBkYXRlX21pZGlfZXZlbnQnXG5leHBvcnQgY29uc3QgVVBEQVRFX01JRElfTk9URSA9ICd1cGRhdGVfbWlkaV9ub3RlJ1xuXG5leHBvcnQgY29uc3QgVVBEQVRFX1NPTkcgPSAndXBkYXRlX3NvbmcnXG5cbi8vIHNlcXVlbmNlciBhY3Rpb25zXG5leHBvcnQgY29uc3QgU09OR19QT1NJVElPTiA9ICdzb25nX3Bvc2l0aW9uJ1xuZXhwb3J0IGNvbnN0IFBMQVlfU09ORyA9ICdwbGF5X3NvbmcnXG5leHBvcnQgY29uc3QgUEFVU0VfU09ORyA9ICdwYXVzZV9zb25nJ1xuZXhwb3J0IGNvbnN0IFNUT1BfU09ORyA9ICdzdG9wX3NvbmcnXG5leHBvcnQgY29uc3QgU1RBUlRfU0NIRURVTEVSID0gJ1NUQVJUX1NDSEVEVUxFUidcbmV4cG9ydCBjb25zdCBTVE9QX1NDSEVEVUxFUiA9ICdTVE9QX1NDSEVEVUxFUidcblxuXG4vLyBpbnN0cnVtZW50IGFjdGlvbnNcbmV4cG9ydCBjb25zdCBDUkVBVEVfSU5TVFJVTUVOVCA9ICdjcmVhdGVfaW5zdHJ1bWVudCdcblxuIiwiaW1wb3J0IHtjcmVhdGVTdG9yZSwgYXBwbHlNaWRkbGV3YXJlLCBjb21wb3NlfSBmcm9tICdyZWR1eCdcbi8vaW1wb3J0IHRodW5rIGZyb20gJ3JlZHV4LXRodW5rJztcbi8vaW1wb3J0IGNyZWF0ZUxvZ2dlciBmcm9tICdyZWR1eC1sb2dnZXInO1xuaW1wb3J0IHNlcXVlbmNlckFwcCBmcm9tICcuL3JlZHVjZXInXG5cbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwKTtcblxuLypcbi8vIGRvbid0IHVzZSB0aGUgcmVkdXggZGV2IHRvb2wgYmVjYXVzZSBpdCB1c2UgdG9vIG11Y2ggQ1BVIGFuZCBtZW1vcnkhXG5jb25zdCBsb2dnZXIgPSBjcmVhdGVMb2dnZXIoKTtcbmNvbnN0IHN0b3JlID0gY3JlYXRlU3RvcmUoc2VxdWVuY2VyQXBwLCB7fSwgY29tcG9zZShcbiAgYXBwbHlNaWRkbGV3YXJlKGxvZ2dlciksXG4gIHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnICYmIHR5cGVvZiB3aW5kb3cuZGV2VG9vbHNFeHRlbnNpb24gIT09ICd1bmRlZmluZWQnID8gd2luZG93LmRldlRvb2xzRXh0ZW5zaW9uKCkgOiBmID0+IGZcbikpO1xuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN0b3JlKCl7XG4gIHJldHVybiBzdG9yZVxufVxuXG5cbiIsIlxuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvLmpzJztcblxubGV0IHRpbWVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgcmVwZXRpdGl2ZVRhc2tzID0gbmV3IE1hcCgpO1xubGV0IHNjaGVkdWxlZFRhc2tzID0gbmV3IE1hcCgpO1xubGV0IHRhc2tzID0gbmV3IE1hcCgpO1xubGV0IGxhc3RUaW1lU3RhbXA7XG5cbmZ1bmN0aW9uIGhlYXJ0YmVhdCh0aW1lc3RhbXApe1xuICBsZXQgbm93ID0gY29udGV4dC50aW1lO1xuXG4gIC8vIGZvciBpbnN0YW5jZTogdGhlIGNhbGxiYWNrIG9mIHNhbXBsZS51bnNjaGVkdWxlO1xuICBmb3IobGV0IFtrZXksIHRhc2tdIG9mIHRpbWVkVGFza3Mpe1xuICAgIGlmKHRhc2sudGltZSA+PSBub3cpe1xuICAgICAgdGFzay5leGVjdXRlKG5vdyk7XG4gICAgICB0aW1lZFRhc2tzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnVwZGF0ZSgpO1xuICBmb3IobGV0IHRhc2sgb2Ygc2NoZWR1bGVkVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIC8vIGZvciBpbnN0YW5jZTogc29uZy5wdWxzZSgpO1xuICBmb3IobGV0IHRhc2sgb2YgcmVwZXRpdGl2ZVRhc2tzLnZhbHVlcygpKXtcbiAgICB0YXNrKG5vdyk7XG4gIH1cblxuICBsYXN0VGltZVN0YW1wID0gdGltZXN0YW1wO1xuICBzY2hlZHVsZWRUYXNrcy5jbGVhcigpO1xuXG4gIC8vc2V0VGltZW91dChoZWFydGJlYXQsIDEwMDAwKTtcbiAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShoZWFydGJlYXQpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUYXNrKHR5cGUsIGlkLCB0YXNrKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLnNldChpZCwgdGFzayk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVUYXNrKHR5cGUsIGlkKXtcbiAgbGV0IG1hcCA9IHRhc2tzLmdldCh0eXBlKTtcbiAgbWFwLmRlbGV0ZShpZCk7XG59XG5cbihmdW5jdGlvbiBzdGFydCgpe1xuICB0YXNrcy5zZXQoJ3RpbWVkJywgdGltZWRUYXNrcyk7XG4gIHRhc2tzLnNldCgncmVwZXRpdGl2ZScsIHJlcGV0aXRpdmVUYXNrcyk7XG4gIHRhc2tzLnNldCgnc2NoZWR1bGVkJywgc2NoZWR1bGVkVGFza3MpO1xuICBoZWFydGJlYXQoKTtcbn0oKSlcbiIsImltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtjcmVhdGVTYW1wbGV9IGZyb20gJy4vc2FtcGxlJ1xuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX0lOU1RSVU1FTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBpbnN0cnVtZW50SW5kZXggPSAwXG5cbmNsYXNzIEluc3RydW1lbnR7XG5cbiAgY29uc3RydWN0b3IoaWQ6IHN0cmluZywgdHlwZTogc3RyaW5nKXtcbiAgICB0aGlzLmlkID0gaWRcbiAgICB0aGlzLnR5cGUgPSB0eXBlXG4gICAgdGhpcy5zY2hlZHVsZWQgPSB7fVxuICB9XG5cbiAgcHJvY2Vzc01JRElFdmVudChldmVudCwgdGltZSwgb3V0cHV0KXtcbiAgICBsZXQgc2FtcGxlXG4gICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIC8vY29uc29sZS5sb2coMTQ0LCAnOicsIHRpbWUsIGNvbnRleHQuY3VycmVudFRpbWUsIGV2ZW50Lm1pbGxpcylcbiAgICAgIHNhbXBsZSA9IGNyZWF0ZVNhbXBsZSgtMSwgZXZlbnQpXG4gICAgICB0aGlzLnNjaGVkdWxlZFtldmVudC5taWRpTm90ZUlkXSA9IHNhbXBsZVxuICAgICAgc2FtcGxlLm91dHB1dC5jb25uZWN0KG91dHB1dClcbiAgICAgIHNhbXBsZS5zdGFydCh0aW1lKVxuICAgICAgLy9jb25zb2xlLmxvZygnc3RhcnQnLCBldmVudC5taWRpTm90ZUlkKVxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvL2NvbnNvbGUubG9nKDEyOCwgJzonLCB0aW1lLCBjb250ZXh0LmN1cnJlbnRUaW1lLCBldmVudC5taWxsaXMpXG4gICAgICBzYW1wbGUgPSB0aGlzLnNjaGVkdWxlZFtldmVudC5taWRpTm90ZUlkXVxuICAgICAgaWYodHlwZW9mIHNhbXBsZSA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjb25zb2xlLmVycm9yKCdzYW1wbGUgbm90IGZvdW5kIGZvciBldmVudCcsIGV2ZW50KVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHNhbXBsZS5zdG9wKHRpbWUsICgpID0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcCcsIGV2ZW50Lm1pZGlOb3RlSWQpXG4gICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFtldmVudC5taWRpTm90ZUlkXVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICBzdG9wQWxsU291bmRzKCl7XG4gICAgT2JqZWN0LmtleXModGhpcy5zY2hlZHVsZWQpLmZvckVhY2goKHNhbXBsZUlkKSA9PiB7XG4gICAgICB0aGlzLnNjaGVkdWxlZFtzYW1wbGVJZF0uc3RvcCgwLCAoKSA9PiB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNjaGVkdWxlZFtzYW1wbGVJZF1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW5zdHJ1bWVudCh0eXBlOiBzdHJpbmcpe1xuICBsZXQgaWQgPSBgSU5fJHtpbnN0cnVtZW50SW5kZXgrK31fJHtuZXcgRGF0ZSgpLmdldFRpbWUoKX1gXG4gIGxldCBpbnN0cnVtZW50ID0gbmV3IEluc3RydW1lbnQoaWQsIHR5cGUpXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfSU5TVFJVTUVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIGluc3RydW1lbnRcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5cbiIsIlxuXG5jb25zdCBjb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKVxuXG5leHBvcnQge2NvbnRleHR9XG4iLCIvLyBAZmxvd1xuXG5pbXBvcnQge2dldFN0b3JlfSBmcm9tICcuL2NyZWF0ZV9zdG9yZSdcbmltcG9ydCB7dXBkYXRlTUlESU5vdGV9IGZyb20gJy4vbWlkaV9ub3RlJ1xuLy9pbXBvcnQge2NyZWF0ZU5vdGV9IGZyb20gJy4vbm90ZS5qcyc7XG5pbXBvcnQge1xuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfRVZFTlQsXG59IGZyb20gJy4vYWN0aW9uX3R5cGVzJ1xuXG5jb25zdCBzdG9yZSA9IGdldFN0b3JlKClcbmxldCBtaWRpRXZlbnRJbmRleCA9IDBcblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCh0aWNrczogbnVtYmVyLCB0eXBlOiBudW1iZXIsIGRhdGExOiBudW1iZXIsIGRhdGEyOiBudW1iZXIgPSAtMSl7XG4gIGxldCBpZCA9IGBNRV8ke21pZGlFdmVudEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQgc29ydEluZGV4ID0gdGlja3MgKyB0eXBlXG4gIGlmKHR5cGUgPT09IDE0NCB8fCB0eXBlID09PSAxMjgpe1xuICAgIHNvcnRJbmRleCA9IHRpY2tzICsgdHlwZVxuICB9XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBDUkVBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgdHlwZSxcbiAgICAgIHNvcnRJbmRleCxcbiAgICAgIGRhdGExLFxuICAgICAgZGF0YTIsXG4gICAgICBmcmVxdWVuY3k6IDQ0MCAqIE1hdGgucG93KDIsIChkYXRhMSAtIDY5KSAvIDEyKSxcbiAgICB9XG4gIH0pXG4gIHJldHVybiBpZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TUlESUV2ZW50SWQoKXtcbiAgcmV0dXJuIGBNRV8ke21pZGlFdmVudEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbW92ZU1JRElFdmVudChpZDogc3RyaW5nLCB0aWNrc190b19tb3ZlOiBudW1iZXIpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2lkXVxuICBsZXQgdGlja3MgPSBldmVudC50aWNrcyArIHRpY2tzX3RvX21vdmVcbiAgdGlja3MgPSB0aWNrcyA8IDAgPyAwIDogdGlja3NcbiAgLy9jb25zb2xlLmxvZyh0aWNrcywgZXZlbnQudGlja3MpXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgc29ydEluZGV4OiB0aWNrcyArIGV2ZW50LnR5cGVcbiAgICB9XG4gIH0pXG4gIC8vIGlmIHRoZSBldmVudCBpcyBwYXJ0IG9mIGEgbWlkaSBub3RlLCB1cGRhdGUgaXRcbiAgbGV0IG5vdGVfaWQgPSBldmVudC5ub3RlXG4gIGlmKG5vdGVfaWQpe1xuICAgIHVwZGF0ZU1JRElOb3RlKG5vdGVfaWQsIHN0YXRlKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtb3ZlTUlESUV2ZW50VG8oaWQ6IHN0cmluZywgdGlja3M6IG51bWJlcil7XG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKCkuZWRpdG9yXG4gIGxldCBldmVudCA9IHN0YXRlLm1pZGlFdmVudHNbaWRdXG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBVUERBVEVfTUlESV9FVkVOVCxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIHRpY2tzLFxuICAgICAgc29ydEluZGV4OiB0aWNrcyArIGV2ZW50LnR5cGVcbiAgICB9XG4gIH0pXG4gIGlmKHR5cGVvZiBldmVudCA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgIGNvbnNvbGUuZXJyb3IoJ2V2ZW50IGlzIHVuZGVmaW5lZCcpIC8vdGhpcyBzaG91bGQndCBoYXBwZW4hXG4gIH1cbiAgLy8gaWYgdGhlIGV2ZW50IGlzIHBhcnQgb2YgYSBtaWRpIG5vdGUsIHVwZGF0ZSBpdFxuICBsZXQgbm90ZV9pZCA9IGV2ZW50Lm5vdGVcbiAgaWYobm90ZV9pZCl7XG4gICAgdXBkYXRlTUlESU5vdGUobm90ZV9pZCwgc3RhdGUpXG4gIH1cbn1cbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgQ1JFQVRFX01JRElfTk9URSxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVNSURJTm90ZShpZCwgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpKXtcbiAgbGV0IG5vdGUgPSBzdGF0ZS5taWRpTm90ZXNbaWRdXG4gIGxldCBldmVudHMgPSBzdGF0ZS5taWRpRXZlbnRzXG4gIGxldCBzdGFydCA9IGV2ZW50c1tub3RlLm5vdGVvbl1cbiAgbGV0IGVuZCA9IGV2ZW50c1tub3RlLm5vdGVvZmZdXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IFVQREFURV9NSURJX05PVEUsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQsXG4gICAgICBzdGFydDogc3RhcnQudGlja3MsXG4gICAgICBlbmQ6IGVuZC50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IGVuZC50aWNrcyAtIHN0YXJ0LnRpY2tzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTUlESU5vdGUobm90ZW9uOiBzdHJpbmcsIG5vdGVvZmY6IHN0cmluZyl7XG4gIGxldCBldmVudHMgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvci5taWRpRXZlbnRzXG4gIGxldCBvbiA9IGV2ZW50c1tub3Rlb25dXG4gIGxldCBvZmYgPSBldmVudHNbbm90ZW9mZl1cbiAgaWYob24uZGF0YTEgIT09IG9mZi5kYXRhMSl7XG4gICAgY29uc29sZS5lcnJvcignY2FuXFwndCBjcmVhdGUgTUlESSBub3RlOiBldmVudHMgbXVzdCBoYXZlIHRoZSBzYW1lIGRhdGExIHZhbHVlLCBpLmUuIHRoZSBzYW1lIHBpdGNoJylcbiAgICByZXR1cm4gLTE7XG4gIH1cblxuICBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQ1JFQVRFX01JRElfTk9URSxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5vdGVvbixcbiAgICAgIG5vdGVvZmYsXG4gICAgICBzdGFydDogb24udGlja3MsXG4gICAgICBlbmQ6IG9mZi50aWNrcyxcbiAgICAgIGR1cmF0aW9uVGlja3M6IG9mZi50aWNrcyAtIG9uLnRpY2tzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cbiIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1JRElTdHJlYW17XG5cbiAgLy8gYnVmZmVyIGlzIFVpbnQ4QXJyYXlcbiAgY29uc3RydWN0b3IoYnVmZmVyKXtcbiAgICB0aGlzLmJ1ZmZlciA9IGJ1ZmZlcjtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIC8qIHJlYWQgc3RyaW5nIG9yIGFueSBudW1iZXIgb2YgYnl0ZXMgKi9cbiAgcmVhZChsZW5ndGgsIHRvU3RyaW5nID0gdHJ1ZSkge1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICBpZih0b1N0cmluZyl7XG4gICAgICByZXN1bHQgPSAnJztcbiAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKywgdGhpcy5wb3NpdGlvbisrKXtcbiAgICAgICAgcmVzdWx0ICs9IGZjYyh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1lbHNle1xuICAgICAgcmVzdWx0ID0gW107XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgLyogcmVhZCBhIGJpZy1lbmRpYW4gMzItYml0IGludGVnZXIgKi9cbiAgcmVhZEludDMyKCkge1xuICAgIGxldCByZXN1bHQgPSAoXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0gPDwgMjQpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV0gPDwgMTYpICtcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMl0gPDwgOCkgK1xuICAgICAgdGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDNdXG4gICAgKTtcbiAgICB0aGlzLnBvc2l0aW9uICs9IDQ7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDE2LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQxNigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAxXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSAyO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGFuIDgtYml0IGludGVnZXIgKi9cbiAgcmVhZEludDgoc2lnbmVkKSB7XG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dO1xuICAgIGlmKHNpZ25lZCAmJiByZXN1bHQgPiAxMjcpe1xuICAgICAgcmVzdWx0IC09IDI1NjtcbiAgICB9XG4gICAgdGhpcy5wb3NpdGlvbiArPSAxO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBlb2YoKSB7XG4gICAgcmV0dXJuIHRoaXMucG9zaXRpb24gPj0gdGhpcy5idWZmZXIubGVuZ3RoO1xuICB9XG5cbiAgLyogcmVhZCBhIE1JREktc3R5bGUgbGV0aWFibGUtbGVuZ3RoIGludGVnZXJcbiAgICAoYmlnLWVuZGlhbiB2YWx1ZSBpbiBncm91cHMgb2YgNyBiaXRzLFxuICAgIHdpdGggdG9wIGJpdCBzZXQgdG8gc2lnbmlmeSB0aGF0IGFub3RoZXIgYnl0ZSBmb2xsb3dzKVxuICAqL1xuICByZWFkVmFySW50KCkge1xuICAgIGxldCByZXN1bHQgPSAwO1xuICAgIHdoaWxlKHRydWUpIHtcbiAgICAgIGxldCBiID0gdGhpcy5yZWFkSW50OCgpO1xuICAgICAgaWYgKGIgJiAweDgwKSB7XG4gICAgICAgIHJlc3VsdCArPSAoYiAmIDB4N2YpO1xuICAgICAgICByZXN1bHQgPDw9IDc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvKiBiIGlzIHRoZSBsYXN0IGJ5dGUgKi9cbiAgICAgICAgcmV0dXJuIHJlc3VsdCArIGI7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmVzZXQoKXtcbiAgICB0aGlzLnBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIHNldFBvc2l0aW9uKHApe1xuICAgIHRoaXMucG9zaXRpb24gPSBwO1xuICB9XG59XG4iLCIvKlxuICBFeHRyYWN0cyBhbGwgbWlkaSBldmVudHMgZnJvbSBhIGJpbmFyeSBtaWRpIGZpbGUsIHVzZXMgbWlkaV9zdHJlYW0uanNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IE1JRElTdHJlYW0gZnJvbSAnLi9taWRpX3N0cmVhbSc7XG5cbmxldFxuICBsYXN0RXZlbnRUeXBlQnl0ZSxcbiAgdHJhY2tOYW1lO1xuXG5cbmZ1bmN0aW9uIHJlYWRDaHVuayhzdHJlYW0pe1xuICBsZXQgaWQgPSBzdHJlYW0ucmVhZCg0LCB0cnVlKTtcbiAgbGV0IGxlbmd0aCA9IHN0cmVhbS5yZWFkSW50MzIoKTtcbiAgLy9jb25zb2xlLmxvZyhsZW5ndGgpO1xuICByZXR1cm57XG4gICAgJ2lkJzogaWQsXG4gICAgJ2xlbmd0aCc6IGxlbmd0aCxcbiAgICAnZGF0YSc6IHN0cmVhbS5yZWFkKGxlbmd0aCwgZmFsc2UpXG4gIH07XG59XG5cblxuZnVuY3Rpb24gcmVhZEV2ZW50KHN0cmVhbSl7XG4gIHZhciBldmVudCA9IHt9O1xuICB2YXIgbGVuZ3RoO1xuICBldmVudC5kZWx0YVRpbWUgPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICBsZXQgZXZlbnRUeXBlQnl0ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAvL2NvbnNvbGUubG9nKGV2ZW50VHlwZUJ5dGUsIGV2ZW50VHlwZUJ5dGUgJiAweDgwLCAxNDYgJiAweDBmKTtcbiAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweGYwKSA9PSAweGYwKXtcbiAgICAvKiBzeXN0ZW0gLyBtZXRhIGV2ZW50ICovXG4gICAgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGZmKXtcbiAgICAgIC8qIG1ldGEgZXZlbnQgKi9cbiAgICAgIGV2ZW50LnR5cGUgPSAnbWV0YSc7XG4gICAgICBsZXQgc3VidHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBzd2l0Y2goc3VidHlwZUJ5dGUpe1xuICAgICAgICBjYXNlIDB4MDA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZU51bWJlcic7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNlcXVlbmNlTnVtYmVyIGV2ZW50IGlzIDIsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1iZXIgPSBzdHJlYW0ucmVhZEludDE2KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0ZXh0JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwMjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NvcHlyaWdodE5vdGljZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDM6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd0cmFja05hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHRyYWNrTmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdpbnN0cnVtZW50TmFtZSc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDU6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdseXJpY3MnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA2OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbWFya2VyJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNzpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2N1ZVBvaW50JztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyMDpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21pZGlDaGFubmVsUHJlZml4JztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDEpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgbWlkaUNoYW5uZWxQcmVmaXggZXZlbnQgaXMgMSwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmNoYW5uZWwgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgyZjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2VuZE9mVHJhY2snO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBlbmRPZlRyYWNrIGV2ZW50IGlzIDAsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3NldFRlbXBvJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDMpe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3Igc2V0VGVtcG8gZXZlbnQgaXMgMywgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQgPSAoXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgMTYpICtcbiAgICAgICAgICAgIChzdHJlYW0ucmVhZEludDgoKSA8PCA4KSArXG4gICAgICAgICAgICBzdHJlYW0ucmVhZEludDgoKVxuICAgICAgICAgICk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTQ6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzbXB0ZU9mZnNldCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA1KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNtcHRlT2Zmc2V0IGV2ZW50IGlzIDUsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgaG91ckJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5mcmFtZVJhdGUgPXtcbiAgICAgICAgICAgIDB4MDA6IDI0LCAweDIwOiAyNSwgMHg0MDogMjksIDB4NjA6IDMwXG4gICAgICAgICAgfVtob3VyQnl0ZSAmIDB4NjBdO1xuICAgICAgICAgIGV2ZW50LmhvdXIgPSBob3VyQnl0ZSAmIDB4MWY7XG4gICAgICAgICAgZXZlbnQubWluID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc2VjID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5zdWJmcmFtZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU4OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGltZVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSA0KXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHRpbWVTaWduYXR1cmUgZXZlbnQgaXMgNCwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50Lm51bWVyYXRvciA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmRlbm9taW5hdG9yID0gTWF0aC5wb3coMiwgc3RyZWFtLnJlYWRJbnQ4KCkpO1xuICAgICAgICAgIGV2ZW50Lm1ldHJvbm9tZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnRoaXJ0eXNlY29uZHMgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1OTpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2tleVNpZ25hdHVyZSc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAyKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIGtleVNpZ25hdHVyZSBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQua2V5ID0gc3RyZWFtLnJlYWRJbnQ4KHRydWUpO1xuICAgICAgICAgIGV2ZW50LnNjYWxlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4N2Y6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXF1ZW5jZXJTcGVjaWZpYyc7XG4gICAgICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIC8vaWYoc2VxdWVuY2VyLmRlYnVnID49IDIpe1xuICAgICAgICAgIC8vICAgIGNvbnNvbGUud2FybignVW5yZWNvZ25pc2VkIG1ldGEgZXZlbnQgc3VidHlwZTogJyArIHN1YnR5cGVCeXRlKTtcbiAgICAgICAgICAvL31cbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNlIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmMCl7XG4gICAgICBldmVudC50eXBlID0gJ3N5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4Zjcpe1xuICAgICAgZXZlbnQudHlwZSA9ICdkaXZpZGVkU3lzRXgnO1xuICAgICAgbGVuZ3RoID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1lbHNle1xuICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGUgYnl0ZTogJyArIGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvKiBjaGFubmVsIGV2ZW50ICovXG4gICAgbGV0IHBhcmFtMTtcbiAgICBpZigoZXZlbnRUeXBlQnl0ZSAmIDB4ODApID09PSAwKXtcbiAgICAgIC8qIHJ1bm5pbmcgc3RhdHVzIC0gcmV1c2UgbGFzdEV2ZW50VHlwZUJ5dGUgYXMgdGhlIGV2ZW50IHR5cGUuXG4gICAgICAgIGV2ZW50VHlwZUJ5dGUgaXMgYWN0dWFsbHkgdGhlIGZpcnN0IHBhcmFtZXRlclxuICAgICAgKi9cbiAgICAgIC8vY29uc29sZS5sb2coJ3J1bm5pbmcgc3RhdHVzJyk7XG4gICAgICBwYXJhbTEgPSBldmVudFR5cGVCeXRlO1xuICAgICAgZXZlbnRUeXBlQnl0ZSA9IGxhc3RFdmVudFR5cGVCeXRlO1xuICAgIH1lbHNle1xuICAgICAgcGFyYW0xID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdsYXN0JywgZXZlbnRUeXBlQnl0ZSk7XG4gICAgICBsYXN0RXZlbnRUeXBlQnl0ZSA9IGV2ZW50VHlwZUJ5dGU7XG4gICAgfVxuICAgIGxldCBldmVudFR5cGUgPSBldmVudFR5cGVCeXRlID4+IDQ7XG4gICAgZXZlbnQuY2hhbm5lbCA9IGV2ZW50VHlwZUJ5dGUgJiAweDBmO1xuICAgIGV2ZW50LnR5cGUgPSAnY2hhbm5lbCc7XG4gICAgc3dpdGNoIChldmVudFR5cGUpe1xuICAgICAgY2FzZSAweDA4OlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MDk6XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGlmKGV2ZW50LnZlbG9jaXR5ID09PSAwKXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPZmYnO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVPbic7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnbm90ZU9uJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBhOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ25vdGVBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYjpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb250cm9sbGVyJztcbiAgICAgICAgZXZlbnQuY29udHJvbGxlclR5cGUgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYzpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwcm9ncmFtQ2hhbmdlJztcbiAgICAgICAgZXZlbnQucHJvZ3JhbU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBkOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ2NoYW5uZWxBZnRlcnRvdWNoJztcbiAgICAgICAgZXZlbnQuYW1vdW50ID0gcGFyYW0xO1xuICAgICAgICAvL2lmKHRyYWNrTmFtZSA9PT0gJ1NILVMxLTQ0LUMwOSBMPVNNTCBJTj0zJyl7XG4gICAgICAgIC8vICAgIGNvbnNvbGUubG9nKCdjaGFubmVsIHByZXNzdXJlJywgdHJhY2tOYW1lLCBwYXJhbTEpO1xuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDBlOlxuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3BpdGNoQmVuZCc7XG4gICAgICAgIGV2ZW50LnZhbHVlID0gcGFyYW0xICsgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDcpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICAvKlxuICAgICAgICB0aHJvdyAnVW5yZWNvZ25pc2VkIE1JREkgZXZlbnQgdHlwZTogJyArIGV2ZW50VHlwZTtcbiAgICAgICAgY29uc29sZS5sb2coJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGUpO1xuICAgICAgICAqL1xuXG4gICAgICAgIGV2ZW50LnZhbHVlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndW5rbm93bic7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuLypcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICBjb25zb2xlLmxvZygnd2VpcmRvJywgdHJhY2tOYW1lLCBwYXJhbTEsIGV2ZW50LnZlbG9jaXR5KTtcbiovXG5cbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGlmKGJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPT09IGZhbHNlICYmIGJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSBmYWxzZSl7XG4gICAgY29uc29sZS5lcnJvcignYnVmZmVyIHNob3VsZCBiZSBhbiBpbnN0YW5jZSBvZiBVaW50OEFycmF5IG9mIEFycmF5QnVmZmVyJylcbiAgICByZXR1cm5cbiAgfVxuICBpZihidWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcil7XG4gICAgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyKVxuICB9XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBuZXcgTUlESVN0cmVhbShidWZmZXIpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBuZXcgTUlESVN0cmVhbShoZWFkZXJDaHVuay5kYXRhKTtcbiAgbGV0IGZvcm1hdFR5cGUgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0cmFja0NvdW50ID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuICBsZXQgdGltZURpdmlzaW9uID0gaGVhZGVyU3RyZWFtLnJlYWRJbnQxNigpO1xuXG4gIGlmKHRpbWVEaXZpc2lvbiAmIDB4ODAwMCl7XG4gICAgdGhyb3cgJ0V4cHJlc3NpbmcgdGltZSBkaXZpc2lvbiBpbiBTTVRQRSBmcmFtZXMgaXMgbm90IHN1cHBvcnRlZCB5ZXQnO1xuICB9XG5cbiAgbGV0IGhlYWRlciA9e1xuICAgICdmb3JtYXRUeXBlJzogZm9ybWF0VHlwZSxcbiAgICAndHJhY2tDb3VudCc6IHRyYWNrQ291bnQsXG4gICAgJ3RpY2tzUGVyQmVhdCc6IHRpbWVEaXZpc2lvblxuICB9O1xuXG4gIGZvcihsZXQgaSA9IDA7IGkgPCB0cmFja0NvdW50OyBpKyspe1xuICAgIHRyYWNrTmFtZSA9ICd0cmFja18nICsgaTtcbiAgICBsZXQgdHJhY2sgPSBbXTtcbiAgICBsZXQgdHJhY2tDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICAgIGlmKHRyYWNrQ2h1bmsuaWQgIT09ICdNVHJrJyl7XG4gICAgICB0aHJvdyAnVW5leHBlY3RlZCBjaHVuayAtIGV4cGVjdGVkIE1UcmssIGdvdCAnKyB0cmFja0NodW5rLmlkO1xuICAgIH1cbiAgICBsZXQgdHJhY2tTdHJlYW0gPSBuZXcgTUlESVN0cmVhbSh0cmFja0NodW5rLmRhdGEpO1xuICAgIHdoaWxlKCF0cmFja1N0cmVhbS5lb2YoKSl7XG4gICAgICBsZXQgZXZlbnQgPSByZWFkRXZlbnQodHJhY2tTdHJlYW0pO1xuICAgICAgdHJhY2sucHVzaChldmVudCk7XG4gICAgfVxuICAgIHRyYWNrcy5zZXQodHJhY2tOYW1lLCB0cmFjayk7XG4gIH1cblxuICByZXR1cm57XG4gICAgJ2hlYWRlcic6IGhlYWRlcixcbiAgICAndHJhY2tzJzogdHJhY2tzXG4gIH07XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2dldE5pY2VUaW1lfSBmcm9tICcuL3V0aWwnO1xuXG52YXJcbiAgcHBxLFxuICBicG0sXG4gIGZhY3RvcixcbiAgbm9taW5hdG9yLFxuICBkZW5vbWluYXRvcixcbiAgcGxheWJhY2tTcGVlZCxcblxuICBiYXIsXG4gIGJlYXQsXG4gIHNpeHRlZW50aCxcbiAgdGljayxcbiAgdGlja3MsXG4gIG1pbGxpcyxcblxuICBtaWxsaXNQZXJUaWNrLFxuICBzZWNvbmRzUGVyVGljayxcblxuICB0aWNrc1BlckJlYXQsXG4gIHRpY2tzUGVyQmFyLFxuICB0aWNrc1BlclNpeHRlZW50aCxcbiAgbnVtU2l4dGVlbnRoLFxuXG4gIGRpZmZUaWNrcyxcbiAgcHJldmlvdXNFdmVudDtcblxuXG5mdW5jdGlvbiBzZXRUaWNrRHVyYXRpb24oKXtcbiAgc2Vjb25kc1BlclRpY2sgPSAoMSAvIHBsYXliYWNrU3BlZWQgKiA2MCkgLyBicG0gLyBwcHE7XG4gIC8vc2Vjb25kc1BlclRpY2sgPSBicG0gLyA2MCAvIHBwcTtcbiAgbWlsbGlzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrICogMTAwMDtcbiAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLCBicG0sIHBwcSwgcGxheWJhY2tTcGVlZCwgKHBwcSAqIG1pbGxpc1BlclRpY2spKTtcbiAgLy9jb25zb2xlLmxvZyhwcHEpO1xufVxuXG5cbmZ1bmN0aW9uIHNldFRpY2tzUGVyQmVhdCgpe1xuICBmYWN0b3IgPSAoNCAvIGRlbm9taW5hdG9yKTtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEgLyA0O1xuICAvL2NvbnNvbGUubG9nKGRlbm9taW5hdG9yLCBmYWN0b3IsIG51bVNpeHRlZW50aCwgdGlja3NQZXJCZWF0LCB0aWNrc1BlckJhciwgdGlja3NQZXJTaXh0ZWVudGgpO1xufVxuXG5cbmZ1bmN0aW9uIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KXtcbiAgZGlmZlRpY2tzID0gZXZlbnQudGlja3MgLSB0aWNrcztcbiAgaWYoZGlmZlRpY2tzIDwgMCl7XG4gICAgY29uc29sZS5sb2coZGlmZlRpY2tzLCBldmVudC50aWNrcywgcHJldmlvdXNFdmVudC50aWNrcywgcHJldmlvdXNFdmVudC50eXBlKVxuICB9XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICBwcmV2aW91c0V2ZW50ID0gZXZlbnRcbiAgLy9jb25zb2xlLmxvZyhkaWZmVGlja3MsIG1pbGxpc1BlclRpY2spO1xuICBtaWxsaXMgKz0gZGlmZlRpY2tzICogbWlsbGlzUGVyVGljaztcblxuICB3aGlsZSh0aWNrID49IHRpY2tzUGVyU2l4dGVlbnRoKXtcbiAgICBzaXh0ZWVudGgrKztcbiAgICB0aWNrIC09IHRpY2tzUGVyU2l4dGVlbnRoO1xuICAgIHdoaWxlKHNpeHRlZW50aCA+IG51bVNpeHRlZW50aCl7XG4gICAgICBzaXh0ZWVudGggLT0gbnVtU2l4dGVlbnRoO1xuICAgICAgYmVhdCsrO1xuICAgICAgd2hpbGUoYmVhdCA+IG5vbWluYXRvcil7XG4gICAgICAgIGJlYXQgLT0gbm9taW5hdG9yO1xuICAgICAgICBiYXIrKztcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUaW1lRXZlbnRzKHNldHRpbmdzLCB0aW1lRXZlbnRzKXtcbiAgLy9jb25zb2xlLnRpbWUoJ3BhcnNlIHRpbWUgZXZlbnRzICcgKyBzb25nLm5hbWUpO1xuICBsZXQgdHlwZTtcbiAgbGV0IGV2ZW50O1xuXG4gIHBwcSA9IHNldHRpbmdzLnBwcTtcbiAgYnBtID0gc2V0dGluZ3MuYnBtO1xuICBub21pbmF0b3IgPSBzZXR0aW5ncy5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gc2V0dGluZ3MuZGVub21pbmF0b3I7XG4gIHBsYXliYWNrU3BlZWQgPSBzZXR0aW5ncy5wbGF5YmFja1NwZWVkO1xuICBiYXIgPSAxO1xuICBiZWF0ID0gMTtcbiAgc2l4dGVlbnRoID0gMTtcbiAgdGljayA9IDA7XG4gIHRpY2tzID0gMDtcbiAgbWlsbGlzID0gMDtcblxuICBzZXRUaWNrRHVyYXRpb24oKTtcbiAgc2V0VGlja3NQZXJCZWF0KCk7XG5cbiAgdGltZUV2ZW50cy5zb3J0KChhLCBiKSA9PiAoYS50aWNrcyA8PSBiLnRpY2tzKSA/IC0xIDogMSk7XG4gIGxldCBlID0gMDtcbiAgZm9yKGV2ZW50IG9mIHRpbWVFdmVudHMpe1xuICAgIC8vY29uc29sZS5sb2coZSsrLCBldmVudC50aWNrcywgZXZlbnQudHlwZSlcbiAgICAvL2V2ZW50LnNvbmcgPSBzb25nO1xuICAgIHR5cGUgPSBldmVudC50eXBlO1xuICAgIHVwZGF0ZVBvc2l0aW9uKGV2ZW50KTtcblxuICAgIHN3aXRjaCh0eXBlKXtcblxuICAgICAgY2FzZSAweDUxOlxuICAgICAgICBicG0gPSBldmVudC5kYXRhMTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudClcbiAgICAgICAgc2V0VGlja0R1cmF0aW9uKCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50LmRhdGExO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRhdGEyO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgLy9zb25nLmxhc3RFdmVudFRtcCA9IGV2ZW50O1xuICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgLy9jb25zb2xlLmxvZyh0aW1lRXZlbnRzKTtcbn1cblxuXG4vL2V4cG9ydCBmdW5jdGlvbiBwYXJzZUV2ZW50cyhzb25nLCBldmVudHMpe1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKGV2ZW50cyl7XG4gIGNvbnNvbGUubG9nKCdwYXJzZUV2ZW50cycpXG4gIGxldCBldmVudDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG4gIGxldCByZXN1bHQgPSBbXVxuXG4gIHRpY2tzID0gMFxuXG4gIC8vbGV0IGV2ZW50cyA9IFtdLmNvbmNhdChldnRzLCBzb25nLl90aW1lRXZlbnRzKTtcbiAgbGV0IG51bUV2ZW50cyA9IGV2ZW50cy5sZW5ndGg7XG4gIC8vY29uc29sZS5sb2coZXZlbnRzKVxuICBldmVudHMuc29ydChmdW5jdGlvbihhLCBiKXtcbiAgICAvL3JldHVybiBhLnNvcnRJbmRleCAtIGIuc29ydEluZGV4O1xuICAgIGlmKGEudGlja3MgPT09IGIudGlja3Mpe1xuICAgICAgaWYoYS50eXBlID09PSAxMjgpe1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1lbHNlIGlmKGIudHlwZSA9PT0gMTI4KXtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGEudGlja3MgLSBiLnRpY2tzO1xuICB9KTtcbiAgZXZlbnQgPSBldmVudHNbMF07XG4gIC8vY29uc29sZS5sb2coZXZlbnQpXG5cbiAgYnBtID0gZXZlbnQuYnBtO1xuICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcblxuICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuXG4gIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICBiYXIgPSBldmVudC5iYXI7XG4gIGJlYXQgPSBldmVudC5iZWF0O1xuICBzaXh0ZWVudGggPSBldmVudC5zaXh0ZWVudGg7XG4gIHRpY2sgPSBldmVudC50aWNrO1xuXG5cbiAgZm9yKGxldCBpID0gc3RhcnRFdmVudDsgaSA8IG51bUV2ZW50czsgaSsrKXtcblxuICAgIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgc3dpdGNoKGV2ZW50LnR5cGUpe1xuXG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIGJwbSA9IGV2ZW50LmRhdGExO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuXG4gICAgICAgIHRpY2tzID0gZXZlbnQudGlja3NcbiAgICAgICAgLy9jb25zb2xlLmxvZyhtaWxsaXNQZXJUaWNrLGV2ZW50Lm1pbGxpc1BlclRpY2spO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgZmFjdG9yID0gZXZlbnQuZmFjdG9yO1xuICAgICAgICBub21pbmF0b3IgPSBldmVudC5kYXRhMTtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kYXRhMjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcblxuICAgICAgICB0aWNrcyA9IGV2ZW50LnRpY2tzXG4gICAgICAgIC8vY29uc29sZS5sb2cobm9taW5hdG9yLG51bVNpeHRlZW50aCx0aWNrc1BlclNpeHRlZW50aCk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuXG5cbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAvL2Nhc2UgMTI4OlxuICAgICAgLy9jYXNlIDE0NDpcbiAgICAgICAgdXBkYXRlUG9zaXRpb24oZXZlbnQpO1xuICAgICAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgICAgIHJlc3VsdC5wdXNoKGV2ZW50KVxuICAgIH1cblxuXG4gICAgLy8gaWYoaSA8IDEwMCAmJiAoZXZlbnQudHlwZSA9PT0gODEgfHwgZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCkpe1xuICAgIC8vICAgLy9jb25zb2xlLmxvZyhpLCB0aWNrcywgZGlmZlRpY2tzLCBtaWxsaXMsIG1pbGxpc1BlclRpY2spXG4gICAgLy8gICBjb25zb2xlLmxvZyhldmVudC50eXBlLCBldmVudC5taWxsaXMsICdub3RlJywgZXZlbnQuZGF0YTEsICd2ZWxvJywgZXZlbnQuZGF0YTIpXG4gICAgLy8gfVxuXG4gICAgbGFzdEV2ZW50VGljayA9IGV2ZW50LnRpY2tzO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG4gIC8vc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVFdmVudChldmVudCl7XG4gIC8vY29uc29sZS5sb2coYmFyLCBiZWF0LCB0aWNrcylcbiAgLy9jb25zb2xlLmxvZyhldmVudCwgYnBtLCBtaWxsaXNQZXJUaWNrLCB0aWNrcywgbWlsbGlzKTtcblxuICBldmVudC5icG0gPSBicG07XG4gIGV2ZW50Lm5vbWluYXRvciA9IG5vbWluYXRvcjtcbiAgZXZlbnQuZGVub21pbmF0b3IgPSBkZW5vbWluYXRvcjtcblxuICBldmVudC50aWNrc1BlckJhciA9IHRpY2tzUGVyQmFyO1xuICBldmVudC50aWNrc1BlckJlYXQgPSB0aWNrc1BlckJlYXQ7XG4gIGV2ZW50LnRpY2tzUGVyU2l4dGVlbnRoID0gdGlja3NQZXJTaXh0ZWVudGg7XG5cbiAgZXZlbnQuZmFjdG9yID0gZmFjdG9yO1xuICBldmVudC5udW1TaXh0ZWVudGggPSBudW1TaXh0ZWVudGg7XG4gIGV2ZW50LnNlY29uZHNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2s7XG4gIGV2ZW50Lm1pbGxpc1BlclRpY2sgPSBtaWxsaXNQZXJUaWNrO1xuXG5cbiAgZXZlbnQudGlja3MgPSB0aWNrcztcblxuICBldmVudC5taWxsaXMgPSBtaWxsaXM7XG4gIGV2ZW50LnNlY29uZHMgPSBtaWxsaXMgLyAxMDAwO1xuXG5cbiAgZXZlbnQuYmFyID0gYmFyO1xuICBldmVudC5iZWF0ID0gYmVhdDtcbiAgZXZlbnQuc2l4dGVlbnRoID0gc2l4dGVlbnRoO1xuICBldmVudC50aWNrID0gdGljaztcbiAgLy9ldmVudC5iYXJzQXNTdHJpbmcgPSAoYmFyICsgMSkgKyAnOicgKyAoYmVhdCArIDEpICsgJzonICsgKHNpeHRlZW50aCArIDEpICsgJzonICsgdGljaztcbiAgdmFyIHRpY2tBc1N0cmluZyA9IHRpY2sgPT09IDAgPyAnMDAwJyA6IHRpY2sgPCAxMCA/ICcwMCcgKyB0aWNrIDogdGljayA8IDEwMCA/ICcwJyArIHRpY2sgOiB0aWNrO1xuICBldmVudC5iYXJzQXNTdHJpbmcgPSBiYXIgKyAnOicgKyBiZWF0ICsgJzonICsgc2l4dGVlbnRoICsgJzonICsgdGlja0FzU3RyaW5nO1xuICBldmVudC5iYXJzQXNBcnJheSA9IFtiYXIsIGJlYXQsIHNpeHRlZW50aCwgdGlja107XG5cblxuICB2YXIgdGltZURhdGEgPSBnZXROaWNlVGltZShtaWxsaXMpO1xuXG4gIGV2ZW50LmhvdXIgPSB0aW1lRGF0YS5ob3VyO1xuICBldmVudC5taW51dGUgPSB0aW1lRGF0YS5taW51dGU7XG4gIGV2ZW50LnNlY29uZCA9IHRpbWVEYXRhLnNlY29uZDtcbiAgZXZlbnQubWlsbGlzZWNvbmQgPSB0aW1lRGF0YS5taWxsaXNlY29uZDtcbiAgZXZlbnQudGltZUFzU3RyaW5nID0gdGltZURhdGEudGltZUFzU3RyaW5nO1xuICBldmVudC50aW1lQXNBcnJheSA9IHRpbWVEYXRhLnRpbWVBc0FycmF5O1xuXG4gIC8vIGlmKG1pbGxpcyA8IDApe1xuICAvLyAgIGNvbnNvbGUubG9nKGV2ZW50KVxuICAvLyB9XG59XG5cblxubGV0IG1pZGlOb3RlSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1JRElOb3RlcyhldmVudHMpe1xuICBsZXQgbm90ZXMgPSB7fVxuICBsZXQgbiA9IDBcbiAgZm9yKGxldCBldmVudCBvZiBldmVudHMpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICBpZighbm90ZXNbZXZlbnQudHJhY2tJZF0pe1xuICAgICAgICBub3Rlc1tldmVudC50cmFja0lkXSA9IHt9XG4gICAgICB9XG4gICAgICBub3Rlc1tldmVudC50cmFja0lkXVtldmVudC5kYXRhMV0gPSBldmVudFxuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyBsZXQgbm90ZXNJblRyYWNrID0gbm90ZXNbZXZlbnQudHJhY2tJZF1cbiAgICAgIC8vIGlmKHR5cGVvZiBub3Rlc0luVHJhY2sgPT09ICd1bmRlZmluZWQnKXtcbiAgICAgIC8vICAgY29uc29sZS5pbmZvKCdubyBub3RlIG9uIGZvdW5kIGV2ZW50IGZvciAnLCBldmVudClcbiAgICAgIC8vICAgZGVsZXRlIG5vdGVzSW5UcmFja1tldmVudC5kYXRhMV1cbiAgICAgIC8vICAgY29udGludWVcbiAgICAgIC8vIH1cbiAgICAgIGxldCBub3RlT24gPSBub3Rlc1tldmVudC50cmFja0lkXVtldmVudC5kYXRhMV1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQubm90ZU51bWJlciwgbm90ZU9uKTtcbiAgICAgIGxldCBub3RlT2ZmID0gZXZlbnRcbiAgICAgIGlmKHR5cGVvZiBub3RlT24gPT09ICd1bmRlZmluZWQnKXtcbiAgICAgICAgY29uc29sZS5pbmZvKG4rKywgJ25vIG5vdGUgb24gZXZlbnQnLCBldmVudClcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50LnRyYWNrSWRdW2V2ZW50LmRhdGExXVxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuICAgICAgLy9sZXQgbWlkaU5vdGUgPSBuZXcgTUlESU5vdGUobm90ZU9uLCBub3RlT2ZmKTtcbiAgICAgIC8vdGhpcy5fbm90ZXNNYXAuc2V0KG1pZGlOb3RlLmlkLCBtaWRpTm90ZSk7XG4gICAgICBsZXQgaWQgPSBgTU5fJHttaWRpTm90ZUluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICAgICAgbm90ZU9uLm1pZGlOb3RlSWQgPSBpZFxuICAgICAgbm90ZU9uLm9mZiA9IG5vdGVPZmZcbiAgICAgIG5vdGVPZmYubWlkaU5vdGVJZCA9IGlkXG4gICAgICBub3RlT2ZmLm9uID0gbm90ZU9uXG4gICAgICBkZWxldGUgbm90ZXNbZXZlbnQudHJhY2tJZF1bZXZlbnQuZGF0YTFdXG4gICAgfVxuICB9XG4gIGNvbnNvbGUubG9nKG5vdGVzKVxufVxuIiwiaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge1xuICBDUkVBVEVfUEFSVCxcbiAgQUREX01JRElfRVZFTlRTLFxufSBmcm9tICcuL2FjdGlvbl90eXBlcydcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgcGFydEluZGV4ID0gMFxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlUGFydChcbiAgc2V0dGluZ3M6IHtcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgdHJhY2tJZDogc3RyaW5nLFxuICAgIG1pZGlFdmVudElkczpBcnJheTxzdHJpbmc+LFxuICAgIG1pZGlOb3RlSWRzOkFycmF5PHN0cmluZz4sXG4gIH0gPSB7fVxuKXtcbiAgbGV0IGlkID0gYE1QXyR7cGFydEluZGV4Kyt9XyR7bmV3IERhdGUoKS5nZXRUaW1lKCl9YFxuICBsZXQge1xuICAgIG5hbWUgPSBpZCxcbiAgICBtaWRpRXZlbnRJZHMgPSBbXSxcbiAgICBtaWRpTm90ZUlkcyA9IFtdLFxuICAgIHRyYWNrSWQgPSAnbm9uZSdcbiAgfSA9IHNldHRpbmdzXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9QQVJULFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgbmFtZSxcbiAgICAgIG1pZGlFdmVudElkcyxcbiAgICAgIG1pZGlOb3RlSWRzLFxuICAgICAgdHJhY2tJZCxcbiAgICAgIG11dGU6IGZhbHNlXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMocGFydF9pZDogc3RyaW5nLCAuLi5taWRpX2V2ZW50X2lkcyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfTUlESV9FVkVOVFMsXG4gICAgcGF5bG9hZDoge1xuICAgICAgcGFydF9pZCxcbiAgICAgIG1pZGlfZXZlbnRfaWRzXG4gICAgfVxuICB9KVxufVxuIiwiaW1wb3J0IHtcbiAgY3JlYXRlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50LFxuICBtb3ZlTUlESUV2ZW50VG8sXG59IGZyb20gJy4vbWlkaV9ldmVudCdcblxuaW1wb3J0e1xuICBjcmVhdGVNSURJTm90ZSxcbn0gZnJvbSAnLi9taWRpX25vdGUnXG5cbmltcG9ydHtcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxufSBmcm9tICcuL3NvbmcnXG5cbmltcG9ydHtcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxufSBmcm9tICcuL3RyYWNrJ1xuXG5pbXBvcnR7XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG59IGZyb20gJy4vcGFydCdcblxuaW1wb3J0IHtcbiAgcGFyc2VNSURJRmlsZVxufSBmcm9tICcuL21pZGlmaWxlJ1xuXG5pbXBvcnQge1xuICBzb25nRnJvbU1JRElGaWxlXG59IGZyb20gJy4vc29uZ19mcm9tX21pZGlmaWxlJ1xuXG5jb25zdCBxYW1iaSA9IHtcbiAgdmVyc2lvbjogJzAuMC4xJyxcblxuICAvLyBmcm9tIC4vbWlkaV9ldmVudFxuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcblxuICAvLyBmcm9tIC4vbWlkaV9ub3RlXG4gIGNyZWF0ZU1JRElOb3RlLFxuXG4gIC8vIGZyb20gLi9zb25nXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgdXBkYXRlU29uZyxcbiAgc3RhcnRTb25nLFxuICBzdG9wU29uZyxcblxuICAvLyBmcm9tIC4vdHJhY2tcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuXG4gIC8vIGZyb20gLi9wYXJ0XG4gIGNyZWF0ZVBhcnQsXG4gIGFkZE1JRElFdmVudHMsXG5cbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcblxuICBsb2c6IGZ1bmN0aW9uKGlkKXtcbiAgICBpZihpZCA9PT0gJ2Z1bmN0aW9ucycpe1xuICAgICAgY29uc29sZS5sb2coYGZ1bmN0aW9uczpcbiAgICAgICAgY3JlYXRlTUlESUV2ZW50XG4gICAgICAgIG1vdmVNSURJRXZlbnRcbiAgICAgICAgbW92ZU1JRElFdmVudFRvXG4gICAgICAgIGNyZWF0ZU1JRElOb3RlXG4gICAgICAgIGNyZWF0ZVNvbmdcbiAgICAgICAgYWRkVHJhY2tzXG4gICAgICAgIGNyZWF0ZVRyYWNrXG4gICAgICAgIGFkZFBhcnRzXG4gICAgICAgIGNyZWF0ZVBhcnRcbiAgICAgICAgYWRkTUlESUV2ZW50c1xuICAgICAgYClcbiAgICB9XG4gIH1cbn1cblxuLy8gc3RhbmRhcmQgTUlESSBldmVudHNcbi8vY29uc3QgTUlESSA9IHt9XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdOT1RFX09GRicsIHt2YWx1ZTogMHg4MH0pOyAvLzEyOFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnTk9URV9PTicsIHt2YWx1ZTogMHg5MH0pOyAvLzE0NFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVFJPTF9DSEFOR0UnLCB7dmFsdWU6IDB4QjB9KTsgLy8xNzZcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1BST0dSQU1fQ0hBTkdFJywge3ZhbHVlOiAweEMwfSk7IC8vMTkyXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdQSVRDSF9CRU5EJywge3ZhbHVlOiAweEUwfSk7IC8vMjI0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fRVhDTFVTSVZFJywge3ZhbHVlOiAweEYwfSk7IC8vMjQwXG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1NPTkdfUE9TSVRJT04nLCB7dmFsdWU6IDI0Mn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU09OR19TRUxFQ1QnLCB7dmFsdWU6IDI0M30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ0VPWCcsIHt2YWx1ZTogMjQ3fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1JTkdfQ0xPQ0snLCB7dmFsdWU6IDI0OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnQ09OVElOVUUnLCB7dmFsdWU6IDI1MX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnU1RPUCcsIHt2YWx1ZTogMjUyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdTWVNURU1fUkVTRVQnLCB7dmFsdWU6IDI1NX0pO1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShxYW1iaSwgJ1RFTVBPJywge3ZhbHVlOiAweDUxfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkocWFtYmksICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHFhbWJpLCAnRU5EX09GX1RSQUNLJywge3ZhbHVlOiAweDJGfSk7XG5cbmV4cG9ydCBkZWZhdWx0IHFhbWJpXG5cbmV4cG9ydCB7XG4gIC8vIGZyb20gLi9taWRpX2V2ZW50XG4gIGNyZWF0ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudCxcbiAgbW92ZU1JRElFdmVudFRvLFxuXG4gIC8vIGZyb20gLi9taWRpX25vdGVcbiAgY3JlYXRlTUlESU5vdGUsXG5cbiAgLy8gZnJvbSAuL3NvbmdcbiAgY3JlYXRlU29uZyxcbiAgYWRkVHJhY2tzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxuXG4gIC8vIGZyb20gLi90cmFja1xuICBjcmVhdGVUcmFjayxcbiAgYWRkUGFydHMsXG5cbiAgLy8gZnJvbSAuL3BhcnRcbiAgY3JlYXRlUGFydCxcbiAgYWRkTUlESUV2ZW50cyxcblxuLy8gIE1JREksXG5cbiAgcGFyc2VNSURJRmlsZSxcbiAgc29uZ0Zyb21NSURJRmlsZSxcbn1cbiIsImltcG9ydCB7Y29tYmluZVJlZHVjZXJzfSBmcm9tICdyZWR1eCdcbmltcG9ydCB7XG4gIC8vIGZvciBlZGl0b3JcbiAgQ1JFQVRFX1NPTkcsXG4gIENSRUFURV9UUkFDSyxcbiAgQ1JFQVRFX1BBUlQsXG4gIEFERF9QQVJUUyxcbiAgQUREX1RSQUNLUyxcbiAgQUREX01JRElfTk9URVMsXG4gIEFERF9NSURJX0VWRU5UUyxcbiAgQUREX1RJTUVfRVZFTlRTLFxuICBDUkVBVEVfTUlESV9FVkVOVCxcbiAgQ1JFQVRFX01JRElfTk9URSxcbiAgQUREX0VWRU5UU19UT19TT05HLFxuICBVUERBVEVfTUlESV9FVkVOVCxcbiAgVVBEQVRFX01JRElfTk9URSxcbiAgVVBEQVRFX1NPTkcsXG5cbiAgLy8gZm9yIHNlcXVlbmNlciBvbmx5XG4gIFNPTkdfUE9TSVRJT04sXG4gIFNUQVJUX1NDSEVEVUxFUixcbiAgU1RPUF9TQ0hFRFVMRVIsXG5cbiAgLy8gZm9yIGluc3RydW1lbnQgb25seVxuICBDUkVBVEVfSU5TVFJVTUVOVCxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IGluaXRpYWxTdGF0ZSA9IHtcbiAgc29uZ3M6IHt9LFxuICB0cmFja3M6IHt9LFxuICBwYXJ0czoge30sXG4gIG1pZGlFdmVudHM6IHt9LFxuICBtaWRpTm90ZXM6IHt9LFxufVxuXG5cbmZ1bmN0aW9uIGVkaXRvcihzdGF0ZSA9IGluaXRpYWxTdGF0ZSwgYWN0aW9uKXtcblxuICBsZXRcbiAgICBldmVudCwgZXZlbnRJZCxcbiAgICBzb25nLCBzb25nSWQsXG4gICAgbWlkaUV2ZW50c1xuXG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG5cbiAgICBjYXNlIENSRUFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfVFJBQ0s6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnRyYWNrc1thY3Rpb24ucGF5bG9hZC5pZF0gPSBhY3Rpb24ucGF5bG9hZFxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBDUkVBVEVfUEFSVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUucGFydHNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX01JRElfRVZFTlQ6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLm1pZGlFdmVudHNbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWRcbiAgICAgIGJyZWFrXG5cblxuICAgIGNhc2UgQ1JFQVRFX01JRElfTk9URTpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGUubWlkaU5vdGVzW2FjdGlvbi5wYXlsb2FkLmlkXSA9IGFjdGlvbi5wYXlsb2FkXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9UUkFDS1M6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHNvbmdJZCA9IGFjdGlvbi5wYXlsb2FkLnNvbmdfaWRcbiAgICAgIHNvbmcgPSBzdGF0ZS5zb25nc1tzb25nSWRdXG4gICAgICBpZihzb25nKXtcbiAgICAgICAgbGV0IHRyYWNrSWRzID0gYWN0aW9uLnBheWxvYWQudHJhY2tfaWRzXG4gICAgICAgIHRyYWNrSWRzLmZvckVhY2goZnVuY3Rpb24odHJhY2tJZCl7XG4gICAgICAgICAgbGV0IHRyYWNrID0gc3RhdGUudHJhY2tzW3RyYWNrSWRdXG4gICAgICAgICAgaWYodHJhY2spe1xuICAgICAgICAgICAgc29uZy50cmFja0lkcy5wdXNoKHRyYWNrSWQpXG4gICAgICAgICAgICB0cmFjay5zb25nSWQgPSBzb25nSWRcbiAgICAgICAgICAgIGxldCBtaWRpRXZlbnRJZHMgPSBbXVxuICAgICAgICAgICAgdHJhY2sucGFydElkcy5mb3JFYWNoKGZ1bmN0aW9uKHBhcnRJZCl7XG4gICAgICAgICAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbcGFydElkXVxuICAgICAgICAgICAgICBzb25nLnBhcnRJZHMucHVzaChwYXJ0SWQpXG4gICAgICAgICAgICAgIG1pZGlFdmVudElkcy5wdXNoKC4uLnBhcnQubWlkaUV2ZW50SWRzKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHNvbmcubWlkaUV2ZW50SWRzLnB1c2goLi4ubWlkaUV2ZW50SWRzKVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyB0cmFjayB3aXRoIGlkICR7dHJhY2tJZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHNvbmcgZm91bmQgd2l0aCBpZCAke3NvbmdJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBBRERfUEFSVFM6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIGxldCB0cmFja0lkID0gYWN0aW9uLnBheWxvYWQudHJhY2tfaWRcbiAgICAgIGxldCB0cmFjayA9IHN0YXRlLnRyYWNrc1t0cmFja0lkXVxuICAgICAgaWYodHJhY2spe1xuICAgICAgICAvL3RyYWNrLnBhcnRzLnB1c2goLi4uYWN0aW9uLnBheWxvYWQucGFydF9pZHMpXG4gICAgICAgIGxldCBwYXJ0SWRzID0gYWN0aW9uLnBheWxvYWQucGFydF9pZHNcbiAgICAgICAgcGFydElkcy5mb3JFYWNoKGZ1bmN0aW9uKGlkKXtcbiAgICAgICAgICBsZXQgcGFydCA9IHN0YXRlLnBhcnRzW2lkXVxuICAgICAgICAgIGlmKHBhcnQpe1xuICAgICAgICAgICAgdHJhY2sucGFydElkcy5wdXNoKGlkKVxuICAgICAgICAgICAgcGFydC50cmFja0lkID0gdHJhY2tJZFxuICAgICAgICAgICAgcGFydC5taWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCl7XG4gICAgICAgICAgICAgIGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tpZF1cbiAgICAgICAgICAgICAgZXZlbnQudHJhY2tJZCA9IHRyYWNrSWRcbiAgICAgICAgICAgICAgZXZlbnQuaW5zdHJ1bWVudElkID0gdHJhY2suaW5zdHJ1bWVudElkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgY29uc29sZS53YXJuKGBubyBwYXJ0IHdpdGggaWQgJHtpZH1gKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1lbHNle1xuICAgICAgICBjb25zb2xlLndhcm4oYG5vIHRyYWNrIGZvdW5kIHdpdGggaWQgJHt0cmFja0lkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIEFERF9NSURJX0VWRU5UUzpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgbGV0IHBhcnRJZCA9IGFjdGlvbi5wYXlsb2FkLnBhcnRfaWRcbiAgICAgIGxldCBwYXJ0ID0gc3RhdGUucGFydHNbcGFydElkXVxuICAgICAgaWYocGFydCl7XG4gICAgICAgIC8vcGFydC5taWRpRXZlbnRzLnB1c2goLi4uYWN0aW9uLnBheWxvYWQubWlkaV9ldmVudF9pZHMpXG4gICAgICAgIGxldCBtaWRpRXZlbnRJZHMgPSBhY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50X2lkc1xuICAgICAgICBtaWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihpZCl7XG4gICAgICAgICAgbGV0IG1pZGlFdmVudCA9IHN0YXRlLm1pZGlFdmVudHNbaWRdXG4gICAgICAgICAgaWYobWlkaUV2ZW50KXtcbiAgICAgICAgICAgIHBhcnQubWlkaUV2ZW50SWRzLnB1c2goaWQpXG4gICAgICAgICAgICBtaWRpRXZlbnQucGFydElkID0gcGFydElkXG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oYG5vIE1JREkgZXZlbnQgZm91bmQgd2l0aCBpZCAke2lkfWApXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gcGFydCBmb3VuZCB3aXRoIGlkICR7cGFydElkfWApXG4gICAgICB9XG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9NSURJX0VWRU5UOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBldmVudElkID0gYWN0aW9uLnBheWxvYWQuaWRcbiAgICAgIGV2ZW50ID0gc3RhdGUubWlkaUV2ZW50c1tldmVudElkXTtcbiAgICAgIGlmKGV2ZW50KXtcbiAgICAgICAgKHtcbiAgICAgICAgICB0aWNrczogZXZlbnQudGlja3MgPSBldmVudC50aWNrcyxcbiAgICAgICAgICBkYXRhMTogZXZlbnQuZGF0YTEgPSBldmVudC5kYXRhMSxcbiAgICAgICAgICBkYXRhMjogZXZlbnQuZGF0YTIgPSBldmVudC5kYXRhMixcbiAgICAgICAgfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUud2Fybihgbm8gTUlESSBldmVudCBmb3VuZCB3aXRoIGlkICR7ZXZlbnRJZH1gKVxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBVUERBVEVfTUlESV9OT1RFOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBsZXQgbm90ZSA9IHN0YXRlLm1pZGlOb3Rlc1thY3Rpb24ucGF5bG9hZC5pZF07XG4gICAgICAoe1xuICAgICAgICAvLyBpZiB0aGUgcGF5bG9hZCBoYXMgYSB2YWx1ZSBmb3IgJ3N0YXJ0JyBpdCB3aWxsIGJlIGFzc2lnbmVkIHRvIG5vdGUuc3RhcnQsIG90aGVyd2lzZSBub3RlLnN0YXJ0IHdpbGwga2VlcCBpdHMgY3VycmVudCB2YWx1ZVxuICAgICAgICBzdGFydDogbm90ZS5zdGFydCA9IG5vdGUuc3RhcnQsXG4gICAgICAgIGVuZDogbm90ZS5lbmQgPSBub3RlLmVuZCxcbiAgICAgICAgZHVyYXRpb25UaWNrczogbm90ZS5kdXJhdGlvblRpY2tzID0gbm90ZS5kdXJhdGlvblRpY2tzXG4gICAgICB9ID0gYWN0aW9uLnBheWxvYWQpXG4gICAgICBicmVha1xuXG5cbiAgICBjYXNlIFVQREFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9O1xuICAgICAgKHtzb25nX2lkOiBzb25nSWQsIG1pZGlfZXZlbnRzOiBtaWRpRXZlbnRzfSA9IGFjdGlvbi5wYXlsb2FkKVxuICAgICAgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdJZF1cbiAgICAgIHNvbmcubWlkaUV2ZW50SWRzID0gW11cbiAgICAgIG1pZGlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIC8vIHB1dCBtaWRpIGV2ZW50IGlkcyBpbiBjb3JyZWN0IG9yZGVyXG4gICAgICAgIHNvbmcubWlkaUV2ZW50SWRzLnB1c2goZXZlbnQuaWQpXG4gICAgICAgIC8vIHJlcGxhY2UgZXZlbnQgd2l0aCB1cGRhdGVkIGV2ZW50XG4gICAgICAgIHN0YXRlLm1pZGlFdmVudHNbZXZlbnQuaWRdID0gZXZlbnQ7XG4gICAgICB9KVxuICAgICAgYnJlYWtcblxuXG4gICAgZGVmYXVsdDpcbiAgICAgIC8vIGRvIG5vdGhpbmdcbiAgfVxuICByZXR1cm4gc3RhdGVcbn1cblxuLy8gc3RhdGUgd2hlbiBhIHNvbmcgaXMgcGxheWluZ1xuZnVuY3Rpb24gc2VxdWVuY2VyKHN0YXRlID0ge3NvbmdzOiB7fX0sIGFjdGlvbil7XG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG5cbiAgICBjYXNlIFVQREFURV9TT05HOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXSA9IHtcbiAgICAgICAgc29uZ0lkOiBhY3Rpb24ucGF5bG9hZC5zb25nX2lkLFxuICAgICAgICBtaWRpRXZlbnRzOiBhY3Rpb24ucGF5bG9hZC5taWRpX2V2ZW50cyxcbiAgICAgICAgc2V0dGluZ3M6IGFjdGlvbi5wYXlsb2FkLnNldHRpbmdzLFxuICAgICAgfVxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTVEFSVF9TQ0hFRFVMRVI6XG4gICAgICBzdGF0ZSA9IHsuLi5zdGF0ZX1cbiAgICAgIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnNjaGVkdWxlciA9IGFjdGlvbi5wYXlsb2FkLnNjaGVkdWxlclxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTVE9QX1NDSEVEVUxFUjpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgZGVsZXRlIHN0YXRlLnNvbmdzW2FjdGlvbi5wYXlsb2FkLnNvbmdfaWRdLnNjaGVkdWxlclxuICAgICAgYnJlYWtcblxuXG4gICAgY2FzZSBTT05HX1BPU0lUSU9OOlxuICAgICAgc3RhdGUgPSB7Li4uc3RhdGV9XG4gICAgICBzdGF0ZS5zb25nc1thY3Rpb24ucGF5bG9hZC5zb25nX2lkXS5wb3NpdGlvbiA9IGFjdGlvbi5wYXlsb2FkLnBvc2l0aW9uXG4gICAgICBicmVha1xuXG5cbiAgICBkZWZhdWx0OlxuICAgICAgLy8gZG8gbm90aGluZ1xuICB9XG4gIHJldHVybiBzdGF0ZTtcbn1cblxuXG5mdW5jdGlvbiBndWkoc3RhdGUgPSB7fSwgYWN0aW9uKXtcbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cbmZ1bmN0aW9uIGluc3RydW1lbnRzKHN0YXRlID0ge30sIGFjdGlvbil7XG4gIHN3aXRjaChhY3Rpb24udHlwZSl7XG4gICAgY2FzZSBDUkVBVEVfSU5TVFJVTUVOVDpcbiAgICAgIHN0YXRlID0gey4uLnN0YXRlfVxuICAgICAgc3RhdGVbYWN0aW9uLnBheWxvYWQuaWRdID0gYWN0aW9uLnBheWxvYWQuaW5zdHJ1bWVudFxuICAgICAgLy9zdGF0ZSA9IHsuLi5zdGF0ZSwgLi4ue1thY3Rpb24ucGF5bG9hZC5pZF06IGFjdGlvbi5wYXlsb2FkLmluc3RydW1lbnR9fVxuICAgICAgYnJlYWtcblxuICAgIGRlZmF1bHQ6XG4gIH1cbiAgcmV0dXJuIHN0YXRlO1xufVxuXG5cbmNvbnN0IHNlcXVlbmNlckFwcCA9IGNvbWJpbmVSZWR1Y2Vycyh7XG4gIGd1aSxcbiAgZWRpdG9yLFxuICBzZXF1ZW5jZXIsXG4gIGluc3RydW1lbnRzLFxufSlcblxuXG5leHBvcnQgZGVmYXVsdCBzZXF1ZW5jZXJBcHBcbiIsIlxuaW1wb3J0IHtjb250ZXh0fSBmcm9tICcuL2lvLmpzJztcblxuY2xhc3MgU2FtcGxle1xuXG4gIGNvbnN0cnVjdG9yKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgICBpZihzYW1wbGVEYXRhID09PSAtMSl7XG4gICAgICAvLyBjcmVhdGUgc2ltcGxlIHN5bnRoIHNhbXBsZVxuICAgICAgdGhpcy5zb3VyY2UgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKTtcbiAgICAgIHRoaXMuc291cmNlLnR5cGUgPSAnc2luZSc7XG4gICAgICB0aGlzLnNvdXJjZS5mcmVxdWVuY3kudmFsdWUgPSBldmVudC5mcmVxdWVuY3lcbiAgICB9ZWxzZXtcbiAgICAgIHRoaXMuc291cmNlID0gY29udGV4dC5jcmVhdGVCdWZmZXJTb3VyY2UoKVxuICAgICAgdGhpcy5zb3VyY2UuYnVmZmVyID0gc2FtcGxlRGF0YS5kO1xuICAgIH1cbiAgICB0aGlzLm91dHB1dCA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gICAgdGhpcy5vdXRwdXQuZ2Fpbi52YWx1ZSA9IGV2ZW50LmRhdGEyIC8gMTI3XG4gICAgdGhpcy5zb3VyY2UuY29ubmVjdCh0aGlzLm91dHB1dClcbiAgICAvL3RoaXMub3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbilcbiAgfVxuXG4gIHN0YXJ0KHRpbWUpe1xuICAgIC8vY29uc29sZS5sb2codGhpcy5zb3VyY2UpO1xuICAgIHRoaXMuc291cmNlLnN0YXJ0KHRpbWUpO1xuICB9XG5cbiAgc3RvcCh0aW1lLCBjYil7XG4gICAgdGhpcy5zb3VyY2Uuc3RvcCh0aW1lKTtcbiAgICB0aGlzLnNvdXJjZS5vbmVuZGVkID0gY2I7XG4gIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKC4uLmFyZ3Mpe1xuICByZXR1cm4gbmV3IFNhbXBsZSguLi5hcmdzKTtcbn1cbiIsIlxuY29uc3QgQlVGRkVSX1RJTUUgPSA0MDAgLy8gbWlsbGlzXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNjaGVkdWxlcntcblxuICBjb25zdHJ1Y3RvcihkYXRhKXtcbiAgICAoe1xuICAgICAgc29uZ19pZDogdGhpcy5zb25nSWQsXG4gICAgICBzdGFydF9wb3NpdGlvbjogdGhpcy5zb25nU3RhcnRQb3NpdGlvbixcbiAgICAgIHRpbWVTdGFtcDogdGhpcy50aW1lU3RhbXAsXG4gICAgICBtaWRpRXZlbnRzOiB0aGlzLmV2ZW50cyxcbiAgICAgIGluc3RydW1lbnRzOiB0aGlzLmluc3RydW1lbnRzLFxuICAgICAgdHJhY2tzOiB0aGlzLnRyYWNrcyxcbiAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgIGJhcnM6IHRoaXMuYmFycyxcbiAgICAgICAgbG9vcDogdGhpcy5sb29wXG4gICAgICB9XG4gICAgfSA9IGRhdGEpXG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGhcbiAgICB0aGlzLmluZGV4ID0gMFxuICAgIHRoaXMuc2V0SW5kZXgodGhpcy5zb25nU3RhcnRQb3NpdGlvbilcbiAgfVxuXG4gIC8vIGdldCB0aGUgaW5kZXggb2YgdGhlIGV2ZW50IHRoYXQgaGFzIGl0cyBtaWxsaXMgdmFsdWUgYXQgb3IgcmlnaHQgYWZ0ZXIgdGhlIHByb3ZpZGVkIG1pbGxpcyB2YWx1ZVxuICBzZXRJbmRleChtaWxsaXMpe1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuZXZlbnRzKXtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA+PSBtaWxsaXMpe1xuICAgICAgICB0aGlzLmluZGV4ID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICB9XG5cblxuICBnZXRFdmVudHMoKXtcbiAgICBsZXQgZXZlbnRzID0gW11cbiAgICAvLyBtYWluIGxvb3BcbiAgICBmb3IobGV0IGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBsZXQgZXZlbnQgPSB0aGlzLmV2ZW50c1tpXTtcbiAgICAgIGlmKGV2ZW50Lm1pbGxpcyA8IHRoaXMubWF4dGltZSl7XG5cbiAgICAgICAgLy9ldmVudC50aW1lID0gdGhpcy50aW1lU3RhbXAgKyBldmVudC5taWxsaXMgLSB0aGlzLnNvbmdTdGFydFBvc2l0aW9uO1xuXG4gICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpe1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfWVsc2UgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgLy8gY29udHJvbGxlciBldmVudHNcbiAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZXZlbnRzO1xuICB9XG5cblxuICB1cGRhdGUocG9zaXRpb24pe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICBldmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGluc3RydW1lbnRcblxuICAgIHRoaXMubWF4dGltZSA9IHBvc2l0aW9uICsgQlVGRkVSX1RJTUVcbiAgICBldmVudHMgPSB0aGlzLmdldEV2ZW50cygpXG4gICAgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aFxuXG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSBldmVudHNbaV1cbiAgICAgIC8vdHJhY2sgPSB0aGlzLnRyYWNrc1tldmVudC50cmFja0lkXVxuICAgICAgaW5zdHJ1bWVudCA9IHRoaXMuaW5zdHJ1bWVudHNbZXZlbnQuaW5zdHJ1bWVudElkXVxuXG4gICAgICBpZihldmVudC50eXBlID09PSAnYXVkaW8nKXtcbiAgICAgICAgLy8gdG8gYmUgaW1wbGVtZW50ZWRcbiAgICAgIH1lbHNlIGlmKGluc3RydW1lbnQudHlwZSA9PT0gJ2V4dGVybmFsJyl7XG4gICAgICAgIC8vIHRvIGJlIGltcGxlbWVudGVkOiByb3V0ZSB0byBleHRlcm5hbCBtaWRpIGluc3RydW1lbnRcbiAgICAgIH1lbHNle1xuICAgICAgICBsZXQgdGltZSA9ICh0aGlzLnRpbWVTdGFtcCArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0UG9zaXRpb24pXG4gICAgICAgIHRpbWUgLz0gMTAwMCAvLyBjb252ZXJ0IHRvIHNlY29uZHMgYmVjYXVzZSB0aGUgYXVkaW8gY29udGV4dCB1c2VzIHNlY29uZHMgZm9yIHNjaGVkdWxpbmdcbiAgICAgICAgaW5zdHJ1bWVudC5wcm9jZXNzTUlESUV2ZW50KGV2ZW50LCB0aW1lLCB0aGlzLnRyYWNrc1tldmVudC50cmFja0lkXS5vdXRwdXQpXG4gICAgICB9XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2codGhpcy5pbmRleCwgdGhpcy5udW1FdmVudHMpXG4gICAgLy9yZXR1cm4gdGhpcy5pbmRleCA+PSAxMFxuICAgIHJldHVybiB0aGlzLmluZGV4ID49IHRoaXMubnVtRXZlbnRzIC8vIGVuZCBvZiBzb25nXG4gIH1cblxuXG4gIHN0b3BBbGxTb3VuZHMoKXtcbiAgICBPYmplY3Qua2V5cyh0aGlzLmluc3RydW1lbnRzKS5mb3JFYWNoKChpbnN0cnVtZW50SWQpID0+IHtcbiAgICAgIHRoaXMuaW5zdHJ1bWVudHNbaW5zdHJ1bWVudElkXS5zdG9wQWxsU291bmRzKClcbiAgICB9KVxuICB9XG5cbn1cblxuIiwiLy8gQGZsb3dcblxuaW1wb3J0IHtnZXRTdG9yZX0gZnJvbSAnLi9jcmVhdGVfc3RvcmUnXG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHMsIHBhcnNlTUlESU5vdGVzfSBmcm9tICcuL3BhcnNlX2V2ZW50cydcbmltcG9ydCB7Z2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7YWRkVGFzaywgcmVtb3ZlVGFza30gZnJvbSAnLi9oZWFydGJlYXQnXG5pbXBvcnQge2NvbnRleHR9IGZyb20gJy4vaW8nXG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4vc2NoZWR1bGVyJ1xuaW1wb3J0IHtcbiAgQ1JFQVRFX1NPTkcsXG4gIEFERF9UUkFDS1MsXG4gIFVQREFURV9TT05HLFxuICBTT05HX1BPU0lUSU9OLFxuICBBRERfTUlESV9FVkVOVFNfVE9fU09ORyxcbiAgU1RBUlRfU0NIRURVTEVSLFxuICBTVE9QX1NDSEVEVUxFUixcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5pbXBvcnQgcWFtYmkgZnJvbSAnLi9xYW1iaSdcblxuY29uc3Qgc3RvcmUgPSBnZXRTdG9yZSgpXG5sZXQgc29uZ0luZGV4ID0gMFxuXG5jb25zdCBkZWZhdWx0U29uZyA9IHtcbiAgcHBxOiA5NjAsXG4gIGJwbTogMTIwLFxuICBiYXJzOiAzMCxcbiAgbG93ZXN0Tm90ZTogMCxcbiAgaGlnaGVzdE5vdGU6IDEyNyxcbiAgbm9taW5hdG9yOiA0LFxuICBkZW5vbWluYXRvcjogNCxcbiAgcXVhbnRpemVWYWx1ZTogOCxcbiAgZml4ZWRMZW5ndGhWYWx1ZTogZmFsc2UsXG4gIHBvc2l0aW9uVHlwZTogJ2FsbCcsXG4gIHVzZU1ldHJvbm9tZTogZmFsc2UsXG4gIGF1dG9TaXplOiB0cnVlLFxuICBsb29wOiBmYWxzZSxcbiAgcGxheWJhY2tTcGVlZDogMSxcbiAgYXV0b1F1YW50aXplOiBmYWxzZVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTb25nKHNldHRpbmdzID0ge30pe1xuICBsZXQgaWQgPSBgU18ke3NvbmdJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHMgPSB7fTtcbiAgKHtcbiAgICBuYW1lOiBzLm5hbWUgPSBpZCxcbiAgICBwcHE6IHMucHBxID0gZGVmYXVsdFNvbmcucHBxLFxuICAgIGJwbTogcy5icG0gPSBkZWZhdWx0U29uZy5icG0sXG4gICAgYmFyczogcy5iYXJzID0gZGVmYXVsdFNvbmcuYmFycyxcbiAgICBsb3dlc3ROb3RlOiBzLmxvd2VzdE5vdGUgPSBkZWZhdWx0U29uZy5sb3dlc3ROb3RlLFxuICAgIGhpZ2hlc3ROb3RlOiBzLmhpZ2hlc3ROb3RlID0gZGVmYXVsdFNvbmcuaGlnaGVzdE5vdGUsXG4gICAgbm9taW5hdG9yOiBzLm5vbWluYXRvciA9IGRlZmF1bHRTb25nLm5vbWluYXRvcixcbiAgICBkZW5vbWluYXRvcjogcy5kZW5vbWluYXRvciA9IGRlZmF1bHRTb25nLmRlbm9taW5hdG9yLFxuICAgIHF1YW50aXplVmFsdWU6IHMucXVhbnRpemVWYWx1ZSA9IGRlZmF1bHRTb25nLnF1YW50aXplVmFsdWUsXG4gICAgZml4ZWRMZW5ndGhWYWx1ZTogcy5maXhlZExlbmd0aFZhbHVlID0gZGVmYXVsdFNvbmcuZml4ZWRMZW5ndGhWYWx1ZSxcbiAgICBwb3NpdGlvblR5cGU6IHMucG9zaXRpb25UeXBlID0gZGVmYXVsdFNvbmcucG9zaXRpb25UeXBlLFxuICAgIHVzZU1ldHJvbm9tZTogcy51c2VNZXRyb25vbWUgPSBkZWZhdWx0U29uZy51c2VNZXRyb25vbWUsXG4gICAgYXV0b1NpemU6IHMuYXV0b1NpemUgPSBkZWZhdWx0U29uZy5hdXRvU2l6ZSxcbiAgICBsb29wOiBzLmxvb3AgPSBkZWZhdWx0U29uZy5sb29wLFxuICAgIHBsYXliYWNrU3BlZWQ6IHMucGxheWJhY2tTcGVlZCA9IGRlZmF1bHRTb25nLnBsYXliYWNrU3BlZWQsXG4gICAgYXV0b1F1YW50aXplOiBzLmF1dG9RdWFudGl6ZSA9IGRlZmF1bHRTb25nLmF1dG9RdWFudGl6ZSxcbiAgfSA9IHNldHRpbmdzKVxuXG4gIGxldHtcbiAgICB0aW1lRXZlbnRzOiB0aW1lRXZlbnRzID0gW1xuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRFTVBPLCBkYXRhMTogcy5icG19LFxuICAgICAge2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb25nOiBpZCwgdGlja3M6IDAsIHR5cGU6IHFhbWJpLlRJTUVfU0lHTkFUVVJFLCBkYXRhMTogcy5ub21pbmF0b3IsIGRhdGEyOiBzLmRlbm9taW5hdG9yfVxuICAgIF0sXG4gICAgbWlkaUV2ZW50SWRzOiBtaWRpRXZlbnRJZHMgPSBbXSxcbiAgICBwYXJ0SWRzOiBwYXJ0SWRzID0gW10sXG4gICAgdHJhY2tJZHM6IHRyYWNrSWRzID0gW10sXG4gIH0gPSBzZXR0aW5nc1xuXG4gIC8vcGFyc2VUaW1lRXZlbnRzKHMsIHRpbWVFdmVudHMpXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9TT05HLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIGlkLFxuICAgICAgdGltZUV2ZW50cyxcbiAgICAgIG1pZGlFdmVudElkcyxcbiAgICAgIHBhcnRJZHMsXG4gICAgICB0cmFja0lkcyxcbiAgICAgIHNldHRpbmdzOiBzXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkVHJhY2tzKHNvbmdfaWQ6IHN0cmluZywgLi4udHJhY2tfaWRzOnN0cmluZyl7XG4gIHN0b3JlLmRpc3BhdGNoKHtcbiAgICB0eXBlOiBBRERfVFJBQ0tTLFxuICAgIHBheWxvYWQ6IHtcbiAgICAgIHNvbmdfaWQsXG4gICAgICB0cmFja19pZHMsXG4gICAgfVxuICB9KVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRUaW1lRXZlbnRzKC4uLnRpbWVfZXZlbnRzKXtcblxufVxuXG5cbi8vIHByZXBhcmUgc29uZyBldmVudHMgZm9yIHBsYXliYWNrXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlU29uZyhzb25nX2lkOiBzdHJpbmcpe1xuICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpLmVkaXRvclxuICBsZXQgc29uZyA9IHN0YXRlLnNvbmdzW3NvbmdfaWRdXG4gIGlmKHNvbmcpe1xuICAgIHBhcnNlVGltZUV2ZW50cyhzb25nLnNldHRpbmdzLCBzb25nLnRpbWVFdmVudHMpXG4gICAgbGV0IG1pZGlFdmVudHMgPSBbLi4uc29uZy50aW1lRXZlbnRzXVxuICAgIGNvbnNvbGUubG9nKHNvbmcpXG4gICAgc29uZy5taWRpRXZlbnRJZHMuZm9yRWFjaChmdW5jdGlvbihldmVudF9pZCl7XG4gICAgICBsZXQgZXZlbnQgPSBzdGF0ZS5taWRpRXZlbnRzW2V2ZW50X2lkXVxuICAgICAgaWYoZXZlbnQpe1xuICAgICAgICBtaWRpRXZlbnRzLnB1c2goey4uLmV2ZW50fSlcbiAgICAgIH1cbiAgICB9KVxuICAgIG1pZGlFdmVudHMgPSBwYXJzZUV2ZW50cyhtaWRpRXZlbnRzKVxuICAgIHBhcnNlTUlESU5vdGVzKG1pZGlFdmVudHMpXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogVVBEQVRFX1NPTkcsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHNvbmdfaWQsXG4gICAgICAgIG1pZGlfZXZlbnRzOiBtaWRpRXZlbnRzLFxuICAgICAgICBzZXR0aW5nczogc29uZy5zZXR0aW5ncyAvLyBuZWVkZWQgZm9yIHRoZSBzZXF1ZW5jZXIgcmVkdWNlclxuICAgICAgfVxuICAgIH0pXG4gIH1lbHNle1xuICAgIGNvbnNvbGUud2Fybihgbm8gc29uZyBmb3VuZCB3aXRoIGlkICR7c29uZ19pZH1gKVxuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0U29uZyhzb25nX2lkOiBzdHJpbmcsIHN0YXJ0X3Bvc2l0aW9uOiBudW1iZXIgPSAwKXtcblxuICBmdW5jdGlvbiBjcmVhdGVTY2hlZHVsZXIoKXtcbiAgICBsZXQgc3RhdGUgPSBzdG9yZS5nZXRTdGF0ZSgpXG4gICAgbGV0IHNvbmdEYXRhID0gc3RhdGUuc2VxdWVuY2VyLnNvbmdzW3NvbmdfaWRdXG4gICAgbGV0IHBhcnRzID0ge31cbiAgICBsZXQgdHJhY2tzID0ge31cbiAgICBsZXQgaW5zdHJ1bWVudHMgPSB7fVxuICAgIGxldCBpID0gMFxuICAgIGxldCBtaWRpRXZlbnRzID0gc29uZ0RhdGEubWlkaUV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgaWYoKGV2ZW50LnR5cGUgPT09IDE0NCB8fCBldmVudC50eXBlID09PSAxMjgpICYmIHR5cGVvZiBldmVudC5taWRpTm90ZUlkID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGNvbnNvbGUuaW5mbyhpKyssICdubyBtaWRpTm90ZUlkJywgZXZlbnQpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgbGV0IHBhcnQgPSBwYXJ0c1tldmVudC5wYXJ0SWRdXG4gICAgICBsZXQgdHJhY2sgPSB0cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgIGlmKHR5cGVvZiBwYXJ0ID09PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIHBhcnRzW2V2ZW50LnBhcnRJZF0gPSBwYXJ0ID0gc3RhdGUuZWRpdG9yLnBhcnRzW2V2ZW50LnBhcnRJZF1cbiAgICAgIH1cbiAgICAgIGlmKHR5cGVvZiB0cmFjayA9PT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICB0cmFja3NbZXZlbnQudHJhY2tJZF0gPSB0cmFjayA9IHN0YXRlLmVkaXRvci50cmFja3NbZXZlbnQudHJhY2tJZF1cbiAgICAgICAgaW5zdHJ1bWVudHNbdHJhY2suaW5zdHJ1bWVudElkXSA9IHN0YXRlLmluc3RydW1lbnRzW3RyYWNrLmluc3RydW1lbnRJZF1cbiAgICAgIH1cbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuYmFyc0FzU3RyaW5nLCBldmVudClcbiAgICAgIHJldHVybiAoIWV2ZW50Lm11dGUgJiYgIXBhcnQubXV0ZSAmJiAhdHJhY2subXV0ZSlcbiAgICB9KVxuXG4gICAgbGV0IHBvc2l0aW9uID0gc3RhcnRfcG9zaXRpb25cbiAgICBsZXQgdGltZVN0YW1wID0gY29udGV4dC5jdXJyZW50VGltZSAqIDEwMDAgLy8gLT4gY29udmVydCB0byBtaWxsaXNcbiAgICBsZXQgc2NoZWR1bGVyID0gbmV3IFNjaGVkdWxlcih7XG4gICAgICBzb25nX2lkLFxuICAgICAgc3RhcnRfcG9zaXRpb24sXG4gICAgICB0aW1lU3RhbXAsXG4gICAgICB0cmFja3MsXG4gICAgICBpbnN0cnVtZW50cyxcbiAgICAgIHNldHRpbmdzOiBzb25nRGF0YS5zZXR0aW5ncyxcbiAgICAgIG1pZGlFdmVudHM6IG1pZGlFdmVudHMsXG4gICAgfSlcblxuICAgIHN0b3JlLmRpc3BhdGNoKHtcbiAgICAgIHR5cGU6IFNUQVJUX1NDSEVEVUxFUixcbiAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgc29uZ19pZCxcbiAgICAgICAgc2NoZWR1bGVyXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgbGV0XG4gICAgICAgIG5vdyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwLFxuICAgICAgICBkaWZmID0gbm93IC0gdGltZVN0YW1wLFxuICAgICAgICBlbmRPZlNvbmdcblxuICAgICAgcG9zaXRpb24gKz0gZGlmZiAvLyBwb3NpdGlvbiBpcyBpbiBtaWxsaXNcbiAgICAgIHRpbWVTdGFtcCA9IG5vd1xuICAgICAgZW5kT2ZTb25nID0gc2NoZWR1bGVyLnVwZGF0ZShwb3NpdGlvbilcbiAgICAgIGlmKGVuZE9mU29uZyl7XG4gICAgICAgIHN0b3BTb25nKHNvbmdfaWQpXG4gICAgICB9XG4gICAgICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFNPTkdfUE9TSVRJT04sXG4gICAgICAgIHBheWxvYWQ6IHtcbiAgICAgICAgICBzb25nX2lkLFxuICAgICAgICAgIHBvc2l0aW9uXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgYWRkVGFzaygncmVwZXRpdGl2ZScsIHNvbmdfaWQsIGNyZWF0ZVNjaGVkdWxlcigpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RvcFNvbmcoc29uZ19pZDogc3RyaW5nKXtcbiAgcmVtb3ZlVGFzaygncmVwZXRpdGl2ZScsIHNvbmdfaWQpXG4gIGxldCBzdGF0ZSA9IHN0b3JlLmdldFN0YXRlKClcbiAgbGV0IHNvbmdEYXRhID0gc3RhdGUuc2VxdWVuY2VyLnNvbmdzW3NvbmdfaWRdXG4gIGlmKHNvbmdEYXRhKXtcbiAgICBzb25nRGF0YS5zY2hlZHVsZXIuc3RvcEFsbFNvdW5kcygpXG4gICAgc3RvcmUuZGlzcGF0Y2goe1xuICAgICAgdHlwZTogU1RPUF9TQ0hFRFVMRVIsXG4gICAgICBwYXlsb2FkOiB7XG4gICAgICAgIHNvbmdfaWRcbiAgICAgIH1cbiAgICB9KVxuICB9ZWxzZXtcbiAgICBjb25zb2xlLmVycm9yKGBubyBzb25nIGZvdW5kIHdpdGggaWQgJHtzb25nX2lkfWApXG4gIH1cbn1cblxuXG4vKlxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1JRElFdmVudHMoXG4gIHNldHRpbmdzOiB7c29uZ19pZDogc3RyaW5nLCB0cmFja19pZDogc3RyaW5nLCBwYXJ0X2lkOiBzdHJpbmd9LFxuICBtaWRpX2V2ZW50czogQXJyYXk8e3RpY2tzOiBudW1iZXIsIHR5cGU6IG51bWJlciwgZGF0YTE6IG51bWJlciwgZGF0YTI6IG51bWJlcn0+XG4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuLy8gICAgICBpZDogc29uZ19pZCxcbiAgICAgIG1pZGlfZXZlbnRzXG4gICAgfVxuICB9KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkTUlESUV2ZW50c1RvU29uZyhzb25nX2lkOiBzdHJpbmcsIG1pZGlfZXZlbnRzOiBBcnJheTx7dGlja3M6IG51bWJlciwgdHlwZTogbnVtYmVyLCBkYXRhMTogbnVtYmVyLCBkYXRhMjogbnVtYmVyfT4pe1xuICAvL0B0b2RvOiBjcmVhdGUgcGFydCwgYWRkIGV2ZW50cyB0byBwYXJ0LCBjcmVhdGUgdHJhY2ssIGFkZCBwYXJ0IHRvIHRyYWNrLCBhZGQgdHJhY2sgdG8gc29uZ1xuICBzdG9yZS5kaXNwYXRjaCh7XG4gICAgdHlwZTogQUREX01JRElfRVZFTlRTX1RPX1NPTkcsXG4gICAgcGF5bG9hZDoge1xuICAgICAgaWQ6IHNvbmdfaWQsXG4gICAgICBtaWRpX2V2ZW50c1xuICAgIH1cbiAgfSlcbn1cbiovIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBwYXJzZU1JRElGaWxlIGZyb20gJy4vbWlkaWZpbGUnXG5pbXBvcnQge2NyZWF0ZU1JRElFdmVudCwgZ2V0TUlESUV2ZW50SWR9IGZyb20gJy4vbWlkaV9ldmVudCdcbmltcG9ydCB7Y3JlYXRlUGFydCwgYWRkTUlESUV2ZW50c30gZnJvbSAnLi9wYXJ0J1xuaW1wb3J0IHtjcmVhdGVUcmFjaywgYWRkUGFydHN9IGZyb20gJy4vdHJhY2snXG5pbXBvcnQge2NyZWF0ZVNvbmcsIGFkZFRyYWNrcywgdXBkYXRlU29uZ30gZnJvbSAnLi9zb25nJ1xuXG5jb25zdCBQUFEgPSA5NjBcblxuZXhwb3J0IGZ1bmN0aW9uIHNvbmdGcm9tTUlESUZpbGUoZGF0YSwgc2V0dGluZ3MgPSB7fSl7XG5cbiAgaWYoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyID09PSB0cnVlKXtcbiAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgcmV0dXJuIHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICB9ZWxzZSBpZih0eXBlb2YgZGF0YS5oZWFkZXIgIT09ICd1bmRlZmluZWQnICYmIHR5cGVvZiBkYXRhLnRyYWNrcyAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgIHJldHVybiB0b1NvbmcoZGF0YSk7XG4gIC8vIH1lbHNle1xuICAvLyAgIGRhdGEgPSBiYXNlNjRUb0JpbmFyeShkYXRhKTtcbiAgLy8gICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAvLyAgICAgbGV0IGJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGRhdGEpO1xuICAvLyAgICAgcmV0dXJuIHRvU29uZyhwYXJzZU1JRElGaWxlKGJ1ZmZlcikpO1xuICAvLyAgIH1lbHNle1xuICAvLyAgICAgZXJyb3IoJ3dyb25nIGRhdGEnKTtcbiAgLy8gICB9XG4gIH1cblxuICAvLyB7XG4gIC8vICAgcHBxID0gbmV3UFBRLFxuICAvLyAgIGJwbSA9IG5ld0JQTSxcbiAgLy8gICBwbGF5YmFja1NwZWVkID0gbmV3UGxheWJhY2tTcGVlZCxcbiAgLy8gfSA9IHNldHRpbmdzXG59XG5cblxuZnVuY3Rpb24gdG9Tb25nKHBhcnNlZCl7XG4gIGxldCB0cmFja3MgPSBwYXJzZWQudHJhY2tzXG4gIGxldCBwcHEgPSBwYXJzZWQuaGVhZGVyLnRpY2tzUGVyQmVhdFxuICBsZXQgcHBxRmFjdG9yID0gUFBRIC8gcHBxIC8vQFRPRE86IGdldCBwcHEgZnJvbSBjb25maWcgLT4gb25seSBuZWNlc3NhcnkgaWYgeW91IHdhbnQgdG8gY2hhbmdlIHRoZSBwcHEgb2YgdGhlIE1JREkgZmlsZSAhXG4gIGxldCB0aW1lRXZlbnRzID0gW11cbiAgbGV0IGV2ZW50SWRzXG4gIGxldCBicG0gPSAtMVxuICBsZXQgbm9taW5hdG9yID0gLTFcbiAgbGV0IGRlbm9taW5hdG9yID0gLTFcbiAgbGV0IHRyYWNrSWRzID0gW11cbiAgbGV0IHNvbmdJZFxuXG5cbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3MudmFsdWVzKCkpe1xuICAgIGxldCBsYXN0VGlja3MsIGxhc3RUeXBlXG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCB0eXBlXG4gICAgbGV0IGNoYW5uZWwgPSAtMVxuICAgIGxldCB0cmFja05hbWVcbiAgICBsZXQgdHJhY2tJbnN0cnVtZW50TmFtZVxuICAgIGV2ZW50SWRzID0gW107XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRyYWNrKXtcbiAgICAgIHRpY2tzICs9IChldmVudC5kZWx0YVRpbWUgKiBwcHFGYWN0b3IpO1xuXG4gICAgICBpZihjaGFubmVsID09PSAtMSAmJiB0eXBlb2YgZXZlbnQuY2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBjaGFubmVsID0gZXZlbnQuY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5kZWx0YVRpbWUsIHRpY2tzLCB0eXBlKTtcblxuICAgICAgc3dpdGNoKGV2ZW50LnN1YnR5cGUpe1xuXG4gICAgICAgIGNhc2UgJ3RyYWNrTmFtZSc6XG4gICAgICAgICAgdHJhY2tOYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFja0luc3RydW1lbnROYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnbm90ZU9uJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHg4MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdzZXRUZW1wbyc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGVtcG8gZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGxldCB0bXAgPSA2MDAwMDAwMCAvIGV2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIC8vY29uc29sZS5pbmZvKCd0ZW1wbyBldmVudHMgb24gdGhlIHNhbWUgdGljaycsIHRpY2tzLCB0bXApO1xuICAgICAgICAgICAgdGltZUV2ZW50cy5wb3AoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZihicG0gPT09IC0xKXtcbiAgICAgICAgICAgIGJwbSA9IHRtcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGltZUV2ZW50cy5wdXNoKHtpZDogZ2V0TUlESUV2ZW50SWQoKSwgc29ydEluZGV4OiB0aWNrcyArIDB4NTEsIHRpY2tzLCB0eXBlOiAweDUxLCBkYXRhMTogdG1wfSk7XG4gICAgICAgICAgLy90aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzLCB0aWNrcywgdHlwZTogMHg1MSwgZGF0YTE6IHRtcH0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3RpbWVTaWduYXR1cmUnOlxuICAgICAgICAgIC8vIHNvbWV0aW1lcyAyIHRpbWUgc2lnbmF0dXJlIGV2ZW50cyBoYXZlIHRoZSBzYW1lIHBvc2l0aW9uIGluIHRpY2tzXG4gICAgICAgICAgLy8gd2UgdXNlIHRoZSBsYXN0IGluIHRoZXNlIGNhc2VzIChzYW1lIGFzIEN1YmFzZSlcbiAgICAgICAgICBpZihsYXN0VGlja3MgPT09IHRpY2tzICYmIGxhc3RUeXBlID09PSB0eXBlKXtcbiAgICAgICAgICAgIGNvbnNvbGUuaW5mbygndGltZSBzaWduYXR1cmUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcik7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKG5vbWluYXRvciA9PT0gLTEpe1xuICAgICAgICAgICAgbm9taW5hdG9yID0gZXZlbnQubnVtZXJhdG9yXG4gICAgICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yXG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaCh7aWQ6IGdldE1JRElFdmVudElkKCksIHNvcnRJbmRleDogdGlja3MgKyAweDU4LCB0aWNrcywgdHlwZTogMHg1OCwgZGF0YTE6IGV2ZW50Lm51bWVyYXRvciwgZGF0YTI6IGV2ZW50LmRlbm9taW5hdG9yfSk7XG4gICAgICAgICAgLy90aW1lRXZlbnRzLnB1c2goe2lkOiBnZXRNSURJRXZlbnRJZCgpLCBzb3J0SW5kZXg6IHRpY2tzLCB0aWNrcywgdHlwZTogMHg1OCwgZGF0YTE6IGV2ZW50Lm51bWVyYXRvciwgZGF0YTI6IGV2ZW50LmRlbm9taW5hdG9yfSk7XG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudElkcy5wdXNoKGNyZWF0ZU1JRElFdmVudCh0aWNrcywgMHhCMCwgZXZlbnQuY29udHJvbGxlclR5cGUsIGV2ZW50LnZhbHVlKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncHJvZ3JhbUNoYW5nZSc6XG4gICAgICAgICAgZXZlbnRJZHMucHVzaChjcmVhdGVNSURJRXZlbnQodGlja3MsIDB4QzAsIGV2ZW50LnByb2dyYW1OdW1iZXIpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwaXRjaEJlbmQnOlxuICAgICAgICAgIGV2ZW50SWRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlXG4gICAgICBsYXN0VGlja3MgPSB0aWNrc1xuICAgIH1cblxuICAgIGlmKGV2ZW50SWRzLmxlbmd0aCA+IDApe1xuICAgICAgbGV0IHRyYWNrSWQgPSBjcmVhdGVUcmFjayh7bmFtZTogdHJhY2tOYW1lfSlcbiAgICAgIC8vbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWQsIG1pZGlFdmVudElkczogZXZlbnRJZHN9KVxuICAgICAgbGV0IHBhcnRJZCA9IGNyZWF0ZVBhcnQoe3RyYWNrSWR9KVxuICAgICAgYWRkTUlESUV2ZW50cyhwYXJ0SWQsIC4uLmV2ZW50SWRzKVxuICAgICAgYWRkUGFydHModHJhY2tJZCwgcGFydElkKVxuICAgICAgLy9hZGRUcmFja3Moc29uZ0lkLCB0cmFja0lkKVxuICAgICAgdHJhY2tJZHMucHVzaCh0cmFja0lkKVxuICAgIH1cbiAgfVxuXG4gIHNvbmdJZCA9IGNyZWF0ZVNvbmcoe1xuICAgIHBwcTogUFBRLFxuICAgIC8vcGxheWJhY2tTcGVlZDogMSxcbiAgICAvL3BwcSxcbiAgICBicG0sXG4gICAgbm9taW5hdG9yLFxuICAgIGRlbm9taW5hdG9yLFxuICAgIHRpbWVFdmVudHMsXG4gIH0pXG4gIGFkZFRyYWNrcyhzb25nSWQsIC4uLnRyYWNrSWRzKVxuICB1cGRhdGVTb25nKHNvbmdJZClcbiAgcmV0dXJuIHNvbmdJZFxufVxuIiwiXG5pbXBvcnQgZmV0Y2ggZnJvbSAnaXNvbW9ycGhpYy1mZXRjaCdcbmltcG9ydCBxYW1iaSwge1xuICBjcmVhdGVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnQsXG4gIG1vdmVNSURJRXZlbnRUbyxcbiAgY3JlYXRlTUlESU5vdGUsXG4gIGNyZWF0ZVNvbmcsXG4gIGFkZFRyYWNrcyxcbiAgY3JlYXRlVHJhY2ssXG4gIGFkZFBhcnRzLFxuICBjcmVhdGVQYXJ0LFxuICBhZGRNSURJRXZlbnRzLFxuICB1cGRhdGVTb25nLFxuICBzdGFydFNvbmcsXG4gIHN0b3BTb25nLFxuICBwYXJzZU1JRElGaWxlLFxuICBzb25nRnJvbU1JRElGaWxlLFxufSBmcm9tICcuL3FhbWJpJ1xuXG5jb25zb2xlLmxvZyhxYW1iaS52ZXJzaW9uKVxucWFtYmkubG9nKCdmdW5jdGlvbnMnKVxuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgZnVuY3Rpb24oKXtcblxuICBsZXQgYnV0dG9uU3RhcnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc3RhcnQnKVxuICBsZXQgYnV0dG9uU3RvcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzdG9wJylcbiAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSB0cnVlXG4gIGJ1dHRvblN0b3AuZGlzYWJsZWQgPSB0cnVlXG5cbiAgbGV0IHRlc3QgPSAyXG4gIGxldCBub3Rlb24sIG5vdGVvZmYsIG5vdGUsIHNvbmdJZCwgdHJhY2ssIHBhcnQxLCBwYXJ0MlxuXG4gIGlmKHRlc3QgPT09IDEpe1xuXG4gICAgc29uZ0lkID0gY3JlYXRlU29uZyh7bmFtZTogJ015IEZpcnN0IFNvbmcnLCBwbGF5YmFja1NwZWVkOiAxLCBsb29wOiB0cnVlLCBicG06IDYwfSlcbiAgICB0cmFjayA9IGNyZWF0ZVRyYWNrKHtuYW1lOiAnZ3VpdGFyJywgc29uZ0lkfSlcbiAgICBwYXJ0MSA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMScsIHRyYWNrfSlcbiAgICBwYXJ0MiA9IGNyZWF0ZVBhcnQoe25hbWU6ICdzb2xvMicsIHRyYWNrfSlcbiAgICAvL25vdGVvbiA9IGNyZWF0ZU1JRElFdmVudCg5NjAsIDE0NCwgNjAsIDEwMClcbiAgICAvL25vdGVvZmYgPSBjcmVhdGVNSURJRXZlbnQoMTAyMCwgMTI4LCA2MCwgMClcbiAgICAvL2FkZE1JRElFdmVudHMocGFydDEsIG5vdGVvbiwgbm90ZW9mZilcblxuICAgIC8vbm90ZSA9IGNyZWF0ZU1JRElOb3RlKG5vdGVvbiwgbm90ZW9mZilcblxuXG4gICAgbGV0IGV2ZW50cyA9IFtdXG4gICAgbGV0IHRpY2tzID0gMFxuICAgIGxldCB0eXBlID0gMTQ0XG5cbiAgICBmb3IobGV0IGkgPSAwOyBpIDwgMTAwOyBpKyspe1xuICAgICAgZXZlbnRzLnB1c2goY3JlYXRlTUlESUV2ZW50KHRpY2tzLCB0eXBlLCA2MCwgMTAwKSlcbiAgICAgIGlmKGkgJSAyID09PSAwKXtcbiAgICAgICAgdHlwZSA9IDEyOFxuICAgICAgICB0aWNrcyArPSA5NjBcbiAgICAgIH1lbHNle1xuICAgICAgICB0eXBlID0gMTQ0XG4gICAgICAgIHRpY2tzICs9IDk2MFxuICAgICAgfVxuICAgIH1cbiAgICBhZGRNSURJRXZlbnRzKHBhcnQxLCAuLi5ldmVudHMpXG5cbiAgICBhZGRQYXJ0cyh0cmFjaywgcGFydDEsIHBhcnQyKVxuICAgIGFkZFRyYWNrcyhzb25nSWQsIHRyYWNrKVxuICAgIHVwZGF0ZVNvbmcoc29uZ0lkKVxuICAgIGJ1dHRvblN0YXJ0LmRpc2FibGVkID0gZmFsc2VcbiAgfVxuXG4vKlxuICAvL3N0YXJ0U29uZyhzb25nKVxuICAvLyBsZXQgc29uZzIgPSBjcmVhdGVTb25nKClcblxuICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gIC8vICAgc3RhcnRTb25nKHNvbmcyLCA1MDAwKVxuICAvLyB9LCAxMDAwKVxuXG4vLyAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbi8vICAgICBzdG9wU29uZyhzb25nKVxuLy8gLy8gICAgc3RvcFNvbmcoc29uZzIpXG4vLyAgIH0sIDIwMClcbiovXG5cbiAgaWYodGVzdCA9PT0gMil7XG4gICAgLy9mZXRjaCgnbW96azU0NWEubWlkJylcbiAgICBmZXRjaCgnbWludXRlX3dhbHR6Lm1pZCcpXG4gICAgLnRoZW4oXG4gICAgICAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmFycmF5QnVmZmVyKClcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnJvcilcbiAgICAgIH1cbiAgICApXG4gICAgLnRoZW4oKGFiKSA9PiB7XG4gICAgICAvL3NvbmdJZCA9IHNvbmdGcm9tTUlESUZpbGUocGFyc2VNSURJRmlsZShhYikpXG4gICAgICBsZXQgbWYgPSBwYXJzZU1JRElGaWxlKGFiKVxuICAgICAgc29uZ0lkID0gc29uZ0Zyb21NSURJRmlsZShtZilcbiAgICAgIGNvbnNvbGUubG9nKCdoZWFkZXI6JywgbWYuaGVhZGVyKVxuICAgICAgY29uc29sZS5sb2coJyMgdHJhY2tzOicsIG1mLnRyYWNrcy5zaXplKVxuICAgICAgYnV0dG9uU3RhcnQuZGlzYWJsZWQgPSBmYWxzZVxuICAgICAgYnV0dG9uU3RvcC5kaXNhYmxlZCA9IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIGJ1dHRvblN0YXJ0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKXtcbiAgICBzdGFydFNvbmcoc29uZ0lkLCAwKVxuICB9KVxuXG4gIGJ1dHRvblN0b3AuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgIHN0b3BTb25nKHNvbmdJZClcbiAgfSlcblxufSlcbiIsIi8vIEBmbG93XG5cbmltcG9ydCB7Y29udGV4dH0gZnJvbSAnLi9pbydcbmltcG9ydCB7Z2V0U3RvcmV9IGZyb20gJy4vY3JlYXRlX3N0b3JlJ1xuaW1wb3J0IHtjcmVhdGVJbnN0cnVtZW50fSBmcm9tICcuL2luc3RydW1lbnQnXG5pbXBvcnQge1xuICBDUkVBVEVfVFJBQ0ssXG4gIEFERF9QQVJUUyxcbn0gZnJvbSAnLi9hY3Rpb25fdHlwZXMnXG5cbmNvbnN0IHN0b3JlID0gZ2V0U3RvcmUoKVxubGV0IHRyYWNrSW5kZXggPSAwXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVUcmFjayhcbiAgc2V0dGluZ3M6IHtuYW1lOiBzdHJpbmcsIHBhcnRJZHM6QXJyYXk8c3RyaW5nPiwgc29uZ0lkOiBzdHJpbmd9ID0ge31cbiAgLy9zZXR0aW5nczoge25hbWU6IHN0cmluZywgcGFydHM6QXJyYXk8c3RyaW5nPiwgc29uZzogc3RyaW5nfSA9IHtuYW1lOiAnYWFwJywgcGFydHM6IFtdLCBzb25nOiAnbm8gc29uZyd9XG4gIC8vc2V0dGluZ3MgPSB7bmFtZTogbmFtZSA9ICdhYXAnLCBwYXJ0czogcGFydHMgPSBbXSwgc29uZzogc29uZyA9ICdubyBzb25nJ31cbiAgLy9zZXR0aW5ncyA9IHtuYW1lOiBuYW1lID0gJ2FhcCcsIHBhcnRzOiBwYXJ0cyA9IFtdLCBzb25nOiBzb25nID0gJ25vIHNvbmcnfVxuKXtcbiAgbGV0IGlkID0gYE1UXyR7dHJhY2tJbmRleCsrfV8ke25ldyBEYXRlKCkuZ2V0VGltZSgpfWBcbiAgbGV0IHtcbiAgICBuYW1lID0gaWQsXG4gICAgcGFydElkcyA9IFtdLFxuICAgIHNvbmdJZCA9ICdub25lJ1xuICB9ID0gc2V0dGluZ3NcbiAgbGV0IHZvbHVtZSA9IDAuNVxuICBsZXQgb3V0cHV0ID0gY29udGV4dC5jcmVhdGVHYWluKClcbiAgb3V0cHV0LmdhaW4udmFsdWUgPSB2b2x1bWVcbiAgb3V0cHV0LmNvbm5lY3QoY29udGV4dC5kZXN0aW5hdGlvbikgLy9AVE9ETzogcm91dGUgdG8gbWFzdGVyIGNvbXByZXNzb3IgZmlyc3QhXG5cbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IENSRUFURV9UUkFDSyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICBpZCxcbiAgICAgIG5hbWUsXG4gICAgICBwYXJ0SWRzLFxuICAgICAgc29uZ0lkLFxuICAgICAgdm9sdW1lLFxuICAgICAgb3V0cHV0LFxuICAgICAgbXV0ZTogZmFsc2UsXG4gICAgICBpbnN0cnVtZW50SWQ6IGNyZWF0ZUluc3RydW1lbnQoJ3NpbmV3YXZlJyksXG4gICAgfVxuICB9KVxuICByZXR1cm4gaWRcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gYWRkUGFydHModHJhY2tfaWQ6IHN0cmluZywgLi4ucGFydF9pZHM6c3RyaW5nKXtcbiAgc3RvcmUuZGlzcGF0Y2goe1xuICAgIHR5cGU6IEFERF9QQVJUUyxcbiAgICBwYXlsb2FkOiB7XG4gICAgICB0cmFja19pZCxcbiAgICAgIHBhcnRfaWRzLFxuICAgIH1cbiAgfSlcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbXV0ZVRyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFZvbHVtZVRyYWNrKGZsYWc6IGJvb2xlYW4pe1xuXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBhbm5pbmdUcmFjayhmbGFnOiBib29sZWFuKXtcblxufVxuIiwibGV0XG4gIG1Qb3cgPSBNYXRoLnBvdyxcbiAgbVJvdW5kID0gTWF0aC5yb3VuZCxcbiAgbUZsb29yID0gTWF0aC5mbG9vcixcbiAgbVJhbmRvbSA9IE1hdGgucmFuZG9tXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXROaWNlVGltZShtaWxsaXMpe1xuICBsZXQgaCwgbSwgcywgbXMsXG4gICAgc2Vjb25kcyxcbiAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzLzEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKChzZWNvbmRzICUgKDYwICogNjApKSAvIDYwKTtcbiAgcyA9IG1GbG9vcihzZWNvbmRzICUgKDYwKSk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gKGggKiAzNjAwKSAtIChtICogNjApIC0gcykgKiAxMDAwKTtcblxuICB0aW1lQXNTdHJpbmcgKz0gaCArICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG0gPCAxMCA/ICcwJyArIG0gOiBtO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gcyA8IDEwID8gJzAnICsgcyA6IHM7XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtcyA9PT0gMCA/ICcwMDAnIDogbXMgPCAxMCA/ICcwMCcgKyBtcyA6IG1zIDwgMTAwID8gJzAnICsgbXMgOiBtcztcblxuICAvL2NvbnNvbGUubG9nKGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIHtcbiAgICBob3VyOiBoLFxuICAgIG1pbnV0ZTogbSxcbiAgICBzZWNvbmQ6IHMsXG4gICAgbWlsbGlzZWNvbmQ6IG1zLFxuICAgIHRpbWVBc1N0cmluZzogdGltZUFzU3RyaW5nLFxuICAgIHRpbWVBc0FycmF5OiBbaCwgbSwgcywgbXNdXG4gIH07XG59Il19
