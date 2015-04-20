(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sequencer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/lib/babel/polyfill.js":[function(require,module,exports){
(function (global){
"use strict";

if (global._babelPolyfill) {
  throw new Error("only one instance of babel/polyfill is allowed");
}
global._babelPolyfill = true;

require("core-js/shim");

require("regenerator-babel/runtime");
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"core-js/shim":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/shim.js","regenerator-babel/runtime":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/regenerator-babel/runtime.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-includes.js":[function(require,module,exports){
'use strict';
// false -> Array#indexOf
// true  -> Array#includes
var $ = require('./$');
module.exports = function(IS_INCLUDES){
  return function(el /*, fromIndex = 0 */){
    var O      = $.toObject(this)
      , length = $.toLength(O.length)
      , index  = $.toIndex(arguments[1], length)
      , value;
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index;
    } return !IS_INCLUDES && -1;
  };
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-methods.js":[function(require,module,exports){
'use strict';
// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex
var $   = require('./$')
  , ctx = require('./$.ctx');
module.exports = function(TYPE){
  var IS_MAP        = TYPE == 1
    , IS_FILTER     = TYPE == 2
    , IS_SOME       = TYPE == 3
    , IS_EVERY      = TYPE == 4
    , IS_FIND_INDEX = TYPE == 6
    , NO_HOLES      = TYPE == 5 || IS_FIND_INDEX;
  return function(callbackfn/*, that = undefined */){
    var O      = Object($.assertDefined(this))
      , self   = $.ES5Object(O)
      , f      = ctx(callbackfn, arguments[1], 3)
      , length = $.toLength(self.length)
      , index  = 0
      , result = IS_MAP ? Array(length) : IS_FILTER ? [] : undefined
      , val, res;
    for(;length > index; index++)if(NO_HOLES || index in self){
      val = self[index];
      res = f(val, index, O);
      if(TYPE){
        if(IS_MAP)result[index] = res;            // map
        else if(res)switch(TYPE){
          case 3: return true;                    // some
          case 5: return val;                     // find
          case 6: return index;                   // findIndex
          case 2: result.push(val);               // filter
        } else if(IS_EVERY)return false;          // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js":[function(require,module,exports){
var $ = require('./$');
function assert(condition, msg1, msg2){
  if(!condition)throw TypeError(msg2 ? msg1 + msg2 : msg1);
}
assert.def = $.assertDefined;
assert.fn = function(it){
  if(!$.isFunction(it))throw TypeError(it + ' is not a function!');
  return it;
};
assert.obj = function(it){
  if(!$.isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
assert.inst = function(it, Constructor, name){
  if(!(it instanceof Constructor))throw TypeError(name + ": use the 'new' operator!");
  return it;
};
module.exports = assert;
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assign.js":[function(require,module,exports){
var $ = require('./$');
// 19.1.2.1 Object.assign(target, source, ...)
module.exports = Object.assign || function(target, source){ // eslint-disable-line no-unused-vars
  var T = Object($.assertDefined(target))
    , l = arguments.length
    , i = 1;
  while(l > i){
    var S      = $.ES5Object(arguments[i++])
      , keys   = $.getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)T[key = keys[j++]] = S[key];
  }
  return T;
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js":[function(require,module,exports){
var $        = require('./$')
  , TAG      = require('./$.wks')('toStringTag')
  , toString = {}.toString;
function cof(it){
  return toString.call(it).slice(8, -1);
}
cof.classof = function(it){
  var O, T;
  return it == undefined ? it === undefined ? 'Undefined' : 'Null'
    : typeof (T = (O = Object(it))[TAG]) == 'string' ? T : cof(O);
};
cof.set = function(it, tag, stat){
  if(it && !$.has(it = stat ? it : it.prototype, TAG))$.hide(it, TAG, tag);
};
module.exports = cof;
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-strong.js":[function(require,module,exports){
'use strict';
var $        = require('./$')
  , ctx      = require('./$.ctx')
  , safe     = require('./$.uid').safe
  , assert   = require('./$.assert')
  , $iter    = require('./$.iter')
  , has      = $.has
  , set      = $.set
  , isObject = $.isObject
  , hide     = $.hide
  , step     = $iter.step
  , isFrozen = Object.isFrozen || $.core.Object.isFrozen
  , ID       = safe('id')
  , O1       = safe('O1')
  , LAST     = safe('last')
  , FIRST    = safe('first')
  , ITER     = safe('iter')
  , SIZE     = $.DESC ? safe('size') : 'size'
  , id       = 0;

function fastKey(it, create){
  // return primitive with prefix
  if(!isObject(it))return (typeof it == 'string' ? 'S' : 'P') + it;
  // can't set id to frozen object
  if(isFrozen(it))return 'F';
  if(!has(it, ID)){
    // not necessary to add id
    if(!create)return 'E';
    // add missing object id
    hide(it, ID, ++id);
  // return object id with prefix
  } return 'O' + it[ID];
}

function getEntry(that, key){
  // fast case
  var index = fastKey(key), entry;
  if(index != 'F')return that[O1][index];
  // frozen object case
  for(entry = that[FIRST]; entry; entry = entry.n){
    if(entry.k == key)return entry;
  }
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(iterable){
      var that = assert.inst(this, C, NAME);
      set(that, O1, $.create(null));
      set(that, SIZE, 0);
      set(that, LAST, undefined);
      set(that, FIRST, undefined);
      if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
    }
    $.mix(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function(){
        for(var that = this, data = that[O1], entry = that[FIRST]; entry; entry = entry.n){
          entry.r = true;
          if(entry.p)entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that[FIRST] = that[LAST] = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function(key){
        var that  = this
          , entry = getEntry(that, key);
        if(entry){
          var next = entry.n
            , prev = entry.p;
          delete that[O1][entry.i];
          entry.r = true;
          if(prev)prev.n = next;
          if(next)next.p = prev;
          if(that[FIRST] == entry)that[FIRST] = next;
          if(that[LAST] == entry)that[LAST] = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function(callbackfn /*, that = undefined */){
        var f = ctx(callbackfn, arguments[1], 3)
          , entry;
        while(entry = entry ? entry.n : this[FIRST]){
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while(entry && entry.r)entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function(key){
        return !!getEntry(this, key);
      }
    });
    if($.DESC)$.setDesc(C.prototype, 'size', {
      get: function(){
        return assert.def(this[SIZE]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    var entry = getEntry(that, key)
      , prev, index;
    // change existing entry
    if(entry){
      entry.v = value;
    // create new entry
    } else {
      that[LAST] = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that[LAST],          // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if(!that[FIRST])that[FIRST] = entry;
      if(prev)prev.n = entry;
      that[SIZE]++;
      // add to index
      if(index != 'F')that[O1][index] = entry;
    } return that;
  },
  getEntry: getEntry,
  getIterConstructor: function(){
    return function(iterated, kind){
      set(this, ITER, {o: iterated, k: kind});
    };
  },
  next: function(){
    var iter  = this[ITER]
      , kind  = iter.k
      , entry = iter.l;
    // revert to the last existing entry
    while(entry && entry.r)entry = entry.p;
    // get next entry
    if(!iter.o || !(iter.l = entry = entry ? entry.n : iter.o[FIRST])){
      // or finish the iteration
      iter.o = undefined;
      return step(1);
    }
    // return step by kind
    if(kind == 'key'  )return step(0, entry.k);
    if(kind == 'value')return step(0, entry.v);
    return step(0, [entry.k, entry.v]);
  }
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-weak.js":[function(require,module,exports){
'use strict';
var $         = require('./$')
  , safe      = require('./$.uid').safe
  , assert    = require('./$.assert')
  , forOf     = require('./$.iter').forOf
  , has       = $.has
  , isObject  = $.isObject
  , hide      = $.hide
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , id        = 0
  , ID        = safe('id')
  , WEAK      = safe('weak')
  , LEAK      = safe('leak')
  , method    = require('./$.array-methods')
  , find      = method(5)
  , findIndex = method(6);
function findFrozen(store, key){
  return find.call(store.array, function(it){
    return it[0] === key;
  });
}
// fallback for frozen keys
function leakStore(that){
  return that[LEAK] || hide(that, LEAK, {
    array: [],
    get: function(key){
      var entry = findFrozen(this, key);
      if(entry)return entry[1];
    },
    has: function(key){
      return !!findFrozen(this, key);
    },
    set: function(key, value){
      var entry = findFrozen(this, key);
      if(entry)entry[1] = value;
      else this.array.push([key, value]);
    },
    'delete': function(key){
      var index = findIndex.call(this.array, function(it){
        return it[0] === key;
      });
      if(~index)this.array.splice(index, 1);
      return !!~index;
    }
  })[LEAK];
}

module.exports = {
  getConstructor: function(NAME, IS_MAP, ADDER){
    function C(iterable){
      $.set(assert.inst(this, C, NAME), ID, id++);
      if(iterable != undefined)forOf(iterable, IS_MAP, this[ADDER], this);
    }
    $.mix(C.prototype, {
      // 23.3.3.2 WeakMap.prototype.delete(key)
      // 23.4.3.3 WeakSet.prototype.delete(value)
      'delete': function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this)['delete'](key);
        return has(key, WEAK) && has(key[WEAK], this[ID]) && delete key[WEAK][this[ID]];
      },
      // 23.3.3.4 WeakMap.prototype.has(key)
      // 23.4.3.4 WeakSet.prototype.has(value)
      has: function(key){
        if(!isObject(key))return false;
        if(isFrozen(key))return leakStore(this).has(key);
        return has(key, WEAK) && has(key[WEAK], this[ID]);
      }
    });
    return C;
  },
  def: function(that, key, value){
    if(isFrozen(assert.obj(key))){
      leakStore(that).set(key, value);
    } else {
      has(key, WEAK) || hide(key, WEAK, {});
      key[WEAK][that[ID]] = value;
    } return that;
  },
  leakStore: leakStore,
  WEAK: WEAK,
  ID: ID
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.array-methods":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-methods.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection.js":[function(require,module,exports){
'use strict';
var $     = require('./$')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , assertInstance = require('./$.assert').inst;

module.exports = function(NAME, methods, common, IS_MAP, isWeak){
  var Base  = $.g[NAME]
    , C     = Base
    , ADDER = IS_MAP ? 'set' : 'add'
    , proto = C && C.prototype
    , O     = {};
  function fixMethod(KEY, CHAIN){
    var method = proto[KEY];
    if($.FW)proto[KEY] = function(a, b){
      var result = method.call(this, a === 0 ? 0 : a, b);
      return CHAIN ? this : result;
    };
  }
  if(!$.isFunction(C) || !(isWeak || !$iter.BUGGY && proto.forEach && proto.entries)){
    // create collection constructor
    C = common.getConstructor(NAME, IS_MAP, ADDER);
    $.mix(C.prototype, methods);
  } else {
    var inst  = new C
      , chain = inst[ADDER](isWeak ? {} : -0, 1)
      , buggyZero;
    // wrap for init collections from iterable
    if($iter.fail(function(iter){
      new C(iter); // eslint-disable-line no-new
    }) || $iter.DANGER_CLOSING){
      C = function(iterable){
        assertInstance(this, C, NAME);
        var that = new Base;
        if(iterable != undefined)$iter.forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      };
      C.prototype = proto;
      if($.FW)proto.constructor = C;
    }
    isWeak || inst.forEach(function(val, key){
      buggyZero = 1 / key === -Infinity;
    });
    // fix converting -0 key to +0
    if(buggyZero){
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    // + fix .add & .set for chaining
    if(buggyZero || chain !== inst)fixMethod(ADDER, true);
  }

  require('./$.cof').set(C, NAME);
  require('./$.species')(C);

  O[NAME] = C;
  $def($def.G + $def.W + $def.F * (C != Base), O);

  // add .keys, .values, .entries, [@@iterator]
  // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
  if(!isWeak)$iter.std(
    C, NAME,
    common.getIterConstructor(), common.next,
    IS_MAP ? 'key+value' : 'value' , !IS_MAP, true
  );

  return C;
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.species":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.species.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js":[function(require,module,exports){
// Optional / simple context binding
var assertFunction = require('./$.assert').fn;
module.exports = function(fn, that, length){
  assertFunction(fn);
  if(~length && that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  } return function(/* ...args */){
      return fn.apply(that, arguments);
    };
};
},{"./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js":[function(require,module,exports){
var $          = require('./$')
  , global     = $.g
  , core       = $.core
  , isFunction = $.isFunction;
function ctx(fn, that){
  return function(){
    return fn.apply(that, arguments);
  };
}
global.core = core;
// type bitmap
$def.F = 1;  // forced
$def.G = 2;  // global
$def.S = 4;  // static
$def.P = 8;  // proto
$def.B = 16; // bind
$def.W = 32; // wrap
function $def(type, name, source){
  var key, own, out, exp
    , isGlobal = type & $def.G
    , target   = isGlobal ? global : type & $def.S
        ? global[name] : (global[name] || {}).prototype
    , exports  = isGlobal ? core : core[name] || (core[name] = {});
  if(isGlobal)source = name;
  for(key in source){
    // contains in native
    own = !(type & $def.F) && target && key in target;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    if(type & $def.B && own)exp = ctx(out, global);
    else exp = type & $def.P && isFunction(out) ? ctx(Function.call, out) : out;
    // extend global
    if(target && !own){
      if(isGlobal)target[key] = out;
      else delete target[key] && $.hide(target, key, out);
    }
    // export
    if(exports[key] != out)$.hide(exports, key, exp);
  }
}
module.exports = $def;
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.fw.js":[function(require,module,exports){
module.exports = function($){
  $.FW   = true;
  $.path = $.g;
  return $;
};
},{}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.invoke.js":[function(require,module,exports){
// Fast apply
// http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
    case 5: return un ? fn(args[0], args[1], args[2], args[3], args[4])
                      : fn.call(that, args[0], args[1], args[2], args[3], args[4]);
  } return              fn.apply(that, args);
};
},{}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js":[function(require,module,exports){
'use strict';
var $                 = require('./$')
  , ctx               = require('./$.ctx')
  , cof               = require('./$.cof')
  , $def              = require('./$.def')
  , assertObject      = require('./$.assert').obj
  , SYMBOL_ITERATOR   = require('./$.wks')('iterator')
  , FF_ITERATOR       = '@@iterator'
  , Iterators         = {}
  , IteratorPrototype = {};
// Safari has byggy iterators w/o `next`
var BUGGY = 'keys' in [] && !('next' in [].keys());
// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
setIterator(IteratorPrototype, $.that);
function setIterator(O, value){
  $.hide(O, SYMBOL_ITERATOR, value);
  // Add iterator for FF iterator protocol
  if(FF_ITERATOR in [])$.hide(O, FF_ITERATOR, value);
}
function defineIterator(Constructor, NAME, value, DEFAULT){
  var proto = Constructor.prototype
    , iter  = proto[SYMBOL_ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT] || value;
  // Define iterator
  if($.FW)setIterator(proto, iter);
  if(iter !== value){
    var iterProto = $.getProto(iter.call(new Constructor));
    // Set @@toStringTag to native iterators
    cof.set(iterProto, NAME + ' Iterator', true);
    // FF fix
    if($.FW)$.has(proto, FF_ITERATOR) && setIterator(iterProto, $.that);
  }
  // Plug for library
  Iterators[NAME] = iter;
  // FF & v8 fix
  Iterators[NAME + ' Iterator'] = $.that;
  return iter;
}
function getIterator(it){
  var Symbol  = $.g.Symbol
    , ext     = it[Symbol && Symbol.iterator || FF_ITERATOR]
    , getIter = ext || it[SYMBOL_ITERATOR] || Iterators[cof.classof(it)];
  return assertObject(getIter.call(it));
}
function closeIterator(iterator){
  var ret = iterator['return'];
  if(ret !== undefined)assertObject(ret.call(iterator));
}
function stepCall(iterator, fn, value, entries){
  try {
    return entries ? fn(assertObject(value)[0], value[1]) : fn(value);
  } catch(e){
    closeIterator(iterator);
    throw e;
  }
}
var DANGER_CLOSING = true;
!function(){
  try {
    var iter = [1].keys();
    iter['return'] = function(){ DANGER_CLOSING = false; };
    Array.from(iter, function(){ throw 2; });
  } catch(e){ /* empty */ }
}();
var $iter = module.exports = {
  BUGGY: BUGGY,
  DANGER_CLOSING: DANGER_CLOSING,
  fail: function(exec){
    var fail = true;
    try {
      var arr  = [[{}, 1]]
        , iter = arr[SYMBOL_ITERATOR]()
        , next = iter.next;
      iter.next = function(){
        fail = false;
        return next.call(this);
      };
      arr[SYMBOL_ITERATOR] = function(){
        return iter;
      };
      exec(arr);
    } catch(e){ /* empty */ }
    return fail;
  },
  Iterators: Iterators,
  prototype: IteratorPrototype,
  step: function(done, value){
    return {value: value, done: !!done};
  },
  stepCall: stepCall,
  close: closeIterator,
  is: function(it){
    var O      = Object(it)
      , Symbol = $.g.Symbol
      , SYM    = Symbol && Symbol.iterator || FF_ITERATOR;
    return SYM in O || SYMBOL_ITERATOR in O || $.has(Iterators, cof.classof(O));
  },
  get: getIterator,
  set: setIterator,
  create: function(Constructor, NAME, next, proto){
    Constructor.prototype = $.create(proto || $iter.prototype, {next: $.desc(1, next)});
    cof.set(Constructor, NAME + ' Iterator');
  },
  define: defineIterator,
  std: function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCE){
    function createIter(kind){
      return function(){
        return new Constructor(this, kind);
      };
    }
    $iter.create(Constructor, NAME, next);
    var entries = createIter('key+value')
      , values  = createIter('value')
      , proto   = Base.prototype
      , methods, key;
    if(DEFAULT == 'value')values = defineIterator(Base, NAME, values, 'values');
    else entries = defineIterator(Base, NAME, entries, 'entries');
    if(DEFAULT){
      methods = {
        entries: entries,
        keys:    IS_SET ? values : createIter('key'),
        values:  values
      };
      $def($def.P + $def.F * BUGGY, NAME, methods);
      if(FORCE)for(key in methods){
        if(!(key in proto))$.hide(proto, key, methods[key]);
      }
    }
  },
  forOf: function(iterable, entries, fn, that){
    var iterator = getIterator(iterable)
      , f = ctx(fn, that, entries ? 2 : 1)
      , step;
    while(!(step = iterator.next()).done){
      if(stepCall(iterator, f, step.value, entries) === false){
        return closeIterator(iterator);
      }
    }
  }
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js":[function(require,module,exports){
'use strict';
var global = typeof self != 'undefined' ? self : Function('return this')()
  , core   = {}
  , defineProperty = Object.defineProperty
  , hasOwnProperty = {}.hasOwnProperty
  , ceil  = Math.ceil
  , floor = Math.floor
  , max   = Math.max
  , min   = Math.min;
// The engine works fine with descriptors? Thank's IE8 for his funny defineProperty.
var DESC = !!function(){
  try {
    return defineProperty({}, 'a', {get: function(){ return 2; }}).a == 2;
  } catch(e){ /* empty */ }
}();
var hide = createDefiner(1);
// 7.1.4 ToInteger
function toInteger(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
}
function desc(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
}
function simpleSet(object, key, value){
  object[key] = value;
  return object;
}
function createDefiner(bitmap){
  return DESC ? function(object, key, value){
    return $.setDesc(object, key, desc(bitmap, value)); // eslint-disable-line no-use-before-define
  } : simpleSet;
}

function isObject(it){
  return it !== null && (typeof it == 'object' || typeof it == 'function');
}
function isFunction(it){
  return typeof it == 'function';
}
function assertDefined(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
}

var $ = module.exports = require('./$.fw')({
  g: global,
  core: core,
  html: global.document && document.documentElement,
  // http://jsperf.com/core-js-isobject
  isObject:   isObject,
  isFunction: isFunction,
  it: function(it){
    return it;
  },
  that: function(){
    return this;
  },
  // 7.1.4 ToInteger
  toInteger: toInteger,
  // 7.1.15 ToLength
  toLength: function(it){
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  },
  toIndex: function(index, length){
    index = toInteger(index);
    return index < 0 ? max(index + length, 0) : min(index, length);
  },
  has: function(it, key){
    return hasOwnProperty.call(it, key);
  },
  create:     Object.create,
  getProto:   Object.getPrototypeOf,
  DESC:       DESC,
  desc:       desc,
  getDesc:    Object.getOwnPropertyDescriptor,
  setDesc:    defineProperty,
  getKeys:    Object.keys,
  getNames:   Object.getOwnPropertyNames,
  getSymbols: Object.getOwnPropertySymbols,
  // Dummy, fix for not array-like ES3 string in es5 module
  assertDefined: assertDefined,
  ES5Object: Object,
  toObject: function(it){
    return $.ES5Object(assertDefined(it));
  },
  hide: hide,
  def: createDefiner(0),
  set: global.Symbol ? simpleSet : hide,
  mix: function(target, src){
    for(var key in src)hide(target, key, src[key]);
    return target;
  },
  each: [].forEach
});
if(typeof __e != 'undefined')__e = core;
if(typeof __g != 'undefined')__g = global;
},{"./$.fw":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.fw.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.keyof.js":[function(require,module,exports){
var $ = require('./$');
module.exports = function(object, el){
  var O      = $.toObject(object)
    , keys   = $.getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.own-keys.js":[function(require,module,exports){
var $            = require('./$')
  , assertObject = require('./$.assert').obj;
module.exports = function(it){
  assertObject(it);
  return $.getSymbols ? $.getNames(it).concat($.getSymbols(it)) : $.getNames(it);
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.partial.js":[function(require,module,exports){
'use strict';
var $      = require('./$')
  , invoke = require('./$.invoke')
  , assertFunction = require('./$.assert').fn;
module.exports = function(/* ...pargs */){
  var fn     = assertFunction(this)
    , length = arguments.length
    , pargs  = Array(length)
    , i      = 0
    , _      = $.path._
    , holder = false;
  while(length > i)if((pargs[i] = arguments[i++]) === _)holder = true;
  return function(/* ...args */){
    var that    = this
      , _length = arguments.length
      , j = 0, k = 0, args;
    if(!holder && !_length)return invoke(fn, pargs, that);
    args = pargs.slice();
    if(holder)for(;length > j; j++)if(args[j] === _)args[j] = arguments[k++];
    while(_length > k)args.push(arguments[k++]);
    return invoke(fn, args, that);
  };
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.invoke":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.invoke.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.replacer.js":[function(require,module,exports){
'use strict';
module.exports = function(regExp, replace, isStatic){
  var replacer = replace === Object(replace) ? function(part){
    return replace[part];
  } : replace;
  return function(it){
    return String(isStatic ? it : this).replace(regExp, replacer);
  };
};
},{}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.set-proto.js":[function(require,module,exports){
// Works with __proto__ only. Old v8 can't works with null proto objects.
/*eslint-disable no-proto */
var $      = require('./$')
  , assert = require('./$.assert');
module.exports = Object.setPrototypeOf || ('__proto__' in {} // eslint-disable-line
  ? function(buggy, set){
      try {
        set = require('./$.ctx')(Function.call, $.getDesc(Object.prototype, '__proto__').set, 2);
        set({}, []);
      } catch(e){ buggy = true; }
      return function(O, proto){
        assert.obj(O);
        assert(proto === null || $.isObject(proto), proto, ": can't set as prototype!");
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }()
  : undefined);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.species.js":[function(require,module,exports){
var $ = require('./$');
module.exports = function(C){
  if($.DESC && $.FW)$.setDesc(C, require('./$.wks')('species'), {
    configurable: true,
    get: $.that
  });
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.string-at.js":[function(require,module,exports){
'use strict';
// true  -> String#at
// false -> String#codePointAt
var $ = require('./$');
module.exports = function(TO_STRING){
  return function(pos){
    var s = String($.assertDefined(this))
      , i = $.toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l
      || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.task.js":[function(require,module,exports){
'use strict';
var $      = require('./$')
  , ctx    = require('./$.ctx')
  , cof    = require('./$.cof')
  , invoke = require('./$.invoke')
  , global             = $.g
  , isFunction         = $.isFunction
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , postMessage        = global.postMessage
  , addEventListener   = global.addEventListener
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
function run(){
  var id = +this;
  if($.has(queue, id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
}
function listner(event){
  run.call(event.data);
}
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!isFunction(setTask) || !isFunction(clearTask)){
  setTask = function(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(isFunction(fn) ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(cof(global.process) == 'process'){
    defer = function(id){
      global.process.nextTick(ctx(run, id, 1));
    };
  // Modern browsers, skip implementation for WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is object
  } else if(addEventListener && isFunction(postMessage) && !$.g.importScripts){
    defer = function(id){
      postMessage(id, '*');
    };
    addEventListener('message', listner, false);
  // WebWorkers
  } else if(isFunction(MessageChannel)){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listner;
    defer = ctx(port.postMessage, port, 1);
  // IE8-
  } else if($.g.document && ONREADYSTATECHANGE in document.createElement('script')){
    defer = function(id){
      $.html.appendChild(document.createElement('script'))[ONREADYSTATECHANGE] = function(){
        $.html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.invoke":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.invoke.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js":[function(require,module,exports){
var sid = 0;
function uid(key){
  return 'Symbol(' + key + ')_' + (++sid + Math.random()).toString(36);
}
uid.safe = require('./$').g.Symbol || uid;
module.exports = uid;
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js":[function(require,module,exports){
// 22.1.3.31 Array.prototype[@@unscopables]
var $           = require('./$')
  , UNSCOPABLES = require('./$.wks')('unscopables');
if($.FW && !(UNSCOPABLES in []))$.hide(Array.prototype, UNSCOPABLES, {});
module.exports = function(key){
  if($.FW)[][UNSCOPABLES][key] = true;
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js":[function(require,module,exports){
var global = require('./$').g
  , store  = {};
module.exports = function(name){
  return store[name] || (store[name] =
    global.Symbol && global.Symbol[name] || require('./$.uid').safe('Symbol.' + name));
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es5.js":[function(require,module,exports){
var $                = require('./$')
  , cof              = require('./$.cof')
  , $def             = require('./$.def')
  , invoke           = require('./$.invoke')
  , arrayMethod      = require('./$.array-methods')
  , IE_PROTO         = require('./$.uid').safe('__proto__')
  , assert           = require('./$.assert')
  , assertObject     = assert.obj
  , ObjectProto      = Object.prototype
  , A                = []
  , slice            = A.slice
  , indexOf          = A.indexOf
  , classof          = cof.classof
  , defineProperties = Object.defineProperties
  , has              = $.has
  , defineProperty   = $.setDesc
  , getOwnDescriptor = $.getDesc
  , isFunction       = $.isFunction
  , toObject         = $.toObject
  , toLength         = $.toLength
  , IE8_DOM_DEFINE   = false;

if(!$.DESC){
  try {
    IE8_DOM_DEFINE = defineProperty(document.createElement('div'), 'x',
      {get: function(){ return 8; }}
    ).x == 8;
  } catch(e){ /* empty */ }
  $.setDesc = function(O, P, Attributes){
    if(IE8_DOM_DEFINE)try {
      return defineProperty(O, P, Attributes);
    } catch(e){ /* empty */ }
    if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
    if('value' in Attributes)assertObject(O)[P] = Attributes.value;
    return O;
  };
  $.getDesc = function(O, P){
    if(IE8_DOM_DEFINE)try {
      return getOwnDescriptor(O, P);
    } catch(e){ /* empty */ }
    if(has(O, P))return $.desc(!ObjectProto.propertyIsEnumerable.call(O, P), O[P]);
  };
  defineProperties = function(O, Properties){
    assertObject(O);
    var keys   = $.getKeys(Properties)
      , length = keys.length
      , i = 0
      , P;
    while(length > i)$.setDesc(O, P = keys[i++], Properties[P]);
    return O;
  };
}
$def($def.S + $def.F * !$.DESC, 'Object', {
  // 19.1.2.6 / 15.2.3.3 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $.getDesc,
  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  defineProperty: $.setDesc,
  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  defineProperties: defineProperties
});

  // IE 8- don't enum bug keys
var keys1 = ('constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,' +
            'toLocaleString,toString,valueOf').split(',')
  // Additional keys for getOwnPropertyNames
  , keys2 = keys1.concat('length', 'prototype')
  , keysLen1 = keys1.length;

// Create object with `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = document.createElement('iframe')
    , i      = keysLen1
    , iframeDocument;
  iframe.style.display = 'none';
  $.html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script>');
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict.prototype[keys1[i]];
  return createDict();
};
function createGetKeys(names, length){
  return function(object){
    var O      = toObject(object)
      , i      = 0
      , result = []
      , key;
    for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while(length > i)if(has(O, key = names[i++])){
      ~indexOf.call(result, key) || result.push(key);
    }
    return result;
  };
}
function isPrimitive(it){ return !$.isObject(it); }
function Empty(){}
$def($def.S, 'Object', {
  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
  getPrototypeOf: $.getProto = $.getProto || function(O){
    O = Object(assert.def(O));
    if(has(O, IE_PROTO))return O[IE_PROTO];
    if(isFunction(O.constructor) && O instanceof O.constructor){
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  },
  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $.getNames = $.getNames || createGetKeys(keys2, keys2.length, true),
  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  create: $.create = $.create || function(O, /*?*/Properties){
    var result;
    if(O !== null){
      Empty.prototype = assertObject(O);
      result = new Empty();
      Empty.prototype = null;
      // add "__proto__" for Object.getPrototypeOf shim
      result[IE_PROTO] = O;
    } else result = createDict();
    return Properties === undefined ? result : defineProperties(result, Properties);
  },
  // 19.1.2.14 / 15.2.3.14 Object.keys(O)
  keys: $.getKeys = $.getKeys || createGetKeys(keys1, keysLen1, false),
  // 19.1.2.17 / 15.2.3.8 Object.seal(O)
  seal: $.it, // <- cap
  // 19.1.2.5 / 15.2.3.9 Object.freeze(O)
  freeze: $.it, // <- cap
  // 19.1.2.15 / 15.2.3.10 Object.preventExtensions(O)
  preventExtensions: $.it, // <- cap
  // 19.1.2.13 / 15.2.3.11 Object.isSealed(O)
  isSealed: isPrimitive, // <- cap
  // 19.1.2.12 / 15.2.3.12 Object.isFrozen(O)
  isFrozen: isPrimitive, // <- cap
  // 19.1.2.11 / 15.2.3.13 Object.isExtensible(O)
  isExtensible: $.isObject // <- cap
});

// 19.2.3.2 / 15.3.4.5 Function.prototype.bind(thisArg, args...)
$def($def.P, 'Function', {
  bind: function(that /*, args... */){
    var fn       = assert.fn(this)
      , partArgs = slice.call(arguments, 1);
    function bound(/* args... */){
      var args = partArgs.concat(slice.call(arguments));
      return invoke(fn, args, this instanceof bound ? $.create(fn.prototype) : that);
    }
    if(fn.prototype)bound.prototype = fn.prototype;
    return bound;
  }
});

// Fix for not array-like ES3 string
function arrayMethodFix(fn){
  return function(){
    return fn.apply($.ES5Object(this), arguments);
  };
}
if(!(0 in Object('z') && 'z'[0] == 'z')){
  $.ES5Object = function(it){
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
}
$def($def.P + $def.F * ($.ES5Object != Object), 'Array', {
  slice: arrayMethodFix(slice),
  join: arrayMethodFix(A.join)
});

// 22.1.2.2 / 15.4.3.2 Array.isArray(arg)
$def($def.S, 'Array', {
  isArray: function(arg){
    return cof(arg) == 'Array';
  }
});
function createArrayReduce(isRight){
  return function(callbackfn, memo){
    assert.fn(callbackfn);
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = isRight ? length - 1 : 0
      , i      = isRight ? -1 : 1;
    if(arguments.length < 2)for(;;){
      if(index in O){
        memo = O[index];
        index += i;
        break;
      }
      index += i;
      assert(isRight ? index >= 0 : length > index, 'Reduce of empty array with no initial value');
    }
    for(;isRight ? index >= 0 : length > index; index += i)if(index in O){
      memo = callbackfn(memo, O[index], index, this);
    }
    return memo;
  };
}
$def($def.P, 'Array', {
  // 22.1.3.10 / 15.4.4.18 Array.prototype.forEach(callbackfn [, thisArg])
  forEach: $.each = $.each || arrayMethod(0),
  // 22.1.3.15 / 15.4.4.19 Array.prototype.map(callbackfn [, thisArg])
  map: arrayMethod(1),
  // 22.1.3.7 / 15.4.4.20 Array.prototype.filter(callbackfn [, thisArg])
  filter: arrayMethod(2),
  // 22.1.3.23 / 15.4.4.17 Array.prototype.some(callbackfn [, thisArg])
  some: arrayMethod(3),
  // 22.1.3.5 / 15.4.4.16 Array.prototype.every(callbackfn [, thisArg])
  every: arrayMethod(4),
  // 22.1.3.18 / 15.4.4.21 Array.prototype.reduce(callbackfn [, initialValue])
  reduce: createArrayReduce(false),
  // 22.1.3.19 / 15.4.4.22 Array.prototype.reduceRight(callbackfn [, initialValue])
  reduceRight: createArrayReduce(true),
  // 22.1.3.11 / 15.4.4.14 Array.prototype.indexOf(searchElement [, fromIndex])
  indexOf: indexOf = indexOf || require('./$.array-includes')(false),
  // 22.1.3.14 / 15.4.4.15 Array.prototype.lastIndexOf(searchElement [, fromIndex])
  lastIndexOf: function(el, fromIndex /* = @[*-1] */){
    var O      = toObject(this)
      , length = toLength(O.length)
      , index  = length - 1;
    if(arguments.length > 1)index = Math.min(index, $.toInteger(fromIndex));
    if(index < 0)index = toLength(length + index);
    for(;index >= 0; index--)if(index in O)if(O[index] === el)return index;
    return -1;
  }
});

// 21.1.3.25 / 15.5.4.20 String.prototype.trim()
$def($def.P, 'String', {trim: require('./$.replacer')(/^\s*([\s\S]*\S)?\s*$/, '$1')});

// 20.3.3.1 / 15.9.4.4 Date.now()
$def($def.S, 'Date', {now: function(){
  return +new Date;
}});

function lz(num){
  return num > 9 ? num : '0' + num;
}
// 20.3.4.36 / 15.9.5.43 Date.prototype.toISOString()
$def($def.P, 'Date', {toISOString: function(){
  if(!isFinite(this))throw RangeError('Invalid time value');
  var d = this
    , y = d.getUTCFullYear()
    , m = d.getUTCMilliseconds()
    , s = y < 0 ? '-' : y > 9999 ? '+' : '';
  return s + ('00000' + Math.abs(y)).slice(s ? -6 : -4) +
    '-' + lz(d.getUTCMonth() + 1) + '-' + lz(d.getUTCDate()) +
    'T' + lz(d.getUTCHours()) + ':' + lz(d.getUTCMinutes()) +
    ':' + lz(d.getUTCSeconds()) + '.' + (m > 99 ? m : '0' + lz(m)) + 'Z';
}});

if(classof(function(){ return arguments; }()) == 'Object')cof.classof = function(it){
  var tag = classof(it);
  return tag == 'Object' && isFunction(it.callee) ? 'Arguments' : tag;
};
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.array-includes":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-includes.js","./$.array-methods":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-methods.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.invoke":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.invoke.js","./$.replacer":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.replacer.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.copy-within.js":[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.3 Array.prototype.copyWithin(target, start, end = this.length)
  copyWithin: function(target/* = 0 */, start /* = 0, end = @length */){
    var O     = Object($.assertDefined(this))
      , len   = $.toLength(O.length)
      , to    = toIndex(target, len)
      , from  = toIndex(start, len)
      , end   = arguments[2]
      , fin   = end === undefined ? len : toIndex(end, len)
      , count = Math.min(fin - from, len - to)
      , inc   = 1;
    if(from < to && to < from + count){
      inc  = -1;
      from = from + count - 1;
      to   = to   + count - 1;
    }
    while(count-- > 0){
      if(from in O)O[to] = O[from];
      else delete O[to];
      to   += inc;
      from += inc;
    } return O;
  }
});
require('./$.unscope')('copyWithin');
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.fill.js":[function(require,module,exports){
'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , toIndex = $.toIndex;
$def($def.P, 'Array', {
  // 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)
  fill: function(value /*, start = 0, end = @length */){
    var O      = Object($.assertDefined(this))
      , length = $.toLength(O.length)
      , index  = toIndex(arguments[1], length)
      , end    = arguments[2]
      , endPos = end === undefined ? length : toIndex(end, length);
    while(endPos > index)O[index++] = value;
    return O;
  }
});
require('./$.unscope')('fill');
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.find-index.js":[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'Array', {
  // 22.1.3.9 Array.prototype.findIndex(predicate, thisArg = undefined)
  findIndex: require('./$.array-methods')(6)
});
require('./$.unscope')('findIndex');
},{"./$.array-methods":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-methods.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.find.js":[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'Array', {
  // 22.1.3.8 Array.prototype.find(predicate, thisArg = undefined)
  find: require('./$.array-methods')(5)
});
require('./$.unscope')('find');
},{"./$.array-methods":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-methods.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.from.js":[function(require,module,exports){
var $     = require('./$')
  , ctx   = require('./$.ctx')
  , $def  = require('./$.def')
  , $iter = require('./$.iter')
  , stepCall = $iter.stepCall;
$def($def.S + $def.F * $iter.DANGER_CLOSING, 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = Object($.assertDefined(arrayLike))
      , mapfn   = arguments[1]
      , mapping = mapfn !== undefined
      , f       = mapping ? ctx(mapfn, arguments[2], 2) : undefined
      , index   = 0
      , length, result, step, iterator;
    if($iter.is(O)){
      iterator = $iter.get(O);
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result   = new (typeof this == 'function' ? this : Array);
      for(; !(step = iterator.next()).done; index++){
        result[index] = mapping ? stepCall(iterator, f, [step.value, index], true) : step.value;
      }
    } else {
      // strange IE quirks mode bug -> use typeof instead of isFunction
      result = new (typeof this == 'function' ? this : Array)(length = $.toLength(O.length));
      for(; length > index; index++){
        result[index] = mapping ? f(O[index], index) : O[index];
      }
    }
    result.length = index;
    return result;
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.iterator.js":[function(require,module,exports){
var $          = require('./$')
  , setUnscope = require('./$.unscope')
  , ITER       = require('./$.uid').safe('iter')
  , $iter      = require('./$.iter')
  , step       = $iter.step
  , Iterators  = $iter.Iterators;

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
$iter.std(Array, 'Array', function(iterated, kind){
  $.set(this, ITER, {o: $.toObject(iterated), i: 0, k: kind});
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , kind  = iter.k
    , index = iter.i++;
  if(!O || index >= O.length){
    iter.o = undefined;
    return step(1);
  }
  if(kind == 'key'  )return step(0, index);
  if(kind == 'value')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'value');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

setUnscope('keys');
setUnscope('values');
setUnscope('entries');
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.of.js":[function(require,module,exports){
var $def = require('./$.def');
$def($def.S, 'Array', {
  // 22.1.2.3 Array.of( ...items)
  of: function(/* ...args */){
    var index  = 0
      , length = arguments.length
      // strange IE quirks mode bug -> use typeof instead of isFunction
      , result = new (typeof this == 'function' ? this : Array)(length);
    while(length > index)result[index] = arguments[index++];
    result.length = length;
    return result;
  }
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.species.js":[function(require,module,exports){
require('./$.species')(Array);
},{"./$.species":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.species.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.function.name.js":[function(require,module,exports){
'use strict';
var $    = require('./$')
  , NAME = 'name'
  , setDesc = $.setDesc
  , FunctionProto = Function.prototype;
// 19.2.4.2 name
NAME in FunctionProto || $.FW && $.DESC && setDesc(FunctionProto, NAME, {
  configurable: true,
  get: function(){
    var match = String(this).match(/^\s*function ([^ (]*)/)
      , name  = match ? match[1] : '';
    $.has(this, NAME) || setDesc(this, NAME, $.desc(5, name));
    return name;
  },
  set: function(value){
    $.has(this, NAME) || setDesc(this, NAME, $.desc(0, value));
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.map.js":[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.1 Map Objects
require('./$.collection')('Map', {
  // 23.1.3.6 Map.prototype.get(key)
  get: function(key){
    var entry = strong.getEntry(this, key);
    return entry && entry.v;
  },
  // 23.1.3.9 Map.prototype.set(key, value)
  set: function(key, value){
    return strong.def(this, key === 0 ? 0 : key, value);
  }
}, strong, true);
},{"./$.collection":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection.js","./$.collection-strong":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-strong.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.math.js":[function(require,module,exports){
var Infinity = 1 / 0
  , $def  = require('./$.def')
  , E     = Math.E
  , pow   = Math.pow
  , abs   = Math.abs
  , exp   = Math.exp
  , log   = Math.log
  , sqrt  = Math.sqrt
  , ceil  = Math.ceil
  , floor = Math.floor
  , sign  = Math.sign || function(x){
      return (x = +x) == 0 || x != x ? x : x < 0 ? -1 : 1;
    };

// 20.2.2.5 Math.asinh(x)
function asinh(x){
  return !isFinite(x = +x) || x == 0 ? x : x < 0 ? -asinh(-x) : log(x + sqrt(x * x + 1));
}
// 20.2.2.14 Math.expm1(x)
function expm1(x){
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : exp(x) - 1;
}

$def($def.S, 'Math', {
  // 20.2.2.3 Math.acosh(x)
  acosh: function(x){
    return (x = +x) < 1 ? NaN : isFinite(x) ? log(x / E + sqrt(x + 1) * sqrt(x - 1) / E) + 1 : x;
  },
  // 20.2.2.5 Math.asinh(x)
  asinh: asinh,
  // 20.2.2.7 Math.atanh(x)
  atanh: function(x){
    return (x = +x) == 0 ? x : log((1 + x) / (1 - x)) / 2;
  },
  // 20.2.2.9 Math.cbrt(x)
  cbrt: function(x){
    return sign(x = +x) * pow(abs(x), 1 / 3);
  },
  // 20.2.2.11 Math.clz32(x)
  clz32: function(x){
    return (x >>>= 0) ? 32 - x.toString(2).length : 32;
  },
  // 20.2.2.12 Math.cosh(x)
  cosh: function(x){
    return (exp(x = +x) + exp(-x)) / 2;
  },
  // 20.2.2.14 Math.expm1(x)
  expm1: expm1,
  // 20.2.2.16 Math.fround(x)
  // TODO: fallback for IE9-
  fround: function(x){
    return new Float32Array([x])[0];
  },
  // 20.2.2.17 Math.hypot([value1[, value2[, … ]]])
  hypot: function(value1, value2){ // eslint-disable-line no-unused-vars
    var sum  = 0
      , len1 = arguments.length
      , len2 = len1
      , args = Array(len1)
      , larg = -Infinity
      , arg;
    while(len1--){
      arg = args[len1] = +arguments[len1];
      if(arg == Infinity || arg == -Infinity)return Infinity;
      if(arg > larg)larg = arg;
    }
    larg = arg || 1;
    while(len2--)sum += pow(args[len2] / larg, 2);
    return larg * sqrt(sum);
  },
  // 20.2.2.18 Math.imul(x, y)
  imul: function(x, y){
    var UInt16 = 0xffff
      , xn = +x
      , yn = +y
      , xl = UInt16 & xn
      , yl = UInt16 & yn;
    return 0 | xl * yl + ((UInt16 & xn >>> 16) * yl + xl * (UInt16 & yn >>> 16) << 16 >>> 0);
  },
  // 20.2.2.20 Math.log1p(x)
  log1p: function(x){
    return (x = +x) > -1e-8 && x < 1e-8 ? x - x * x / 2 : log(1 + x);
  },
  // 20.2.2.21 Math.log10(x)
  log10: function(x){
    return log(x) / Math.LN10;
  },
  // 20.2.2.22 Math.log2(x)
  log2: function(x){
    return log(x) / Math.LN2;
  },
  // 20.2.2.28 Math.sign(x)
  sign: sign,
  // 20.2.2.30 Math.sinh(x)
  sinh: function(x){
    return abs(x = +x) < 1 ? (expm1(x) - expm1(-x)) / 2 : (exp(x - 1) - exp(-x - 1)) * (E / 2);
  },
  // 20.2.2.33 Math.tanh(x)
  tanh: function(x){
    var a = expm1(x = +x)
      , b = expm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  },
  // 20.2.2.34 Math.trunc(x)
  trunc: function(it){
    return (it > 0 ? floor : ceil)(it);
  }
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.number.constructor.js":[function(require,module,exports){
'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , Number     = $.g[NUMBER]
  , Base       = Number
  , proto      = Number.prototype;
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
if($.FW && !(Number('0o1') && Number('0b1'))){
  Number = function Number(it){
    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call($.DESC ? $.getNames(Base) : (
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6 (in case, if modules with ES6 Number statics required before):
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
      'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ).split(','), function(key){
      if($.has(Base, key) && !$.has(Number, key)){
        $.setDesc(Number, key, $.getDesc(Base, key));
      }
    }
  );
  Number.prototype = proto;
  proto.constructor = Number;
  $.hide($.g, NUMBER, Number);
}
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.number.statics.js":[function(require,module,exports){
var $     = require('./$')
  , $def  = require('./$.def')
  , abs   = Math.abs
  , floor = Math.floor
  , MAX_SAFE_INTEGER = 0x1fffffffffffff; // pow(2, 53) - 1 == 9007199254740991;
function isInteger(it){
  return !$.isObject(it) && isFinite(it) && floor(it) === it;
}
$def($def.S, 'Number', {
  // 20.1.2.1 Number.EPSILON
  EPSILON: Math.pow(2, -52),
  // 20.1.2.2 Number.isFinite(number)
  isFinite: function(it){
    return typeof it == 'number' && isFinite(it);
  },
  // 20.1.2.3 Number.isInteger(number)
  isInteger: isInteger,
  // 20.1.2.4 Number.isNaN(number)
  isNaN: function(number){
    return number != number;
  },
  // 20.1.2.5 Number.isSafeInteger(number)
  isSafeInteger: function(number){
    return isInteger(number) && abs(number) <= MAX_SAFE_INTEGER;
  },
  // 20.1.2.6 Number.MAX_SAFE_INTEGER
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER,
  // 20.1.2.10 Number.MIN_SAFE_INTEGER
  MIN_SAFE_INTEGER: -MAX_SAFE_INTEGER,
  // 20.1.2.12 Number.parseFloat(string)
  parseFloat: parseFloat,
  // 20.1.2.13 Number.parseInt(string, radix)
  parseInt: parseInt
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.assign.js":[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $def = require('./$.def');
$def($def.S, 'Object', {assign: require('./$.assign')});
},{"./$.assign":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assign.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.is.js":[function(require,module,exports){
// 19.1.3.10 Object.is(value1, value2)
var $def = require('./$.def');
$def($def.S, 'Object', {
  is: function(x, y){
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  }
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.set-prototype-of.js":[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $def = require('./$.def');
$def($def.S, 'Object', {setPrototypeOf: require('./$.set-proto')});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.set-proto":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.set-proto.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.statics-accept-primitives.js":[function(require,module,exports){
var $        = require('./$')
  , $def     = require('./$.def')
  , isObject = $.isObject
  , toObject = $.toObject;
function wrapObjectMethod(METHOD, MODE){
  var fn  = ($.core.Object || {})[METHOD] || Object[METHOD]
    , f   = 0
    , o   = {};
  o[METHOD] = MODE == 1 ? function(it){
    return isObject(it) ? fn(it) : it;
  } : MODE == 2 ? function(it){
    return isObject(it) ? fn(it) : true;
  } : MODE == 3 ? function(it){
    return isObject(it) ? fn(it) : false;
  } : MODE == 4 ? function(it, key){
    return fn(toObject(it), key);
  } : MODE == 5 ? function(it){
    return fn(Object($.assertDefined(it)));
  } : function(it){
    return fn(toObject(it));
  };
  try {
    fn('z');
  } catch(e){
    f = 1;
  }
  $def($def.S + $def.F * f, 'Object', o);
}
wrapObjectMethod('freeze', 1);
wrapObjectMethod('seal', 1);
wrapObjectMethod('preventExtensions', 1);
wrapObjectMethod('isFrozen', 2);
wrapObjectMethod('isSealed', 2);
wrapObjectMethod('isExtensible', 3);
wrapObjectMethod('getOwnPropertyDescriptor', 4);
wrapObjectMethod('getPrototypeOf', 5);
wrapObjectMethod('keys');
wrapObjectMethod('getOwnPropertyNames');
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.to-string.js":[function(require,module,exports){
'use strict';
// 19.1.3.6 Object.prototype.toString()
var $   = require('./$')
  , cof = require('./$.cof')
  , tmp = {};
tmp[require('./$.wks')('toStringTag')] = 'z';
if($.FW && cof(tmp) != 'z')$.hide(Object.prototype, 'toString', function(){
  return '[object ' + cof.classof(this) + ']';
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.promise.js":[function(require,module,exports){
'use strict';
var $       = require('./$')
  , ctx     = require('./$.ctx')
  , cof     = require('./$.cof')
  , $def    = require('./$.def')
  , assert  = require('./$.assert')
  , $iter   = require('./$.iter')
  , SPECIES = require('./$.wks')('species')
  , RECORD  = require('./$.uid').safe('record')
  , forOf   = $iter.forOf
  , PROMISE = 'Promise'
  , global  = $.g
  , process = global.process
  , asap    = process && process.nextTick || require('./$.task').set
  , Promise = global[PROMISE]
  , Base    = Promise
  , isFunction     = $.isFunction
  , isObject       = $.isObject
  , assertFunction = assert.fn
  , assertObject   = assert.obj
  , test;
function getConstructor(C){
  var S = assertObject(C)[SPECIES];
  return S != undefined ? S : C;
}
isFunction(Promise) && isFunction(Promise.resolve)
&& Promise.resolve(test = new Promise(function(){})) == test
|| function(){
  function isThenable(it){
    var then;
    if(isObject(it))then = it.then;
    return isFunction(then) ? then : false;
  }
  function handledRejectionOrHasOnRejected(promise){
    var record = promise[RECORD]
      , chain  = record.c
      , i      = 0
      , react;
    if(record.h)return true;
    while(chain.length > i){
      react = chain[i++];
      if(react.fail || handledRejectionOrHasOnRejected(react.P))return true;
    }
  }
  function notify(record, isReject){
    var chain = record.c;
    if(isReject || chain.length)asap(function(){
      var promise = record.p
        , value   = record.v
        , ok      = record.s == 1
        , i       = 0;
      if(isReject && !handledRejectionOrHasOnRejected(promise)){
        setTimeout(function(){
          if(!handledRejectionOrHasOnRejected(promise)){
            if(cof(process) == 'process'){
              process.emit('unhandledRejection', value, promise);
            } else if(global.console && isFunction(console.error)){
              console.error('Unhandled promise rejection', value);
            }
          }
        }, 1e3);
      } else while(chain.length > i)!function(react){
        var cb = ok ? react.ok : react.fail
          , ret, then;
        try {
          if(cb){
            if(!ok)record.h = true;
            ret = cb === true ? value : cb(value);
            if(ret === react.P){
              react.rej(TypeError(PROMISE + '-chain cycle'));
            } else if(then = isThenable(ret)){
              then.call(ret, react.res, react.rej);
            } else react.res(ret);
          } else react.rej(value);
        } catch(err){
          react.rej(err);
        }
      }(chain[i++]);
      chain.length = 0;
    });
  }
  function reject(value){
    var record = this;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    record.v = value;
    record.s = 2;
    notify(record, true);
  }
  function resolve(value){
    var record = this
      , then, wrapper;
    if(record.d)return;
    record.d = true;
    record = record.r || record; // unwrap
    try {
      if(then = isThenable(value)){
        wrapper = {r: record, d: false}; // wrap
        then.call(value, ctx(resolve, wrapper, 1), ctx(reject, wrapper, 1));
      } else {
        record.v = value;
        record.s = 1;
        notify(record);
      }
    } catch(err){
      reject.call(wrapper || {r: record, d: false}, err); // wrap
    }
  }
  // 25.4.3.1 Promise(executor)
  Promise = function(executor){
    assertFunction(executor);
    var record = {
      p: assert.inst(this, Promise, PROMISE), // <- promise
      c: [],                                  // <- chain
      s: 0,                                   // <- state
      d: false,                               // <- done
      v: undefined,                           // <- value
      h: false                                // <- handled rejection
    };
    $.hide(this, RECORD, record);
    try {
      executor(ctx(resolve, record, 1), ctx(reject, record, 1));
    } catch(err){
      reject.call(record, err);
    }
  };
  $.mix(Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function(onFulfilled, onRejected){
      var S = assertObject(assertObject(this).constructor)[SPECIES];
      var react = {
        ok:   isFunction(onFulfilled) ? onFulfilled : true,
        fail: isFunction(onRejected)  ? onRejected  : false
      };
      var P = react.P = new (S != undefined ? S : Promise)(function(res, rej){
        react.res = assertFunction(res);
        react.rej = assertFunction(rej);
      });
      var record = this[RECORD];
      record.c.push(react);
      record.s && notify(record);
      return P;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
}();
$def($def.G + $def.W + $def.F * (Promise != Base), {Promise: Promise});
$def($def.S, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function(r){
    return new (getConstructor(this))(function(res, rej){
      rej(r);
    });
  },
  // 25.4.4.6 Promise.resolve(x)
  resolve: function(x){
    return isObject(x) && RECORD in x && $.getProto(x) === this.prototype
      ? x : new (getConstructor(this))(function(res){
        res(x);
      });
  }
});
$def($def.S + $def.F * ($iter.fail(function(iter){
  Promise.all(iter)['catch'](function(){});
}) || $iter.DANGER_CLOSING), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function(iterable){
    var C      = getConstructor(this)
      , values = [];
    return new C(function(resolve, reject){
      forOf(iterable, false, values.push, values);
      var remaining = values.length
        , results   = Array(remaining);
      if(remaining)$.each.call(values, function(promise, index){
        C.resolve(promise).then(function(value){
          results[index] = value;
          --remaining || resolve(results);
        }, reject);
      });
      else resolve(results);
    });
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function(iterable){
    var C = getConstructor(this);
    return new C(function(resolve, reject){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(resolve, reject);
      });
    });
  }
});
cof.set(Promise, PROMISE);
require('./$.species')(Promise);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.species":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.species.js","./$.task":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.task.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.reflect.js":[function(require,module,exports){
var $         = require('./$')
  , $def      = require('./$.def')
  , setProto  = require('./$.set-proto')
  , $iter     = require('./$.iter')
  , ITER      = require('./$.uid').safe('iter')
  , step      = $iter.step
  , assert    = require('./$.assert')
  , isObject  = $.isObject
  , getDesc   = $.getDesc
  , setDesc   = $.setDesc
  , getProto  = $.getProto
  , apply     = Function.apply
  , assertObject = assert.obj
  , isExtensible = Object.isExtensible || $.it;
function Enumerate(iterated){
  var keys = [], key;
  for(key in iterated)keys.push(key);
  $.set(this, ITER, {o: iterated, a: keys, i: 0});
}
$iter.create(Enumerate, 'Object', function(){
  var iter = this[ITER]
    , keys = iter.a
    , key;
  do {
    if(iter.i >= keys.length)return step(1);
  } while(!((key = keys[iter.i++]) in iter.o));
  return step(0, key);
});

function wrap(fn){
  return function(it){
    assertObject(it);
    try {
      fn.apply(undefined, arguments);
      return true;
    } catch(e){
      return false;
    }
  };
}

function reflectGet(target, propertyKey/*, receiver*/){
  var receiver = arguments.length < 3 ? target : arguments[2]
    , desc = getDesc(assertObject(target), propertyKey), proto;
  if(desc)return $.has(desc, 'value')
    ? desc.value
    : desc.get === undefined
      ? undefined
      : desc.get.call(receiver);
  return isObject(proto = getProto(target))
    ? reflectGet(proto, propertyKey, receiver)
    : undefined;
}
function reflectSet(target, propertyKey, V/*, receiver*/){
  var receiver = arguments.length < 4 ? target : arguments[3]
    , ownDesc  = getDesc(assertObject(target), propertyKey)
    , existingDescriptor, proto;
  if(!ownDesc){
    if(isObject(proto = getProto(target))){
      return reflectSet(proto, propertyKey, V, receiver);
    }
    ownDesc = $.desc(0);
  }
  if($.has(ownDesc, 'value')){
    if(ownDesc.writable === false || !isObject(receiver))return false;
    existingDescriptor = getDesc(receiver, propertyKey) || $.desc(0);
    existingDescriptor.value = V;
    setDesc(receiver, propertyKey, existingDescriptor);
    return true;
  }
  return ownDesc.set === undefined ? false : (ownDesc.set.call(receiver, V), true);
}

var reflect = {
  // 26.1.1 Reflect.apply(target, thisArgument, argumentsList)
  apply: require('./$.ctx')(Function.call, apply, 3),
  // 26.1.2 Reflect.construct(target, argumentsList [, newTarget])
  construct: function(target, argumentsList /*, newTarget*/){
    var proto    = assert.fn(arguments.length < 3 ? target : arguments[2]).prototype
      , instance = $.create(isObject(proto) ? proto : Object.prototype)
      , result   = apply.call(target, instance, argumentsList);
    return isObject(result) ? result : instance;
  },
  // 26.1.3 Reflect.defineProperty(target, propertyKey, attributes)
  defineProperty: wrap(setDesc),
  // 26.1.4 Reflect.deleteProperty(target, propertyKey)
  deleteProperty: function(target, propertyKey){
    var desc = getDesc(assertObject(target), propertyKey);
    return desc && !desc.configurable ? false : delete target[propertyKey];
  },
  // 26.1.5 Reflect.enumerate(target)
  enumerate: function(target){
    return new Enumerate(assertObject(target));
  },
  // 26.1.6 Reflect.get(target, propertyKey [, receiver])
  get: reflectGet,
  // 26.1.7 Reflect.getOwnPropertyDescriptor(target, propertyKey)
  getOwnPropertyDescriptor: function(target, propertyKey){
    return getDesc(assertObject(target), propertyKey);
  },
  // 26.1.8 Reflect.getPrototypeOf(target)
  getPrototypeOf: function(target){
    return getProto(assertObject(target));
  },
  // 26.1.9 Reflect.has(target, propertyKey)
  has: function(target, propertyKey){
    return propertyKey in target;
  },
  // 26.1.10 Reflect.isExtensible(target)
  isExtensible: function(target){
    return !!isExtensible(assertObject(target));
  },
  // 26.1.11 Reflect.ownKeys(target)
  ownKeys: require('./$.own-keys'),
  // 26.1.12 Reflect.preventExtensions(target)
  preventExtensions: wrap(Object.preventExtensions || $.it),
  // 26.1.13 Reflect.set(target, propertyKey, V [, receiver])
  set: reflectSet
};
// 26.1.14 Reflect.setPrototypeOf(target, proto)
if(setProto)reflect.setPrototypeOf = function(target, proto){
  setProto(assertObject(target), proto);
  return true;
};

$def($def.G, {Reflect: {}});
$def($def.S, 'Reflect', reflect);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.assert":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.assert.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.own-keys":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.own-keys.js","./$.set-proto":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.set-proto.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.regexp.js":[function(require,module,exports){
var $      = require('./$')
  , cof    = require('./$.cof')
  , RegExp = $.g.RegExp
  , Base   = RegExp
  , proto  = RegExp.prototype;
if($.FW && $.DESC){
  // RegExp allows a regex with flags as the pattern
  if(!function(){try{ return RegExp(/a/g, 'i') == '/a/i'; }catch(e){ /* empty */ }}()){
    RegExp = function RegExp(pattern, flags){
      return new Base(cof(pattern) == 'RegExp' && flags !== undefined
        ? pattern.source : pattern, flags);
    };
    $.each.call($.getNames(Base), function(key){
      key in RegExp || $.setDesc(RegExp, key, {
        configurable: true,
        get: function(){ return Base[key]; },
        set: function(it){ Base[key] = it; }
      });
    });
    proto.constructor = RegExp;
    RegExp.prototype = proto;
    $.hide($.g, 'RegExp', RegExp);
  }
  // 21.2.5.3 get RegExp.prototype.flags()
  if(/./g.flags != 'g')$.setDesc(proto, 'flags', {
    configurable: true,
    get: require('./$.replacer')(/^.*\/(\w*)$/, '$1')
  });
}
require('./$.species')(RegExp);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.replacer":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.replacer.js","./$.species":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.species.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.set.js":[function(require,module,exports){
'use strict';
var strong = require('./$.collection-strong');

// 23.2 Set Objects
require('./$.collection')('Set', {
  // 23.2.3.1 Set.prototype.add(value)
  add: function(value){
    return strong.def(this, value = value === 0 ? 0 : value, value);
  }
}, strong);
},{"./$.collection":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection.js","./$.collection-strong":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-strong.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.code-point-at.js":[function(require,module,exports){
var $def = require('./$.def');
$def($def.P, 'String', {
  // 21.1.3.3 String.prototype.codePointAt(pos)
  codePointAt: require('./$.string-at')(false)
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.string-at":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.string-at.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.ends-with.js":[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def')
  , toLength = $.toLength;

$def($def.P, 'String', {
  // 21.1.3.6 String.prototype.endsWith(searchString [, endPosition])
  endsWith: function(searchString /*, endPosition = @length */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that = String($.assertDefined(this))
      , endPosition = arguments[1]
      , len = toLength(that.length)
      , end = endPosition === undefined ? len : Math.min(toLength(endPosition), len);
    searchString += '';
    return that.slice(end - searchString.length, end) === searchString;
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.from-code-point.js":[function(require,module,exports){
var $def    = require('./$.def')
  , toIndex = require('./$').toIndex
  , fromCharCode = String.fromCharCode;

$def($def.S, 'String', {
  // 21.1.2.2 String.fromCodePoint(...codePoints)
  fromCodePoint: function(x){ // eslint-disable-line no-unused-vars
    var res = []
      , len = arguments.length
      , i   = 0
      , code;
    while(len > i){
      code = +arguments[i++];
      if(toIndex(code, 0x10ffff) !== code)throw RangeError(code + ' is not a valid code point');
      res.push(code < 0x10000
        ? fromCharCode(code)
        : fromCharCode(((code -= 0x10000) >> 10) + 0xd800, code % 0x400 + 0xdc00)
      );
    } return res.join('');
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.includes.js":[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.7 String.prototype.includes(searchString, position = 0)
  includes: function(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    return !!~String($.assertDefined(this)).indexOf(searchString, arguments[1]);
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.iterator.js":[function(require,module,exports){
var set   = require('./$').set
  , at    = require('./$.string-at')(true)
  , ITER  = require('./$.uid').safe('iter')
  , $iter = require('./$.iter')
  , step  = $iter.step;

// 21.1.3.27 String.prototype[@@iterator]()
$iter.std(String, 'String', function(iterated){
  set(this, ITER, {o: String(iterated), i: 0});
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var iter  = this[ITER]
    , O     = iter.o
    , index = iter.i
    , point;
  if(index >= O.length)return step(1);
  point = at.call(O, index);
  iter.i += point.length;
  return step(0, point);
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.string-at":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.string-at.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.raw.js":[function(require,module,exports){
var $    = require('./$')
  , $def = require('./$.def');

$def($def.S, 'String', {
  // 21.1.2.4 String.raw(callSite, ...substitutions)
  raw: function(callSite){
    var raw = $.toObject(callSite.raw)
      , len = $.toLength(raw.length)
      , sln = arguments.length
      , res = []
      , i   = 0;
    while(len > i){
      res.push(String(raw[i++]));
      if(i < sln)res.push(String(arguments[i]));
    } return res.join('');
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.repeat.js":[function(require,module,exports){
'use strict';
var $    = require('./$')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.13 String.prototype.repeat(count)
  repeat: function(count){
    var str = String($.assertDefined(this))
      , res = ''
      , n   = $.toInteger(count);
    if(n < 0 || n == Infinity)throw RangeError("Count can't be negative");
    for(;n > 0; (n >>>= 1) && (str += str))if(n & 1)res += str;
    return res;
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.starts-with.js":[function(require,module,exports){
'use strict';
var $    = require('./$')
  , cof  = require('./$.cof')
  , $def = require('./$.def');

$def($def.P, 'String', {
  // 21.1.3.18 String.prototype.startsWith(searchString [, position ])
  startsWith: function(searchString /*, position = 0 */){
    if(cof(searchString) == 'RegExp')throw TypeError();
    var that  = String($.assertDefined(this))
      , index = $.toLength(Math.min(arguments[1], that.length));
    searchString += '';
    return that.slice(index, index + searchString.length) === searchString;
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.symbol.js":[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var $        = require('./$')
  , setTag   = require('./$.cof').set
  , uid      = require('./$.uid')
  , $def     = require('./$.def')
  , keyOf    = require('./$.keyof')
  , has      = $.has
  , hide     = $.hide
  , getNames = $.getNames
  , toObject = $.toObject
  , Symbol   = $.g.Symbol
  , Base     = Symbol
  , setter   = false
  , TAG      = uid.safe('tag')
  , SymbolRegistry = {}
  , AllSymbols     = {};

function wrap(tag){
  var sym = AllSymbols[tag] = $.set($.create(Symbol.prototype), TAG, tag);
  $.DESC && setter && $.setDesc(Object.prototype, tag, {
    configurable: true,
    set: function(value){
      hide(this, tag, value);
    }
  });
  return sym;
}

// 19.4.1.1 Symbol([description])
if(!$.isFunction(Symbol)){
  Symbol = function(description){
    if(this instanceof Symbol)throw TypeError('Symbol is not a constructor');
    return wrap(uid(description));
  };
  hide(Symbol.prototype, 'toString', function(){
    return this[TAG];
  });
}
$def($def.G + $def.W, {Symbol: Symbol});

var symbolStatics = {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function(key){
    return keyOf(SymbolRegistry, key);
  },
  pure: uid.safe,
  set: $.set,
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
};
// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
$.each.call((
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,' +
    'species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), function(it){
    var sym = require('./$.wks')(it);
    symbolStatics[it] = Symbol === Base ? sym : wrap(sym);
  }
);

setter = true;

$def($def.S, 'Symbol', symbolStatics);

$def($def.S + $def.F * (Symbol != Base), 'Object', {
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) || result.push(key);
    return result;
  },
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: function(it){
    var names = getNames(toObject(it)), result = [], key, i = 0;
    while(names.length > i)has(AllSymbols, key = names[i++]) && result.push(AllSymbols[key]);
    return result;
  }
});

setTag(Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setTag($.g.JSON, 'JSON', true);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.cof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.cof.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.keyof":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.keyof.js","./$.uid":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.uid.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.weak-map.js":[function(require,module,exports){
'use strict';
var $         = require('./$')
  , weak      = require('./$.collection-weak')
  , leakStore = weak.leakStore
  , ID        = weak.ID
  , WEAK      = weak.WEAK
  , has       = $.has
  , isObject  = $.isObject
  , isFrozen  = Object.isFrozen || $.core.Object.isFrozen
  , tmp       = {};

// 23.3 WeakMap Objects
var WeakMap = require('./$.collection')('WeakMap', {
  // 23.3.3.3 WeakMap.prototype.get(key)
  get: function(key){
    if(isObject(key)){
      if(isFrozen(key))return leakStore(this).get(key);
      if(has(key, WEAK))return key[WEAK][this[ID]];
    }
  },
  // 23.3.3.5 WeakMap.prototype.set(key, value)
  set: function(key, value){
    return weak.def(this, key, value);
  }
}, weak, true, true);

// IE11 WeakMap frozen keys fix
if($.FW && new WeakMap().set((Object.freeze || Object)(tmp), 7).get(tmp) != 7){
  $.each.call(['delete', 'has', 'get', 'set'], function(key){
    var method = WeakMap.prototype[key];
    WeakMap.prototype[key] = function(a, b){
      // store frozen objects on leaky map
      if(isObject(a) && isFrozen(a)){
        var result = leakStore(this)[key](a, b);
        return key == 'set' ? this : result;
      // store all the rest on native weakmap
      } return method.call(this, a, b);
    };
  });
}
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.collection":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection.js","./$.collection-weak":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-weak.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.weak-set.js":[function(require,module,exports){
'use strict';
var weak = require('./$.collection-weak');

// 23.4 WeakSet Objects
require('./$.collection')('WeakSet', {
  // 23.4.3.1 WeakSet.prototype.add(value)
  add: function(value){
    return weak.def(this, value, true);
  }
}, weak, false, true);
},{"./$.collection":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection.js","./$.collection-weak":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.collection-weak.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.array.includes.js":[function(require,module,exports){
// https://github.com/domenic/Array.prototype.includes
var $def = require('./$.def');
$def($def.P, 'Array', {
  includes: require('./$.array-includes')(true)
});
require('./$.unscope')('includes');
},{"./$.array-includes":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.array-includes.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.unscope":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.unscope.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.object.get-own-property-descriptors.js":[function(require,module,exports){
// https://gist.github.com/WebReflection/9353781
var $       = require('./$')
  , $def    = require('./$.def')
  , ownKeys = require('./$.own-keys');

$def($def.S, 'Object', {
  getOwnPropertyDescriptors: function(object){
    var O      = $.toObject(object)
      , result = {};
    $.each.call(ownKeys(O), function(key){
      $.setDesc(result, key, $.desc(0, $.getDesc(O, key)));
    });
    return result;
  }
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.own-keys":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.own-keys.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.object.to-array.js":[function(require,module,exports){
// http://goo.gl/XkBrjD
var $    = require('./$')
  , $def = require('./$.def');
function createObjectToArray(isEntries){
  return function(object){
    var O      = $.toObject(object)
      , keys   = $.getKeys(object)
      , length = keys.length
      , i      = 0
      , result = Array(length)
      , key;
    if(isEntries)while(length > i)result[i] = [key = keys[i++], O[key]];
    else while(length > i)result[i] = O[keys[i++]];
    return result;
  };
}
$def($def.S, 'Object', {
  values:  createObjectToArray(false),
  entries: createObjectToArray(true)
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.regexp.escape.js":[function(require,module,exports){
// https://gist.github.com/kangax/9698100
var $def = require('./$.def');
$def($def.S, 'RegExp', {
  escape: require('./$.replacer')(/([\\\-[\]{}()*+?.,^$|])/g, '\\$1', true)
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.replacer":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.replacer.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.string.at.js":[function(require,module,exports){
// https://github.com/mathiasbynens/String.prototype.at
var $def = require('./$.def');
$def($def.P, 'String', {
  at: require('./$.string-at')(true)
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.string-at":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.string-at.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/js.array.statics.js":[function(require,module,exports){
// JavaScript 1.6 / Strawman array statics shim
var $       = require('./$')
  , $def    = require('./$.def')
  , core    = $.core
  , statics = {};
function setStatics(keys, length){
  $.each.call(keys.split(','), function(key){
    if(length == undefined && key in core.Array)statics[key] = core.Array[key];
    else if(key in [])statics[key] = require('./$.ctx')(Function.call, [][key], length);
  });
}
setStatics('pop,reverse,shift,keys,values,entries', 1);
setStatics('indexOf,every,some,forEach,map,filter,find,findIndex,includes', 3);
setStatics('join,slice,concat,push,splice,unshift,sort,lastIndexOf,' +
           'reduce,reduceRight,copyWithin,fill,turn');
$def($def.S, 'Array', statics);
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.ctx":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.ctx.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.dom.iterable.js":[function(require,module,exports){
require('./es6.array.iterator');
var $         = require('./$')
  , Iterators = require('./$.iter').Iterators
  , ITERATOR  = require('./$.wks')('iterator')
  , NodeList  = $.g.NodeList;
if($.FW && NodeList && !(ITERATOR in NodeList.prototype)){
  $.hide(NodeList.prototype, ITERATOR, Iterators.Array);
}
Iterators.NodeList = Iterators.Array;
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.iter":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.iter.js","./$.wks":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.wks.js","./es6.array.iterator":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.iterator.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.immediate.js":[function(require,module,exports){
var $def  = require('./$.def')
  , $task = require('./$.task');
$def($def.G + $def.B, {
  setImmediate:   $task.set,
  clearImmediate: $task.clear
});
},{"./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.task":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.task.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.timers.js":[function(require,module,exports){
// ie9- setTimeout & setInterval additional parameters fix
var $       = require('./$')
  , $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , partial = require('./$.partial')
  , MSIE    = !!$.g.navigator && /MSIE .\./.test(navigator.userAgent); // <- dirty ie9- check
function wrap(set){
  return MSIE ? function(fn, time /*, ...args */){
    return set(invoke(
      partial,
      [].slice.call(arguments, 2),
      $.isFunction(fn) ? fn : Function(fn)
    ), time);
  } : set;
}
$def($def.G + $def.B + $def.F * MSIE, {
  setTimeout:  wrap($.g.setTimeout),
  setInterval: wrap($.g.setInterval)
});
},{"./$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./$.def":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.def.js","./$.invoke":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.invoke.js","./$.partial":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.partial.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/shim.js":[function(require,module,exports){
require('./modules/es5');
require('./modules/es6.symbol');
require('./modules/es6.object.assign');
require('./modules/es6.object.is');
require('./modules/es6.object.set-prototype-of');
require('./modules/es6.object.to-string');
require('./modules/es6.object.statics-accept-primitives');
require('./modules/es6.function.name');
require('./modules/es6.number.constructor');
require('./modules/es6.number.statics');
require('./modules/es6.math');
require('./modules/es6.string.from-code-point');
require('./modules/es6.string.raw');
require('./modules/es6.string.iterator');
require('./modules/es6.string.code-point-at');
require('./modules/es6.string.ends-with');
require('./modules/es6.string.includes');
require('./modules/es6.string.repeat');
require('./modules/es6.string.starts-with');
require('./modules/es6.array.from');
require('./modules/es6.array.of');
require('./modules/es6.array.iterator');
require('./modules/es6.array.species');
require('./modules/es6.array.copy-within');
require('./modules/es6.array.fill');
require('./modules/es6.array.find');
require('./modules/es6.array.find-index');
require('./modules/es6.regexp');
require('./modules/es6.promise');
require('./modules/es6.map');
require('./modules/es6.set');
require('./modules/es6.weak-map');
require('./modules/es6.weak-set');
require('./modules/es6.reflect');
require('./modules/es7.array.includes');
require('./modules/es7.string.at');
require('./modules/es7.regexp.escape');
require('./modules/es7.object.get-own-property-descriptors');
require('./modules/es7.object.to-array');
require('./modules/js.array.statics');
require('./modules/web.timers');
require('./modules/web.immediate');
require('./modules/web.dom.iterable');
module.exports = require('./modules/$').core;
},{"./modules/$":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/$.js","./modules/es5":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es5.js","./modules/es6.array.copy-within":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.copy-within.js","./modules/es6.array.fill":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.fill.js","./modules/es6.array.find":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.find.js","./modules/es6.array.find-index":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.find-index.js","./modules/es6.array.from":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.from.js","./modules/es6.array.iterator":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.iterator.js","./modules/es6.array.of":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.of.js","./modules/es6.array.species":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.array.species.js","./modules/es6.function.name":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.function.name.js","./modules/es6.map":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.map.js","./modules/es6.math":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.math.js","./modules/es6.number.constructor":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.number.constructor.js","./modules/es6.number.statics":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.number.statics.js","./modules/es6.object.assign":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.assign.js","./modules/es6.object.is":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.is.js","./modules/es6.object.set-prototype-of":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.set-prototype-of.js","./modules/es6.object.statics-accept-primitives":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.statics-accept-primitives.js","./modules/es6.object.to-string":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.object.to-string.js","./modules/es6.promise":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.promise.js","./modules/es6.reflect":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.reflect.js","./modules/es6.regexp":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.regexp.js","./modules/es6.set":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.set.js","./modules/es6.string.code-point-at":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.code-point-at.js","./modules/es6.string.ends-with":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.ends-with.js","./modules/es6.string.from-code-point":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.from-code-point.js","./modules/es6.string.includes":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.includes.js","./modules/es6.string.iterator":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.iterator.js","./modules/es6.string.raw":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.raw.js","./modules/es6.string.repeat":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.repeat.js","./modules/es6.string.starts-with":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.string.starts-with.js","./modules/es6.symbol":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.symbol.js","./modules/es6.weak-map":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.weak-map.js","./modules/es6.weak-set":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es6.weak-set.js","./modules/es7.array.includes":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.array.includes.js","./modules/es7.object.get-own-property-descriptors":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.object.get-own-property-descriptors.js","./modules/es7.object.to-array":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.object.to-array.js","./modules/es7.regexp.escape":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.regexp.escape.js","./modules/es7.string.at":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/es7.string.at.js","./modules/js.array.statics":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/js.array.statics.js","./modules/web.dom.iterable":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.dom.iterable.js","./modules/web.immediate":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.immediate.js","./modules/web.timers":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/core-js/modules/web.timers.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/node_modules/regenerator-babel/runtime.js":[function(require,module,exports){
(function (global){
/**
 * Copyright (c) 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
 * additional grant of patent rights can be found in the PATENTS file in
 * the same directory.
 */

!(function(global) {
  "use strict";

  var hasOwn = Object.prototype.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var iteratorSymbol =
    typeof Symbol === "function" && Symbol.iterator || "@@iterator";

  var inModule = typeof module === "object";
  var runtime = global.regeneratorRuntime;
  if (runtime) {
    if (inModule) {
      // If regeneratorRuntime is defined globally and we're in a module,
      // make the exports object identical to regeneratorRuntime.
      module.exports = runtime;
    }
    // Don't bother evaluating the rest of this file if the runtime was
    // already defined globally.
    return;
  }

  // Define the runtime globally (as expected by generated code) as either
  // module.exports (if we're in a module) or a new, empty object.
  runtime = global.regeneratorRuntime = inModule ? module.exports : {};

  function wrap(innerFn, outerFn, self, tryLocsList) {
    return new Generator(innerFn, outerFn, self || null, tryLocsList || []);
  }
  runtime.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunction.displayName = "GeneratorFunction";

  runtime.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  runtime.mark = function(genFun) {
    genFun.__proto__ = GeneratorFunctionPrototype;
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
    return new Promise(function(resolve, reject) {
      var generator = wrap(innerFn, outerFn, self, tryLocsList);
      var callNext = step.bind(generator.next);
      var callThrow = step.bind(generator["throw"]);

      function step(arg) {
        var record = tryCatch(this, null, arg);
        if (record.type === "throw") {
          reject(record.arg);
          return;
        }

        var info = record.arg;
        if (info.done) {
          resolve(info.value);
        } else {
          Promise.resolve(info.value).then(callNext, callThrow);
        }
      }

      callNext();
    });
  };

  function Generator(innerFn, outerFn, self, tryLocsList) {
    var generator = outerFn ? Object.create(outerFn.prototype) : this;
    var context = new Context(tryLocsList);
    var state = GenStateSuspendedStart;

    function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var record = tryCatch(
            delegate.iterator[method],
            delegate.iterator,
            arg
          );

          if (record.type === "throw") {
            context.delegate = null;

            // Like returning generator.throw(uncaught), but without the
            // overhead of an extra function call.
            method = "throw";
            arg = record.arg;

            continue;
          }

          // Delegate generator ran and handled its own exceptions so
          // regardless of what the method was, we continue as if it is
          // "next" with an undefined arg.
          method = "next";
          arg = undefined;

          var info = record.arg;
          if (info.done) {
            context[delegate.resultName] = info.value;
            context.next = delegate.nextLoc;
          } else {
            state = GenStateSuspendedYield;
            return info;
          }

          context.delegate = null;
        }

        if (method === "next") {
          if (state === GenStateSuspendedStart &&
              typeof arg !== "undefined") {
            // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
            throw new TypeError(
              "attempt to send " + JSON.stringify(arg) + " to newborn generator"
            );
          }

          if (state === GenStateSuspendedYield) {
            context.sent = arg;
          } else {
            delete context.sent;
          }

        } else if (method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw arg;
          }

          if (context.dispatchException(arg)) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            method = "next";
            arg = undefined;
          }

        } else if (method === "return") {
          context.abrupt("return", arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          var info = {
            value: record.arg,
            done: context.done
          };

          if (record.arg === ContinueSentinel) {
            if (context.delegate && method === "next") {
              // Deliberately forget the last sent value so that we don't
              // accidentally pass it on to the delegate.
              arg = undefined;
            }
          } else {
            return info;
          }

        } else if (record.type === "throw") {
          state = GenStateCompleted;

          if (method === "next") {
            context.dispatchException(record.arg);
          } else {
            arg = record.arg;
          }
        }
      }
    }

    generator.next = invoke.bind(generator, "next");
    generator["throw"] = invoke.bind(generator, "throw");
    generator["return"] = invoke.bind(generator, "return");

    return generator;
  }

  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset();
  }

  runtime.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  runtime.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function() {
      this.prev = 0;
      this.next = 0;
      this.sent = undefined;
      this.done = false;
      this.delegate = null;

      this.tryEntries.forEach(resetTryEntry);

      // Pre-initialize at least 20 temporary variables to enable hidden
      // class optimizations for simple generators.
      for (var tempIndex = 0, tempName;
           hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20;
           ++tempIndex) {
        this[tempName] = null;
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;
        return !!caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg < finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.next = finallyEntry.finallyLoc;
      } else {
        this.complete(record);
      }

      return ContinueSentinel;
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = record.arg;
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          return this.complete(entry.completion, entry.afterLoc);
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      return ContinueSentinel;
    }
  };
})(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global :
  typeof window === "object" ? window : this
);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/polyfill.js":[function(require,module,exports){
module.exports = require("./lib/babel/polyfill");

},{"./lib/babel/polyfill":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/lib/babel/polyfill.js"}],"/home/abudaan/workspace/qambi/node_modules/babelify/polyfill.js":[function(require,module,exports){
module.exports = require("babel-core/polyfill");

},{"babel-core/polyfill":"/home/abudaan/workspace/qambi/node_modules/babelify/node_modules/babel-core/polyfill.js"}],"/home/abudaan/workspace/qambi/src/audio_event.js":[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createAudioEvent = createAudioEvent;
'use strict';

var AudioEvent = function AudioEvent() {
  _classCallCheck(this, AudioEvent);
};

exports.AudioEvent = AudioEvent;

function createAudioEvent() {
  return new AudioEvent();
}

},{}],"/home/abudaan/workspace/qambi/src/config.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
/*
  Creates the config object that is used for internally sharing settings, information and the state. Other modules may add keys to this object.
*/

'use strict';

var config = undefined,
    defaultSong = undefined,
    ua = 'NA',
    os = 'unknown',
    browser = 'NA';

function getConfig() {
  if (config !== undefined) {
    return config;
  }

  config = new Map();
  config.set('legacy', false); // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
  config.set('midi', false); // true if the browser has MIDI support either via WebMIDI or Jazz
  config.set('webmidi', false); // true if the browser has WebMIDI
  config.set('webaudio', true); // true if the browser has WebAudio
  config.set('jazz', false); // true if the browser has the Jazz plugin
  config.set('ogg', false); // true if WebAudio supports ogg
  config.set('mp3', false); // true if WebAudio supports mp3
  config.set('bitrate_mp3_encoding', 128); // default bitrate for audio recordings
  config.set('debugLevel', 4); // 0 = off, 1 = error, 2 = warn, 3 = info, 4 = log
  config.set('pitch', 440); // basic pitch that is used when generating samples
  config.set('bufferTime', 350 / 1000); // time in seconds that events are scheduled ahead
  config.set('autoAdjustBufferTime', false);
  config.set('noteNameMode', 'sharp');
  config.set('minimalSongLength', 60000); //millis
  config.set('pauseOnBlur', false); // pause the AudioContext when page or tab looses focus
  config.set('restartOnFocus', true); // if song was playing at the time the page or tab lost focus, it will start playing automatically as soon as the page/tab gets focus again
  config.set('defaultPPQ', 960);
  config.set('overrulePPQ', true);
  config.set('precision', 3); // means float with precision 3, e.g. 10.437
  config.set('activeSongs', {}); // the songs currently loaded in memory

  defaultSong = new Map();
  defaultSong.set('bpm', 120);
  defaultSong.set('ppq', config.get('defaultPPQ'));
  defaultSong.set('bars', 30);
  defaultSong.set('lowestNote', 0);
  defaultSong.set('highestNote', 127);
  defaultSong.set('nominator', 4);
  defaultSong.set('denominator', 4);
  defaultSong.set('quantizeValue', 8);
  defaultSong.set('fixedLengthValue', false);
  defaultSong.set('positionType', 'all');
  defaultSong.set('useMetronome', false);
  defaultSong.set('autoSize', true);
  defaultSong.set('loop', false);
  defaultSong.set('playbackSpeed', 1);
  defaultSong.set('autoQuantize', false);
  config.set('defaultSong', defaultSong);

  // get browser and os
  if (navigator !== undefined) {
    ua = navigator.userAgent;

    if (ua.match(/(iPad|iPhone|iPod)/g)) {
      os = 'ios';
    } else if (ua.indexOf('Android') !== -1) {
      os = 'android';
    } else if (ua.indexOf('Linux') !== -1) {
      os = 'linux';
    } else if (ua.indexOf('Macintosh') !== -1) {
      os = 'osx';
    } else if (ua.indexOf('Windows') !== -1) {
      os = 'windows';
    }

    if (ua.indexOf('Chrome') !== -1) {
      // chrome, chromium and canary
      browser = 'chrome';

      if (ua.indexOf('OPR') !== -1) {
        browser = 'opera';
      } else if (ua.indexOf('Chromium') !== -1) {
        browser = 'chromium';
      }
    } else if (ua.indexOf('Safari') !== -1) {
      browser = 'safari';
    } else if (ua.indexOf('Firefox') !== -1) {
      browser = 'firefox';
    } else if (ua.indexOf('Trident') !== -1) {
      browser = 'Internet Explorer';
    }

    if (os === 'ios') {
      if (ua.indexOf('CriOS') !== -1) {
        browser = 'chrome';
      }
    }
  } else {}
  config.set('ua', ua);
  config.set('os', os);
  config.set('browser', browser);

  // check if we have an audio context
  window.AudioContext = window.AudioContext || window.webkitAudioContext || window.oAudioContext || window.msAudioContext;
  config.set('audio_context', navigator.getUserMedia !== undefined);
  config.set('record_audio', navigator.getUserMedia !== undefined);

  // check if audio can be recorded
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  config.set('audio_context', window.AudioContext !== undefined);

  // no webaudio, return
  if (config.get('audio_context') === false) {
    return false;
  }

  // check for other 'modern' API's
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  window.Blob = window.Blob || window.webkitBlob || window.mozBlob;
  //console.log('iOS', os, context, window.Blob, window.requestAnimationFrame);

  return config;
}

exports['default'] = getConfig;
module.exports = exports['default'];

// TODO: check os here with Nodejs' require('os')

},{}],"/home/abudaan/workspace/qambi/src/heartbeat.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.addTask = addTask;
exports.removeTask = removeTask;
exports.start = start;

var _sequencer = require('./sequencer.js');

var _sequencer2 = _interopRequireWildcard(_sequencer);

'use strict';

var timedTasks = new Map();
var repetitiveTasks = new Map();
var scheduledTasks = new Map();
var tasks = new Map();
var lastTimeStamp = undefined;

function heartbeat(timestamp) {
  var now = _sequencer2['default'].time;

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
        timedTasks['delete'](key);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  // for instance: song.update();
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = scheduledTasks.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var task = _step2.value;

      task(now);
    }
  } catch (err) {
    _didIteratorError2 = true;
    _iteratorError2 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion2 && _iterator2['return']) {
        _iterator2['return']();
      }
    } finally {
      if (_didIteratorError2) {
        throw _iteratorError2;
      }
    }
  }

  // for instance: song.pulse();
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = repetitiveTasks.values()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var task = _step3.value;

      task(now);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  /*
    // skip the first 10 frames because they tend to have weird intervals
    if(r >= 10){
      let diff = (timestamp - lastTimeStamp)/1000;
      sequencer.diff = diff;
      // if(r < 40){
      //     console.log(diff);
      //     r++;
      // }
      if(diff > sequencer.bufferTime && sequencer.autoAdjustBufferTime === true){
        if(sequencer.debug){
          console.log('adjusted buffertime:' + sequencer.bufferTime + ' -> ' +  diff);
        }
        sequencer.bufferTime = diff;
      }
    }else{
      r++;
    }
  */
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
  map['delete'](id);
}

function start() {
  tasks.set('timed', timedTasks);
  tasks.set('repetitive', repetitiveTasks);
  tasks.set('scheduled', scheduledTasks);
  heartbeat();
}

},{"./sequencer.js":"/home/abudaan/workspace/qambi/src/sequencer.js"}],"/home/abudaan/workspace/qambi/src/init_audio.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _log$info$warn$error$parseSamples = require('./util');

/*
  Sets up the basic audio routing, tests which audio formats are supported and parses the samples for the metronome ticks.
*/

'use strict';

var data = {},
    context = undefined,
    source = undefined,
    gainNode = undefined,
    compressor = undefined;

var compressorParams = ['threshold', 'knee', 'ratio', 'reduction', 'attack', 'release'],
    emptyOgg = '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Y5l93VlmX3eO4Rg6v/Djqaqvm64rDKcsC7/t68az+76yjK7r+6osC78q28Kx677z/L6wLKPs+sJqy8Kw2rYx3L5uLL9wHMtr68ox675RtnV8X3gKw/N0dV15Zl3H9nV040c4fsoAAIABBwCAABPKQKEhKwKAOAEAjySJomRZoihZliiKpui6omi6rqRppqlpnmlammeapmmqsimarixpmmlanmaamqeZpmiarmuapqyKpinLpmrKsmmasuy6sm27rmzbomnKsmmasmyapiy7sqvbruzquqRZpql5nmlqnmeapmrKsmmarqt5nmp6nmiqniiqqmqqqq2qqixbnmeamuippieKqmqqpq2aqirLpqrasmmqtmyqqm27quz6sm3rummqsm2qpi2bqmrbruzqsizbui9pmmlqnmeamueZpmmasmyaqitbnqeaniiqquaJpmqqqiybpqrKlueZqieKquqJnmuaqirLpmraqmmatmyqqi2bpirLrm37vuvKsm6qqmybqmrrpmrKsmzLvu/Kqu6KpinLpqrasmmqsi3bsu/Lsqz7omnKsmmqsm2qqi7Lsm0bs2z7umiasm2qpi2bqirbsi37uizbuu/Krm+rqqzrsi37uu76rnDrujC8smz7qqz6uivbum/rMtv2fUTTlGVTNW3bVFVZdmXZ9mXb9n3RNG1bVVVbNk3VtmVZ9n1Ztm1hNE3ZNlVV1k3VtG1Zlm1htmXhdmXZt2Vb9nXXlXVf133j12Xd5rqy7cuyrfuqq/q27vvCcOuu8AoAABhwAAAIMKEMFBqyEgCIAgAAjGGMMQiNUs45B6FRyjnnIGTOQQghlcw5CCGUkjkHoZSUMucglJJSCKGUlFoLIZSUUmsFAAAUOAAABNigKbE4QKEhKwGAVAAAg+NYlueZomrasmNJnieKqqmqtu1IlueJommqqm1bnieKpqmqruvrmueJommqquvqumiapqmqruu6ui6aoqmqquu6sq6bpqqqriu7suzrpqqqquvKriz7wqq6rivLsm3rwrCqruvKsmzbtm/cuq7rvu/7wpGt67ou/MIxDEcBAOAJDgBABTasjnBSNBZYaMhKACADAIAwBiGDEEIGIYSQUkohpZQSAAAw4AAAEGBCGSg0ZEUAECcAABhDKaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJIKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKqaSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKZVSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUgoAkIpwAJB6MKEMFBqyEgBIBQAAjFFKKcacgxAx5hhj0EkoKWLMOcYclJJS5RyEEFJpLbfKOQghpNRSbZlzUlqLMeYYM+ekpBRbzTmHUlKLseaaa+6ktFZrrjXnWlqrNdecc825tBZrrjnXnHPLMdecc8455xhzzjnnnHPOBQDgNDgAgB7YsDrCSdFYYKEhKwGAVAAAAhmlGHPOOegQUow55xyEECKFGHPOOQghVIw55xx0EEKoGHPMOQghhJA55xyEEEIIIXMOOugghBBCBx2EEEIIoZTOQQghhBBKKCGEEEIIIYQQOgghhBBCCCGEEEIIIYRSSgghhBBCCaGUUAAAYIEDAECADasjnBSNBRYashIAAAIAgByWoFLOhEGOQY8NQcpRMw1CTDnRmWJOajMVU5A5EJ10EhlqQdleMgsAAIAgACDABBAYICj4QgiIMQAAQYjMEAmFVbDAoAwaHOYBwANEhEQAkJigSLu4gC4DXNDFXQdCCEIQglgcQAEJODjhhife8IQbnKBTVOogAAAAAAAMAOABAOCgACIimquwuMDI0Njg6PAIAAAAAAAWAPgAADg+gIiI5iosLjAyNDY4OjwCAAAAAAAAAACAgIAAAAAAAEAAAACAgE9nZ1MABAEAAAAAAAAAXcXeFwIAAABq2npxAgEBAAo=',
    emptyMp3 = '//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=',
    hightick = 'UklGRkQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YSAFAACx/xf/dADOACwBsP3p+6H+zAGoBOkCCwBX/EH5OvxlA4kJ2wcSArT9E/ut+HT2evUx98n6OAF5CCUMwQvfCOsJxAx0DSIMEAq9BiAB3vhz7mLkT9sR133YxN2s5QLv0vrUBnwRnxuQJeEsSDCiMd8yFS8aKFIhohUsCKj64u625OraA9HuyPnElcP+wxvJWtW25637VQ0jHPgnBTDDM1o0CzKLK+8hzhgFDOz8Se4J47DYVtG0z5fQq9LB12rfA+j99roHAhelIyMwIjdTOuU8mjwIOGoxhCb5E53/j+3k3/fTY8pTw4y/Tr+ew8DMvdsk8RcHRRkSKO4yGTkHPkU/rzzyNcgsrR94Dp/5r+Zs17zOncoDxhfE38WLyn/TeOMi9r0IRxlRKIQzyTlOPKo9yjmWMcokDRLc/Y7rudtdzu/D2L1Iu+27JcG3yYrVLujl+3UOZx1UK5Q0qzmNPDk8ZjeeMPojzhH+/jLtPd5m0hHLHsYIw5TEMMnA0jvj8fSOBiwXASZgMzM8dUBGQbI+rzjpKkIZygZT9QflcdaRyqXCz7+VwUPH784r3K7s+v0KDu8bvyeLMb43NjrhOIo0dSvQHi0PnP6i7ovg3NTxy4/Gf8X8yH/QBtvX55P2Ygb0FcUjsy4LNmI5ejiXM38r7iC8FJwHPvok7dDgQdaJzlTKIsoFzsrVkuA87d/6qAi7FQ0h9ClKMLEz3TOrMBcqYSD8E9AFd/dS6kTf6dbU0XnQv9IH2MXfZ+ln9DEAFwwdFy8giib6KawqeChgI/UbHBOTCZj/vvXe7InlFuDN3P3b0d1F4gzpifG2+u4D7Qw1FfwbnCD+IlgjWyHLHPMVog2mBL37qvP+7NvnYuTv4rvjfubN6k3wpPZ0/WkEOwtiEUsWcxm+Gl4aOhhiFDAPIwmbAtn7TPVy77zqcefr5YHmHull7enyfPmcAHgHew1REr8Vhhd/F+AV1RJ0DikJWQNc/ZP3efKd7hvs2ur46rHs5u8e9N/48/0hA/8HFgwuD04RSBIREqsQOg7mCssGMAJW/Xn4G/TK8Lbuzu0I7qTvnPJy9sX6bP84BLYIbAwdD84QYxG7EOcODAxwCFMEAQC9+7P3SvTX8XHw+u9R8KTxIvSo9+X7VQCUBJ0IMwziDj4QLhAGD9UMrgnTBZcBRv1v+Xv2UfS+8tfx+vES87z0+vb3+Zf9ZgEQBSEIUArWC8kM2QyzC5EJEAdvBHgBXP5n++r4Avd89Wj07fMw9D31Jvfp+Uj9xQD9A8QG5QhXClELrAsvC9wJ7gd6BWIC3v6O+7T4PPZN9EHzWvNf9Pz1Fvit+qL9rQCHAwEG/weCCZUKFwvDCnIJcAcQBWcCaf8Z/CD55vaB9dD0wPSP9UL3m/k7/Mz+JwEyAw8FzAY7CBsJaQk5CWkI2gatBCICYf+j/Fr6vfiV9872sfZP91z4p/lR+3H9zf89AroEFAfjCP0Jcwo8CjAJdQdgBSEDkgDQ/Vj7ZfnR95T28fUd9v32Vvg2+nb8+/6xAWoE4AbDCP4JpAqbCqQJ0weEBfgCTACT/R37M/m+9672IPY69gb3afhW+tT8qf+MAj0FggcuCScKXAriCcMIEAfyBJYCFwCP/Rz7A/l793z2F/Zn9mH37fjd+i39yf9pAt0EFAfRCNkJGAqrCZYIvgZPBJ8B6P4//M350vdz9q/1lfUq9mz3RPmi+3H+bgFVBOQG3wgHCkwK0Am7CCAHCgWmAjAA',
    lowtick = 'UklGRlQFAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YTAFAAB0/5v+U/4T/3gA0wFTAuUB+f8d/nT90f1q/ub+tf46/mb/8wFQA9gC7wCd/mr+FAGRA3cE6wJf/h36evmv+8v/NwRHBZUC2/60+//5EvuZ/aX/bgFOAp8Azvzh9wfzLPF68zT4y/2BAygIfQwaEjYY0x31Irwl8SOWHVESOgPh9NfpReFt22nYHddD2BXcZeDa5InqgPDx9nP+6gS4CBYLnw0zES0WXxv4HkcgLh/1G+EX1RNpD4wKigXH/6r5/fNu7lTpj+Zu5hHoXOtL71byr/Qp91L64v6OBO4JoQ5zEskU+hU1FiQVeRP7EWgP4Qr0BIT+tPid9C3y1vCh8FDxJvK28vvyy/LA8pLzU/XP95v6xvw4/uD/RAK2BSkKcg6BEScTZBMeEqkPTQxjCKEEVwFi/nv7h/hp9aDyAvHP8MfxLvM+9PX0uPW19g/4Lfr7/C4AKgNaBXQGywb0BhIHWQfWB1oIzAjtCF8IHwdtBakDVwKLAeYA8v9w/kj81/nQ94v29/XX9bz1bPUY9Uz1Z/aH+Hr7yP4MAi4F+wcfCnYLNgyfDPsMSw0sDUAMfgrcB5IEMwFb/iX8T/pT+O/1X/Mf8cbvrO+18MLyvfVP+Rf9wgAoBCEHpwnIC5EN4Q5AD3wO1Ay0CpsIvwbvBNcCbQAr/nX8Ofsf+vb4mvda9rj1z/WX9pL3a/hH+ZX6R/wn/vP/eQESA/AE+wYDCcwKFAyPDCkMFQuSCe4HVQbSBHQDCwI8ANL9JPuY+HX28vTq82PzdPMV9Az1MfZ49zD5gftx/sQBBQXLB8cJ/gqpCw8MigwWDXENXQ2rDDUL7QgDBswCdv8S/K74WPVk8hXwou4P7mvu1+9T8pz1Uvli/ZoBwgWRCcsMPg/CEEQR4RDADwoO9wusCVMH4ARSApn/ufzd+Wj3bvX78xzzx/L68qzz1vSD9qX4Gfvd/c0AhwO/BWwHmghvCQEKVQonClsJCwiIBh0F0gOgAm0BOwAx/03+XP0g/Lb6cPmX+F/4vfh++TH6s/os+7/7cvwL/Zz9XP5O/3IA3AF9AzsF9gaUCAAKHgueCzcL9wntB3sF4wIzAI396fp1+Gv2IvWn9N30p/Xi9m74G/ru+9P9k/8aAYEC1AMTBSIG0wYuB1gHkgcACGEISAhTBzEFWAKt/5L92fuU+vX50fmf+SP5i/gb+Bf4mviv+Sr7kvyb/Uj+r/4X/8r/+gCiAo0EUAaRBzwISwjqB3IHGQfCBv8FpgTMApQAKf67+5n5/vfn9jz2yPVn9SL1RPXq9SP3Dvmr+6f+sQGKBAcH+whOCh0Laws3C28KLAmDB5AFfQNoAVP/Zv3e+7P6sfnL+Cv4vPeM95b37feV+Jn51Poq/LL9mv+YAVYD3gQuBmcHSAikCIEI7Af+BuEFngQXA1sBv/9v/pf9MP3W/Fj8q/sR+6H6U/o3+mP6y/pN+/f7xvye/WH+Jf9mAD4CQAQJBisHtgf6Bw0I8QdsB1sGywT4AggBCP/o/KX6mPg19572jfaz9uf2S/cM+E35E/tW/af/5wH1A8AFKgfkB/AHgwfxBlAGgQVIBMMCJwGs/43+vP0i/Zr8Lfzl+9H76fvi+9f75fsf/In8BP10/ej9cf4O/7f/dAAcAaUBEgKMAhgDpAMEBCEEDwTfA3IDxQL8ASoBUwCG/87+J/6h/Rr9pPxk/Gb8oPwJ/XH9w/39/UD+qP41/9D/WwDeAGsBAgKdAhEDQQNAA0sDbwOVA5YDVwPOAhgCVAGRAA==';

function initAudio(ctx) {
  context = ctx;
  return new Promise(function executor(resolve, reject) {
    context = new window.AudioContext();
    data.context = context;

    if (context.createGainNode === undefined) {
      context.createGainNode = context.createGain;
    }
    // check for older implementations of WebAudio
    source = context.createBufferSource();
    data.legacy = false;
    if (source.start === undefined) {
      data.legacy = true;
    }

    // set up the elementary audio nodes
    compressor = context.createDynamicsCompressor();
    compressor.connect(context.destination);
    gainNode = context.createGainNode();
    gainNode.connect(context.destination);
    gainNode.gain.value = 1;

    data.masterGainNode = gainNode;
    data.masterCompressor = compressor;

    _log$info$warn$error$parseSamples.parseSamples({
      ogg: emptyOgg,
      mp3: emptyMp3,
      lowtick: lowtick,
      hightick: hightick
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
  var value = arguments[0] === undefined ? 0.5 : arguments[0];

  if (value > 1) {
    _log$info$warn$error$parseSamples.info('maximal volume is 1.0, volume is set to 1.0');
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
    compressor.connect(context.destination);
  } else {
    compressor.disconnect(0);
    gainNode.disconnect(0);
    gainNode.connect(context.destination);
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
  var i = undefined,
      param = undefined;
  for (i = compressorParams.length; i >= 0; i--) {
    param = compressorParams[i];
    if (cfg[param] !== undefined) {
      compressor[param].value = cfg[param];
    }
  }
};

data.getAudioContext = function () {
  return context;
};

data.getTime = function () {
  return context.currentTime;
};

exports['default'] = initAudio;
module.exports = exports['default'];

},{"./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/init_midi.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _bind = Function.prototype.bind;

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.initMidiSong = initMidiSong;
exports.setMidiInputSong = setMidiInputSong;
exports.setMidiOutputSong = setMidiOutputSong;

var _log$info$warn$error$typeString = require('./util');

var _MidiEvent = require('./midi_event');

var _MidiEvent2 = _interopRequireWildcard(_MidiEvent);

/*
  Requests MIDI access, queries all inputs and outputs and stores them in alphabetical order
*/

'use strict';

var data = {};
var inputs = new Map();
var outputs = new Map();

var songMidiEventListener = undefined;
var midiEventListenerId = 0;

function initMidi() {

  return new Promise(function executor(resolve, reject) {

    var tmp = undefined;

    if (navigator.requestMIDIAccess !== undefined) {

      navigator.requestMIDIAccess().then(function onFulFilled(midi) {
        if (midi._jazzInstances !== undefined) {
          data.jazz = midi._jazzInstances[0]._Jazz.version;
          data.midi = true;
        } else {
          data.webmidi = true;
          data.midi = true;
        }

        // old implementation of WebMIDI
        if (typeof midi.inputs.values !== 'function') {
          reject('You browser is using an old implementation of the WebMIDI API, please update your browser.');
          return;
        }

        // get inputs
        tmp = Array.from(midi.inputs.values());

        //sort ports by name ascending
        tmp.sort(function (a, b) {
          return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
        });

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = tmp[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var port = _step.value;

            inputs.set(port.id, port);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator['return']) {
              _iterator['return']();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        // get outputs
        tmp = Array.from(midi.outputs.values());

        //sort ports by name ascending
        tmp.sort(function (a, b) {
          return a.name.toLowerCase() <= b.name.toLowerCase() ? 1 : -1;
        });

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = tmp[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var port = _step2.value;

            outputs.set(port.id, port);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        // onconnect and ondisconnect are not yet implemented in Chrome and Chromium
        midi.addEventListener('onconnect', function (e) {
          _log$info$warn$error$typeString.log('device connected', e);
        }, false);

        midi.addEventListener('ondisconnect', function (e) {
          _log$info$warn$error$typeString.log('device disconnected', e);
        }, false);

        // export
        data.inputs = inputs;
        data.outputs = outputs;

        resolve(data);
      }, function onReject(e) {
        //console.log(e);
        reject('Something went wrong while requesting MIDIAccess');
      });
      // browsers without WebMIDI API
    } else {
      data.midi = false;
      resolve(data);
    }
  });
}

function initMidiSong(song) {

  songMidiEventListener = function (e) {
    //console.log(e);
    handleMidiMessageSong(song, e, this);
  };

  // by default a song listens to all available midi-in ports
  inputs.forEach(function (port) {
    port.addEventListener('midimessage', songMidiEventListener);
    song.midiInputs.set(port.id, port);
  });

  outputs.forEach(function (port) {
    song.midiOutputs.set(port.id, port);
  });
}

function setMidiInputSong(song, id, flag) {
  var input = inputs.get(id);

  if (input === undefined) {
    _log$info$warn$error$typeString.warn('no midi input with id', id, 'found');
    return;
  }

  if (flag === false) {
    song.midiInputs['delete'](id);
    input.removeEventListener('midimessage', songMidiEventListener);
  } else {
    song.midiInputs.set(id, input);
    input.addEventListener('midimessage', songMidiEventListener);
  }

  var tracks = song.tracks;
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = tracks[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var track = _step3.value;

      track.setMidiInput(id, flag);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

function setMidiOutputSong(song, id, flag) {
  var output = outputs.get(id);

  if (output === undefined) {
    _log$info$warn$error$typeString.warn('no midi output with id', id, 'found');
    return;
  }

  if (flag === false) {
    song.midiOutputs['delete'](id);
    var time = song.scheduler.lastEventTime + 100;
    output.send([176, 123, 0], time); // stop all notes
    output.send([176, 121, 0], time); // reset all controllers
  } else {
    song.midiOutputs.set(id, output);
  }

  var tracks = song.tracks;
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = tracks[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var track = _step4.value;

      track.setMidiOutput(id, flag);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4['return']) {
        _iterator4['return']();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }
}

function handleMidiMessageSong(song, midiMessageEvent, input) {
  var midiEvent = new (_bind.apply(_MidiEvent2['default'], [null].concat([song.ticks], _toConsumableArray(midiMessageEvent.data))))();

  //console.log(midiMessageEvent.data);

  var tracks = song.tracks;
  var _iteratorNormalCompletion5 = true;
  var _didIteratorError5 = false;
  var _iteratorError5 = undefined;

  try {
    for (var _iterator5 = tracks[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
      var track = _step5.value;

      //console.log(track.midiInputs, input);
      /*
      if(midiEvent.channel === track.channel || track.channel === 0 || track.channel === 'any'){
        handleMidiMessageTrack(midiEvent, track);
      }
      */
      // like in Cubase, midi events from all devices, sent on any midi channel are forwarded to all tracks
      // set track.monitor to false if you don't want to receive midi events on a certain track
      // note that track.monitor is by default set to false and that track.monitor is automatically set to true
      // if you are recording on that track
      //console.log(track.monitor, track.id, input.id);
      if (track.monitor === true && track.midiInputs.get(input.id) !== undefined) {
        handleMidiMessageTrack(midiEvent, track, input);
      }
    }
  } catch (err) {
    _didIteratorError5 = true;
    _iteratorError5 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion5 && _iterator5['return']) {
        _iterator5['return']();
      }
    } finally {
      if (_didIteratorError5) {
        throw _iteratorError5;
      }
    }
  }

  var listeners = song.midiEventListeners.get(midiEvent.type);
  if (listeners !== undefined) {
    var _iteratorNormalCompletion6 = true;
    var _didIteratorError6 = false;
    var _iteratorError6 = undefined;

    try {
      for (var _iterator6 = listeners[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
        var listener = _step6.value;

        listener(midiEvent, input);
      }
    } catch (err) {
      _didIteratorError6 = true;
      _iteratorError6 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion6 && _iterator6['return']) {
          _iterator6['return']();
        }
      } finally {
        if (_didIteratorError6) {
          throw _iteratorError6;
        }
      }
    }
  }
}

function handleMidiMessageTrack(track, midiEvent, input) {
  var song = track.song,
      note = undefined,
      listeners = undefined,
      channel = undefined;
  //data = midiMessageEvent.data,
  //midiEvent = createMidiEvent(song.ticks, data[0], data[1], data[2]);

  //midiEvent.source = midiMessageEvent.srcElement.name;
  //console.log(midiMessageEvent)
  //console.log('---->', midiEvent.type);

  // add the exact time of this event so we can calculate its ticks position
  midiEvent.recordMillis = context.currentTime * 1000; // millis
  midiEvent.state = 'recorded';

  if (midiEvent.type === 144) {
    note = createMidiNote(midiEvent);
    track.recordingNotes[midiEvent.data1] = note;
    //track.song.recordingNotes[note.id] = note;
  } else if (midiEvent.type === 128) {
    note = track.recordingNotes[midiEvent.data1];
    // check if the note exists: if the user plays notes on her keyboard before the midi system has
    // been fully initialized, it can happen that the first incoming midi event is a NOTE OFF event
    if (note === undefined) {
      return;
    }
    note.addNoteOff(midiEvent);
    delete track.recordingNotes[midiEvent.data1];
    //delete track.song.recordingNotes[note.id];
  }

  //console.log(song.preroll, song.recording, track.recordEnabled);

  if ((song.prerolling || song.recording) && track.recordEnabled === 'midi') {
    if (midiEvent.type === 144) {
      track.song.recordedNotes.push(note);
    }
    track.recordPart.addEvent(midiEvent);
    // song.recordedEvents is used in the key editor
    track.song.recordedEvents.push(midiEvent);
  } else if (track.enableRetrospectiveRecording) {
    track.retrospectiveRecording.push(midiEvent);
  }

  // call all midi event listeners
  listeners = track.midiEventListeners[midiEvent.type];
  if (listeners !== undefined) {
    objectForEach(listeners, function (listener) {
      listener(midiEvent, input);
    });
  }

  channel = track.channel;
  if (channel === 'any' || channel === undefined || isNaN(channel) === true) {
    channel = 0;
  }

  objectForEach(track.midiOutputs, function (output) {
    //console.log('midi out', output, midiEvent.type);
    if (midiEvent.type === 128 || midiEvent.type === 144 || midiEvent.type === 176) {
      //console.log(midiEvent.type, midiEvent.data1, midiEvent.data2);
      output.send([midiEvent.type, midiEvent.data1, midiEvent.data2]);
      // }else if(midiEvent.type === 192){
      //     output.send([midiEvent.type + channel, midiEvent.data1]);
    }
    //output.send([midiEvent.status + channel, midiEvent.data1, midiEvent.data2]);
  });

  // @TODO: maybe a track should be able to send its event to both a midi-out port and an internal heartbeat song?
  //console.log(track.routeToMidiOut);
  if (track.routeToMidiOut === false) {
    midiEvent.track = track;
    track.instrument.processEvent(midiEvent);
  }
}

function addMidiEventListener() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  // caller can be a track or a song

  var id = midiEventListenerId++;
  var listener = undefined;
  types = {}, ids = [], loop;

  // should I inline this?
  loop = function (args) {
    var _iteratorNormalCompletion7 = true;
    var _didIteratorError7 = false;
    var _iteratorError7 = undefined;

    try {
      for (var _iterator7 = args[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
        var arg = _step7.value;

        var type = _log$info$warn$error$typeString.typeString(arg);
        //console.log(type);
        if (type === 'array') {
          loop(arg);
        } else if (type === 'function') {
          listener = arg;
        } else if (isNaN(arg) === false) {
          arg = parseInt(arg, 10);
          if (sequencer.checkEventType(arg) !== false) {
            types[arg] = arg;
          }
        } else if (type === 'string') {
          if (sequencer.checkEventType(arg) !== false) {
            arg = sequencer.midiEventNumberByName(arg);
            types[arg] = arg;
          }
        }
      }
    } catch (err) {
      _didIteratorError7 = true;
      _iteratorError7 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion7 && _iterator7['return']) {
          _iterator7['return']();
        }
      } finally {
        if (_didIteratorError7) {
          throw _iteratorError7;
        }
      }
    }
  };

  loop(args, 0, args.length);
  //console.log('types', types, 'listener', listener);

  objectForEach(types, function (type) {
    //console.log(type);
    if (obj.midiEventListeners[type] === undefined) {
      obj.midiEventListeners[type] = {};
    }
    obj.midiEventListeners[type][id] = listener;
    ids.push(type + '_' + id);
  });

  //console.log(obj.midiEventListeners);
  return ids.length === 1 ? ids[0] : ids;
}

function removeMidiEventListener(id, obj) {
  var type;
  id = id.split('_');
  type = id[0];
  id = id[1];
  delete obj.midiEventListeners[type][id];
}

function removeMidiEventListeners() {}

exports['default'] = initMidi;

},{"./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/instrument.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _bind = Function.prototype.bind;
var _slice = Array.prototype.slice;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createInstrument = createInstrument;

var _log$info$warn$error = require('./util');

var _getNoteNumber = require('./note');

var _createSample = require('./sample');

var _createSample2 = _interopRequireWildcard(_createSample);

'use strict';

var Instrument = (function () {
  function Instrument() {
    _classCallCheck(this, Instrument);

    this.samplesData = new Array(128).fill(-1);
    this.samplesData = this.samplesData.map(function () {
      return new Array(128).fill(-1);
    });
    this.scheduledSamples = new Map();
  }

  _createClass(Instrument, [{
    key: 'processEvent',
    value: function processEvent(event) {
      var _this = this;

      if (event.type === 128) {
        var _ret = (function () {
          // stop sample
          if (event.midiNote === undefined) {
            return {
              v: undefined
            };
          }
          var id = event.midiNote.id;
          var sample = _this.scheduledSamples.get(id);
          sample.stop(event.time, function () {
            return _this.scheduledSamples['delete'](id);
          });
        })();

        if (typeof _ret === 'object') {
          return _ret.v;
        }
      } else if (event.type === 144) {
        // start sample
        if (event.midiNote === undefined) {
          return;
        }
        var sampleData = this.samplesData[event.noteNumber][event.velocity];
        var sample = _createSample2['default'](sampleData, event);
        this.scheduledSamples.set(event.midiNote.id, sample);
        sample.start();
      }
    }
  }, {
    key: 'addSampleData',

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
    value: function addSampleData(noteId, audioBuffer) {
      var _ref = arguments[2] === undefined ? {} : arguments[2];

      var _ref$sustain = _ref.sustain;
      var sustain = _ref$sustain === undefined ? [false, false] : _ref$sustain;
      var _ref$release = _ref.release;
      var release = _ref$release === undefined ? [false, 'default'] : _ref$release;
      var _ref$pan = _ref.pan;
      var pan = _ref$pan === undefined ? false : _ref$pan;
      var _ref$velocity = _ref.velocity;
      var velocity = _ref$velocity === undefined ? [0, 127] : _ref$velocity;

      if (audioBuffer instanceof AudioBuffer === false) {
        _log$info$warn$error.warn('not a valid AudioBuffer instance');
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

      if (isNaN(noteId)) {
        noteId = _getNoteNumber.getNoteNumber(noteId);
        if (isNaN(noteId)) {
          _log$info$warn$error.warn(noteId);
        }
      }

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
  }]);

  return Instrument;
})();

exports.Instrument = Instrument;

function createInstrument() {
  return new (_bind.apply(Instrument, [null].concat(_slice.call(arguments))))();
}

},{"./note":"/home/abudaan/workspace/qambi/src/note.js","./sample":"/home/abudaan/workspace/qambi/src/sample.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/midi_event.js":[function(require,module,exports){
'use strict';

var _bind = Function.prototype.bind;
var _slice = Array.prototype.slice;

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createMIDIEvent = createMIDIEvent;

var _log$info$warn$error$typeString = require('./util');

var _createNote = require('./note.js');

/**
  @public
  @class MIDIEvent
  @param time {int} the time that the event is scheduled
  @param type {int} type of MIDIEvent, e.g. NOTE_ON, NOTE_OFF or, 144, 128, etc.
  @param data1 {int} if type is 144 or 128: note number
  @param [data2] {int} if type is 144 or 128: velocity
  @param [channel] {int} channel


  @example
  // plays the central c at velocity 100
  let event = sequencer.createMIDIEvent(120, sequencer.NOTE_ON, 60, 100);

  // pass arguments as array
  let event = sequencer.createMIDIEvent([120, sequencer.NOTE_ON, 60, 100]);

*/

'use strict';

var midiEventId = 0;

/*
  arguments:
   - [ticks, type, data1, data2, channel]
   - ticks, type, data1, data2, channel

  data2 and channel are optional but must be numbers if provided
*/

var MIDIEvent = (function () {
  function MIDIEvent() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, MIDIEvent);

    var note = undefined;

    this.id = 'M' + midiEventId++ + new Date().getTime();
    this.eventNumber = midiEventId;
    this.time = 0;
    this.muted = false;

    if (args === undefined || args.length === 0) {
      // bypass contructor for cloning
      return;
    } else if (_log$info$warn$error$typeString.typeString(args[0]) === 'midimessageevent') {
      _log$info$warn$error$typeString.info('midimessageevent');
      return;
    } else if (_log$info$warn$error$typeString.typeString(args[0]) === 'array') {
      // support for un-spreaded parameters
      args = args[0];
      if (_log$info$warn$error$typeString.typeString(args[0]) === 'array') {
        // support for passing parameters in an array
        args = args[0];
      }
    }

    args.forEach(function (data, i) {
      if (isNaN(data) && i < 5) {
        _log$info$warn$error$typeString.error('please provide numbers for ticks, type, data1 and optionally for data2 and channel');
      }
    });

    this.ticks = args[0];
    this.status = args[1];
    this.type = (this.status >> 4) * 16;
    //console.log(this.type, this.status);
    if (this.type >= 128 && this.type <= 224) {
      //the higher 4 bits of the status byte is the command
      this.command = this.type;
      //the lower 4 bits of the status byte is the channel number
      this.channel = (this.status & 15) + 1; // from zero-based to 1-based
    } else {
      this.type = this.status;
      this.channel = args[4] || 1;
    }

    this.sortIndex = this.type + this.ticks; // note off events come before note on events

    switch (this.type) {
      case 0:
        break;
      case 128:
        this.data1 = args[2];
        note = _createNote.createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;
        this.data2 = 0; //data[3];
        this.velocity = this.data2;
        break;
      case 144:
        this.data1 = args[2]; //note number
        this.data2 = args[3]; //velocity
        if (this.data2 === 0) {
          //if velocity is 0, this is a NOTE OFF event
          this.type = 128;
        }
        note = _createNote.createNote(this.data1);
        this.note = note;
        this.noteName = note.fullName;
        this.noteNumber = note.number;
        this.octave = note.octave;
        this.frequency = note.frequency;
        this.velocity = this.data2;
        break;
      case 81:
        this.bpm = args[2];
        break;
      case 88:
        this.nominator = args[2];
        this.denominator = args[3];
        break;
      case 176:
        // control change
        this.data1 = args[2];
        this.data2 = args[3];
        this.controllerType = args[2];
        this.controllerValue = args[3];
        break;
      case 192:
        // program change
        this.data1 = args[2];
        this.programNumber = args[2];
        break;
      case 208:
        // channel pressure
        this.data1 = args[2];
        this.data2 = args[3];
        break;
      case 224:
        // pitch bend
        this.data1 = args[2];
        this.data2 = args[3];
        break;
      case 47:
        break;
      default:
        _log$info$warn$error$typeString.warn('not a recognized type of midi event!');
    }
  }

  _createClass(MIDIEvent, [{
    key: 'clone',
    value: function clone() {
      var event = new MIDIEvent();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(this)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var property = _step.value;

          if (property !== 'id' && property !== 'eventNumber' && property !== 'midiNote') {
            event[property] = this[property];
          }
          event.song = undefined;
          event.track = undefined;
          event.trackId = undefined;
          event.part = undefined;
          event.partId = undefined;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return event;
    }
  }, {
    key: 'transpose',
    value: function transpose(semi) {
      if (this.type !== 128 && this.type !== 144) {
        _log$info$warn$error$typeString.error('you can only transpose note on and note off events');
        return;
      }

      //console.log('transpose', semi);
      if (_log$info$warn$error$typeString.typeString(semi) === 'array') {
        var type = semi[0];
        if (type === 'hertz') {} else if (type === 'semi' || type === 'semitone') {
          semi = semi[1];
        }
      } else if (isNaN(semi) === true) {
        _log$info$warn$error$typeString.error('please provide a number');
        return;
      }

      var tmp = this.data1 + parseInt(semi, 10);
      if (tmp < 0) {
        tmp = 0;
      } else if (tmp > 127) {
        tmp = 127;
      }
      this.data1 = tmp;
      var note = _createNote.createNote(this.data1);
      this.note = note;
      this.noteName = note.fullName;
      this.noteNumber = note.number;
      this.octave = note.octave;
      this.frequency = note.frequency;

      if (this.midiNote !== undefined) {
        this.midiNote.pitch = this.data1;
      }

      if (this._state !== 'new') {
        this._state = 'transposed';
      }
      this._update();
    }
  }, {
    key: 'setPitch',
    value: function setPitch(pitch) {
      if (this.type !== 128 && this.type !== 144) {
        _log$info$warn$error$typeString.error('you can only set the pitch of note on and note off events');
        return;
      }
      if (_log$info$warn$error$typeString.typeString(pitch) === 'array') {
        var type = pitch[0];
        if (type === 'hertz') {} else if (type === 'semi' || type === 'semitone') {
          pitch = pitch[1];
        }
      } else if (isNaN(pitch) === true) {
        _log$info$warn$error$typeString.error('please provide a number');
        return;
      }

      this.data1 = parseInt(pitch, 10);
      var note = _createNote.createNote(this.data1);
      this.note = note;
      this.noteName = note.fullName;
      this.noteNumber = note.number;
      this.octave = note.octave;
      this.frequency = note.frequency;

      if (this.midiNote !== undefined) {
        this.midiNote.pitch = this.data1;
      }
      if (this._state !== 'new') {
        this._state = 'transposed';
      }
      this._update();
    }
  }, {
    key: 'move',
    value: function move(ticks) {
      if (isNaN(ticks)) {
        _log$info$warn$error$typeString.error('please provide a number');
        return;
      }
      this.ticks += parseInt(ticks, 10);
      //@todo: set duration of midi note
      if (this._state !== 'new') {
        this._state = 'moved';
      }
      this._update();
    }
  }, {
    key: 'moveTo',
    value: function moveTo() {
      for (var _len2 = arguments.length, position = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        position[_key2] = arguments[_key2];
      }

      if (position[0] === 'ticks' && isNaN(position[1]) === false) {
        this.ticks = parseInt(position[1], 10);
      } else if (this.song === undefined) {
        console.error('The midi event has not been added to a song yet; you can only move to ticks values');
      } else {
        position = this.song.getPosition(position);
        if (position === false) {
          console.error('wrong position data');
        } else {
          this.ticks = position.ticks;
        }
      }

      if (this._state !== 'new') {
        this._state = 'moved';
      }
      this._update();
    }
  }, {
    key: 'reset',
    value: function reset() {
      var fromPart = arguments[0] === undefined ? true : arguments[0];
      var fromTrack = arguments[1] === undefined ? true : arguments[1];
      var fromSong = arguments[2] === undefined ? true : arguments[2];

      if (fromPart) {
        this.part = undefined;
        this.partId = undefined;
      }
      if (fromTrack) {
        this.track = undefined;
        this.trackId = undefined;
        this.channel = 0;
      }
      if (fromSong) {
        this.song = undefined;
      }
      this._state = 'removed';
      this._update();
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.part !== undefined) {
        this.part._needsUpdate = true;
      }
    }
  }]);

  return MIDIEvent;
})();

exports.MIDIEvent = MIDIEvent;

function createMIDIEvent() {
  return new (_bind.apply(MIDIEvent, [null].concat(_slice.call(arguments))))();
}

//convert hertz to semi

//convert hertz to pitch

},{"./note.js":"/home/abudaan/workspace/qambi/src/note.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/midi_parse.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = parseMIDIFile;

var _createMIDIStream = require('./midi_stream');

var _createMIDIStream2 = _interopRequireWildcard(_createMIDIStream);

/*
  Extracts all midi events from a binary midi file, uses midi_stream.js

  based on: https://github.com/gasman/jasmid
*/

'use strict';

var lastEventTypeByte = undefined,
    trackName = undefined;

function readChunk(stream) {
  var id = stream.read(4, true);
  var length = stream.readInt32();
  //console.log(length);
  return {
    id: id,
    length: length,
    data: stream.read(length, false)
  };
}

function readEvent(stream) {
  var event = {};
  var length;
  event.deltaTime = stream.readVarInt();
  var eventTypeByte = stream.readInt8();
  //console.log(eventTypeByte, eventTypeByte & 0x80, 146 & 0x0f);
  if ((eventTypeByte & 240) == 240) {
    /* system / meta event */
    if (eventTypeByte == 255) {
      /* meta event */
      event.type = 'meta';
      var subtypeByte = stream.readInt8();
      length = stream.readVarInt();
      switch (subtypeByte) {
        case 0:
          event.subtype = 'sequenceNumber';
          if (length !== 2) {
            throw 'Expected length for sequenceNumber event is 2, got ' + length;
          }
          event.number = stream.readInt16();
          return event;
        case 1:
          event.subtype = 'text';
          event.text = stream.read(length);
          return event;
        case 2:
          event.subtype = 'copyrightNotice';
          event.text = stream.read(length);
          return event;
        case 3:
          event.subtype = 'trackName';
          event.text = stream.read(length);
          trackName = event.text;
          return event;
        case 4:
          event.subtype = 'instrumentName';
          event.text = stream.read(length);
          return event;
        case 5:
          event.subtype = 'lyrics';
          event.text = stream.read(length);
          return event;
        case 6:
          event.subtype = 'marker';
          event.text = stream.read(length);
          return event;
        case 7:
          event.subtype = 'cuePoint';
          event.text = stream.read(length);
          return event;
        case 32:
          event.subtype = 'midiChannelPrefix';
          if (length !== 1) {
            throw 'Expected length for midiChannelPrefix event is 1, got ' + length;
          }
          event.channel = stream.readInt8();
          return event;
        case 47:
          event.subtype = 'endOfTrack';
          if (length !== 0) {
            throw 'Expected length for endOfTrack event is 0, got ' + length;
          }
          return event;
        case 81:
          event.subtype = 'setTempo';
          if (length !== 3) {
            throw 'Expected length for setTempo event is 3, got ' + length;
          }
          event.microsecondsPerBeat = (stream.readInt8() << 16) + (stream.readInt8() << 8) + stream.readInt8();
          return event;
        case 84:
          event.subtype = 'smpteOffset';
          if (length !== 5) {
            throw 'Expected length for smpteOffset event is 5, got ' + length;
          }
          var hourByte = stream.readInt8();
          event.frameRate = ({
            0: 24, 32: 25, 64: 29, 96: 30
          })[hourByte & 96];
          event.hour = hourByte & 31;
          event.min = stream.readInt8();
          event.sec = stream.readInt8();
          event.frame = stream.readInt8();
          event.subframe = stream.readInt8();
          return event;
        case 88:
          event.subtype = 'timeSignature';
          if (length !== 4) {
            throw 'Expected length for timeSignature event is 4, got ' + length;
          }
          event.numerator = stream.readInt8();
          event.denominator = Math.pow(2, stream.readInt8());
          event.metronome = stream.readInt8();
          event.thirtyseconds = stream.readInt8();
          return event;
        case 89:
          event.subtype = 'keySignature';
          if (length !== 2) {
            throw 'Expected length for keySignature event is 2, got ' + length;
          }
          event.key = stream.readInt8(true);
          event.scale = stream.readInt8();
          return event;
        case 127:
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
    } else if (eventTypeByte == 240) {
      event.type = 'sysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else if (eventTypeByte == 247) {
      event.type = 'dividedSysEx';
      length = stream.readVarInt();
      event.data = stream.read(length);
      return event;
    } else {
      throw 'Unrecognised MIDI event type byte: ' + eventTypeByte;
    }
  } else {
    /* channel event */
    var param1 = undefined;
    if ((eventTypeByte & 128) === 0) {
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
    event.channel = eventTypeByte & 15;
    event.type = 'channel';
    switch (eventType) {
      case 8:
        event.subtype = 'noteOff';
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        return event;
      case 9:
        event.noteNumber = param1;
        event.velocity = stream.readInt8();
        if (event.velocity === 0) {
          event.subtype = 'noteOff';
        } else {
          event.subtype = 'noteOn';
          //console.log('noteOn');
        }
        return event;
      case 10:
        event.subtype = 'noteAftertouch';
        event.noteNumber = param1;
        event.amount = stream.readInt8();
        return event;
      case 11:
        event.subtype = 'controller';
        event.controllerType = param1;
        event.value = stream.readInt8();
        return event;
      case 12:
        event.subtype = 'programChange';
        event.programNumber = param1;
        return event;
      case 13:
        event.subtype = 'channelAftertouch';
        event.amount = param1;
        //if(trackName === 'SH-S1-44-C09 L=SML IN=3'){
        //    console.log('channel pressure', trackName, param1);
        //}
        return event;
      case 14:
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
  var tracks = new Map();
  var stream = _createMIDIStream2['default'](new Uint8Array(buffer));

  var headerChunk = readChunk(stream);
  if (headerChunk.id !== 'MThd' || headerChunk.length !== 6) {
    throw 'Bad .mid file - header not found';
  }

  var headerStream = _createMIDIStream2['default'](headerChunk.data);
  var formatType = headerStream.readInt16();
  var trackCount = headerStream.readInt16();
  var timeDivision = headerStream.readInt16();

  if (timeDivision & 32768) {
    throw 'Expressing time division in SMTPE frames is not supported yet';
  }

  var header = {
    formatType: formatType,
    trackCount: trackCount,
    ticksPerBeat: timeDivision
  };

  for (var i = 0; i < trackCount; i++) {
    trackName = 'track_' + i;
    var track = [];
    var trackChunk = readChunk(stream);
    if (trackChunk.id !== 'MTrk') {
      throw 'Unexpected chunk - expected MTrk, got ' + trackChunk.id;
    }
    var trackStream = _createMIDIStream2['default'](trackChunk.data);
    while (!trackStream.eof()) {
      var _event = readEvent(trackStream);
      track.push(_event);
    }
    tracks.set(trackName, track);
  }

  return {
    header: header,
    tracks: tracks
  };
}

module.exports = exports['default'];

},{"./midi_stream":"/home/abudaan/workspace/qambi/src/midi_stream.js"}],"/home/abudaan/workspace/qambi/src/midi_stream.js":[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createMIDIStream;
/*
  Wrapper for accessing bytes through sequential reads

  based on: https://github.com/gasman/jasmid
  adapted to work with ArrayBuffer -> Uint8Array
*/

'use strict';

var fcc = String.fromCharCode;

var MIDIStream = (function () {

  // buffer is Uint8Array

  function MIDIStream(buffer) {
    _classCallCheck(this, MIDIStream);

    this.buffer = buffer;
    this.position = 0;
  }

  _createClass(MIDIStream, [{
    key: 'read',

    /* read string or any number of bytes */
    value: function read(length) {
      var toString = arguments[1] === undefined ? true : arguments[1];

      var result = undefined;

      if (toString) {
        result = '';
        for (var i = 0; i < length; i++, this.position++) {
          result += fcc(this.buffer[this.position]);
        }
        return result;
      } else {
        result = [];
        for (var i = 0; i < length; i++, this.position++) {
          result.push(this.buffer[this.position]);
        }
        return result;
      }
    }
  }, {
    key: 'readInt32',

    /* read a big-endian 32-bit integer */
    value: function readInt32() {
      var result = (this.buffer[this.position] << 24) + (this.buffer[this.position + 1] << 16) + (this.buffer[this.position + 2] << 8) + this.buffer[this.position + 3];
      this.position += 4;
      return result;
    }
  }, {
    key: 'readInt16',

    /* read a big-endian 16-bit integer */
    value: function readInt16() {
      var result = (this.buffer[this.position] << 8) + this.buffer[this.position + 1];
      this.position += 2;
      return result;
    }
  }, {
    key: 'readInt8',

    /* read an 8-bit integer */
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
  }, {
    key: 'readVarInt',

    /* read a MIDI-style letiable-length integer
      (big-endian value in groups of 7 bits,
      with top bit set to signify that another byte follows)
    */
    value: function readVarInt() {
      var result = 0;
      while (true) {
        var b = this.readInt8();
        if (b & 128) {
          result += b & 127;
          result <<= 7;
        } else {
          /* b is the last byte */
          return result + b;
        }
      }
    }
  }]);

  return MIDIStream;
})();

exports.MIDIStream = MIDIStream;

function createMIDIStream(buffer) {
  return new MIDIStream(buffer);
}

},{}],"/home/abudaan/workspace/qambi/src/note.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

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

exports.createNote = createNote;
exports.getNoteNumber = getNoteNumber;
exports.getNoteName = getNoteName;
exports.getNoteOctave = getNoteOctave;
exports.getFullNoteName = getFullNoteName;
exports.getFrequency = getFrequency;
exports.isBlackKey = isBlackKey;

var _getConfig = require('./config');

var _getConfig2 = _interopRequireWildcard(_getConfig);

var _log$info$warn$error$typeString = require('./util');

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

var errorMsg = undefined,
    warningMsg = undefined,
    config = _getConfig2['default'](),
    pow = Math.pow,
    floor = Math.floor;

var noteNames = {
  sharp: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
  flat: ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
  'enharmonic-sharp': ['B#', 'C#', 'C##', 'D#', 'D##', 'E#', 'F#', 'F##', 'G#', 'G##', 'A#', 'A##'],
  'enharmonic-flat': ['Dbb', 'Db', 'Ebb', 'Eb', 'Fb', 'Gbb', 'Gb', 'Abb', 'Ab', 'Bbb', 'Bb', 'Cb']
};
function createNote() {
  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var numArgs = args.length,
      data = undefined,
      octave = undefined,
      noteName = undefined,
      noteNumber = undefined,
      noteNameMode = undefined,
      arg0 = args[0],
      arg1 = args[1],
      arg2 = args[2],
      type0 = _log$info$warn$error$typeString.typeString(arg0),
      type1 = _log$info$warn$error$typeString.typeString(arg1),
      type2 = _log$info$warn$error$typeString.typeString(arg2);

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
  } else if (numArgs === 2 && _log$info$warn$error$typeString.typeString(arg0) === 'number' && _log$info$warn$error$typeString.typeString(arg1) === 'string') {
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
    _log$info$warn$error$typeString.error(errorMsg);
    return false;
  }

  if (warningMsg) {
    _log$info$warn$error$typeString.warn(warningMsg);
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

function _getNoteName(number) {
  var mode = arguments[1] === undefined ? config.get('noteNameMode') : arguments[1];

  //let octave = Math.floor((number / 12) - 2), // → in Cubase central C = C3 instead of C4
  var octave = floor(number / 12 - 1);
  var noteName = noteNames[mode][number % 12];
  return [noteName, octave];
}

function _getNoteNumber(name, octave) {
  var keys = Object.keys(noteNames);
  var index = undefined;

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
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  //number = (index + 12) + (octave * 12) + 12; // → in Cubase central C = C3 instead of C4
  var number = index + 12 + octave * 12; // → midi standard + scientific naming, see: http://en.wikipedia.org/wiki/Middle_C and http://en.wikipedia.org/wiki/Scientific_pitch_notation

  if (number < 0 || number > 127) {
    errorMsg = 'please provide a note between C0 and G10';
    return;
  }
  return number;
}

function _getFrequency(number) {
  return config.get('pitch') * pow(2, (number - 69) / 12); // midi standard, see: http://en.wikipedia.org/wiki/MIDI_Tuning_Standard
}

// TODO: calculate note from frequency
function _getPitch(hertz) {}

function _checkNoteNameMode(mode) {
  var keys = Object.keys(noteNames);
  var result = keys.find(function (x) {
    return x === mode;
  }) !== undefined;
  if (result === false) {
    mode = config.get('noteNameMode');
    warningMsg = mode + ' is not a valid note name mode, using "' + mode + '" instead';
  }
  return mode;
}

function _checkNoteName() {
  for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var numArgs = args.length,
      arg0 = args[0],
      arg1 = args[1],
      char = undefined,
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
        if (!_iteratorNormalCompletion2 && _iterator2['return']) {
          _iterator2['return']();
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
      if (!_iteratorNormalCompletion3 && _iterator3['return']) {
        _iterator3['return']();
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
  var black = undefined;

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
  for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.number;
  }
  return errorMsg;
}

function getNoteName() {
  for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.name;
  }
  return false;
}

function getNoteOctave() {
  for (var _len5 = arguments.length, args = Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.octave;
  }
  return false;
}

function getFullNoteName() {
  for (var _len6 = arguments.length, args = Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.fullName;
  }
  return false;
}

function getFrequency() {
  for (var _len7 = arguments.length, args = Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    args[_key7] = arguments[_key7];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.frequency;
  }
  return false;
}

function isBlackKey() {
  for (var _len8 = arguments.length, args = Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    args[_key8] = arguments[_key8];
  }

  var note = createNote.apply(undefined, args);
  if (note) {
    return note.blackKey;
  }
  return false;
}

//fm  =  2(m−69)/12(440 Hz).

},{"./config":"/home/abudaan/workspace/qambi/src/config.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/parse_events.js":[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.parseTimeEvents = parseTimeEvents;
exports.parseEvents = parseEvents;

var _getNiceTime = require('./util');

'use strict';

var ppq = undefined,
    bpm = undefined,
    factor = undefined,
    nominator = undefined,
    denominator = undefined,
    playbackSpeed = undefined,
    bar = undefined,
    beat = undefined,
    sixteenth = undefined,
    tick = undefined,
    ticks = undefined,
    millis = undefined,
    millisPerTick = undefined,
    secondsPerTick = undefined,
    ticksPerBeat = undefined,
    ticksPerBar = undefined,
    ticksPerSixteenth = undefined,
    numSixteenth = undefined,
    diffTicks = undefined;

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

function parseTimeEvents(song) {
  //console.time('parse time events ' + song.name);
  var timeEvents = song._timeEvents;
  var type = undefined;
  var event = undefined;

  ppq = song.ppq;
  bpm = song.bpm;
  nominator = song.nominator;
  denominator = song.denominator;
  playbackSpeed = song.playbackSpeed;
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

      event.song = song;
      type = event.type;
      updatePosition(event);

      switch (type) {

        case 81:
          bpm = event.bpm;
          setTickDuration();
          break;

        case 88:
          nominator = event.nominator;
          denominator = event.denominator;
          setTicksPerBeat();
          break;

        default:
          continue;
      }

      //time data of time event is valid from (and included) the position of the time event
      updateEvent(event);
      //console.log(event.barsAsString);
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  song.lastEventTmp = event;
  //console.log(event);
  //console.log(timeEvents);
}

function parseEvents(song, events) {

  var event = undefined;
  var numEvents = events.length;
  var startEvent = 0;
  var lastEventTick = 0;

  events.sort(function (a, b) {
    return a.sortIndex - b.sortIndex;
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

    switch (event.type) {

      case 81:
        bpm = event.bpm;
        millis = event.millis;
        millisPerTick = event.millisPerTick;
        secondsPerTick = event.secondsPerTick;
        //console.log(millisPerTick,event.millisPerTick);
        //console.log(event);
        break;

      case 88:
        factor = event.factor;
        nominator = event.nominator;
        denominator = event.denominator;
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
    }

    lastEventTick = event.ticks;
  }
  song.lastEventTmp = event;
}

function updateEvent(event) {

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

  var timeData = _getNiceTime.getNiceTime(millis);

  event.hour = timeData.hour;
  event.minute = timeData.minute;
  event.second = timeData.second;
  event.millisecond = timeData.millisecond;
  event.timeAsString = timeData.timeAsString;
  event.timeAsArray = timeData.timeAsArray;
}

},{"./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/part.js":[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createPart = createPart;

var _info = require('./util.js');

var _MIDIEvent = require('./midi_event.js');

var _AudioEvent = require('./audio_event.js');

'use strict';

var partId = 0;

var Part = (function () {
  function Part() {
    var config = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Part);

    this.id = 'P' + partId++ + Date.now();
    this._events = [];
    this._needsUpdate = false;
    this.ticks = 0;

    this._eventsMap = new Map();
    this._newEvents = new Map();
    //this._movedEvents = new Map();
    //this._removedEvents = new Map();
    //this._transposedEvents = new Map();

    if (config.events) {
      this.addEvents(config.events);
    }
    this.name = config.name || this.id;
    config = null;
  }

  _createClass(Part, [{
    key: 'addEvent',
    value: function addEvent(event) {
      if (event instanceof _MIDIEvent.MIDIEvent || event instanceof _AudioEvent.AudioEvent) {
        event.state = 'new';
        this._needsUpdate = true;
        this._eventsMap.set(event.id, event);
        return this; // make it chainable
      }
    }
  }, {
    key: 'addEvents',
    value: function addEvents(events) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _event = _step.value;

          this.addEvent(_event);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'removeEvent',
    value: function removeEvent(event) {
      if (this._eventsMap.has(event.id)) {
        event.reset(true, false, false);
        this._needsUpdate = true;
        return this; // make it chainable
      }
    }
  }, {
    key: 'removeEvents',
    value: function removeEvents(events) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _event2 = _step2.value;

          this.removeEvent(_event2);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'moveEvent',
    value: function moveEvent(event, ticks) {
      if (this._eventsMap.has(event.id)) {
        event.move(ticks);
        this._needsUpdate = true;
        return this; // make it chainable
      }
    }
  }, {
    key: 'moveEvents',
    value: function moveEvents(events) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = events[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _event3 = _step3.value;

          this.moveEvent(_event3);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'transposeEvent',
    value: function transposeEvent(event, semitones) {
      if (this._eventsMap.has(event.id)) {
        if (event.type !== 128 && event.type !== 144) {
          return;
        }
        event.transpose(semitones);
        this._needsUpdate = true;
        return this; // make it chainable
      }
    }
  }, {
    key: 'transposeEvents',
    value: function transposeEvents(events) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = events[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var _event4 = _step4.value;

          this.transposeEvent(_event4);
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._events;
    }
  }, {
    key: 'update',
    value: function update() {
      var _this = this;

      if (this._needsUpdate === false) {
        return;
      }

      var numberOfEventsHasChanged = false;
      var updateEvents = false;
      /*
          Array.from(this._eventsMap.values()).forEach((event) => {
            if(event.state === 'removed'){
              this._eventsMap.delete(event.id);
              this._removedEvents.set(event.id, event);
              numberOfEventsHasChanged = true;
            }else if(event.state === 'new'){
              this._eventsMap.set(event.id, event);
              this._newEvents.set(event.id, event);
              numberOfEventsHasChanged = true;
            }else if(event.state === 'moved'){
              this._movedEvents.set(event.id, event);
            }else if(event.state === 'transposed'){
              this._transposedEvents.set(event.id, event);
            }
            event.state = 'clean';
          });
      */
      Array.from(this._eventsMap.values()).forEach(function (event) {
        if (event.state === 'removed') {
          _this._eventsMap['delete'](event.id);
          // in case a new event gets deleted before part.update() is called
          _this._newEvents['delete'](event.id);
          numberOfEventsHasChanged = true;
        } else if (event.state === 'new') {
          _this._eventsMap.set(event.id, event);
          _this._newEvents.set(event.id, event);
          numberOfEventsHasChanged = true;
        } else if (event.state !== 'clean') {
          updateEvents = true;
        }
      });

      // if number of events has changed update the _events array and the _eventsMap map
      if (numberOfEventsHasChanged === true) {
        this._events = [];
        Array.from(this._eventsMap.values()).forEach(function (event) {
          _this._events.push(event);
        });
      }

      if (numberOfEventsHasChanged === true || updateEvents === true) {
        this._events.sort(function (a, b) {
          return a.ticks <= b.ticks ? -1 : 1;
        });
      }

      // create notes -> @TODO: only necessary if number of events has changed
      var notes = {};
      var n = 0;
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this._events[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _event5 = _step5.value;

          if (_event5.type === 144) {
            notes[_event5.noteNumber] = _event5;
          } else if (_event5.type === 128) {
            var noteOn = notes[_event5.noteNumber];
            //console.log(event.noteNumber, noteOn);
            var noteOff = _event5;
            if (noteOn === undefined) {
              _info.info('no note on event!', n++);
              continue;
            }
            noteOn.noteOff = noteOff;
            noteOff.noteOn = noteOn;
            noteOn.durationTicks = noteOff.ticks - noteOn.ticks;
            delete notes[_event5.noteNumber];
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      this._needsUpdate = false;
    }
  }]);

  return Part;
})();

exports.Part = Part;

function createPart(config) {
  return new Part(config);
}

},{"./audio_event.js":"/home/abudaan/workspace/qambi/src/audio_event.js","./midi_event.js":"/home/abudaan/workspace/qambi/src/midi_event.js","./util.js":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/sample.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createSample;

var _getConfig = require('./config.js');

var _getConfig2 = _interopRequireWildcard(_getConfig);

'use strict';

var config = _getConfig2['default']();

var Sample = (function () {
  function Sample(sampleData, event) {
    _classCallCheck(this, Sample);

    if (sampleData === -1) {
      // create simple synth sample
      this.source = config.context.createOscillator();
      this.source.type = 'sine';
      this.source.frequency.value = event.frequency;
      this.source.connect(config.destination);
    }
  }

  _createClass(Sample, [{
    key: 'start',
    value: function start() {
      console.log(this.source);
      this.source.start();
    }
  }]);

  return Sample;
})();

function createSample(sampleData, event) {
  return new Sample(sampleData, event);
}

module.exports = exports['default'];

},{"./config.js":"/home/abudaan/workspace/qambi/src/config.js"}],"/home/abudaan/workspace/qambi/src/scheduler.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _typeString = require('./util.js');

var _getConfig = require('./config');

var _getConfig2 = _interopRequireWildcard(_getConfig);

var _createMIDIEvent = require('./midi_event');

var _createMIDIEvent2 = _interopRequireWildcard(_createMIDIEvent);

'use strict';

var config = _getConfig2['default']();

var Scheduler = (function () {
  function Scheduler(song) {
    _classCallCheck(this, Scheduler);

    this.song = song;
    this.looped = false;
    this.notes = {};
    this.audioEvents = {};
  }

  _createClass(Scheduler, [{
    key: 'updateSong',
    value: function updateSong() {
      //this.events = this.song.eventsMidiAudioMetronome;
      this.events = this.song.getEvents();
      this.numEvents = this.events.length;
      this.index = 0;
      this.maxtime = 0;
      this.notes = {};
      this.audioEvents = this.song.getAudioEvents();
      this.numAudioEvents = this.audioEvents.length;
      this.scheduledAudioEvents = {};
      this.looped = false;
      this.setIndex(this.song.millis);
      //console.log('Scheduler.setIndex', this.index, this.numEvents);
    }
  }, {
    key: 'setIndex',

    // get the index of the event that has its millis value at or right after the provided millis value
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
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      //console.log(millis);
      this.beyondLoop = false;
      if (millis > this.song.loopEnd) {
        this.beyondLoop = true;
      }

      this.scheduledAudioEvents = {};
    }
  }, {
    key: 'getDanglingAudioEvents',

    /*
      A dangling audio event start before, and ends after the current position of the playhead. We have to calculate the difference between
      the start of the sample (event.millis) and the position of the playhead (song.millis). This value is the playheadOffset, and the sample
      starts the number of seconds of the playheadOffset into the sample.
       Also the audio event is scheduled the number of milliseconds of the playhead later to keep it in sync with the rest of the song.
       The playheadOffset is applied to the audio sample in audio_track.js
    */
    value: function getDanglingAudioEvents(millis, events) {
      var num = 0;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.audioEvents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _event2 = _step2.value;

          if (_event2.millis < millis && _event2.endMillis > millis) {
            _event2.playheadOffset = millis - _event2.millis;
            _event2.time = this.startTime + _event2.millis - this.songStartMillis + _event2.playheadOffset;
            _event2.playheadOffset /= 1000;
            this.scheduledAudioEvents[_event2.id] = _event2;
            //console.log('getDanglingAudioEvents', event.id);
            events.push(_event2);
            num++;
          } else {
            _event2.playheadOffset = 0;
          }
          //console.log('playheadOffset', event.playheadOffset);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      //console.log('getDanglingAudioEvents', num);
      return events;
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      var i,
          event,
          events = [],
          note,
          noteOn,
          noteOff,
          endMillis,
          endTicks,
          diff,
          buffertime,
          audioEvent;

      buffertime = config.bufferTime * 1000;
      if (this.song.doLoop === true && this.song.loopDuration < buffertime) {
        this.maxtime = this.songMillis + this.song.loopDuration - 1;
        //console.log(maxtime, this.song.loopDuration);
      }

      if (this.song.doLoop === true) {

        if (this.maxtime >= this.song.loopEnd && this.beyondLoop === false) {
          //if(this.maxtime >= this.song.loopEnd && this.prevMaxtime < this.song.loopEnd){
          //if(this.maxtime >= this.song.loopEnd && this.song.jump !== true){

          diff = this.maxtime - this.song.loopEnd;
          this.maxtime = this.song.loopStart + diff;

          //console.log(maxtime, this.song.loopEnd, diff);
          if (this.looped === false) {
            //console.log(this.song.millis, maxtime, diff);
            this.looped = true;
            //console.log('LOOP', this.song.loopEnd, this.maxtime);
            for (i = this.index; i < this.numEvents; i++) {
              event = this.events[i];
              if (event.millis < this.song.loopEnd) {
                //console.log('  ', event.track.name, maxtime, this.index, this.numEvents);
                event.time = this.startTime + event.millis - this.songStartMillis;
                events.push(event);
                this.index++;
              } else {
                break;
              }
            }

            // stop overflowing notes-> move the note off event to the position of the right locator (end of the loop)
            endTicks = this.song.loopEndTicks - 1;
            endMillis = this.song.getPosition('ticks', endTicks).millis;
            for (i in this.notes) {
              if (this.notes.hasOwnProperty(i)) {
                note = this.notes[i];
                noteOn = note.noteOn;
                noteOff = note.noteOff;
                if (noteOff.millis <= this.song.loopEnd) {
                  continue;
                }
                event = _createMIDIEvent2['default'](endTicks, 128, noteOn.data1, 0);
                event.millis = endMillis;
                event.part = noteOn.part;
                event.track = noteOn.track;
                event.midiNote = noteOn.midiNote;
                event.time = this.startTime + event.millis - this.songStartMillis;
                events.push(event);
              }
            }
            // stop overflowing audio samples
            for (i in this.scheduledAudioEvents) {
              if (this.scheduledAudioEvents.hasOwnProperty(i)) {
                audioEvent = this.scheduledAudioEvents[i];
                if (audioEvent.endMillis > this.song.loopEnd) {
                  audioEvent.stopSample(this.song.loopEnd / 1000);
                  delete this.scheduledAudioEvents[i];
                  //console.log('stopping audio event', i);
                }
              }
            }
            this.notes = {};
            this.setIndex(this.song.loopStart);
            this.song.startTime += this.song.loopDuration;
            this.startTime = this.song.startTime;
            // get the audio events that start before song.loopStart
            this.getDanglingAudioEvents(this.song.loopStart, events);
          }
        } else {
          this.looped = false;
        }
      }

      if (this.firstRun === true) {
        this.getDanglingAudioEvents(this.song.millis, events);
        this.firstRun = false;
      }

      for (i = this.index; i < this.numEvents; i++) {
        event = this.events[i];

        if (event.millis < this.maxtime) {
          // if(this.song.bar >= 6 && event.track.name === 'Sonata # 3'){
          //     console.log('  song:', this.song.millis, 'event:', event.millis, ('(' + event.type + ')'), 'max:', maxtime, 'id:', event.midiNote.id);
          // }
          event.time = this.startTime + event.millis - this.songStartMillis;

          if (event.type === 144 || event.type === 128) {
            if (event.midiNote !== undefined && event.midiNote.noteOff !== undefined) {
              if (event.type === 144) {
                this.notes[event.midiNote.id] = event.midiNote;
              } else if (event.type === 128) {
                delete this.notes[event.midiNote.id];
              }
              events.push(event);
            }
          } else if (event.type === 'audio') {
            if (this.scheduledAudioEvents[event.id] !== undefined) {
              // @TODO: delete the entry in this.scheduledAudioEvents after the sample has finished
              // -> this happens when you move the playhead outside a loop if doLoop is true
              //console.log('this shouldn\'t happen!');
              //continue;
              audioEvent = this.scheduledAudioEvents[event.id];
              if (audioEvent.sample !== undefined && audioEvent.sample.source !== undefined) {
                audioEvent.stopSample(0);
                // }else{
                //     continue;
              }
            }
            this.scheduledAudioEvents[event.id] = event;
            //console.log('scheduling', event.id);
            // the scheduling time has to be compensated with the playheadOffset (in millis)
            event.time = event.time + event.playheadOffset * 1000;
            events.push(event);
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
    value: function update() {
      var i, event, numEvents, events, track, channel;

      this.prevMaxtime = this.maxtime;

      if (this.song.precounting === true) {
        this.songMillis = this.song.metronome.millis;
        this.maxtime = this.songMillis + config.bufferTime * 1000;
        events = Array.from(this.song.metronome.getPrecountEvents(this.maxtime));

        if (this.maxtime > this.song.metronome.endMillis) {
          // start scheduling events of the song -> add the first events of the song
          this.songMillis = 0; //this.song.millis;
          this.maxtime = this.song.millis + config.bufferTime * 1000;
          this.startTime = this.song.startTime;
          this.startTime2 = this.song.startTime2;
          this.songStartMillis = this.song.startMillis;
          events = this.getEvents();
        }
      } else {
        this.songMillis = this.song.millis;
        this.maxtime = this.songMillis + config.bufferTime * 1000;
        this.startTime = this.song.startTime;
        this.startTime2 = this.song.startTime2;
        this.songStartMillis = this.song.startMillis;
        events = this.getEvents();
      }

      numEvents = events.length;

      //for(i = events.length - 1; i >= 0; i--){
      for (i = 0; i < numEvents; i++) {
        event = events[i];
        track = event.track;
        //console.log(track);
        if (track === undefined || event.mute === true || event.part.mute === true || event.track.mute === true || event.track.type === 'metronome' && this.song.useMetronome === false) {
          continue;
        }

        if (event.type === 'audio') {
          event.time /= 1000;
          track.audio.processEvent(event);
        } else {

          if (track.routeToMidiOut === false) {
            // if(event.type === 144){
            //     console.log(event.time/1000, sequencer.getTime(), event.time/1000 - sequencer.getTime());
            // }
            event.time /= 1000;
            //console.log('scheduled', event.type, event.time, event.midiNote.id);
            //console.log(track.instrument.processEvent);
            track.instrument.processEvent(event);
          } else {
            channel = track.channel;
            if (channel === 'any' || channel === undefined || isNaN(channel) === true) {
              channel = 0;
            }
            for (var key in Object.keys(track.midiOutputs)) {
              var midiOutput = track.midiOutputs[key];
              if (event.type === 128 || event.type === 144 || event.type === 176) {
                //midiOutput.send([event.type, event.data1, event.data2], event.time + sequencer.midiOutLatency);
                midiOutput.send([event.type + channel, event.data1, event.data2], event.time);
              } else if (event.type === 192 || event.type === 224) {
                midiOutput.send([event.type + channel, event.data1], event.time);
              }
            }
            // needed for Song.resetExternalMidiDevices()
            this.lastEventTime = event.time;
          }
        }
      }
    }
  }, {
    key: 'unschedule',
    value: function unschedule() {
      var args = Array.prototype.slice.call(arguments),
          events = [],
          i,
          e,
          track,
          instrument;

      var loop = (function (_loop) {
        function loop(_x, _x2, _x3, _x4) {
          return _loop.apply(this, arguments);
        }

        loop.toString = function () {
          return _loop.toString();
        };

        return loop;
      })(function (data, i, maxi, events) {
        var arg;
        for (i = 0; i < maxi; i++) {
          arg = data[i];
          if (arg === undefined) {
            continue;
          } else if (arg.className === 'MidiEvent') {
            events.push(arg);
          } else if (arg.className === 'MidiNote') {
            events.push(arg.noteOn);
          } else if (_typeString.typeString(arg) === 'array') {
            loop(arg, 0, arg.length);
          }
        }
      });

      loop(args, 0, args.length, events);

      for (i = events.length - 1; i >= 0; i--) {
        e = events[i];
        track = e.track;
        instrument = track.instrument;
        if (instrument) {
          instrument.unscheduleEvent(e);
        }
      }
    }
  }, {
    key: 'reschedule',
    value: function reschedule() {
      var i,
          track,
          numTracks = this.song.numTracks,
          tracks = this.song.tracks;

      for (i = 0; i < numTracks; i++) {
        track = tracks[i];
        track.instrument.reschedule(this.song);
      }
    }
  }]);

  return Scheduler;
})();

exports['default'] = Scheduler;
module.exports = exports['default'];

},{"./config":"/home/abudaan/workspace/qambi/src/config.js","./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./util.js":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/sequencer.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _getConfig = require('./config.js');

var _getConfig2 = _interopRequireWildcard(_getConfig);

//import polyFill from './polyfill.js';

var _initAudio = require('./init_audio.js');

var _initAudio2 = _interopRequireWildcard(_initAudio);

var _initMidi = require('./init_midi.js');

var _initMidi2 = _interopRequireWildcard(_initMidi);

var _createSong = require('./song.js');

var _createTrack = require('./track.js');

var _createMIDIEvent = require('./midi_event.js');

var _createInstrument = require('./instrument.js');

var _parseMIDIFile = require('./midi_parse.js');

var _parseMIDIFile2 = _interopRequireWildcard(_parseMIDIFile);

var _createSongFromMIDIFile = require('./song_from_midifile.js');

var _createSongFromMIDIFile2 = _interopRequireWildcard(_createSongFromMIDIFile);

var _start = require('./heartbeat.js');

var _ajax = require('./util.js');

var _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey = require('./note.js');

/*
  This is the main module of the library: it creates the sequencer object and functionality from other modules gets mixed in
*/

'use strict';

// required by babelify for transpiling es6
require('babelify/polyfill');

var sequencer = {};
var config = undefined;
var debugLevel = undefined;

function init() {
  return new Promise(executor);
}

function executor(resolve, reject) {
  //polyfill();
  config = _getConfig2['default']();
  // the debug level has been set before sequencer.init() so add it to the config object
  if (debugLevel !== undefined) {
    config.debugLevel = debugLevel;
  }

  if (config === false) {
    reject('The WebAudio API hasn\'t been implemented in ' + config.browser + ', please use any other browser');
  } else {
    // create the context and share it internally via the config object
    config.context = new window.AudioContext();
    config.destination = config.context.destination;
    // add unlock method for ios devices
    // unlockWebAudio is called when the user called Song.play(), because we assume that the user presses a button to start the song.
    if (config.os !== 'ios') {
      Object.defineProperty(sequencer, 'unlockWebAudio', { value: function value() {} });
    } else {
      Object.defineProperty(sequencer, 'unlockWebAudio', {
        value: function value() {
          var src = config.context.createOscillator(),
              gainNode = config.context.createGain();
          gainNode.gain.value = 0;
          src.connect(gainNode);
          gainNode.connect(config.context.destination);
          if (src.noteOn !== undefined) {
            src.start = src.noteOn;
            src.stop = src.noteOff;
          }
          src.start(0);
          src.stop(0.001);
          // remove function after first use
          Object.defineProperty(sequencer, 'unlockWebAudio', { value: function value() {} });
        },
        configurable: true
      });
    }

    _initAudio2['default'](config.context).then(function onFulfilled(data) {

      config.legacy = data.legacy; // true if the browser uses an older version of the WebAudio API, source.noteOn() and source.noteOff instead of source.start() and source.stop()
      config.lowtick = data.lowtick; // metronome sample
      config.hightick = data.hightick; //metronome sample
      config.masterGainNode = data.gainNode;
      config.masterCompressor = data.compressor;
      config.getTime = data.getTime;

      Object.defineProperty(sequencer, 'time', { get: data.getTime });
      Object.defineProperty(sequencer, 'audioContext', { get: data.getAudioContext });
      Object.defineProperty(sequencer, 'masterVolume', { get: data.getMasterVolume, set: data.setMasterVolume });
      Object.defineProperty(sequencer, 'enableMasterCompressor', { value: data.enableMasterCompressor });
      Object.defineProperty(sequencer, 'configureMasterCompressor', { value: data.configureMasterCompressor });

      _initMidi2['default']().then(function onFulfilled(midi) {

        Object.defineProperty(sequencer, 'midiInputs', { value: midi.inputs });
        Object.defineProperty(sequencer, 'midiOutputs', { value: midi.outputs });

        //Object.seal(sequencer);
        _start.start(); // start heartbeat
        resolve();
      }, function onRejected(e) {
        if (e !== undefined && typeof e === 'string') {
          reject(e);
        } else if (config.browser === 'chrome' || config.browser === 'chromium') {
          reject('Web MIDI API not enabled');
        } else {
          reject('Web MIDI API not supported');
        }
      });
    }, function onRejected(e) {
      reject(e);
    });
  }
}

Object.defineProperty(sequencer, 'name', { value: 'qambi' });
Object.defineProperty(sequencer, 'init', { value: init });
Object.defineProperty(sequencer, 'ui', { value: {}, writable: true }); // ui functions

// add util functions
var util = {};
Object.defineProperty(util, 'ajax', { value: _ajax.ajax });
Object.defineProperty(sequencer, 'util', { value: util });

//TODO: create methods getSongs, removeSong and so on
//Object.defineProperty(sequencer, 'activeSongs', {activeSongs: {}, writable: true}); // the songs that are currently loaded in memory

Object.defineProperty(sequencer, 'debugLevel', {
  get: function get() {
    return config.debugLevel;
  },
  set: function set(value) {
    if (config !== undefined) {
      config.debugLevel = value;
    } else {
      // allow the debugLevel to be set before sequencer.init();
      debugLevel = value;
    }
  }
});

Object.defineProperty(sequencer, 'createMIDIEvent', { value: _createMIDIEvent.createMIDIEvent });
Object.defineProperty(sequencer, 'createTrack', { value: _createTrack.createTrack });
Object.defineProperty(sequencer, 'createSong', { value: _createSong.createSong });
Object.defineProperty(sequencer, 'createInstrument', { value: _createInstrument.createInstrument });
Object.defineProperty(sequencer, 'parseMIDIFile', { value: _parseMIDIFile2['default'] });
Object.defineProperty(sequencer, 'createSongFromMIDIFile', { value: _createSongFromMIDIFile2['default'] });

Object.defineProperty(sequencer, 'createNote', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.createNote });
Object.defineProperty(sequencer, 'getNoteNumber', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.getNoteNumber });
Object.defineProperty(sequencer, 'getNoteName', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.getNoteName });
Object.defineProperty(sequencer, 'getNoteOctave', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.getNoteOctave });
Object.defineProperty(sequencer, 'getFullNoteName', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.getFullNoteName });
Object.defineProperty(sequencer, 'getFrequency', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.getFrequency });
Object.defineProperty(sequencer, 'isBlackKey', { value: _createNote$getNoteNumber$getNoteName$getNoteOctave$getFullNoteName$getFrequency$isBlackKey.isBlackKey });

// note name modi
Object.defineProperty(sequencer, 'SHARP', { value: 'sharp' });
Object.defineProperty(sequencer, 'FLAT', { value: 'flat' });
Object.defineProperty(sequencer, 'ENHARMONIC_SHARP', { value: 'enharmonic-sharp' });
Object.defineProperty(sequencer, 'ENHARMONIC_FLAT', { value: 'enharmonic-flat' });

// standard MIDI events
Object.defineProperty(sequencer, 'NOTE_OFF', { value: 128 }); //128
Object.defineProperty(sequencer, 'NOTE_ON', { value: 144 }); //144
Object.defineProperty(sequencer, 'POLY_PRESSURE', { value: 160 }); //160
Object.defineProperty(sequencer, 'CONTROL_CHANGE', { value: 176 }); //176
Object.defineProperty(sequencer, 'PROGRAM_CHANGE', { value: 192 }); //192
Object.defineProperty(sequencer, 'CHANNEL_PRESSURE', { value: 208 }); //208
Object.defineProperty(sequencer, 'PITCH_BEND', { value: 224 }); //224
Object.defineProperty(sequencer, 'SYSTEM_EXCLUSIVE', { value: 240 }); //240
Object.defineProperty(sequencer, 'MIDI_TIMECODE', { value: 241 });
Object.defineProperty(sequencer, 'SONG_POSITION', { value: 242 });
Object.defineProperty(sequencer, 'SONG_SELECT', { value: 243 });
Object.defineProperty(sequencer, 'TUNE_REQUEST', { value: 246 });
Object.defineProperty(sequencer, 'EOX', { value: 247 });
Object.defineProperty(sequencer, 'TIMING_CLOCK', { value: 248 });
Object.defineProperty(sequencer, 'START', { value: 250 });
Object.defineProperty(sequencer, 'CONTINUE', { value: 251 });
Object.defineProperty(sequencer, 'STOP', { value: 252 });
Object.defineProperty(sequencer, 'ACTIVE_SENSING', { value: 254 });
Object.defineProperty(sequencer, 'SYSTEM_RESET', { value: 255 });

Object.defineProperty(sequencer, 'TEMPO', { value: 81 });
Object.defineProperty(sequencer, 'TIME_SIGNATURE', { value: 88 });
Object.defineProperty(sequencer, 'END_OF_TRACK', { value: 47 });

exports['default'] = sequencer;
module.exports = exports['default'];

},{"./config.js":"/home/abudaan/workspace/qambi/src/config.js","./heartbeat.js":"/home/abudaan/workspace/qambi/src/heartbeat.js","./init_audio.js":"/home/abudaan/workspace/qambi/src/init_audio.js","./init_midi.js":"/home/abudaan/workspace/qambi/src/init_midi.js","./instrument.js":"/home/abudaan/workspace/qambi/src/instrument.js","./midi_event.js":"/home/abudaan/workspace/qambi/src/midi_event.js","./midi_parse.js":"/home/abudaan/workspace/qambi/src/midi_parse.js","./note.js":"/home/abudaan/workspace/qambi/src/note.js","./song.js":"/home/abudaan/workspace/qambi/src/song.js","./song_from_midifile.js":"/home/abudaan/workspace/qambi/src/song_from_midifile.js","./track.js":"/home/abudaan/workspace/qambi/src/track.js","./util.js":"/home/abudaan/workspace/qambi/src/util.js","babelify/polyfill":"/home/abudaan/workspace/qambi/node_modules/babelify/polyfill.js"}],"/home/abudaan/workspace/qambi/src/song.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createSong = createSong;

var _sequencer = require('./sequencer');

var _sequencer2 = _interopRequireWildcard(_sequencer);

var _addEventListener$removeEventListener$dispatchEvent = require('./song_add_eventlistener');

var _log$info$warn$error$typeString = require('./util');

var _getConfig = require('./config');

var _getConfig2 = _interopRequireWildcard(_getConfig);

var _Track = require('./track');

var _Part = require('./part');

var _MIDIEvent = require('./midi_event');

var _AudioEvent = require('./audio_event');

var _Scheduler = require('./scheduler');

var _Scheduler2 = _interopRequireWildcard(_Scheduler);

var _initMidiSong$setMidiInputSong$setMidiOutputSong = require('./init_midi');

var _addTask$removeTask = require('./heartbeat');

var _parseTimeEvents$parseEvents = require('./parse_events');

'use strict';

var songId = 0,
    config = _getConfig2['default'](),
    defaultSong = config.get('defaultSong');

var Song = (function () {

  /*
    @param settings is a Map or an Object
  */

  function Song(settings) {
    _classCallCheck(this, Song);

    this.id = 'S' + songId++ + Date.now();
    this.name = this.id;
    this._events = []; // all MIDI and audio events
    this._audioEvents = []; // only audio events
    this._parts = [];
    this._tracks = [];
    this._eventsMap = new Map();
    this._partsMap = new Map();
    this._tracksMap = new Map();

    this._newTracks = [];
    this._removedTracks = [];
    //this._changedTracks = [];

    this._newParts = [];
    this._removedParts = [];
    this._changedParts = [];

    this._newEvents = [];
    this._removedEvents = [];
    this._changedEvents = [];

    this._timeEvents = []; // all tempo and time signature events
    this._allEvents = []; // all tempo and time signature events, plus all MIDI and audio events

    this._needsUpdate = false;
    this.millis = 0;

    // first add all settings from the default song
    defaultSong.forEach(function (value, key) {
      this[key] = value;
    }, this);
    /*
        // or:
        for(let[value, key] of defaultSong.entries()){
          ((key, value) => {
            this[key] = value;
          })(key, value);
        }
    */

    if (settings.timeEvents) {
      this.addTimeEvents(settings.timeEvents);
      delete settings.timeEvents;
    }

    if (settings.tracks) {
      this.addTracks(settings.tracks);
      delete settings.tracks;
    }

    // then override settings by provided settings
    if (_log$info$warn$error$typeString.typeString(settings) === 'object') {
      Object.keys(settings).forEach(function (key) {
        this[key] = settings[key];
      }, this);
    } else if (settings !== undefined) {
      settings.forEach(function (value, key) {
        this[key] = value;
      }, this);
    }

    // initialize midi for this song: add Maps for midi in- and outputs, and add eventlisteners to the midi inputs
    this.midiInputs = new Map();
    this.midiOutputs = new Map();
    _initMidiSong$setMidiInputSong$setMidiOutputSong.initMidiSong(this); // @see: init_midi.js

    this.lastBar = this.bars;
    this.pitchRange = this.highestNote - this.lowestNote + 1;
    this.factor = 4 / this.denominator;
    this.ticksPerBeat = this.ppq * this.factor;
    this.ticksPerBar = this.ticksPerBeat * this.nominator;
    this.millisPerTick = 60000 / this.bpm / this.ppq;
    this.recordId = -1;
    this.doLoop = false;
    this.illegalLoop = true;
    this.loopStart = 0;
    this.loopEnd = 0;
    this.loopDuration = 0;
    this.audioRecordingLatency = 0;
    this.grid = undefined;

    config.get('activeSongs')[this.id] = this;

    this._scheduler = new _Scheduler2['default'](this);
  }

  _createClass(Song, [{
    key: 'stop',
    value: function stop() {
      _addTask$removeTask.removeTask('repetitive', this.id);
      this.millis = 0;
      _addEventListener$removeEventListener$dispatchEvent.dispatchEvent('stop');
    }
  }, {
    key: 'play',
    value: function play() {
      var _this = this;

      _sequencer2['default'].unlockWebAudio();
      this._scheduler.firstRun = true;
      this.timeStamp = _sequencer2['default'].time * 1000;
      //this.startMillis = this.millis; // this.millis is set by playhead, use 0 for now
      this.startMillis = 0;
      _addTask$removeTask.addTask('repetitive', this.id, function () {
        pulse(_this);
      });
      _addEventListener$removeEventListener$dispatchEvent.dispatchEvent('play');
    }
  }, {
    key: 'setMidiInput',
    value: function setMidiInput(id) {
      var flag = arguments[1] === undefined ? true : arguments[1];

      _initMidiSong$setMidiInputSong$setMidiOutputSong.setMidiInputSong(this, id, flag);
    }
  }, {
    key: 'setMidiOutput',
    value: function setMidiOutput(id) {
      var flag = arguments[1] === undefined ? true : arguments[1];

      _initMidiSong$setMidiInputSong$setMidiOutputSong.setMidiOutputSong(this, id, flag);
    }
  }, {
    key: 'addMidiEventListener',
    value: (function (_addMidiEventListener) {
      function addMidiEventListener(_x) {
        return _addMidiEventListener.apply(this, arguments);
      }

      addMidiEventListener.toString = function () {
        return _addMidiEventListener.toString();
      };

      return addMidiEventListener;
    })(function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      addMidiEventListener.apply(undefined, [this].concat(args));
    })
  }, {
    key: 'addTrack',
    value: function addTrack(track) {
      if (track instanceof _Track.Track) {
        track.song = this;
        track.state = 'new';
        this._tracksMap.set(track.id, track);
      }
      return this; // make it chainable
    }
  }, {
    key: 'addTracks',
    value: function addTracks(tracks) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = tracks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var track = _step.value;

          this.addTrack(track);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'removeTrack',
    value: function removeTrack(track) {
      if (this._tracksMap.has(track.id)) {
        track.state = 'removed';
        track.reset();
      }
      return this; // make it chainable
    }
  }, {
    key: 'removeTracks',
    value: function removeTracks(tracks) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = tracks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var track = _step2.value;

          this.removeTrack(track);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return this; // make it chainable
    }
  }, {
    key: 'getTracks',
    value: function getTracks() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._tracks;
    }
  }, {
    key: 'getTrack',
    value: function getTrack(idOrName) {}
  }, {
    key: 'getParts',
    value: function getParts() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._parts;
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._events;
    }
  }, {
    key: 'getAudioEvents',
    value: function getAudioEvents() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._audioEvents;
    }
  }, {
    key: 'getTimeEvents',
    value: function getTimeEvents() {
      return this._timeEvents;
    }
  }, {
    key: 'addTimeEvent',
    value: function addTimeEvent(event) {
      var parse = arguments[1] === undefined ? true : arguments[1];

      // 1) check if event is time event
      // 2) set time signature event on the first count
      // 3) parse time events
      this._timeEvents.push(event);
      if (parse === true) {
        _parseTimeEvents$parseEvents.parseTimeEvents(this);
      }
    }
  }, {
    key: 'addTimeEvents',
    value: function addTimeEvents(events) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = events[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var _event = _step3.value;

          this.addTimeEvent(_event, false);
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3['return']) {
            _iterator3['return']();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }

      _parseTimeEvents$parseEvents.parseTimeEvents(this);
      return this;
    }
  }, {
    key: 'update',
    value: function update() {
      var _this2 = this;

      this._newTracks = [];
      //this._changedTracks = [];
      this._removedTracks = [];

      this._newParts = [];
      this._changedParts = [];
      this._removedParts = [];

      this._newEvents = [];
      this._changedEvents = [];
      this._removedEvents = [];

      var sortEvents = false;
      var sortParts = false;
      var numberOfPartsHasChanged = false;
      var numberOfEventsHasChanged = false;
      var eventsToBeParsed = [].concat(this._timeEvents);
      var partsToBeParsed = [];

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this._tracksMap.values()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var track = _step4.value;

          if (track.state === 'removed') {
            this._removedTracks.push(track.id);
            this._tracksMap['delete'](track.id);
            continue;
          } else if (track.state === 'new') {
            this._newTracks.push(track);
          }

          // track.getParts() triggers track.update()
          var parts = track.getParts();

          // get all the new parts
          if (track._newParts.size > 0) {
            numberOfPartsHasChanged = true;
            var _iteratorNormalCompletion7 = true;
            var _didIteratorError7 = false;
            var _iteratorError7 = undefined;

            try {
              for (var _iterator7 = track._newParts.values()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
                var newPart = _step7.value;

                this._partsMap.set(newPart.id, newPart);
              }
            } catch (err) {
              _didIteratorError7 = true;
              _iteratorError7 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion7 && _iterator7['return']) {
                  _iterator7['return']();
                }
              } finally {
                if (_didIteratorError7) {
                  throw _iteratorError7;
                }
              }
            }
          }

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = parts[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var part = _step8.value;

              part.update();
              if (part._newEvents.size > 0) {
                numberOfEventsHasChanged = true;
                var _iteratorNormalCompletion9 = true;
                var _didIteratorError9 = false;
                var _iteratorError9 = undefined;

                try {
                  for (var _iterator9 = part._newEvents.values()[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                    var newEvent = _step9.value;

                    this._eventsMap.set(newEvent.id, newEvent);
                  }
                } catch (err) {
                  _didIteratorError9 = true;
                  _iteratorError9 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion9 && _iterator9['return']) {
                      _iterator9['return']();
                    }
                  } finally {
                    if (_didIteratorError9) {
                      throw _iteratorError9;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8['return']) {
                _iterator8['return']();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          track.state = 'clean';
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4['return']) {
            _iterator4['return']();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this._eventsMap.values()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var _event2 = _step5.value;

          if (_event2.state === 'removed') {
            this._removedEvents.push(_event2);
            this._eventsMap['delete'](_event2.id);
            numberOfEventsHasChanged = true;
          } else if (_event2.state === 'new') {
            this._newEvents.push(_event2);
            eventsToBeParsed.push(_event2);
            numberOfEventsHasChanged = true;
          } else if (_event2.state !== 'clean') {
            this._changedEvents.push(_event2);
            eventsToBeParsed.push(_event2);
            sortEvents = true;
          }
          _event2.state = 'clean';
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5['return']) {
            _iterator5['return']();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      if (numberOfEventsHasChanged === true) {
        this._events = [];
        Array.from(this._eventsMap.values()).forEach(function (event) {
          _this2._events.push(event);
        });
      }

      if (numberOfEventsHasChanged === true || sortEvents === true) {
        // @TODO: sort on sortIndex!!
        this._events.sort(function (a, b) {
          return a.ticks <= b.ticks ? -1 : 1;
        });
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this._partsMap.values()[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var part = _step6.value;

          if (part.state === 'removed') {
            this._removedParts.push(part);
            this._partsMap['delete'](part.id);
            numberOfPartsHasChanged = true;
          } else if (part.state === 'new') {
            this._newParts.push(part);
            partsToBeParsed.push(part);
            numberOfPartsHasChanged = true;
          } else if (part.state !== 'clean') {
            this._changedParts.push(part);
            partsToBeParsed.push(part);
            sortEvents = true;
          }
          part.state = 'clean';
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6['return']) {
            _iterator6['return']();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      if (numberOfPartsHasChanged === true) {
        this._parts = [];
        Array.from(this._partsMap.values()).forEach(function (part) {
          _this2._parts.push(part);
        });
      }

      if (numberOfPartsHasChanged === true || sortParts === true) {
        // @TODO: sort on sortIndex!!
        this._parts.sort(function (a, b) {
          return a.ticks <= b.ticks ? -1 : 1;
        });
      }

      this._audioEvents = this._events.filter(function (event) {
        return event instanceof _AudioEvent.AudioEvent;
      });

      this._needsUpdate = false;
      this._scheduler.updateSong();
      debugger;
    }
  }]);

  return Song;
})();

exports.Song = Song;

Song.prototype.addEventListener = _addEventListener$removeEventListener$dispatchEvent.addEventListener;
Song.prototype.removeEventListener = _addEventListener$removeEventListener$dispatchEvent.removeEventListener;
Song.prototype.dispatchEvent = _addEventListener$removeEventListener$dispatchEvent.dispatchEvent;

function createSong(settings) {
  return new Song(settings);
}

function pulse(song) {
  var now = _sequencer2['default'].time * 1000,
      diff = now - song.timeStamp;

  song.millis += diff;
  song.timeStamp = now;
  song.scheduler.update();
}

},{"./audio_event":"/home/abudaan/workspace/qambi/src/audio_event.js","./config":"/home/abudaan/workspace/qambi/src/config.js","./heartbeat":"/home/abudaan/workspace/qambi/src/heartbeat.js","./init_midi":"/home/abudaan/workspace/qambi/src/init_midi.js","./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./parse_events":"/home/abudaan/workspace/qambi/src/parse_events.js","./part":"/home/abudaan/workspace/qambi/src/part.js","./scheduler":"/home/abudaan/workspace/qambi/src/scheduler.js","./sequencer":"/home/abudaan/workspace/qambi/src/sequencer.js","./song_add_eventlistener":"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js","./track":"/home/abudaan/workspace/qambi/src/track.js","./util":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/song_add_eventlistener.js":[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var listeners = {};

function addEventListener(id, callback) {
  listeners[id] = callback;
}

function removeEventListener(id, callback) {
  delete listeners[id];
}

function dispatchEvent(id) {
  for (var key in listeners) {
    if (key === id && listeners.hasOwnProperty(key)) {
      listeners[key](id);
    }
  }
}

exports.addEventListener = addEventListener;
exports.removeEventListener = removeEventListener;
exports.dispatchEvent = dispatchEvent;

},{}],"/home/abudaan/workspace/qambi/src/song_from_midifile.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createSongFromMIDIFile;

var _log$info$warn$error$base64ToBinary$ajax = require('./util.js');

var _parseMIDIFile = require('./midi_parse');

var _parseMIDIFile2 = _interopRequireWildcard(_parseMIDIFile);

var _MIDIEvent = require('./midi_event');

var _Part = require('./part');

var _Track = require('./track');

var _Song = require('./song');

'use strict';

function createSongFromMIDIFile(data) {

  if (data instanceof ArrayBuffer === true) {
    var buffer = new Uint8Array(data);
    return toSong(_parseMIDIFile2['default'](buffer));
  } else if (data.header !== undefined && data.tracks !== undefined) {
    return toSong(data);
  } else {
    data = _log$info$warn$error$base64ToBinary$ajax.base64ToBinary(data);
    if (data instanceof ArrayBuffer === true) {
      var buffer = new Uint8Array(data);
      return toSong(_parseMIDIFile2['default'](buffer));
    } else {
      _log$info$warn$error$base64ToBinary$ajax.error('wrong data');
    }
  }
}

function toSong(parsed) {
  var tracks = parsed.tracks;
  var ppq = parsed.header.ticksPerBeat;
  var timeEvents = [];
  var config = {
    tracks: []
  };
  var events = undefined;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = tracks.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var track = _step.value;

      var lastTicks = undefined,
          lastType = undefined;
      var ticks = 0;
      var type = undefined;
      var channel = -1;
      events = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = track[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var _event = _step2.value;

          ticks += _event.deltaTime * ppq;
          //console.log(event.subtype, event.deltaTime, tmpTicks);

          if (channel === -1 && _event.channel !== undefined) {
            channel = _event.channel;
            track.channel = channel;
          }
          type = _event.subtype;

          switch (_event.subtype) {

            case 'trackName':
              track.name = _event.text;
              //console.log('name', track.name, numTracks);
              break;

            case 'instrumentName':
              if (_event.text) {
                track.instrumentName = _event.text;
              }
              break;

            case 'noteOn':
              events.push(new _MIDIEvent.MIDIEvent(ticks, 144, _event.noteNumber, _event.velocity));
              break;

            case 'noteOff':
              events.push(new _MIDIEvent.MIDIEvent(ticks, 128, _event.noteNumber, _event.velocity));
              break;

            case 'setTempo':
              // sometimes 2 tempo events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              var bpm = 60000000 / _event.microsecondsPerBeat;

              if (ticks === lastTicks && type === lastType) {
                _log$info$warn$error$base64ToBinary$ajax.info('tempo events on the same tick', ticks, bpm);
                timeEvents.pop();
              }

              if (config.bpm === undefined) {
                config.bpm = bpm;
              }
              timeEvents.push(new _MIDIEvent.MIDIEvent(ticks, 81, bpm));
              break;

            case 'timeSignature':
              // sometimes 2 time signature events have the same position in ticks
              // we use the last in these cases (same as Cubase)
              if (lastTicks === ticks && lastType === type) {
                _log$info$warn$error$base64ToBinary$ajax.info('time signature events on the same tick', ticks, _event.numerator, _event.denominator);
                timeEvents.pop();
              }

              if (config.nominator === undefined) {
                config.nominator = _event.numerator;
                config.denominator = _event.denominator;
              }
              timeEvents.push(new _MIDIEvent.MIDIEvent(ticks, 88, _event.numerator, _event.denominator));
              break;

            case 'controller':
              events.push(new _MIDIEvent.MIDIEvent(ticks, 176, _event.controllerType, _event.value));
              break;

            case 'programChange':
              events.push(new _MIDIEvent.MIDIEvent(ticks, 192, _event.programNumber));
              break;

            case 'pitchBend':
              events.push(new _MIDIEvent.MIDIEvent(ticks, 224, _event.value));
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
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (events.length > 0) {
        config.tracks.push(new _Track.Track().addPart(new _Part.Part({ events: events })));
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator['return']) {
        _iterator['return']();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  config.ppq = ppq;
  config.timeEvents = timeEvents;
  var song = new _Song.Song(config);
  song.update();
  return song;
}
module.exports = exports['default'];

},{"./midi_event":"/home/abudaan/workspace/qambi/src/midi_event.js","./midi_parse":"/home/abudaan/workspace/qambi/src/midi_parse.js","./part":"/home/abudaan/workspace/qambi/src/part.js","./song":"/home/abudaan/workspace/qambi/src/song.js","./track":"/home/abudaan/workspace/qambi/src/track.js","./util.js":"/home/abudaan/workspace/qambi/src/util.js"}],"/home/abudaan/workspace/qambi/src/track.js":[function(require,module,exports){
'use strict';

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createTrack = createTrack;

var _Part = require('./part');

'use strict';

var trackId = 0;

var Track = (function () {
  function Track() {
    var config = arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Track);

    this.id = 'T' + trackId++ + Date.now();
    this._parts = [];
    this._events = [];
    this.state = 'clean';

    this._partsMap = new Map();
    this._eventsMap = new Map();
    this._newParts = new Map();
    //this._movedParts = new Map();
    //this._removedParts = new Map();
    //this._transposedParts = new Map();

    this._needsUpdate = false;

    if (config.parts) {
      this.addParts(config.parts);
      config.parts = null;
    }
    this.name = config.name || this.id;
    config = null;
  }

  _createClass(Track, [{
    key: 'addPart',

    /*
      addEvent(event){
        let part = new Part();
        part.track = this;
        part.addEvent(event);
        this._partsMap.set(part.id, part);
        this.numberOfPartsChanged = true;
        this._needsUpdate = true;
      }
    
      addEvents(events){
        let part = new Part();
        part.track = this;
        part.addEvents(events);
        this._partsMap.set(part.id, part);
        this.numberOfPartsChanged = true;
        this._needsUpdate = true;
      }
    */

    value: function addPart(part) {
      if (part instanceof _Part.Part) {
        part.track = this;
        part.state = 'new';
        this._partsMap.set(part.id, part);
        this._needsUpdate = true;
      }
      return this; // make it chainable
    }
  }, {
    key: 'addParts',
    value: function addParts(parts) {
      for (var part in parts) {
        this.addPart(part);
      }
      return this; // make it chainable
    }
  }, {
    key: 'removePart',
    value: function removePart(part) {
      if (this._partsMap.has(part.id)) {
        //@todo: part.reset() here, just like event.reset() -> YES!
        part.state = 'removed';
        this._needsUpdate = true;
      }
      return this; // make it chainable
    }
  }, {
    key: 'removeParts',
    value: function removeParts(parts) {
      for (var part in parts) {
        this.removePart(part);
      }
      return this; // make it chainable
    }
  }, {
    key: 'movePart',
    value: function movePart(part, ticks) {
      if (this._partsMap.has(part.id)) {
        part.moveEvents(part.events, ticks);
        if (part.state !== 'new') {
          part.state = 'moved';
        }
        this._needsUpdate = true;
      }
      return this; // make it chainable
    }
  }, {
    key: 'moveParts',
    value: function moveParts(parts, ticks) {
      for (var part in parts) {
        this.movePart(part, ticks);
      }
      return this; // make it chainable
    }
  }, {
    key: 'transposePart',
    value: function transposePart(part, semitones) {
      if (this._partsMap.has(part.id)) {
        part.transposeEvents(part.events, semitones);
        if (part.state !== 'new') {
          part.state = 'transposed';
        }
        this._needsUpdate = true;
      }
      return this; // make it chainable
    }
  }, {
    key: 'transposeParts',
    value: function transposeParts(parts, semitones) {
      for (var part in parts) {
        this.transposePart(part, semitones);
      }
      return this; // make it chainable
    }
  }, {
    key: 'getEvents',
    value: function getEvents() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._events;
    }
  }, {
    key: 'getParts',
    value: function getParts() {
      if (this._needsUpdate) {
        this.update();
      }
      return this._parts;
    }
  }, {
    key: 'reset',
    value: function reset() {}
  }, {
    key: 'update',
    value: function update() {

      // if(this._needsUpdate === false){
      //   return;
      // }

      var numberOfPartsHasChanged = false;
      var updateParts = false;
      /*
          Array.from(this._eventsMap.values()).forEach((part) => {
            if(part.state === 'removed'){
              this._partsMap.delete(part.id);
              this._removedParts.set(part.id, part);
              numberOfPartsHasChanged = true;
            }else if(part.state === 'new'){
              this._partsMap.set(part.id, part);
              this._newParts.set(part.id, part);
              numberOfPartsHasChanged = true;
            }else if(part.state === 'moved'){
              this._movedParts.set(part.id, part);
            }else if(part.state === 'transposed'){
              this._transposedParts.set(part.id, part);
            }
            part.state = 'clean';
          });
      */
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this._partsMap.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var part = _step.value;

          // part.getEvents() triggers part.update();
          var events = part.getEvents();
          // @TODO: get part._newEvents;

          if (part.state === 'removed') {
            this._partsMap['delete'](part.id);
            // in case a new part gets deleted before track.update() is called
            this._newParts['delete'](part.id);
            numberOfPartsHasChanged = true;
          } else if (part.state === 'new') {
            this._partsMap.set(part.id, part);
            this._newParts.set(part.id, part);
            numberOfPartsHasChanged = true;
          } else if (part.state !== 'clean') {
            updateParts = true;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (numberOfPartsHasChanged === true) {
        this._parts = [];
        this._events = [];
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this._partsMap.values()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var part = _step2.value;

            this._parts.push(part);
            this._events = this._events.concat(part.getEvents());
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        ;
        this._events.forEach(function (event) {
          this._eventsMap.set(event.id, event);
        });
      }

      if (numberOfPartsHasChanged === true || updateParts === true) {
        this._parts.sort(function (a, b) {
          return a.ticks <= b.ticks ? -1 : 1;
        });
        this._events.sort(function (a, b) {
          return a.ticks <= b.ticks ? -1 : 1;
        });
      }

      this._needsUpdate = false;
    }
  }]);

  return Track;
})();

exports.Track = Track;

function createTrack(config) {
  return new Track(config);
}

/*
let Track = {
    init: function(){
        let id = 'T' + trackId++ + new Date().getTime();
        Object.defineProperty(this, 'id', {
            value: id
        });
    }
};

export default function createTrack(){
  var t = Object.create(Track);
  t.init(arguments);
  return t;
}

*/

},{"./part":"/home/abudaan/workspace/qambi/src/part.js"}],"/home/abudaan/workspace/qambi/src/util.js":[function(require,module,exports){
'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slice = Array.prototype.slice;
Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.typeString = typeString;
exports.ajax = ajax;
exports.parseSamples = parseSamples;
exports.error = error;
exports.warn = warn;
exports.info = info;
exports.log = log;
exports.getNiceTime = getNiceTime;

var _getConfig = require('./config');

var _getConfig2 = _interopRequireWildcard(_getConfig);

/*
  An unorganised collection of various utility functions that are used across the library
*/

'use strict';

var console = window.console,
    mPow = Math.pow,
    mRound = Math.round,
    mFloor = Math.floor,
    mRandom = Math.random,
    config = _getConfig2['default']();
// context = config.context,
// floor = function(value){
//  return value | 0;
// },

var noteLengthNames = {
  1: 'quarter',
  2: 'eighth',
  4: 'sixteenth',
  8: '32th',
  16: '64th'
};

function typeString(o) {
  if (typeof o != 'object') {
    return typeof o;
  }

  if (o === null) {
    return 'null';
  }

  //object, array, function, date, regexp, string, number, boolean, error
  var internalClass = Object.prototype.toString.call(o).match(/\[object\s(\w+)\]/)[1];
  return internalClass.toLowerCase();
}

function ajax(config) {
  var request = new XMLHttpRequest(),
      method = config.method === undefined ? 'GET' : config.method,
      fileSize = undefined;

  function executor(resolve, reject) {

    reject = reject || function () {};
    resolve = resolve || function () {};

    request.onload = function () {
      if (request.status !== 200) {
        reject(request.status);
        return;
      }

      if (config.responseType === 'json') {
        fileSize = request.response.length;
        resolve(JSON.parse(request.response), fileSize);
        request = null;
      } else {
        resolve(request.response);
        request = null;
      }
    };

    request.onerror = function (e) {
      config.onError(e);
    };

    request.open(method, config.url, true);

    if (config.overrideMimeType) {
      request.overrideMimeType(config.overrideMimeType);
    }

    if (config.responseType) {
      if (config.responseType === 'json') {
        request.responseType = 'text';
      } else {
        request.responseType = config.responseType;
      }
    }

    if (method === 'POST') {
      request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }

    if (config.data) {
      request.send(config.data);
    } else {
      request.send();
    }
  }

  return new Promise(executor);
}

function parseSample(sample, id, every) {
  return new Promise(function (resolve, reject) {
    try {
      config.context.decodeAudioData(sample, function onSuccess(buffer) {
        //console.log(id, buffer);
        if (id !== undefined) {
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
        if (id !== undefined) {
          resolve({ id: id, buffer: undefined });
        } else {
          resolve(undefined);
        }
      });
    } catch (e) {
      //console.log('error decoding audiodata', id, e);
      //reject(e);
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    }
  });
}

function loadAndParseSample(url, id, every) {
  return new Promise(function executor(resolve, reject) {
    ajax({ url: url, responseType: 'arraybuffer' }).then(function onFulfilled(data) {
      parseSample(data, id, every).then(resolve, reject);
    }, function onRejected() {
      if (id !== undefined) {
        resolve({ id: id, buffer: undefined });
      } else {
        resolve(undefined);
      }
    });
  });
}

function parseSamples(mapping, every) {
  var key = undefined,
      sample = undefined,
      promises = [],
      type = typeString(mapping);

  every = typeString(every) === 'function' ? every : false;
  //console.log(type, mapping)
  if (type === 'object') {
    for (key in mapping) {
      if (mapping.hasOwnProperty(key)) {
        sample = mapping[key];
        if (sample.indexOf('http://') === -1) {
          promises.push(parseSample(base64ToBinary(sample), key, every));
        } else {
          promises.push(loadAndParseSample(sample, key, every));
        }
      }
    }
  } else if (type === 'array') {
    mapping.forEach(function (sample) {
      if (sample.indexOf('http://') === -1) {
        promises.push(parseSample(base64ToBinary(sample), every));
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

// adapted version of https://github.com/danguer/blog-examples/blob/master/js/base64-binary.js
function base64ToBinary(input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
      bytes = undefined,
      uarray = undefined,
      buffer = undefined,
      lkey1 = undefined,
      lkey2 = undefined,
      chr1 = undefined,
      chr2 = undefined,
      chr3 = undefined,
      enc1 = undefined,
      enc2 = undefined,
      enc3 = undefined,
      enc4 = undefined,
      i = undefined,
      j = 0;

  bytes = Math.ceil(3 * input.length / 4);
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

function error() {
  if (config.get('debugLevel') >= 1) {
    //console.error(...arguments);
    //console.trace();
    console.groupCollapsed.apply(console, ['ERROR:'].concat(_slice.call(arguments)));
    console.trace();
    console.groupEnd();
  }
}

function warn() {
  if (config.get('debugLevel') >= 2) {
    //console.warn(...arguments);
    //console.trace();
    console.groupCollapsed.apply(console, ['WARNING:'].concat(_slice.call(arguments)));
    console.trace();
    console.groupEnd();
  }
}

function info() {
  if (config.get('debugLevel') >= 3) {
    //console.info(...arguments);
    //console.trace('INFO', ...arguments);
    console.groupCollapsed.apply(console, ['INFO:'].concat(_slice.call(arguments)));
    console.trace();
    console.groupEnd();
  }
}

function log() {
  if (config.get('debugLevel') >= 4) {
    //console.log(...arguments);
    //console.trace('LOG', ...arguments);
    console.groupCollapsed.apply(console, ['LOG:'].concat(_slice.call(arguments)));
    console.trace();
    console.groupEnd();
  }
}

function getNiceTime(millis) {
  var h = undefined,
      m = undefined,
      s = undefined,
      ms = undefined,
      seconds = undefined,
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

},{"./config":"/home/abudaan/workspace/qambi/src/config.js"}]},{},["/home/abudaan/workspace/qambi/src/sequencer.js"])("/home/abudaan/workspace/qambi/src/sequencer.js")
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbGliL2JhYmVsL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hcnJheS1pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXJyYXktbWV0aG9kcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuYXNzZXJ0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi1zdHJvbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmNvbGxlY3Rpb24td2Vhay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY29sbGVjdGlvbi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQuY3R4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5kZWYuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmZ3LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5pbnZva2UuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLml0ZXIuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5rZXlvZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQub3duLWtleXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnBhcnRpYWwuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnJlcGxhY2VyLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnNwZWNpZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy8kLnN0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudGFzay5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzLyQudWlkLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC51bnNjb3BlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvJC53a3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuY29weS13aXRoaW4uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZmlsbC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmFycmF5LmZpbmQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuYXJyYXkuZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5vZi5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5hcnJheS5zcGVjaWVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LmZ1bmN0aW9uLm5hbWUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubWFwLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm1hdGguanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYubnVtYmVyLmNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm51bWJlci5zdGF0aWNzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24uanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYub2JqZWN0LmlzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYucHJvbWlzZS5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5yZWZsZWN0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnJlZ2V4cC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmNvZGUtcG9pbnQtYXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLmVuZHMtd2l0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuZnJvbS1jb2RlLXBvaW50LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5pbmNsdWRlcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYuc3RyaW5nLnJhdy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zdHJpbmcucmVwZWF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM2LnN0cmluZy5zdGFydHMtd2l0aC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzNi5zeW1ib2wuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYud2Vhay1tYXAuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczYud2Vhay1zZXQuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcub2JqZWN0LnRvLWFycmF5LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXM3LnJlZ2V4cC5lc2NhcGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lczcuc3RyaW5nLmF0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvanMuYXJyYXkuc3RhdGljcy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWxpZnkvbm9kZV9tb2R1bGVzL2JhYmVsLWNvcmUvbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy93ZWIuaW1tZWRpYXRlLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvd2ViLnRpbWVycy5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbGlmeS9ub2RlX21vZHVsZXMvYmFiZWwtY29yZS9ub2RlX21vZHVsZXMvY29yZS1qcy9zaGltLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL25vZGVfbW9kdWxlcy9yZWdlbmVyYXRvci1iYWJlbC9ydW50aW1lLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L25vZGVfbW9kdWxlcy9iYWJlbC1jb3JlL3BvbHlmaWxsLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsaWZ5L3BvbHlmaWxsLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL2F1ZGlvX2V2ZW50LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL2NvbmZpZy5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9oZWFydGJlYXQuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvaW5pdF9hdWRpby5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9pbml0X21pZGkuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvaW5zdHJ1bWVudC5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9taWRpX2V2ZW50LmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL21pZGlfcGFyc2UuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbWlkaV9zdHJlYW0uanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvbm90ZS5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9wYXJzZV9ldmVudHMuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvcGFydC5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9zYW1wbGUuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc2NoZWR1bGVyLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NlcXVlbmNlci5qcyIsIi9ob21lL2FidWRhYW4vd29ya3NwYWNlL3FhbWJpL3NyYy9zb25nLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3NvbmdfYWRkX2V2ZW50bGlzdGVuZXIuanMiLCIvaG9tZS9hYnVkYWFuL3dvcmtzcGFjZS9xYW1iaS9zcmMvc29uZ19mcm9tX21pZGlmaWxlLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3RyYWNrLmpzIiwiL2hvbWUvYWJ1ZGFhbi93b3Jrc3BhY2UvcWFtYmkvc3JjL3V0aWwuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LEVBQUMsS0FBSyxFQUFFLEdBQUksRUFBQyxDQUFDLENBQUM7QUFDcEUsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsWUFBWSxFQUFFLEVBQUMsS0FBSyxFQUFFLEdBQUksRUFBQyxDQUFDLENBQUM7QUFDOUQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxTQUFTLEVBQUUsa0JBQWtCLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBSSxFQUFDLENBQUMsQ0FBQztBQUNwRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUNoRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxlQUFlLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUNoRSxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUM5RCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUMvRCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUN0RCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxjQUFjLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUMvRCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUN4RCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsRUFBQyxLQUFLLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQztBQUMzRCxNQUFNLENBQUMsY0FBYyxDQUFDLFNBQVMsRUFBRSxNQUFNLEVBQUUsRUFBQyxL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Y0FBWSxJQUFJLEdBQUcsQ0FBQztBQUNwQixjQUFZLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxjQUFZLElBQUksR0FBRyxDQUFDO0FBQ3BCLGNBQVksSUFBSSxFQUFFLEtBQUssQ0FBQyxHQUFHLEtBQUssR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQzs7O0FBR2xGLFNBQU87QUFDSCxRQUFJLEVBQUUsQ0FBQztBQUNQLFVBQU0sRUFBRSxDQUFDO0FBQ1QsVUFBTSxFQUFFLENBQUM7QUFDVCxlQUFXLEVBQUUsRUFBRTtBQUNmLGdCQUFZLEVBQUUsWUFBWTtBQUMxQixlQUFXLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7R0FDN0IsQ0FBQztDQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5pZiAoZ2xvYmFsLl9iYWJlbFBvbHlmaWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcIm9ubHkgb25lIGluc3RhbmNlIG9mIGJhYmVsL3BvbHlmaWxsIGlzIGFsbG93ZWRcIik7XG59XG5nbG9iYWwuX2JhYmVsUG9seWZpbGwgPSB0cnVlO1xuXG5yZXF1aXJlKFwiY29yZS1qcy9zaGltXCIpO1xuXG5yZXF1aXJlKFwicmVnZW5lcmF0b3ItYmFiZWwvcnVudGltZVwiKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIGZhbHNlIC0+IEFycmF5I2luZGV4T2ZcclxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcclxudmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihJU19JTkNMVURFUyl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGVsIC8qLCBmcm9tSW5kZXggPSAwICovKXtcclxuICAgIHZhciBPICAgICAgPSAkLnRvT2JqZWN0KHRoaXMpXHJcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSAkLnRvSW5kZXgoYXJndW1lbnRzWzFdLCBsZW5ndGgpXHJcbiAgICAgICwgdmFsdWU7XHJcbiAgICBpZihJU19JTkNMVURFUyAmJiBlbCAhPSBlbCl3aGlsZShsZW5ndGggPiBpbmRleCl7XHJcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcclxuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XHJcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcclxuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleDtcclxuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcclxuICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxuLy8gMCAtPiBBcnJheSNmb3JFYWNoXHJcbi8vIDEgLT4gQXJyYXkjbWFwXHJcbi8vIDIgLT4gQXJyYXkjZmlsdGVyXHJcbi8vIDMgLT4gQXJyYXkjc29tZVxyXG4vLyA0IC0+IEFycmF5I2V2ZXJ5XHJcbi8vIDUgLT4gQXJyYXkjZmluZFxyXG4vLyA2IC0+IEFycmF5I2ZpbmRJbmRleFxyXG52YXIgJCAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGN0eCA9IHJlcXVpcmUoJy4vJC5jdHgnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUWVBFKXtcclxuICB2YXIgSVNfTUFQICAgICAgICA9IFRZUEUgPT0gMVxyXG4gICAgLCBJU19GSUxURVIgICAgID0gVFlQRSA9PSAyXHJcbiAgICAsIElTX1NPTUUgICAgICAgPSBUWVBFID09IDNcclxuICAgICwgSVNfRVZFUlkgICAgICA9IFRZUEUgPT0gNFxyXG4gICAgLCBJU19GSU5EX0lOREVYID0gVFlQRSA9PSA2XHJcbiAgICAsIE5PX0hPTEVTICAgICAgPSBUWVBFID09IDUgfHwgSVNfRklORF9JTkRFWDtcclxuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2tmbi8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgIHZhciBPICAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIHNlbGYgICA9ICQuRVM1T2JqZWN0KE8pXHJcbiAgICAgICwgZiAgICAgID0gY3R4KGNhbGxiYWNrZm4sIGFyZ3VtZW50c1sxXSwgMylcclxuICAgICAgLCBsZW5ndGggPSAkLnRvTGVuZ3RoKHNlbGYubGVuZ3RoKVxyXG4gICAgICAsIGluZGV4ICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBJU19NQVAgPyBBcnJheShsZW5ndGgpIDogSVNfRklMVEVSID8gW10gOiB1bmRlZmluZWRcclxuICAgICAgLCB2YWwsIHJlcztcclxuICAgIGZvcig7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspaWYoTk9fSE9MRVMgfHwgaW5kZXggaW4gc2VsZil7XHJcbiAgICAgIHZhbCA9IHNlbGZbaW5kZXhdO1xyXG4gICAgICByZXMgPSBmKHZhbCwgaW5kZXgsIE8pO1xyXG4gICAgICBpZihUWVBFKXtcclxuICAgICAgICBpZihJU19NQVApcmVzdWx0W2luZGV4XSA9IHJlczsgICAgICAgICAgICAvLyBtYXBcclxuICAgICAgICBlbHNlIGlmKHJlcylzd2l0Y2goVFlQRSl7XHJcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgICAgICAgLy8gc29tZVxyXG4gICAgICAgICAgY2FzZSA1OiByZXR1cm4gdmFsOyAgICAgICAgICAgICAgICAgICAgIC8vIGZpbmRcclxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcclxuICAgICAgICAgIGNhc2UgMjogcmVzdWx0LnB1c2godmFsKTsgICAgICAgICAgICAgICAvLyBmaWx0ZXJcclxuICAgICAgICB9IGVsc2UgaWYoSVNfRVZFUlkpcmV0dXJuIGZhbHNlOyAgICAgICAgICAvLyBldmVyeVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogcmVzdWx0O1xyXG4gIH07XHJcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxuZnVuY3Rpb24gYXNzZXJ0KGNvbmRpdGlvbiwgbXNnMSwgbXNnMil7XHJcbiAgaWYoIWNvbmRpdGlvbil0aHJvdyBUeXBlRXJyb3IobXNnMiA/IG1zZzEgKyBtc2cyIDogbXNnMSk7XHJcbn1cclxuYXNzZXJ0LmRlZiA9ICQuYXNzZXJ0RGVmaW5lZDtcclxuYXNzZXJ0LmZuID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzRnVuY3Rpb24oaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGEgZnVuY3Rpb24hJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQub2JqID0gZnVuY3Rpb24oaXQpe1xyXG4gIGlmKCEkLmlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XHJcbiAgcmV0dXJuIGl0O1xyXG59O1xyXG5hc3NlcnQuaW5zdCA9IGZ1bmN0aW9uKGl0LCBDb25zdHJ1Y3RvciwgbmFtZSl7XHJcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSl0aHJvdyBUeXBlRXJyb3IobmFtZSArIFwiOiB1c2UgdGhlICduZXcnIG9wZXJhdG9yIVwiKTtcclxuICByZXR1cm4gaXQ7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gYXNzZXJ0OyIsInZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcbi8vIDE5LjEuMi4xIE9iamVjdC5hc3NpZ24odGFyZ2V0LCBzb3VyY2UsIC4uLilcclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHRhcmdldCwgc291cmNlKXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xyXG4gIHZhciBUID0gT2JqZWN0KCQuYXNzZXJ0RGVmaW5lZCh0YXJnZXQpKVxyXG4gICAgLCBsID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgLCBpID0gMTtcclxuICB3aGlsZShsID4gaSl7XHJcbiAgICB2YXIgUyAgICAgID0gJC5FUzVPYmplY3QoYXJndW1lbnRzW2krK10pXHJcbiAgICAgICwga2V5cyAgID0gJC5nZXRLZXlzKFMpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBqICAgICAgPSAwXHJcbiAgICAgICwga2V5O1xyXG4gICAgd2hpbGUobGVuZ3RoID4gailUW2tleSA9IGtleXNbaisrXV0gPSBTW2tleV07XHJcbiAgfVxyXG4gIHJldHVybiBUO1xyXG59OyIsInZhciAkICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBUQUcgICAgICA9IHJlcXVpcmUoJy4vJC53a3MnKSgndG9TdHJpbmdUYWcnKVxyXG4gICwgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcclxuZnVuY3Rpb24gY29mKGl0KXtcclxuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xyXG59XHJcbmNvZi5jbGFzc29mID0gZnVuY3Rpb24oaXQpe1xyXG4gIHZhciBPLCBUO1xyXG4gIHJldHVybiBpdCA9PSB1bmRlZmluZWQgPyBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiAnTnVsbCdcclxuICAgIDogdHlwZW9mIChUID0gKE8gPSBPYmplY3QoaXQpKVtUQUddKSA9PSAnc3RyaW5nJyA/IFQgOiBjb2YoTyk7XHJcbn07XHJcbmNvZi5zZXQgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcclxuICBpZihpdCAmJiAhJC5oYXMoaXQgPSBzdGF0ID8gaXQgOiBpdC5wcm90b3R5cGUsIFRBRykpJC5oaWRlKGl0LCBUQUcsIHRhZyk7XHJcbn07XHJcbm1vZHVsZS5leHBvcnRzID0gY29mOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGN0eCAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXHJcbiAgLCBzYWZlICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlXHJcbiAgLCBhc3NlcnQgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgJGl0ZXIgICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBoYXMgICAgICA9ICQuaGFzXHJcbiAgLCBzZXQgICAgICA9ICQuc2V0XHJcbiAgLCBpc09iamVjdCA9ICQuaXNPYmplY3RcclxuICAsIGhpZGUgICAgID0gJC5oaWRlXHJcbiAgLCBzdGVwICAgICA9ICRpdGVyLnN0ZXBcclxuICAsIGlzRnJvemVuID0gT2JqZWN0LmlzRnJvemVuIHx8ICQuY29yZS5PYmplY3QuaXNGcm96ZW5cclxuICAsIElEICAgICAgID0gc2FmZSgnaWQnKVxyXG4gICwgTzEgICAgICAgPSBzYWZlKCdPMScpXHJcbiAgLCBMQVNUICAgICA9IHNhZmUoJ2xhc3QnKVxyXG4gICwgRklSU1QgICAgPSBzYWZlKCdmaXJzdCcpXHJcbiAgLCBJVEVSICAgICA9IHNhZmUoJ2l0ZXInKVxyXG4gICwgU0laRSAgICAgPSAkLkRFU0MgPyBzYWZlKCdzaXplJykgOiAnc2l6ZSdcclxuICAsIGlkICAgICAgID0gMDtcclxuXHJcbmZ1bmN0aW9uIGZhc3RLZXkoaXQsIGNyZWF0ZSl7XHJcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxyXG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XHJcbiAgLy8gY2FuJ3Qgc2V0IGlkIHRvIGZyb3plbiBvYmplY3RcclxuICBpZihpc0Zyb3plbihpdCkpcmV0dXJuICdGJztcclxuICBpZighaGFzKGl0LCBJRCkpe1xyXG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgaWRcclxuICAgIGlmKCFjcmVhdGUpcmV0dXJuICdFJztcclxuICAgIC8vIGFkZCBtaXNzaW5nIG9iamVjdCBpZFxyXG4gICAgaGlkZShpdCwgSUQsICsraWQpO1xyXG4gIC8vIHJldHVybiBvYmplY3QgaWQgd2l0aCBwcmVmaXhcclxuICB9IHJldHVybiAnTycgKyBpdFtJRF07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldEVudHJ5KHRoYXQsIGtleSl7XHJcbiAgLy8gZmFzdCBjYXNlXHJcbiAgdmFyIGluZGV4ID0gZmFzdEtleShrZXkpLCBlbnRyeTtcclxuICBpZihpbmRleCAhPSAnRicpcmV0dXJuIHRoYXRbTzFdW2luZGV4XTtcclxuICAvLyBmcm96ZW4gb2JqZWN0IGNhc2VcclxuICBmb3IoZW50cnkgPSB0aGF0W0ZJUlNUXTsgZW50cnk7IGVudHJ5ID0gZW50cnkubil7XHJcbiAgICBpZihlbnRyeS5rID09IGtleSlyZXR1cm4gZW50cnk7XHJcbiAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBnZXRDb25zdHJ1Y3RvcjogZnVuY3Rpb24oTkFNRSwgSVNfTUFQLCBBRERFUil7XHJcbiAgICBmdW5jdGlvbiBDKGl0ZXJhYmxlKXtcclxuICAgICAgdmFyIHRoYXQgPSBhc3NlcnQuaW5zdCh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgc2V0KHRoYXQsIE8xLCAkLmNyZWF0ZShudWxsKSk7XHJcbiAgICAgIHNldCh0aGF0LCBTSVpFLCAwKTtcclxuICAgICAgc2V0KHRoYXQsIExBU1QsIHVuZGVmaW5lZCk7XHJcbiAgICAgIHNldCh0aGF0LCBGSVJTVCwgdW5kZWZpbmVkKTtcclxuICAgICAgaWYoaXRlcmFibGUgIT0gdW5kZWZpbmVkKSRpdGVyLmZvck9mKGl0ZXJhYmxlLCBJU19NQVAsIHRoYXRbQURERVJdLCB0aGF0KTtcclxuICAgIH1cclxuICAgICQubWl4KEMucHJvdG90eXBlLCB7XHJcbiAgICAgIC8vIDIzLjEuMy4xIE1hcC5wcm90b3R5cGUuY2xlYXIoKVxyXG4gICAgICAvLyAyMy4yLjMuMiBTZXQucHJvdG90eXBlLmNsZWFyKClcclxuICAgICAgY2xlYXI6IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgZm9yKHZhciB0aGF0ID0gdGhpcywgZGF0YSA9IHRoYXRbTzFdLCBlbnRyeSA9IHRoYXRbRklSU1RdOyBlbnRyeTsgZW50cnkgPSBlbnRyeS5uKXtcclxuICAgICAgICAgIGVudHJ5LnIgPSB0cnVlO1xyXG4gICAgICAgICAgaWYoZW50cnkucCllbnRyeS5wID0gZW50cnkucC5uID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgZGVsZXRlIGRhdGFbZW50cnkuaV07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoYXRbRklSU1RdID0gdGhhdFtMQVNUXSA9IHVuZGVmaW5lZDtcclxuICAgICAgICB0aGF0W1NJWkVdID0gMDtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMS4zLjMgTWFwLnByb3RvdHlwZS5kZWxldGUoa2V5KVxyXG4gICAgICAvLyAyMy4yLjMuNCBTZXQucHJvdG90eXBlLmRlbGV0ZSh2YWx1ZSlcclxuICAgICAgJ2RlbGV0ZSc6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgdmFyIHRoYXQgID0gdGhpc1xyXG4gICAgICAgICAgLCBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSk7XHJcbiAgICAgICAgaWYoZW50cnkpe1xyXG4gICAgICAgICAgdmFyIG5leHQgPSBlbnRyeS5uXHJcbiAgICAgICAgICAgICwgcHJldiA9IGVudHJ5LnA7XHJcbiAgICAgICAgICBkZWxldGUgdGhhdFtPMV1bZW50cnkuaV07XHJcbiAgICAgICAgICBlbnRyeS5yID0gdHJ1ZTtcclxuICAgICAgICAgIGlmKHByZXYpcHJldi5uID0gbmV4dDtcclxuICAgICAgICAgIGlmKG5leHQpbmV4dC5wID0gcHJldjtcclxuICAgICAgICAgIGlmKHRoYXRbRklSU1RdID09IGVudHJ5KXRoYXRbRklSU1RdID0gbmV4dDtcclxuICAgICAgICAgIGlmKHRoYXRbTEFTVF0gPT0gZW50cnkpdGhhdFtMQVNUXSA9IHByZXY7XHJcbiAgICAgICAgICB0aGF0W1NJWkVdLS07XHJcbiAgICAgICAgfSByZXR1cm4gISFlbnRyeTtcclxuICAgICAgfSxcclxuICAgICAgLy8gMjMuMi4zLjYgU2V0LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4sIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgICAgIC8vIDIzLjEuMy41IE1hcC5wcm90b3R5cGUuZm9yRWFjaChjYWxsYmFja2ZuLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxyXG4gICAgICBmb3JFYWNoOiBmdW5jdGlvbihjYWxsYmFja2ZuIC8qLCB0aGF0ID0gdW5kZWZpbmVkICovKXtcclxuICAgICAgICB2YXIgZiA9IGN0eChjYWxsYmFja2ZuLCBhcmd1bWVudHNbMV0sIDMpXHJcbiAgICAgICAgICAsIGVudHJ5O1xyXG4gICAgICAgIHdoaWxlKGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogdGhpc1tGSVJTVF0pe1xyXG4gICAgICAgICAgZihlbnRyeS52LCBlbnRyeS5rLCB0aGlzKTtcclxuICAgICAgICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgICAgICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICAvLyAyMy4xLjMuNyBNYXAucHJvdG90eXBlLmhhcyhrZXkpXHJcbiAgICAgIC8vIDIzLjIuMy43IFNldC5wcm90b3R5cGUuaGFzKHZhbHVlKVxyXG4gICAgICBoYXM6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgICAgcmV0dXJuICEhZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBpZigkLkRFU0MpJC5zZXREZXNjKEMucHJvdG90eXBlLCAnc2l6ZScsIHtcclxuICAgICAgZ2V0OiBmdW5jdGlvbigpe1xyXG4gICAgICAgIHJldHVybiBhc3NlcnQuZGVmKHRoaXNbU0laRV0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHJldHVybiBDO1xyXG4gIH0sXHJcbiAgZGVmOiBmdW5jdGlvbih0aGF0LCBrZXksIHZhbHVlKXtcclxuICAgIHZhciBlbnRyeSA9IGdldEVudHJ5KHRoYXQsIGtleSlcclxuICAgICAgLCBwcmV2LCBpbmRleDtcclxuICAgIC8vIGNoYW5nZSBleGlzdGluZyBlbnRyeVxyXG4gICAgaWYoZW50cnkpe1xyXG4gICAgICBlbnRyeS52ID0gdmFsdWU7XHJcbiAgICAvLyBjcmVhdGUgbmV3IGVudHJ5XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aGF0W0xBU1RdID0gZW50cnkgPSB7XHJcbiAgICAgICAgaTogaW5kZXggPSBmYXN0S2V5KGtleSwgdHJ1ZSksIC8vIDwtIGluZGV4XHJcbiAgICAgICAgazoga2V5LCAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIGtleVxyXG4gICAgICAgIHY6IHZhbHVlLCAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICAgIHA6IHByZXYgPSB0aGF0W0xBU1RdLCAgICAgICAgICAvLyA8LSBwcmV2aW91cyBlbnRyeVxyXG4gICAgICAgIG46IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAvLyA8LSBuZXh0IGVudHJ5XHJcbiAgICAgICAgcjogZmFsc2UgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHJlbW92ZWRcclxuICAgICAgfTtcclxuICAgICAgaWYoIXRoYXRbRklSU1RdKXRoYXRbRklSU1RdID0gZW50cnk7XHJcbiAgICAgIGlmKHByZXYpcHJldi5uID0gZW50cnk7XHJcbiAgICAgIHRoYXRbU0laRV0rKztcclxuICAgICAgLy8gYWRkIHRvIGluZGV4XHJcbiAgICAgIGlmKGluZGV4ICE9ICdGJyl0aGF0W08xXVtpbmRleF0gPSBlbnRyeTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBnZXRFbnRyeTogZ2V0RW50cnksXHJcbiAgZ2V0SXRlckNvbnN0cnVjdG9yOiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcclxuICAgICAgc2V0KHRoaXMsIElURVIsIHtvOiBpdGVyYXRlZCwgazoga2luZH0pO1xyXG4gICAgfTtcclxuICB9LFxyXG4gIG5leHQ6IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAgICwga2luZCAgPSBpdGVyLmtcclxuICAgICAgLCBlbnRyeSA9IGl0ZXIubDtcclxuICAgIC8vIHJldmVydCB0byB0aGUgbGFzdCBleGlzdGluZyBlbnRyeVxyXG4gICAgd2hpbGUoZW50cnkgJiYgZW50cnkucillbnRyeSA9IGVudHJ5LnA7XHJcbiAgICAvLyBnZXQgbmV4dCBlbnRyeVxyXG4gICAgaWYoIWl0ZXIubyB8fCAhKGl0ZXIubCA9IGVudHJ5ID0gZW50cnkgPyBlbnRyeS5uIDogaXRlci5vW0ZJUlNUXSkpe1xyXG4gICAgICAvLyBvciBmaW5pc2ggdGhlIGl0ZXJhdGlvblxyXG4gICAgICBpdGVyLm8gPSB1bmRlZmluZWQ7XHJcbiAgICAgIHJldHVybiBzdGVwKDEpO1xyXG4gICAgfVxyXG4gICAgLy8gcmV0dXJuIHN0ZXAgYnkga2luZFxyXG4gICAgaWYoa2luZCA9PSAna2V5JyAgKXJldHVybiBzdGVwKDAsIGVudHJ5LmspO1xyXG4gICAgaWYoa2luZCA9PSAndmFsdWUnKXJldHVybiBzdGVwKDAsIGVudHJ5LnYpO1xyXG4gICAgcmV0dXJuIHN0ZXAoMCwgW2VudHJ5LmssIGVudHJ5LnZdKTtcclxuICB9XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHNhZmUgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlXHJcbiAgLCBhc3NlcnQgICAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsIGZvck9mICAgICA9IHJlcXVpcmUoJy4vJC5pdGVyJykuZm9yT2ZcclxuICAsIGhhcyAgICAgICA9ICQuaGFzXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBoaWRlICAgICAgPSAkLmhpZGVcclxuICAsIGlzRnJvemVuICA9IE9iamVjdC5pc0Zyb3plbiB8fCAkLmNvcmUuT2JqZWN0LmlzRnJvemVuXHJcbiAgLCBpZCAgICAgICAgPSAwXHJcbiAgLCBJRCAgICAgICAgPSBzYWZlKCdpZCcpXHJcbiAgLCBXRUFLICAgICAgPSBzYWZlKCd3ZWFrJylcclxuICAsIExFQUsgICAgICA9IHNhZmUoJ2xlYWsnKVxyXG4gICwgbWV0aG9kICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxyXG4gICwgZmluZCAgICAgID0gbWV0aG9kKDUpXHJcbiAgLCBmaW5kSW5kZXggPSBtZXRob2QoNik7XHJcbmZ1bmN0aW9uIGZpbmRGcm96ZW4oc3RvcmUsIGtleSl7XHJcbiAgcmV0dXJuIGZpbmQuY2FsbChzdG9yZS5hcnJheSwgZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XHJcbiAgfSk7XHJcbn1cclxuLy8gZmFsbGJhY2sgZm9yIGZyb3plbiBrZXlzXHJcbmZ1bmN0aW9uIGxlYWtTdG9yZSh0aGF0KXtcclxuICByZXR1cm4gdGhhdFtMRUFLXSB8fCBoaWRlKHRoYXQsIExFQUssIHtcclxuICAgIGFycmF5OiBbXSxcclxuICAgIGdldDogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgdmFyIGVudHJ5ID0gZmluZEZyb3plbih0aGlzLCBrZXkpO1xyXG4gICAgICBpZihlbnRyeSlyZXR1cm4gZW50cnlbMV07XHJcbiAgICB9LFxyXG4gICAgaGFzOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICByZXR1cm4gISFmaW5kRnJvemVuKHRoaXMsIGtleSk7XHJcbiAgICB9LFxyXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKXtcclxuICAgICAgdmFyIGVudHJ5ID0gZmluZEZyb3plbih0aGlzLCBrZXkpO1xyXG4gICAgICBpZihlbnRyeSllbnRyeVsxXSA9IHZhbHVlO1xyXG4gICAgICBlbHNlIHRoaXMuYXJyYXkucHVzaChba2V5LCB2YWx1ZV0pO1xyXG4gICAgfSxcclxuICAgICdkZWxldGUnOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICB2YXIgaW5kZXggPSBmaW5kSW5kZXguY2FsbCh0aGlzLmFycmF5LCBmdW5jdGlvbihpdCl7XHJcbiAgICAgICAgcmV0dXJuIGl0WzBdID09PSBrZXk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZih+aW5kZXgpdGhpcy5hcnJheS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICByZXR1cm4gISF+aW5kZXg7XHJcbiAgICB9XHJcbiAgfSlbTEVBS107XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG4gIGdldENvbnN0cnVjdG9yOiBmdW5jdGlvbihOQU1FLCBJU19NQVAsIEFEREVSKXtcclxuICAgIGZ1bmN0aW9uIEMoaXRlcmFibGUpe1xyXG4gICAgICAkLnNldChhc3NlcnQuaW5zdCh0aGlzLCBDLCBOQU1FKSwgSUQsIGlkKyspO1xyXG4gICAgICBpZihpdGVyYWJsZSAhPSB1bmRlZmluZWQpZm9yT2YoaXRlcmFibGUsIElTX01BUCwgdGhpc1tBRERFUl0sIHRoaXMpO1xyXG4gICAgfVxyXG4gICAgJC5taXgoQy5wcm90b3R5cGUsIHtcclxuICAgICAgLy8gMjMuMy4zLjIgV2Vha01hcC5wcm90b3R5cGUuZGVsZXRlKGtleSlcclxuICAgICAgLy8gMjMuNC4zLjMgV2Vha1NldC5wcm90b3R5cGUuZGVsZXRlKHZhbHVlKVxyXG4gICAgICAnZGVsZXRlJzogZnVuY3Rpb24oa2V5KXtcclxuICAgICAgICBpZighaXNPYmplY3Qoa2V5KSlyZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpWydkZWxldGUnXShrZXkpO1xyXG4gICAgICAgIHJldHVybiBoYXMoa2V5LCBXRUFLKSAmJiBoYXMoa2V5W1dFQUtdLCB0aGlzW0lEXSkgJiYgZGVsZXRlIGtleVtXRUFLXVt0aGlzW0lEXV07XHJcbiAgICAgIH0sXHJcbiAgICAgIC8vIDIzLjMuMy40IFdlYWtNYXAucHJvdG90eXBlLmhhcyhrZXkpXHJcbiAgICAgIC8vIDIzLjQuMy40IFdlYWtTZXQucHJvdG90eXBlLmhhcyh2YWx1ZSlcclxuICAgICAgaGFzOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAgIGlmKCFpc09iamVjdChrZXkpKXJldHVybiBmYWxzZTtcclxuICAgICAgICBpZihpc0Zyb3plbihrZXkpKXJldHVybiBsZWFrU3RvcmUodGhpcykuaGFzKGtleSk7XHJcbiAgICAgICAgcmV0dXJuIGhhcyhrZXksIFdFQUspICYmIGhhcyhrZXlbV0VBS10sIHRoaXNbSURdKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gQztcclxuICB9LFxyXG4gIGRlZjogZnVuY3Rpb24odGhhdCwga2V5LCB2YWx1ZSl7XHJcbiAgICBpZihpc0Zyb3plbihhc3NlcnQub2JqKGtleSkpKXtcclxuICAgICAgbGVha1N0b3JlKHRoYXQpLnNldChrZXksIHZhbHVlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhhcyhrZXksIFdFQUspIHx8IGhpZGUoa2V5LCBXRUFLLCB7fSk7XHJcbiAgICAgIGtleVtXRUFLXVt0aGF0W0lEXV0gPSB2YWx1ZTtcclxuICAgIH0gcmV0dXJuIHRoYXQ7XHJcbiAgfSxcclxuICBsZWFrU3RvcmU6IGxlYWtTdG9yZSxcclxuICBXRUFLOiBXRUFLLFxyXG4gIElEOiBJRFxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIGFzc2VydEluc3RhbmNlID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmluc3Q7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE5BTUUsIG1ldGhvZHMsIGNvbW1vbiwgSVNfTUFQLCBpc1dlYWspe1xyXG4gIHZhciBCYXNlICA9ICQuZ1tOQU1FXVxyXG4gICAgLCBDICAgICA9IEJhc2VcclxuICAgICwgQURERVIgPSBJU19NQVAgPyAnc2V0JyA6ICdhZGQnXHJcbiAgICAsIHByb3RvID0gQyAmJiBDLnByb3RvdHlwZVxyXG4gICAgLCBPICAgICA9IHt9O1xyXG4gIGZ1bmN0aW9uIGZpeE1ldGhvZChLRVksIENIQUlOKXtcclxuICAgIHZhciBtZXRob2QgPSBwcm90b1tLRVldO1xyXG4gICAgaWYoJC5GVylwcm90b1tLRVldID0gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHZhciByZXN1bHQgPSBtZXRob2QuY2FsbCh0aGlzLCBhID09PSAwID8gMCA6IGEsIGIpO1xyXG4gICAgICByZXR1cm4gQ0hBSU4gPyB0aGlzIDogcmVzdWx0O1xyXG4gICAgfTtcclxuICB9XHJcbiAgaWYoISQuaXNGdW5jdGlvbihDKSB8fCAhKGlzV2VhayB8fCAhJGl0ZXIuQlVHR1kgJiYgcHJvdG8uZm9yRWFjaCAmJiBwcm90by5lbnRyaWVzKSl7XHJcbiAgICAvLyBjcmVhdGUgY29sbGVjdGlvbiBjb25zdHJ1Y3RvclxyXG4gICAgQyA9IGNvbW1vbi5nZXRDb25zdHJ1Y3RvcihOQU1FLCBJU19NQVAsIEFEREVSKTtcclxuICAgICQubWl4KEMucHJvdG90eXBlLCBtZXRob2RzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdmFyIGluc3QgID0gbmV3IENcclxuICAgICAgLCBjaGFpbiA9IGluc3RbQURERVJdKGlzV2VhayA/IHt9IDogLTAsIDEpXHJcbiAgICAgICwgYnVnZ3laZXJvO1xyXG4gICAgLy8gd3JhcCBmb3IgaW5pdCBjb2xsZWN0aW9ucyBmcm9tIGl0ZXJhYmxlXHJcbiAgICBpZigkaXRlci5mYWlsKGZ1bmN0aW9uKGl0ZXIpe1xyXG4gICAgICBuZXcgQyhpdGVyKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcclxuICAgIH0pIHx8ICRpdGVyLkRBTkdFUl9DTE9TSU5HKXtcclxuICAgICAgQyA9IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgICAgICBhc3NlcnRJbnN0YW5jZSh0aGlzLCBDLCBOQU1FKTtcclxuICAgICAgICB2YXIgdGhhdCA9IG5ldyBCYXNlO1xyXG4gICAgICAgIGlmKGl0ZXJhYmxlICE9IHVuZGVmaW5lZCkkaXRlci5mb3JPZihpdGVyYWJsZSwgSVNfTUFQLCB0aGF0W0FEREVSXSwgdGhhdCk7XHJcbiAgICAgICAgcmV0dXJuIHRoYXQ7XHJcbiAgICAgIH07XHJcbiAgICAgIEMucHJvdG90eXBlID0gcHJvdG87XHJcbiAgICAgIGlmKCQuRlcpcHJvdG8uY29uc3RydWN0b3IgPSBDO1xyXG4gICAgfVxyXG4gICAgaXNXZWFrIHx8IGluc3QuZm9yRWFjaChmdW5jdGlvbih2YWwsIGtleSl7XHJcbiAgICAgIGJ1Z2d5WmVybyA9IDEgLyBrZXkgPT09IC1JbmZpbml0eTtcclxuICAgIH0pO1xyXG4gICAgLy8gZml4IGNvbnZlcnRpbmcgLTAga2V5IHRvICswXHJcbiAgICBpZihidWdneVplcm8pe1xyXG4gICAgICBmaXhNZXRob2QoJ2RlbGV0ZScpO1xyXG4gICAgICBmaXhNZXRob2QoJ2hhcycpO1xyXG4gICAgICBJU19NQVAgJiYgZml4TWV0aG9kKCdnZXQnKTtcclxuICAgIH1cclxuICAgIC8vICsgZml4IC5hZGQgJiAuc2V0IGZvciBjaGFpbmluZ1xyXG4gICAgaWYoYnVnZ3laZXJvIHx8IGNoYWluICE9PSBpbnN0KWZpeE1ldGhvZChBRERFUiwgdHJ1ZSk7XHJcbiAgfVxyXG5cclxuICByZXF1aXJlKCcuLyQuY29mJykuc2V0KEMsIE5BTUUpO1xyXG4gIHJlcXVpcmUoJy4vJC5zcGVjaWVzJykoQyk7XHJcblxyXG4gIE9bTkFNRV0gPSBDO1xyXG4gICRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogKEMgIT0gQmFzZSksIE8pO1xyXG5cclxuICAvLyBhZGQgLmtleXMsIC52YWx1ZXMsIC5lbnRyaWVzLCBbQEBpdGVyYXRvcl1cclxuICAvLyAyMy4xLjMuNCwgMjMuMS4zLjgsIDIzLjEuMy4xMSwgMjMuMS4zLjEyLCAyMy4yLjMuNSwgMjMuMi4zLjgsIDIzLjIuMy4xMCwgMjMuMi4zLjExXHJcbiAgaWYoIWlzV2VhaykkaXRlci5zdGQoXHJcbiAgICBDLCBOQU1FLFxyXG4gICAgY29tbW9uLmdldEl0ZXJDb25zdHJ1Y3RvcigpLCBjb21tb24ubmV4dCxcclxuICAgIElTX01BUCA/ICdrZXkrdmFsdWUnIDogJ3ZhbHVlJyAsICFJU19NQVAsIHRydWVcclxuICApO1xyXG5cclxuICByZXR1cm4gQztcclxufTsiLCIvLyBPcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcclxudmFyIGFzc2VydEZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLmZuO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuLCB0aGF0LCBsZW5ndGgpe1xyXG4gIGFzc2VydEZ1bmN0aW9uKGZuKTtcclxuICBpZih+bGVuZ3RoICYmIHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XHJcbiAgc3dpdGNoKGxlbmd0aCl7XHJcbiAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbihhKXtcclxuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XHJcbiAgICB9O1xyXG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24oYSwgYil7XHJcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xyXG4gICAgfTtcclxuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKGEsIGIsIGMpe1xyXG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcclxuICAgIH07XHJcbiAgfSByZXR1cm4gZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xyXG4gICAgfTtcclxufTsiLCJ2YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBnbG9iYWwgICAgID0gJC5nXHJcbiAgLCBjb3JlICAgICAgID0gJC5jb3JlXHJcbiAgLCBpc0Z1bmN0aW9uID0gJC5pc0Z1bmN0aW9uO1xyXG5mdW5jdGlvbiBjdHgoZm4sIHRoYXQpe1xyXG4gIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XHJcbiAgfTtcclxufVxyXG5nbG9iYWwuY29yZSA9IGNvcmU7XHJcbi8vIHR5cGUgYml0bWFwXHJcbiRkZWYuRiA9IDE7ICAvLyBmb3JjZWRcclxuJGRlZi5HID0gMjsgIC8vIGdsb2JhbFxyXG4kZGVmLlMgPSA0OyAgLy8gc3RhdGljXHJcbiRkZWYuUCA9IDg7ICAvLyBwcm90b1xyXG4kZGVmLkIgPSAxNjsgLy8gYmluZFxyXG4kZGVmLlcgPSAzMjsgLy8gd3JhcFxyXG5mdW5jdGlvbiAkZGVmKHR5cGUsIG5hbWUsIHNvdXJjZSl7XHJcbiAgdmFyIGtleSwgb3duLCBvdXQsIGV4cFxyXG4gICAgLCBpc0dsb2JhbCA9IHR5cGUgJiAkZGVmLkdcclxuICAgICwgdGFyZ2V0ICAgPSBpc0dsb2JhbCA/IGdsb2JhbCA6IHR5cGUgJiAkZGVmLlNcclxuICAgICAgICA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pLnByb3RvdHlwZVxyXG4gICAgLCBleHBvcnRzICA9IGlzR2xvYmFsID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSk7XHJcbiAgaWYoaXNHbG9iYWwpc291cmNlID0gbmFtZTtcclxuICBmb3Ioa2V5IGluIHNvdXJjZSl7XHJcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcclxuICAgIG93biA9ICEodHlwZSAmICRkZWYuRikgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XHJcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxyXG4gICAgb3V0ID0gKG93biA/IHRhcmdldCA6IHNvdXJjZSlba2V5XTtcclxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XHJcbiAgICBpZih0eXBlICYgJGRlZi5CICYmIG93billeHAgPSBjdHgob3V0LCBnbG9iYWwpO1xyXG4gICAgZWxzZSBleHAgPSB0eXBlICYgJGRlZi5QICYmIGlzRnVuY3Rpb24ob3V0KSA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xyXG4gICAgLy8gZXh0ZW5kIGdsb2JhbFxyXG4gICAgaWYodGFyZ2V0ICYmICFvd24pe1xyXG4gICAgICBpZihpc0dsb2JhbCl0YXJnZXRba2V5XSA9IG91dDtcclxuICAgICAgZWxzZSBkZWxldGUgdGFyZ2V0W2tleV0gJiYgJC5oaWRlKHRhcmdldCwga2V5LCBvdXQpO1xyXG4gICAgfVxyXG4gICAgLy8gZXhwb3J0XHJcbiAgICBpZihleHBvcnRzW2tleV0gIT0gb3V0KSQuaGlkZShleHBvcnRzLCBrZXksIGV4cCk7XHJcbiAgfVxyXG59XHJcbm1vZHVsZS5leHBvcnRzID0gJGRlZjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCQpe1xyXG4gICQuRlcgICA9IHRydWU7XHJcbiAgJC5wYXRoID0gJC5nO1xyXG4gIHJldHVybiAkO1xyXG59OyIsIi8vIEZhc3QgYXBwbHlcclxuLy8gaHR0cDovL2pzcGVyZi5sbmtpdC5jb20vZmFzdC1hcHBseS81XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xyXG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcclxuICBzd2l0Y2goYXJncy5sZW5ndGgpe1xyXG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XHJcbiAgICBjYXNlIDE6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XHJcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSk7XHJcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XHJcbiAgICBjYXNlIDQ6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XHJcbiAgICBjYXNlIDU6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0sIGFyZ3NbM10sIGFyZ3NbNF0pXHJcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSwgYXJnc1s0XSk7XHJcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGN0eCAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXHJcbiAgLCBjb2YgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiAgICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGFzc2VydE9iamVjdCAgICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9ialxyXG4gICwgU1lNQk9MX0lURVJBVE9SICAgPSByZXF1aXJlKCcuLyQud2tzJykoJ2l0ZXJhdG9yJylcclxuICAsIEZGX0lURVJBVE9SICAgICAgID0gJ0BAaXRlcmF0b3InXHJcbiAgLCBJdGVyYXRvcnMgICAgICAgICA9IHt9XHJcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xyXG4vLyBTYWZhcmkgaGFzIGJ5Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXHJcbnZhciBCVUdHWSA9ICdrZXlzJyBpbiBbXSAmJiAhKCduZXh0JyBpbiBbXS5rZXlzKCkpO1xyXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxyXG5zZXRJdGVyYXRvcihJdGVyYXRvclByb3RvdHlwZSwgJC50aGF0KTtcclxuZnVuY3Rpb24gc2V0SXRlcmF0b3IoTywgdmFsdWUpe1xyXG4gICQuaGlkZShPLCBTWU1CT0xfSVRFUkFUT1IsIHZhbHVlKTtcclxuICAvLyBBZGQgaXRlcmF0b3IgZm9yIEZGIGl0ZXJhdG9yIHByb3RvY29sXHJcbiAgaWYoRkZfSVRFUkFUT1IgaW4gW10pJC5oaWRlKE8sIEZGX0lURVJBVE9SLCB2YWx1ZSk7XHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lSXRlcmF0b3IoQ29uc3RydWN0b3IsIE5BTUUsIHZhbHVlLCBERUZBVUxUKXtcclxuICB2YXIgcHJvdG8gPSBDb25zdHJ1Y3Rvci5wcm90b3R5cGVcclxuICAgICwgaXRlciAgPSBwcm90b1tTWU1CT0xfSVRFUkFUT1JdIHx8IHByb3RvW0ZGX0lURVJBVE9SXSB8fCBERUZBVUxUICYmIHByb3RvW0RFRkFVTFRdIHx8IHZhbHVlO1xyXG4gIC8vIERlZmluZSBpdGVyYXRvclxyXG4gIGlmKCQuRlcpc2V0SXRlcmF0b3IocHJvdG8sIGl0ZXIpO1xyXG4gIGlmKGl0ZXIgIT09IHZhbHVlKXtcclxuICAgIHZhciBpdGVyUHJvdG8gPSAkLmdldFByb3RvKGl0ZXIuY2FsbChuZXcgQ29uc3RydWN0b3IpKTtcclxuICAgIC8vIFNldCBAQHRvU3RyaW5nVGFnIHRvIG5hdGl2ZSBpdGVyYXRvcnNcclxuICAgIGNvZi5zZXQoaXRlclByb3RvLCBOQU1FICsgJyBJdGVyYXRvcicsIHRydWUpO1xyXG4gICAgLy8gRkYgZml4XHJcbiAgICBpZigkLkZXKSQuaGFzKHByb3RvLCBGRl9JVEVSQVRPUikgJiYgc2V0SXRlcmF0b3IoaXRlclByb3RvLCAkLnRoYXQpO1xyXG4gIH1cclxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XHJcbiAgSXRlcmF0b3JzW05BTUVdID0gaXRlcjtcclxuICAvLyBGRiAmIHY4IGZpeFxyXG4gIEl0ZXJhdG9yc1tOQU1FICsgJyBJdGVyYXRvciddID0gJC50aGF0O1xyXG4gIHJldHVybiBpdGVyO1xyXG59XHJcbmZ1bmN0aW9uIGdldEl0ZXJhdG9yKGl0KXtcclxuICB2YXIgU3ltYm9sICA9ICQuZy5TeW1ib2xcclxuICAgICwgZXh0ICAgICA9IGl0W1N5bWJvbCAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgRkZfSVRFUkFUT1JdXHJcbiAgICAsIGdldEl0ZXIgPSBleHQgfHwgaXRbU1lNQk9MX0lURVJBVE9SXSB8fCBJdGVyYXRvcnNbY29mLmNsYXNzb2YoaXQpXTtcclxuICByZXR1cm4gYXNzZXJ0T2JqZWN0KGdldEl0ZXIuY2FsbChpdCkpO1xyXG59XHJcbmZ1bmN0aW9uIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3Ipe1xyXG4gIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XHJcbiAgaWYocmV0ICE9PSB1bmRlZmluZWQpYXNzZXJ0T2JqZWN0KHJldC5jYWxsKGl0ZXJhdG9yKSk7XHJcbn1cclxuZnVuY3Rpb24gc3RlcENhbGwoaXRlcmF0b3IsIGZuLCB2YWx1ZSwgZW50cmllcyl7XHJcbiAgdHJ5IHtcclxuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYXNzZXJ0T2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBjbG9zZUl0ZXJhdG9yKGl0ZXJhdG9yKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59XHJcbnZhciBEQU5HRVJfQ0xPU0lORyA9IHRydWU7XHJcbiFmdW5jdGlvbigpe1xyXG4gIHRyeSB7XHJcbiAgICB2YXIgaXRlciA9IFsxXS5rZXlzKCk7XHJcbiAgICBpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IERBTkdFUl9DTE9TSU5HID0gZmFsc2U7IH07XHJcbiAgICBBcnJheS5mcm9tKGl0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxufSgpO1xyXG52YXIgJGl0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcclxuICBCVUdHWTogQlVHR1ksXHJcbiAgREFOR0VSX0NMT1NJTkc6IERBTkdFUl9DTE9TSU5HLFxyXG4gIGZhaWw6IGZ1bmN0aW9uKGV4ZWMpe1xyXG4gICAgdmFyIGZhaWwgPSB0cnVlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgdmFyIGFyciAgPSBbW3t9LCAxXV1cclxuICAgICAgICAsIGl0ZXIgPSBhcnJbU1lNQk9MX0lURVJBVE9SXSgpXHJcbiAgICAgICAgLCBuZXh0ID0gaXRlci5uZXh0O1xyXG4gICAgICBpdGVyLm5leHQgPSBmdW5jdGlvbigpe1xyXG4gICAgICAgIGZhaWwgPSBmYWxzZTtcclxuICAgICAgICByZXR1cm4gbmV4dC5jYWxsKHRoaXMpO1xyXG4gICAgICB9O1xyXG4gICAgICBhcnJbU1lNQk9MX0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIGl0ZXI7XHJcbiAgICAgIH07XHJcbiAgICAgIGV4ZWMoYXJyKTtcclxuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICAgIHJldHVybiBmYWlsO1xyXG4gIH0sXHJcbiAgSXRlcmF0b3JzOiBJdGVyYXRvcnMsXHJcbiAgcHJvdG90eXBlOiBJdGVyYXRvclByb3RvdHlwZSxcclxuICBzdGVwOiBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XHJcbiAgICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcclxuICB9LFxyXG4gIHN0ZXBDYWxsOiBzdGVwQ2FsbCxcclxuICBjbG9zZTogY2xvc2VJdGVyYXRvcixcclxuICBpczogZnVuY3Rpb24oaXQpe1xyXG4gICAgdmFyIE8gICAgICA9IE9iamVjdChpdClcclxuICAgICAgLCBTeW1ib2wgPSAkLmcuU3ltYm9sXHJcbiAgICAgICwgU1lNICAgID0gU3ltYm9sICYmIFN5bWJvbC5pdGVyYXRvciB8fCBGRl9JVEVSQVRPUjtcclxuICAgIHJldHVybiBTWU0gaW4gTyB8fCBTWU1CT0xfSVRFUkFUT1IgaW4gTyB8fCAkLmhhcyhJdGVyYXRvcnMsIGNvZi5jbGFzc29mKE8pKTtcclxuICB9LFxyXG4gIGdldDogZ2V0SXRlcmF0b3IsXHJcbiAgc2V0OiBzZXRJdGVyYXRvcixcclxuICBjcmVhdGU6IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0LCBwcm90byl7XHJcbiAgICBDb25zdHJ1Y3Rvci5wcm90b3R5cGUgPSAkLmNyZWF0ZShwcm90byB8fCAkaXRlci5wcm90b3R5cGUsIHtuZXh0OiAkLmRlc2MoMSwgbmV4dCl9KTtcclxuICAgIGNvZi5zZXQoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XHJcbiAgfSxcclxuICBkZWZpbmU6IGRlZmluZUl0ZXJhdG9yLFxyXG4gIHN0ZDogZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0Upe1xyXG4gICAgZnVuY3Rpb24gY3JlYXRlSXRlcihraW5kKXtcclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTtcclxuICAgICAgfTtcclxuICAgIH1cclxuICAgICRpdGVyLmNyZWF0ZShDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCk7XHJcbiAgICB2YXIgZW50cmllcyA9IGNyZWF0ZUl0ZXIoJ2tleSt2YWx1ZScpXHJcbiAgICAgICwgdmFsdWVzICA9IGNyZWF0ZUl0ZXIoJ3ZhbHVlJylcclxuICAgICAgLCBwcm90byAgID0gQmFzZS5wcm90b3R5cGVcclxuICAgICAgLCBtZXRob2RzLCBrZXk7XHJcbiAgICBpZihERUZBVUxUID09ICd2YWx1ZScpdmFsdWVzID0gZGVmaW5lSXRlcmF0b3IoQmFzZSwgTkFNRSwgdmFsdWVzLCAndmFsdWVzJyk7XHJcbiAgICBlbHNlIGVudHJpZXMgPSBkZWZpbmVJdGVyYXRvcihCYXNlLCBOQU1FLCBlbnRyaWVzLCAnZW50cmllcycpO1xyXG4gICAgaWYoREVGQVVMVCl7XHJcbiAgICAgIG1ldGhvZHMgPSB7XHJcbiAgICAgICAgZW50cmllczogZW50cmllcyxcclxuICAgICAgICBrZXlzOiAgICBJU19TRVQgPyB2YWx1ZXMgOiBjcmVhdGVJdGVyKCdrZXknKSxcclxuICAgICAgICB2YWx1ZXM6ICB2YWx1ZXNcclxuICAgICAgfTtcclxuICAgICAgJGRlZigkZGVmLlAgKyAkZGVmLkYgKiBCVUdHWSwgTkFNRSwgbWV0aG9kcyk7XHJcbiAgICAgIGlmKEZPUkNFKWZvcihrZXkgaW4gbWV0aG9kcyl7XHJcbiAgICAgICAgaWYoIShrZXkgaW4gcHJvdG8pKSQuaGlkZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICBmb3JPZjogZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0KXtcclxuICAgIHZhciBpdGVyYXRvciA9IGdldEl0ZXJhdG9yKGl0ZXJhYmxlKVxyXG4gICAgICAsIGYgPSBjdHgoZm4sIHRoYXQsIGVudHJpZXMgPyAyIDogMSlcclxuICAgICAgLCBzdGVwO1xyXG4gICAgd2hpbGUoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKXtcclxuICAgICAgaWYoc3RlcENhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpID09PSBmYWxzZSl7XHJcbiAgICAgICAgcmV0dXJuIGNsb3NlSXRlcmF0b3IoaXRlcmF0b3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyIGdsb2JhbCA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKClcclxuICAsIGNvcmUgICA9IHt9XHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eVxyXG4gICwgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eVxyXG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcclxuICAsIGZsb29yID0gTWF0aC5mbG9vclxyXG4gICwgbWF4ICAgPSBNYXRoLm1heFxyXG4gICwgbWluICAgPSBNYXRoLm1pbjtcclxuLy8gVGhlIGVuZ2luZSB3b3JrcyBmaW5lIHdpdGggZGVzY3JpcHRvcnM/IFRoYW5rJ3MgSUU4IGZvciBoaXMgZnVubnkgZGVmaW5lUHJvcGVydHkuXHJcbnZhciBERVNDID0gISFmdW5jdGlvbigpe1xyXG4gIHRyeSB7XHJcbiAgICByZXR1cm4gZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDI7IH19KS5hID09IDI7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG59KCk7XHJcbnZhciBoaWRlID0gY3JlYXRlRGVmaW5lcigxKTtcclxuLy8gNy4xLjQgVG9JbnRlZ2VyXHJcbmZ1bmN0aW9uIHRvSW50ZWdlcihpdCl7XHJcbiAgcmV0dXJuIGlzTmFOKGl0ID0gK2l0KSA/IDAgOiAoaXQgPiAwID8gZmxvb3IgOiBjZWlsKShpdCk7XHJcbn1cclxuZnVuY3Rpb24gZGVzYyhiaXRtYXAsIHZhbHVlKXtcclxuICByZXR1cm4ge1xyXG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxyXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxyXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxyXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxyXG4gIH07XHJcbn1cclxuZnVuY3Rpb24gc2ltcGxlU2V0KG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcclxuICByZXR1cm4gb2JqZWN0O1xyXG59XHJcbmZ1bmN0aW9uIGNyZWF0ZURlZmluZXIoYml0bWFwKXtcclxuICByZXR1cm4gREVTQyA/IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XHJcbiAgICByZXR1cm4gJC5zZXREZXNjKG9iamVjdCwga2V5LCBkZXNjKGJpdG1hcCwgdmFsdWUpKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11c2UtYmVmb3JlLWRlZmluZVxyXG4gIH0gOiBzaW1wbGVTZXQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzT2JqZWN0KGl0KXtcclxuICByZXR1cm4gaXQgIT09IG51bGwgJiYgKHR5cGVvZiBpdCA9PSAnb2JqZWN0JyB8fCB0eXBlb2YgaXQgPT0gJ2Z1bmN0aW9uJyk7XHJcbn1cclxuZnVuY3Rpb24gaXNGdW5jdGlvbihpdCl7XHJcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnZnVuY3Rpb24nO1xyXG59XHJcbmZ1bmN0aW9uIGFzc2VydERlZmluZWQoaXQpe1xyXG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XHJcbiAgcmV0dXJuIGl0O1xyXG59XHJcblxyXG52YXIgJCA9IG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi8kLmZ3Jykoe1xyXG4gIGc6IGdsb2JhbCxcclxuICBjb3JlOiBjb3JlLFxyXG4gIGh0bWw6IGdsb2JhbC5kb2N1bWVudCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXHJcbiAgLy8gaHR0cDovL2pzcGVyZi5jb20vY29yZS1qcy1pc29iamVjdFxyXG4gIGlzT2JqZWN0OiAgIGlzT2JqZWN0LFxyXG4gIGlzRnVuY3Rpb246IGlzRnVuY3Rpb24sXHJcbiAgaXQ6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBpdDtcclxuICB9LFxyXG4gIHRoYXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpcztcclxuICB9LFxyXG4gIC8vIDcuMS40IFRvSW50ZWdlclxyXG4gIHRvSW50ZWdlcjogdG9JbnRlZ2VyLFxyXG4gIC8vIDcuMS4xNSBUb0xlbmd0aFxyXG4gIHRvTGVuZ3RoOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxyXG4gIH0sXHJcbiAgdG9JbmRleDogZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XHJcbiAgICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XHJcbiAgICByZXR1cm4gaW5kZXggPCAwID8gbWF4KGluZGV4ICsgbGVuZ3RoLCAwKSA6IG1pbihpbmRleCwgbGVuZ3RoKTtcclxuICB9LFxyXG4gIGhhczogZnVuY3Rpb24oaXQsIGtleSl7XHJcbiAgICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcclxuICB9LFxyXG4gIGNyZWF0ZTogICAgIE9iamVjdC5jcmVhdGUsXHJcbiAgZ2V0UHJvdG86ICAgT2JqZWN0LmdldFByb3RvdHlwZU9mLFxyXG4gIERFU0M6ICAgICAgIERFU0MsXHJcbiAgZGVzYzogICAgICAgZGVzYyxcclxuICBnZXREZXNjOiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxyXG4gIHNldERlc2M6ICAgIGRlZmluZVByb3BlcnR5LFxyXG4gIGdldEtleXM6ICAgIE9iamVjdC5rZXlzLFxyXG4gIGdldE5hbWVzOiAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzLFxyXG4gIGdldFN5bWJvbHM6IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXHJcbiAgLy8gRHVtbXksIGZpeCBmb3Igbm90IGFycmF5LWxpa2UgRVMzIHN0cmluZyBpbiBlczUgbW9kdWxlXHJcbiAgYXNzZXJ0RGVmaW5lZDogYXNzZXJ0RGVmaW5lZCxcclxuICBFUzVPYmplY3Q6IE9iamVjdCxcclxuICB0b09iamVjdDogZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuICQuRVM1T2JqZWN0KGFzc2VydERlZmluZWQoaXQpKTtcclxuICB9LFxyXG4gIGhpZGU6IGhpZGUsXHJcbiAgZGVmOiBjcmVhdGVEZWZpbmVyKDApLFxyXG4gIHNldDogZ2xvYmFsLlN5bWJvbCA/IHNpbXBsZVNldCA6IGhpZGUsXHJcbiAgbWl4OiBmdW5jdGlvbih0YXJnZXQsIHNyYyl7XHJcbiAgICBmb3IodmFyIGtleSBpbiBzcmMpaGlkZSh0YXJnZXQsIGtleSwgc3JjW2tleV0pO1xyXG4gICAgcmV0dXJuIHRhcmdldDtcclxuICB9LFxyXG4gIGVhY2g6IFtdLmZvckVhY2hcclxufSk7XHJcbmlmKHR5cGVvZiBfX2UgIT0gJ3VuZGVmaW5lZCcpX19lID0gY29yZTtcclxuaWYodHlwZW9mIF9fZyAhPSAndW5kZWZpbmVkJylfX2cgPSBnbG9iYWw7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGVsKXtcclxuICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXHJcbiAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhPKVxyXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgLCBpbmRleCAgPSAwXHJcbiAgICAsIGtleTtcclxuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xyXG59OyIsInZhciAkICAgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpLm9iajtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XHJcbiAgYXNzZXJ0T2JqZWN0KGl0KTtcclxuICByZXR1cm4gJC5nZXRTeW1ib2xzID8gJC5nZXROYW1lcyhpdCkuY29uY2F0KCQuZ2V0U3ltYm9scyhpdCkpIDogJC5nZXROYW1lcyhpdCk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGludm9rZSA9IHJlcXVpcmUoJy4vJC5pbnZva2UnKVxyXG4gICwgYXNzZXJ0RnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYXNzZXJ0JykuZm47XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oLyogLi4ucGFyZ3MgKi8pe1xyXG4gIHZhciBmbiAgICAgPSBhc3NlcnRGdW5jdGlvbih0aGlzKVxyXG4gICAgLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAsIHBhcmdzICA9IEFycmF5KGxlbmd0aClcclxuICAgICwgaSAgICAgID0gMFxyXG4gICAgLCBfICAgICAgPSAkLnBhdGguX1xyXG4gICAgLCBob2xkZXIgPSBmYWxzZTtcclxuICB3aGlsZShsZW5ndGggPiBpKWlmKChwYXJnc1tpXSA9IGFyZ3VtZW50c1tpKytdKSA9PT0gXylob2xkZXIgPSB0cnVlO1xyXG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcclxuICAgIHZhciB0aGF0ICAgID0gdGhpc1xyXG4gICAgICAsIF9sZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoXHJcbiAgICAgICwgaiA9IDAsIGsgPSAwLCBhcmdzO1xyXG4gICAgaWYoIWhvbGRlciAmJiAhX2xlbmd0aClyZXR1cm4gaW52b2tlKGZuLCBwYXJncywgdGhhdCk7XHJcbiAgICBhcmdzID0gcGFyZ3Muc2xpY2UoKTtcclxuICAgIGlmKGhvbGRlcilmb3IoO2xlbmd0aCA+IGo7IGorKylpZihhcmdzW2pdID09PSBfKWFyZ3Nbal0gPSBhcmd1bWVudHNbaysrXTtcclxuICAgIHdoaWxlKF9sZW5ndGggPiBrKWFyZ3MucHVzaChhcmd1bWVudHNbaysrXSk7XHJcbiAgICByZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGF0KTtcclxuICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihyZWdFeHAsIHJlcGxhY2UsIGlzU3RhdGljKXtcclxuICB2YXIgcmVwbGFjZXIgPSByZXBsYWNlID09PSBPYmplY3QocmVwbGFjZSkgPyBmdW5jdGlvbihwYXJ0KXtcclxuICAgIHJldHVybiByZXBsYWNlW3BhcnRdO1xyXG4gIH0gOiByZXBsYWNlO1xyXG4gIHJldHVybiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gU3RyaW5nKGlzU3RhdGljID8gaXQgOiB0aGlzKS5yZXBsYWNlKHJlZ0V4cCwgcmVwbGFjZXIpO1xyXG4gIH07XHJcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmtzIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxyXG4vKmVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXHJcbnZhciAkICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgYXNzZXJ0ID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpO1xyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gID8gZnVuY3Rpb24oYnVnZ3ksIHNldCl7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsICQuZ2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcclxuICAgICAgICBzZXQoe30sIFtdKTtcclxuICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XHJcbiAgICAgIHJldHVybiBmdW5jdGlvbihPLCBwcm90byl7XHJcbiAgICAgICAgYXNzZXJ0Lm9iaihPKTtcclxuICAgICAgICBhc3NlcnQocHJvdG8gPT09IG51bGwgfHwgJC5pc09iamVjdChwcm90byksIHByb3RvLCBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XHJcbiAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcclxuICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XHJcbiAgICAgICAgcmV0dXJuIE87XHJcbiAgICAgIH07XHJcbiAgICB9KClcclxuICA6IHVuZGVmaW5lZCk7IiwidmFyICQgPSByZXF1aXJlKCcuLyQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDKXtcclxuICBpZigkLkRFU0MgJiYgJC5GVykkLnNldERlc2MoQywgcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJyksIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogJC50aGF0XHJcbiAgfSk7XHJcbn07IiwiJ3VzZSBzdHJpY3QnO1xyXG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcclxuLy8gZmFsc2UgLT4gU3RyaW5nI2NvZGVQb2ludEF0XHJcbnZhciAkID0gcmVxdWlyZSgnLi8kJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcclxuICByZXR1cm4gZnVuY3Rpb24ocG9zKXtcclxuICAgIHZhciBzID0gU3RyaW5nKCQuYXNzZXJ0RGVmaW5lZCh0aGlzKSlcclxuICAgICAgLCBpID0gJC50b0ludGVnZXIocG9zKVxyXG4gICAgICAsIGwgPSBzLmxlbmd0aFxyXG4gICAgICAsIGEsIGI7XHJcbiAgICBpZihpIDwgMCB8fCBpID49IGwpcmV0dXJuIFRPX1NUUklORyA/ICcnIDogdW5kZWZpbmVkO1xyXG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcclxuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGxcclxuICAgICAgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXHJcbiAgICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcclxuICAgICAgICA6IFRPX1NUUklORyA/IHMuc2xpY2UoaSwgaSArIDIpIDogKGEgLSAweGQ4MDAgPDwgMTApICsgKGIgLSAweGRjMDApICsgMHgxMDAwMDtcclxuICB9O1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgaW52b2tlID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSAkLmdcclxuICAsIGlzRnVuY3Rpb24gICAgICAgICA9ICQuaXNGdW5jdGlvblxyXG4gICwgc2V0VGFzayAgICAgICAgICAgID0gZ2xvYmFsLnNldEltbWVkaWF0ZVxyXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXHJcbiAgLCBwb3N0TWVzc2FnZSAgICAgICAgPSBnbG9iYWwucG9zdE1lc3NhZ2VcclxuICAsIGFkZEV2ZW50TGlzdGVuZXIgICA9IGdsb2JhbC5hZGRFdmVudExpc3RlbmVyXHJcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcclxuICAsIGNvdW50ZXIgICAgICAgICAgICA9IDBcclxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XHJcbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xyXG4gICwgZGVmZXIsIGNoYW5uZWwsIHBvcnQ7XHJcbmZ1bmN0aW9uIHJ1bigpe1xyXG4gIHZhciBpZCA9ICt0aGlzO1xyXG4gIGlmKCQuaGFzKHF1ZXVlLCBpZCkpe1xyXG4gICAgdmFyIGZuID0gcXVldWVbaWRdO1xyXG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcclxuICAgIGZuKCk7XHJcbiAgfVxyXG59XHJcbmZ1bmN0aW9uIGxpc3RuZXIoZXZlbnQpe1xyXG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xyXG59XHJcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcclxuaWYoIWlzRnVuY3Rpb24oc2V0VGFzaykgfHwgIWlzRnVuY3Rpb24oY2xlYXJUYXNrKSl7XHJcbiAgc2V0VGFzayA9IGZ1bmN0aW9uKGZuKXtcclxuICAgIHZhciBhcmdzID0gW10sIGkgPSAxO1xyXG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcclxuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xyXG4gICAgICBpbnZva2UoaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKSwgYXJncyk7XHJcbiAgICB9O1xyXG4gICAgZGVmZXIoY291bnRlcik7XHJcbiAgICByZXR1cm4gY291bnRlcjtcclxuICB9O1xyXG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uKGlkKXtcclxuICAgIGRlbGV0ZSBxdWV1ZVtpZF07XHJcbiAgfTtcclxuICAvLyBOb2RlLmpzIDAuOC1cclxuICBpZihjb2YoZ2xvYmFsLnByb2Nlc3MpID09ICdwcm9jZXNzJyl7XHJcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcclxuICAgICAgZ2xvYmFsLnByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcclxuICAgIH07XHJcbiAgLy8gTW9kZXJuIGJyb3dzZXJzLCBza2lwIGltcGxlbWVudGF0aW9uIGZvciBXZWJXb3JrZXJzXHJcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgb2JqZWN0XHJcbiAgfSBlbHNlIGlmKGFkZEV2ZW50TGlzdGVuZXIgJiYgaXNGdW5jdGlvbihwb3N0TWVzc2FnZSkgJiYgISQuZy5pbXBvcnRTY3JpcHRzKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBwb3N0TWVzc2FnZShpZCwgJyonKTtcclxuICAgIH07XHJcbiAgICBhZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdG5lciwgZmFsc2UpO1xyXG4gIC8vIFdlYldvcmtlcnNcclxuICB9IGVsc2UgaWYoaXNGdW5jdGlvbihNZXNzYWdlQ2hhbm5lbCkpe1xyXG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcclxuICAgIHBvcnQgICAgPSBjaGFubmVsLnBvcnQyO1xyXG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0bmVyO1xyXG4gICAgZGVmZXIgPSBjdHgocG9ydC5wb3N0TWVzc2FnZSwgcG9ydCwgMSk7XHJcbiAgLy8gSUU4LVxyXG4gIH0gZWxzZSBpZigkLmcuZG9jdW1lbnQgJiYgT05SRUFEWVNUQVRFQ0hBTkdFIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpKXtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICAkLmh0bWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2NyaXB0JykpW09OUkVBRFlTVEFURUNIQU5HRV0gPSBmdW5jdGlvbigpe1xyXG4gICAgICAgICQuaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcclxuICAgICAgICBydW4uY2FsbChpZCk7XHJcbiAgICAgIH07XHJcbiAgICB9O1xyXG4gIC8vIFJlc3Qgb2xkIGJyb3dzZXJzXHJcbiAgfSBlbHNlIHtcclxuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xyXG4gICAgICBzZXRUaW1lb3V0KGN0eChydW4sIGlkLCAxKSwgMCk7XHJcbiAgICB9O1xyXG4gIH1cclxufVxyXG5tb2R1bGUuZXhwb3J0cyA9IHtcclxuICBzZXQ6ICAgc2V0VGFzayxcclxuICBjbGVhcjogY2xlYXJUYXNrXHJcbn07IiwidmFyIHNpZCA9IDA7XHJcbmZ1bmN0aW9uIHVpZChrZXkpe1xyXG4gIHJldHVybiAnU3ltYm9sKCcgKyBrZXkgKyAnKV8nICsgKCsrc2lkICsgTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpO1xyXG59XHJcbnVpZC5zYWZlID0gcmVxdWlyZSgnLi8kJykuZy5TeW1ib2wgfHwgdWlkO1xyXG5tb2R1bGUuZXhwb3J0cyA9IHVpZDsiLCIvLyAyMi4xLjMuMzEgQXJyYXkucHJvdG90eXBlW0BAdW5zY29wYWJsZXNdXHJcbnZhciAkICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBVTlNDT1BBQkxFUyA9IHJlcXVpcmUoJy4vJC53a3MnKSgndW5zY29wYWJsZXMnKTtcclxuaWYoJC5GVyAmJiAhKFVOU0NPUEFCTEVTIGluIFtdKSkkLmhpZGUoQXJyYXkucHJvdG90eXBlLCBVTlNDT1BBQkxFUywge30pO1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XHJcbiAgaWYoJC5GVylbXVtVTlNDT1BBQkxFU11ba2V5XSA9IHRydWU7XHJcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vJCcpLmdcclxuICAsIHN0b3JlICA9IHt9O1xyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG5hbWUpe1xyXG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxyXG4gICAgZ2xvYmFsLlN5bWJvbCAmJiBnbG9iYWwuU3ltYm9sW25hbWVdIHx8IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdTeW1ib2wuJyArIG5hbWUpKTtcclxufTsiLCJ2YXIgJCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmICAgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpbnZva2UgICAgICAgICAgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBhcnJheU1ldGhvZCAgICAgID0gcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKVxyXG4gICwgSUVfUFJPVE8gICAgICAgICA9IHJlcXVpcmUoJy4vJC51aWQnKS5zYWZlKCdfX3Byb3RvX18nKVxyXG4gICwgYXNzZXJ0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vJC5hc3NlcnQnKVxyXG4gICwgYXNzZXJ0T2JqZWN0ICAgICA9IGFzc2VydC5vYmpcclxuICAsIE9iamVjdFByb3RvICAgICAgPSBPYmplY3QucHJvdG90eXBlXHJcbiAgLCBBICAgICAgICAgICAgICAgID0gW11cclxuICAsIHNsaWNlICAgICAgICAgICAgPSBBLnNsaWNlXHJcbiAgLCBpbmRleE9mICAgICAgICAgID0gQS5pbmRleE9mXHJcbiAgLCBjbGFzc29mICAgICAgICAgID0gY29mLmNsYXNzb2ZcclxuICAsIGRlZmluZVByb3BlcnRpZXMgPSBPYmplY3QuZGVmaW5lUHJvcGVydGllc1xyXG4gICwgaGFzICAgICAgICAgICAgICA9ICQuaGFzXHJcbiAgLCBkZWZpbmVQcm9wZXJ0eSAgID0gJC5zZXREZXNjXHJcbiAgLCBnZXRPd25EZXNjcmlwdG9yID0gJC5nZXREZXNjXHJcbiAgLCBpc0Z1bmN0aW9uICAgICAgID0gJC5pc0Z1bmN0aW9uXHJcbiAgLCB0b09iamVjdCAgICAgICAgID0gJC50b09iamVjdFxyXG4gICwgdG9MZW5ndGggICAgICAgICA9ICQudG9MZW5ndGhcclxuICAsIElFOF9ET01fREVGSU5FICAgPSBmYWxzZTtcclxuXHJcbmlmKCEkLkRFU0Mpe1xyXG4gIHRyeSB7XHJcbiAgICBJRThfRE9NX0RFRklORSA9IGRlZmluZVByb3BlcnR5KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAneCcsXHJcbiAgICAgIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA4OyB9fVxyXG4gICAgKS54ID09IDg7XHJcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICQuc2V0RGVzYyA9IGZ1bmN0aW9uKE8sIFAsIEF0dHJpYnV0ZXMpe1xyXG4gICAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcclxuICAgICAgcmV0dXJuIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xyXG4gICAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxyXG4gICAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XHJcbiAgICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpYXNzZXJ0T2JqZWN0KE8pW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcclxuICAgIHJldHVybiBPO1xyXG4gIH07XHJcbiAgJC5nZXREZXNjID0gZnVuY3Rpb24oTywgUCl7XHJcbiAgICBpZihJRThfRE9NX0RFRklORSl0cnkge1xyXG4gICAgICByZXR1cm4gZ2V0T3duRGVzY3JpcHRvcihPLCBQKTtcclxuICAgIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICAgIGlmKGhhcyhPLCBQKSlyZXR1cm4gJC5kZXNjKCFPYmplY3RQcm90by5wcm9wZXJ0eUlzRW51bWVyYWJsZS5jYWxsKE8sIFApLCBPW1BdKTtcclxuICB9O1xyXG4gIGRlZmluZVByb3BlcnRpZXMgPSBmdW5jdGlvbihPLCBQcm9wZXJ0aWVzKXtcclxuICAgIGFzc2VydE9iamVjdChPKTtcclxuICAgIHZhciBrZXlzICAgPSAkLmdldEtleXMoUHJvcGVydGllcylcclxuICAgICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxyXG4gICAgICAsIGkgPSAwXHJcbiAgICAgICwgUDtcclxuICAgIHdoaWxlKGxlbmd0aCA+IGkpJC5zZXREZXNjKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xyXG4gICAgcmV0dXJuIE87XHJcbiAgfTtcclxufVxyXG4kZGVmKCRkZWYuUyArICRkZWYuRiAqICEkLkRFU0MsICdPYmplY3QnLCB7XHJcbiAgLy8gMTkuMS4yLjYgLyAxNS4yLjMuMyBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXHJcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkLmdldERlc2MsXHJcbiAgLy8gMTkuMS4yLjQgLyAxNS4yLjMuNiBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcclxuICBkZWZpbmVQcm9wZXJ0eTogJC5zZXREZXNjLFxyXG4gIC8vIDE5LjEuMi4zIC8gMTUuMi4zLjcgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcclxuICBkZWZpbmVQcm9wZXJ0aWVzOiBkZWZpbmVQcm9wZXJ0aWVzXHJcbn0pO1xyXG5cclxuICAvLyBJRSA4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXHJcbnZhciBrZXlzMSA9ICgnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSwnICtcclxuICAgICAgICAgICAgJ3RvTG9jYWxlU3RyaW5nLHRvU3RyaW5nLHZhbHVlT2YnKS5zcGxpdCgnLCcpXHJcbiAgLy8gQWRkaXRpb25hbCBrZXlzIGZvciBnZXRPd25Qcm9wZXJ0eU5hbWVzXHJcbiAgLCBrZXlzMiA9IGtleXMxLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpXHJcbiAgLCBrZXlzTGVuMSA9IGtleXMxLmxlbmd0aDtcclxuXHJcbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXHJcbnZhciBjcmVhdGVEaWN0ID0gZnVuY3Rpb24oKXtcclxuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xyXG4gIHZhciBpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKVxyXG4gICAgLCBpICAgICAgPSBrZXlzTGVuMVxyXG4gICAgLCBpZnJhbWVEb2N1bWVudDtcclxuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICAkLmh0bWwuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXHJcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcclxuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XHJcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+ZG9jdW1lbnQuRj1PYmplY3Q8L3NjcmlwdD4nKTtcclxuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xyXG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xyXG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdC5wcm90b3R5cGVba2V5czFbaV1dO1xyXG4gIHJldHVybiBjcmVhdGVEaWN0KCk7XHJcbn07XHJcbmZ1bmN0aW9uIGNyZWF0ZUdldEtleXMobmFtZXMsIGxlbmd0aCl7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIGkgICAgICA9IDBcclxuICAgICAgLCByZXN1bHQgPSBbXVxyXG4gICAgICAsIGtleTtcclxuICAgIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcclxuICAgIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcclxuICAgIHdoaWxlKGxlbmd0aCA+IGkpaWYoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKXtcclxuICAgICAgfmluZGV4T2YuY2FsbChyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcclxuICAgIH1cclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfTtcclxufVxyXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShpdCl7IHJldHVybiAhJC5pc09iamVjdChpdCk7IH1cclxuZnVuY3Rpb24gRW1wdHkoKXt9XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xyXG4gIC8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXHJcbiAgZ2V0UHJvdG90eXBlT2Y6ICQuZ2V0UHJvdG8gPSAkLmdldFByb3RvIHx8IGZ1bmN0aW9uKE8pe1xyXG4gICAgTyA9IE9iamVjdChhc3NlcnQuZGVmKE8pKTtcclxuICAgIGlmKGhhcyhPLCBJRV9QUk9UTykpcmV0dXJuIE9bSUVfUFJPVE9dO1xyXG4gICAgaWYoaXNGdW5jdGlvbihPLmNvbnN0cnVjdG9yKSAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XHJcbiAgICAgIHJldHVybiBPLmNvbnN0cnVjdG9yLnByb3RvdHlwZTtcclxuICAgIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XHJcbiAgfSxcclxuICAvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXHJcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogJC5nZXROYW1lcyA9ICQuZ2V0TmFtZXMgfHwgY3JlYXRlR2V0S2V5cyhrZXlzMiwga2V5czIubGVuZ3RoLCB0cnVlKSxcclxuICAvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcclxuICBjcmVhdGU6ICQuY3JlYXRlID0gJC5jcmVhdGUgfHwgZnVuY3Rpb24oTywgLyo/Ki9Qcm9wZXJ0aWVzKXtcclxuICAgIHZhciByZXN1bHQ7XHJcbiAgICBpZihPICE9PSBudWxsKXtcclxuICAgICAgRW1wdHkucHJvdG90eXBlID0gYXNzZXJ0T2JqZWN0KE8pO1xyXG4gICAgICByZXN1bHQgPSBuZXcgRW1wdHkoKTtcclxuICAgICAgRW1wdHkucHJvdG90eXBlID0gbnVsbDtcclxuICAgICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBzaGltXHJcbiAgICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xyXG4gICAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcclxuICAgIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkZWZpbmVQcm9wZXJ0aWVzKHJlc3VsdCwgUHJvcGVydGllcyk7XHJcbiAgfSxcclxuICAvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcclxuICBrZXlzOiAkLmdldEtleXMgPSAkLmdldEtleXMgfHwgY3JlYXRlR2V0S2V5cyhrZXlzMSwga2V5c0xlbjEsIGZhbHNlKSxcclxuICAvLyAxOS4xLjIuMTcgLyAxNS4yLjMuOCBPYmplY3Quc2VhbChPKVxyXG4gIHNlYWw6ICQuaXQsIC8vIDwtIGNhcFxyXG4gIC8vIDE5LjEuMi41IC8gMTUuMi4zLjkgT2JqZWN0LmZyZWV6ZShPKVxyXG4gIGZyZWV6ZTogJC5pdCwgLy8gPC0gY2FwXHJcbiAgLy8gMTkuMS4yLjE1IC8gMTUuMi4zLjEwIE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyhPKVxyXG4gIHByZXZlbnRFeHRlbnNpb25zOiAkLml0LCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuMTMgLyAxNS4yLjMuMTEgT2JqZWN0LmlzU2VhbGVkKE8pXHJcbiAgaXNTZWFsZWQ6IGlzUHJpbWl0aXZlLCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuMTIgLyAxNS4yLjMuMTIgT2JqZWN0LmlzRnJvemVuKE8pXHJcbiAgaXNGcm96ZW46IGlzUHJpbWl0aXZlLCAvLyA8LSBjYXBcclxuICAvLyAxOS4xLjIuMTEgLyAxNS4yLjMuMTMgT2JqZWN0LmlzRXh0ZW5zaWJsZShPKVxyXG4gIGlzRXh0ZW5zaWJsZTogJC5pc09iamVjdCAvLyA8LSBjYXBcclxufSk7XHJcblxyXG4vLyAxOS4yLjMuMiAvIDE1LjMuNC41IEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kKHRoaXNBcmcsIGFyZ3MuLi4pXHJcbiRkZWYoJGRlZi5QLCAnRnVuY3Rpb24nLCB7XHJcbiAgYmluZDogZnVuY3Rpb24odGhhdCAvKiwgYXJncy4uLiAqLyl7XHJcbiAgICB2YXIgZm4gICAgICAgPSBhc3NlcnQuZm4odGhpcylcclxuICAgICAgLCBwYXJ0QXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcclxuICAgIGZ1bmN0aW9uIGJvdW5kKC8qIGFyZ3MuLi4gKi8pe1xyXG4gICAgICB2YXIgYXJncyA9IHBhcnRBcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpO1xyXG4gICAgICByZXR1cm4gaW52b2tlKGZuLCBhcmdzLCB0aGlzIGluc3RhbmNlb2YgYm91bmQgPyAkLmNyZWF0ZShmbi5wcm90b3R5cGUpIDogdGhhdCk7XHJcbiAgICB9XHJcbiAgICBpZihmbi5wcm90b3R5cGUpYm91bmQucHJvdG90eXBlID0gZm4ucHJvdG90eXBlO1xyXG4gICAgcmV0dXJuIGJvdW5kO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyBGaXggZm9yIG5vdCBhcnJheS1saWtlIEVTMyBzdHJpbmdcclxuZnVuY3Rpb24gYXJyYXlNZXRob2RGaXgoZm4pe1xyXG4gIHJldHVybiBmdW5jdGlvbigpe1xyXG4gICAgcmV0dXJuIGZuLmFwcGx5KCQuRVM1T2JqZWN0KHRoaXMpLCBhcmd1bWVudHMpO1xyXG4gIH07XHJcbn1cclxuaWYoISgwIGluIE9iamVjdCgneicpICYmICd6J1swXSA9PSAneicpKXtcclxuICAkLkVTNU9iamVjdCA9IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcclxuICB9O1xyXG59XHJcbiRkZWYoJGRlZi5QICsgJGRlZi5GICogKCQuRVM1T2JqZWN0ICE9IE9iamVjdCksICdBcnJheScsIHtcclxuICBzbGljZTogYXJyYXlNZXRob2RGaXgoc2xpY2UpLFxyXG4gIGpvaW46IGFycmF5TWV0aG9kRml4KEEuam9pbilcclxufSk7XHJcblxyXG4vLyAyMi4xLjIuMiAvIDE1LjQuMy4yIEFycmF5LmlzQXJyYXkoYXJnKVxyXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywge1xyXG4gIGlzQXJyYXk6IGZ1bmN0aW9uKGFyZyl7XHJcbiAgICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5JztcclxuICB9XHJcbn0pO1xyXG5mdW5jdGlvbiBjcmVhdGVBcnJheVJlZHVjZShpc1JpZ2h0KXtcclxuICByZXR1cm4gZnVuY3Rpb24oY2FsbGJhY2tmbiwgbWVtbyl7XHJcbiAgICBhc3NlcnQuZm4oY2FsbGJhY2tmbik7XHJcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcclxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSBpc1JpZ2h0ID8gbGVuZ3RoIC0gMSA6IDBcclxuICAgICAgLCBpICAgICAgPSBpc1JpZ2h0ID8gLTEgOiAxO1xyXG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA8IDIpZm9yKDs7KXtcclxuICAgICAgaWYoaW5kZXggaW4gTyl7XHJcbiAgICAgICAgbWVtbyA9IE9baW5kZXhdO1xyXG4gICAgICAgIGluZGV4ICs9IGk7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgICAgaW5kZXggKz0gaTtcclxuICAgICAgYXNzZXJ0KGlzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXgsICdSZWR1Y2Ugb2YgZW1wdHkgYXJyYXkgd2l0aCBubyBpbml0aWFsIHZhbHVlJyk7XHJcbiAgICB9XHJcbiAgICBmb3IoO2lzUmlnaHQgPyBpbmRleCA+PSAwIDogbGVuZ3RoID4gaW5kZXg7IGluZGV4ICs9IGkpaWYoaW5kZXggaW4gTyl7XHJcbiAgICAgIG1lbW8gPSBjYWxsYmFja2ZuKG1lbW8sIE9baW5kZXhdLCBpbmRleCwgdGhpcyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWVtbztcclxuICB9O1xyXG59XHJcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XHJcbiAgLy8gMjIuMS4zLjEwIC8gMTUuNC40LjE4IEFycmF5LnByb3RvdHlwZS5mb3JFYWNoKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgZm9yRWFjaDogJC5lYWNoID0gJC5lYWNoIHx8IGFycmF5TWV0aG9kKDApLFxyXG4gIC8vIDIyLjEuMy4xNSAvIDE1LjQuNC4xOSBBcnJheS5wcm90b3R5cGUubWFwKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgbWFwOiBhcnJheU1ldGhvZCgxKSxcclxuICAvLyAyMi4xLjMuNyAvIDE1LjQuNC4yMCBBcnJheS5wcm90b3R5cGUuZmlsdGVyKGNhbGxiYWNrZm4gWywgdGhpc0FyZ10pXHJcbiAgZmlsdGVyOiBhcnJheU1ldGhvZCgyKSxcclxuICAvLyAyMi4xLjMuMjMgLyAxNS40LjQuMTcgQXJyYXkucHJvdG90eXBlLnNvbWUoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBzb21lOiBhcnJheU1ldGhvZCgzKSxcclxuICAvLyAyMi4xLjMuNSAvIDE1LjQuNC4xNiBBcnJheS5wcm90b3R5cGUuZXZlcnkoY2FsbGJhY2tmbiBbLCB0aGlzQXJnXSlcclxuICBldmVyeTogYXJyYXlNZXRob2QoNCksXHJcbiAgLy8gMjIuMS4zLjE4IC8gMTUuNC40LjIxIEFycmF5LnByb3RvdHlwZS5yZWR1Y2UoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxyXG4gIHJlZHVjZTogY3JlYXRlQXJyYXlSZWR1Y2UoZmFsc2UpLFxyXG4gIC8vIDIyLjEuMy4xOSAvIDE1LjQuNC4yMiBBcnJheS5wcm90b3R5cGUucmVkdWNlUmlnaHQoY2FsbGJhY2tmbiBbLCBpbml0aWFsVmFsdWVdKVxyXG4gIHJlZHVjZVJpZ2h0OiBjcmVhdGVBcnJheVJlZHVjZSh0cnVlKSxcclxuICAvLyAyMi4xLjMuMTEgLyAxNS40LjQuMTQgQXJyYXkucHJvdG90eXBlLmluZGV4T2Yoc2VhcmNoRWxlbWVudCBbLCBmcm9tSW5kZXhdKVxyXG4gIGluZGV4T2Y6IGluZGV4T2YgPSBpbmRleE9mIHx8IHJlcXVpcmUoJy4vJC5hcnJheS1pbmNsdWRlcycpKGZhbHNlKSxcclxuICAvLyAyMi4xLjMuMTQgLyAxNS40LjQuMTUgQXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mKHNlYXJjaEVsZW1lbnQgWywgZnJvbUluZGV4XSlcclxuICBsYXN0SW5kZXhPZjogZnVuY3Rpb24oZWwsIGZyb21JbmRleCAvKiA9IEBbKi0xXSAqLyl7XHJcbiAgICB2YXIgTyAgICAgID0gdG9PYmplY3QodGhpcylcclxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSBsZW5ndGggLSAxO1xyXG4gICAgaWYoYXJndW1lbnRzLmxlbmd0aCA+IDEpaW5kZXggPSBNYXRoLm1pbihpbmRleCwgJC50b0ludGVnZXIoZnJvbUluZGV4KSk7XHJcbiAgICBpZihpbmRleCA8IDApaW5kZXggPSB0b0xlbmd0aChsZW5ndGggKyBpbmRleCk7XHJcbiAgICBmb3IoO2luZGV4ID49IDA7IGluZGV4LS0paWYoaW5kZXggaW4gTylpZihPW2luZGV4XSA9PT0gZWwpcmV0dXJuIGluZGV4O1xyXG4gICAgcmV0dXJuIC0xO1xyXG4gIH1cclxufSk7XHJcblxyXG4vLyAyMS4xLjMuMjUgLyAxNS41LjQuMjAgU3RyaW5nLnByb3RvdHlwZS50cmltKClcclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7dHJpbTogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL15cXHMqKFtcXHNcXFNdKlxcUyk/XFxzKiQvLCAnJDEnKX0pO1xyXG5cclxuLy8gMjAuMy4zLjEgLyAxNS45LjQuNCBEYXRlLm5vdygpXHJcbiRkZWYoJGRlZi5TLCAnRGF0ZScsIHtub3c6IGZ1bmN0aW9uKCl7XHJcbiAgcmV0dXJuICtuZXcgRGF0ZTtcclxufX0pO1xyXG5cclxuZnVuY3Rpb24gbHoobnVtKXtcclxuICByZXR1cm4gbnVtID4gOSA/IG51bSA6ICcwJyArIG51bTtcclxufVxyXG4vLyAyMC4zLjQuMzYgLyAxNS45LjUuNDMgRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcoKVxyXG4kZGVmKCRkZWYuUCwgJ0RhdGUnLCB7dG9JU09TdHJpbmc6IGZ1bmN0aW9uKCl7XHJcbiAgaWYoIWlzRmluaXRlKHRoaXMpKXRocm93IFJhbmdlRXJyb3IoJ0ludmFsaWQgdGltZSB2YWx1ZScpO1xyXG4gIHZhciBkID0gdGhpc1xyXG4gICAgLCB5ID0gZC5nZXRVVENGdWxsWWVhcigpXHJcbiAgICAsIG0gPSBkLmdldFVUQ01pbGxpc2Vjb25kcygpXHJcbiAgICAsIHMgPSB5IDwgMCA/ICctJyA6IHkgPiA5OTk5ID8gJysnIDogJyc7XHJcbiAgcmV0dXJuIHMgKyAoJzAwMDAwJyArIE1hdGguYWJzKHkpKS5zbGljZShzID8gLTYgOiAtNCkgK1xyXG4gICAgJy0nICsgbHooZC5nZXRVVENNb250aCgpICsgMSkgKyAnLScgKyBseihkLmdldFVUQ0RhdGUoKSkgK1xyXG4gICAgJ1QnICsgbHooZC5nZXRVVENIb3VycygpKSArICc6JyArIGx6KGQuZ2V0VVRDTWludXRlcygpKSArXHJcbiAgICAnOicgKyBseihkLmdldFVUQ1NlY29uZHMoKSkgKyAnLicgKyAobSA+IDk5ID8gbSA6ICcwJyArIGx6KG0pKSArICdaJztcclxufX0pO1xyXG5cclxuaWYoY2xhc3NvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdPYmplY3QnKWNvZi5jbGFzc29mID0gZnVuY3Rpb24oaXQpe1xyXG4gIHZhciB0YWcgPSBjbGFzc29mKGl0KTtcclxuICByZXR1cm4gdGFnID09ICdPYmplY3QnICYmIGlzRnVuY3Rpb24oaXQuY2FsbGVlKSA/ICdBcmd1bWVudHMnIDogdGFnO1xyXG59OyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgdG9JbmRleCA9ICQudG9JbmRleDtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjMuMyBBcnJheS5wcm90b3R5cGUuY29weVdpdGhpbih0YXJnZXQsIHN0YXJ0LCBlbmQgPSB0aGlzLmxlbmd0aClcclxuICBjb3B5V2l0aGluOiBmdW5jdGlvbih0YXJnZXQvKiA9IDAgKi8sIHN0YXJ0IC8qID0gMCwgZW5kID0gQGxlbmd0aCAqLyl7XHJcbiAgICB2YXIgTyAgICAgPSBPYmplY3QoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGxlbiAgID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCB0byAgICA9IHRvSW5kZXgodGFyZ2V0LCBsZW4pXHJcbiAgICAgICwgZnJvbSAgPSB0b0luZGV4KHN0YXJ0LCBsZW4pXHJcbiAgICAgICwgZW5kICAgPSBhcmd1bWVudHNbMl1cclxuICAgICAgLCBmaW4gICA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogdG9JbmRleChlbmQsIGxlbilcclxuICAgICAgLCBjb3VudCA9IE1hdGgubWluKGZpbiAtIGZyb20sIGxlbiAtIHRvKVxyXG4gICAgICAsIGluYyAgID0gMTtcclxuICAgIGlmKGZyb20gPCB0byAmJiB0byA8IGZyb20gKyBjb3VudCl7XHJcbiAgICAgIGluYyAgPSAtMTtcclxuICAgICAgZnJvbSA9IGZyb20gKyBjb3VudCAtIDE7XHJcbiAgICAgIHRvICAgPSB0byAgICsgY291bnQgLSAxO1xyXG4gICAgfVxyXG4gICAgd2hpbGUoY291bnQtLSA+IDApe1xyXG4gICAgICBpZihmcm9tIGluIE8pT1t0b10gPSBPW2Zyb21dO1xyXG4gICAgICBlbHNlIGRlbGV0ZSBPW3RvXTtcclxuICAgICAgdG8gICArPSBpbmM7XHJcbiAgICAgIGZyb20gKz0gaW5jO1xyXG4gICAgfSByZXR1cm4gTztcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdjb3B5V2l0aGluJyk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0luZGV4ID0gJC50b0luZGV4O1xyXG4kZGVmKCRkZWYuUCwgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMy42IEFycmF5LnByb3RvdHlwZS5maWxsKHZhbHVlLCBzdGFydCA9IDAsIGVuZCA9IHRoaXMubGVuZ3RoKVxyXG4gIGZpbGw6IGZ1bmN0aW9uKHZhbHVlIC8qLCBzdGFydCA9IDAsIGVuZCA9IEBsZW5ndGggKi8pe1xyXG4gICAgdmFyIE8gICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgbGVuZ3RoID0gJC50b0xlbmd0aChPLmxlbmd0aClcclxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGFyZ3VtZW50c1sxXSwgbGVuZ3RoKVxyXG4gICAgICAsIGVuZCAgICA9IGFyZ3VtZW50c1syXVxyXG4gICAgICAsIGVuZFBvcyA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuZ3RoIDogdG9JbmRleChlbmQsIGxlbmd0aCk7XHJcbiAgICB3aGlsZShlbmRQb3MgPiBpbmRleClPW2luZGV4KytdID0gdmFsdWU7XHJcbiAgICByZXR1cm4gTztcclxuICB9XHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdmaWxsJyk7IiwidmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5QLCAnQXJyYXknLCB7XHJcbiAgLy8gMjIuMS4zLjkgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgZmluZEluZGV4OiByZXF1aXJlKCcuLyQuYXJyYXktbWV0aG9kcycpKDYpXHJcbn0pO1xyXG5yZXF1aXJlKCcuLyQudW5zY29wZScpKCdmaW5kSW5kZXgnKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICAvLyAyMi4xLjMuOCBBcnJheS5wcm90b3R5cGUuZmluZChwcmVkaWNhdGUsIHRoaXNBcmcgPSB1bmRlZmluZWQpXHJcbiAgZmluZDogcmVxdWlyZSgnLi8kLmFycmF5LW1ldGhvZHMnKSg1KVxyXG59KTtcclxucmVxdWlyZSgnLi8kLnVuc2NvcGUnKSgnZmluZCcpOyIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjdHggICA9IHJlcXVpcmUoJy4vJC5jdHgnKVxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsICRpdGVyID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgc3RlcENhbGwgPSAkaXRlci5zdGVwQ2FsbDtcclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAkaXRlci5EQU5HRVJfQ0xPU0lORywgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMi4xIEFycmF5LmZyb20oYXJyYXlMaWtlLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZClcclxuICBmcm9tOiBmdW5jdGlvbihhcnJheUxpa2UvKiwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQqLyl7XHJcbiAgICB2YXIgTyAgICAgICA9IE9iamVjdCgkLmFzc2VydERlZmluZWQoYXJyYXlMaWtlKSlcclxuICAgICAgLCBtYXBmbiAgID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcclxuICAgICAgLCBmICAgICAgID0gbWFwcGluZyA/IGN0eChtYXBmbiwgYXJndW1lbnRzWzJdLCAyKSA6IHVuZGVmaW5lZFxyXG4gICAgICAsIGluZGV4ICAgPSAwXHJcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xyXG4gICAgaWYoJGl0ZXIuaXMoTykpe1xyXG4gICAgICBpdGVyYXRvciA9ICRpdGVyLmdldChPKTtcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgcmVzdWx0ICAgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpO1xyXG4gICAgICBmb3IoOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7IGluZGV4Kyspe1xyXG4gICAgICAgIHJlc3VsdFtpbmRleF0gPSBtYXBwaW5nID8gc3RlcENhbGwoaXRlcmF0b3IsIGYsIFtzdGVwLnZhbHVlLCBpbmRleF0sIHRydWUpIDogc3RlcC52YWx1ZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgcmVzdWx0ID0gbmV3ICh0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nID8gdGhpcyA6IEFycmF5KShsZW5ndGggPSAkLnRvTGVuZ3RoKE8ubGVuZ3RoKSk7XHJcbiAgICAgIGZvcig7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcclxuICAgICAgICByZXN1bHRbaW5kZXhdID0gbWFwcGluZyA/IGYoT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXN1bHQubGVuZ3RoID0gaW5kZXg7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7IiwidmFyICQgICAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgc2V0VW5zY29wZSA9IHJlcXVpcmUoJy4vJC51bnNjb3BlJylcclxuICAsIElURVIgICAgICAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXHJcbiAgLCAkaXRlciAgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgc3RlcCAgICAgICA9ICRpdGVyLnN0ZXBcclxuICAsIEl0ZXJhdG9ycyAgPSAkaXRlci5JdGVyYXRvcnM7XHJcblxyXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXHJcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXHJcbi8vIDIyLjEuMy4yOSBBcnJheS5wcm90b3R5cGUudmFsdWVzKClcclxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXHJcbiRpdGVyLnN0ZChBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xyXG4gICQuc2V0KHRoaXMsIElURVIsIHtvOiAkLnRvT2JqZWN0KGl0ZXJhdGVkKSwgaTogMCwgazoga2luZH0pO1xyXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcclxufSwgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciAgPSB0aGlzW0lURVJdXHJcbiAgICAsIE8gICAgID0gaXRlci5vXHJcbiAgICAsIGtpbmQgID0gaXRlci5rXHJcbiAgICAsIGluZGV4ID0gaXRlci5pKys7XHJcbiAgaWYoIU8gfHwgaW5kZXggPj0gTy5sZW5ndGgpe1xyXG4gICAgaXRlci5vID0gdW5kZWZpbmVkO1xyXG4gICAgcmV0dXJuIHN0ZXAoMSk7XHJcbiAgfVxyXG4gIGlmKGtpbmQgPT0gJ2tleScgIClyZXR1cm4gc3RlcCgwLCBpbmRleCk7XHJcbiAgaWYoa2luZCA9PSAndmFsdWUnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcclxuICByZXR1cm4gc3RlcCgwLCBbaW5kZXgsIE9baW5kZXhdXSk7XHJcbn0sICd2YWx1ZScpO1xyXG5cclxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxyXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xyXG5cclxuc2V0VW5zY29wZSgna2V5cycpO1xyXG5zZXRVbnNjb3BlKCd2YWx1ZXMnKTtcclxuc2V0VW5zY29wZSgnZW50cmllcycpOyIsInZhciAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywge1xyXG4gIC8vIDIyLjEuMi4zIEFycmF5Lm9mKCAuLi5pdGVtcylcclxuICBvZjogZnVuY3Rpb24oLyogLi4uYXJncyAqLyl7XHJcbiAgICB2YXIgaW5kZXggID0gMFxyXG4gICAgICAsIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLy8gc3RyYW5nZSBJRSBxdWlya3MgbW9kZSBidWcgLT4gdXNlIHR5cGVvZiBpbnN0ZWFkIG9mIGlzRnVuY3Rpb25cclxuICAgICAgLCByZXN1bHQgPSBuZXcgKHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXkpKGxlbmd0aCk7XHJcbiAgICB3aGlsZShsZW5ndGggPiBpbmRleClyZXN1bHRbaW5kZXhdID0gYXJndW1lbnRzW2luZGV4KytdO1xyXG4gICAgcmVzdWx0Lmxlbmd0aCA9IGxlbmd0aDtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59KTsiLCJyZXF1aXJlKCcuLyQuc3BlY2llcycpKEFycmF5KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIE5BTUUgPSAnbmFtZSdcclxuICAsIHNldERlc2MgPSAkLnNldERlc2NcclxuICAsIEZ1bmN0aW9uUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XHJcbi8vIDE5LjIuNC4yIG5hbWVcclxuTkFNRSBpbiBGdW5jdGlvblByb3RvIHx8ICQuRlcgJiYgJC5ERVNDICYmIHNldERlc2MoRnVuY3Rpb25Qcm90bywgTkFNRSwge1xyXG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICBnZXQ6IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgbWF0Y2ggPSBTdHJpbmcodGhpcykubWF0Y2goL15cXHMqZnVuY3Rpb24gKFteIChdKikvKVxyXG4gICAgICAsIG5hbWUgID0gbWF0Y2ggPyBtYXRjaFsxXSA6ICcnO1xyXG4gICAgJC5oYXModGhpcywgTkFNRSkgfHwgc2V0RGVzYyh0aGlzLCBOQU1FLCAkLmRlc2MoNSwgbmFtZSkpO1xyXG4gICAgcmV0dXJuIG5hbWU7XHJcbiAgfSxcclxuICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcclxuICAgICQuaGFzKHRoaXMsIE5BTUUpIHx8IHNldERlc2ModGhpcywgTkFNRSwgJC5kZXNjKDAsIHZhbHVlKSk7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcclxuXHJcbi8vIDIzLjEgTWFwIE9iamVjdHNcclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnTWFwJywge1xyXG4gIC8vIDIzLjEuMy42IE1hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICB2YXIgZW50cnkgPSBzdHJvbmcuZ2V0RW50cnkodGhpcywga2V5KTtcclxuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeS52O1xyXG4gIH0sXHJcbiAgLy8gMjMuMS4zLjkgTWFwLnByb3RvdHlwZS5zZXQoa2V5LCB2YWx1ZSlcclxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xyXG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywga2V5ID09PSAwID8gMCA6IGtleSwgdmFsdWUpO1xyXG4gIH1cclxufSwgc3Ryb25nLCB0cnVlKTsiLCJ2YXIgSW5maW5pdHkgPSAxIC8gMFxyXG4gICwgJGRlZiAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIEUgICAgID0gTWF0aC5FXHJcbiAgLCBwb3cgICA9IE1hdGgucG93XHJcbiAgLCBhYnMgICA9IE1hdGguYWJzXHJcbiAgLCBleHAgICA9IE1hdGguZXhwXHJcbiAgLCBsb2cgICA9IE1hdGgubG9nXHJcbiAgLCBzcXJ0ICA9IE1hdGguc3FydFxyXG4gICwgY2VpbCAgPSBNYXRoLmNlaWxcclxuICAsIGZsb29yID0gTWF0aC5mbG9vclxyXG4gICwgc2lnbiAgPSBNYXRoLnNpZ24gfHwgZnVuY3Rpb24oeCl7XHJcbiAgICAgIHJldHVybiAoeCA9ICt4KSA9PSAwIHx8IHggIT0geCA/IHggOiB4IDwgMCA/IC0xIDogMTtcclxuICAgIH07XHJcblxyXG4vLyAyMC4yLjIuNSBNYXRoLmFzaW5oKHgpXHJcbmZ1bmN0aW9uIGFzaW5oKHgpe1xyXG4gIHJldHVybiAhaXNGaW5pdGUoeCA9ICt4KSB8fCB4ID09IDAgPyB4IDogeCA8IDAgPyAtYXNpbmgoLXgpIDogbG9nKHggKyBzcXJ0KHggKiB4ICsgMSkpO1xyXG59XHJcbi8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbmZ1bmN0aW9uIGV4cG0xKHgpe1xyXG4gIHJldHVybiAoeCA9ICt4KSA9PSAwID8geCA6IHggPiAtMWUtNiAmJiB4IDwgMWUtNiA/IHggKyB4ICogeCAvIDIgOiBleHAoeCkgLSAxO1xyXG59XHJcblxyXG4kZGVmKCRkZWYuUywgJ01hdGgnLCB7XHJcbiAgLy8gMjAuMi4yLjMgTWF0aC5hY29zaCh4KVxyXG4gIGFjb3NoOiBmdW5jdGlvbih4KXtcclxuICAgIHJldHVybiAoeCA9ICt4KSA8IDEgPyBOYU4gOiBpc0Zpbml0ZSh4KSA/IGxvZyh4IC8gRSArIHNxcnQoeCArIDEpICogc3FydCh4IC0gMSkgLyBFKSArIDEgOiB4O1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjUgTWF0aC5hc2luaCh4KVxyXG4gIGFzaW5oOiBhc2luaCxcclxuICAvLyAyMC4yLjIuNyBNYXRoLmF0YW5oKHgpXHJcbiAgYXRhbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgcmV0dXJuICh4ID0gK3gpID09IDAgPyB4IDogbG9nKCgxICsgeCkgLyAoMSAtIHgpKSAvIDI7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuOSBNYXRoLmNicnQoeClcclxuICBjYnJ0OiBmdW5jdGlvbih4KXtcclxuICAgIHJldHVybiBzaWduKHggPSAreCkgKiBwb3coYWJzKHgpLCAxIC8gMyk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTEgTWF0aC5jbHozMih4KVxyXG4gIGNsejMyOiBmdW5jdGlvbih4KXtcclxuICAgIHJldHVybiAoeCA+Pj49IDApID8gMzIgLSB4LnRvU3RyaW5nKDIpLmxlbmd0aCA6IDMyO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjEyIE1hdGguY29zaCh4KVxyXG4gIGNvc2g6IGZ1bmN0aW9uKHgpe1xyXG4gICAgcmV0dXJuIChleHAoeCA9ICt4KSArIGV4cCgteCkpIC8gMjtcclxuICB9LFxyXG4gIC8vIDIwLjIuMi4xNCBNYXRoLmV4cG0xKHgpXHJcbiAgZXhwbTE6IGV4cG0xLFxyXG4gIC8vIDIwLjIuMi4xNiBNYXRoLmZyb3VuZCh4KVxyXG4gIC8vIFRPRE86IGZhbGxiYWNrIGZvciBJRTktXHJcbiAgZnJvdW5kOiBmdW5jdGlvbih4KXtcclxuICAgIHJldHVybiBuZXcgRmxvYXQzMkFycmF5KFt4XSlbMF07XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMTcgTWF0aC5oeXBvdChbdmFsdWUxWywgdmFsdWUyWywg4oCmIF1dXSlcclxuICBoeXBvdDogZnVuY3Rpb24odmFsdWUxLCB2YWx1ZTIpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXHJcbiAgICB2YXIgc3VtICA9IDBcclxuICAgICAgLCBsZW4xID0gYXJndW1lbnRzLmxlbmd0aFxyXG4gICAgICAsIGxlbjIgPSBsZW4xXHJcbiAgICAgICwgYXJncyA9IEFycmF5KGxlbjEpXHJcbiAgICAgICwgbGFyZyA9IC1JbmZpbml0eVxyXG4gICAgICAsIGFyZztcclxuICAgIHdoaWxlKGxlbjEtLSl7XHJcbiAgICAgIGFyZyA9IGFyZ3NbbGVuMV0gPSArYXJndW1lbnRzW2xlbjFdO1xyXG4gICAgICBpZihhcmcgPT0gSW5maW5pdHkgfHwgYXJnID09IC1JbmZpbml0eSlyZXR1cm4gSW5maW5pdHk7XHJcbiAgICAgIGlmKGFyZyA+IGxhcmcpbGFyZyA9IGFyZztcclxuICAgIH1cclxuICAgIGxhcmcgPSBhcmcgfHwgMTtcclxuICAgIHdoaWxlKGxlbjItLSlzdW0gKz0gcG93KGFyZ3NbbGVuMl0gLyBsYXJnLCAyKTtcclxuICAgIHJldHVybiBsYXJnICogc3FydChzdW0pO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjE4IE1hdGguaW11bCh4LCB5KVxyXG4gIGltdWw6IGZ1bmN0aW9uKHgsIHkpe1xyXG4gICAgdmFyIFVJbnQxNiA9IDB4ZmZmZlxyXG4gICAgICAsIHhuID0gK3hcclxuICAgICAgLCB5biA9ICt5XHJcbiAgICAgICwgeGwgPSBVSW50MTYgJiB4blxyXG4gICAgICAsIHlsID0gVUludDE2ICYgeW47XHJcbiAgICByZXR1cm4gMCB8IHhsICogeWwgKyAoKFVJbnQxNiAmIHhuID4+PiAxNikgKiB5bCArIHhsICogKFVJbnQxNiAmIHluID4+PiAxNikgPDwgMTYgPj4+IDApO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIwIE1hdGgubG9nMXAoeClcclxuICBsb2cxcDogZnVuY3Rpb24oeCl7XHJcbiAgICByZXR1cm4gKHggPSAreCkgPiAtMWUtOCAmJiB4IDwgMWUtOCA/IHggLSB4ICogeCAvIDIgOiBsb2coMSArIHgpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIxIE1hdGgubG9nMTAoeClcclxuICBsb2cxMDogZnVuY3Rpb24oeCl7XHJcbiAgICByZXR1cm4gbG9nKHgpIC8gTWF0aC5MTjEwO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjIyIE1hdGgubG9nMih4KVxyXG4gIGxvZzI6IGZ1bmN0aW9uKHgpe1xyXG4gICAgcmV0dXJuIGxvZyh4KSAvIE1hdGguTE4yO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjI4IE1hdGguc2lnbih4KVxyXG4gIHNpZ246IHNpZ24sXHJcbiAgLy8gMjAuMi4yLjMwIE1hdGguc2luaCh4KVxyXG4gIHNpbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgcmV0dXJuIGFicyh4ID0gK3gpIDwgMSA/IChleHBtMSh4KSAtIGV4cG0xKC14KSkgLyAyIDogKGV4cCh4IC0gMSkgLSBleHAoLXggLSAxKSkgKiAoRSAvIDIpO1xyXG4gIH0sXHJcbiAgLy8gMjAuMi4yLjMzIE1hdGgudGFuaCh4KVxyXG4gIHRhbmg6IGZ1bmN0aW9uKHgpe1xyXG4gICAgdmFyIGEgPSBleHBtMSh4ID0gK3gpXHJcbiAgICAgICwgYiA9IGV4cG0xKC14KTtcclxuICAgIHJldHVybiBhID09IEluZmluaXR5ID8gMSA6IGIgPT0gSW5maW5pdHkgPyAtMSA6IChhIC0gYikgLyAoZXhwKHgpICsgZXhwKC14KSk7XHJcbiAgfSxcclxuICAvLyAyMC4yLjIuMzQgTWF0aC50cnVuYyh4KVxyXG4gIHRydW5jOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBpc09iamVjdCAgID0gJC5pc09iamVjdFxyXG4gICwgaXNGdW5jdGlvbiA9ICQuaXNGdW5jdGlvblxyXG4gICwgTlVNQkVSICAgICA9ICdOdW1iZXInXHJcbiAgLCBOdW1iZXIgICAgID0gJC5nW05VTUJFUl1cclxuICAsIEJhc2UgICAgICAgPSBOdW1iZXJcclxuICAsIHByb3RvICAgICAgPSBOdW1iZXIucHJvdG90eXBlO1xyXG5mdW5jdGlvbiB0b1ByaW1pdGl2ZShpdCl7XHJcbiAgdmFyIGZuLCB2YWw7XHJcbiAgaWYoaXNGdW5jdGlvbihmbiA9IGl0LnZhbHVlT2YpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICBpZihpc0Z1bmN0aW9uKGZuID0gaXQudG9TdHJpbmcpICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcclxuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBudW1iZXJcIik7XHJcbn1cclxuZnVuY3Rpb24gdG9OdW1iZXIoaXQpe1xyXG4gIGlmKGlzT2JqZWN0KGl0KSlpdCA9IHRvUHJpbWl0aXZlKGl0KTtcclxuICBpZih0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMiAmJiBpdC5jaGFyQ29kZUF0KDApID09IDQ4KXtcclxuICAgIHZhciBiaW5hcnkgPSBmYWxzZTtcclxuICAgIHN3aXRjaChpdC5jaGFyQ29kZUF0KDEpKXtcclxuICAgICAgY2FzZSA2NiA6IGNhc2UgOTggIDogYmluYXJ5ID0gdHJ1ZTtcclxuICAgICAgY2FzZSA3OSA6IGNhc2UgMTExIDogcmV0dXJuIHBhcnNlSW50KGl0LnNsaWNlKDIpLCBiaW5hcnkgPyAyIDogOCk7XHJcbiAgICB9XHJcbiAgfSByZXR1cm4gK2l0O1xyXG59XHJcbmlmKCQuRlcgJiYgIShOdW1iZXIoJzBvMScpICYmIE51bWJlcignMGIxJykpKXtcclxuICBOdW1iZXIgPSBmdW5jdGlvbiBOdW1iZXIoaXQpe1xyXG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBOdW1iZXIgPyBuZXcgQmFzZSh0b051bWJlcihpdCkpIDogdG9OdW1iZXIoaXQpO1xyXG4gIH07XHJcbiAgJC5lYWNoLmNhbGwoJC5ERVNDID8gJC5nZXROYW1lcyhCYXNlKSA6IChcclxuICAgICAgLy8gRVMzOlxyXG4gICAgICAnTUFYX1ZBTFVFLE1JTl9WQUxVRSxOYU4sTkVHQVRJVkVfSU5GSU5JVFksUE9TSVRJVkVfSU5GSU5JVFksJyArXHJcbiAgICAgIC8vIEVTNiAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTNiBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxyXG4gICAgICAnRVBTSUxPTixpc0Zpbml0ZSxpc0ludGVnZXIsaXNOYU4saXNTYWZlSW50ZWdlcixNQVhfU0FGRV9JTlRFR0VSLCcgK1xyXG4gICAgICAnTUlOX1NBRkVfSU5URUdFUixwYXJzZUZsb2F0LHBhcnNlSW50LGlzSW50ZWdlcidcclxuICAgICkuc3BsaXQoJywnKSwgZnVuY3Rpb24oa2V5KXtcclxuICAgICAgaWYoJC5oYXMoQmFzZSwga2V5KSAmJiAhJC5oYXMoTnVtYmVyLCBrZXkpKXtcclxuICAgICAgICAkLnNldERlc2MoTnVtYmVyLCBrZXksICQuZ2V0RGVzYyhCYXNlLCBrZXkpKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICk7XHJcbiAgTnVtYmVyLnByb3RvdHlwZSA9IHByb3RvO1xyXG4gIHByb3RvLmNvbnN0cnVjdG9yID0gTnVtYmVyO1xyXG4gICQuaGlkZSgkLmcsIE5VTUJFUiwgTnVtYmVyKTtcclxufSIsInZhciAkICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICA9IHJlcXVpcmUoJy4vJC5kZWYnKVxyXG4gICwgYWJzICAgPSBNYXRoLmFic1xyXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yXHJcbiAgLCBNQVhfU0FGRV9JTlRFR0VSID0gMHgxZmZmZmZmZmZmZmZmZjsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MTtcclxuZnVuY3Rpb24gaXNJbnRlZ2VyKGl0KXtcclxuICByZXR1cm4gISQuaXNPYmplY3QoaXQpICYmIGlzRmluaXRlKGl0KSAmJiBmbG9vcihpdCkgPT09IGl0O1xyXG59XHJcbiRkZWYoJGRlZi5TLCAnTnVtYmVyJywge1xyXG4gIC8vIDIwLjEuMi4xIE51bWJlci5FUFNJTE9OXHJcbiAgRVBTSUxPTjogTWF0aC5wb3coMiwgLTUyKSxcclxuICAvLyAyMC4xLjIuMiBOdW1iZXIuaXNGaW5pdGUobnVtYmVyKVxyXG4gIGlzRmluaXRlOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gdHlwZW9mIGl0ID09ICdudW1iZXInICYmIGlzRmluaXRlKGl0KTtcclxuICB9LFxyXG4gIC8vIDIwLjEuMi4zIE51bWJlci5pc0ludGVnZXIobnVtYmVyKVxyXG4gIGlzSW50ZWdlcjogaXNJbnRlZ2VyLFxyXG4gIC8vIDIwLjEuMi40IE51bWJlci5pc05hTihudW1iZXIpXHJcbiAgaXNOYU46IGZ1bmN0aW9uKG51bWJlcil7XHJcbiAgICByZXR1cm4gbnVtYmVyICE9IG51bWJlcjtcclxuICB9LFxyXG4gIC8vIDIwLjEuMi41IE51bWJlci5pc1NhZmVJbnRlZ2VyKG51bWJlcilcclxuICBpc1NhZmVJbnRlZ2VyOiBmdW5jdGlvbihudW1iZXIpe1xyXG4gICAgcmV0dXJuIGlzSW50ZWdlcihudW1iZXIpICYmIGFicyhudW1iZXIpIDw9IE1BWF9TQUZFX0lOVEVHRVI7XHJcbiAgfSxcclxuICAvLyAyMC4xLjIuNiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUlxyXG4gIE1BWF9TQUZFX0lOVEVHRVI6IE1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgLy8gMjAuMS4yLjEwIE51bWJlci5NSU5fU0FGRV9JTlRFR0VSXHJcbiAgTUlOX1NBRkVfSU5URUdFUjogLU1BWF9TQUZFX0lOVEVHRVIsXHJcbiAgLy8gMjAuMS4yLjEyIE51bWJlci5wYXJzZUZsb2F0KHN0cmluZylcclxuICBwYXJzZUZsb2F0OiBwYXJzZUZsb2F0LFxyXG4gIC8vIDIwLjEuMi4xMyBOdW1iZXIucGFyc2VJbnQoc3RyaW5nLCByYWRpeClcclxuICBwYXJzZUludDogcGFyc2VJbnRcclxufSk7IiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi8kLmFzc2lnbicpfSk7IiwiLy8gMTkuMS4zLjEwIE9iamVjdC5pcyh2YWx1ZTEsIHZhbHVlMilcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xyXG4gIGlzOiBmdW5jdGlvbih4LCB5KXtcclxuICAgIHJldHVybiB4ID09PSB5ID8geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHkgOiB4ICE9IHggJiYgeSAhPSB5O1xyXG4gIH1cclxufSk7IiwiLy8gMTkuMS4zLjE5IE9iamVjdC5zZXRQcm90b3R5cGVPZihPLCBwcm90bylcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJyl9KTsiLCJ2YXIgJCAgICAgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGlzT2JqZWN0ID0gJC5pc09iamVjdFxyXG4gICwgdG9PYmplY3QgPSAkLnRvT2JqZWN0O1xyXG5mdW5jdGlvbiB3cmFwT2JqZWN0TWV0aG9kKE1FVEhPRCwgTU9ERSl7XHJcbiAgdmFyIGZuICA9ICgkLmNvcmUuT2JqZWN0IHx8IHt9KVtNRVRIT0RdIHx8IE9iamVjdFtNRVRIT0RdXHJcbiAgICAsIGYgICA9IDBcclxuICAgICwgbyAgID0ge307XHJcbiAgb1tNRVRIT0RdID0gTU9ERSA9PSAxID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGl0O1xyXG4gIH0gOiBNT0RFID09IDIgPyBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gaXNPYmplY3QoaXQpID8gZm4oaXQpIDogdHJ1ZTtcclxuICB9IDogTU9ERSA9PSAzID8gZnVuY3Rpb24oaXQpe1xyXG4gICAgcmV0dXJuIGlzT2JqZWN0KGl0KSA/IGZuKGl0KSA6IGZhbHNlO1xyXG4gIH0gOiBNT0RFID09IDQgPyBmdW5jdGlvbihpdCwga2V5KXtcclxuICAgIHJldHVybiBmbih0b09iamVjdChpdCksIGtleSk7XHJcbiAgfSA6IE1PREUgPT0gNSA/IGZ1bmN0aW9uKGl0KXtcclxuICAgIHJldHVybiBmbihPYmplY3QoJC5hc3NlcnREZWZpbmVkKGl0KSkpO1xyXG4gIH0gOiBmdW5jdGlvbihpdCl7XHJcbiAgICByZXR1cm4gZm4odG9PYmplY3QoaXQpKTtcclxuICB9O1xyXG4gIHRyeSB7XHJcbiAgICBmbigneicpO1xyXG4gIH0gY2F0Y2goZSl7XHJcbiAgICBmID0gMTtcclxuICB9XHJcbiAgJGRlZigkZGVmLlMgKyAkZGVmLkYgKiBmLCAnT2JqZWN0Jywgbyk7XHJcbn1cclxud3JhcE9iamVjdE1ldGhvZCgnZnJlZXplJywgMSk7XHJcbndyYXBPYmplY3RNZXRob2QoJ3NlYWwnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgncHJldmVudEV4dGVuc2lvbnMnLCAxKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNGcm96ZW4nLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNTZWFsZWQnLCAyKTtcclxud3JhcE9iamVjdE1ldGhvZCgnaXNFeHRlbnNpYmxlJywgMyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIDQpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdnZXRQcm90b3R5cGVPZicsIDUpO1xyXG53cmFwT2JqZWN0TWV0aG9kKCdrZXlzJyk7XHJcbndyYXBPYmplY3RNZXRob2QoJ2dldE93blByb3BlcnR5TmFtZXMnKTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIDE5LjEuMy42IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcoKVxyXG52YXIgJCAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgdG1wID0ge307XHJcbnRtcFtyZXF1aXJlKCcuLyQud2tzJykoJ3RvU3RyaW5nVGFnJyldID0gJ3onO1xyXG5pZigkLkZXICYmIGNvZih0bXApICE9ICd6JykkLmhpZGUoT2JqZWN0LnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24oKXtcclxuICByZXR1cm4gJ1tvYmplY3QgJyArIGNvZi5jbGFzc29mKHRoaXMpICsgJ10nO1xyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGN0eCAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcclxuICAsIGNvZiAgICAgPSByZXF1aXJlKCcuLyQuY29mJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIGFzc2VydCAgPSByZXF1aXJlKCcuLyQuYXNzZXJ0JylcclxuICAsICRpdGVyICAgPSByZXF1aXJlKCcuLyQuaXRlcicpXHJcbiAgLCBTUEVDSUVTID0gcmVxdWlyZSgnLi8kLndrcycpKCdzcGVjaWVzJylcclxuICAsIFJFQ09SRCAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgncmVjb3JkJylcclxuICAsIGZvck9mICAgPSAkaXRlci5mb3JPZlxyXG4gICwgUFJPTUlTRSA9ICdQcm9taXNlJ1xyXG4gICwgZ2xvYmFsICA9ICQuZ1xyXG4gICwgcHJvY2VzcyA9IGdsb2JhbC5wcm9jZXNzXHJcbiAgLCBhc2FwICAgID0gcHJvY2VzcyAmJiBwcm9jZXNzLm5leHRUaWNrIHx8IHJlcXVpcmUoJy4vJC50YXNrJykuc2V0XHJcbiAgLCBQcm9taXNlID0gZ2xvYmFsW1BST01JU0VdXHJcbiAgLCBCYXNlICAgID0gUHJvbWlzZVxyXG4gICwgaXNGdW5jdGlvbiAgICAgPSAkLmlzRnVuY3Rpb25cclxuICAsIGlzT2JqZWN0ICAgICAgID0gJC5pc09iamVjdFxyXG4gICwgYXNzZXJ0RnVuY3Rpb24gPSBhc3NlcnQuZm5cclxuICAsIGFzc2VydE9iamVjdCAgID0gYXNzZXJ0Lm9ialxyXG4gICwgdGVzdDtcclxuZnVuY3Rpb24gZ2V0Q29uc3RydWN0b3IoQyl7XHJcbiAgdmFyIFMgPSBhc3NlcnRPYmplY3QoQylbU1BFQ0lFU107XHJcbiAgcmV0dXJuIFMgIT0gdW5kZWZpbmVkID8gUyA6IEM7XHJcbn1cclxuaXNGdW5jdGlvbihQcm9taXNlKSAmJiBpc0Z1bmN0aW9uKFByb21pc2UucmVzb2x2ZSlcclxuJiYgUHJvbWlzZS5yZXNvbHZlKHRlc3QgPSBuZXcgUHJvbWlzZShmdW5jdGlvbigpe30pKSA9PSB0ZXN0XHJcbnx8IGZ1bmN0aW9uKCl7XHJcbiAgZnVuY3Rpb24gaXNUaGVuYWJsZShpdCl7XHJcbiAgICB2YXIgdGhlbjtcclxuICAgIGlmKGlzT2JqZWN0KGl0KSl0aGVuID0gaXQudGhlbjtcclxuICAgIHJldHVybiBpc0Z1bmN0aW9uKHRoZW4pID8gdGhlbiA6IGZhbHNlO1xyXG4gIH1cclxuICBmdW5jdGlvbiBoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2Upe1xyXG4gICAgdmFyIHJlY29yZCA9IHByb21pc2VbUkVDT1JEXVxyXG4gICAgICAsIGNoYWluICA9IHJlY29yZC5jXHJcbiAgICAgICwgaSAgICAgID0gMFxyXG4gICAgICAsIHJlYWN0O1xyXG4gICAgaWYocmVjb3JkLmgpcmV0dXJuIHRydWU7XHJcbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXtcclxuICAgICAgcmVhY3QgPSBjaGFpbltpKytdO1xyXG4gICAgICBpZihyZWFjdC5mYWlsIHx8IGhhbmRsZWRSZWplY3Rpb25Pckhhc09uUmVqZWN0ZWQocmVhY3QuUCkpcmV0dXJuIHRydWU7XHJcbiAgICB9XHJcbiAgfVxyXG4gIGZ1bmN0aW9uIG5vdGlmeShyZWNvcmQsIGlzUmVqZWN0KXtcclxuICAgIHZhciBjaGFpbiA9IHJlY29yZC5jO1xyXG4gICAgaWYoaXNSZWplY3QgfHwgY2hhaW4ubGVuZ3RoKWFzYXAoZnVuY3Rpb24oKXtcclxuICAgICAgdmFyIHByb21pc2UgPSByZWNvcmQucFxyXG4gICAgICAgICwgdmFsdWUgICA9IHJlY29yZC52XHJcbiAgICAgICAgLCBvayAgICAgID0gcmVjb3JkLnMgPT0gMVxyXG4gICAgICAgICwgaSAgICAgICA9IDA7XHJcbiAgICAgIGlmKGlzUmVqZWN0ICYmICFoYW5kbGVkUmVqZWN0aW9uT3JIYXNPblJlamVjdGVkKHByb21pc2UpKXtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XHJcbiAgICAgICAgICBpZighaGFuZGxlZFJlamVjdGlvbk9ySGFzT25SZWplY3RlZChwcm9taXNlKSl7XHJcbiAgICAgICAgICAgIGlmKGNvZihwcm9jZXNzKSA9PSAncHJvY2Vzcycpe1xyXG4gICAgICAgICAgICAgIHByb2Nlc3MuZW1pdCgndW5oYW5kbGVkUmVqZWN0aW9uJywgdmFsdWUsIHByb21pc2UpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYoZ2xvYmFsLmNvbnNvbGUgJiYgaXNGdW5jdGlvbihjb25zb2xlLmVycm9yKSl7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignVW5oYW5kbGVkIHByb21pc2UgcmVqZWN0aW9uJywgdmFsdWUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMWUzKTtcclxuICAgICAgfSBlbHNlIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpIWZ1bmN0aW9uKHJlYWN0KXtcclxuICAgICAgICB2YXIgY2IgPSBvayA/IHJlYWN0Lm9rIDogcmVhY3QuZmFpbFxyXG4gICAgICAgICAgLCByZXQsIHRoZW47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGlmKGNiKXtcclxuICAgICAgICAgICAgaWYoIW9rKXJlY29yZC5oID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0ID0gY2IgPT09IHRydWUgPyB2YWx1ZSA6IGNiKHZhbHVlKTtcclxuICAgICAgICAgICAgaWYocmV0ID09PSByZWFjdC5QKXtcclxuICAgICAgICAgICAgICByZWFjdC5yZWooVHlwZUVycm9yKFBST01JU0UgKyAnLWNoYWluIGN5Y2xlJykpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYodGhlbiA9IGlzVGhlbmFibGUocmV0KSl7XHJcbiAgICAgICAgICAgICAgdGhlbi5jYWxsKHJldCwgcmVhY3QucmVzLCByZWFjdC5yZWopO1xyXG4gICAgICAgICAgICB9IGVsc2UgcmVhY3QucmVzKHJldCk7XHJcbiAgICAgICAgICB9IGVsc2UgcmVhY3QucmVqKHZhbHVlKTtcclxuICAgICAgICB9IGNhdGNoKGVycil7XHJcbiAgICAgICAgICByZWFjdC5yZWooZXJyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0oY2hhaW5baSsrXSk7XHJcbiAgICAgIGNoYWluLmxlbmd0aCA9IDA7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgZnVuY3Rpb24gcmVqZWN0KHZhbHVlKXtcclxuICAgIHZhciByZWNvcmQgPSB0aGlzO1xyXG4gICAgaWYocmVjb3JkLmQpcmV0dXJuO1xyXG4gICAgcmVjb3JkLmQgPSB0cnVlO1xyXG4gICAgcmVjb3JkID0gcmVjb3JkLnIgfHwgcmVjb3JkOyAvLyB1bndyYXBcclxuICAgIHJlY29yZC52ID0gdmFsdWU7XHJcbiAgICByZWNvcmQucyA9IDI7XHJcbiAgICBub3RpZnkocmVjb3JkLCB0cnVlKTtcclxuICB9XHJcbiAgZnVuY3Rpb24gcmVzb2x2ZSh2YWx1ZSl7XHJcbiAgICB2YXIgcmVjb3JkID0gdGhpc1xyXG4gICAgICAsIHRoZW4sIHdyYXBwZXI7XHJcbiAgICBpZihyZWNvcmQuZClyZXR1cm47XHJcbiAgICByZWNvcmQuZCA9IHRydWU7XHJcbiAgICByZWNvcmQgPSByZWNvcmQuciB8fCByZWNvcmQ7IC8vIHVud3JhcFxyXG4gICAgdHJ5IHtcclxuICAgICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcclxuICAgICAgICB3cmFwcGVyID0ge3I6IHJlY29yZCwgZDogZmFsc2V9OyAvLyB3cmFwXHJcbiAgICAgICAgdGhlbi5jYWxsKHZhbHVlLCBjdHgocmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eChyZWplY3QsIHdyYXBwZXIsIDEpKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZWNvcmQudiA9IHZhbHVlO1xyXG4gICAgICAgIHJlY29yZC5zID0gMTtcclxuICAgICAgICBub3RpZnkocmVjb3JkKTtcclxuICAgICAgfVxyXG4gICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICByZWplY3QuY2FsbCh3cmFwcGVyIHx8IHtyOiByZWNvcmQsIGQ6IGZhbHNlfSwgZXJyKTsgLy8gd3JhcFxyXG4gICAgfVxyXG4gIH1cclxuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxyXG4gIFByb21pc2UgPSBmdW5jdGlvbihleGVjdXRvcil7XHJcbiAgICBhc3NlcnRGdW5jdGlvbihleGVjdXRvcik7XHJcbiAgICB2YXIgcmVjb3JkID0ge1xyXG4gICAgICBwOiBhc3NlcnQuaW5zdCh0aGlzLCBQcm9taXNlLCBQUk9NSVNFKSwgLy8gPC0gcHJvbWlzZVxyXG4gICAgICBjOiBbXSwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gY2hhaW5cclxuICAgICAgczogMCwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXHJcbiAgICAgIGQ6IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSBkb25lXHJcbiAgICAgIHY6IHVuZGVmaW5lZCwgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA8LSB2YWx1ZVxyXG4gICAgICBoOiBmYWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gPC0gaGFuZGxlZCByZWplY3Rpb25cclxuICAgIH07XHJcbiAgICAkLmhpZGUodGhpcywgUkVDT1JELCByZWNvcmQpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgZXhlY3V0b3IoY3R4KHJlc29sdmUsIHJlY29yZCwgMSksIGN0eChyZWplY3QsIHJlY29yZCwgMSkpO1xyXG4gICAgfSBjYXRjaChlcnIpe1xyXG4gICAgICByZWplY3QuY2FsbChyZWNvcmQsIGVycik7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkLm1peChQcm9taXNlLnByb3RvdHlwZSwge1xyXG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcclxuICAgIHRoZW46IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcclxuICAgICAgdmFyIFMgPSBhc3NlcnRPYmplY3QoYXNzZXJ0T2JqZWN0KHRoaXMpLmNvbnN0cnVjdG9yKVtTUEVDSUVTXTtcclxuICAgICAgdmFyIHJlYWN0ID0ge1xyXG4gICAgICAgIG9rOiAgIGlzRnVuY3Rpb24ob25GdWxmaWxsZWQpID8gb25GdWxmaWxsZWQgOiB0cnVlLFxyXG4gICAgICAgIGZhaWw6IGlzRnVuY3Rpb24ob25SZWplY3RlZCkgID8gb25SZWplY3RlZCAgOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgICB2YXIgUCA9IHJlYWN0LlAgPSBuZXcgKFMgIT0gdW5kZWZpbmVkID8gUyA6IFByb21pc2UpKGZ1bmN0aW9uKHJlcywgcmVqKXtcclxuICAgICAgICByZWFjdC5yZXMgPSBhc3NlcnRGdW5jdGlvbihyZXMpO1xyXG4gICAgICAgIHJlYWN0LnJlaiA9IGFzc2VydEZ1bmN0aW9uKHJlaik7XHJcbiAgICAgIH0pO1xyXG4gICAgICB2YXIgcmVjb3JkID0gdGhpc1tSRUNPUkRdO1xyXG4gICAgICByZWNvcmQuYy5wdXNoKHJlYWN0KTtcclxuICAgICAgcmVjb3JkLnMgJiYgbm90aWZ5KHJlY29yZCk7XHJcbiAgICAgIHJldHVybiBQO1xyXG4gICAgfSxcclxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXHJcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcclxuICAgICAgcmV0dXJuIHRoaXMudGhlbih1bmRlZmluZWQsIG9uUmVqZWN0ZWQpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KCk7XHJcbiRkZWYoJGRlZi5HICsgJGRlZi5XICsgJGRlZi5GICogKFByb21pc2UgIT0gQmFzZSksIHtQcm9taXNlOiBQcm9taXNlfSk7XHJcbiRkZWYoJGRlZi5TLCBQUk9NSVNFLCB7XHJcbiAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcclxuICByZWplY3Q6IGZ1bmN0aW9uKHIpe1xyXG4gICAgcmV0dXJuIG5ldyAoZ2V0Q29uc3RydWN0b3IodGhpcykpKGZ1bmN0aW9uKHJlcywgcmVqKXtcclxuICAgICAgcmVqKHIpO1xyXG4gICAgfSk7XHJcbiAgfSxcclxuICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcclxuICByZXNvbHZlOiBmdW5jdGlvbih4KXtcclxuICAgIHJldHVybiBpc09iamVjdCh4KSAmJiBSRUNPUkQgaW4geCAmJiAkLmdldFByb3RvKHgpID09PSB0aGlzLnByb3RvdHlwZVxyXG4gICAgICA/IHggOiBuZXcgKGdldENvbnN0cnVjdG9yKHRoaXMpKShmdW5jdGlvbihyZXMpe1xyXG4gICAgICAgIHJlcyh4KTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG59KTtcclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoJGl0ZXIuZmFpbChmdW5jdGlvbihpdGVyKXtcclxuICBQcm9taXNlLmFsbChpdGVyKVsnY2F0Y2gnXShmdW5jdGlvbigpe30pO1xyXG59KSB8fCAkaXRlci5EQU5HRVJfQ0xPU0lORyksIFBST01JU0UsIHtcclxuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcclxuICBhbGw6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgIHZhciBDICAgICAgPSBnZXRDb25zdHJ1Y3Rvcih0aGlzKVxyXG4gICAgICAsIHZhbHVlcyA9IFtdO1xyXG4gICAgcmV0dXJuIG5ldyBDKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XHJcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgdmFsdWVzLnB1c2gsIHZhbHVlcyk7XHJcbiAgICAgIHZhciByZW1haW5pbmcgPSB2YWx1ZXMubGVuZ3RoXHJcbiAgICAgICAgLCByZXN1bHRzICAgPSBBcnJheShyZW1haW5pbmcpO1xyXG4gICAgICBpZihyZW1haW5pbmcpJC5lYWNoLmNhbGwodmFsdWVzLCBmdW5jdGlvbihwcm9taXNlLCBpbmRleCl7XHJcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgICAgICAgcmVzdWx0c1tpbmRleF0gPSB2YWx1ZTtcclxuICAgICAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUocmVzdWx0cyk7XHJcbiAgICAgICAgfSwgcmVqZWN0KTtcclxuICAgICAgfSk7XHJcbiAgICAgIGVsc2UgcmVzb2x2ZShyZXN1bHRzKTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxyXG4gIHJhY2U6IGZ1bmN0aW9uKGl0ZXJhYmxlKXtcclxuICAgIHZhciBDID0gZ2V0Q29uc3RydWN0b3IodGhpcyk7XHJcbiAgICByZXR1cm4gbmV3IEMoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcclxuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcclxuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihyZXNvbHZlLCByZWplY3QpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcbmNvZi5zZXQoUHJvbWlzZSwgUFJPTUlTRSk7XHJcbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoUHJvbWlzZSk7IiwidmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIHNldFByb3RvICA9IHJlcXVpcmUoJy4vJC5zZXQtcHJvdG8nKVxyXG4gICwgJGl0ZXIgICAgID0gcmVxdWlyZSgnLi8kLml0ZXInKVxyXG4gICwgSVRFUiAgICAgID0gcmVxdWlyZSgnLi8kLnVpZCcpLnNhZmUoJ2l0ZXInKVxyXG4gICwgc3RlcCAgICAgID0gJGl0ZXIuc3RlcFxyXG4gICwgYXNzZXJ0ICAgID0gcmVxdWlyZSgnLi8kLmFzc2VydCcpXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBnZXREZXNjICAgPSAkLmdldERlc2NcclxuICAsIHNldERlc2MgICA9ICQuc2V0RGVzY1xyXG4gICwgZ2V0UHJvdG8gID0gJC5nZXRQcm90b1xyXG4gICwgYXBwbHkgICAgID0gRnVuY3Rpb24uYXBwbHlcclxuICAsIGFzc2VydE9iamVjdCA9IGFzc2VydC5vYmpcclxuICAsIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgJC5pdDtcclxuZnVuY3Rpb24gRW51bWVyYXRlKGl0ZXJhdGVkKXtcclxuICB2YXIga2V5cyA9IFtdLCBrZXk7XHJcbiAgZm9yKGtleSBpbiBpdGVyYXRlZClrZXlzLnB1c2goa2V5KTtcclxuICAkLnNldCh0aGlzLCBJVEVSLCB7bzogaXRlcmF0ZWQsIGE6IGtleXMsIGk6IDB9KTtcclxufVxyXG4kaXRlci5jcmVhdGUoRW51bWVyYXRlLCAnT2JqZWN0JywgZnVuY3Rpb24oKXtcclxuICB2YXIgaXRlciA9IHRoaXNbSVRFUl1cclxuICAgICwga2V5cyA9IGl0ZXIuYVxyXG4gICAgLCBrZXk7XHJcbiAgZG8ge1xyXG4gICAgaWYoaXRlci5pID49IGtleXMubGVuZ3RoKXJldHVybiBzdGVwKDEpO1xyXG4gIH0gd2hpbGUoISgoa2V5ID0ga2V5c1tpdGVyLmkrK10pIGluIGl0ZXIubykpO1xyXG4gIHJldHVybiBzdGVwKDAsIGtleSk7XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gd3JhcChmbil7XHJcbiAgcmV0dXJuIGZ1bmN0aW9uKGl0KXtcclxuICAgIGFzc2VydE9iamVjdChpdCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBmbi5hcHBseSh1bmRlZmluZWQsIGFyZ3VtZW50cyk7XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSBjYXRjaChlKXtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJlZmxlY3RHZXQodGFyZ2V0LCBwcm9wZXJ0eUtleS8qLCByZWNlaXZlciovKXtcclxuICB2YXIgcmVjZWl2ZXIgPSBhcmd1bWVudHMubGVuZ3RoIDwgMyA/IHRhcmdldCA6IGFyZ3VtZW50c1syXVxyXG4gICAgLCBkZXNjID0gZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpLCBwcm90bztcclxuICBpZihkZXNjKXJldHVybiAkLmhhcyhkZXNjLCAndmFsdWUnKVxyXG4gICAgPyBkZXNjLnZhbHVlXHJcbiAgICA6IGRlc2MuZ2V0ID09PSB1bmRlZmluZWRcclxuICAgICAgPyB1bmRlZmluZWRcclxuICAgICAgOiBkZXNjLmdldC5jYWxsKHJlY2VpdmVyKTtcclxuICByZXR1cm4gaXNPYmplY3QocHJvdG8gPSBnZXRQcm90byh0YXJnZXQpKVxyXG4gICAgPyByZWZsZWN0R2V0KHByb3RvLCBwcm9wZXJ0eUtleSwgcmVjZWl2ZXIpXHJcbiAgICA6IHVuZGVmaW5lZDtcclxufVxyXG5mdW5jdGlvbiByZWZsZWN0U2V0KHRhcmdldCwgcHJvcGVydHlLZXksIFYvKiwgcmVjZWl2ZXIqLyl7XHJcbiAgdmFyIHJlY2VpdmVyID0gYXJndW1lbnRzLmxlbmd0aCA8IDQgPyB0YXJnZXQgOiBhcmd1bWVudHNbM11cclxuICAgICwgb3duRGVzYyAgPSBnZXREZXNjKGFzc2VydE9iamVjdCh0YXJnZXQpLCBwcm9wZXJ0eUtleSlcclxuICAgICwgZXhpc3RpbmdEZXNjcmlwdG9yLCBwcm90bztcclxuICBpZighb3duRGVzYyl7XHJcbiAgICBpZihpc09iamVjdChwcm90byA9IGdldFByb3RvKHRhcmdldCkpKXtcclxuICAgICAgcmV0dXJuIHJlZmxlY3RTZXQocHJvdG8sIHByb3BlcnR5S2V5LCBWLCByZWNlaXZlcik7XHJcbiAgICB9XHJcbiAgICBvd25EZXNjID0gJC5kZXNjKDApO1xyXG4gIH1cclxuICBpZigkLmhhcyhvd25EZXNjLCAndmFsdWUnKSl7XHJcbiAgICBpZihvd25EZXNjLndyaXRhYmxlID09PSBmYWxzZSB8fCAhaXNPYmplY3QocmVjZWl2ZXIpKXJldHVybiBmYWxzZTtcclxuICAgIGV4aXN0aW5nRGVzY3JpcHRvciA9IGdldERlc2MocmVjZWl2ZXIsIHByb3BlcnR5S2V5KSB8fCAkLmRlc2MoMCk7XHJcbiAgICBleGlzdGluZ0Rlc2NyaXB0b3IudmFsdWUgPSBWO1xyXG4gICAgc2V0RGVzYyhyZWNlaXZlciwgcHJvcGVydHlLZXksIGV4aXN0aW5nRGVzY3JpcHRvcik7XHJcbiAgICByZXR1cm4gdHJ1ZTtcclxuICB9XHJcbiAgcmV0dXJuIG93bkRlc2Muc2V0ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IChvd25EZXNjLnNldC5jYWxsKHJlY2VpdmVyLCBWKSwgdHJ1ZSk7XHJcbn1cclxuXHJcbnZhciByZWZsZWN0ID0ge1xyXG4gIC8vIDI2LjEuMSBSZWZsZWN0LmFwcGx5KHRhcmdldCwgdGhpc0FyZ3VtZW50LCBhcmd1bWVudHNMaXN0KVxyXG4gIGFwcGx5OiByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgYXBwbHksIDMpLFxyXG4gIC8vIDI2LjEuMiBSZWZsZWN0LmNvbnN0cnVjdCh0YXJnZXQsIGFyZ3VtZW50c0xpc3QgWywgbmV3VGFyZ2V0XSlcclxuICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uKHRhcmdldCwgYXJndW1lbnRzTGlzdCAvKiwgbmV3VGFyZ2V0Ki8pe1xyXG4gICAgdmFyIHByb3RvICAgID0gYXNzZXJ0LmZuKGFyZ3VtZW50cy5sZW5ndGggPCAzID8gdGFyZ2V0IDogYXJndW1lbnRzWzJdKS5wcm90b3R5cGVcclxuICAgICAgLCBpbnN0YW5jZSA9ICQuY3JlYXRlKGlzT2JqZWN0KHByb3RvKSA/IHByb3RvIDogT2JqZWN0LnByb3RvdHlwZSlcclxuICAgICAgLCByZXN1bHQgICA9IGFwcGx5LmNhbGwodGFyZ2V0LCBpbnN0YW5jZSwgYXJndW1lbnRzTGlzdCk7XHJcbiAgICByZXR1cm4gaXNPYmplY3QocmVzdWx0KSA/IHJlc3VsdCA6IGluc3RhbmNlO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS4zIFJlZmxlY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBwcm9wZXJ0eUtleSwgYXR0cmlidXRlcylcclxuICBkZWZpbmVQcm9wZXJ0eTogd3JhcChzZXREZXNjKSxcclxuICAvLyAyNi4xLjQgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0YXJnZXQsIHByb3BlcnR5S2V5KVxyXG4gIGRlbGV0ZVByb3BlcnR5OiBmdW5jdGlvbih0YXJnZXQsIHByb3BlcnR5S2V5KXtcclxuICAgIHZhciBkZXNjID0gZ2V0RGVzYyhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvcGVydHlLZXkpO1xyXG4gICAgcmV0dXJuIGRlc2MgJiYgIWRlc2MuY29uZmlndXJhYmxlID8gZmFsc2UgOiBkZWxldGUgdGFyZ2V0W3Byb3BlcnR5S2V5XTtcclxuICB9LFxyXG4gIC8vIDI2LjEuNSBSZWZsZWN0LmVudW1lcmF0ZSh0YXJnZXQpXHJcbiAgZW51bWVyYXRlOiBmdW5jdGlvbih0YXJnZXQpe1xyXG4gICAgcmV0dXJuIG5ldyBFbnVtZXJhdGUoYXNzZXJ0T2JqZWN0KHRhcmdldCkpO1xyXG4gIH0sXHJcbiAgLy8gMjYuMS42IFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcGVydHlLZXkgWywgcmVjZWl2ZXJdKVxyXG4gIGdldDogcmVmbGVjdEdldCxcclxuICAvLyAyNi4xLjcgUmVmbGVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuIGdldERlc2MoYXNzZXJ0T2JqZWN0KHRhcmdldCksIHByb3BlcnR5S2V5KTtcclxuICB9LFxyXG4gIC8vIDI2LjEuOCBSZWZsZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldClcclxuICBnZXRQcm90b3R5cGVPZjogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgIHJldHVybiBnZXRQcm90byhhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfSxcclxuICAvLyAyNi4xLjkgUmVmbGVjdC5oYXModGFyZ2V0LCBwcm9wZXJ0eUtleSlcclxuICBoYXM6IGZ1bmN0aW9uKHRhcmdldCwgcHJvcGVydHlLZXkpe1xyXG4gICAgcmV0dXJuIHByb3BlcnR5S2V5IGluIHRhcmdldDtcclxuICB9LFxyXG4gIC8vIDI2LjEuMTAgUmVmbGVjdC5pc0V4dGVuc2libGUodGFyZ2V0KVxyXG4gIGlzRXh0ZW5zaWJsZTogZnVuY3Rpb24odGFyZ2V0KXtcclxuICAgIHJldHVybiAhIWlzRXh0ZW5zaWJsZShhc3NlcnRPYmplY3QodGFyZ2V0KSk7XHJcbiAgfSxcclxuICAvLyAyNi4xLjExIFJlZmxlY3Qub3duS2V5cyh0YXJnZXQpXHJcbiAgb3duS2V5czogcmVxdWlyZSgnLi8kLm93bi1rZXlzJyksXHJcbiAgLy8gMjYuMS4xMiBSZWZsZWN0LnByZXZlbnRFeHRlbnNpb25zKHRhcmdldClcclxuICBwcmV2ZW50RXh0ZW5zaW9uczogd3JhcChPYmplY3QucHJldmVudEV4dGVuc2lvbnMgfHwgJC5pdCksXHJcbiAgLy8gMjYuMS4xMyBSZWZsZWN0LnNldCh0YXJnZXQsIHByb3BlcnR5S2V5LCBWIFssIHJlY2VpdmVyXSlcclxuICBzZXQ6IHJlZmxlY3RTZXRcclxufTtcclxuLy8gMjYuMS4xNCBSZWZsZWN0LnNldFByb3RvdHlwZU9mKHRhcmdldCwgcHJvdG8pXHJcbmlmKHNldFByb3RvKXJlZmxlY3Quc2V0UHJvdG90eXBlT2YgPSBmdW5jdGlvbih0YXJnZXQsIHByb3RvKXtcclxuICBzZXRQcm90byhhc3NlcnRPYmplY3QodGFyZ2V0KSwgcHJvdG8pO1xyXG4gIHJldHVybiB0cnVlO1xyXG59O1xyXG5cclxuJGRlZigkZGVmLkcsIHtSZWZsZWN0OiB7fX0pO1xyXG4kZGVmKCRkZWYuUywgJ1JlZmxlY3QnLCByZWZsZWN0KTsiLCJ2YXIgJCAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIGNvZiAgICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgUmVnRXhwID0gJC5nLlJlZ0V4cFxyXG4gICwgQmFzZSAgID0gUmVnRXhwXHJcbiAgLCBwcm90byAgPSBSZWdFeHAucHJvdG90eXBlO1xyXG5pZigkLkZXICYmICQuREVTQyl7XHJcbiAgLy8gUmVnRXhwIGFsbG93cyBhIHJlZ2V4IHdpdGggZmxhZ3MgYXMgdGhlIHBhdHRlcm5cclxuICBpZighZnVuY3Rpb24oKXt0cnl7IHJldHVybiBSZWdFeHAoL2EvZywgJ2knKSA9PSAnL2EvaSc7IH1jYXRjaChlKXsgLyogZW1wdHkgKi8gfX0oKSl7XHJcbiAgICBSZWdFeHAgPSBmdW5jdGlvbiBSZWdFeHAocGF0dGVybiwgZmxhZ3Mpe1xyXG4gICAgICByZXR1cm4gbmV3IEJhc2UoY29mKHBhdHRlcm4pID09ICdSZWdFeHAnICYmIGZsYWdzICE9PSB1bmRlZmluZWRcclxuICAgICAgICA/IHBhdHRlcm4uc291cmNlIDogcGF0dGVybiwgZmxhZ3MpO1xyXG4gICAgfTtcclxuICAgICQuZWFjaC5jYWxsKCQuZ2V0TmFtZXMoQmFzZSksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICAgIGtleSBpbiBSZWdFeHAgfHwgJC5zZXREZXNjKFJlZ0V4cCwga2V5LCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIEJhc2Vba2V5XTsgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uKGl0KXsgQmFzZVtrZXldID0gaXQ7IH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICAgIHByb3RvLmNvbnN0cnVjdG9yID0gUmVnRXhwO1xyXG4gICAgUmVnRXhwLnByb3RvdHlwZSA9IHByb3RvO1xyXG4gICAgJC5oaWRlKCQuZywgJ1JlZ0V4cCcsIFJlZ0V4cCk7XHJcbiAgfVxyXG4gIC8vIDIxLjIuNS4zIGdldCBSZWdFeHAucHJvdG90eXBlLmZsYWdzKClcclxuICBpZigvLi9nLmZsYWdzICE9ICdnJykkLnNldERlc2MocHJvdG8sICdmbGFncycsIHtcclxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcclxuICAgIGdldDogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoL14uKlxcLyhcXHcqKSQvLCAnJDEnKVxyXG4gIH0pO1xyXG59XHJcbnJlcXVpcmUoJy4vJC5zcGVjaWVzJykoUmVnRXhwKTsiLCIndXNlIHN0cmljdCc7XHJcbnZhciBzdHJvbmcgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi1zdHJvbmcnKTtcclxuXHJcbi8vIDIzLjIgU2V0IE9iamVjdHNcclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnU2V0Jywge1xyXG4gIC8vIDIzLjIuMy4xIFNldC5wcm90b3R5cGUuYWRkKHZhbHVlKVxyXG4gIGFkZDogZnVuY3Rpb24odmFsdWUpe1xyXG4gICAgcmV0dXJuIHN0cm9uZy5kZWYodGhpcywgdmFsdWUgPSB2YWx1ZSA9PT0gMCA/IDAgOiB2YWx1ZSwgdmFsdWUpO1xyXG4gIH1cclxufSwgc3Ryb25nKTsiLCJ2YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjMgU3RyaW5nLnByb3RvdHlwZS5jb2RlUG9pbnRBdChwb3MpXHJcbiAgY29kZVBvaW50QXQ6IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKShmYWxzZSlcclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0xlbmd0aCA9ICQudG9MZW5ndGg7XHJcblxyXG4kZGVmKCRkZWYuUCwgJ1N0cmluZycsIHtcclxuICAvLyAyMS4xLjMuNiBTdHJpbmcucHJvdG90eXBlLmVuZHNXaXRoKHNlYXJjaFN0cmluZyBbLCBlbmRQb3NpdGlvbl0pXHJcbiAgZW5kc1dpdGg6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgZW5kUG9zaXRpb24gPSBAbGVuZ3RoICovKXtcclxuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xyXG4gICAgdmFyIHRoYXQgPSBTdHJpbmcoJC5hc3NlcnREZWZpbmVkKHRoaXMpKVxyXG4gICAgICAsIGVuZFBvc2l0aW9uID0gYXJndW1lbnRzWzFdXHJcbiAgICAgICwgbGVuID0gdG9MZW5ndGgodGhhdC5sZW5ndGgpXHJcbiAgICAgICwgZW5kID0gZW5kUG9zaXRpb24gPT09IHVuZGVmaW5lZCA/IGxlbiA6IE1hdGgubWluKHRvTGVuZ3RoKGVuZFBvc2l0aW9uKSwgbGVuKTtcclxuICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgIHJldHVybiB0aGF0LnNsaWNlKGVuZCAtIHNlYXJjaFN0cmluZy5sZW5ndGgsIGVuZCkgPT09IHNlYXJjaFN0cmluZztcclxuICB9XHJcbn0pOyIsInZhciAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCB0b0luZGV4ID0gcmVxdWlyZSgnLi8kJykudG9JbmRleFxyXG4gICwgZnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi4yIFN0cmluZy5mcm9tQ29kZVBvaW50KC4uLmNvZGVQb2ludHMpXHJcbiAgZnJvbUNvZGVQb2ludDogZnVuY3Rpb24oeCl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcclxuICAgIHZhciByZXMgPSBbXVxyXG4gICAgICAsIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCBpICAgPSAwXHJcbiAgICAgICwgY29kZTtcclxuICAgIHdoaWxlKGxlbiA+IGkpe1xyXG4gICAgICBjb2RlID0gK2FyZ3VtZW50c1tpKytdO1xyXG4gICAgICBpZih0b0luZGV4KGNvZGUsIDB4MTBmZmZmKSAhPT0gY29kZSl0aHJvdyBSYW5nZUVycm9yKGNvZGUgKyAnIGlzIG5vdCBhIHZhbGlkIGNvZGUgcG9pbnQnKTtcclxuICAgICAgcmVzLnB1c2goY29kZSA8IDB4MTAwMDBcclxuICAgICAgICA/IGZyb21DaGFyQ29kZShjb2RlKVxyXG4gICAgICAgIDogZnJvbUNoYXJDb2RlKCgoY29kZSAtPSAweDEwMDAwKSA+PiAxMCkgKyAweGQ4MDAsIGNvZGUgJSAweDQwMCArIDB4ZGMwMClcclxuICAgICAgKTtcclxuICAgIH0gcmV0dXJuIHJlcy5qb2luKCcnKTtcclxuICB9XHJcbn0pOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgY29mICA9IHJlcXVpcmUoJy4vJC5jb2YnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuXHJcbiRkZWYoJGRlZi5QLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMy43IFN0cmluZy5wcm90b3R5cGUuaW5jbHVkZXMoc2VhcmNoU3RyaW5nLCBwb3NpdGlvbiA9IDApXHJcbiAgaW5jbHVkZXM6IGZ1bmN0aW9uKHNlYXJjaFN0cmluZyAvKiwgcG9zaXRpb24gPSAwICovKXtcclxuICAgIGlmKGNvZihzZWFyY2hTdHJpbmcpID09ICdSZWdFeHAnKXRocm93IFR5cGVFcnJvcigpO1xyXG4gICAgcmV0dXJuICEhflN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpLmluZGV4T2Yoc2VhcmNoU3RyaW5nLCBhcmd1bWVudHNbMV0pO1xyXG4gIH1cclxufSk7IiwidmFyIHNldCAgID0gcmVxdWlyZSgnLi8kJykuc2V0XHJcbiAgLCBhdCAgICA9IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKVxyXG4gICwgSVRFUiAgPSByZXF1aXJlKCcuLyQudWlkJykuc2FmZSgnaXRlcicpXHJcbiAgLCAkaXRlciA9IHJlcXVpcmUoJy4vJC5pdGVyJylcclxuICAsIHN0ZXAgID0gJGl0ZXIuc3RlcDtcclxuXHJcbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcclxuJGl0ZXIuc3RkKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcclxuICBzZXQodGhpcywgSVRFUiwge286IFN0cmluZyhpdGVyYXRlZCksIGk6IDB9KTtcclxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxyXG59LCBmdW5jdGlvbigpe1xyXG4gIHZhciBpdGVyICA9IHRoaXNbSVRFUl1cclxuICAgICwgTyAgICAgPSBpdGVyLm9cclxuICAgICwgaW5kZXggPSBpdGVyLmlcclxuICAgICwgcG9pbnQ7XHJcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHN0ZXAoMSk7XHJcbiAgcG9pbnQgPSBhdC5jYWxsKE8sIGluZGV4KTtcclxuICBpdGVyLmkgKz0gcG9pbnQubGVuZ3RoO1xyXG4gIHJldHVybiBzdGVwKDAsIHBvaW50KTtcclxufSk7IiwidmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnU3RyaW5nJywge1xyXG4gIC8vIDIxLjEuMi40IFN0cmluZy5yYXcoY2FsbFNpdGUsIC4uLnN1YnN0aXR1dGlvbnMpXHJcbiAgcmF3OiBmdW5jdGlvbihjYWxsU2l0ZSl7XHJcbiAgICB2YXIgcmF3ID0gJC50b09iamVjdChjYWxsU2l0ZS5yYXcpXHJcbiAgICAgICwgbGVuID0gJC50b0xlbmd0aChyYXcubGVuZ3RoKVxyXG4gICAgICAsIHNsbiA9IGFyZ3VtZW50cy5sZW5ndGhcclxuICAgICAgLCByZXMgPSBbXVxyXG4gICAgICAsIGkgICA9IDA7XHJcbiAgICB3aGlsZShsZW4gPiBpKXtcclxuICAgICAgcmVzLnB1c2goU3RyaW5nKHJhd1tpKytdKSk7XHJcbiAgICAgIGlmKGkgPCBzbG4pcmVzLnB1c2goU3RyaW5nKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgfSByZXR1cm4gcmVzLmpvaW4oJycpO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjEzIFN0cmluZy5wcm90b3R5cGUucmVwZWF0KGNvdW50KVxyXG4gIHJlcGVhdDogZnVuY3Rpb24oY291bnQpe1xyXG4gICAgdmFyIHN0ciA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgcmVzID0gJydcclxuICAgICAgLCBuICAgPSAkLnRvSW50ZWdlcihjb3VudCk7XHJcbiAgICBpZihuIDwgMCB8fCBuID09IEluZmluaXR5KXRocm93IFJhbmdlRXJyb3IoXCJDb3VudCBjYW4ndCBiZSBuZWdhdGl2ZVwiKTtcclxuICAgIGZvcig7biA+IDA7IChuID4+Pj0gMSkgJiYgKHN0ciArPSBzdHIpKWlmKG4gJiAxKXJlcyArPSBzdHI7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH1cclxufSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJCAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBjb2YgID0gcmVxdWlyZSgnLi8kLmNvZicpXHJcbiAgLCAkZGVmID0gcmVxdWlyZSgnLi8kLmRlZicpO1xyXG5cclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgLy8gMjEuMS4zLjE4IFN0cmluZy5wcm90b3R5cGUuc3RhcnRzV2l0aChzZWFyY2hTdHJpbmcgWywgcG9zaXRpb24gXSlcclxuICBzdGFydHNXaXRoOiBmdW5jdGlvbihzZWFyY2hTdHJpbmcgLyosIHBvc2l0aW9uID0gMCAqLyl7XHJcbiAgICBpZihjb2Yoc2VhcmNoU3RyaW5nKSA9PSAnUmVnRXhwJyl0aHJvdyBUeXBlRXJyb3IoKTtcclxuICAgIHZhciB0aGF0ICA9IFN0cmluZygkLmFzc2VydERlZmluZWQodGhpcykpXHJcbiAgICAgICwgaW5kZXggPSAkLnRvTGVuZ3RoKE1hdGgubWluKGFyZ3VtZW50c1sxXSwgdGhhdC5sZW5ndGgpKTtcclxuICAgIHNlYXJjaFN0cmluZyArPSAnJztcclxuICAgIHJldHVybiB0aGF0LnNsaWNlKGluZGV4LCBpbmRleCArIHNlYXJjaFN0cmluZy5sZW5ndGgpID09PSBzZWFyY2hTdHJpbmc7XHJcbiAgfVxyXG59KTsiLCIndXNlIHN0cmljdCc7XHJcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cclxudmFyICQgICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsIHNldFRhZyAgID0gcmVxdWlyZSgnLi8kLmNvZicpLnNldFxyXG4gICwgdWlkICAgICAgPSByZXF1aXJlKCcuLyQudWlkJylcclxuICAsICRkZWYgICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBrZXlPZiAgICA9IHJlcXVpcmUoJy4vJC5rZXlvZicpXHJcbiAgLCBoYXMgICAgICA9ICQuaGFzXHJcbiAgLCBoaWRlICAgICA9ICQuaGlkZVxyXG4gICwgZ2V0TmFtZXMgPSAkLmdldE5hbWVzXHJcbiAgLCB0b09iamVjdCA9ICQudG9PYmplY3RcclxuICAsIFN5bWJvbCAgID0gJC5nLlN5bWJvbFxyXG4gICwgQmFzZSAgICAgPSBTeW1ib2xcclxuICAsIHNldHRlciAgID0gZmFsc2VcclxuICAsIFRBRyAgICAgID0gdWlkLnNhZmUoJ3RhZycpXHJcbiAgLCBTeW1ib2xSZWdpc3RyeSA9IHt9XHJcbiAgLCBBbGxTeW1ib2xzICAgICA9IHt9O1xyXG5cclxuZnVuY3Rpb24gd3JhcCh0YWcpe1xyXG4gIHZhciBzeW0gPSBBbGxTeW1ib2xzW3RhZ10gPSAkLnNldCgkLmNyZWF0ZShTeW1ib2wucHJvdG90eXBlKSwgVEFHLCB0YWcpO1xyXG4gICQuREVTQyAmJiBzZXR0ZXIgJiYgJC5zZXREZXNjKE9iamVjdC5wcm90b3R5cGUsIHRhZywge1xyXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICAgIGhpZGUodGhpcywgdGFnLCB2YWx1ZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHN5bTtcclxufVxyXG5cclxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXHJcbmlmKCEkLmlzRnVuY3Rpb24oU3ltYm9sKSl7XHJcbiAgU3ltYm9sID0gZnVuY3Rpb24oZGVzY3JpcHRpb24pe1xyXG4gICAgaWYodGhpcyBpbnN0YW5jZW9mIFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvcicpO1xyXG4gICAgcmV0dXJuIHdyYXAodWlkKGRlc2NyaXB0aW9uKSk7XHJcbiAgfTtcclxuICBoaWRlKFN5bWJvbC5wcm90b3R5cGUsICd0b1N0cmluZycsIGZ1bmN0aW9uKCl7XHJcbiAgICByZXR1cm4gdGhpc1tUQUddO1xyXG4gIH0pO1xyXG59XHJcbiRkZWYoJGRlZi5HICsgJGRlZi5XLCB7U3ltYm9sOiBTeW1ib2x9KTtcclxuXHJcbnZhciBzeW1ib2xTdGF0aWNzID0ge1xyXG4gIC8vIDE5LjQuMi4xIFN5bWJvbC5mb3Ioa2V5KVxyXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xyXG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxyXG4gICAgICA/IFN5bWJvbFJlZ2lzdHJ5W2tleV1cclxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gU3ltYm9sKGtleSk7XHJcbiAgfSxcclxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcclxuICBrZXlGb3I6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICByZXR1cm4ga2V5T2YoU3ltYm9sUmVnaXN0cnksIGtleSk7XHJcbiAgfSxcclxuICBwdXJlOiB1aWQuc2FmZSxcclxuICBzZXQ6ICQuc2V0LFxyXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcclxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XHJcbn07XHJcbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxyXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXHJcbi8vIDE5LjQuMi40IFN5bWJvbC5pdGVyYXRvclxyXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcclxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2VcclxuLy8gMTkuNC4yLjkgU3ltYm9sLnNlYXJjaFxyXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcclxuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxyXG4vLyAxOS40LjIuMTIgU3ltYm9sLnRvUHJpbWl0aXZlXHJcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcclxuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xyXG4kLmVhY2guY2FsbCgoXHJcbiAgICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLCcgK1xyXG4gICAgJ3NwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXHJcbiAgKS5zcGxpdCgnLCcpLCBmdW5jdGlvbihpdCl7XHJcbiAgICB2YXIgc3ltID0gcmVxdWlyZSgnLi8kLndrcycpKGl0KTtcclxuICAgIHN5bWJvbFN0YXRpY3NbaXRdID0gU3ltYm9sID09PSBCYXNlID8gc3ltIDogd3JhcChzeW0pO1xyXG4gIH1cclxuKTtcclxuXHJcbnNldHRlciA9IHRydWU7XHJcblxyXG4kZGVmKCRkZWYuUywgJ1N5bWJvbCcsIHN5bWJvbFN0YXRpY3MpO1xyXG5cclxuJGRlZigkZGVmLlMgKyAkZGVmLkYgKiAoU3ltYm9sICE9IEJhc2UpLCAnT2JqZWN0Jywge1xyXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXHJcbiAgZ2V0T3duUHJvcGVydHlOYW1lczogZnVuY3Rpb24oaXQpe1xyXG4gICAgdmFyIG5hbWVzID0gZ2V0TmFtZXModG9PYmplY3QoaXQpKSwgcmVzdWx0ID0gW10sIGtleSwgaSA9IDA7XHJcbiAgICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSB8fCByZXN1bHQucHVzaChrZXkpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9LFxyXG4gIC8vIDE5LjEuMi44IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMoTylcclxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6IGZ1bmN0aW9uKGl0KXtcclxuICAgIHZhciBuYW1lcyA9IGdldE5hbWVzKHRvT2JqZWN0KGl0KSksIHJlc3VsdCA9IFtdLCBrZXksIGkgPSAwO1xyXG4gICAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSloYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYgcmVzdWx0LnB1c2goQWxsU3ltYm9sc1trZXldKTtcclxuICAgIHJldHVybiByZXN1bHQ7XHJcbiAgfVxyXG59KTtcclxuXHJcbnNldFRhZyhTeW1ib2wsICdTeW1ib2wnKTtcclxuLy8gMjAuMi4xLjkgTWF0aFtAQHRvU3RyaW5nVGFnXVxyXG5zZXRUYWcoTWF0aCwgJ01hdGgnLCB0cnVlKTtcclxuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cclxuc2V0VGFnKCQuZy5KU09OLCAnSlNPTicsIHRydWUpOyIsIid1c2Ugc3RyaWN0JztcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCB3ZWFrICAgICAgPSByZXF1aXJlKCcuLyQuY29sbGVjdGlvbi13ZWFrJylcclxuICAsIGxlYWtTdG9yZSA9IHdlYWsubGVha1N0b3JlXHJcbiAgLCBJRCAgICAgICAgPSB3ZWFrLklEXHJcbiAgLCBXRUFLICAgICAgPSB3ZWFrLldFQUtcclxuICAsIGhhcyAgICAgICA9ICQuaGFzXHJcbiAgLCBpc09iamVjdCAgPSAkLmlzT2JqZWN0XHJcbiAgLCBpc0Zyb3plbiAgPSBPYmplY3QuaXNGcm96ZW4gfHwgJC5jb3JlLk9iamVjdC5pc0Zyb3plblxyXG4gICwgdG1wICAgICAgID0ge307XHJcblxyXG4vLyAyMy4zIFdlYWtNYXAgT2JqZWN0c1xyXG52YXIgV2Vha01hcCA9IHJlcXVpcmUoJy4vJC5jb2xsZWN0aW9uJykoJ1dlYWtNYXAnLCB7XHJcbiAgLy8gMjMuMy4zLjMgV2Vha01hcC5wcm90b3R5cGUuZ2V0KGtleSlcclxuICBnZXQ6IGZ1bmN0aW9uKGtleSl7XHJcbiAgICBpZihpc09iamVjdChrZXkpKXtcclxuICAgICAgaWYoaXNGcm96ZW4oa2V5KSlyZXR1cm4gbGVha1N0b3JlKHRoaXMpLmdldChrZXkpO1xyXG4gICAgICBpZihoYXMoa2V5LCBXRUFLKSlyZXR1cm4ga2V5W1dFQUtdW3RoaXNbSURdXTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIDIzLjMuMy41IFdlYWtNYXAucHJvdG90eXBlLnNldChrZXksIHZhbHVlKVxyXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSl7XHJcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywga2V5LCB2YWx1ZSk7XHJcbiAgfVxyXG59LCB3ZWFrLCB0cnVlLCB0cnVlKTtcclxuXHJcbi8vIElFMTEgV2Vha01hcCBmcm96ZW4ga2V5cyBmaXhcclxuaWYoJC5GVyAmJiBuZXcgV2Vha01hcCgpLnNldCgoT2JqZWN0LmZyZWV6ZSB8fCBPYmplY3QpKHRtcCksIDcpLmdldCh0bXApICE9IDcpe1xyXG4gICQuZWFjaC5jYWxsKFsnZGVsZXRlJywgJ2hhcycsICdnZXQnLCAnc2V0J10sIGZ1bmN0aW9uKGtleSl7XHJcbiAgICB2YXIgbWV0aG9kID0gV2Vha01hcC5wcm90b3R5cGVba2V5XTtcclxuICAgIFdlYWtNYXAucHJvdG90eXBlW2tleV0gPSBmdW5jdGlvbihhLCBiKXtcclxuICAgICAgLy8gc3RvcmUgZnJvemVuIG9iamVjdHMgb24gbGVha3kgbWFwXHJcbiAgICAgIGlmKGlzT2JqZWN0KGEpICYmIGlzRnJvemVuKGEpKXtcclxuICAgICAgICB2YXIgcmVzdWx0ID0gbGVha1N0b3JlKHRoaXMpW2tleV0oYSwgYik7XHJcbiAgICAgICAgcmV0dXJuIGtleSA9PSAnc2V0JyA/IHRoaXMgOiByZXN1bHQ7XHJcbiAgICAgIC8vIHN0b3JlIGFsbCB0aGUgcmVzdCBvbiBuYXRpdmUgd2Vha21hcFxyXG4gICAgICB9IHJldHVybiBtZXRob2QuY2FsbCh0aGlzLCBhLCBiKTtcclxuICAgIH07XHJcbiAgfSk7XHJcbn0iLCIndXNlIHN0cmljdCc7XHJcbnZhciB3ZWFrID0gcmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24td2VhaycpO1xyXG5cclxuLy8gMjMuNCBXZWFrU2V0IE9iamVjdHNcclxucmVxdWlyZSgnLi8kLmNvbGxlY3Rpb24nKSgnV2Vha1NldCcsIHtcclxuICAvLyAyMy40LjMuMSBXZWFrU2V0LnByb3RvdHlwZS5hZGQodmFsdWUpXHJcbiAgYWRkOiBmdW5jdGlvbih2YWx1ZSl7XHJcbiAgICByZXR1cm4gd2Vhay5kZWYodGhpcywgdmFsdWUsIHRydWUpO1xyXG4gIH1cclxufSwgd2VhaywgZmFsc2UsIHRydWUpOyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9kb21lbmljL0FycmF5LnByb3RvdHlwZS5pbmNsdWRlc1xyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlAsICdBcnJheScsIHtcclxuICBpbmNsdWRlczogcmVxdWlyZSgnLi8kLmFycmF5LWluY2x1ZGVzJykodHJ1ZSlcclxufSk7XHJcbnJlcXVpcmUoJy4vJC51bnNjb3BlJykoJ2luY2x1ZGVzJyk7IiwiLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vV2ViUmVmbGVjdGlvbi85MzUzNzgxXHJcbnZhciAkICAgICAgID0gcmVxdWlyZSgnLi8kJylcclxuICAsICRkZWYgICAgPSByZXF1aXJlKCcuLyQuZGVmJylcclxuICAsIG93bktleXMgPSByZXF1aXJlKCcuLyQub3duLWtleXMnKTtcclxuXHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xyXG4gIGdldE93blByb3BlcnR5RGVzY3JpcHRvcnM6IGZ1bmN0aW9uKG9iamVjdCl7XHJcbiAgICB2YXIgTyAgICAgID0gJC50b09iamVjdChvYmplY3QpXHJcbiAgICAgICwgcmVzdWx0ID0ge307XHJcbiAgICAkLmVhY2guY2FsbChvd25LZXlzKE8pLCBmdW5jdGlvbihrZXkpe1xyXG4gICAgICAkLnNldERlc2MocmVzdWx0LCBrZXksICQuZGVzYygwLCAkLmdldERlc2MoTywga2V5KSkpO1xyXG4gICAgfSk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7IiwiLy8gaHR0cDovL2dvby5nbC9Ya0JyakRcclxudmFyICQgICAgPSByZXF1aXJlKCcuLyQnKVxyXG4gICwgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0VG9BcnJheShpc0VudHJpZXMpe1xyXG4gIHJldHVybiBmdW5jdGlvbihvYmplY3Qpe1xyXG4gICAgdmFyIE8gICAgICA9ICQudG9PYmplY3Qob2JqZWN0KVxyXG4gICAgICAsIGtleXMgICA9ICQuZ2V0S2V5cyhvYmplY3QpXHJcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICAgLCBpICAgICAgPSAwXHJcbiAgICAgICwgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKVxyXG4gICAgICAsIGtleTtcclxuICAgIGlmKGlzRW50cmllcyl3aGlsZShsZW5ndGggPiBpKXJlc3VsdFtpXSA9IFtrZXkgPSBrZXlzW2krK10sIE9ba2V5XV07XHJcbiAgICBlbHNlIHdoaWxlKGxlbmd0aCA+IGkpcmVzdWx0W2ldID0gT1trZXlzW2krK11dO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxuICB9O1xyXG59XHJcbiRkZWYoJGRlZi5TLCAnT2JqZWN0Jywge1xyXG4gIHZhbHVlczogIGNyZWF0ZU9iamVjdFRvQXJyYXkoZmFsc2UpLFxyXG4gIGVudHJpZXM6IGNyZWF0ZU9iamVjdFRvQXJyYXkodHJ1ZSlcclxufSk7IiwiLy8gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20va2FuZ2F4Lzk2OTgxMDBcclxudmFyICRkZWYgPSByZXF1aXJlKCcuLyQuZGVmJyk7XHJcbiRkZWYoJGRlZi5TLCAnUmVnRXhwJywge1xyXG4gIGVzY2FwZTogcmVxdWlyZSgnLi8kLnJlcGxhY2VyJykoLyhbXFxcXFxcLVtcXF17fSgpKis/LixeJHxdKS9nLCAnXFxcXCQxJywgdHJ1ZSlcclxufSk7IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdGhpYXNieW5lbnMvU3RyaW5nLnByb3RvdHlwZS5hdFxyXG52YXIgJGRlZiA9IHJlcXVpcmUoJy4vJC5kZWYnKTtcclxuJGRlZigkZGVmLlAsICdTdHJpbmcnLCB7XHJcbiAgYXQ6IHJlcXVpcmUoJy4vJC5zdHJpbmctYXQnKSh0cnVlKVxyXG59KTsiLCIvLyBKYXZhU2NyaXB0IDEuNiAvIFN0cmF3bWFuIGFycmF5IHN0YXRpY3Mgc2hpbVxyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBjb3JlICAgID0gJC5jb3JlXHJcbiAgLCBzdGF0aWNzID0ge307XHJcbmZ1bmN0aW9uIHNldFN0YXRpY3Moa2V5cywgbGVuZ3RoKXtcclxuICAkLmVhY2guY2FsbChrZXlzLnNwbGl0KCcsJyksIGZ1bmN0aW9uKGtleSl7XHJcbiAgICBpZihsZW5ndGggPT0gdW5kZWZpbmVkICYmIGtleSBpbiBjb3JlLkFycmF5KXN0YXRpY3Nba2V5XSA9IGNvcmUuQXJyYXlba2V5XTtcclxuICAgIGVsc2UgaWYoa2V5IGluIFtdKXN0YXRpY3Nba2V5XSA9IHJlcXVpcmUoJy4vJC5jdHgnKShGdW5jdGlvbi5jYWxsLCBbXVtrZXldLCBsZW5ndGgpO1xyXG4gIH0pO1xyXG59XHJcbnNldFN0YXRpY3MoJ3BvcCxyZXZlcnNlLHNoaWZ0LGtleXMsdmFsdWVzLGVudHJpZXMnLCAxKTtcclxuc2V0U3RhdGljcygnaW5kZXhPZixldmVyeSxzb21lLGZvckVhY2gsbWFwLGZpbHRlcixmaW5kLGZpbmRJbmRleCxpbmNsdWRlcycsIDMpO1xyXG5zZXRTdGF0aWNzKCdqb2luLHNsaWNlLGNvbmNhdCxwdXNoLHNwbGljZSx1bnNoaWZ0LHNvcnQsbGFzdEluZGV4T2YsJyArXHJcbiAgICAgICAgICAgJ3JlZHVjZSxyZWR1Y2VSaWdodCxjb3B5V2l0aGluLGZpbGwsdHVybicpO1xyXG4kZGVmKCRkZWYuUywgJ0FycmF5Jywgc3RhdGljcyk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcclxudmFyICQgICAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCBJdGVyYXRvcnMgPSByZXF1aXJlKCcuLyQuaXRlcicpLkl0ZXJhdG9yc1xyXG4gICwgSVRFUkFUT1IgID0gcmVxdWlyZSgnLi8kLndrcycpKCdpdGVyYXRvcicpXHJcbiAgLCBOb2RlTGlzdCAgPSAkLmcuTm9kZUxpc3Q7XHJcbmlmKCQuRlcgJiYgTm9kZUxpc3QgJiYgIShJVEVSQVRPUiBpbiBOb2RlTGlzdC5wcm90b3R5cGUpKXtcclxuICAkLmhpZGUoTm9kZUxpc3QucHJvdG90eXBlLCBJVEVSQVRPUiwgSXRlcmF0b3JzLkFycmF5KTtcclxufVxyXG5JdGVyYXRvcnMuTm9kZUxpc3QgPSBJdGVyYXRvcnMuQXJyYXk7IiwidmFyICRkZWYgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCAkdGFzayA9IHJlcXVpcmUoJy4vJC50YXNrJyk7XHJcbiRkZWYoJGRlZi5HICsgJGRlZi5CLCB7XHJcbiAgc2V0SW1tZWRpYXRlOiAgICR0YXNrLnNldCxcclxuICBjbGVhckltbWVkaWF0ZTogJHRhc2suY2xlYXJcclxufSk7IiwiLy8gaWU5LSBzZXRUaW1lb3V0ICYgc2V0SW50ZXJ2YWwgYWRkaXRpb25hbCBwYXJhbWV0ZXJzIGZpeFxyXG52YXIgJCAgICAgICA9IHJlcXVpcmUoJy4vJCcpXHJcbiAgLCAkZGVmICAgID0gcmVxdWlyZSgnLi8kLmRlZicpXHJcbiAgLCBpbnZva2UgID0gcmVxdWlyZSgnLi8kLmludm9rZScpXHJcbiAgLCBwYXJ0aWFsID0gcmVxdWlyZSgnLi8kLnBhcnRpYWwnKVxyXG4gICwgTVNJRSAgICA9ICEhJC5nLm5hdmlnYXRvciAmJiAvTVNJRSAuXFwuLy50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpOyAvLyA8LSBkaXJ0eSBpZTktIGNoZWNrXHJcbmZ1bmN0aW9uIHdyYXAoc2V0KXtcclxuICByZXR1cm4gTVNJRSA/IGZ1bmN0aW9uKGZuLCB0aW1lIC8qLCAuLi5hcmdzICovKXtcclxuICAgIHJldHVybiBzZXQoaW52b2tlKFxyXG4gICAgICBwYXJ0aWFsLFxyXG4gICAgICBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMiksXHJcbiAgICAgICQuaXNGdW5jdGlvbihmbikgPyBmbiA6IEZ1bmN0aW9uKGZuKVxyXG4gICAgKSwgdGltZSk7XHJcbiAgfSA6IHNldDtcclxufVxyXG4kZGVmKCRkZWYuRyArICRkZWYuQiArICRkZWYuRiAqIE1TSUUsIHtcclxuICBzZXRUaW1lb3V0OiAgd3JhcCgkLmcuc2V0VGltZW91dCksXHJcbiAgc2V0SW50ZXJ2YWw6IHdyYXAoJC5nLnNldEludGVydmFsKVxyXG59KTsiLCJyZXF1aXJlKCcuL21vZHVsZXMvZXM1Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5pcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm9iamVjdC5zdGF0aWNzLWFjY2VwdC1wcmltaXRpdmVzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuZnVuY3Rpb24ubmFtZScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5jb25zdHJ1Y3RvcicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm51bWJlci5zdGF0aWNzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYubWF0aCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5mcm9tLWNvZGUtcG9pbnQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcucmF3Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmNvZGUtcG9pbnQtYXQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5zdHJpbmcuZW5kcy13aXRoJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLmluY2x1ZGVzJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuc3RyaW5nLnJlcGVhdCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnN0cmluZy5zdGFydHMtd2l0aCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZyb20nKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5vZicpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5Lml0ZXJhdG9yJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuc3BlY2llcycpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmNvcHktd2l0aGluJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYuYXJyYXkuZmlsbCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LmFycmF5LmZpbmQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5hcnJheS5maW5kLWluZGV4Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucmVnZXhwJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYucHJvbWlzZScpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2Lm1hcCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LnNldCcpO1xyXG5yZXF1aXJlKCcuL21vZHVsZXMvZXM2LndlYWstbWFwJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczYud2Vhay1zZXQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNi5yZWZsZWN0Jyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcuYXJyYXkuaW5jbHVkZXMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5zdHJpbmcuYXQnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5yZWdleHAuZXNjYXBlJyk7XHJcbnJlcXVpcmUoJy4vbW9kdWxlcy9lczcub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcnMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2VzNy5vYmplY3QudG8tYXJyYXknKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL2pzLmFycmF5LnN0YXRpY3MnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi50aW1lcnMnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5pbW1lZGlhdGUnKTtcclxucmVxdWlyZSgnLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL21vZHVsZXMvJCcpLmNvcmU7IiwiLyoqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogaHR0cHM6Ly9yYXcuZ2l0aHViLmNvbS9mYWNlYm9vay9yZWdlbmVyYXRvci9tYXN0ZXIvTElDRU5TRSBmaWxlLiBBblxuICogYWRkaXRpb25hbCBncmFudCBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluXG4gKiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuIShmdW5jdGlvbihnbG9iYWwpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgdmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG4gIHZhciB1bmRlZmluZWQ7IC8vIE1vcmUgY29tcHJlc3NpYmxlIHRoYW4gdm9pZCAwLlxuICB2YXIgaXRlcmF0b3JTeW1ib2wgPVxuICAgIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBTeW1ib2wuaXRlcmF0b3IgfHwgXCJAQGl0ZXJhdG9yXCI7XG5cbiAgdmFyIGluTW9kdWxlID0gdHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIjtcbiAgdmFyIHJ1bnRpbWUgPSBnbG9iYWwucmVnZW5lcmF0b3JSdW50aW1lO1xuICBpZiAocnVudGltZSkge1xuICAgIGlmIChpbk1vZHVsZSkge1xuICAgICAgLy8gSWYgcmVnZW5lcmF0b3JSdW50aW1lIGlzIGRlZmluZWQgZ2xvYmFsbHkgYW5kIHdlJ3JlIGluIGEgbW9kdWxlLFxuICAgICAgLy8gbWFrZSB0aGUgZXhwb3J0cyBvYmplY3QgaWRlbnRpY2FsIHRvIHJlZ2VuZXJhdG9yUnVudGltZS5cbiAgICAgIG1vZHVsZS5leHBvcnRzID0gcnVudGltZTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGV2YWx1YXRpbmcgdGhlIHJlc3Qgb2YgdGhpcyBmaWxlIGlmIHRoZSBydW50aW1lIHdhc1xuICAgIC8vIGFscmVhZHkgZGVmaW5lZCBnbG9iYWxseS5cbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBEZWZpbmUgdGhlIHJ1bnRpbWUgZ2xvYmFsbHkgKGFzIGV4cGVjdGVkIGJ5IGdlbmVyYXRlZCBjb2RlKSBhcyBlaXRoZXJcbiAgLy8gbW9kdWxlLmV4cG9ydHMgKGlmIHdlJ3JlIGluIGEgbW9kdWxlKSBvciBhIG5ldywgZW1wdHkgb2JqZWN0LlxuICBydW50aW1lID0gZ2xvYmFsLnJlZ2VuZXJhdG9yUnVudGltZSA9IGluTW9kdWxlID8gbW9kdWxlLmV4cG9ydHMgOiB7fTtcblxuICBmdW5jdGlvbiB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KSB7XG4gICAgcmV0dXJuIG5ldyBHZW5lcmF0b3IoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiB8fCBudWxsLCB0cnlMb2NzTGlzdCB8fCBbXSk7XG4gIH1cbiAgcnVudGltZS53cmFwID0gd3JhcDtcblxuICAvLyBUcnkvY2F0Y2ggaGVscGVyIHRvIG1pbmltaXplIGRlb3B0aW1pemF0aW9ucy4gUmV0dXJucyBhIGNvbXBsZXRpb25cbiAgLy8gcmVjb3JkIGxpa2UgY29udGV4dC50cnlFbnRyaWVzW2ldLmNvbXBsZXRpb24uIFRoaXMgaW50ZXJmYWNlIGNvdWxkXG4gIC8vIGhhdmUgYmVlbiAoYW5kIHdhcyBwcmV2aW91c2x5KSBkZXNpZ25lZCB0byB0YWtlIGEgY2xvc3VyZSB0byBiZVxuICAvLyBpbnZva2VkIHdpdGhvdXQgYXJndW1lbnRzLCBidXQgaW4gYWxsIHRoZSBjYXNlcyB3ZSBjYXJlIGFib3V0IHdlXG4gIC8vIGFscmVhZHkgaGF2ZSBhbiBleGlzdGluZyBtZXRob2Qgd2Ugd2FudCB0byBjYWxsLCBzbyB0aGVyZSdzIG5vIG5lZWRcbiAgLy8gdG8gY3JlYXRlIGEgbmV3IGZ1bmN0aW9uIG9iamVjdC4gV2UgY2FuIGV2ZW4gZ2V0IGF3YXkgd2l0aCBhc3N1bWluZ1xuICAvLyB0aGUgbWV0aG9kIHRha2VzIGV4YWN0bHkgb25lIGFyZ3VtZW50LCBzaW5jZSB0aGF0IGhhcHBlbnMgdG8gYmUgdHJ1ZVxuICAvLyBpbiBldmVyeSBjYXNlLCBzbyB3ZSBkb24ndCBoYXZlIHRvIHRvdWNoIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBUaGVcbiAgLy8gb25seSBhZGRpdGlvbmFsIGFsbG9jYXRpb24gcmVxdWlyZWQgaXMgdGhlIGNvbXBsZXRpb24gcmVjb3JkLCB3aGljaFxuICAvLyBoYXMgYSBzdGFibGUgc2hhcGUgYW5kIHNvIGhvcGVmdWxseSBzaG91bGQgYmUgY2hlYXAgdG8gYWxsb2NhdGUuXG4gIGZ1bmN0aW9uIHRyeUNhdGNoKGZuLCBvYmosIGFyZykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcIm5vcm1hbFwiLCBhcmc6IGZuLmNhbGwob2JqLCBhcmcpIH07XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBcInRocm93XCIsIGFyZzogZXJyIH07XG4gICAgfVxuICB9XG5cbiAgdmFyIEdlblN0YXRlU3VzcGVuZGVkU3RhcnQgPSBcInN1c3BlbmRlZFN0YXJ0XCI7XG4gIHZhciBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkID0gXCJzdXNwZW5kZWRZaWVsZFwiO1xuICB2YXIgR2VuU3RhdGVFeGVjdXRpbmcgPSBcImV4ZWN1dGluZ1wiO1xuICB2YXIgR2VuU3RhdGVDb21wbGV0ZWQgPSBcImNvbXBsZXRlZFwiO1xuXG4gIC8vIFJldHVybmluZyB0aGlzIG9iamVjdCBmcm9tIHRoZSBpbm5lckZuIGhhcyB0aGUgc2FtZSBlZmZlY3QgYXNcbiAgLy8gYnJlYWtpbmcgb3V0IG9mIHRoZSBkaXNwYXRjaCBzd2l0Y2ggc3RhdGVtZW50LlxuICB2YXIgQ29udGludWVTZW50aW5lbCA9IHt9O1xuXG4gIC8vIER1bW15IGNvbnN0cnVjdG9yIGZ1bmN0aW9ucyB0aGF0IHdlIHVzZSBhcyB0aGUgLmNvbnN0cnVjdG9yIGFuZFxuICAvLyAuY29uc3RydWN0b3IucHJvdG90eXBlIHByb3BlcnRpZXMgZm9yIGZ1bmN0aW9ucyB0aGF0IHJldHVybiBHZW5lcmF0b3JcbiAgLy8gb2JqZWN0cy4gRm9yIGZ1bGwgc3BlYyBjb21wbGlhbmNlLCB5b3UgbWF5IHdpc2ggdG8gY29uZmlndXJlIHlvdXJcbiAgLy8gbWluaWZpZXIgbm90IHRvIG1hbmdsZSB0aGUgbmFtZXMgb2YgdGhlc2UgdHdvIGZ1bmN0aW9ucy5cbiAgZnVuY3Rpb24gR2VuZXJhdG9yRnVuY3Rpb24oKSB7fVxuICBmdW5jdGlvbiBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZSgpIHt9XG5cbiAgdmFyIEdwID0gR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUucHJvdG90eXBlID0gR2VuZXJhdG9yLnByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb24ucHJvdG90eXBlID0gR3AuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvblByb3RvdHlwZTtcbiAgR2VuZXJhdG9yRnVuY3Rpb25Qcm90b3R5cGUuY29uc3RydWN0b3IgPSBHZW5lcmF0b3JGdW5jdGlvbjtcbiAgR2VuZXJhdG9yRnVuY3Rpb24uZGlzcGxheU5hbWUgPSBcIkdlbmVyYXRvckZ1bmN0aW9uXCI7XG5cbiAgcnVudGltZS5pc0dlbmVyYXRvckZ1bmN0aW9uID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgdmFyIGN0b3IgPSB0eXBlb2YgZ2VuRnVuID09PSBcImZ1bmN0aW9uXCIgJiYgZ2VuRnVuLmNvbnN0cnVjdG9yO1xuICAgIHJldHVybiBjdG9yXG4gICAgICA/IGN0b3IgPT09IEdlbmVyYXRvckZ1bmN0aW9uIHx8XG4gICAgICAgIC8vIEZvciB0aGUgbmF0aXZlIEdlbmVyYXRvckZ1bmN0aW9uIGNvbnN0cnVjdG9yLCB0aGUgYmVzdCB3ZSBjYW5cbiAgICAgICAgLy8gZG8gaXMgdG8gY2hlY2sgaXRzIC5uYW1lIHByb3BlcnR5LlxuICAgICAgICAoY3Rvci5kaXNwbGF5TmFtZSB8fCBjdG9yLm5hbWUpID09PSBcIkdlbmVyYXRvckZ1bmN0aW9uXCJcbiAgICAgIDogZmFsc2U7XG4gIH07XG5cbiAgcnVudGltZS5tYXJrID0gZnVuY3Rpb24oZ2VuRnVuKSB7XG4gICAgZ2VuRnVuLl9fcHJvdG9fXyA9IEdlbmVyYXRvckZ1bmN0aW9uUHJvdG90eXBlO1xuICAgIGdlbkZ1bi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdwKTtcbiAgICByZXR1cm4gZ2VuRnVuO1xuICB9O1xuXG4gIHJ1bnRpbWUuYXN5bmMgPSBmdW5jdGlvbihpbm5lckZuLCBvdXRlckZuLCBzZWxmLCB0cnlMb2NzTGlzdCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHZhciBnZW5lcmF0b3IgPSB3cmFwKGlubmVyRm4sIG91dGVyRm4sIHNlbGYsIHRyeUxvY3NMaXN0KTtcbiAgICAgIHZhciBjYWxsTmV4dCA9IHN0ZXAuYmluZChnZW5lcmF0b3IubmV4dCk7XG4gICAgICB2YXIgY2FsbFRocm93ID0gc3RlcC5iaW5kKGdlbmVyYXRvcltcInRocm93XCJdKTtcblxuICAgICAgZnVuY3Rpb24gc3RlcChhcmcpIHtcbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKHRoaXMsIG51bGwsIGFyZyk7XG4gICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgcmVqZWN0KHJlY29yZC5hcmcpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpbmZvID0gcmVjb3JkLmFyZztcbiAgICAgICAgaWYgKGluZm8uZG9uZSkge1xuICAgICAgICAgIHJlc29sdmUoaW5mby52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKGluZm8udmFsdWUpLnRoZW4oY2FsbE5leHQsIGNhbGxUaHJvdyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbE5leHQoKTtcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBHZW5lcmF0b3IoaW5uZXJGbiwgb3V0ZXJGbiwgc2VsZiwgdHJ5TG9jc0xpc3QpIHtcbiAgICB2YXIgZ2VuZXJhdG9yID0gb3V0ZXJGbiA/IE9iamVjdC5jcmVhdGUob3V0ZXJGbi5wcm90b3R5cGUpIDogdGhpcztcbiAgICB2YXIgY29udGV4dCA9IG5ldyBDb250ZXh0KHRyeUxvY3NMaXN0KTtcbiAgICB2YXIgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0O1xuXG4gICAgZnVuY3Rpb24gaW52b2tlKG1ldGhvZCwgYXJnKSB7XG4gICAgICBpZiAoc3RhdGUgPT09IEdlblN0YXRlRXhlY3V0aW5nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IHJ1bm5pbmdcIik7XG4gICAgICB9XG5cbiAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVDb21wbGV0ZWQpIHtcbiAgICAgICAgLy8gQmUgZm9yZ2l2aW5nLCBwZXIgMjUuMy4zLjMuMyBvZiB0aGUgc3BlYzpcbiAgICAgICAgLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLWdlbmVyYXRvcnJlc3VtZVxuICAgICAgICByZXR1cm4gZG9uZVJlc3VsdCgpO1xuICAgICAgfVxuXG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgZGVsZWdhdGUgPSBjb250ZXh0LmRlbGVnYXRlO1xuICAgICAgICBpZiAoZGVsZWdhdGUpIHtcbiAgICAgICAgICB2YXIgcmVjb3JkID0gdHJ5Q2F0Y2goXG4gICAgICAgICAgICBkZWxlZ2F0ZS5pdGVyYXRvclttZXRob2RdLFxuICAgICAgICAgICAgZGVsZWdhdGUuaXRlcmF0b3IsXG4gICAgICAgICAgICBhcmdcbiAgICAgICAgICApO1xuXG4gICAgICAgICAgaWYgKHJlY29yZC50eXBlID09PSBcInRocm93XCIpIHtcbiAgICAgICAgICAgIGNvbnRleHQuZGVsZWdhdGUgPSBudWxsO1xuXG4gICAgICAgICAgICAvLyBMaWtlIHJldHVybmluZyBnZW5lcmF0b3IudGhyb3codW5jYXVnaHQpLCBidXQgd2l0aG91dCB0aGVcbiAgICAgICAgICAgIC8vIG92ZXJoZWFkIG9mIGFuIGV4dHJhIGZ1bmN0aW9uIGNhbGwuXG4gICAgICAgICAgICBtZXRob2QgPSBcInRocm93XCI7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEZWxlZ2F0ZSBnZW5lcmF0b3IgcmFuIGFuZCBoYW5kbGVkIGl0cyBvd24gZXhjZXB0aW9ucyBzb1xuICAgICAgICAgIC8vIHJlZ2FyZGxlc3Mgb2Ygd2hhdCB0aGUgbWV0aG9kIHdhcywgd2UgY29udGludWUgYXMgaWYgaXQgaXNcbiAgICAgICAgICAvLyBcIm5leHRcIiB3aXRoIGFuIHVuZGVmaW5lZCBhcmcuXG4gICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgdmFyIGluZm8gPSByZWNvcmQuYXJnO1xuICAgICAgICAgIGlmIChpbmZvLmRvbmUpIHtcbiAgICAgICAgICAgIGNvbnRleHRbZGVsZWdhdGUucmVzdWx0TmFtZV0gPSBpbmZvLnZhbHVlO1xuICAgICAgICAgICAgY29udGV4dC5uZXh0ID0gZGVsZWdhdGUubmV4dExvYztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZVN1c3BlbmRlZFlpZWxkO1xuICAgICAgICAgICAgcmV0dXJuIGluZm87XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29udGV4dC5kZWxlZ2F0ZSA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobWV0aG9kID09PSBcIm5leHRcIikge1xuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRTdGFydCAmJlxuICAgICAgICAgICAgICB0eXBlb2YgYXJnICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICAgICAgICAvLyBodHRwczovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtZ2VuZXJhdG9ycmVzdW1lXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICBcImF0dGVtcHQgdG8gc2VuZCBcIiArIEpTT04uc3RyaW5naWZ5KGFyZykgKyBcIiB0byBuZXdib3JuIGdlbmVyYXRvclwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzdGF0ZSA9PT0gR2VuU3RhdGVTdXNwZW5kZWRZaWVsZCkge1xuICAgICAgICAgICAgY29udGV4dC5zZW50ID0gYXJnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWxldGUgY29udGV4dC5zZW50O1xuICAgICAgICAgIH1cblxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZCA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgaWYgKHN0YXRlID09PSBHZW5TdGF0ZVN1c3BlbmRlZFN0YXJ0KSB7XG4gICAgICAgICAgICBzdGF0ZSA9IEdlblN0YXRlQ29tcGxldGVkO1xuICAgICAgICAgICAgdGhyb3cgYXJnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKGFyZykpIHtcbiAgICAgICAgICAgIC8vIElmIHRoZSBkaXNwYXRjaGVkIGV4Y2VwdGlvbiB3YXMgY2F1Z2h0IGJ5IGEgY2F0Y2ggYmxvY2ssXG4gICAgICAgICAgICAvLyB0aGVuIGxldCB0aGF0IGNhdGNoIGJsb2NrIGhhbmRsZSB0aGUgZXhjZXB0aW9uIG5vcm1hbGx5LlxuICAgICAgICAgICAgbWV0aG9kID0gXCJuZXh0XCI7XG4gICAgICAgICAgICBhcmcgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSBpZiAobWV0aG9kID09PSBcInJldHVyblwiKSB7XG4gICAgICAgICAgY29udGV4dC5hYnJ1cHQoXCJyZXR1cm5cIiwgYXJnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlID0gR2VuU3RhdGVFeGVjdXRpbmc7XG5cbiAgICAgICAgdmFyIHJlY29yZCA9IHRyeUNhdGNoKGlubmVyRm4sIHNlbGYsIGNvbnRleHQpO1xuICAgICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIpIHtcbiAgICAgICAgICAvLyBJZiBhbiBleGNlcHRpb24gaXMgdGhyb3duIGZyb20gaW5uZXJGbiwgd2UgbGVhdmUgc3RhdGUgPT09XG4gICAgICAgICAgLy8gR2VuU3RhdGVFeGVjdXRpbmcgYW5kIGxvb3AgYmFjayBmb3IgYW5vdGhlciBpbnZvY2F0aW9uLlxuICAgICAgICAgIHN0YXRlID0gY29udGV4dC5kb25lXG4gICAgICAgICAgICA/IEdlblN0YXRlQ29tcGxldGVkXG4gICAgICAgICAgICA6IEdlblN0YXRlU3VzcGVuZGVkWWllbGQ7XG5cbiAgICAgICAgICB2YXIgaW5mbyA9IHtcbiAgICAgICAgICAgIHZhbHVlOiByZWNvcmQuYXJnLFxuICAgICAgICAgICAgZG9uZTogY29udGV4dC5kb25lXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChyZWNvcmQuYXJnID09PSBDb250aW51ZVNlbnRpbmVsKSB7XG4gICAgICAgICAgICBpZiAoY29udGV4dC5kZWxlZ2F0ZSAmJiBtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICAgIC8vIERlbGliZXJhdGVseSBmb3JnZXQgdGhlIGxhc3Qgc2VudCB2YWx1ZSBzbyB0aGF0IHdlIGRvbid0XG4gICAgICAgICAgICAgIC8vIGFjY2lkZW50YWxseSBwYXNzIGl0IG9uIHRvIHRoZSBkZWxlZ2F0ZS5cbiAgICAgICAgICAgICAgYXJnID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gaW5mbztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgc3RhdGUgPSBHZW5TdGF0ZUNvbXBsZXRlZDtcblxuICAgICAgICAgIGlmIChtZXRob2QgPT09IFwibmV4dFwiKSB7XG4gICAgICAgICAgICBjb250ZXh0LmRpc3BhdGNoRXhjZXB0aW9uKHJlY29yZC5hcmcpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcmcgPSByZWNvcmQuYXJnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGdlbmVyYXRvci5uZXh0ID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcIm5leHRcIik7XG4gICAgZ2VuZXJhdG9yW1widGhyb3dcIl0gPSBpbnZva2UuYmluZChnZW5lcmF0b3IsIFwidGhyb3dcIik7XG4gICAgZ2VuZXJhdG9yW1wicmV0dXJuXCJdID0gaW52b2tlLmJpbmQoZ2VuZXJhdG9yLCBcInJldHVyblwiKTtcblxuICAgIHJldHVybiBnZW5lcmF0b3I7XG4gIH1cblxuICBHcFtpdGVyYXRvclN5bWJvbF0gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBHcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIltvYmplY3QgR2VuZXJhdG9yXVwiO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHB1c2hUcnlFbnRyeShsb2NzKSB7XG4gICAgdmFyIGVudHJ5ID0geyB0cnlMb2M6IGxvY3NbMF0gfTtcblxuICAgIGlmICgxIGluIGxvY3MpIHtcbiAgICAgIGVudHJ5LmNhdGNoTG9jID0gbG9jc1sxXTtcbiAgICB9XG5cbiAgICBpZiAoMiBpbiBsb2NzKSB7XG4gICAgICBlbnRyeS5maW5hbGx5TG9jID0gbG9jc1syXTtcbiAgICAgIGVudHJ5LmFmdGVyTG9jID0gbG9jc1szXTtcbiAgICB9XG5cbiAgICB0aGlzLnRyeUVudHJpZXMucHVzaChlbnRyeSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNldFRyeUVudHJ5KGVudHJ5KSB7XG4gICAgdmFyIHJlY29yZCA9IGVudHJ5LmNvbXBsZXRpb24gfHwge307XG4gICAgcmVjb3JkLnR5cGUgPSBcIm5vcm1hbFwiO1xuICAgIGRlbGV0ZSByZWNvcmQuYXJnO1xuICAgIGVudHJ5LmNvbXBsZXRpb24gPSByZWNvcmQ7XG4gIH1cblxuICBmdW5jdGlvbiBDb250ZXh0KHRyeUxvY3NMaXN0KSB7XG4gICAgLy8gVGhlIHJvb3QgZW50cnkgb2JqZWN0IChlZmZlY3RpdmVseSBhIHRyeSBzdGF0ZW1lbnQgd2l0aG91dCBhIGNhdGNoXG4gICAgLy8gb3IgYSBmaW5hbGx5IGJsb2NrKSBnaXZlcyB1cyBhIHBsYWNlIHRvIHN0b3JlIHZhbHVlcyB0aHJvd24gZnJvbVxuICAgIC8vIGxvY2F0aW9ucyB3aGVyZSB0aGVyZSBpcyBubyBlbmNsb3NpbmcgdHJ5IHN0YXRlbWVudC5cbiAgICB0aGlzLnRyeUVudHJpZXMgPSBbeyB0cnlMb2M6IFwicm9vdFwiIH1dO1xuICAgIHRyeUxvY3NMaXN0LmZvckVhY2gocHVzaFRyeUVudHJ5LCB0aGlzKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBydW50aW1lLmtleXMgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmplY3QpIHtcbiAgICAgIGtleXMucHVzaChrZXkpO1xuICAgIH1cbiAgICBrZXlzLnJldmVyc2UoKTtcblxuICAgIC8vIFJhdGhlciB0aGFuIHJldHVybmluZyBhbiBvYmplY3Qgd2l0aCBhIG5leHQgbWV0aG9kLCB3ZSBrZWVwXG4gICAgLy8gdGhpbmdzIHNpbXBsZSBhbmQgcmV0dXJuIHRoZSBuZXh0IGZ1bmN0aW9uIGl0c2VsZi5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgICAgICB2YXIga2V5ID0ga2V5cy5wb3AoKTtcbiAgICAgICAgaWYgKGtleSBpbiBvYmplY3QpIHtcbiAgICAgICAgICBuZXh0LnZhbHVlID0ga2V5O1xuICAgICAgICAgIG5leHQuZG9uZSA9IGZhbHNlO1xuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRvIGF2b2lkIGNyZWF0aW5nIGFuIGFkZGl0aW9uYWwgb2JqZWN0LCB3ZSBqdXN0IGhhbmcgdGhlIC52YWx1ZVxuICAgICAgLy8gYW5kIC5kb25lIHByb3BlcnRpZXMgb2ZmIHRoZSBuZXh0IGZ1bmN0aW9uIG9iamVjdCBpdHNlbGYuIFRoaXNcbiAgICAgIC8vIGFsc28gZW5zdXJlcyB0aGF0IHRoZSBtaW5pZmllciB3aWxsIG5vdCBhbm9ueW1pemUgdGhlIGZ1bmN0aW9uLlxuICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH07XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsdWVzKGl0ZXJhYmxlKSB7XG4gICAgaWYgKGl0ZXJhYmxlKSB7XG4gICAgICB2YXIgaXRlcmF0b3JNZXRob2QgPSBpdGVyYWJsZVtpdGVyYXRvclN5bWJvbF07XG4gICAgICBpZiAoaXRlcmF0b3JNZXRob2QpIHtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yTWV0aG9kLmNhbGwoaXRlcmFibGUpO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIGl0ZXJhYmxlLm5leHQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICByZXR1cm4gaXRlcmFibGU7XG4gICAgICB9XG5cbiAgICAgIGlmICghaXNOYU4oaXRlcmFibGUubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuZXh0ID0gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgaXRlcmFibGUubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaGFzT3duLmNhbGwoaXRlcmFibGUsIGkpKSB7XG4gICAgICAgICAgICAgIG5leHQudmFsdWUgPSBpdGVyYWJsZVtpXTtcbiAgICAgICAgICAgICAgbmV4dC5kb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHQudmFsdWUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgbmV4dC5kb25lID0gdHJ1ZTtcblxuICAgICAgICAgIHJldHVybiBuZXh0O1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBuZXh0Lm5leHQgPSBuZXh0O1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybiBhbiBpdGVyYXRvciB3aXRoIG5vIHZhbHVlcy5cbiAgICByZXR1cm4geyBuZXh0OiBkb25lUmVzdWx0IH07XG4gIH1cbiAgcnVudGltZS52YWx1ZXMgPSB2YWx1ZXM7XG5cbiAgZnVuY3Rpb24gZG9uZVJlc3VsdCgpIHtcbiAgICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG4gIH1cblxuICBDb250ZXh0LnByb3RvdHlwZSA9IHtcbiAgICBjb25zdHJ1Y3RvcjogQ29udGV4dCxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucHJldiA9IDA7XG4gICAgICB0aGlzLm5leHQgPSAwO1xuICAgICAgdGhpcy5zZW50ID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5kb25lID0gZmFsc2U7XG4gICAgICB0aGlzLmRlbGVnYXRlID0gbnVsbDtcblxuICAgICAgdGhpcy50cnlFbnRyaWVzLmZvckVhY2gocmVzZXRUcnlFbnRyeSk7XG5cbiAgICAgIC8vIFByZS1pbml0aWFsaXplIGF0IGxlYXN0IDIwIHRlbXBvcmFyeSB2YXJpYWJsZXMgdG8gZW5hYmxlIGhpZGRlblxuICAgICAgLy8gY2xhc3Mgb3B0aW1pemF0aW9ucyBmb3Igc2ltcGxlIGdlbmVyYXRvcnMuXG4gICAgICBmb3IgKHZhciB0ZW1wSW5kZXggPSAwLCB0ZW1wTmFtZTtcbiAgICAgICAgICAgaGFzT3duLmNhbGwodGhpcywgdGVtcE5hbWUgPSBcInRcIiArIHRlbXBJbmRleCkgfHwgdGVtcEluZGV4IDwgMjA7XG4gICAgICAgICAgICsrdGVtcEluZGV4KSB7XG4gICAgICAgIHRoaXNbdGVtcE5hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRvbmUgPSB0cnVlO1xuXG4gICAgICB2YXIgcm9vdEVudHJ5ID0gdGhpcy50cnlFbnRyaWVzWzBdO1xuICAgICAgdmFyIHJvb3RSZWNvcmQgPSByb290RW50cnkuY29tcGxldGlvbjtcbiAgICAgIGlmIChyb290UmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByb290UmVjb3JkLmFyZztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucnZhbDtcbiAgICB9LFxuXG4gICAgZGlzcGF0Y2hFeGNlcHRpb246IGZ1bmN0aW9uKGV4Y2VwdGlvbikge1xuICAgICAgaWYgKHRoaXMuZG9uZSkge1xuICAgICAgICB0aHJvdyBleGNlcHRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcztcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZShsb2MsIGNhdWdodCkge1xuICAgICAgICByZWNvcmQudHlwZSA9IFwidGhyb3dcIjtcbiAgICAgICAgcmVjb3JkLmFyZyA9IGV4Y2VwdGlvbjtcbiAgICAgICAgY29udGV4dC5uZXh0ID0gbG9jO1xuICAgICAgICByZXR1cm4gISFjYXVnaHQ7XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICB2YXIgcmVjb3JkID0gZW50cnkuY29tcGxldGlvbjtcblxuICAgICAgICBpZiAoZW50cnkudHJ5TG9jID09PSBcInJvb3RcIikge1xuICAgICAgICAgIC8vIEV4Y2VwdGlvbiB0aHJvd24gb3V0c2lkZSBvZiBhbnkgdHJ5IGJsb2NrIHRoYXQgY291bGQgaGFuZGxlXG4gICAgICAgICAgLy8gaXQsIHNvIHNldCB0aGUgY29tcGxldGlvbiB2YWx1ZSBvZiB0aGUgZW50aXJlIGZ1bmN0aW9uIHRvXG4gICAgICAgICAgLy8gdGhyb3cgdGhlIGV4Y2VwdGlvbi5cbiAgICAgICAgICByZXR1cm4gaGFuZGxlKFwiZW5kXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYpIHtcbiAgICAgICAgICB2YXIgaGFzQ2F0Y2ggPSBoYXNPd24uY2FsbChlbnRyeSwgXCJjYXRjaExvY1wiKTtcbiAgICAgICAgICB2YXIgaGFzRmluYWxseSA9IGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIik7XG5cbiAgICAgICAgICBpZiAoaGFzQ2F0Y2ggJiYgaGFzRmluYWxseSkge1xuICAgICAgICAgICAgaWYgKHRoaXMucHJldiA8IGVudHJ5LmNhdGNoTG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuY2F0Y2hMb2MsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0NhdGNoKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5wcmV2IDwgZW50cnkuY2F0Y2hMb2MpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGhhbmRsZShlbnRyeS5jYXRjaExvYywgdHJ1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2UgaWYgKGhhc0ZpbmFsbHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZXYgPCBlbnRyeS5maW5hbGx5TG9jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBoYW5kbGUoZW50cnkuZmluYWxseUxvYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidHJ5IHN0YXRlbWVudCB3aXRob3V0IGNhdGNoIG9yIGZpbmFsbHlcIik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIGFicnVwdDogZnVuY3Rpb24odHlwZSwgYXJnKSB7XG4gICAgICBmb3IgKHZhciBpID0gdGhpcy50cnlFbnRyaWVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICAgIHZhciBlbnRyeSA9IHRoaXMudHJ5RW50cmllc1tpXTtcbiAgICAgICAgaWYgKGVudHJ5LnRyeUxvYyA8PSB0aGlzLnByZXYgJiZcbiAgICAgICAgICAgIGhhc093bi5jYWxsKGVudHJ5LCBcImZpbmFsbHlMb2NcIikgJiZcbiAgICAgICAgICAgIHRoaXMucHJldiA8IGVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgICB2YXIgZmluYWxseUVudHJ5ID0gZW50cnk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSAmJlxuICAgICAgICAgICh0eXBlID09PSBcImJyZWFrXCIgfHxcbiAgICAgICAgICAgdHlwZSA9PT0gXCJjb250aW51ZVwiKSAmJlxuICAgICAgICAgIGZpbmFsbHlFbnRyeS50cnlMb2MgPD0gYXJnICYmXG4gICAgICAgICAgYXJnIDwgZmluYWxseUVudHJ5LmZpbmFsbHlMb2MpIHtcbiAgICAgICAgLy8gSWdub3JlIHRoZSBmaW5hbGx5IGVudHJ5IGlmIGNvbnRyb2wgaXMgbm90IGp1bXBpbmcgdG8gYVxuICAgICAgICAvLyBsb2NhdGlvbiBvdXRzaWRlIHRoZSB0cnkvY2F0Y2ggYmxvY2suXG4gICAgICAgIGZpbmFsbHlFbnRyeSA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHZhciByZWNvcmQgPSBmaW5hbGx5RW50cnkgPyBmaW5hbGx5RW50cnkuY29tcGxldGlvbiA6IHt9O1xuICAgICAgcmVjb3JkLnR5cGUgPSB0eXBlO1xuICAgICAgcmVjb3JkLmFyZyA9IGFyZztcblxuICAgICAgaWYgKGZpbmFsbHlFbnRyeSkge1xuICAgICAgICB0aGlzLm5leHQgPSBmaW5hbGx5RW50cnkuZmluYWxseUxvYztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29tcGxldGUocmVjb3JkKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIENvbnRpbnVlU2VudGluZWw7XG4gICAgfSxcblxuICAgIGNvbXBsZXRlOiBmdW5jdGlvbihyZWNvcmQsIGFmdGVyTG9jKSB7XG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwidGhyb3dcIikge1xuICAgICAgICB0aHJvdyByZWNvcmQuYXJnO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVjb3JkLnR5cGUgPT09IFwiYnJlYWtcIiB8fFxuICAgICAgICAgIHJlY29yZC50eXBlID09PSBcImNvbnRpbnVlXCIpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gcmVjb3JkLmFyZztcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwicmV0dXJuXCIpIHtcbiAgICAgICAgdGhpcy5ydmFsID0gcmVjb3JkLmFyZztcbiAgICAgICAgdGhpcy5uZXh0ID0gXCJlbmRcIjtcbiAgICAgIH0gZWxzZSBpZiAocmVjb3JkLnR5cGUgPT09IFwibm9ybWFsXCIgJiYgYWZ0ZXJMb2MpIHtcbiAgICAgICAgdGhpcy5uZXh0ID0gYWZ0ZXJMb2M7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH0sXG5cbiAgICBmaW5pc2g6IGZ1bmN0aW9uKGZpbmFsbHlMb2MpIHtcbiAgICAgIGZvciAodmFyIGkgPSB0aGlzLnRyeUVudHJpZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgICAgdmFyIGVudHJ5ID0gdGhpcy50cnlFbnRyaWVzW2ldO1xuICAgICAgICBpZiAoZW50cnkuZmluYWxseUxvYyA9PT0gZmluYWxseUxvYykge1xuICAgICAgICAgIHJldHVybiB0aGlzLmNvbXBsZXRlKGVudHJ5LmNvbXBsZXRpb24sIGVudHJ5LmFmdGVyTG9jKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBcImNhdGNoXCI6IGZ1bmN0aW9uKHRyeUxvYykge1xuICAgICAgZm9yICh2YXIgaSA9IHRoaXMudHJ5RW50cmllcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgICB2YXIgZW50cnkgPSB0aGlzLnRyeUVudHJpZXNbaV07XG4gICAgICAgIGlmIChlbnRyeS50cnlMb2MgPT09IHRyeUxvYykge1xuICAgICAgICAgIHZhciByZWNvcmQgPSBlbnRyeS5jb21wbGV0aW9uO1xuICAgICAgICAgIGlmIChyZWNvcmQudHlwZSA9PT0gXCJ0aHJvd1wiKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3duID0gcmVjb3JkLmFyZztcbiAgICAgICAgICAgIHJlc2V0VHJ5RW50cnkoZW50cnkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gdGhyb3duO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFRoZSBjb250ZXh0LmNhdGNoIG1ldGhvZCBtdXN0IG9ubHkgYmUgY2FsbGVkIHdpdGggYSBsb2NhdGlvblxuICAgICAgLy8gYXJndW1lbnQgdGhhdCBjb3JyZXNwb25kcyB0byBhIGtub3duIGNhdGNoIGJsb2NrLlxuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCBjYXRjaCBhdHRlbXB0XCIpO1xuICAgIH0sXG5cbiAgICBkZWxlZ2F0ZVlpZWxkOiBmdW5jdGlvbihpdGVyYWJsZSwgcmVzdWx0TmFtZSwgbmV4dExvYykge1xuICAgICAgdGhpcy5kZWxlZ2F0ZSA9IHtcbiAgICAgICAgaXRlcmF0b3I6IHZhbHVlcyhpdGVyYWJsZSksXG4gICAgICAgIHJlc3VsdE5hbWU6IHJlc3VsdE5hbWUsXG4gICAgICAgIG5leHRMb2M6IG5leHRMb2NcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBDb250aW51ZVNlbnRpbmVsO1xuICAgIH1cbiAgfTtcbn0pKFxuICAvLyBBbW9uZyB0aGUgdmFyaW91cyB0cmlja3MgZm9yIG9idGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgZ2xvYmFsXG4gIC8vIG9iamVjdCwgdGhpcyBzZWVtcyB0byBiZSB0aGUgbW9zdCByZWxpYWJsZSB0ZWNobmlxdWUgdGhhdCBkb2VzIG5vdFxuICAvLyB1c2UgaW5kaXJlY3QgZXZhbCAod2hpY2ggdmlvbGF0ZXMgQ29udGVudCBTZWN1cml0eSBQb2xpY3kpLlxuICB0eXBlb2YgZ2xvYmFsID09PSBcIm9iamVjdFwiID8gZ2xvYmFsIDpcbiAgdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiA/IHdpbmRvdyA6IHRoaXNcbik7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCIuL2xpYi9iYWJlbC9wb2x5ZmlsbFwiKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJhYmVsLWNvcmUvcG9seWZpbGxcIik7XG4iLCIndXNlIHN0cmljdCc7XG5cblxuZXhwb3J0IGNsYXNzIEF1ZGlvRXZlbnR7XG4gIGNvbnN0cnVjdG9yKCl7XG5cbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXVkaW9FdmVudCgpe1xuICByZXR1cm4gbmV3IEF1ZGlvRXZlbnQoKTtcbn0iLCIvKlxuICBDcmVhdGVzIHRoZSBjb25maWcgb2JqZWN0IHRoYXQgaXMgdXNlZCBmb3IgaW50ZXJuYWxseSBzaGFyaW5nIHNldHRpbmdzLCBpbmZvcm1hdGlvbiBhbmQgdGhlIHN0YXRlLiBPdGhlciBtb2R1bGVzIG1heSBhZGQga2V5cyB0byB0aGlzIG9iamVjdC5cbiovXG5cbid1c2Ugc3RyaWN0JztcblxubGV0XG4gIGNvbmZpZyxcbiAgZGVmYXVsdFNvbmcsXG4gIHVhID0gJ05BJyxcbiAgb3MgPSAndW5rbm93bicsXG4gIGJyb3dzZXIgPSAnTkEnO1xuXG5cbmZ1bmN0aW9uIGdldENvbmZpZygpe1xuICBpZihjb25maWcgIT09IHVuZGVmaW5lZCl7XG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxuXG4gIGNvbmZpZyA9IG5ldyBNYXAoKTtcbiAgY29uZmlnLnNldCgnbGVnYWN5JywgZmFsc2UpOyAvLyB0cnVlIGlmIHRoZSBicm93c2VyIHVzZXMgYW4gb2xkZXIgdmVyc2lvbiBvZiB0aGUgV2ViQXVkaW8gQVBJLCBzb3VyY2Uubm90ZU9uKCkgYW5kIHNvdXJjZS5ub3RlT2ZmIGluc3RlYWQgb2Ygc291cmNlLnN0YXJ0KCkgYW5kIHNvdXJjZS5zdG9wKClcbiAgY29uZmlnLnNldCgnbWlkaScsIGZhbHNlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgTUlESSBzdXBwb3J0IGVpdGhlciB2aWEgV2ViTUlESSBvciBKYXp6XG4gIGNvbmZpZy5zZXQoJ3dlYm1pZGknLCBmYWxzZSk7IC8vIHRydWUgaWYgdGhlIGJyb3dzZXIgaGFzIFdlYk1JRElcbiAgY29uZmlnLnNldCgnd2ViYXVkaW8nLCB0cnVlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgV2ViQXVkaW9cbiAgY29uZmlnLnNldCgnamF6eicsIGZhbHNlKTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciBoYXMgdGhlIEphenogcGx1Z2luXG4gIGNvbmZpZy5zZXQoJ29nZycsIGZhbHNlKTsgLy8gdHJ1ZSBpZiBXZWJBdWRpbyBzdXBwb3J0cyBvZ2dcbiAgY29uZmlnLnNldCgnbXAzJywgZmFsc2UpOyAvLyB0cnVlIGlmIFdlYkF1ZGlvIHN1cHBvcnRzIG1wM1xuICBjb25maWcuc2V0KCdiaXRyYXRlX21wM19lbmNvZGluZycsIDEyOCk7IC8vIGRlZmF1bHQgYml0cmF0ZSBmb3IgYXVkaW8gcmVjb3JkaW5nc1xuICBjb25maWcuc2V0KCdkZWJ1Z0xldmVsJywgNCk7IC8vIDAgPSBvZmYsIDEgPSBlcnJvciwgMiA9IHdhcm4sIDMgPSBpbmZvLCA0ID0gbG9nXG4gIGNvbmZpZy5zZXQoJ3BpdGNoJywgNDQwKTsgLy8gYmFzaWMgcGl0Y2ggdGhhdCBpcyB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzYW1wbGVzXG4gIGNvbmZpZy5zZXQoJ2J1ZmZlclRpbWUnLCAzNTAvMTAwMCk7IC8vIHRpbWUgaW4gc2Vjb25kcyB0aGF0IGV2ZW50cyBhcmUgc2NoZWR1bGVkIGFoZWFkXG4gIGNvbmZpZy5zZXQoJ2F1dG9BZGp1c3RCdWZmZXJUaW1lJywgZmFsc2UpO1xuICBjb25maWcuc2V0KCdub3RlTmFtZU1vZGUnLCAnc2hhcnAnKTtcbiAgY29uZmlnLnNldCgnbWluaW1hbFNvbmdMZW5ndGgnLCA2MDAwMCk7IC8vbWlsbGlzXG4gIGNvbmZpZy5zZXQoJ3BhdXNlT25CbHVyJywgZmFsc2UpOyAvLyBwYXVzZSB0aGUgQXVkaW9Db250ZXh0IHdoZW4gcGFnZSBvciB0YWIgbG9vc2VzIGZvY3VzXG4gIGNvbmZpZy5zZXQoJ3Jlc3RhcnRPbkZvY3VzJywgdHJ1ZSk7IC8vIGlmIHNvbmcgd2FzIHBsYXlpbmcgYXQgdGhlIHRpbWUgdGhlIHBhZ2Ugb3IgdGFiIGxvc3QgZm9jdXMsIGl0IHdpbGwgc3RhcnQgcGxheWluZyBhdXRvbWF0aWNhbGx5IGFzIHNvb24gYXMgdGhlIHBhZ2UvdGFiIGdldHMgZm9jdXMgYWdhaW5cbiAgY29uZmlnLnNldCgnZGVmYXVsdFBQUScsIDk2MCk7XG4gIGNvbmZpZy5zZXQoJ292ZXJydWxlUFBRJywgdHJ1ZSk7XG4gIGNvbmZpZy5zZXQoJ3ByZWNpc2lvbicsIDMpOyAvLyBtZWFucyBmbG9hdCB3aXRoIHByZWNpc2lvbiAzLCBlLmcuIDEwLjQzN1xuICBjb25maWcuc2V0KCdhY3RpdmVTb25ncycsIHt9KTsvLyB0aGUgc29uZ3MgY3VycmVudGx5IGxvYWRlZCBpbiBtZW1vcnlcblxuXG4gIGRlZmF1bHRTb25nID0gbmV3IE1hcCgpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2JwbScsIDEyMCk7XG4gIGRlZmF1bHRTb25nLnNldCgncHBxJywgY29uZmlnLmdldCgnZGVmYXVsdFBQUScpKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdiYXJzJywgMzApO1xuICBkZWZhdWx0U29uZy5zZXQoJ2xvd2VzdE5vdGUnLCAwKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdoaWdoZXN0Tm90ZScsIDEyNyk7XG4gIGRlZmF1bHRTb25nLnNldCgnbm9taW5hdG9yJywgNCk7XG4gIGRlZmF1bHRTb25nLnNldCgnZGVub21pbmF0b3InLCA0KTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdxdWFudGl6ZVZhbHVlJywgOCk7XG4gIGRlZmF1bHRTb25nLnNldCgnZml4ZWRMZW5ndGhWYWx1ZScsIGZhbHNlKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdwb3NpdGlvblR5cGUnLCAnYWxsJyk7XG4gIGRlZmF1bHRTb25nLnNldCgndXNlTWV0cm9ub21lJywgZmFsc2UpO1xuICBkZWZhdWx0U29uZy5zZXQoJ2F1dG9TaXplJywgdHJ1ZSk7XG4gIGRlZmF1bHRTb25nLnNldCgnbG9vcCcsIGZhbHNlKTtcbiAgZGVmYXVsdFNvbmcuc2V0KCdwbGF5YmFja1NwZWVkJywgMSk7XG4gIGRlZmF1bHRTb25nLnNldCgnYXV0b1F1YW50aXplJywgZmFsc2UpO1xuICBjb25maWcuc2V0KCdkZWZhdWx0U29uZycsIGRlZmF1bHRTb25nKTtcblxuXG4gIC8vIGdldCBicm93c2VyIGFuZCBvc1xuICBpZihuYXZpZ2F0b3IgIT09IHVuZGVmaW5lZCl7XG4gICAgdWEgPSBuYXZpZ2F0b3IudXNlckFnZW50O1xuXG4gICAgaWYodWEubWF0Y2goLyhpUGFkfGlQaG9uZXxpUG9kKS9nKSl7XG4gICAgICBvcyA9ICdpb3MnO1xuICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0FuZHJvaWQnKSAhPT0gLTEpe1xuICAgICAgb3MgPSAnYW5kcm9pZCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignTGludXgnKSAhPT0gLTEpe1xuICAgICAgIG9zID0gJ2xpbnV4JztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdNYWNpbnRvc2gnKSAhPT0gLTEpe1xuICAgICAgIG9zID0gJ29zeCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignV2luZG93cycpICE9PSAtMSl7XG4gICAgICAgb3MgPSAnd2luZG93cyc7XG4gICAgfVxuXG4gICAgaWYodWEuaW5kZXhPZignQ2hyb21lJykgIT09IC0xKXtcbiAgICAgIC8vIGNocm9tZSwgY2hyb21pdW0gYW5kIGNhbmFyeVxuICAgICAgYnJvd3NlciA9ICdjaHJvbWUnO1xuXG4gICAgICBpZih1YS5pbmRleE9mKCdPUFInKSAhPT0gLTEpe1xuICAgICAgICBicm93c2VyID0gJ29wZXJhJztcbiAgICAgIH1lbHNlIGlmKHVhLmluZGV4T2YoJ0Nocm9taXVtJykgIT09IC0xKXtcbiAgICAgICAgYnJvd3NlciA9ICdjaHJvbWl1bSc7XG4gICAgICB9XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignU2FmYXJpJykgIT09IC0xKXtcbiAgICAgIGJyb3dzZXIgPSAnc2FmYXJpJztcbiAgICB9ZWxzZSBpZih1YS5pbmRleE9mKCdGaXJlZm94JykgIT09IC0xKXtcbiAgICAgIGJyb3dzZXIgPSAnZmlyZWZveCc7XG4gICAgfWVsc2UgaWYodWEuaW5kZXhPZignVHJpZGVudCcpICE9PSAtMSl7XG4gICAgICBicm93c2VyID0gJ0ludGVybmV0IEV4cGxvcmVyJztcbiAgICB9XG5cbiAgICBpZihvcyA9PT0gJ2lvcycpe1xuICAgICAgaWYodWEuaW5kZXhPZignQ3JpT1MnKSAhPT0gLTEpe1xuICAgICAgICBicm93c2VyID0gJ2Nocm9tZSc7XG4gICAgICB9XG4gICAgfVxuICB9ZWxzZXtcbiAgICAvLyBUT0RPOiBjaGVjayBvcyBoZXJlIHdpdGggTm9kZWpzJyByZXF1aXJlKCdvcycpXG4gIH1cbiAgY29uZmlnLnNldCgndWEnLCB1YSk7XG4gIGNvbmZpZy5zZXQoJ29zJywgb3MpO1xuICBjb25maWcuc2V0KCdicm93c2VyJywgYnJvd3Nlcik7XG5cbiAgLy8gY2hlY2sgaWYgd2UgaGF2ZSBhbiBhdWRpbyBjb250ZXh0XG4gIHdpbmRvdy5BdWRpb0NvbnRleHQgPSAoXG4gICAgd2luZG93LkF1ZGlvQ29udGV4dCB8fFxuICAgIHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHxcbiAgICB3aW5kb3cub0F1ZGlvQ29udGV4dCB8fFxuICAgIHdpbmRvdy5tc0F1ZGlvQ29udGV4dFxuICApO1xuICBjb25maWcuc2V0KCdhdWRpb19jb250ZXh0JywgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSAhPT0gdW5kZWZpbmVkKTtcbiAgY29uZmlnLnNldCgncmVjb3JkX2F1ZGlvJywgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSAhPT0gdW5kZWZpbmVkKTtcblxuXG4gIC8vIGNoZWNrIGlmIGF1ZGlvIGNhbiBiZSByZWNvcmRlZFxuICBuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhID0gKFxuICAgIG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYSB8fFxuICAgIG5hdmlnYXRvci5tc0dldFVzZXJNZWRpYVxuICApO1xuICBjb25maWcuc2V0KCdhdWRpb19jb250ZXh0Jywgd2luZG93LkF1ZGlvQ29udGV4dCAhPT0gdW5kZWZpbmVkKTtcblxuXG4gIC8vIG5vIHdlYmF1ZGlvLCByZXR1cm5cbiAgaWYoY29uZmlnLmdldCgnYXVkaW9fY29udGV4dCcpID09PSBmYWxzZSl7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gY2hlY2sgZm9yIG90aGVyICdtb2Rlcm4nIEFQSSdzXG4gIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gIHdpbmRvdy5CbG9iID0gd2luZG93LkJsb2IgfHwgd2luZG93LndlYmtpdEJsb2IgfHwgd2luZG93Lm1vekJsb2I7XG4gIC8vY29uc29sZS5sb2coJ2lPUycsIG9zLCBjb250ZXh0LCB3aW5kb3cuQmxvYiwgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSk7XG5cbiAgcmV0dXJuIGNvbmZpZztcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBnZXRDb25maWc7IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgc2VxdWVuY2VyIGZyb20gJy4vc2VxdWVuY2VyLmpzJztcblxuXG5sZXQgdGltZWRUYXNrcyA9IG5ldyBNYXAoKTtcbmxldCByZXBldGl0aXZlVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgc2NoZWR1bGVkVGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgdGFza3MgPSBuZXcgTWFwKCk7XG5sZXQgbGFzdFRpbWVTdGFtcDtcblxuXG5mdW5jdGlvbiBoZWFydGJlYXQodGltZXN0YW1wKXtcbiAgbGV0IG5vdyA9IHNlcXVlbmNlci50aW1lO1xuXG4gIC8vIGZvciBpbnN0YW5jZTogdGhlIGNhbGxiYWNrIG9mIHNhbXBsZS51bnNjaGVkdWxlO1xuICBmb3IobGV0IFtrZXksIHRhc2tdIG9mIHRpbWVkVGFza3Mpe1xuICAgIGlmKHRhc2sudGltZSA+PSBub3cpe1xuICAgICAgdGFzay5leGVjdXRlKG5vdyk7XG4gICAgICB0aW1lZFRhc2tzLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgfVxuXG5cbiAgLy8gZm9yIGluc3RhbmNlOiBzb25nLnVwZGF0ZSgpO1xuICBmb3IobGV0IHRhc2sgb2Ygc2NoZWR1bGVkVGFza3MudmFsdWVzKCkpe1xuICAgIHRhc2sobm93KTtcbiAgfVxuXG4gIC8vIGZvciBpbnN0YW5jZTogc29uZy5wdWxzZSgpO1xuICBmb3IobGV0IHRhc2sgb2YgcmVwZXRpdGl2ZVRhc2tzLnZhbHVlcygpKXtcbiAgICB0YXNrKG5vdyk7XG4gIH1cbi8qXG4gIC8vIHNraXAgdGhlIGZpcnN0IDEwIGZyYW1lcyBiZWNhdXNlIHRoZXkgdGVuZCB0byBoYXZlIHdlaXJkIGludGVydmFsc1xuICBpZihyID49IDEwKXtcbiAgICBsZXQgZGlmZiA9ICh0aW1lc3RhbXAgLSBsYXN0VGltZVN0YW1wKS8xMDAwO1xuICAgIHNlcXVlbmNlci5kaWZmID0gZGlmZjtcbiAgICAvLyBpZihyIDwgNDApe1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhkaWZmKTtcbiAgICAvLyAgICAgcisrO1xuICAgIC8vIH1cbiAgICBpZihkaWZmID4gc2VxdWVuY2VyLmJ1ZmZlclRpbWUgJiYgc2VxdWVuY2VyLmF1dG9BZGp1c3RCdWZmZXJUaW1lID09PSB0cnVlKXtcbiAgICAgIGlmKHNlcXVlbmNlci5kZWJ1Zyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhZGp1c3RlZCBidWZmZXJ0aW1lOicgKyBzZXF1ZW5jZXIuYnVmZmVyVGltZSArICcgLT4gJyArICBkaWZmKTtcbiAgICAgIH1cbiAgICAgIHNlcXVlbmNlci5idWZmZXJUaW1lID0gZGlmZjtcbiAgICB9XG4gIH1lbHNle1xuICAgIHIrKztcbiAgfVxuKi9cbiAgbGFzdFRpbWVTdGFtcCA9IHRpbWVzdGFtcDtcbiAgc2NoZWR1bGVkVGFza3MuY2xlYXIoKTtcblxuICAvL3NldFRpbWVvdXQoaGVhcnRiZWF0LCAxMDApO1xuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGhlYXJ0YmVhdCk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFRhc2sodHlwZSwgaWQsIHRhc2spe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuc2V0KGlkLCB0YXNrKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZVRhc2sodHlwZSwgaWQpe1xuICBsZXQgbWFwID0gdGFza3MuZ2V0KHR5cGUpO1xuICBtYXAuZGVsZXRlKGlkKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0YXJ0KCl7XG4gIHRhc2tzLnNldCgndGltZWQnLCB0aW1lZFRhc2tzKTtcbiAgdGFza3Muc2V0KCdyZXBldGl0aXZlJywgcmVwZXRpdGl2ZVRhc2tzKTtcbiAgdGFza3Muc2V0KCdzY2hlZHVsZWQnLCBzY2hlZHVsZWRUYXNrcyk7XG4gIGhlYXJ0YmVhdCgpO1xufSIsIi8qXG4gIFNldHMgdXAgdGhlIGJhc2ljIGF1ZGlvIHJvdXRpbmcsIHRlc3RzIHdoaWNoIGF1ZGlvIGZvcm1hdHMgYXJlIHN1cHBvcnRlZCBhbmQgcGFyc2VzIHRoZSBzYW1wbGVzIGZvciB0aGUgbWV0cm9ub21lIHRpY2tzLlxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2xvZywgaW5mbywgd2FybiwgZXJyb3IsIHBhcnNlU2FtcGxlc30gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIGRhdGEgPSB7fSxcbiAgY29udGV4dCxcblxuICBzb3VyY2UsXG4gIGdhaW5Ob2RlLFxuICBjb21wcmVzc29yO1xuXG5jb25zdFxuICBjb21wcmVzc29yUGFyYW1zID0gWyd0aHJlc2hvbGQnLCAna25lZScsICdyYXRpbycsICdyZWR1Y3Rpb24nLCAnYXR0YWNrJywgJ3JlbGVhc2UnXSxcblxuICBlbXB0eU9nZyA9ICdUMmRuVXdBQ0FBQUFBQUFBQUFCZHhkNFhBQUFBQURhUzBqUUJIZ0YyYjNKaWFYTUFBQUFBQVVTc0FBQUFBQUFBZ0xzQUFBQUFBQUM0QVU5bloxTUFBQUFBQUFBQUFBQUFYY1hlRndFQUFBQWFYSytRRHozLy8vLy8vLy8vLy8vLy8vLy9NZ04yYjNKaWFYTXRBQUFBV0dsd2FDNVBjbWNnYkdsaVZtOXlZbWx6SUVrZ01qQXhNREV4TURFZ0tGTmphR0YxWm1WdWRXZG5aWFFwQUFBQUFBRUZkbTl5WW1sekgwSkRWZ0VBQUFFQUdHTlVLVWFaVXRKS2lSbHpsREZHbVdLU1NvbWxoQlpDU0oxekZGT3BPZGVjYTZ5NXRTQ0VFQnBUVUNrRm1WS09VbWtaWTVBcEJabFNFRXRKSlhRU09pZWRZeEJiU2NIV21HdUxRYlljaEEyYVVrd3B4SlJTaWtJSUdWT01LY1dVVWtwQ0J5VjBEanJtSEZPT1NpaEJ1Snh6cTdXV2xtT0xxWFNTU3Vja1pFeENTQ21Ga2tvSHBWTk9Ra2cxbHRaU0tSMXpVbEpxUWVnZ2hCQkN0aUNFRFlMUWtGVUFBQUVBd0VBUUdySUtBRkFBQUJDS29SaUtBb1NHckFJQU1nQUFCS0FvanVJb2ppTTVrbU5KRmhBYXNnb0FBQUlBRUFBQXdIQVVTWkVVeWJFa1M5SXNTOU5FVVZWOTFUWlZWZloxWGRkMVhkZDFJRFJrRlFBQUFRQkFTS2VacFJvZ3dneGtHQWdOV1FVQUlBQUFBRVlvd2hBRFFrTldBUUFBQVFBQVlpZzVpQ2EwNW54empvTm1PV2dxeGVaMGNDTFY1a2x1S3VibW5IUE9PU2ViYzhZNDU1eHppbkptTVdnbXRPYWNjeEtEWmlsb0pyVG1uSE9leE9aQmE2cTA1cHh6eGptbmczRkdHT2VjYzVxMDVrRnFOdGJtbkhNV3RLWTVhaTdGNXB4ekl1WG1TVzB1MWVhY2M4NDU1NXh6empubm5IT3FGNmR6Y0U0NDU1eHpvdmJtV201Q0YrZWNjejRacDN0elFqam5uSFBPT2VlY2M4NDU1NXh6Z3RDUVZRQUFFQUFBUVJnMmhuR25JRWlmbzRFWVJZaHB5S1FIM2FQREpHZ01jZ3FwUjZPamtWTHFJSlJVeGtrcG5TQTBaQlVBQUFnQUFDR0VGRkpJSVlVVVVrZ2hoUlJTaUNHR0dHTElLYWVjZ2dvcXFhU2lpakxLTExQTU1zc3NzOHd5NjdDenpqcnNNTVFRUXd5dHRCSkxUYlhWV0dPdHVlZWNhdzdTV21tdHRkWktLYVdVVWtvcENBMVpCUUNBQUFBUUNCbGtrRUZHSVlVVVVvZ2hwcHh5eWltb29BSkNRMVlCQUlBQUFBSUFBQUE4eVhORVIzUkVSM1JFUjNSRVIzUkV4M004UjVSRVNaUkVTYlJNeTlSTVR4VlYxWlZkVzlabDNmWnRZUmQyM2ZkMTMvZDE0OWVGWVZtV1pWbVdaVm1XWlZtV1pWbVdaVm1DMEpCVkFBQUlBQUNBRUVJSUlZVVVVa2docFJoanpESG5vSk5RUWlBMFpCVUFBQWdBSUFBQUFNQlJITVZ4SkVkeUpNbVNMRW1UTkV1elBNM1RQRTMwUkZFVVRkTlVSVmQwUmQyMFJkbVVUZGQwVGRsMFZWbTFYVm0yYmRuV2JWK1diZC8zZmQvM2ZkLzNmZC8zZmQvM2RSMElEVmtGQUVnQUFPaElqcVJJaXFSSWp1TTRraVFCb1NHckFBQVpBQUFCQUNpS296aU80MGlTSkVtV3BFbWU1Vm1pWm1xbVozcXFxQUtoSWFzQUFFQUFBQUVBQUFBQUFDaWE0aW1tNGltaTRqbWlJMHFpWlZxaXBtcXVLSnV5NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N3F1NjdxdTY3cXU2N291RUJxeUNnQ1FBQURRa1J6SmtSeEprUlJKa1J6SkFVSkRWZ0VBTWdBQUFnQndETWVRRk1teExFdlRQTTNUUEUzMFJFLzBURThWWGRFRlFrTldBUUNBQUFBQ0FBQUFBQUF3Sk1OU0xFZHpORW1VVkV1MVZFMjFWRXNWVlU5VlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlUxVGRNMFRTQTBaQ1VBQUFRQXdHS053ZVVnSVNVbDVkNFF3aENUbmpFbUliVmVJUVNSa3Q0eEJoV0RuaktpREhMZVF1TVFneDRJRFZrUkFFUUJBQURHSU1jUWM4ZzVSNm1URWpubnFIU1VHdWNjcFk1U1p5bkZtR0xOS0pYWVVxeU5jNDVTUjYyamxHSXNMWGFVVW8ycHhnSUFBQUljQUFBQ0xJUkNRMVlFQUZFQUFJUXhTQ21rRkdLTU9hZWNRNHdwNTVoemhqSG1ISE9PT2VlZ2RGSXE1NXgwVGtyRUdIT09PYWVjYzFJNko1VnpUa29ub1FBQWdBQUhBSUFBQzZIUWtCVUJRSndBZ0VHU1BFL3lORkdVTkU4VVJWTjBYVkUwWGRmeVBOWDBURk5WUGRGVVZWTlZiZGxVVlZtV1BNODBQZE5VVmM4MFZkVlVWVmsyVlZXV1JWWFZiZE4xZGR0MFZkMldiZHYzWFZzV2RsRlZiZDFVWGRzM1ZkZjJYZG4yZlZuV2RXUHlQRlgxVE5OMVBkTjBaZFYxYlZ0MVhWMzNURk9XVGRlVlpkTjFiZHVWWlYxM1pkbjNOZE4wWGROVlpkbDBYZGwyWlZlM1hWbjJmZE4xaGQrVlpWOVhaVmtZZGwzM2hWdlhsZVYwWGQxWFpWYzNWbG4yZlZ2WGhlSFdkV0daUEU5VlBkTjBYYzgwWFZkMVhWOVhYZGZXTmRPVVpkTjFiZGxVWFZsMlpkbjNYVmZXZGM4MFpkbDBYZHMyWFZlV1hWbjJmVmVXZGQxMFhWOVhaVm40VlZmMmRWblhsZUhXYmVFM1hkZjNWVm4yaFZlV2RlSFdkV0c1ZFYwWVBsWDFmVk4yaGVGMFpkL1hoZDlaYmwwNGx0RjFmV0dWYmVGWVpWazVmdUZZbHQzM2xXVjBYVjlZYmRrWVZsa1dobC80bmVYMmZlTjRkVjBaYnQzbnpMcnZETWZ2cFB2SzA5VnRZNWw5M1ZsbVgzZU80Umc2di9EanFhcXZtNjRyREtjc0M3L3Q2OGF6Kzc2eWpLN3IrNm9zQzc4cTI4S3g2Nzd6L0w2d0xLUHMrc0pxeThLdzJyWXgzTDV1TEw5d0hNdHI2OG94Njc1UnRuVjhYM2dLdy9OMGRWMTVabDNIOW5WMDQwYzRmc29BQUlBQkJ3Q0FBQlBLUUtFaEt3S0FPQUVBanlTSm9tUlpvaWhabGlpS3B1aTZvbWk2cnFScHBxbHBubWxhbW1lYXBtbXFzaW1hcml4cG1tbGFubWFhbXFlWnBtaWFybXVhcHF5S3BpbkxwbXJLc21tYXN1eTZzbTI3cm16Ym9tbktzbW1hc215YXBpeTdzcXZicnV6cXVxUlpwcWw1bm1scW5tZWFwbXJLc21tYXJxdDVubXA2bm1pcW5paXFxbXFxcXEycXFpeGJubWVhbXVpcHBpZUtxbXFxcHEyYXFpckxwcXJhc21tcXRteXFxbTI3cXV6NnNtM3J1bW1xc20ycXBpMmJxbXJicnV6cXNpemJ1aTlwbW1scW5tZWFtdWVacG1tYXNteWFxaXRibnFlYW5paXFxdWFKcG1xcXFpeWJwcXJLbHVlWnFpZUtxdXFKbm11YXFpckxwbXJhcW1tYXRteXFxaTJicGlyTHJtMzd2dXZLc202cXFteWJxbXJycG1yS3Ntekx2dS9LcXU2S3BpbkxwcXJhc21tcXNpM2JzdS9Mc3F6N29tbktzbW1xc20ycXFpN0xzbTBiczJ6N3VtaWFzbTJxcGkyYnFpcmJzaTM3dWl6YnV1L0tybStycXF6cnNpMzd1dTc2cm5EcnVqQzhzbXo3cXF6NnVpdmJ1bS9yTXR2MmZVVFRsR1ZUTlczYlZGVlpkbVhaOW1YYjluM1JORzFiVlZWYk5rM1Z0bVZaOW4xWnRtMWhORTNaTmxWVjFrM1Z0RzFabG0xaHRtWGhkbVhadDJWYjluWFhsWFZmMTMzajEyWGQ1cnF5N2N1eXJmdXFxL3EyN3Z2Q2NPdXU4QW9BQUJod0FBQUlNS0VNRkJxeUVnQ0lBZ0FBakdHTU1RaU5VczQ1QjZGUnlqbm5JR1RPUVFnaGxjdzVDQ0dVa2prSG9aU1VNdWNnbEpKU0NLR1VsRm9MSVpTVVVtc0ZBQUFVT0FBQUJOaWdLYkU0UUtFaEt3R0FWQUFBZytOWWx1ZVpvbXJhc21OSm5pZUtxcW1xdHUxSWx1ZUpvbW1xcW0xYm5pZUtwcW1xcnV2cm11ZUpvbW1xcXV2cXVtaWFwcW1xcnV1NnVpNmFvcW1xcXV1NnNxNmJwcXFxcml1N3N1enJwcXFxcXV2S3Jpejd3cXE2cml2THNtM3J3ckNxcnV2S3NtemJ0bS9jdXE3cnZ1Lzd3cEd0NjdvdS9NSXhERWNCQU9BSkRnQkFCVGFzam5CU05CWllhTWhLQUNBREFJQXdCaUdERUVJR0lZU1FVa29ocFpRU0FBQXc0QUFBRUdCQ0dTZzBaRVVBRUNjQUFCaERLYVNVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpJS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLcWFTVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS1pWU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVa29wcFpSU1NpbWxsRkpLS2FXVVVrb3BwWlJTU2ltbGxGSktLYVdVVWtvcHBaUlNTaW1sbEZKS0thV1VVZ29Ba0lwd0FKQjZNS0VNRkJxeUVnQklCUUFBakZGS0tjYWNneEF4NWhoajBFa29LV0xNT2NZY2xKSlM1UnlFRUZKcExiZktPUWdocE5SU2JabHpVbHFMTWVZWU0rZWtwQlJielRtSFVsS0xzZWFhYSs2a3RGWnJyalhuV2xxck5kZWNjODI1dEJacnJqblhuSFBMTWRlY2M4NDU1eGh6empubm5IUE9CUURnTkRnQWdCN1lzRHJDU2RGWVlLRWhLd0dBVkFBQUFobWxHSFBPT2VnUVVvdzU1eHlFRUNLRkdIUE9PUWdoVkl3NTV4eDBFRUtvR0hQTU9RZ2hoSkE1NXh5RUVFSUlJWE1PT3VnZ2hCQkNCeDJFRUVJSW9aVE9RUWdoaEJCS0tDR0VFRUlJSVlRUU9nZ2hoQkJDQ0NHRUVFSUlJWVJTU2dnaGhCQkNDYUdVVUFBQVlJRURBRUNBRGFzam5CU05CUllhc2hJQUFBSUFnQnlXb0ZMT2hFR09RWThOUWNwUk13MUNURG5SbVdKT2FqTVZVNUE1RUoxMEVobHFRZGxlTWdzQUFJQWdBQ0RBQkJBWUlDajRRZ2lJTVFBQVFZak1FQW1GVmJEQW9Bd2FIT1lCd0FORWhFUUFrSmlnU0x1NGdDNERYTkRGWFFkQ0NFSVFnbGdjUUFFSk9EamhoaWZlOElRYm5LQlRWT29nQUFBQUFBQU1BT0FCQU9DZ0FDSWltcXV3dU1ESTBOamc2UEFJQUFBQUFBQVdBUGdBQURnK2dJaUk1aW9zTGpBeU5EWTRPandDQUFBQUFBQUFBQUNBZ0lBQUFBQUFBRUFBQUFDQWdFOW5aMU1BQkFFQUFBQUFBQUFBWGNYZUZ3SUFBQUJxMm5weEFnRUJBQW89JyxcbiAgZW1wdHlNcDMgPSAnLy9zUXhBQUR3QUFCcEFBQUFDQUFBRFNBQUFBRVRFRk5SVE11T1RrdU5WVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVlZWVT0nLFxuICBoaWdodGljayA9ICdVa2xHUmtRRkFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVNBRkFBQ3gveGYvZEFET0FDd0JzUDNwKzZIK3pBR29CT2tDQ3dCWC9FSDVPdnhsQTRrSjJ3Y1NBclQ5RS91dCtIVDJldlV4OThuNk9BRjVDQ1VNd1F2ZkNPc0p4QXgwRFNJTUVBcTlCaUFCM3ZoejdtTGtUOXNSMTMzWXhOMnM1UUx2MHZyVUJud1JueHVRSmVFc1NEQ2lNZDh5RlM4YUtGSWhvaFVzQ0tqNjR1NjI1T3JhQTlIdXlQbkVsY1Ard3h2Sld0VzI1NjM3VlEwakhQZ25CVERETTFvMEN6S0xLKzhoemhnRkRPejhTZTRKNDdEWVZ0RzB6NWZRcTlMQjEycmZBK2o5OXJvSEFoZWxJeU13SWpkVE91VThtandJT0dveGhDYjVFNTMvaiszazMvZlRZOHBUdzR5L1RyK2V3OERNdmRzazhSY0hSUmtTS080eUdUa0hQa1Uvcnp6eU5jZ3NyUjk0RHAvNXIrWnMxN3pPbmNvRHhoZkUzOFdMeW4vVGVPTWk5cjBJUnhsUktJUXp5VGxPUEtvOXlqbVdNY29rRFJMYy9ZN3J1ZHRkenUvRDJMMUl1KzI3SmNHM3lZclZMdWpsKzNVT1p4MVVLNVEwcXptTlBEazhaamVlTVBvanpoSCsvakx0UGQ1bTBoSExIc1lJdzVURU1NbkEwanZqOGZTT0Jpd1hBU1pnTXpNOGRVQkdRYkkrcnpqcEtrSVp5Z1pUOVFmbGNkYVJ5cVhDejcrVndVUEg3ODRyM0s3cyt2MEtEdThidnllTE1iNDNOanJoT0lvMGRTdlFIaTBQblA2aTdvdmczTlR4eTQvR2Y4WDh5SC9RQnR2WDU1UDJZZ2IwRmNVanN5NExObUk1ZWppWE0zOHI3aUM4Rkp3SFB2b2s3ZERnUWRhSnpsVEtJc29GenNyVmt1QTg3ZC82cUFpN0ZRMGg5Q2xLTUxFejNUT3JNQmNxWVNEOEU5QUZkL2RTNmtUZjZkYlUwWG5RdjlJSDJNWGZaK2xuOURFQUZ3d2RGeThnaWliNkthd3FlQ2hnSS9VYkhCT1RDWmovdnZYZTdJbmxGdUROM1AzYjBkMUY0Z3pwaWZHMit1NEQ3UXcxRmZ3Ym5DRCtJbGdqV3lITEhQTVZvZzJtQkwzN3F2UCs3TnZuWXVUdjRydmpmdWJONmszd3BQWjAvV2tFT3d0aUVVc1djeG0rR2w0YU9oaGlGREFQSXdtYkF0bjdUUFZ5Nzd6cWNlZnI1WUhtSHVsbDdlbnlmUG1jQUhnSGV3MVJFcjhWaGhkL0YrQVYxUkowRGlrSldRTmMvWlAzZWZLZDdodnMydXI0NnJIczV1OGU5Ti80OC8waEEvOEhGZ3d1RDA0UlNCSVJFcXNRT2c3bUNzc0dNQUpXL1huNEcvVEs4TGJ1enUwSTdxVHZuUEp5OXNYNmJQODRCTFlJYkF3ZEQ4NFFZeEc3RU9jT0RBeHdDRk1FQVFDOSs3UDNTdlRYOFhIdyt1OVI4S1R4SXZTbzkrWDdWUUNVQkowSU13emlEajRRTGhBR0Q5VU1yZ25UQlpjQlJ2MXYrWHYyVWZTKzh0ZngrdkVTODd6MCt2YjMrWmY5WmdFUUJTRUlVQXJXQzhrTTJReXpDNUVKRUFkdkJIZ0JYUDVuKytyNEF2ZDg5V2owN2ZNdzlEMzFKdmZwK1VqOXhRRDlBOFFHNVFoWENsRUxyQXN2Qzl3SjdnZDZCV0lDM3Y2Tys3VDRQUFpOOUVIeld2TmY5UHoxRnZpdCtxTDlyUUNIQXdFRy93ZUNDWlVLRnd2RENuSUpjQWNRQldjQ2FmOFovQ0Q1NXZhQjlkRDB3UFNQOVVMM20vazcvTXorSndFeUF3OEZ6QVk3Q0JzSmFRazVDV2tJMmdhdEJDSUNZZitqL0ZyNnZmaVY5ODcyc2ZaUDkxejRwL2xSKzNIOXpmODlBcm9FRkFmakNQMEpjd284Q2pBSmRRZGdCU0VEa2dEUS9WajdaZm5SOTVUMjhmVWQ5djMyVnZnMituYjgrLzZ4QVdvRTRBYkRDUDRKcEFxYkNxUUowd2VFQmZnQ1RBQ1QvUjM3TS9tKzk2NzJJUFk2OWdiM2FmaFcrdFQ4cWYrTUFqMEZnZ2N1Q1NjS1hBcmlDY01JRUFmeUJKWUNGd0NQL1J6N0EvbDc5M3oyRi9abjltSDM3ZmpkK2kzOXlmOXBBdDBFRkFmUkNOa0pHQXFyQ1pZSXZnWlBCSjhCNlA0Ly9NMzUwdmR6OXEvMWxmVXE5bXozUlBtaSszSCtiZ0ZWQk9RRzN3Z0hDa3dLMEFtN0NDQUhDZ1dtQWpBQScsXG4gIGxvd3RpY2sgPSAnVWtsR1JsUUZBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlUQUZBQUIwLzV2K1UvNFQvM2dBMHdGVEF1VUIrZjhkL25UOTBmMXEvdWIrdGY0Ni9tYi84d0ZRQTlnQzd3Q2QvbXIrRkFHUkEzY0U2d0pmL2gzNmV2bXYrOHYvTndSSEJaVUMyLzYwKy8vNUV2dVovYVgvYmdGT0FwOEF6dnpoOXdmekxQRjY4elQ0eS8yQkF5Z0lmUXdhRWpZWTB4MzFJcndsOFNPV0hWRVNPZ1BoOU5mcFJlRnQyMm5ZSGRkRDJCWGNaZURhNUlucWdQRHg5blArNmdTNENCWUxudzB6RVMwV1h4djRIa2NnTGgvMUcrRVgxUk5wRDR3S2lnWEgvNnI1L2ZOdTdsVHBqK1p1NWhIb1hPdEw3MWJ5ci9RcDkxTDY0djZPQk80Sm9RNXpFc2tVK2hVMUZpUVZlUlA3RVdnUDRRcjBCSVQrdFBpZDlDM3kxdkNoOEZEeEp2SzI4dnZ5eS9MQThwTHpVL1hQOTV2Nnh2dzQvdUQvUkFLMkJTa0tjZzZCRVNjVFpCTWVFcWtQVFF4akNLRUVWd0ZpL252N2gvaHA5YUR5QXZIUDhNZnhMdk0rOVBYMHVQVzE5Zy80TGZyNy9DNEFLZ05hQlhRR3l3YjBCaElIV1FmV0Ixb0l6QWp0Q0Y4SUh3ZHRCYWtEVndLTEFlWUE4djl3L2tqODEvblE5NHYyOS9YWDliejFiUFVZOVV6MVovYUgrSHI3eVA0TUFpNEYrd2NmQ25ZTE5neWZEUHNNU3cwc0RVQU1mZ3JjQjVJRU13RmIvaVg4VC9wVCtPLzFYL01mOGNidnJPKzE4TUx5dmZWUCtSZjl3Z0FvQkNFSHB3bklDNUVONFE1QUQzd08xQXkwQ3BzSXZ3YnZCTmNDYlFBci9uWDhPZnNmK3ZiNG12ZGE5cmoxei9XWDlwTDNhL2hIK1pYNlIvd24vdlAvZVFFU0EvQUUrd1lEQ2N3S0ZBeVBEQ2tNRlF1U0NlNEhWUWJTQkhRREN3SThBTkw5SlB1WStIWDI4dlRxODJQemRQTVY5QXoxTWZaNDl6RDVnZnR4L3NRQkJRWExCOGNKL2dxcEN3OE1pZ3dXRFhFTlhRMnJERFVMN1FnREJzd0NkdjhTL0s3NFdQVms4aFh3b3U0UDdtdnUxKzlUOHB6MVV2bGkvWm9Cd2dXUkNjc01QZy9DRUVRUjRSREFEd29POXd1c0NWTUg0QVJTQXBuL3VmemQrV2ozYnZYNzh4enp4L0w2OHF6ejF2U0Q5cVg0R2Z2ZC9jMEFod08vQld3SG1naHZDUUVLVlFvbkNsc0pDd2lJQmgwRjBnT2dBbTBCT3dBeC8wMytYUDBnL0xiNmNQbVgrRi80dmZoKytUSDZzL29zKzcvN2N2d0wvWno5WFA1Ty8zSUEzQUY5QXpzRjlnYVVDQUFLSGd1ZUN6Y0w5d250QjNzRjR3SXpBSTM5NmZwMStHdjJJdlduOU4zMHAvWGk5bTc0Ry9ydSs5UDlrLzhhQVlFQzFBTVRCU0lHMHdZdUIxZ0hrZ2NBQ0dFSVNBaFRCekVGV0FLdC81TDkyZnVVK3ZYNTBmbWYrU1A1aS9nYitCZjRtdml2K1NyN2t2eWIvVWorci80WC84ci8rZ0NpQW8wRVVBYVJCendJU3dqcUIzSUhHUWZDQnY4RnBnVE1BcFFBS2Y2Nys1bjUvdmZuOWp6MnlQVm45U0wxUlBYcTlTUDNEdm1yKzZmK3NRR0tCQWNIK3doT0NoMExhd3MzQzI4S0xBbURCNUFGZlFOb0FWUC9adjNlKzdQNnNmbkwrQ3Y0dlBlTTk1YjM3ZmVWK0puNTFQb3EvTEw5bXYrWUFWWUQzZ1F1Qm1jSFNBaWtDSUVJN0FmK0J1RUZuZ1FYQTFzQnYvOXYvcGY5TVAzVy9GajhxL3NSKzZINlUvbzMrbVA2eS9wTisvZjd4dnllL1dIK0pmOW1BRDRDUUFRSkJpc0h0Z2Y2QncwSThRZHNCMXNHeXdUNEFnZ0JDUC9vL0tYNm1QZzE5NTcyamZhejl1ZjJTL2NNK0UzNUUvdFcvYWYvNXdIMUE4QUZLZ2ZrQi9BSGd3ZnhCbEFHZ1FWSUJNTUNKd0dzLzQzK3ZQMGkvWnI4TGZ6bCs5SDc2ZnZpKzlmNzVmc2YvSW44QlAxMC9lajljZjRPLzdmL2RBQWNBYVVCRWdLTUFoZ0RwQU1FQkNFRUR3VGZBM0lEeFFMOEFTb0JVd0NHLzg3K0ovNmgvUnI5cFB4ay9HYjhvUHdKL1hIOXcvMzkvVUQrcVA0MS85RC9Xd0RlQUdzQkFnS2RBaEVEUVFOQUEwc0Rid09WQTVZRFZ3UE9BaGdDVkFHUkFBPT0nO1xuXG5cbmZ1bmN0aW9uIGluaXRBdWRpbyhjdHgpe1xuICBjb250ZXh0ID0gY3R4O1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBjb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTtcbiAgICBkYXRhLmNvbnRleHQgPSBjb250ZXh0O1xuXG4gICAgaWYoY29udGV4dC5jcmVhdGVHYWluTm9kZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUgPSBjb250ZXh0LmNyZWF0ZUdhaW47XG4gICAgfVxuICAgIC8vIGNoZWNrIGZvciBvbGRlciBpbXBsZW1lbnRhdGlvbnMgb2YgV2ViQXVkaW9cbiAgICBzb3VyY2UgPSBjb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuICAgIGRhdGEubGVnYWN5ID0gZmFsc2U7XG4gICAgaWYoc291cmNlLnN0YXJ0ID09PSB1bmRlZmluZWQpe1xuICAgICAgZGF0YS5sZWdhY3kgPSB0cnVlO1xuICAgIH1cblxuICAgIC8vIHNldCB1cCB0aGUgZWxlbWVudGFyeSBhdWRpbyBub2Rlc1xuICAgIGNvbXByZXNzb3IgPSBjb250ZXh0LmNyZWF0ZUR5bmFtaWNzQ29tcHJlc3NvcigpO1xuICAgIGNvbXByZXNzb3IuY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKTtcbiAgICBnYWluTm9kZSA9IGNvbnRleHQuY3JlYXRlR2Fpbk5vZGUoKTtcbiAgICBnYWluTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICAgIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSAxO1xuXG4gICAgZGF0YS5tYXN0ZXJHYWluTm9kZSA9IGdhaW5Ob2RlO1xuICAgIGRhdGEubWFzdGVyQ29tcHJlc3NvciA9IGNvbXByZXNzb3I7XG5cbiAgICBwYXJzZVNhbXBsZXMoe1xuICAgICAgJ29nZyc6IGVtcHR5T2dnLFxuICAgICAgJ21wMyc6IGVtcHR5TXAzLFxuICAgICAgJ2xvd3RpY2snOiBsb3d0aWNrLFxuICAgICAgJ2hpZ2h0aWNrJzogaGlnaHRpY2tcbiAgICB9KS50aGVuKFxuICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQoYnVmZmVycyl7XG4gICAgICAgIGRhdGEub2dnID0gYnVmZmVycy5vZ2cgIT09IHVuZGVmaW5lZDtcbiAgICAgICAgZGF0YS5tcDMgPSBidWZmZXJzLm1wMyAhPT0gdW5kZWZpbmVkO1xuICAgICAgICBkYXRhLmxvd3RpY2sgPSBidWZmZXJzLmxvd3RpY2s7XG4gICAgICAgIGRhdGEuaGlnaHRpY2sgPSBidWZmZXJzLmhpZ2h0aWNrO1xuICAgICAgICBpZihkYXRhLm9nZyA9PT0gZmFsc2UgJiYgZGF0YS5tcDMgPT09IGZhbHNlKXtcbiAgICAgICAgICByZWplY3QoJ05vIHN1cHBvcnQgZm9yIG9nZyBub3IgbXAzIScpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZCgpe1xuICAgICAgICByZWplY3QoJ1NvbWV0aGluZyB3ZW50IHdyb25nIHdoaWxlIGluaXRpYWxpemluZyBBdWRpbycpO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufVxuXG5cbmRhdGEuc2V0TWFzdGVyVm9sdW1lID0gZnVuY3Rpb24odmFsdWUgPSAwLjUpe1xuICBpZih2YWx1ZSA+IDEpe1xuICAgIGluZm8oJ21heGltYWwgdm9sdW1lIGlzIDEuMCwgdm9sdW1lIGlzIHNldCB0byAxLjAnKTtcbiAgfVxuICB2YWx1ZSA9IHZhbHVlIDwgMCA/IDAgOiB2YWx1ZSA+IDEgPyAxIDogdmFsdWU7XG4gIGdhaW5Ob2RlLmdhaW4udmFsdWUgPSB2YWx1ZTtcbn07XG5cblxuZGF0YS5nZXRNYXN0ZXJWb2x1bWUgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gZ2Fpbk5vZGUuZ2Fpbi52YWx1ZTtcbn07XG5cblxuZGF0YS5nZXRDb21wcmVzc2lvblJlZHVjdGlvbiA9IGZ1bmN0aW9uKCl7XG4gIC8vY29uc29sZS5sb2coY29tcHJlc3Nvcik7XG4gIHJldHVybiBjb21wcmVzc29yLnJlZHVjdGlvbi52YWx1ZTtcbn07XG5cblxuZGF0YS5lbmFibGVNYXN0ZXJDb21wcmVzc29yID0gZnVuY3Rpb24oZmxhZyl7XG4gIGlmKGZsYWcpe1xuICAgIGdhaW5Ob2RlLmRpc2Nvbm5lY3QoMCk7XG4gICAgZ2Fpbk5vZGUuY29ubmVjdChjb21wcmVzc29yKTtcbiAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgY29tcHJlc3Nvci5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICB9ZWxzZXtcbiAgICBjb21wcmVzc29yLmRpc2Nvbm5lY3QoMCk7XG4gICAgZ2Fpbk5vZGUuZGlzY29ubmVjdCgwKTtcbiAgICBnYWluTm9kZS5jb25uZWN0KGNvbnRleHQuZGVzdGluYXRpb24pO1xuICB9XG59O1xuXG5cbmRhdGEuY29uZmlndXJlTWFzdGVyQ29tcHJlc3NvciA9IGZ1bmN0aW9uKGNmZyl7XG4gIC8qXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSB0aHJlc2hvbGQ7IC8vIGluIERlY2liZWxzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSBrbmVlOyAvLyBpbiBEZWNpYmVsc1xuICAgICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmF0aW87IC8vIHVuaXQtbGVzc1xuICAgICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gcmVkdWN0aW9uOyAvLyBpbiBEZWNpYmVsc1xuICAgICAgcmVhZG9ubHkgYXR0cmlidXRlIEF1ZGlvUGFyYW0gYXR0YWNrOyAvLyBpbiBTZWNvbmRzXG4gICAgICByZWFkb25seSBhdHRyaWJ1dGUgQXVkaW9QYXJhbSByZWxlYXNlOyAvLyBpbiBTZWNvbmRzXG4gICovXG4gIGxldCBpLCBwYXJhbTtcbiAgZm9yKGkgPSBjb21wcmVzc29yUGFyYW1zLmxlbmd0aDsgaSA+PSAwOyBpLS0pe1xuICAgICAgcGFyYW0gPSBjb21wcmVzc29yUGFyYW1zW2ldO1xuICAgICAgaWYoY2ZnW3BhcmFtXSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICBjb21wcmVzc29yW3BhcmFtXS52YWx1ZSA9IGNmZ1twYXJhbV07XG4gICAgICB9XG4gIH1cbn07XG5cblxuZGF0YS5nZXRBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpe1xuICByZXR1cm4gY29udGV4dDtcbn07XG5cblxuZGF0YS5nZXRUaW1lID0gZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGNvbnRleHQuY3VycmVudFRpbWU7XG59O1xuXG5cbmV4cG9ydCBkZWZhdWx0IGluaXRBdWRpbztcblxuXG4iLCIvKlxuICBSZXF1ZXN0cyBNSURJIGFjY2VzcywgcXVlcmllcyBhbGwgaW5wdXRzIGFuZCBvdXRwdXRzIGFuZCBzdG9yZXMgdGhlbSBpbiBhbHBoYWJldGljYWwgb3JkZXJcbiovXG5cbid1c2Ugc3RyaWN0JztcblxuXG5pbXBvcnQge2xvZywgaW5mbywgd2FybiwgZXJyb3IsIHR5cGVTdHJpbmd9IGZyb20gJy4vdXRpbCc7XG5pbXBvcnQgTWlkaUV2ZW50IGZyb20gJy4vbWlkaV9ldmVudCc7XG5cblxubGV0IGRhdGEgPSB7fTtcbmxldCBpbnB1dHMgPSBuZXcgTWFwKCk7XG5sZXQgb3V0cHV0cyA9IG5ldyBNYXAoKTtcblxubGV0IHNvbmdNaWRpRXZlbnRMaXN0ZW5lcjtcbmxldCBtaWRpRXZlbnRMaXN0ZW5lcklkID0gMDtcblxuZnVuY3Rpb24gaW5pdE1pZGkoKXtcblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIGxldCB0bXA7XG5cbiAgICBpZihuYXZpZ2F0b3IucmVxdWVzdE1JRElBY2Nlc3MgIT09IHVuZGVmaW5lZCl7XG5cbiAgICAgIG5hdmlnYXRvci5yZXF1ZXN0TUlESUFjY2VzcygpLnRoZW4oXG5cbiAgICAgICAgZnVuY3Rpb24gb25GdWxGaWxsZWQobWlkaSl7XG4gICAgICAgICAgaWYobWlkaS5famF6ekluc3RhbmNlcyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIGRhdGEuamF6eiA9IG1pZGkuX2phenpJbnN0YW5jZXNbMF0uX0phenoudmVyc2lvbjtcbiAgICAgICAgICAgIGRhdGEubWlkaSA9IHRydWU7XG4gICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICBkYXRhLndlYm1pZGkgPSB0cnVlO1xuICAgICAgICAgICAgZGF0YS5taWRpID0gdHJ1ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBvbGQgaW1wbGVtZW50YXRpb24gb2YgV2ViTUlESVxuICAgICAgICAgIGlmKHR5cGVvZiBtaWRpLmlucHV0cy52YWx1ZXMgIT09ICdmdW5jdGlvbicpe1xuICAgICAgICAgICAgcmVqZWN0KCdZb3UgYnJvd3NlciBpcyB1c2luZyBhbiBvbGQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFdlYk1JREkgQVBJLCBwbGVhc2UgdXBkYXRlIHlvdXIgYnJvd3Nlci4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cblxuICAgICAgICAgIC8vIGdldCBpbnB1dHNcbiAgICAgICAgICB0bXAgPSBBcnJheS5mcm9tKG1pZGkuaW5wdXRzLnZhbHVlcygpKTtcblxuICAgICAgICAgIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICAgICAgICAgIHRtcC5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSk7XG5cbiAgICAgICAgICBmb3IobGV0IHBvcnQgb2YgdG1wKXtcbiAgICAgICAgICAgIGlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gICAgICAgICAgfVxuXG5cbiAgICAgICAgICAvLyBnZXQgb3V0cHV0c1xuICAgICAgICAgIHRtcCA9IEFycmF5LmZyb20obWlkaS5vdXRwdXRzLnZhbHVlcygpKTtcblxuICAgICAgICAgIC8vc29ydCBwb3J0cyBieSBuYW1lIGFzY2VuZGluZ1xuICAgICAgICAgIHRtcC5zb3J0KChhLCBiKSA9PiBhLm5hbWUudG9Mb3dlckNhc2UoKSA8PSBiLm5hbWUudG9Mb3dlckNhc2UoKSA/IDEgOiAtMSk7XG5cbiAgICAgICAgICBmb3IobGV0IHBvcnQgb2YgdG1wKXtcbiAgICAgICAgICAgIG91dHB1dHMuc2V0KHBvcnQuaWQsIHBvcnQpO1xuICAgICAgICAgIH1cblxuXG4gICAgICAgICAgLy8gb25jb25uZWN0IGFuZCBvbmRpc2Nvbm5lY3QgYXJlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgaW4gQ2hyb21lIGFuZCBDaHJvbWl1bVxuICAgICAgICAgIG1pZGkuYWRkRXZlbnRMaXN0ZW5lcignb25jb25uZWN0JywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgICBsb2coJ2RldmljZSBjb25uZWN0ZWQnLCBlKTtcbiAgICAgICAgICB9LCBmYWxzZSk7XG5cbiAgICAgICAgICBtaWRpLmFkZEV2ZW50TGlzdGVuZXIoJ29uZGlzY29ubmVjdCcsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgICAgbG9nKCdkZXZpY2UgZGlzY29ubmVjdGVkJywgZSk7XG4gICAgICAgICAgfSwgZmFsc2UpO1xuXG5cbiAgICAgICAgICAvLyBleHBvcnRcbiAgICAgICAgICBkYXRhLmlucHV0cyA9IGlucHV0cztcbiAgICAgICAgICBkYXRhLm91dHB1dHMgPSBvdXRwdXRzO1xuXG4gICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSxcblxuICAgICAgICBmdW5jdGlvbiBvblJlamVjdChlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKGUpO1xuICAgICAgICAgIHJlamVjdCgnU29tZXRoaW5nIHdlbnQgd3Jvbmcgd2hpbGUgcmVxdWVzdGluZyBNSURJQWNjZXNzJyk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgLy8gYnJvd3NlcnMgd2l0aG91dCBXZWJNSURJIEFQSVxuICAgIH1lbHNle1xuICAgICAgZGF0YS5taWRpID0gZmFsc2U7XG4gICAgICByZXNvbHZlKGRhdGEpO1xuICAgIH1cbiAgfSk7XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1pZGlTb25nKHNvbmcpe1xuXG4gIHNvbmdNaWRpRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGUpe1xuICAgIC8vY29uc29sZS5sb2coZSk7XG4gICAgaGFuZGxlTWlkaU1lc3NhZ2VTb25nKHNvbmcsIGUsIHRoaXMpO1xuICB9O1xuXG4gIC8vIGJ5IGRlZmF1bHQgYSBzb25nIGxpc3RlbnMgdG8gYWxsIGF2YWlsYWJsZSBtaWRpLWluIHBvcnRzXG4gIGlucHV0cy5mb3JFYWNoKGZ1bmN0aW9uKHBvcnQpe1xuICAgIHBvcnQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICAgIHNvbmcubWlkaUlucHV0cy5zZXQocG9ydC5pZCwgcG9ydCk7XG4gIH0pO1xuXG4gIG91dHB1dHMuZm9yRWFjaChmdW5jdGlvbihwb3J0KXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChwb3J0LmlkLCBwb3J0KTtcbiAgfSk7XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWlkaUlucHV0U29uZyhzb25nLCBpZCwgZmxhZyl7XG4gIGxldCBpbnB1dCA9IGlucHV0cy5nZXQoaWQpO1xuXG4gIGlmKGlucHV0ID09PSB1bmRlZmluZWQpe1xuICAgIHdhcm4oJ25vIG1pZGkgaW5wdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpSW5wdXRzLmRlbGV0ZShpZCk7XG4gICAgaW5wdXQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlJbnB1dHMuc2V0KGlkLCBpbnB1dCk7XG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcignbWlkaW1lc3NhZ2UnLCBzb25nTWlkaUV2ZW50TGlzdGVuZXIpO1xuICB9XG5cbiAgbGV0IHRyYWNrcyA9IHNvbmcudHJhY2tzO1xuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcyl7XG4gICAgdHJhY2suc2V0TWlkaUlucHV0KGlkLCBmbGFnKTtcbiAgfVxufVxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNldE1pZGlPdXRwdXRTb25nKHNvbmcsIGlkLCBmbGFnKXtcbiAgbGV0IG91dHB1dCA9IG91dHB1dHMuZ2V0KGlkKTtcblxuICBpZihvdXRwdXQgPT09IHVuZGVmaW5lZCl7XG4gICAgd2Fybignbm8gbWlkaSBvdXRwdXQgd2l0aCBpZCcsIGlkLCAnZm91bmQnKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZihmbGFnID09PSBmYWxzZSl7XG4gICAgc29uZy5taWRpT3V0cHV0cy5kZWxldGUoaWQpO1xuICAgIGxldCB0aW1lID0gc29uZy5zY2hlZHVsZXIubGFzdEV2ZW50VGltZSArIDEwMDtcbiAgICBvdXRwdXQuc2VuZChbMHhCMCwgMHg3QiwgMHgwMF0sIHRpbWUpOyAvLyBzdG9wIGFsbCBub3Rlc1xuICAgIG91dHB1dC5zZW5kKFsweEIwLCAweDc5LCAweDAwXSwgdGltZSk7IC8vIHJlc2V0IGFsbCBjb250cm9sbGVyc1xuICB9ZWxzZXtcbiAgICBzb25nLm1pZGlPdXRwdXRzLnNldChpZCwgb3V0cHV0KTtcbiAgfVxuXG4gIGxldCB0cmFja3MgPSBzb25nLnRyYWNrcztcbiAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgIHRyYWNrLnNldE1pZGlPdXRwdXQoaWQsIGZsYWcpO1xuICB9XG59XG5cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVNvbmcoc29uZywgbWlkaU1lc3NhZ2VFdmVudCwgaW5wdXQpe1xuICBsZXQgbWlkaUV2ZW50ID0gbmV3IE1pZGlFdmVudChzb25nLnRpY2tzLCAuLi5taWRpTWVzc2FnZUV2ZW50LmRhdGEpO1xuXG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudC5kYXRhKTtcblxuICBsZXQgdHJhY2tzID0gc29uZy50cmFja3M7XG4gIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAvL2NvbnNvbGUubG9nKHRyYWNrLm1pZGlJbnB1dHMsIGlucHV0KTtcbiAgICAvKlxuICAgIGlmKG1pZGlFdmVudC5jaGFubmVsID09PSB0cmFjay5jaGFubmVsIHx8IHRyYWNrLmNoYW5uZWwgPT09IDAgfHwgdHJhY2suY2hhbm5lbCA9PT0gJ2FueScpe1xuICAgICAgaGFuZGxlTWlkaU1lc3NhZ2VUcmFjayhtaWRpRXZlbnQsIHRyYWNrKTtcbiAgICB9XG4gICAgKi9cbiAgICAvLyBsaWtlIGluIEN1YmFzZSwgbWlkaSBldmVudHMgZnJvbSBhbGwgZGV2aWNlcywgc2VudCBvbiBhbnkgbWlkaSBjaGFubmVsIGFyZSBmb3J3YXJkZWQgdG8gYWxsIHRyYWNrc1xuICAgIC8vIHNldCB0cmFjay5tb25pdG9yIHRvIGZhbHNlIGlmIHlvdSBkb24ndCB3YW50IHRvIHJlY2VpdmUgbWlkaSBldmVudHMgb24gYSBjZXJ0YWluIHRyYWNrXG4gICAgLy8gbm90ZSB0aGF0IHRyYWNrLm1vbml0b3IgaXMgYnkgZGVmYXVsdCBzZXQgdG8gZmFsc2UgYW5kIHRoYXQgdHJhY2subW9uaXRvciBpcyBhdXRvbWF0aWNhbGx5IHNldCB0byB0cnVlXG4gICAgLy8gaWYgeW91IGFyZSByZWNvcmRpbmcgb24gdGhhdCB0cmFja1xuICAgIC8vY29uc29sZS5sb2codHJhY2subW9uaXRvciwgdHJhY2suaWQsIGlucHV0LmlkKTtcbiAgICBpZih0cmFjay5tb25pdG9yID09PSB0cnVlICYmIHRyYWNrLm1pZGlJbnB1dHMuZ2V0KGlucHV0LmlkKSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIGhhbmRsZU1pZGlNZXNzYWdlVHJhY2sobWlkaUV2ZW50LCB0cmFjaywgaW5wdXQpO1xuICAgIH1cbiAgfVxuXG4gIGxldCBsaXN0ZW5lcnMgPSBzb25nLm1pZGlFdmVudExpc3RlbmVycy5nZXQobWlkaUV2ZW50LnR5cGUpO1xuICBpZihsaXN0ZW5lcnMgIT09IHVuZGVmaW5lZCl7XG4gICAgZm9yKGxldCBsaXN0ZW5lciBvZiBsaXN0ZW5lcnMpe1xuICAgICAgbGlzdGVuZXIobWlkaUV2ZW50LCBpbnB1dCk7XG4gICAgfVxuICB9XG59XG5cblxuXG5mdW5jdGlvbiBoYW5kbGVNaWRpTWVzc2FnZVRyYWNrKHRyYWNrLCBtaWRpRXZlbnQsIGlucHV0KXtcbiAgbGV0IHNvbmcgPSB0cmFjay5zb25nLFxuICAgIG5vdGUsIGxpc3RlbmVycywgY2hhbm5lbDtcbiAgICAvL2RhdGEgPSBtaWRpTWVzc2FnZUV2ZW50LmRhdGEsXG4gICAgLy9taWRpRXZlbnQgPSBjcmVhdGVNaWRpRXZlbnQoc29uZy50aWNrcywgZGF0YVswXSwgZGF0YVsxXSwgZGF0YVsyXSk7XG5cbiAgLy9taWRpRXZlbnQuc291cmNlID0gbWlkaU1lc3NhZ2VFdmVudC5zcmNFbGVtZW50Lm5hbWU7XG4gIC8vY29uc29sZS5sb2cobWlkaU1lc3NhZ2VFdmVudClcbiAgLy9jb25zb2xlLmxvZygnLS0tLT4nLCBtaWRpRXZlbnQudHlwZSk7XG5cbiAgLy8gYWRkIHRoZSBleGFjdCB0aW1lIG9mIHRoaXMgZXZlbnQgc28gd2UgY2FuIGNhbGN1bGF0ZSBpdHMgdGlja3MgcG9zaXRpb25cbiAgbWlkaUV2ZW50LnJlY29yZE1pbGxpcyA9IGNvbnRleHQuY3VycmVudFRpbWUgKiAxMDAwOyAvLyBtaWxsaXNcbiAgbWlkaUV2ZW50LnN0YXRlID0gJ3JlY29yZGVkJztcblxuICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICBub3RlID0gY3JlYXRlTWlkaU5vdGUobWlkaUV2ZW50KTtcbiAgICB0cmFjay5yZWNvcmRpbmdOb3Rlc1ttaWRpRXZlbnQuZGF0YTFdID0gbm90ZTtcbiAgICAvL3RyYWNrLnNvbmcucmVjb3JkaW5nTm90ZXNbbm90ZS5pZF0gPSBub3RlO1xuICB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTI4KXtcbiAgICBub3RlID0gdHJhY2sucmVjb3JkaW5nTm90ZXNbbWlkaUV2ZW50LmRhdGExXTtcbiAgICAvLyBjaGVjayBpZiB0aGUgbm90ZSBleGlzdHM6IGlmIHRoZSB1c2VyIHBsYXlzIG5vdGVzIG9uIGhlciBrZXlib2FyZCBiZWZvcmUgdGhlIG1pZGkgc3lzdGVtIGhhc1xuICAgIC8vIGJlZW4gZnVsbHkgaW5pdGlhbGl6ZWQsIGl0IGNhbiBoYXBwZW4gdGhhdCB0aGUgZmlyc3QgaW5jb21pbmcgbWlkaSBldmVudCBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgaWYobm90ZSA9PT0gdW5kZWZpbmVkKXtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbm90ZS5hZGROb3RlT2ZmKG1pZGlFdmVudCk7XG4gICAgZGVsZXRlIHRyYWNrLnJlY29yZGluZ05vdGVzW21pZGlFdmVudC5kYXRhMV07XG4gICAgLy9kZWxldGUgdHJhY2suc29uZy5yZWNvcmRpbmdOb3Rlc1tub3RlLmlkXTtcbiAgfVxuXG4gIC8vY29uc29sZS5sb2coc29uZy5wcmVyb2xsLCBzb25nLnJlY29yZGluZywgdHJhY2sucmVjb3JkRW5hYmxlZCk7XG5cbiAgaWYoKHNvbmcucHJlcm9sbGluZyB8fCBzb25nLnJlY29yZGluZykgJiYgdHJhY2sucmVjb3JkRW5hYmxlZCA9PT0gJ21pZGknKXtcbiAgICBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgIHRyYWNrLnNvbmcucmVjb3JkZWROb3Rlcy5wdXNoKG5vdGUpO1xuICAgIH1cbiAgICB0cmFjay5yZWNvcmRQYXJ0LmFkZEV2ZW50KG1pZGlFdmVudCk7XG4gICAgLy8gc29uZy5yZWNvcmRlZEV2ZW50cyBpcyB1c2VkIGluIHRoZSBrZXkgZWRpdG9yXG4gICAgdHJhY2suc29uZy5yZWNvcmRlZEV2ZW50cy5wdXNoKG1pZGlFdmVudCk7XG4gIH1lbHNlIGlmKHRyYWNrLmVuYWJsZVJldHJvc3BlY3RpdmVSZWNvcmRpbmcpe1xuICAgIHRyYWNrLnJldHJvc3BlY3RpdmVSZWNvcmRpbmcucHVzaChtaWRpRXZlbnQpO1xuICB9XG5cbiAgLy8gY2FsbCBhbGwgbWlkaSBldmVudCBsaXN0ZW5lcnNcbiAgbGlzdGVuZXJzID0gdHJhY2subWlkaUV2ZW50TGlzdGVuZXJzW21pZGlFdmVudC50eXBlXTtcbiAgaWYobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpe1xuICAgIG9iamVjdEZvckVhY2gobGlzdGVuZXJzLCBmdW5jdGlvbihsaXN0ZW5lcil7XG4gICAgICBsaXN0ZW5lcihtaWRpRXZlbnQsIGlucHV0KTtcbiAgICB9KTtcbiAgfVxuXG4gIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICBpZihjaGFubmVsID09PSAnYW55JyB8fCBjaGFubmVsID09PSB1bmRlZmluZWQgfHwgaXNOYU4oY2hhbm5lbCkgPT09IHRydWUpe1xuICAgIGNoYW5uZWwgPSAwO1xuICB9XG5cbiAgb2JqZWN0Rm9yRWFjaCh0cmFjay5taWRpT3V0cHV0cywgZnVuY3Rpb24ob3V0cHV0KXtcbiAgICAvL2NvbnNvbGUubG9nKCdtaWRpIG91dCcsIG91dHB1dCwgbWlkaUV2ZW50LnR5cGUpO1xuICAgIGlmKG1pZGlFdmVudC50eXBlID09PSAxMjggfHwgbWlkaUV2ZW50LnR5cGUgPT09IDE0NCB8fCBtaWRpRXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgIC8vY29uc29sZS5sb2cobWlkaUV2ZW50LnR5cGUsIG1pZGlFdmVudC5kYXRhMSwgbWlkaUV2ZW50LmRhdGEyKTtcbiAgICAgIG91dHB1dC5zZW5kKFttaWRpRXZlbnQudHlwZSwgbWlkaUV2ZW50LmRhdGExLCBtaWRpRXZlbnQuZGF0YTJdKTtcbiAgICAvLyB9ZWxzZSBpZihtaWRpRXZlbnQudHlwZSA9PT0gMTkyKXtcbiAgICAvLyAgICAgb3V0cHV0LnNlbmQoW21pZGlFdmVudC50eXBlICsgY2hhbm5lbCwgbWlkaUV2ZW50LmRhdGExXSk7XG4gICAgfVxuICAgIC8vb3V0cHV0LnNlbmQoW21pZGlFdmVudC5zdGF0dXMgKyBjaGFubmVsLCBtaWRpRXZlbnQuZGF0YTEsIG1pZGlFdmVudC5kYXRhMl0pO1xuICB9KTtcblxuICAvLyBAVE9ETzogbWF5YmUgYSB0cmFjayBzaG91bGQgYmUgYWJsZSB0byBzZW5kIGl0cyBldmVudCB0byBib3RoIGEgbWlkaS1vdXQgcG9ydCBhbmQgYW4gaW50ZXJuYWwgaGVhcnRiZWF0IHNvbmc/XG4gIC8vY29uc29sZS5sb2codHJhY2sucm91dGVUb01pZGlPdXQpO1xuICBpZih0cmFjay5yb3V0ZVRvTWlkaU91dCA9PT0gZmFsc2Upe1xuICAgIG1pZGlFdmVudC50cmFjayA9IHRyYWNrO1xuICAgIHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KG1pZGlFdmVudCk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXsgLy8gY2FsbGVyIGNhbiBiZSBhIHRyYWNrIG9yIGEgc29uZ1xuXG4gIGxldCBpZCA9IG1pZGlFdmVudExpc3RlbmVySWQrKztcbiAgbGV0IGxpc3RlbmVyO1xuICAgIHR5cGVzID0ge30sXG4gICAgaWRzID0gW10sXG4gICAgbG9vcDtcblxuXG4gIC8vIHNob3VsZCBJIGlubGluZSB0aGlzP1xuICBsb29wID0gZnVuY3Rpb24oYXJncyl7XG4gICAgZm9yKGxldCBhcmcgb2YgYXJncyl7XG4gICAgICBsZXQgdHlwZSA9IHR5cGVTdHJpbmcoYXJnKTtcbiAgICAgIC8vY29uc29sZS5sb2codHlwZSk7XG4gICAgICBpZih0eXBlID09PSAnYXJyYXknKXtcbiAgICAgICAgbG9vcChhcmcpO1xuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2Z1bmN0aW9uJyl7XG4gICAgICAgIGxpc3RlbmVyID0gYXJnO1xuICAgICAgfWVsc2UgaWYoaXNOYU4oYXJnKSA9PT0gZmFsc2Upe1xuICAgICAgICBhcmcgPSBwYXJzZUludChhcmcsIDEwKTtcbiAgICAgICAgaWYoc2VxdWVuY2VyLmNoZWNrRXZlbnRUeXBlKGFyZykgIT09IGZhbHNlKXtcbiAgICAgICAgICB0eXBlc1thcmddID0gYXJnO1xuICAgICAgICB9XG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgIGlmKHNlcXVlbmNlci5jaGVja0V2ZW50VHlwZShhcmcpICE9PSBmYWxzZSl7XG4gICAgICAgICAgYXJnID0gc2VxdWVuY2VyLm1pZGlFdmVudE51bWJlckJ5TmFtZShhcmcpO1xuICAgICAgICAgIHR5cGVzW2FyZ10gPSBhcmc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgbG9vcChhcmdzLCAwLCBhcmdzLmxlbmd0aCk7XG4gIC8vY29uc29sZS5sb2coJ3R5cGVzJywgdHlwZXMsICdsaXN0ZW5lcicsIGxpc3RlbmVyKTtcblxuICBvYmplY3RGb3JFYWNoKHR5cGVzLCBmdW5jdGlvbih0eXBlKXtcbiAgICAvL2NvbnNvbGUubG9nKHR5cGUpO1xuICAgIGlmKG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV0gPT09IHVuZGVmaW5lZCl7XG4gICAgICBvYmoubWlkaUV2ZW50TGlzdGVuZXJzW3R5cGVdID0ge307XG4gICAgfVxuICAgIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdID0gbGlzdGVuZXI7XG4gICAgaWRzLnB1c2godHlwZSArICdfJyArIGlkKTtcbiAgfSk7XG5cbiAgLy9jb25zb2xlLmxvZyhvYmoubWlkaUV2ZW50TGlzdGVuZXJzKTtcbiAgcmV0dXJuIGlkcy5sZW5ndGggPT09IDEgPyBpZHNbMF0gOiBpZHM7XG59XG5cblxuZnVuY3Rpb24gcmVtb3ZlTWlkaUV2ZW50TGlzdGVuZXIoaWQsIG9iail7XG4gIHZhciB0eXBlO1xuICBpZCA9IGlkLnNwbGl0KCdfJyk7XG4gIHR5cGUgPSBpZFswXTtcbiAgaWQgPSBpZFsxXTtcbiAgZGVsZXRlIG9iai5taWRpRXZlbnRMaXN0ZW5lcnNbdHlwZV1baWRdO1xufVxuXG5cbmZ1bmN0aW9uIHJlbW92ZU1pZGlFdmVudExpc3RlbmVycygpe1xuXG59XG5cblxuXG5leHBvcnQgZGVmYXVsdCBpbml0TWlkaTsiLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7bG9nLCBpbmZvLCB3YXJuLCBlcnJvcn0gZnJvbSAnLi91dGlsJztcbmltcG9ydCB7Z2V0Tm90ZU51bWJlcn0gZnJvbSAnLi9ub3RlJztcbmltcG9ydCBjcmVhdGVTYW1wbGUgZnJvbSAnLi9zYW1wbGUnO1xuXG5leHBvcnQgY2xhc3MgSW5zdHJ1bWVudHtcblxuICBjb25zdHJ1Y3Rvcigpe1xuICAgIHRoaXMuc2FtcGxlc0RhdGEgPSBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB0aGlzLnNhbXBsZXNEYXRhID0gdGhpcy5zYW1wbGVzRGF0YS5tYXAoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBuZXcgQXJyYXkoMTI4KS5maWxsKC0xKTtcbiAgICB9KTtcbiAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBwcm9jZXNzRXZlbnQoZXZlbnQpe1xuICAgIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAvLyBzdG9wIHNhbXBsZVxuICAgICAgaWYoZXZlbnQubWlkaU5vdGUgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGxldCBpZCA9IGV2ZW50Lm1pZGlOb3RlLmlkO1xuICAgICAgbGV0IHNhbXBsZSA9IHRoaXMuc2NoZWR1bGVkU2FtcGxlcy5nZXQoaWQpO1xuICAgICAgc2FtcGxlLnN0b3AoZXZlbnQudGltZSwgKCkgPT4gdGhpcy5zY2hlZHVsZWRTYW1wbGVzLmRlbGV0ZShpZCkpO1xuICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE0NCl7XG4gICAgICAvLyBzdGFydCBzYW1wbGVcbiAgICAgIGlmKGV2ZW50Lm1pZGlOb3RlID09PSB1bmRlZmluZWQpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBsZXQgc2FtcGxlRGF0YSA9IHRoaXMuc2FtcGxlc0RhdGFbZXZlbnQubm90ZU51bWJlcl1bZXZlbnQudmVsb2NpdHldO1xuICAgICAgbGV0IHNhbXBsZSA9IGNyZWF0ZVNhbXBsZShzYW1wbGVEYXRhLCBldmVudCk7XG4gICAgICB0aGlzLnNjaGVkdWxlZFNhbXBsZXMuc2V0KGV2ZW50Lm1pZGlOb3RlLmlkLCBzYW1wbGUpO1xuICAgICAgc2FtcGxlLnN0YXJ0KCk7XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICBAcGFyYW0gbm90ZUlkIGNhbiBiZSBub3RlIG5hbWUgKEM0KSBvciBub3RlIG51bWJlciAoNjApXG4gICAgQHBhcmFtIGF1ZGlvIGJ1ZmZlclxuICAgIEBwYXJhbSBjb25maWcgKG9wdGlvbmFsKVxuICAgICAge1xuICAgICAgICBzdXN0YWluOiBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSwgLy8gb3B0aW9uYWwsIGluIG1pbGxpc1xuICAgICAgICByZWxlYXNlOiBbcmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGVdLCAvLyBvcHRpb25hbFxuICAgICAgICBwYW46IHBhblBvc2l0aW9uIC8vIG9wdGlvbmFsXG4gICAgICAgIHZlbG9jaXR5OiBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdIC8vIG9wdGlvbmFsLCBmb3IgbXVsdGktbGF5ZXJlZCBpbnN0cnVtZW50c1xuICAgICAgfVxuICAqL1xuICBhZGRTYW1wbGVEYXRhKG5vdGVJZCwgYXVkaW9CdWZmZXIsXG4gICAge1xuICAgICAgc3VzdGFpbiA9IFtmYWxzZSwgZmFsc2VdLFxuICAgICAgcmVsZWFzZSA9IFtmYWxzZSwgJ2RlZmF1bHQnXSxcbiAgICAgIHBhbiA9IGZhbHNlLFxuICAgICAgdmVsb2NpdHkgPSBbMCwgMTI3XVxuICAgIH0gPSB7fSl7XG5cbiAgICBpZihhdWRpb0J1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyID09PSBmYWxzZSl7XG4gICAgICB3YXJuKCdub3QgYSB2YWxpZCBBdWRpb0J1ZmZlciBpbnN0YW5jZScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBbc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kXSA9IHN1c3RhaW47XG4gICAgbGV0IFtyZWxlYXNlRHVyYXRpb24sIHJlbGVhc2VFbnZlbG9wZV0gPSByZWxlYXNlO1xuICAgIGxldCBbdmVsb2NpdHlTdGFydCwgdmVsb2NpdHlFbmRdID0gdmVsb2NpdHk7XG5cbiAgICBpZihzdXN0YWluLmxlbmd0aCAhPT0gMil7XG4gICAgICBzdXN0YWluU3RhcnQgPSBzdXN0YWluRW5kID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYocmVsZWFzZUR1cmF0aW9uID09PSBmYWxzZSl7XG4gICAgICByZWxlYXNlRW52ZWxvcGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBsb2coc3VzdGFpblN0YXJ0LCBzdXN0YWluRW5kKTtcbiAgICAvLyBsb2cocmVsZWFzZUR1cmF0aW9uLCByZWxlYXNlRW52ZWxvcGUpO1xuICAgIC8vIGxvZyhwYW5Qb3NpdGlvbik7XG4gICAgLy8gbG9nKHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kKTtcblxuICAgIGlmKGlzTmFOKG5vdGVJZCkpe1xuICAgICAgbm90ZUlkID0gZ2V0Tm90ZU51bWJlcihub3RlSWQpO1xuICAgICAgaWYoaXNOYU4obm90ZUlkKSl7XG4gICAgICAgIHdhcm4obm90ZUlkKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNhbXBsZXNEYXRhW25vdGVJZF0uZmlsbCh7XG4gICAgICBuOiBub3RlSWQsXG4gICAgICBkOiBhdWRpb0J1ZmZlcixcbiAgICAgIHMxOiBzdXN0YWluU3RhcnQsXG4gICAgICBzMjogc3VzdGFpbkVuZCxcbiAgICAgIHI6IHJlbGVhc2VEdXJhdGlvbixcbiAgICAgIGU6IHJlbGVhc2VFbnZlbG9wZSxcbiAgICAgIHA6IHBhblxuICAgIH0sIHZlbG9jaXR5U3RhcnQsIHZlbG9jaXR5RW5kICsgMSk7XG5cbiAgICAvL2NvbnNvbGUubG9nKHRoaXMuc2FtcGxlc0RhdGFbbm90ZUlkXSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUluc3RydW1lbnQoKXtcbiAgcmV0dXJuIG5ldyBJbnN0cnVtZW50KC4uLmFyZ3VtZW50cyk7XG59IiwiLyoqXG4gIEBwdWJsaWNcbiAgQGNsYXNzIE1JRElFdmVudFxuICBAcGFyYW0gdGltZSB7aW50fSB0aGUgdGltZSB0aGF0IHRoZSBldmVudCBpcyBzY2hlZHVsZWRcbiAgQHBhcmFtIHR5cGUge2ludH0gdHlwZSBvZiBNSURJRXZlbnQsIGUuZy4gTk9URV9PTiwgTk9URV9PRkYgb3IsIDE0NCwgMTI4LCBldGMuXG4gIEBwYXJhbSBkYXRhMSB7aW50fSBpZiB0eXBlIGlzIDE0NCBvciAxMjg6IG5vdGUgbnVtYmVyXG4gIEBwYXJhbSBbZGF0YTJdIHtpbnR9IGlmIHR5cGUgaXMgMTQ0IG9yIDEyODogdmVsb2NpdHlcbiAgQHBhcmFtIFtjaGFubmVsXSB7aW50fSBjaGFubmVsXG5cblxuICBAZXhhbXBsZVxuICAvLyBwbGF5cyB0aGUgY2VudHJhbCBjIGF0IHZlbG9jaXR5IDEwMFxuICBsZXQgZXZlbnQgPSBzZXF1ZW5jZXIuY3JlYXRlTUlESUV2ZW50KDEyMCwgc2VxdWVuY2VyLk5PVEVfT04sIDYwLCAxMDApO1xuXG4gIC8vIHBhc3MgYXJndW1lbnRzIGFzIGFycmF5XG4gIGxldCBldmVudCA9IHNlcXVlbmNlci5jcmVhdGVNSURJRXZlbnQoWzEyMCwgc2VxdWVuY2VyLk5PVEVfT04sIDYwLCAxMDBdKTtcblxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cblxuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuaW1wb3J0IHtjcmVhdGVOb3RlfSBmcm9tICcuL25vdGUuanMnO1xuXG5cbmxldFxuICBtaWRpRXZlbnRJZCA9IDA7XG5cblxuLypcbiAgYXJndW1lbnRzOlxuICAgLSBbdGlja3MsIHR5cGUsIGRhdGExLCBkYXRhMiwgY2hhbm5lbF1cbiAgIC0gdGlja3MsIHR5cGUsIGRhdGExLCBkYXRhMiwgY2hhbm5lbFxuXG4gIGRhdGEyIGFuZCBjaGFubmVsIGFyZSBvcHRpb25hbCBidXQgbXVzdCBiZSBudW1iZXJzIGlmIHByb3ZpZGVkXG4qL1xuXG5leHBvcnQgY2xhc3MgTUlESUV2ZW50e1xuICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICBsZXQgbm90ZTtcblxuICAgIHRoaXMuaWQgPSAnTScgKyBtaWRpRXZlbnRJZCsrICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgdGhpcy5ldmVudE51bWJlciA9IG1pZGlFdmVudElkO1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy5tdXRlZCA9IGZhbHNlO1xuXG5cbiAgICBpZihhcmdzID09PSB1bmRlZmluZWQgfHwgYXJncy5sZW5ndGggPT09IDApe1xuICAgICAgLy8gYnlwYXNzIGNvbnRydWN0b3IgZm9yIGNsb25pbmdcbiAgICAgIHJldHVybjtcbiAgICB9ZWxzZSBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnbWlkaW1lc3NhZ2VldmVudCcpe1xuICAgICAgaW5mbygnbWlkaW1lc3NhZ2VldmVudCcpO1xuICAgICAgcmV0dXJuO1xuICAgIH1lbHNlIGlmKHR5cGVTdHJpbmcoYXJnc1swXSkgPT09ICdhcnJheScpe1xuICAgICAgLy8gc3VwcG9ydCBmb3IgdW4tc3ByZWFkZWQgcGFyYW1ldGVyc1xuICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICBpZih0eXBlU3RyaW5nKGFyZ3NbMF0pID09PSAnYXJyYXknKXtcbiAgICAgICAgLy8gc3VwcG9ydCBmb3IgcGFzc2luZyBwYXJhbWV0ZXJzIGluIGFuIGFycmF5XG4gICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGFyZ3MuZm9yRWFjaChmdW5jdGlvbihkYXRhLCBpKXtcbiAgICAgIGlmKGlzTmFOKGRhdGEpICYmIGkgPCA1KXtcbiAgICAgICAgZXJyb3IoJ3BsZWFzZSBwcm92aWRlIG51bWJlcnMgZm9yIHRpY2tzLCB0eXBlLCBkYXRhMSBhbmQgb3B0aW9uYWxseSBmb3IgZGF0YTIgYW5kIGNoYW5uZWwnKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMudGlja3MgPSBhcmdzWzBdO1xuICAgIHRoaXMuc3RhdHVzID0gYXJnc1sxXTtcbiAgICB0aGlzLnR5cGUgPSAodGhpcy5zdGF0dXMgPj4gNCkgKiAxNjtcbiAgICAvL2NvbnNvbGUubG9nKHRoaXMudHlwZSwgdGhpcy5zdGF0dXMpO1xuICAgIGlmKHRoaXMudHlwZSA+PSAweDgwICYmIHRoaXMudHlwZSA8PSAweEUwKXtcbiAgICAgIC8vdGhlIGhpZ2hlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGlzIHRoZSBjb21tYW5kXG4gICAgICB0aGlzLmNvbW1hbmQgPSB0aGlzLnR5cGU7XG4gICAgICAvL3RoZSBsb3dlciA0IGJpdHMgb2YgdGhlIHN0YXR1cyBieXRlIGlzIHRoZSBjaGFubmVsIG51bWJlclxuICAgICAgdGhpcy5jaGFubmVsID0gKHRoaXMuc3RhdHVzICYgMHhGKSArIDE7IC8vIGZyb20gemVyby1iYXNlZCB0byAxLWJhc2VkXG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnR5cGUgPSB0aGlzLnN0YXR1cztcbiAgICAgIHRoaXMuY2hhbm5lbCA9IGFyZ3NbNF0gfHwgMTtcbiAgICB9XG5cbiAgICB0aGlzLnNvcnRJbmRleCA9IHRoaXMudHlwZSArIHRoaXMudGlja3M7IC8vIG5vdGUgb2ZmIGV2ZW50cyBjb21lIGJlZm9yZSBub3RlIG9uIGV2ZW50c1xuXG4gICAgc3dpdGNoKHRoaXMudHlwZSl7XG4gICAgICBjYXNlIDB4MDpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4ODA6XG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICAgICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgICAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuICAgICAgICB0aGlzLmRhdGEyID0gMDsvL2RhdGFbM107XG4gICAgICAgIHRoaXMudmVsb2NpdHkgPSB0aGlzLmRhdGEyO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHg5MDpcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07Ly9ub3RlIG51bWJlclxuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTsvL3ZlbG9jaXR5XG4gICAgICAgIGlmKHRoaXMuZGF0YTIgPT09IDApe1xuICAgICAgICAgIC8vaWYgdmVsb2NpdHkgaXMgMCwgdGhpcyBpcyBhIE5PVEUgT0ZGIGV2ZW50XG4gICAgICAgICAgdGhpcy50eXBlID0gMHg4MDtcbiAgICAgICAgfVxuICAgICAgICBub3RlID0gY3JlYXRlTm90ZSh0aGlzLmRhdGExKTtcbiAgICAgICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICAgICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgICAgIHRoaXMubm90ZU51bWJlciA9IG5vdGUubnVtYmVyO1xuICAgICAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgICAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuICAgICAgICB0aGlzLnZlbG9jaXR5ID0gdGhpcy5kYXRhMjtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4NTE6XG4gICAgICAgIHRoaXMuYnBtID0gYXJnc1syXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4NTg6XG4gICAgICAgIHRoaXMubm9taW5hdG9yID0gYXJnc1syXTtcbiAgICAgICAgdGhpcy5kZW5vbWluYXRvciA9IGFyZ3NbM107XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweEIwOi8vIGNvbnRyb2wgY2hhbmdlXG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTtcbiAgICAgICAgdGhpcy5jb250cm9sbGVyVHlwZSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuY29udHJvbGxlclZhbHVlID0gYXJnc1szXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4QzA6Ly8gcHJvZ3JhbSBjaGFuZ2VcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMucHJvZ3JhbU51bWJlciA9IGFyZ3NbMl07XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAweEQwOi8vIGNoYW5uZWwgcHJlc3N1cmVcbiAgICAgICAgdGhpcy5kYXRhMSA9IGFyZ3NbMl07XG4gICAgICAgIHRoaXMuZGF0YTIgPSBhcmdzWzNdO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMHhFMDovLyBwaXRjaCBiZW5kXG4gICAgICAgIHRoaXMuZGF0YTEgPSBhcmdzWzJdO1xuICAgICAgICB0aGlzLmRhdGEyID0gYXJnc1szXTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDB4MkY6XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgd2Fybignbm90IGEgcmVjb2duaXplZCB0eXBlIG9mIG1pZGkgZXZlbnQhJyk7XG4gICAgfVxuICB9XG5cblxuXG4gIGNsb25lKCl7XG4gICAgbGV0IGV2ZW50ID0gbmV3IE1JRElFdmVudCgpO1xuXG4gICAgZm9yKGxldCBwcm9wZXJ0eSBvZiBPYmplY3Qua2V5cyh0aGlzKSl7XG4gICAgICBpZihwcm9wZXJ0eSAhPT0gJ2lkJyAmJiBwcm9wZXJ0eSAhPT0gJ2V2ZW50TnVtYmVyJyAmJiBwcm9wZXJ0eSAhPT0gJ21pZGlOb3RlJyl7XG4gICAgICAgIGV2ZW50W3Byb3BlcnR5XSA9IHRoaXNbcHJvcGVydHldO1xuICAgICAgfVxuICAgICAgZXZlbnQuc29uZyA9IHVuZGVmaW5lZDtcbiAgICAgIGV2ZW50LnRyYWNrID0gdW5kZWZpbmVkO1xuICAgICAgZXZlbnQudHJhY2tJZCA9IHVuZGVmaW5lZDtcbiAgICAgIGV2ZW50LnBhcnQgPSB1bmRlZmluZWQ7XG4gICAgICBldmVudC5wYXJ0SWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBldmVudDtcbiAgfVxuXG5cblxuICB0cmFuc3Bvc2Uoc2VtaSl7XG4gICAgaWYodGhpcy50eXBlICE9PSAweDgwICYmIHRoaXMudHlwZSAhPT0gMHg5MCl7XG4gICAgICBlcnJvcigneW91IGNhbiBvbmx5IHRyYW5zcG9zZSBub3RlIG9uIGFuZCBub3RlIG9mZiBldmVudHMnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvL2NvbnNvbGUubG9nKCd0cmFuc3Bvc2UnLCBzZW1pKTtcbiAgICBpZih0eXBlU3RyaW5nKHNlbWkpID09PSAnYXJyYXknKXtcbiAgICAgIGxldCB0eXBlID0gc2VtaVswXTtcbiAgICAgIGlmKHR5cGUgPT09ICdoZXJ0eicpe1xuICAgICAgICAvL2NvbnZlcnQgaGVydHogdG8gc2VtaVxuICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ3NlbWknIHx8IHR5cGUgPT09ICdzZW1pdG9uZScpe1xuICAgICAgICBzZW1pID0gc2VtaVsxXTtcbiAgICAgIH1cbiAgICB9ZWxzZSBpZihpc05hTihzZW1pKSA9PT0gdHJ1ZSl7XG4gICAgICBlcnJvcigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgdG1wID0gdGhpcy5kYXRhMSArIHBhcnNlSW50KHNlbWksIDEwKTtcbiAgICBpZih0bXAgPCAwKXtcbiAgICAgIHRtcCA9IDA7XG4gICAgfWVsc2UgaWYodG1wID4gMTI3KXtcbiAgICAgIHRtcCA9IDEyNztcbiAgICB9XG4gICAgdGhpcy5kYXRhMSA9IHRtcDtcbiAgICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUodGhpcy5kYXRhMSk7XG4gICAgdGhpcy5ub3RlID0gbm90ZTtcbiAgICB0aGlzLm5vdGVOYW1lID0gbm90ZS5mdWxsTmFtZTtcbiAgICB0aGlzLm5vdGVOdW1iZXIgPSBub3RlLm51bWJlcjtcbiAgICB0aGlzLm9jdGF2ZSA9IG5vdGUub2N0YXZlO1xuICAgIHRoaXMuZnJlcXVlbmN5ID0gbm90ZS5mcmVxdWVuY3k7XG5cbiAgICBpZih0aGlzLm1pZGlOb3RlICE9PSB1bmRlZmluZWQpe1xuICAgICAgdGhpcy5taWRpTm90ZS5waXRjaCA9IHRoaXMuZGF0YTE7XG4gICAgfVxuXG4gICAgaWYodGhpcy5fc3RhdGUgIT09ICduZXcnKXtcbiAgICAgIHRoaXMuX3N0YXRlID0gJ3RyYW5zcG9zZWQnO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG5cblxuICBzZXRQaXRjaChwaXRjaCl7XG4gICAgaWYodGhpcy50eXBlICE9PSAweDgwICYmIHRoaXMudHlwZSAhPT0gMHg5MCl7XG4gICAgICBlcnJvcigneW91IGNhbiBvbmx5IHNldCB0aGUgcGl0Y2ggb2Ygbm90ZSBvbiBhbmQgbm90ZSBvZmYgZXZlbnRzJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKHR5cGVTdHJpbmcocGl0Y2gpID09PSAnYXJyYXknKXtcbiAgICAgIGxldCB0eXBlID0gcGl0Y2hbMF07XG4gICAgICBpZih0eXBlID09PSAnaGVydHonKXtcbiAgICAgICAgLy9jb252ZXJ0IGhlcnR6IHRvIHBpdGNoXG4gICAgICB9ZWxzZSBpZih0eXBlID09PSAnc2VtaScgfHwgdHlwZSA9PT0gJ3NlbWl0b25lJyl7XG4gICAgICAgIHBpdGNoID0gcGl0Y2hbMV07XG4gICAgICB9XG4gICAgfWVsc2UgaWYoaXNOYU4ocGl0Y2gpID09PSB0cnVlKXtcbiAgICAgIGVycm9yKCdwbGVhc2UgcHJvdmlkZSBhIG51bWJlcicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YTEgPSBwYXJzZUludChwaXRjaCwxMCk7XG4gICAgbGV0IG5vdGUgPSBjcmVhdGVOb3RlKHRoaXMuZGF0YTEpO1xuICAgIHRoaXMubm90ZSA9IG5vdGU7XG4gICAgdGhpcy5ub3RlTmFtZSA9IG5vdGUuZnVsbE5hbWU7XG4gICAgdGhpcy5ub3RlTnVtYmVyID0gbm90ZS5udW1iZXI7XG4gICAgdGhpcy5vY3RhdmUgPSBub3RlLm9jdGF2ZTtcbiAgICB0aGlzLmZyZXF1ZW5jeSA9IG5vdGUuZnJlcXVlbmN5O1xuXG4gICAgaWYodGhpcy5taWRpTm90ZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHRoaXMubWlkaU5vdGUucGl0Y2ggPSB0aGlzLmRhdGExO1xuICAgIH1cbiAgICBpZih0aGlzLl9zdGF0ZSAhPT0gJ25ldycpe1xuICAgICAgdGhpcy5fc3RhdGUgPSAndHJhbnNwb3NlZCc7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cblxuXG4gIG1vdmUodGlja3Mpe1xuICAgIGlmKGlzTmFOKHRpY2tzKSl7XG4gICAgICBlcnJvcigncGxlYXNlIHByb3ZpZGUgYSBudW1iZXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy50aWNrcyArPSBwYXJzZUludCh0aWNrcywgMTApO1xuICAgIC8vQHRvZG86IHNldCBkdXJhdGlvbiBvZiBtaWRpIG5vdGVcbiAgICBpZih0aGlzLl9zdGF0ZSAhPT0gJ25ldycpe1xuICAgICAgdGhpcy5fc3RhdGUgPSAnbW92ZWQnO1xuICAgIH1cbiAgICB0aGlzLl91cGRhdGUoKTtcbiAgfVxuXG5cblxuICBtb3ZlVG8oLi4ucG9zaXRpb24pe1xuXG4gICAgaWYocG9zaXRpb25bMF0gPT09ICd0aWNrcycgJiYgaXNOYU4ocG9zaXRpb25bMV0pID09PSBmYWxzZSl7XG4gICAgICB0aGlzLnRpY2tzID0gcGFyc2VJbnQocG9zaXRpb25bMV0sIDEwKTtcbiAgICB9ZWxzZSBpZih0aGlzLnNvbmcgPT09IHVuZGVmaW5lZCl7XG4gICAgICBjb25zb2xlLmVycm9yKCdUaGUgbWlkaSBldmVudCBoYXMgbm90IGJlZW4gYWRkZWQgdG8gYSBzb25nIHlldDsgeW91IGNhbiBvbmx5IG1vdmUgdG8gdGlja3MgdmFsdWVzJyk7XG4gICAgfWVsc2V7XG4gICAgICBwb3NpdGlvbiA9IHRoaXMuc29uZy5nZXRQb3NpdGlvbihwb3NpdGlvbik7XG4gICAgICBpZihwb3NpdGlvbiA9PT0gZmFsc2Upe1xuICAgICAgICBjb25zb2xlLmVycm9yKCd3cm9uZyBwb3NpdGlvbiBkYXRhJyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy50aWNrcyA9IHBvc2l0aW9uLnRpY2tzO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMuX3N0YXRlICE9PSAnbmV3Jyl7XG4gICAgICB0aGlzLl9zdGF0ZSA9ICdtb3ZlZCc7XG4gICAgfVxuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cblxuICByZXNldChmcm9tUGFydCA9IHRydWUsIGZyb21UcmFjayA9IHRydWUsIGZyb21Tb25nID0gdHJ1ZSl7XG5cbiAgICBpZihmcm9tUGFydCl7XG4gICAgICB0aGlzLnBhcnQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnBhcnRJZCA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgaWYoZnJvbVRyYWNrKXtcbiAgICAgIHRoaXMudHJhY2sgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnRyYWNrSWQgPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLmNoYW5uZWwgPSAwO1xuICAgIH1cbiAgICBpZihmcm9tU29uZyl7XG4gICAgICB0aGlzLnNvbmcgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuX3N0YXRlID0gJ3JlbW92ZWQnO1xuICAgIHRoaXMuX3VwZGF0ZSgpO1xuICB9XG5cblxuICB1cGRhdGUoKXtcbiAgICBpZih0aGlzLnBhcnQgIT09IHVuZGVmaW5lZCl7XG4gICAgICB0aGlzLnBhcnQuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1JRElFdmVudCgpe1xuICByZXR1cm4gbmV3IE1JRElFdmVudCguLi5hcmd1bWVudHMpO1xufVxuIiwiLypcbiAgRXh0cmFjdHMgYWxsIG1pZGkgZXZlbnRzIGZyb20gYSBiaW5hcnkgbWlkaSBmaWxlLCB1c2VzIG1pZGlfc3RyZWFtLmpzXG5cbiAgYmFzZWQgb246IGh0dHBzOi8vZ2l0aHViLmNvbS9nYXNtYW4vamFzbWlkXG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBjcmVhdGVNSURJU3RyZWFtIGZyb20gJy4vbWlkaV9zdHJlYW0nO1xuXG5sZXRcbiAgbGFzdEV2ZW50VHlwZUJ5dGUsXG4gIHRyYWNrTmFtZTtcblxuXG5mdW5jdGlvbiByZWFkQ2h1bmsoc3RyZWFtKXtcbiAgbGV0IGlkID0gc3RyZWFtLnJlYWQoNCwgdHJ1ZSk7XG4gIGxldCBsZW5ndGggPSBzdHJlYW0ucmVhZEludDMyKCk7XG4gIC8vY29uc29sZS5sb2cobGVuZ3RoKTtcbiAgcmV0dXJue1xuICAgICdpZCc6IGlkLFxuICAgICdsZW5ndGgnOiBsZW5ndGgsXG4gICAgJ2RhdGEnOiBzdHJlYW0ucmVhZChsZW5ndGgsIGZhbHNlKVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIHJlYWRFdmVudChzdHJlYW0pe1xuICB2YXIgZXZlbnQgPSB7fTtcbiAgdmFyIGxlbmd0aDtcbiAgZXZlbnQuZGVsdGFUaW1lID0gc3RyZWFtLnJlYWRWYXJJbnQoKTtcbiAgbGV0IGV2ZW50VHlwZUJ5dGUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgLy9jb25zb2xlLmxvZyhldmVudFR5cGVCeXRlLCBldmVudFR5cGVCeXRlICYgMHg4MCwgMTQ2ICYgMHgwZik7XG4gIGlmKChldmVudFR5cGVCeXRlICYgMHhmMCkgPT0gMHhmMCl7XG4gICAgLyogc3lzdGVtIC8gbWV0YSBldmVudCAqL1xuICAgIGlmKGV2ZW50VHlwZUJ5dGUgPT0gMHhmZil7XG4gICAgICAvKiBtZXRhIGV2ZW50ICovXG4gICAgICBldmVudC50eXBlID0gJ21ldGEnO1xuICAgICAgbGV0IHN1YnR5cGVCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgc3dpdGNoKHN1YnR5cGVCeXRlKXtcbiAgICAgICAgY2FzZSAweDAwOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VOdW1iZXInO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzZXF1ZW5jZU51bWJlciBldmVudCBpcyAyLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZXZlbnQubnVtYmVyID0gc3RyZWFtLnJlYWRJbnQxNigpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAxOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndGV4dCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDI6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjb3B5cmlnaHROb3RpY2UnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDAzOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAndHJhY2tOYW1lJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICB0cmFja05hbWUgPSBldmVudC50ZXh0O1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnaW5zdHJ1bWVudE5hbWUnO1xuICAgICAgICAgIGV2ZW50LnRleHQgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDA1OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbHlyaWNzJztcbiAgICAgICAgICBldmVudC50ZXh0ID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHgwNjpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ21hcmtlcic7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MDc6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjdWVQb2ludCc7XG4gICAgICAgICAgZXZlbnQudGV4dCA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MjA6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdtaWRpQ2hhbm5lbFByZWZpeCc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAxKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIG1pZGlDaGFubmVsUHJlZml4IGV2ZW50IGlzIDEsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5jaGFubmVsID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4MmY6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdlbmRPZlRyYWNrJztcbiAgICAgICAgICBpZihsZW5ndGggIT09IDApe1xuICAgICAgICAgICAgdGhyb3cgJ0V4cGVjdGVkIGxlbmd0aCBmb3IgZW5kT2ZUcmFjayBldmVudCBpcyAwLCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTE6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdzZXRUZW1wbyc7XG4gICAgICAgICAgaWYobGVuZ3RoICE9PSAzKXtcbiAgICAgICAgICAgIHRocm93ICdFeHBlY3RlZCBsZW5ndGggZm9yIHNldFRlbXBvIGV2ZW50IGlzIDMsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5taWNyb3NlY29uZHNQZXJCZWF0ID0gKFxuICAgICAgICAgICAgKHN0cmVhbS5yZWFkSW50OCgpIDw8IDE2KSArXG4gICAgICAgICAgICAoc3RyZWFtLnJlYWRJbnQ4KCkgPDwgOCkgK1xuICAgICAgICAgICAgc3RyZWFtLnJlYWRJbnQ4KClcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDU0OlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc21wdGVPZmZzZXQnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNSl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBzbXB0ZU9mZnNldCBldmVudCBpcyA1LCBnb3QgJyArIGxlbmd0aDtcbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IGhvdXJCeXRlID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuZnJhbWVSYXRlID17XG4gICAgICAgICAgICAweDAwOiAyNCwgMHgyMDogMjUsIDB4NDA6IDI5LCAweDYwOiAzMFxuICAgICAgICAgIH1baG91ckJ5dGUgJiAweDYwXTtcbiAgICAgICAgICBldmVudC5ob3VyID0gaG91ckJ5dGUgJiAweDFmO1xuICAgICAgICAgIGV2ZW50Lm1pbiA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LnNlYyA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIGV2ZW50LmZyYW1lID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgZXZlbnQuc3ViZnJhbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3RpbWVTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gNCl7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciB0aW1lU2lnbmF0dXJlIGV2ZW50IGlzIDQsIGdvdCAnICsgbGVuZ3RoO1xuICAgICAgICAgIH1cbiAgICAgICAgICBldmVudC5udW1lcmF0b3IgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC5kZW5vbWluYXRvciA9IE1hdGgucG93KDIsIHN0cmVhbS5yZWFkSW50OCgpKTtcbiAgICAgICAgICBldmVudC5tZXRyb25vbWUgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgICBldmVudC50aGlydHlzZWNvbmRzID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgICBjYXNlIDB4NTk6XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdrZXlTaWduYXR1cmUnO1xuICAgICAgICAgIGlmKGxlbmd0aCAhPT0gMil7XG4gICAgICAgICAgICB0aHJvdyAnRXhwZWN0ZWQgbGVuZ3RoIGZvciBrZXlTaWduYXR1cmUgZXZlbnQgaXMgMiwgZ290ICcgKyBsZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIGV2ZW50LmtleSA9IHN0cmVhbS5yZWFkSW50OCh0cnVlKTtcbiAgICAgICAgICBldmVudC5zY2FsZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgY2FzZSAweDdmOlxuICAgICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnc2VxdWVuY2VyU3BlY2lmaWMnO1xuICAgICAgICAgIGV2ZW50LmRhdGEgPSBzdHJlYW0ucmVhZChsZW5ndGgpO1xuICAgICAgICAgIHJldHVybiBldmVudDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvL2lmKHNlcXVlbmNlci5kZWJ1ZyA+PSAyKXtcbiAgICAgICAgICAvLyAgICBjb25zb2xlLndhcm4oJ1VucmVjb2duaXNlZCBtZXRhIGV2ZW50IHN1YnR5cGU6ICcgKyBzdWJ0eXBlQnl0ZSk7XG4gICAgICAgICAgLy99XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICd1bmtub3duJztcbiAgICAgICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICB9XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZSBpZihldmVudFR5cGVCeXRlID09IDB4ZjApe1xuICAgICAgZXZlbnQudHlwZSA9ICdzeXNFeCc7XG4gICAgICBsZW5ndGggPSBzdHJlYW0ucmVhZFZhckludCgpO1xuICAgICAgZXZlbnQuZGF0YSA9IHN0cmVhbS5yZWFkKGxlbmd0aCk7XG4gICAgICByZXR1cm4gZXZlbnQ7XG4gICAgfWVsc2UgaWYoZXZlbnRUeXBlQnl0ZSA9PSAweGY3KXtcbiAgICAgIGV2ZW50LnR5cGUgPSAnZGl2aWRlZFN5c0V4JztcbiAgICAgIGxlbmd0aCA9IHN0cmVhbS5yZWFkVmFySW50KCk7XG4gICAgICBldmVudC5kYXRhID0gc3RyZWFtLnJlYWQobGVuZ3RoKTtcbiAgICAgIHJldHVybiBldmVudDtcbiAgICB9ZWxzZXtcbiAgICAgIHRocm93ICdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlIGJ5dGU6ICcgKyBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgfWVsc2V7XG4gICAgLyogY2hhbm5lbCBldmVudCAqL1xuICAgIGxldCBwYXJhbTE7XG4gICAgaWYoKGV2ZW50VHlwZUJ5dGUgJiAweDgwKSA9PT0gMCl7XG4gICAgICAvKiBydW5uaW5nIHN0YXR1cyAtIHJldXNlIGxhc3RFdmVudFR5cGVCeXRlIGFzIHRoZSBldmVudCB0eXBlLlxuICAgICAgICBldmVudFR5cGVCeXRlIGlzIGFjdHVhbGx5IHRoZSBmaXJzdCBwYXJhbWV0ZXJcbiAgICAgICovXG4gICAgICAvL2NvbnNvbGUubG9nKCdydW5uaW5nIHN0YXR1cycpO1xuICAgICAgcGFyYW0xID0gZXZlbnRUeXBlQnl0ZTtcbiAgICAgIGV2ZW50VHlwZUJ5dGUgPSBsYXN0RXZlbnRUeXBlQnl0ZTtcbiAgICB9ZWxzZXtcbiAgICAgIHBhcmFtMSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgLy9jb25zb2xlLmxvZygnbGFzdCcsIGV2ZW50VHlwZUJ5dGUpO1xuICAgICAgbGFzdEV2ZW50VHlwZUJ5dGUgPSBldmVudFR5cGVCeXRlO1xuICAgIH1cbiAgICBsZXQgZXZlbnRUeXBlID0gZXZlbnRUeXBlQnl0ZSA+PiA0O1xuICAgIGV2ZW50LmNoYW5uZWwgPSBldmVudFR5cGVCeXRlICYgMHgwZjtcbiAgICBldmVudC50eXBlID0gJ2NoYW5uZWwnO1xuICAgIHN3aXRjaCAoZXZlbnRUeXBlKXtcbiAgICAgIGNhc2UgMHgwODpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgZXZlbnQubm90ZU51bWJlciA9IHBhcmFtMTtcbiAgICAgICAgZXZlbnQudmVsb2NpdHkgPSBzdHJlYW0ucmVhZEludDgoKTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgY2FzZSAweDA5OlxuICAgICAgICBldmVudC5ub3RlTnVtYmVyID0gcGFyYW0xO1xuICAgICAgICBldmVudC52ZWxvY2l0eSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBpZihldmVudC52ZWxvY2l0eSA9PT0gMCl7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT2ZmJztcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlT24nO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ25vdGVPbicpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwYTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdub3RlQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGI6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnY29udHJvbGxlcic7XG4gICAgICAgIGV2ZW50LmNvbnRyb2xsZXJUeXBlID0gcGFyYW0xO1xuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICByZXR1cm4gZXZlbnQ7XG4gICAgICBjYXNlIDB4MGM6XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAncHJvZ3JhbUNoYW5nZSc7XG4gICAgICAgIGV2ZW50LnByb2dyYW1OdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZDpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdjaGFubmVsQWZ0ZXJ0b3VjaCc7XG4gICAgICAgIGV2ZW50LmFtb3VudCA9IHBhcmFtMTtcbiAgICAgICAgLy9pZih0cmFja05hbWUgPT09ICdTSC1TMS00NC1DMDkgTD1TTUwgSU49Mycpe1xuICAgICAgICAvLyAgICBjb25zb2xlLmxvZygnY2hhbm5lbCBwcmVzc3VyZScsIHRyYWNrTmFtZSwgcGFyYW0xKTtcbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICAgIGNhc2UgMHgwZTpcbiAgICAgICAgZXZlbnQuc3VidHlwZSA9ICdwaXRjaEJlbmQnO1xuICAgICAgICBldmVudC52YWx1ZSA9IHBhcmFtMSArIChzdHJlYW0ucmVhZEludDgoKSA8PCA3KTtcbiAgICAgICAgcmV0dXJuIGV2ZW50O1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgLypcbiAgICAgICAgdGhyb3cgJ1VucmVjb2duaXNlZCBNSURJIGV2ZW50IHR5cGU6ICcgKyBldmVudFR5cGU7XG4gICAgICAgIGNvbnNvbGUubG9nKCdVbnJlY29nbmlzZWQgTUlESSBldmVudCB0eXBlOiAnICsgZXZlbnRUeXBlKTtcbiAgICAgICAgKi9cblxuICAgICAgICBldmVudC52YWx1ZSA9IHN0cmVhbS5yZWFkSW50OCgpO1xuICAgICAgICBldmVudC5zdWJ0eXBlID0gJ3Vua25vd24nO1xuICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbi8qXG4gICAgICAgIGV2ZW50Lm5vdGVOdW1iZXIgPSBwYXJhbTE7XG4gICAgICAgIGV2ZW50LnZlbG9jaXR5ID0gc3RyZWFtLnJlYWRJbnQ4KCk7XG4gICAgICAgIGV2ZW50LnN1YnR5cGUgPSAnbm90ZU9uJztcbiAgICAgICAgY29uc29sZS5sb2coJ3dlaXJkbycsIHRyYWNrTmFtZSwgcGFyYW0xLCBldmVudC52ZWxvY2l0eSk7XG4qL1xuXG4gICAgICAgIHJldHVybiBldmVudDtcbiAgICB9XG4gIH1cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBwYXJzZU1JRElGaWxlKGJ1ZmZlcil7XG4gIGxldCB0cmFja3MgPSBuZXcgTWFwKCk7XG4gIGxldCBzdHJlYW0gPSBjcmVhdGVNSURJU3RyZWFtKG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xuXG4gIGxldCBoZWFkZXJDaHVuayA9IHJlYWRDaHVuayhzdHJlYW0pO1xuICBpZihoZWFkZXJDaHVuay5pZCAhPT0gJ01UaGQnIHx8IGhlYWRlckNodW5rLmxlbmd0aCAhPT0gNil7XG4gICAgdGhyb3cgJ0JhZCAubWlkIGZpbGUgLSBoZWFkZXIgbm90IGZvdW5kJztcbiAgfVxuXG4gIGxldCBoZWFkZXJTdHJlYW0gPSBjcmVhdGVNSURJU3RyZWFtKGhlYWRlckNodW5rLmRhdGEpO1xuICBsZXQgZm9ybWF0VHlwZSA9IGhlYWRlclN0cmVhbS5yZWFkSW50MTYoKTtcbiAgbGV0IHRyYWNrQ291bnQgPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG4gIGxldCB0aW1lRGl2aXNpb24gPSBoZWFkZXJTdHJlYW0ucmVhZEludDE2KCk7XG5cbiAgaWYodGltZURpdmlzaW9uICYgMHg4MDAwKXtcbiAgICB0aHJvdyAnRXhwcmVzc2luZyB0aW1lIGRpdmlzaW9uIGluIFNNVFBFIGZyYW1lcyBpcyBub3Qgc3VwcG9ydGVkIHlldCc7XG4gIH1cblxuICBsZXQgaGVhZGVyID17XG4gICAgJ2Zvcm1hdFR5cGUnOiBmb3JtYXRUeXBlLFxuICAgICd0cmFja0NvdW50JzogdHJhY2tDb3VudCxcbiAgICAndGlja3NQZXJCZWF0JzogdGltZURpdmlzaW9uXG4gIH07XG5cbiAgZm9yKGxldCBpID0gMDsgaSA8IHRyYWNrQ291bnQ7IGkrKyl7XG4gICAgdHJhY2tOYW1lID0gJ3RyYWNrXycgKyBpO1xuICAgIGxldCB0cmFjayA9IFtdO1xuICAgIGxldCB0cmFja0NodW5rID0gcmVhZENodW5rKHN0cmVhbSk7XG4gICAgaWYodHJhY2tDaHVuay5pZCAhPT0gJ01UcmsnKXtcbiAgICAgIHRocm93ICdVbmV4cGVjdGVkIGNodW5rIC0gZXhwZWN0ZWQgTVRyaywgZ290ICcrIHRyYWNrQ2h1bmsuaWQ7XG4gICAgfVxuICAgIGxldCB0cmFja1N0cmVhbSA9IGNyZWF0ZU1JRElTdHJlYW0odHJhY2tDaHVuay5kYXRhKTtcbiAgICB3aGlsZSghdHJhY2tTdHJlYW0uZW9mKCkpe1xuICAgICAgbGV0IGV2ZW50ID0gcmVhZEV2ZW50KHRyYWNrU3RyZWFtKTtcbiAgICAgIHRyYWNrLnB1c2goZXZlbnQpO1xuICAgIH1cbiAgICB0cmFja3Muc2V0KHRyYWNrTmFtZSwgdHJhY2spO1xuICB9XG5cbiAgcmV0dXJue1xuICAgICdoZWFkZXInOiBoZWFkZXIsXG4gICAgJ3RyYWNrcyc6IHRyYWNrc1xuICB9O1xufSIsIi8qXG4gIFdyYXBwZXIgZm9yIGFjY2Vzc2luZyBieXRlcyB0aHJvdWdoIHNlcXVlbnRpYWwgcmVhZHNcblxuICBiYXNlZCBvbjogaHR0cHM6Ly9naXRodWIuY29tL2dhc21hbi9qYXNtaWRcbiAgYWRhcHRlZCB0byB3b3JrIHdpdGggQXJyYXlCdWZmZXIgLT4gVWludDhBcnJheVxuKi9cblxuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IGZjYyA9IFN0cmluZy5mcm9tQ2hhckNvZGU7XG5cbmV4cG9ydCBjbGFzcyBNSURJU3RyZWFte1xuXG4gIC8vIGJ1ZmZlciBpcyBVaW50OEFycmF5XG4gIGNvbnN0cnVjdG9yKGJ1ZmZlcil7XG4gICAgdGhpcy5idWZmZXIgPSBidWZmZXI7XG4gICAgdGhpcy5wb3NpdGlvbiA9IDA7XG4gIH1cblxuICAvKiByZWFkIHN0cmluZyBvciBhbnkgbnVtYmVyIG9mIGJ5dGVzICovXG4gIHJlYWQobGVuZ3RoLCB0b1N0cmluZyA9IHRydWUpIHtcbiAgICBsZXQgcmVzdWx0O1xuXG4gICAgaWYodG9TdHJpbmcpe1xuICAgICAgcmVzdWx0ID0gJyc7XG4gICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyssIHRoaXMucG9zaXRpb24rKyl7XG4gICAgICAgIHJlc3VsdCArPSBmY2ModGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbl0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9ZWxzZXtcbiAgICAgIHJlc3VsdCA9IFtdO1xuICAgICAgZm9yKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrLCB0aGlzLnBvc2l0aW9uKyspe1xuICAgICAgICByZXN1bHQucHVzaCh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIC8qIHJlYWQgYSBiaWctZW5kaWFuIDMyLWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQzMigpIHtcbiAgICBsZXQgcmVzdWx0ID0gKFxuICAgICAgKHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb25dIDw8IDI0KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDFdIDw8IDE2KSArXG4gICAgICAodGhpcy5idWZmZXJbdGhpcy5wb3NpdGlvbiArIDJdIDw8IDgpICtcbiAgICAgIHRoaXMuYnVmZmVyW3RoaXMucG9zaXRpb24gKyAzXVxuICAgICk7XG4gICAgdGhpcy5wb3NpdGlvbiArPSA0O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICAvKiByZWFkIGEgYmlnLWVuZGlhbiAxNi1iaXQgaW50ZWdlciAqL1xuICByZWFkSW50MTYoKSB7XG4gICAgbGV0IHJlc3VsdCA9IChcbiAgICAgICh0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXSA8PCA4KSArXG4gICAgICB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uICsgMV1cbiAgICApO1xuICAgIHRoaXMucG9zaXRpb24gKz0gMjtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgLyogcmVhZCBhbiA4LWJpdCBpbnRlZ2VyICovXG4gIHJlYWRJbnQ4KHNpZ25lZCkge1xuICAgIGxldCByZXN1bHQgPSB0aGlzLmJ1ZmZlclt0aGlzLnBvc2l0aW9uXTtcbiAgICBpZihzaWduZWQgJiYgcmVzdWx0ID4gMTI3KXtcbiAgICAgIHJlc3VsdCAtPSAyNTY7XG4gICAgfVxuICAgIHRoaXMucG9zaXRpb24gKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZW9mKCkge1xuICAgIHJldHVybiB0aGlzLnBvc2l0aW9uID49IHRoaXMuYnVmZmVyLmxlbmd0aDtcbiAgfVxuXG4gIC8qIHJlYWQgYSBNSURJLXN0eWxlIGxldGlhYmxlLWxlbmd0aCBpbnRlZ2VyXG4gICAgKGJpZy1lbmRpYW4gdmFsdWUgaW4gZ3JvdXBzIG9mIDcgYml0cyxcbiAgICB3aXRoIHRvcCBiaXQgc2V0IHRvIHNpZ25pZnkgdGhhdCBhbm90aGVyIGJ5dGUgZm9sbG93cylcbiAgKi9cbiAgcmVhZFZhckludCgpIHtcbiAgICBsZXQgcmVzdWx0ID0gMDtcbiAgICB3aGlsZSh0cnVlKSB7XG4gICAgICBsZXQgYiA9IHRoaXMucmVhZEludDgoKTtcbiAgICAgIGlmIChiICYgMHg4MCkge1xuICAgICAgICByZXN1bHQgKz0gKGIgJiAweDdmKTtcbiAgICAgICAgcmVzdWx0IDw8PSA3O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLyogYiBpcyB0aGUgbGFzdCBieXRlICovXG4gICAgICAgIHJldHVybiByZXN1bHQgKyBiO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNyZWF0ZU1JRElTdHJlYW0oYnVmZmVyKXtcbiAgcmV0dXJuIG5ldyBNSURJU3RyZWFtKGJ1ZmZlcik7XG59XG4iLCIvKlxuICBBZGRzIGEgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbm90ZSBvYmplY3QgdGhhdCBjb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhIG11c2ljYWwgbm90ZTpcbiAgICAtIG5hbWUsIGUuZy4gJ0MnXG4gICAgLSBvY3RhdmUsICAtMSAtIDlcbiAgICAtIGZ1bGxOYW1lOiAnQzEnXG4gICAgLSBmcmVxdWVuY3k6IDIzNC4xNiwgYmFzZWQgb24gdGhlIGJhc2ljIHBpdGNoXG4gICAgLSBudW1iZXI6IDYwIG1pZGkgbm90ZSBudW1iZXJcblxuICBBZGRzIHNldmVyYWwgdXRpbGl0eSBtZXRob2RzIG9yZ2FuaXNlZCBhcm91bmQgdGhlIG5vdGUgb2JqZWN0XG4qL1xuXG4ndXNlIHN0cmljdCc7XG5cbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtsb2csIGluZm8sIHdhcm4sIGVycm9yLCB0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwnO1xuXG5sZXRcbiAgZXJyb3JNc2csXG4gIHdhcm5pbmdNc2csXG4gIGNvbmZpZyA9IGdldENvbmZpZygpLFxuICBwb3cgPSBNYXRoLnBvdyxcbiAgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG5jb25zdCBub3RlTmFtZXMgPSB7XG4gICdzaGFycCcgOiBbJ0MnLCAnQyMnLCAnRCcsICdEIycsICdFJywgJ0YnLCAnRiMnLCAnRycsICdHIycsICdBJywgJ0EjJywgJ0InXSxcbiAgJ2ZsYXQnIDogWydDJywgJ0RiJywgJ0QnLCAnRWInLCAnRScsICdGJywgJ0diJywgJ0cnLCAnQWInLCAnQScsICdCYicsICdCJ10sXG4gICdlbmhhcm1vbmljLXNoYXJwJyA6IFsnQiMnLCAnQyMnLCAnQyMjJywgJ0QjJywgJ0QjIycsICdFIycsICdGIycsICdGIyMnLCAnRyMnLCAnRyMjJywgJ0EjJywgJ0EjIyddLFxuICAnZW5oYXJtb25pYy1mbGF0JyA6IFsnRGJiJywgJ0RiJywgJ0ViYicsICdFYicsICdGYicsICdHYmInLCAnR2InLCAnQWJiJywgJ0FiJywgJ0JiYicsICdCYicsICdDYiddXG59O1xuXG5cbi8qXG4gIGFyZ3VtZW50c1xuICAtIG5vdGVOdW1iZXI6IDYwXG4gIC0gbm90ZU51bWJlciBhbmQgbm90ZW5hbWUgbW9kZTogNjAsICdzaGFycCdcbiAgLSBub3RlTmFtZTogJ0MjNCdcbiAgLSBuYW1lIGFuZCBvY3RhdmU6ICdDIycsIDRcbiAgLSBub3RlIG5hbWUsIG9jdGF2ZSwgbm90ZSBuYW1lIG1vZGU6ICdEJywgNCwgJ3NoYXJwJ1xuICAtIGRhdGEgb2JqZWN0OlxuICAgIHtcbiAgICAgIG5hbWU6ICdDJyxcbiAgICAgIG9jdGF2ZTogNFxuICAgIH1cbiAgICBvclxuICAgIHtcbiAgICAgIGZyZXF1ZW5jeTogMjM0LjE2XG4gICAgfVxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU5vdGUoLi4uYXJncyl7XG4gIGxldFxuICAgIG51bUFyZ3MgPSBhcmdzLmxlbmd0aCxcbiAgICBkYXRhLFxuICAgIG9jdGF2ZSxcbiAgICBub3RlTmFtZSxcbiAgICBub3RlTnVtYmVyLFxuICAgIG5vdGVOYW1lTW9kZSxcbiAgICBhcmcwID0gYXJnc1swXSxcbiAgICBhcmcxID0gYXJnc1sxXSxcbiAgICBhcmcyID0gYXJnc1syXSxcbiAgICB0eXBlMCA9IHR5cGVTdHJpbmcoYXJnMCksXG4gICAgdHlwZTEgPSB0eXBlU3RyaW5nKGFyZzEpLFxuICAgIHR5cGUyID0gdHlwZVN0cmluZyhhcmcyKTtcblxuICBlcnJvck1zZyA9ICcnO1xuICB3YXJuaW5nTXNnID0gJyc7XG5cbiAgLy8gYXJndW1lbnQ6IG5vdGUgbnVtYmVyXG4gIGlmKG51bUFyZ3MgPT09IDEgJiYgdHlwZTAgPT09ICdudW1iZXInKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyAgYXJnMDtcbiAgICB9ZWxzZXtcbiAgICAgIG5vdGVOdW1iZXIgPSBhcmcwO1xuICAgICAgZGF0YSA9IF9nZXROb3RlTmFtZShub3RlTnVtYmVyKTtcbiAgICAgIG5vdGVOYW1lID0gZGF0YVswXTtcbiAgICAgIG9jdGF2ZSA9IGRhdGFbMV07XG4gICAgfVxuXG5cbiAgLy8gYXJndW1lbnRzOiBmdWxsIG5vdGUgbmFtZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAxICYmIHR5cGUwID09PSAnc3RyaW5nJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzApO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbmFtZSwgb2N0YXZlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyl7XG4gICAgZGF0YSA9IF9jaGVja05vdGVOYW1lKGFyZzAsIGFyZzEpO1xuICAgIGlmKGVycm9yTXNnID09PSAnJyl7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgICAgbm90ZU51bWJlciA9IF9nZXROb3RlTnVtYmVyKG5vdGVOYW1lLCBvY3RhdmUpO1xuICAgIH1cblxuICAvLyBhcmd1bWVudHM6IGZ1bGwgbm90ZSBuYW1lLCBub3RlIG5hbWUgbW9kZSAtPiBmb3IgY29udmVydGluZyBiZXR3ZWVuIG5vdGUgbmFtZSBtb2Rlc1xuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGUwID09PSAnc3RyaW5nJyAmJiB0eXBlMSA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSwgb2N0YXZlKTtcbiAgICB9XG5cblxuICAvLyBhcmd1bWVudHM6IG5vdGUgbnVtYmVyLCBub3RlIG5hbWUgbW9kZVxuICB9ZWxzZSBpZihudW1BcmdzID09PSAyICYmIHR5cGVTdHJpbmcoYXJnMCkgPT09ICdudW1iZXInICYmIHR5cGVTdHJpbmcoYXJnMSkgPT09ICdzdHJpbmcnKXtcbiAgICBpZihhcmcwIDwgMCB8fCBhcmcwID4gMTI3KXtcbiAgICAgIGVycm9yTXNnID0gJ3BsZWFzZSBwcm92aWRlIGEgbm90ZSBudW1iZXIgPj0gMCBhbmQgPD0gMTI3ICcgKyBhcmcwO1xuICAgIH1lbHNle1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzEpO1xuICAgICAgbm90ZU51bWJlciA9IGFyZzA7XG4gICAgICBkYXRhID0gX2dldE5vdGVOYW1lKG5vdGVOdW1iZXIsIG5vdGVOYW1lTW9kZSk7XG4gICAgICBub3RlTmFtZSA9IGRhdGFbMF07XG4gICAgICBvY3RhdmUgPSBkYXRhWzFdO1xuICAgIH1cblxuXG4gIC8vIGFyZ3VtZW50czogbm90ZSBuYW1lLCBvY3RhdmUsIG5vdGUgbmFtZSBtb2RlXG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDMgJiYgdHlwZTAgPT09ICdzdHJpbmcnICYmIHR5cGUxID09PSAnbnVtYmVyJyAmJiB0eXBlMiA9PT0gJ3N0cmluZycpe1xuICAgIGRhdGEgPSBfY2hlY2tOb3RlTmFtZShhcmcwLCBhcmcxKTtcbiAgICBpZihlcnJvck1zZyA9PT0gJycpe1xuICAgICAgbm90ZU5hbWVNb2RlID0gX2NoZWNrTm90ZU5hbWVNb2RlKGFyZzIpO1xuICAgICAgbm90ZU5hbWUgPSBkYXRhWzBdO1xuICAgICAgb2N0YXZlID0gZGF0YVsxXTtcbiAgICAgIG5vdGVOdW1iZXIgPSBfZ2V0Tm90ZU51bWJlcihub3RlTmFtZSxvY3RhdmUpO1xuICAgIH1cblxuICB9ZWxzZXtcbiAgICBlcnJvck1zZyA9ICd3cm9uZyBhcmd1bWVudHMsIHBsZWFzZSBjb25zdWx0IGRvY3VtZW50YXRpb24nO1xuICB9XG5cbiAgaWYoZXJyb3JNc2cpe1xuICAgIGVycm9yKGVycm9yTXNnKTtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZih3YXJuaW5nTXNnKXtcbiAgICB3YXJuKHdhcm5pbmdNc2cpO1xuICB9XG5cbiAgbGV0IG5vdGUgPSB7XG4gICAgbmFtZTogbm90ZU5hbWUsXG4gICAgb2N0YXZlOiBvY3RhdmUsXG4gICAgZnVsbE5hbWU6IG5vdGVOYW1lICsgb2N0YXZlLFxuICAgIG51bWJlcjogbm90ZU51bWJlcixcbiAgICBmcmVxdWVuY3k6IF9nZXRGcmVxdWVuY3kobm90ZU51bWJlciksXG4gICAgYmxhY2tLZXk6IF9pc0JsYWNrS2V5KG5vdGVOdW1iZXIpXG4gIH1cbiAgT2JqZWN0LmZyZWV6ZShub3RlKTtcbiAgcmV0dXJuIG5vdGU7XG59XG5cblxuZnVuY3Rpb24gX2dldE5vdGVOYW1lKG51bWJlciwgbW9kZSA9IGNvbmZpZy5nZXQoJ25vdGVOYW1lTW9kZScpKSB7XG4gIC8vbGV0IG9jdGF2ZSA9IE1hdGguZmxvb3IoKG51bWJlciAvIDEyKSAtIDIpLCAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG9jdGF2ZSA9IGZsb29yKChudW1iZXIgLyAxMikgLSAxKTtcbiAgbGV0IG5vdGVOYW1lID0gbm90ZU5hbWVzW21vZGVdW251bWJlciAlIDEyXTtcbiAgcmV0dXJuIFtub3RlTmFtZSwgb2N0YXZlXTtcbn1cblxuXG5mdW5jdGlvbiBfZ2V0Tm90ZU51bWJlcihuYW1lLCBvY3RhdmUpIHtcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXg7XG5cbiAgZm9yKGxldCBrZXkgb2Yga2V5cyl7XG4gICAgbGV0IG1vZGUgPSBub3RlTmFtZXNba2V5XTtcbiAgICBpbmRleCA9IG1vZGUuZmluZEluZGV4KHggPT4geCA9PT0gbmFtZSk7XG4gICAgaWYoaW5kZXggIT09IC0xKXtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIC8vbnVtYmVyID0gKGluZGV4ICsgMTIpICsgKG9jdGF2ZSAqIDEyKSArIDEyOyAvLyDihpIgaW4gQ3ViYXNlIGNlbnRyYWwgQyA9IEMzIGluc3RlYWQgb2YgQzRcbiAgbGV0IG51bWJlciA9IChpbmRleCArIDEyKSArIChvY3RhdmUgKiAxMik7Ly8g4oaSIG1pZGkgc3RhbmRhcmQgKyBzY2llbnRpZmljIG5hbWluZywgc2VlOiBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL01pZGRsZV9DIGFuZCBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL1NjaWVudGlmaWNfcGl0Y2hfbm90YXRpb25cblxuICBpZihudW1iZXIgPCAwIHx8IG51bWJlciA+IDEyNyl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYSBub3RlIGJldHdlZW4gQzAgYW5kIEcxMCc7XG4gICAgcmV0dXJuO1xuICB9XG4gIHJldHVybiBudW1iZXI7XG59XG5cblxuZnVuY3Rpb24gX2dldEZyZXF1ZW5jeShudW1iZXIpe1xuICByZXR1cm4gY29uZmlnLmdldCgncGl0Y2gnKSAqIHBvdygyLChudW1iZXIgLSA2OSkvMTIpOyAvLyBtaWRpIHN0YW5kYXJkLCBzZWU6IGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTUlESV9UdW5pbmdfU3RhbmRhcmRcbn1cblxuXG4vLyBUT0RPOiBjYWxjdWxhdGUgbm90ZSBmcm9tIGZyZXF1ZW5jeVxuZnVuY3Rpb24gX2dldFBpdGNoKGhlcnR6KXtcbiAgLy9mbSAgPSAgMiht4oiSNjkpLzEyKDQ0MCBIeikuXG59XG5cblxuZnVuY3Rpb24gX2NoZWNrTm90ZU5hbWVNb2RlKG1vZGUpe1xuICBsZXQga2V5cyA9IE9iamVjdC5rZXlzKG5vdGVOYW1lcyk7XG4gIGxldCByZXN1bHQgPSBrZXlzLmZpbmQoeCA9PiB4ID09PSBtb2RlKSAhPT0gdW5kZWZpbmVkO1xuICBpZihyZXN1bHQgPT09IGZhbHNlKXtcbiAgICBtb2RlID0gY29uZmlnLmdldCgnbm90ZU5hbWVNb2RlJyk7XG4gICAgd2FybmluZ01zZyA9IG1vZGUgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSBtb2RlLCB1c2luZyBcIicgKyBtb2RlICsgJ1wiIGluc3RlYWQnO1xuICB9XG4gIHJldHVybiBtb2RlO1xufVxuXG5cbmZ1bmN0aW9uIF9jaGVja05vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXRcbiAgICBudW1BcmdzID0gYXJncy5sZW5ndGgsXG4gICAgYXJnMCA9IGFyZ3NbMF0sXG4gICAgYXJnMSA9IGFyZ3NbMV0sXG4gICAgY2hhcixcbiAgICBuYW1lID0gJycsXG4gICAgb2N0YXZlID0gJyc7XG5cbiAgLy8gZXh0cmFjdCBvY3RhdmUgZnJvbSBub3RlIG5hbWVcbiAgaWYobnVtQXJncyA9PT0gMSl7XG4gICAgZm9yKGNoYXIgb2YgYXJnMCl7XG4gICAgICBpZihpc05hTihjaGFyKSAmJiBjaGFyICE9PSAnLScpe1xuICAgICAgICBuYW1lICs9IGNoYXI7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgb2N0YXZlICs9IGNoYXI7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKG9jdGF2ZSA9PT0gJycpe1xuICAgICAgb2N0YXZlID0gMDtcbiAgICB9XG4gIH1lbHNlIGlmKG51bUFyZ3MgPT09IDIpe1xuICAgIG5hbWUgPSBhcmcwO1xuICAgIG9jdGF2ZSA9IGFyZzE7XG4gIH1cblxuICAvLyBjaGVjayBpZiBub3RlIG5hbWUgaXMgdmFsaWRcbiAgbGV0IGtleXMgPSBPYmplY3Qua2V5cyhub3RlTmFtZXMpO1xuICBsZXQgaW5kZXggPSAtMTtcblxuICBmb3IobGV0IGtleSBvZiBrZXlzKXtcbiAgICBsZXQgbW9kZSA9IG5vdGVOYW1lc1trZXldO1xuICAgIGluZGV4ID0gbW9kZS5maW5kSW5kZXgoeCA9PiB4ID09PSBuYW1lKTtcbiAgICBpZihpbmRleCAhPT0gLTEpe1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgaWYoaW5kZXggPT09IC0xKXtcbiAgICBlcnJvck1zZyA9IGFyZzAgKyAnIGlzIG5vdCBhIHZhbGlkIG5vdGUgbmFtZSwgcGxlYXNlIHVzZSBsZXR0ZXJzIEEgLSBHIGFuZCBpZiBuZWNlc3NhcnkgYW4gYWNjaWRlbnRhbCBsaWtlICMsICMjLCBiIG9yIGJiLCBmb2xsb3dlZCBieSBhIG51bWJlciBmb3IgdGhlIG9jdGF2ZSc7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYob2N0YXZlIDwgLTEgfHwgb2N0YXZlID4gOSl7XG4gICAgZXJyb3JNc2cgPSAncGxlYXNlIHByb3ZpZGUgYW4gb2N0YXZlIGJldHdlZW4gLTEgYW5kIDknO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIG9jdGF2ZSA9IHBhcnNlSW50KG9jdGF2ZSwgMTApO1xuICBuYW1lID0gbmFtZS5zdWJzdHJpbmcoMCwgMSkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xuXG4gIC8vY29uc29sZS5sb2cobmFtZSwnfCcsb2N0YXZlKTtcbiAgcmV0dXJuIFtuYW1lLCBvY3RhdmVdO1xufVxuXG5cblxuZnVuY3Rpb24gX2lzQmxhY2tLZXkobm90ZU51bWJlcil7XG4gIGxldCBibGFjaztcblxuICBzd2l0Y2godHJ1ZSl7XG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDE6Ly9DI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAzOi8vRCNcbiAgICBjYXNlIG5vdGVOdW1iZXIgJSAxMiA9PT0gNjovL0YjXG4gICAgY2FzZSBub3RlTnVtYmVyICUgMTIgPT09IDg6Ly9HI1xuICAgIGNhc2Ugbm90ZU51bWJlciAlIDEyID09PSAxMDovL0EjXG4gICAgICBibGFjayA9IHRydWU7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgYmxhY2sgPSBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBibGFjaztcbn1cblxuXG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVOdW1iZXIoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubnVtYmVyO1xuICB9XG4gIHJldHVybiBlcnJvck1zZztcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Tm90ZU5hbWUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUubmFtZTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5vdGVPY3RhdmUoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUub2N0YXZlO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnVsbE5vdGVOYW1lKC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZ1bGxOYW1lO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RnJlcXVlbmN5KC4uLmFyZ3Mpe1xuICBsZXQgbm90ZSA9IGNyZWF0ZU5vdGUoLi4uYXJncyk7XG4gIGlmKG5vdGUpe1xuICAgIHJldHVybiBub3RlLmZyZXF1ZW5jeTtcbiAgfVxuICByZXR1cm4gZmFsc2U7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGlzQmxhY2tLZXkoLi4uYXJncyl7XG4gIGxldCBub3RlID0gY3JlYXRlTm90ZSguLi5hcmdzKTtcbiAgaWYobm90ZSl7XG4gICAgcmV0dXJuIG5vdGUuYmxhY2tLZXk7XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtnZXROaWNlVGltZX0gZnJvbSAnLi91dGlsJztcblxubGV0XG4gIHBwcSxcbiAgYnBtLFxuICBmYWN0b3IsXG4gIG5vbWluYXRvcixcbiAgZGVub21pbmF0b3IsXG4gIHBsYXliYWNrU3BlZWQsXG5cbiAgYmFyLFxuICBiZWF0LFxuICBzaXh0ZWVudGgsXG4gIHRpY2ssXG4gIHRpY2tzLFxuICBtaWxsaXMsXG5cbiAgbWlsbGlzUGVyVGljayxcbiAgc2Vjb25kc1BlclRpY2ssXG5cbiAgdGlja3NQZXJCZWF0LFxuICB0aWNrc1BlckJhcixcbiAgdGlja3NQZXJTaXh0ZWVudGgsXG4gIG51bVNpeHRlZW50aCxcblxuICBkaWZmVGlja3M7XG5cblxuZnVuY3Rpb24gc2V0VGlja0R1cmF0aW9uKCl7XG4gIHNlY29uZHNQZXJUaWNrID0gKDEvcGxheWJhY2tTcGVlZCAqIDYwKS9icG0vcHBxO1xuICBtaWxsaXNQZXJUaWNrID0gc2Vjb25kc1BlclRpY2sgKiAxMDAwO1xuICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssIGJwbSwgcHBxLCBwbGF5YmFja1NwZWVkLCAocHBxICogbWlsbGlzUGVyVGljaykpO1xuICAvL2NvbnNvbGUubG9nKHBwcSk7XG59XG5cblxuZnVuY3Rpb24gc2V0VGlja3NQZXJCZWF0KCl7XG4gIGZhY3RvciA9ICg0L2Rlbm9taW5hdG9yKTtcbiAgbnVtU2l4dGVlbnRoID0gZmFjdG9yICogNDtcbiAgdGlja3NQZXJCZWF0ID0gcHBxICogZmFjdG9yO1xuICB0aWNrc1BlckJhciA9IHRpY2tzUGVyQmVhdCAqIG5vbWluYXRvcjtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBwcHEvNDtcbiAgLy9jb25zb2xlLmxvZyhkZW5vbWluYXRvciwgZmFjdG9yLCBudW1TaXh0ZWVudGgsIHRpY2tzUGVyQmVhdCwgdGlja3NQZXJCYXIsIHRpY2tzUGVyU2l4dGVlbnRoKTtcbn1cblxuXG5mdW5jdGlvbiB1cGRhdGVQb3NpdGlvbihldmVudCl7XG4gIGRpZmZUaWNrcyA9IGV2ZW50LnRpY2tzIC0gdGlja3M7XG4gIHRpY2sgKz0gZGlmZlRpY2tzO1xuICB0aWNrcyA9IGV2ZW50LnRpY2tzO1xuICAvL2NvbnNvbGUubG9nKGRpZmZUaWNrcywgbWlsbGlzUGVyVGljayk7XG4gIG1pbGxpcyArPSBkaWZmVGlja3MgKiBtaWxsaXNQZXJUaWNrO1xuXG4gIHdoaWxlKHRpY2sgPj0gdGlja3NQZXJTaXh0ZWVudGgpe1xuICAgIHNpeHRlZW50aCsrO1xuICAgIHRpY2sgLT0gdGlja3NQZXJTaXh0ZWVudGg7XG4gICAgd2hpbGUoc2l4dGVlbnRoID4gbnVtU2l4dGVlbnRoKXtcbiAgICAgIHNpeHRlZW50aCAtPSBudW1TaXh0ZWVudGg7XG4gICAgICBiZWF0Kys7XG4gICAgICB3aGlsZShiZWF0ID4gbm9taW5hdG9yKXtcbiAgICAgICAgYmVhdCAtPSBub21pbmF0b3I7XG4gICAgICAgIGJhcisrO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVRpbWVFdmVudHMoc29uZyl7XG4gIC8vY29uc29sZS50aW1lKCdwYXJzZSB0aW1lIGV2ZW50cyAnICsgc29uZy5uYW1lKTtcbiAgbGV0IHRpbWVFdmVudHMgPSBzb25nLl90aW1lRXZlbnRzO1xuICBsZXQgdHlwZTtcbiAgbGV0IGV2ZW50O1xuXG4gIHBwcSA9IHNvbmcucHBxO1xuICBicG0gPSBzb25nLmJwbTtcbiAgbm9taW5hdG9yID0gc29uZy5ub21pbmF0b3I7XG4gIGRlbm9taW5hdG9yID0gc29uZy5kZW5vbWluYXRvcjtcbiAgcGxheWJhY2tTcGVlZCA9IHNvbmcucGxheWJhY2tTcGVlZDtcbiAgYmFyID0gMTtcbiAgYmVhdCA9IDE7XG4gIHNpeHRlZW50aCA9IDE7XG4gIHRpY2sgPSAwO1xuICB0aWNrcyA9IDA7XG4gIG1pbGxpcyA9IDA7XG5cbiAgc2V0VGlja0R1cmF0aW9uKCk7XG4gIHNldFRpY2tzUGVyQmVhdCgpO1xuXG4gIHRpbWVFdmVudHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuXG4gIGZvcihldmVudCBvZiB0aW1lRXZlbnRzKXtcbiAgICBldmVudC5zb25nID0gc29uZztcbiAgICB0eXBlID0gZXZlbnQudHlwZTtcbiAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG5cbiAgICBzd2l0Y2godHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuYnBtO1xuICAgICAgICBzZXRUaWNrRHVyYXRpb24oKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgMHg1ODpcbiAgICAgICAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICAgICAgICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuICAgICAgICBzZXRUaWNrc1BlckJlYXQoKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgIH1cblxuICAgIC8vdGltZSBkYXRhIG9mIHRpbWUgZXZlbnQgaXMgdmFsaWQgZnJvbSAoYW5kIGluY2x1ZGVkKSB0aGUgcG9zaXRpb24gb2YgdGhlIHRpbWUgZXZlbnRcbiAgICB1cGRhdGVFdmVudChldmVudCk7XG4gICAgLy9jb25zb2xlLmxvZyhldmVudC5iYXJzQXNTdHJpbmcpO1xuICB9XG5cbiAgc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbiAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gIC8vY29uc29sZS5sb2codGltZUV2ZW50cyk7XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRXZlbnRzKHNvbmcsIGV2ZW50cyl7XG5cbiAgbGV0IGV2ZW50O1xuICBsZXQgbnVtRXZlbnRzID0gZXZlbnRzLmxlbmd0aDtcbiAgbGV0IHN0YXJ0RXZlbnQgPSAwO1xuICBsZXQgbGFzdEV2ZW50VGljayA9IDA7XG5cbiAgZXZlbnRzLnNvcnQoZnVuY3Rpb24oYSwgYil7XG4gICAgcmV0dXJuIGEuc29ydEluZGV4IC0gYi5zb3J0SW5kZXg7XG4gIH0pO1xuICBldmVudCA9IGV2ZW50c1swXTtcblxuICBicG0gPSBldmVudC5icG07XG4gIGZhY3RvciA9IGV2ZW50LmZhY3RvcjtcbiAgbm9taW5hdG9yID0gZXZlbnQubm9taW5hdG9yO1xuICBkZW5vbWluYXRvciA9IGV2ZW50LmRlbm9taW5hdG9yO1xuXG4gIHRpY2tzUGVyQmFyID0gZXZlbnQudGlja3NQZXJCYXI7XG4gIHRpY2tzUGVyQmVhdCA9IGV2ZW50LnRpY2tzUGVyQmVhdDtcbiAgdGlja3NQZXJTaXh0ZWVudGggPSBldmVudC50aWNrc1BlclNpeHRlZW50aDtcblxuICBudW1TaXh0ZWVudGggPSBldmVudC5udW1TaXh0ZWVudGg7XG5cbiAgbWlsbGlzUGVyVGljayA9IGV2ZW50Lm1pbGxpc1BlclRpY2s7XG4gIHNlY29uZHNQZXJUaWNrID0gZXZlbnQuc2Vjb25kc1BlclRpY2s7XG5cbiAgbWlsbGlzID0gZXZlbnQubWlsbGlzO1xuXG4gIGJhciA9IGV2ZW50LmJhcjtcbiAgYmVhdCA9IGV2ZW50LmJlYXQ7XG4gIHNpeHRlZW50aCA9IGV2ZW50LnNpeHRlZW50aDtcbiAgdGljayA9IGV2ZW50LnRpY2s7XG5cblxuICBmb3IobGV0IGkgPSBzdGFydEV2ZW50OyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuXG4gICAgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICBzd2l0Y2goZXZlbnQudHlwZSl7XG5cbiAgICAgIGNhc2UgMHg1MTpcbiAgICAgICAgYnBtID0gZXZlbnQuYnBtO1xuICAgICAgICBtaWxsaXMgPSBldmVudC5taWxsaXM7XG4gICAgICAgIG1pbGxpc1BlclRpY2sgPSBldmVudC5taWxsaXNQZXJUaWNrO1xuICAgICAgICBzZWNvbmRzUGVyVGljayA9IGV2ZW50LnNlY29uZHNQZXJUaWNrO1xuICAgICAgICAvL2NvbnNvbGUubG9nKG1pbGxpc1BlclRpY2ssZXZlbnQubWlsbGlzUGVyVGljayk7XG4gICAgICAgIC8vY29uc29sZS5sb2coZXZlbnQpO1xuICAgICAgICBicmVhaztcblxuICAgICAgY2FzZSAweDU4OlxuICAgICAgICBmYWN0b3IgPSBldmVudC5mYWN0b3I7XG4gICAgICAgIG5vbWluYXRvciA9IGV2ZW50Lm5vbWluYXRvcjtcbiAgICAgICAgZGVub21pbmF0b3IgPSBldmVudC5kZW5vbWluYXRvcjtcbiAgICAgICAgbnVtU2l4dGVlbnRoID0gZXZlbnQubnVtU2l4dGVlbnRoO1xuICAgICAgICB0aWNrc1BlckJhciA9IGV2ZW50LnRpY2tzUGVyQmFyO1xuICAgICAgICB0aWNrc1BlckJlYXQgPSBldmVudC50aWNrc1BlckJlYXQ7XG4gICAgICAgIHRpY2tzUGVyU2l4dGVlbnRoID0gZXZlbnQudGlja3NQZXJTaXh0ZWVudGg7XG4gICAgICAgIG1pbGxpcyA9IGV2ZW50Lm1pbGxpcztcbiAgICAgICAgLy9jb25zb2xlLmxvZyhub21pbmF0b3IsbnVtU2l4dGVlbnRoLHRpY2tzUGVyU2l4dGVlbnRoKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudCk7XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB1cGRhdGVQb3NpdGlvbihldmVudCk7XG4gICAgICAgIHVwZGF0ZUV2ZW50KGV2ZW50KTtcbiAgICB9XG5cbiAgICBsYXN0RXZlbnRUaWNrID0gZXZlbnQudGlja3M7XG4gIH1cbiAgc29uZy5sYXN0RXZlbnRUbXAgPSBldmVudDtcbn1cblxuXG5cblxuZnVuY3Rpb24gdXBkYXRlRXZlbnQoZXZlbnQpe1xuXG4gIC8vY29uc29sZS5sb2coZXZlbnQsIGJwbSwgbWlsbGlzUGVyVGljaywgdGlja3MsIG1pbGxpcyk7XG5cbiAgZXZlbnQuYnBtID0gYnBtO1xuICBldmVudC5ub21pbmF0b3IgPSBub21pbmF0b3I7XG4gIGV2ZW50LmRlbm9taW5hdG9yID0gZGVub21pbmF0b3I7XG5cbiAgZXZlbnQudGlja3NQZXJCYXIgPSB0aWNrc1BlckJhcjtcbiAgZXZlbnQudGlja3NQZXJCZWF0ID0gdGlja3NQZXJCZWF0O1xuICBldmVudC50aWNrc1BlclNpeHRlZW50aCA9IHRpY2tzUGVyU2l4dGVlbnRoO1xuXG4gIGV2ZW50LmZhY3RvciA9IGZhY3RvcjtcbiAgZXZlbnQubnVtU2l4dGVlbnRoID0gbnVtU2l4dGVlbnRoO1xuICBldmVudC5zZWNvbmRzUGVyVGljayA9IHNlY29uZHNQZXJUaWNrO1xuICBldmVudC5taWxsaXNQZXJUaWNrID0gbWlsbGlzUGVyVGljaztcblxuXG4gIGV2ZW50LnRpY2tzID0gdGlja3M7XG5cbiAgZXZlbnQubWlsbGlzID0gbWlsbGlzO1xuICBldmVudC5zZWNvbmRzID0gbWlsbGlzLzEwMDA7XG5cblxuICBldmVudC5iYXIgPSBiYXI7XG4gIGV2ZW50LmJlYXQgPSBiZWF0O1xuICBldmVudC5zaXh0ZWVudGggPSBzaXh0ZWVudGg7XG4gIGV2ZW50LnRpY2sgPSB0aWNrO1xuICAvL2V2ZW50LmJhcnNBc1N0cmluZyA9IChiYXIgKyAxKSArICc6JyArIChiZWF0ICsgMSkgKyAnOicgKyAoc2l4dGVlbnRoICsgMSkgKyAnOicgKyB0aWNrO1xuICB2YXIgdGlja0FzU3RyaW5nID0gdGljayA9PT0gMCA/ICcwMDAnIDogdGljayA8IDEwID8gJzAwJyArIHRpY2sgOiB0aWNrIDwgMTAwID8gJzAnICsgdGljayA6IHRpY2s7XG4gIGV2ZW50LmJhcnNBc1N0cmluZyA9IGJhciArICc6JyArIGJlYXQgKyAnOicgKyBzaXh0ZWVudGggKyAnOicgKyB0aWNrQXNTdHJpbmc7XG4gIGV2ZW50LmJhcnNBc0FycmF5ID0gW2JhciwgYmVhdCwgc2l4dGVlbnRoLCB0aWNrXTtcblxuXG4gIHZhciB0aW1lRGF0YSA9IGdldE5pY2VUaW1lKG1pbGxpcyk7XG5cbiAgZXZlbnQuaG91ciA9IHRpbWVEYXRhLmhvdXI7XG4gIGV2ZW50Lm1pbnV0ZSA9IHRpbWVEYXRhLm1pbnV0ZTtcbiAgZXZlbnQuc2Vjb25kID0gdGltZURhdGEuc2Vjb25kO1xuICBldmVudC5taWxsaXNlY29uZCA9IHRpbWVEYXRhLm1pbGxpc2Vjb25kO1xuICBldmVudC50aW1lQXNTdHJpbmcgPSB0aW1lRGF0YS50aW1lQXNTdHJpbmc7XG4gIGV2ZW50LnRpbWVBc0FycmF5ID0gdGltZURhdGEudGltZUFzQXJyYXk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2luZm99IGZyb20gJy4vdXRpbC5qcyc7XG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50LmpzJztcbmltcG9ydCB7QXVkaW9FdmVudH0gZnJvbSAnLi9hdWRpb19ldmVudC5qcyc7XG5cbmxldCBwYXJ0SWQgPSAwO1xuXG5cbmV4cG9ydCBjbGFzcyBQYXJ0e1xuXG4gIGNvbnN0cnVjdG9yKGNvbmZpZyA9IHt9KXtcbiAgICB0aGlzLmlkID0gJ1AnICsgcGFydElkKysgKyBEYXRlLm5vdygpO1xuICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gICAgdGhpcy50aWNrcyA9IDA7XG5cbiAgICB0aGlzLl9ldmVudHNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fbmV3RXZlbnRzID0gbmV3IE1hcCgpO1xuICAgIC8vdGhpcy5fbW92ZWRFdmVudHMgPSBuZXcgTWFwKCk7XG4gICAgLy90aGlzLl9yZW1vdmVkRXZlbnRzID0gbmV3IE1hcCgpO1xuICAgIC8vdGhpcy5fdHJhbnNwb3NlZEV2ZW50cyA9IG5ldyBNYXAoKTtcblxuICAgIGlmKGNvbmZpZy5ldmVudHMpe1xuICAgICAgdGhpcy5hZGRFdmVudHMoY29uZmlnLmV2ZW50cyk7XG4gICAgfVxuICAgIHRoaXMubmFtZSA9IGNvbmZpZy5uYW1lIHx8IHRoaXMuaWQ7XG4gICAgY29uZmlnID0gbnVsbDtcbiAgfVxuXG4gIGFkZEV2ZW50KGV2ZW50KXtcbiAgICBpZihldmVudCBpbnN0YW5jZW9mIE1JRElFdmVudCB8fCBldmVudCBpbnN0YW5jZW9mIEF1ZGlvRXZlbnQpe1xuICAgICAgZXZlbnQuc3RhdGUgPSAnbmV3JztcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIHRoaXMuX2V2ZW50c01hcC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICAgIH1cbiAgfVxuXG4gIGFkZEV2ZW50cyhldmVudHMpe1xuICAgIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICAgIHRoaXMuYWRkRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG5cbiAgcmVtb3ZlRXZlbnQoZXZlbnQpe1xuICAgIGlmKHRoaXMuX2V2ZW50c01hcC5oYXMoZXZlbnQuaWQpKXtcbiAgICAgIGV2ZW50LnJlc2V0KHRydWUsIGZhbHNlLCBmYWxzZSk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgICB9XG4gIH1cblxuICByZW1vdmVFdmVudHMoZXZlbnRzKXtcbiAgICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgICB0aGlzLnJlbW92ZUV2ZW50KGV2ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gIH1cblxuXG4gIG1vdmVFdmVudChldmVudCwgdGlja3Mpe1xuICAgIGlmKHRoaXMuX2V2ZW50c01hcC5oYXMoZXZlbnQuaWQpKXtcbiAgICAgIGV2ZW50Lm1vdmUodGlja3MpO1xuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gICAgfVxuICB9XG5cbiAgbW92ZUV2ZW50cyhldmVudHMpe1xuICAgIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICAgIHRoaXMubW92ZUV2ZW50KGV2ZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gIH1cblxuXG4gIHRyYW5zcG9zZUV2ZW50KGV2ZW50LCBzZW1pdG9uZXMpe1xuICAgIGlmKHRoaXMuX2V2ZW50c01hcC5oYXMoZXZlbnQuaWQpKXtcbiAgICAgIGlmKGV2ZW50LnR5cGUgIT09IDEyOCAmJiBldmVudC50eXBlICE9PSAxNDQpe1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBldmVudC50cmFuc3Bvc2Uoc2VtaXRvbmVzKTtcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICAgIH1cbiAgfVxuXG4gIHRyYW5zcG9zZUV2ZW50cyhldmVudHMpe1xuICAgIGZvcihsZXQgZXZlbnQgb2YgZXZlbnRzKXtcbiAgICAgIHRoaXMudHJhbnNwb3NlRXZlbnQoZXZlbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG4gIGdldEV2ZW50cygpe1xuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlKXtcbiAgICAgIHRoaXMudXBkYXRlKCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9ldmVudHM7XG4gIH1cblxuICB1cGRhdGUoKXtcblxuICAgIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGxldCB1cGRhdGVFdmVudHMgPSBmYWxzZTtcbi8qXG4gICAgQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNNYXAudmFsdWVzKCkpLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBpZihldmVudC5zdGF0ZSA9PT0gJ3JlbW92ZWQnKXtcbiAgICAgICAgdGhpcy5fZXZlbnRzTWFwLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICAgIHRoaXMuX3JlbW92ZWRFdmVudHMuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9ZWxzZSBpZihldmVudC5zdGF0ZSA9PT0gJ25ldycpe1xuICAgICAgICB0aGlzLl9ldmVudHNNYXAuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICAgIHRoaXMuX25ld0V2ZW50cy5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgICAgbnVtYmVyT2ZFdmVudHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKGV2ZW50LnN0YXRlID09PSAnbW92ZWQnKXtcbiAgICAgICAgdGhpcy5fbW92ZWRFdmVudHMuc2V0KGV2ZW50LmlkLCBldmVudCk7XG4gICAgICB9ZWxzZSBpZihldmVudC5zdGF0ZSA9PT0gJ3RyYW5zcG9zZWQnKXtcbiAgICAgICAgdGhpcy5fdHJhbnNwb3NlZEV2ZW50cy5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgIH1cbiAgICAgIGV2ZW50LnN0YXRlID0gJ2NsZWFuJztcbiAgICB9KTtcbiovXG4gICAgQXJyYXkuZnJvbSh0aGlzLl9ldmVudHNNYXAudmFsdWVzKCkpLmZvckVhY2goKGV2ZW50KSA9PiB7XG4gICAgICBpZihldmVudC5zdGF0ZSA9PT0gJ3JlbW92ZWQnKXtcbiAgICAgICAgdGhpcy5fZXZlbnRzTWFwLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICAgIC8vIGluIGNhc2UgYSBuZXcgZXZlbnQgZ2V0cyBkZWxldGVkIGJlZm9yZSBwYXJ0LnVwZGF0ZSgpIGlzIGNhbGxlZFxuICAgICAgICB0aGlzLl9uZXdFdmVudHMuZGVsZXRlKGV2ZW50LmlkKTtcbiAgICAgICAgbnVtYmVyT2ZFdmVudHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKGV2ZW50LnN0YXRlID09PSAnbmV3Jyl7XG4gICAgICAgIHRoaXMuX2V2ZW50c01hcC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgICAgdGhpcy5fbmV3RXZlbnRzLnNldChldmVudC5pZCwgZXZlbnQpO1xuICAgICAgICBudW1iZXJPZkV2ZW50c0hhc0NoYW5nZWQgPSB0cnVlO1xuICAgICAgfWVsc2UgaWYoZXZlbnQuc3RhdGUgIT09ICdjbGVhbicpe1xuICAgICAgICB1cGRhdGVFdmVudHMgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaWYgbnVtYmVyIG9mIGV2ZW50cyBoYXMgY2hhbmdlZCB1cGRhdGUgdGhlIF9ldmVudHMgYXJyYXkgYW5kIHRoZSBfZXZlbnRzTWFwIG1hcFxuICAgIGlmKG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICAgIEFycmF5LmZyb20odGhpcy5fZXZlbnRzTWFwLnZhbHVlcygpKS5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9XG5cblxuICAgIGlmKG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9PT0gdHJ1ZSB8fCB1cGRhdGVFdmVudHMgPT09IHRydWUpe1xuICAgICAgdGhpcy5fZXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgICB9XG5cbiAgICAvLyBjcmVhdGUgbm90ZXMgLT4gQFRPRE86IG9ubHkgbmVjZXNzYXJ5IGlmIG51bWJlciBvZiBldmVudHMgaGFzIGNoYW5nZWRcbiAgICBsZXQgbm90ZXMgPSB7fTtcbiAgICBsZXQgbiA9IDA7XG4gICAgZm9yKGxldCBldmVudCBvZiB0aGlzLl9ldmVudHMpe1xuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgbm90ZXNbZXZlbnQubm90ZU51bWJlcl0gPSBldmVudDtcbiAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgIGxldCBub3RlT24gPSBub3Rlc1tldmVudC5ub3RlTnVtYmVyXTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhldmVudC5ub3RlTnVtYmVyLCBub3RlT24pO1xuICAgICAgICBsZXQgbm90ZU9mZiA9IGV2ZW50O1xuICAgICAgICBpZihub3RlT24gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgaW5mbygnbm8gbm90ZSBvbiBldmVudCEnLCBuKyspO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIG5vdGVPbi5ub3RlT2ZmID0gbm90ZU9mZjtcbiAgICAgICAgbm90ZU9mZi5ub3RlT24gPSBub3RlT247XG4gICAgICAgIG5vdGVPbi5kdXJhdGlvblRpY2tzID0gbm90ZU9mZi50aWNrcyAtIG5vdGVPbi50aWNrcztcbiAgICAgICAgZGVsZXRlIG5vdGVzW2V2ZW50Lm5vdGVOdW1iZXJdO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX25lZWRzVXBkYXRlID0gZmFsc2U7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVBhcnQoY29uZmlnKXtcbiAgcmV0dXJuIG5ldyBQYXJ0KGNvbmZpZyk7XG59IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZ2V0Q29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcblxuXG5sZXQgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG5cbmNsYXNzIFNhbXBsZXtcblxuICBjb25zdHJ1Y3RvcihzYW1wbGVEYXRhLCBldmVudCl7XG4gICAgaWYoc2FtcGxlRGF0YSA9PT0gLTEpe1xuICAgICAgLy8gY3JlYXRlIHNpbXBsZSBzeW50aCBzYW1wbGVcbiAgICAgIHRoaXMuc291cmNlID0gY29uZmlnLmNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpO1xuICAgICAgdGhpcy5zb3VyY2UudHlwZSA9ICdzaW5lJztcbiAgICAgIHRoaXMuc291cmNlLmZyZXF1ZW5jeS52YWx1ZSA9IGV2ZW50LmZyZXF1ZW5jeTtcbiAgICAgIHRoaXMuc291cmNlLmNvbm5lY3QoY29uZmlnLmRlc3RpbmF0aW9uKTtcbiAgICB9XG4gIH1cblxuICBzdGFydCgpe1xuICAgIGNvbnNvbGUubG9nKHRoaXMuc291cmNlKTtcbiAgICB0aGlzLnNvdXJjZS5zdGFydCgpO1xuICB9XG59XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU2FtcGxlKHNhbXBsZURhdGEsIGV2ZW50KXtcbiAgcmV0dXJuIG5ldyBTYW1wbGUoc2FtcGxlRGF0YSwgZXZlbnQpO1xufSIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHt0eXBlU3RyaW5nfSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IGdldENvbmZpZyBmcm9tICcuL2NvbmZpZyc7XG5pbXBvcnQgY3JlYXRlTUlESUV2ZW50IGZyb20gJy4vbWlkaV9ldmVudCc7XG5cbmxldCBjb25maWcgPSBnZXRDb25maWcoKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NoZWR1bGVye1xuXG4gIGNvbnN0cnVjdG9yKHNvbmcpe1xuICAgIHRoaXMuc29uZyA9IHNvbmc7XG4gICAgdGhpcy5sb29wZWQgPSBmYWxzZTtcbiAgICB0aGlzLm5vdGVzID0ge307XG4gICAgdGhpcy5hdWRpb0V2ZW50cyA9IHt9O1xuICB9XG5cblxuICB1cGRhdGVTb25nKCl7XG4gICAgLy90aGlzLmV2ZW50cyA9IHRoaXMuc29uZy5ldmVudHNNaWRpQXVkaW9NZXRyb25vbWU7XG4gICAgdGhpcy5ldmVudHMgPSB0aGlzLnNvbmcuZ2V0RXZlbnRzKCk7XG4gICAgdGhpcy5udW1FdmVudHMgPSB0aGlzLmV2ZW50cy5sZW5ndGg7XG4gICAgdGhpcy5pbmRleCA9IDA7XG4gICAgdGhpcy5tYXh0aW1lID0gMDtcbiAgICB0aGlzLm5vdGVzID0ge307XG4gICAgdGhpcy5hdWRpb0V2ZW50cyA9IHRoaXMuc29uZy5nZXRBdWRpb0V2ZW50cygpO1xuICAgIHRoaXMubnVtQXVkaW9FdmVudHMgPSB0aGlzLmF1ZGlvRXZlbnRzLmxlbmd0aDtcbiAgICB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzID0ge307XG4gICAgdGhpcy5sb29wZWQgPSBmYWxzZTtcbiAgICB0aGlzLnNldEluZGV4KHRoaXMuc29uZy5taWxsaXMpO1xuICAgIC8vY29uc29sZS5sb2coJ1NjaGVkdWxlci5zZXRJbmRleCcsIHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKTtcbiAgfVxuXG5cbiAgLy8gZ2V0IHRoZSBpbmRleCBvZiB0aGUgZXZlbnQgdGhhdCBoYXMgaXRzIG1pbGxpcyB2YWx1ZSBhdCBvciByaWdodCBhZnRlciB0aGUgcHJvdmlkZWQgbWlsbGlzIHZhbHVlXG4gIHNldEluZGV4KG1pbGxpcyl7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvcihsZXQgZXZlbnQgb2YgdGhpcy5ldmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzID49IG1pbGxpcyl7XG4gICAgICAgIHRoaXMuaW5kZXggPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGkrKztcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZyhtaWxsaXMpO1xuICAgIHRoaXMuYmV5b25kTG9vcCA9IGZhbHNlO1xuICAgIGlmKG1pbGxpcyA+IHRoaXMuc29uZy5sb29wRW5kKXtcbiAgICAgIHRoaXMuYmV5b25kTG9vcCA9IHRydWU7XG4gICAgfVxuXG4gICAgdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyA9IHt9O1xuICB9XG5cbiAgLypcbiAgICBBIGRhbmdsaW5nIGF1ZGlvIGV2ZW50IHN0YXJ0IGJlZm9yZSwgYW5kIGVuZHMgYWZ0ZXIgdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIHBsYXloZWFkLiBXZSBoYXZlIHRvIGNhbGN1bGF0ZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuXG4gICAgdGhlIHN0YXJ0IG9mIHRoZSBzYW1wbGUgKGV2ZW50Lm1pbGxpcykgYW5kIHRoZSBwb3NpdGlvbiBvZiB0aGUgcGxheWhlYWQgKHNvbmcubWlsbGlzKS4gVGhpcyB2YWx1ZSBpcyB0aGUgcGxheWhlYWRPZmZzZXQsIGFuZCB0aGUgc2FtcGxlXG4gICAgc3RhcnRzIHRoZSBudW1iZXIgb2Ygc2Vjb25kcyBvZiB0aGUgcGxheWhlYWRPZmZzZXQgaW50byB0aGUgc2FtcGxlLlxuXG4gICAgQWxzbyB0aGUgYXVkaW8gZXZlbnQgaXMgc2NoZWR1bGVkIHRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9mIHRoZSBwbGF5aGVhZCBsYXRlciB0byBrZWVwIGl0IGluIHN5bmMgd2l0aCB0aGUgcmVzdCBvZiB0aGUgc29uZy5cblxuICAgIFRoZSBwbGF5aGVhZE9mZnNldCBpcyBhcHBsaWVkIHRvIHRoZSBhdWRpbyBzYW1wbGUgaW4gYXVkaW9fdHJhY2suanNcbiAgKi9cbiAgZ2V0RGFuZ2xpbmdBdWRpb0V2ZW50cyhtaWxsaXMsIGV2ZW50cyl7XG4gICAgbGV0IG51bSA9IDA7XG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuYXVkaW9FdmVudHMpe1xuICAgICAgaWYoZXZlbnQubWlsbGlzIDwgbWlsbGlzICYmIGV2ZW50LmVuZE1pbGxpcyA+IG1pbGxpcyl7XG4gICAgICAgIGV2ZW50LnBsYXloZWFkT2Zmc2V0ID0gKG1pbGxpcyAtIGV2ZW50Lm1pbGxpcyk7XG4gICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnN0YXJ0VGltZSArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzICsgZXZlbnQucGxheWhlYWRPZmZzZXQ7XG4gICAgICAgIGV2ZW50LnBsYXloZWFkT2Zmc2V0IC89IDEwMDA7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbZXZlbnQuaWRdID0gZXZlbnQ7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ2dldERhbmdsaW5nQXVkaW9FdmVudHMnLCBldmVudC5pZCk7XG4gICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgbnVtKys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgZXZlbnQucGxheWhlYWRPZmZzZXQgPSAwO1xuICAgICAgfVxuICAgICAgLy9jb25zb2xlLmxvZygncGxheWhlYWRPZmZzZXQnLCBldmVudC5wbGF5aGVhZE9mZnNldCk7XG4gICAgfVxuICAgIC8vY29uc29sZS5sb2coJ2dldERhbmdsaW5nQXVkaW9FdmVudHMnLCBudW0pO1xuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIGdldEV2ZW50cygpe1xuICAgIHZhciBpLCBldmVudCwgZXZlbnRzID0gW10sIG5vdGUsIG5vdGVPbiwgbm90ZU9mZiwgZW5kTWlsbGlzLCBlbmRUaWNrcywgZGlmZiwgYnVmZmVydGltZSwgYXVkaW9FdmVudDtcblxuICAgIGJ1ZmZlcnRpbWUgPSBjb25maWcuYnVmZmVyVGltZSAqIDEwMDA7XG4gICAgaWYodGhpcy5zb25nLmRvTG9vcCA9PT0gdHJ1ZSAmJiB0aGlzLnNvbmcubG9vcER1cmF0aW9uIDwgYnVmZmVydGltZSl7XG4gICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmdNaWxsaXMgKyB0aGlzLnNvbmcubG9vcER1cmF0aW9uIC0gMTtcbiAgICAgIC8vY29uc29sZS5sb2cobWF4dGltZSwgdGhpcy5zb25nLmxvb3BEdXJhdGlvbik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5zb25nLmRvTG9vcCA9PT0gdHJ1ZSl7XG5cbiAgICAgIGlmKHRoaXMubWF4dGltZSA+PSB0aGlzLnNvbmcubG9vcEVuZCAmJiB0aGlzLmJleW9uZExvb3AgPT09IGZhbHNlKXtcbiAgICAgIC8vaWYodGhpcy5tYXh0aW1lID49IHRoaXMuc29uZy5sb29wRW5kICYmIHRoaXMucHJldk1heHRpbWUgPCB0aGlzLnNvbmcubG9vcEVuZCl7XG4gICAgICAvL2lmKHRoaXMubWF4dGltZSA+PSB0aGlzLnNvbmcubG9vcEVuZCAmJiB0aGlzLnNvbmcuanVtcCAhPT0gdHJ1ZSl7XG5cbiAgICAgICAgZGlmZiA9IHRoaXMubWF4dGltZSAtIHRoaXMuc29uZy5sb29wRW5kO1xuICAgICAgICB0aGlzLm1heHRpbWUgPSB0aGlzLnNvbmcubG9vcFN0YXJ0ICsgZGlmZjtcblxuICAgICAgICAvL2NvbnNvbGUubG9nKG1heHRpbWUsIHRoaXMuc29uZy5sb29wRW5kLCBkaWZmKTtcbiAgICAgICAgaWYodGhpcy5sb29wZWQgPT09IGZhbHNlKXtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29uZy5taWxsaXMsIG1heHRpbWUsIGRpZmYpO1xuICAgICAgICAgIHRoaXMubG9vcGVkID0gdHJ1ZTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCdMT09QJywgdGhpcy5zb25nLmxvb3BFbmQsIHRoaXMubWF4dGltZSk7XG4gICAgICAgICAgZm9yKGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICAgICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuICAgICAgICAgICAgaWYoZXZlbnQubWlsbGlzIDwgdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCcgICcsIGV2ZW50LnRyYWNrLm5hbWUsIG1heHRpbWUsIHRoaXMuaW5kZXgsIHRoaXMubnVtRXZlbnRzKTtcbiAgICAgICAgICAgICAgZXZlbnQudGltZSA9IHRoaXMuc3RhcnRUaW1lICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG4gICAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgICAgdGhpcy5pbmRleCsrO1xuICAgICAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgbm90ZXMtPiBtb3ZlIHRoZSBub3RlIG9mZiBldmVudCB0byB0aGUgcG9zaXRpb24gb2YgdGhlIHJpZ2h0IGxvY2F0b3IgKGVuZCBvZiB0aGUgbG9vcClcbiAgICAgICAgICBlbmRUaWNrcyA9IHRoaXMuc29uZy5sb29wRW5kVGlja3MgLSAxO1xuICAgICAgICAgIGVuZE1pbGxpcyA9IHRoaXMuc29uZy5nZXRQb3NpdGlvbigndGlja3MnLCBlbmRUaWNrcykubWlsbGlzO1xuICAgICAgICAgIGZvcihpIGluIHRoaXMubm90ZXMpe1xuICAgICAgICAgICAgaWYodGhpcy5ub3Rlcy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgIG5vdGUgPSB0aGlzLm5vdGVzW2ldO1xuICAgICAgICAgICAgICBub3RlT24gPSBub3RlLm5vdGVPbjtcbiAgICAgICAgICAgICAgbm90ZU9mZiA9IG5vdGUubm90ZU9mZjtcbiAgICAgICAgICAgICAgaWYobm90ZU9mZi5taWxsaXMgPD0gdGhpcy5zb25nLmxvb3BFbmQpe1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGV2ZW50ID0gY3JlYXRlTUlESUV2ZW50KGVuZFRpY2tzLCAxMjgsIG5vdGVPbi5kYXRhMSwgMCk7XG4gICAgICAgICAgICAgIGV2ZW50Lm1pbGxpcyA9IGVuZE1pbGxpcztcbiAgICAgICAgICAgICAgZXZlbnQucGFydCA9IG5vdGVPbi5wYXJ0O1xuICAgICAgICAgICAgICBldmVudC50cmFjayA9IG5vdGVPbi50cmFjaztcbiAgICAgICAgICAgICAgZXZlbnQubWlkaU5vdGUgPSBub3RlT24ubWlkaU5vdGU7XG4gICAgICAgICAgICAgIGV2ZW50LnRpbWUgPSB0aGlzLnN0YXJ0VGltZSArIGV2ZW50Lm1pbGxpcyAtIHRoaXMuc29uZ1N0YXJ0TWlsbGlzO1xuICAgICAgICAgICAgICBldmVudHMucHVzaChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN0b3Agb3ZlcmZsb3dpbmcgYXVkaW8gc2FtcGxlc1xuICAgICAgICAgIGZvcihpIGluIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHMpe1xuICAgICAgICAgICAgaWYodGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cy5oYXNPd25Qcm9wZXJ0eShpKSl7XG4gICAgICAgICAgICAgIGF1ZGlvRXZlbnQgPSB0aGlzLnNjaGVkdWxlZEF1ZGlvRXZlbnRzW2ldO1xuICAgICAgICAgICAgICBpZihhdWRpb0V2ZW50LmVuZE1pbGxpcyA+IHRoaXMuc29uZy5sb29wRW5kKXtcbiAgICAgICAgICAgICAgICBhdWRpb0V2ZW50LnN0b3BTYW1wbGUodGhpcy5zb25nLmxvb3BFbmQvMTAwMCk7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbaV07XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnc3RvcHBpbmcgYXVkaW8gZXZlbnQnLCBpKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm5vdGVzID0ge307XG4gICAgICAgICAgdGhpcy5zZXRJbmRleCh0aGlzLnNvbmcubG9vcFN0YXJ0KTtcbiAgICAgICAgICB0aGlzLnNvbmcuc3RhcnRUaW1lICs9IHRoaXMuc29uZy5sb29wRHVyYXRpb247XG4gICAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLnNvbmcuc3RhcnRUaW1lO1xuICAgICAgICAgIC8vIGdldCB0aGUgYXVkaW8gZXZlbnRzIHRoYXQgc3RhcnQgYmVmb3JlIHNvbmcubG9vcFN0YXJ0XG4gICAgICAgICAgdGhpcy5nZXREYW5nbGluZ0F1ZGlvRXZlbnRzKHRoaXMuc29uZy5sb29wU3RhcnQsIGV2ZW50cyk7XG4gICAgICAgIH1cbiAgICAgIH1lbHNle1xuICAgICAgICB0aGlzLmxvb3BlZCA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmKHRoaXMuZmlyc3RSdW4gPT09IHRydWUpe1xuICAgICAgdGhpcy5nZXREYW5nbGluZ0F1ZGlvRXZlbnRzKHRoaXMuc29uZy5taWxsaXMsIGV2ZW50cyk7XG4gICAgICB0aGlzLmZpcnN0UnVuID0gZmFsc2U7XG4gICAgfVxuXG4gICAgZm9yKGkgPSB0aGlzLmluZGV4OyBpIDwgdGhpcy5udW1FdmVudHM7IGkrKyl7XG4gICAgICBldmVudCA9IHRoaXMuZXZlbnRzW2ldO1xuXG4gICAgICBpZihldmVudC5taWxsaXMgPCB0aGlzLm1heHRpbWUpe1xuICAgICAgICAvLyBpZih0aGlzLnNvbmcuYmFyID49IDYgJiYgZXZlbnQudHJhY2submFtZSA9PT0gJ1NvbmF0YSAjIDMnKXtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKCcgIHNvbmc6JywgdGhpcy5zb25nLm1pbGxpcywgJ2V2ZW50OicsIGV2ZW50Lm1pbGxpcywgKCcoJyArIGV2ZW50LnR5cGUgKyAnKScpLCAnbWF4OicsIG1heHRpbWUsICdpZDonLCBldmVudC5taWRpTm90ZS5pZCk7XG4gICAgICAgIC8vIH1cbiAgICAgICAgZXZlbnQudGltZSA9IHRoaXMuc3RhcnRUaW1lICsgZXZlbnQubWlsbGlzIC0gdGhpcy5zb25nU3RhcnRNaWxsaXM7XG5cbiAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0IHx8IGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgaWYoZXZlbnQubWlkaU5vdGUgIT09IHVuZGVmaW5lZCAmJiBldmVudC5taWRpTm90ZS5ub3RlT2ZmICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAgICAgdGhpcy5ub3Rlc1tldmVudC5taWRpTm90ZS5pZF0gPSBldmVudC5taWRpTm90ZTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDEyOCl7XG4gICAgICAgICAgICAgIGRlbGV0ZSB0aGlzLm5vdGVzW2V2ZW50Lm1pZGlOb3RlLmlkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09ICdhdWRpbycpe1xuICAgICAgICAgIGlmKHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbZXZlbnQuaWRdICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgICAgLy8gQFRPRE86IGRlbGV0ZSB0aGUgZW50cnkgaW4gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50cyBhZnRlciB0aGUgc2FtcGxlIGhhcyBmaW5pc2hlZFxuICAgICAgICAgICAgLy8gLT4gdGhpcyBoYXBwZW5zIHdoZW4geW91IG1vdmUgdGhlIHBsYXloZWFkIG91dHNpZGUgYSBsb29wIGlmIGRvTG9vcCBpcyB0cnVlXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKCd0aGlzIHNob3VsZG5cXCd0IGhhcHBlbiEnKTtcbiAgICAgICAgICAgIC8vY29udGludWU7XG4gICAgICAgICAgICBhdWRpb0V2ZW50ID0gdGhpcy5zY2hlZHVsZWRBdWRpb0V2ZW50c1tldmVudC5pZF07XG4gICAgICAgICAgICBpZihhdWRpb0V2ZW50LnNhbXBsZSAhPT0gdW5kZWZpbmVkICYmIGF1ZGlvRXZlbnQuc2FtcGxlLnNvdXJjZSAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgICAgYXVkaW9FdmVudC5zdG9wU2FtcGxlKDApO1xuICAgICAgICAgICAgLy8gfWVsc2V7XG4gICAgICAgICAgICAvLyAgICAgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc2NoZWR1bGVkQXVkaW9FdmVudHNbZXZlbnQuaWRdID0gZXZlbnQ7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZygnc2NoZWR1bGluZycsIGV2ZW50LmlkKTtcbiAgICAgICAgICAvLyB0aGUgc2NoZWR1bGluZyB0aW1lIGhhcyB0byBiZSBjb21wZW5zYXRlZCB3aXRoIHRoZSBwbGF5aGVhZE9mZnNldCAoaW4gbWlsbGlzKVxuICAgICAgICAgIGV2ZW50LnRpbWUgPSBldmVudC50aW1lICsgKGV2ZW50LnBsYXloZWFkT2Zmc2V0ICogMTAwMCk7XG4gICAgICAgICAgZXZlbnRzLnB1c2goZXZlbnQpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAvLyBjb250cm9sbGVyIGV2ZW50c1xuICAgICAgICAgIGV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluZGV4Kys7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBldmVudHM7XG4gIH1cblxuXG4gIHVwZGF0ZSgpe1xuICAgIHZhciBpLFxuICAgICAgZXZlbnQsXG4gICAgICBudW1FdmVudHMsXG4gICAgICBldmVudHMsXG4gICAgICB0cmFjayxcbiAgICAgIGNoYW5uZWw7XG5cbiAgICB0aGlzLnByZXZNYXh0aW1lID0gdGhpcy5tYXh0aW1lO1xuXG4gICAgaWYodGhpcy5zb25nLnByZWNvdW50aW5nID09PSB0cnVlKXtcbiAgICAgIHRoaXMuc29uZ01pbGxpcyA9IHRoaXMuc29uZy5tZXRyb25vbWUubWlsbGlzO1xuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nTWlsbGlzICsgKGNvbmZpZy5idWZmZXJUaW1lICogMTAwMCk7XG4gICAgICBldmVudHMgPSBBcnJheS5mcm9tKHRoaXMuc29uZy5tZXRyb25vbWUuZ2V0UHJlY291bnRFdmVudHModGhpcy5tYXh0aW1lKSk7XG5cbiAgICAgIGlmKHRoaXMubWF4dGltZSA+IHRoaXMuc29uZy5tZXRyb25vbWUuZW5kTWlsbGlzKXtcbiAgICAgICAgLy8gc3RhcnQgc2NoZWR1bGluZyBldmVudHMgb2YgdGhlIHNvbmcgLT4gYWRkIHRoZSBmaXJzdCBldmVudHMgb2YgdGhlIHNvbmdcbiAgICAgICAgdGhpcy5zb25nTWlsbGlzID0gMDsvL3RoaXMuc29uZy5taWxsaXM7XG4gICAgICAgIHRoaXMubWF4dGltZSA9IHRoaXMuc29uZy5taWxsaXMgKyAoY29uZmlnLmJ1ZmZlclRpbWUgKiAxMDAwKTtcbiAgICAgICAgdGhpcy5zdGFydFRpbWUgPSB0aGlzLnNvbmcuc3RhcnRUaW1lO1xuICAgICAgICB0aGlzLnN0YXJ0VGltZTIgPSB0aGlzLnNvbmcuc3RhcnRUaW1lMjtcbiAgICAgICAgdGhpcy5zb25nU3RhcnRNaWxsaXMgPSB0aGlzLnNvbmcuc3RhcnRNaWxsaXM7XG4gICAgICAgIGV2ZW50cyA9IHRoaXMuZ2V0RXZlbnRzKCk7XG4gICAgICB9XG4gICAgfWVsc2V7XG4gICAgICB0aGlzLnNvbmdNaWxsaXMgPSB0aGlzLnNvbmcubWlsbGlzO1xuICAgICAgdGhpcy5tYXh0aW1lID0gdGhpcy5zb25nTWlsbGlzICsgKGNvbmZpZy5idWZmZXJUaW1lICogMTAwMCk7XG4gICAgICB0aGlzLnN0YXJ0VGltZSA9IHRoaXMuc29uZy5zdGFydFRpbWU7XG4gICAgICB0aGlzLnN0YXJ0VGltZTIgPSB0aGlzLnNvbmcuc3RhcnRUaW1lMjtcbiAgICAgIHRoaXMuc29uZ1N0YXJ0TWlsbGlzID0gdGhpcy5zb25nLnN0YXJ0TWlsbGlzO1xuICAgICAgZXZlbnRzID0gdGhpcy5nZXRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBudW1FdmVudHMgPSBldmVudHMubGVuZ3RoO1xuXG4gICAgLy9mb3IoaSA9IGV2ZW50cy5sZW5ndGggLSAxOyBpID49IDA7IGktLSl7XG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtRXZlbnRzOyBpKyspe1xuICAgICAgZXZlbnQgPSBldmVudHNbaV07XG4gICAgICB0cmFjayA9IGV2ZW50LnRyYWNrO1xuICAgICAgLy9jb25zb2xlLmxvZyh0cmFjayk7XG4gICAgICBpZihcbiAgICAgICAgdHJhY2sgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBldmVudC5tdXRlID09PSB0cnVlIHx8XG4gICAgICAgIGV2ZW50LnBhcnQubXV0ZSA9PT0gdHJ1ZSB8fFxuICAgICAgICBldmVudC50cmFjay5tdXRlID09PSB0cnVlIHx8XG4gICAgICAgIChldmVudC50cmFjay50eXBlID09PSAnbWV0cm9ub21lJyAmJiB0aGlzLnNvbmcudXNlTWV0cm9ub21lID09PSBmYWxzZSlcbiAgICAgICAgKVxuICAgICAge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYoZXZlbnQudHlwZSA9PT0gJ2F1ZGlvJyl7XG4gICAgICAgIGV2ZW50LnRpbWUgLz0gMTAwMDtcbiAgICAgICAgdHJhY2suYXVkaW8ucHJvY2Vzc0V2ZW50KGV2ZW50KTtcbiAgICAgIH1lbHNle1xuXG4gICAgICAgIGlmKHRyYWNrLnJvdXRlVG9NaWRpT3V0ID09PSBmYWxzZSl7XG4gICAgICAgICAgLy8gaWYoZXZlbnQudHlwZSA9PT0gMTQ0KXtcbiAgICAgICAgICAvLyAgICAgY29uc29sZS5sb2coZXZlbnQudGltZS8xMDAwLCBzZXF1ZW5jZXIuZ2V0VGltZSgpLCBldmVudC50aW1lLzEwMDAgLSBzZXF1ZW5jZXIuZ2V0VGltZSgpKTtcbiAgICAgICAgICAvLyB9XG4gICAgICAgICAgZXZlbnQudGltZSAvPSAxMDAwO1xuICAgICAgICAgIC8vY29uc29sZS5sb2coJ3NjaGVkdWxlZCcsIGV2ZW50LnR5cGUsIGV2ZW50LnRpbWUsIGV2ZW50Lm1pZGlOb3RlLmlkKTtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKHRyYWNrLmluc3RydW1lbnQucHJvY2Vzc0V2ZW50KTtcbiAgICAgICAgICB0cmFjay5pbnN0cnVtZW50LnByb2Nlc3NFdmVudChldmVudCk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIGNoYW5uZWwgPSB0cmFjay5jaGFubmVsO1xuICAgICAgICAgIGlmKGNoYW5uZWwgPT09ICdhbnknIHx8IGNoYW5uZWwgPT09IHVuZGVmaW5lZCB8fCBpc05hTihjaGFubmVsKSA9PT0gdHJ1ZSl7XG4gICAgICAgICAgICBjaGFubmVsID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yKGxldCBrZXkgaW4gT2JqZWN0LmtleXModHJhY2subWlkaU91dHB1dHMpKXtcbiAgICAgICAgICAgIGxldCBtaWRpT3V0cHV0ID0gdHJhY2subWlkaU91dHB1dHNba2V5XTtcbiAgICAgICAgICAgIGlmKGV2ZW50LnR5cGUgPT09IDEyOCB8fCBldmVudC50eXBlID09PSAxNDQgfHwgZXZlbnQudHlwZSA9PT0gMTc2KXtcbiAgICAgICAgICAgICAgLy9taWRpT3V0cHV0LnNlbmQoW2V2ZW50LnR5cGUsIGV2ZW50LmRhdGExLCBldmVudC5kYXRhMl0sIGV2ZW50LnRpbWUgKyBzZXF1ZW5jZXIubWlkaU91dExhdGVuY3kpO1xuICAgICAgICAgICAgICBtaWRpT3V0cHV0LnNlbmQoW2V2ZW50LnR5cGUgKyBjaGFubmVsLCBldmVudC5kYXRhMSwgZXZlbnQuZGF0YTJdLCBldmVudC50aW1lKTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGV2ZW50LnR5cGUgPT09IDE5MiB8fCBldmVudC50eXBlID09PSAyMjQpe1xuICAgICAgICAgICAgICBtaWRpT3V0cHV0LnNlbmQoW2V2ZW50LnR5cGUgKyBjaGFubmVsLCBldmVudC5kYXRhMV0sIGV2ZW50LnRpbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICAvLyBuZWVkZWQgZm9yIFNvbmcucmVzZXRFeHRlcm5hbE1pZGlEZXZpY2VzKClcbiAgICAgICAgICB0aGlzLmxhc3RFdmVudFRpbWUgPSBldmVudC50aW1lO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICB1bnNjaGVkdWxlKCl7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgZXZlbnRzID0gW10sXG4gICAgICBpLCBlLCB0cmFjaywgaW5zdHJ1bWVudDtcblxuICAgIGxldCBsb29wID0gZnVuY3Rpb24oZGF0YSwgaSwgbWF4aSwgZXZlbnRzKXtcbiAgICAgIHZhciBhcmc7XG4gICAgICBmb3IoaSA9IDA7IGkgPCBtYXhpOyBpKyspe1xuICAgICAgICBhcmcgPSBkYXRhW2ldO1xuICAgICAgICBpZihhcmcgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1lbHNlIGlmKGFyZy5jbGFzc05hbWUgPT09ICdNaWRpRXZlbnQnKXtcbiAgICAgICAgICBldmVudHMucHVzaChhcmcpO1xuICAgICAgICB9ZWxzZSBpZihhcmcuY2xhc3NOYW1lID09PSAnTWlkaU5vdGUnKXtcbiAgICAgICAgICBldmVudHMucHVzaChhcmcubm90ZU9uKTtcbiAgICAgICAgfWVsc2UgaWYodHlwZVN0cmluZyhhcmcpID09PSAnYXJyYXknKXtcbiAgICAgICAgICBsb29wKGFyZywgMCwgYXJnLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBsb29wKGFyZ3MsIDAsIGFyZ3MubGVuZ3RoLCBldmVudHMpO1xuXG4gICAgZm9yKGkgPSBldmVudHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pe1xuICAgICAgZSA9IGV2ZW50c1tpXTtcbiAgICAgIHRyYWNrID0gZS50cmFjaztcbiAgICAgIGluc3RydW1lbnQgPSB0cmFjay5pbnN0cnVtZW50O1xuICAgICAgaWYoaW5zdHJ1bWVudCl7XG4gICAgICAgIGluc3RydW1lbnQudW5zY2hlZHVsZUV2ZW50KGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgcmVzY2hlZHVsZSgpe1xuICAgIHZhciBpLCB0cmFjayxcbiAgICAgIG51bVRyYWNrcyA9IHRoaXMuc29uZy5udW1UcmFja3MsXG4gICAgICB0cmFja3MgPSB0aGlzLnNvbmcudHJhY2tzO1xuXG4gICAgZm9yKGkgPSAwOyBpIDwgbnVtVHJhY2tzOyBpKyspe1xuICAgICAgdHJhY2sgPSB0cmFja3NbaV07XG4gICAgICB0cmFjay5pbnN0cnVtZW50LnJlc2NoZWR1bGUodGhpcy5zb25nKTtcbiAgICB9XG4gIH1cbn0iLCIvKlxuICBUaGlzIGlzIHRoZSBtYWluIG1vZHVsZSBvZiB0aGUgbGlicmFyeTogaXQgY3JlYXRlcyB0aGUgc2VxdWVuY2VyIG9iamVjdCBhbmQgZnVuY3Rpb25hbGl0eSBmcm9tIG90aGVyIG1vZHVsZXMgZ2V0cyBtaXhlZCBpblxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyByZXF1aXJlZCBieSBiYWJlbGlmeSBmb3IgdHJhbnNwaWxpbmcgZXM2XG5yZXF1aXJlKCdiYWJlbGlmeS9wb2x5ZmlsbCcpO1xuXG5pbXBvcnQgZ2V0Q29uZmlnIGZyb20gJy4vY29uZmlnLmpzJztcbi8vaW1wb3J0IHBvbHlGaWxsIGZyb20gJy4vcG9seWZpbGwuanMnO1xuaW1wb3J0IGluaXRBdWRpbyBmcm9tICcuL2luaXRfYXVkaW8uanMnO1xuaW1wb3J0IGluaXRNaWRpIGZyb20gJy4vaW5pdF9taWRpLmpzJztcbmltcG9ydCB7Y3JlYXRlU29uZ30gZnJvbSAnLi9zb25nLmpzJztcbmltcG9ydCB7Y3JlYXRlVHJhY2t9IGZyb20gJy4vdHJhY2suanMnO1xuaW1wb3J0IHtjcmVhdGVNSURJRXZlbnR9IGZyb20gJy4vbWlkaV9ldmVudC5qcyc7XG5pbXBvcnQge2NyZWF0ZUluc3RydW1lbnR9IGZyb20gJy4vaW5zdHJ1bWVudC5qcyc7XG5pbXBvcnQgcGFyc2VNSURJRmlsZSBmcm9tICcuL21pZGlfcGFyc2UuanMnO1xuaW1wb3J0IGNyZWF0ZVNvbmdGcm9tTUlESUZpbGUgZnJvbSAnLi9zb25nX2Zyb21fbWlkaWZpbGUuanMnO1xuaW1wb3J0IHtzdGFydH0gZnJvbSAnLi9oZWFydGJlYXQuanMnO1xuaW1wb3J0IHthamF4fSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHtjcmVhdGVOb3RlLCBnZXROb3RlTnVtYmVyLCBnZXROb3RlTmFtZSwgZ2V0Tm90ZU9jdGF2ZSwgZ2V0RnVsbE5vdGVOYW1lLCBnZXRGcmVxdWVuY3ksIGlzQmxhY2tLZXl9IGZyb20gJy4vbm90ZS5qcyc7XG5cbmxldCBzZXF1ZW5jZXIgPSB7fTtcbmxldCBjb25maWc7XG5sZXQgZGVidWdMZXZlbDtcblxuXG5mdW5jdGlvbiBpbml0KCl7XG4gIHJldHVybiBuZXcgUHJvbWlzZShleGVjdXRvcik7XG59XG5cbmZ1bmN0aW9uIGV4ZWN1dG9yKHJlc29sdmUsIHJlamVjdCl7XG4gIC8vcG9seWZpbGwoKTtcbiAgY29uZmlnID0gZ2V0Q29uZmlnKCk7XG4gIC8vIHRoZSBkZWJ1ZyBsZXZlbCBoYXMgYmVlbiBzZXQgYmVmb3JlIHNlcXVlbmNlci5pbml0KCkgc28gYWRkIGl0IHRvIHRoZSBjb25maWcgb2JqZWN0XG4gIGlmKGRlYnVnTGV2ZWwgIT09IHVuZGVmaW5lZCl7XG4gICAgY29uZmlnLmRlYnVnTGV2ZWwgPSBkZWJ1Z0xldmVsO1xuICB9XG5cbiAgaWYoY29uZmlnID09PSBmYWxzZSl7XG4gICAgcmVqZWN0KGBUaGUgV2ViQXVkaW8gQVBJIGhhc25cXCd0IGJlZW4gaW1wbGVtZW50ZWQgaW4gJHtjb25maWcuYnJvd3Nlcn0sIHBsZWFzZSB1c2UgYW55IG90aGVyIGJyb3dzZXJgKTtcbiAgfWVsc2V7XG4gICAgLy8gY3JlYXRlIHRoZSBjb250ZXh0IGFuZCBzaGFyZSBpdCBpbnRlcm5hbGx5IHZpYSB0aGUgY29uZmlnIG9iamVjdFxuICAgIGNvbmZpZy5jb250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTtcbiAgICBjb25maWcuZGVzdGluYXRpb24gPSBjb25maWcuY29udGV4dC5kZXN0aW5hdGlvbjtcbiAgICAvLyBhZGQgdW5sb2NrIG1ldGhvZCBmb3IgaW9zIGRldmljZXNcbiAgICAvLyB1bmxvY2tXZWJBdWRpbyBpcyBjYWxsZWQgd2hlbiB0aGUgdXNlciBjYWxsZWQgU29uZy5wbGF5KCksIGJlY2F1c2Ugd2UgYXNzdW1lIHRoYXQgdGhlIHVzZXIgcHJlc3NlcyBhIGJ1dHRvbiB0byBzdGFydCB0aGUgc29uZy5cbiAgICBpZihjb25maWcub3MgIT09ICdpb3MnKXtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICd1bmxvY2tXZWJBdWRpbycsIHt2YWx1ZTogZnVuY3Rpb24oKXt9fSk7XG4gICAgfWVsc2V7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAndW5sb2NrV2ViQXVkaW8nLCB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbigpe1xuICAgICAgICAgIGxldCBzcmMgPSBjb25maWcuY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKCksXG4gICAgICAgICAgICBnYWluTm9kZSA9IGNvbmZpZy5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgICBnYWluTm9kZS5nYWluLnZhbHVlID0gMDtcbiAgICAgICAgICBzcmMuY29ubmVjdChnYWluTm9kZSk7XG4gICAgICAgICAgZ2Fpbk5vZGUuY29ubmVjdChjb25maWcuY29udGV4dC5kZXN0aW5hdGlvbik7XG4gICAgICAgICAgaWYoc3JjLm5vdGVPbiAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHNyYy5zdGFydCA9IHNyYy5ub3RlT247XG4gICAgICAgICAgICBzcmMuc3RvcCA9IHNyYy5ub3RlT2ZmO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzcmMuc3RhcnQoMCk7XG4gICAgICAgICAgc3JjLnN0b3AoMC4wMDEpO1xuICAgICAgICAgIC8vIHJlbW92ZSBmdW5jdGlvbiBhZnRlciBmaXJzdCB1c2VcbiAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAndW5sb2NrV2ViQXVkaW8nLCB7dmFsdWU6IGZ1bmN0aW9uKCl7fX0pO1xuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGluaXRBdWRpbyhjb25maWcuY29udGV4dCkudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGRhdGEpe1xuXG4gICAgICAgIGNvbmZpZy5sZWdhY3kgPSBkYXRhLmxlZ2FjeTsgLy8gdHJ1ZSBpZiB0aGUgYnJvd3NlciB1c2VzIGFuIG9sZGVyIHZlcnNpb24gb2YgdGhlIFdlYkF1ZGlvIEFQSSwgc291cmNlLm5vdGVPbigpIGFuZCBzb3VyY2Uubm90ZU9mZiBpbnN0ZWFkIG9mIHNvdXJjZS5zdGFydCgpIGFuZCBzb3VyY2Uuc3RvcCgpXG4gICAgICAgIGNvbmZpZy5sb3d0aWNrID0gZGF0YS5sb3d0aWNrOyAvLyBtZXRyb25vbWUgc2FtcGxlXG4gICAgICAgIGNvbmZpZy5oaWdodGljayA9IGRhdGEuaGlnaHRpY2s7IC8vbWV0cm9ub21lIHNhbXBsZVxuICAgICAgICBjb25maWcubWFzdGVyR2Fpbk5vZGUgPSBkYXRhLmdhaW5Ob2RlO1xuICAgICAgICBjb25maWcubWFzdGVyQ29tcHJlc3NvciA9IGRhdGEuY29tcHJlc3NvcjtcbiAgICAgICAgY29uZmlnLmdldFRpbWUgPSBkYXRhLmdldFRpbWU7XG5cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ3RpbWUnLCB7Z2V0OiBkYXRhLmdldFRpbWV9KTtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ2F1ZGlvQ29udGV4dCcsIHtnZXQ6IGRhdGEuZ2V0QXVkaW9Db250ZXh0fSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdtYXN0ZXJWb2x1bWUnLCB7Z2V0OiBkYXRhLmdldE1hc3RlclZvbHVtZSwgc2V0OiBkYXRhLnNldE1hc3RlclZvbHVtZX0pO1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnZW5hYmxlTWFzdGVyQ29tcHJlc3NvcicsIHt2YWx1ZTogZGF0YS5lbmFibGVNYXN0ZXJDb21wcmVzc29yfSk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdjb25maWd1cmVNYXN0ZXJDb21wcmVzc29yJywge3ZhbHVlOiBkYXRhLmNvbmZpZ3VyZU1hc3RlckNvbXByZXNzb3J9KTtcblxuICAgICAgICBpbml0TWlkaSgpLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24gb25GdWxmaWxsZWQobWlkaSl7XG5cbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdtaWRpSW5wdXRzJywge3ZhbHVlOiBtaWRpLmlucHV0c30pO1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ21pZGlPdXRwdXRzJywge3ZhbHVlOiBtaWRpLm91dHB1dHN9KTtcblxuICAgICAgICAgICAgLy9PYmplY3Quc2VhbChzZXF1ZW5jZXIpO1xuICAgICAgICAgICAgc3RhcnQoKTsgLy8gc3RhcnQgaGVhcnRiZWF0XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICAgICAgaWYoZSAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlID09PSAnc3RyaW5nJyl7XG4gICAgICAgICAgICAgIHJlamVjdChlKTtcbiAgICAgICAgICAgIH1lbHNlIGlmKGNvbmZpZy5icm93c2VyID09PSAnY2hyb21lJyB8fCBjb25maWcuYnJvd3NlciA9PT0gJ2Nocm9taXVtJyl7XG4gICAgICAgICAgICAgIHJlamVjdCgnV2ViIE1JREkgQVBJIG5vdCBlbmFibGVkJyk7XG4gICAgICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICAgcmVqZWN0KCdXZWIgTUlESSBBUEkgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgKTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnbmFtZScsIHt2YWx1ZTogJ3FhbWJpJ30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ2luaXQnLCB7dmFsdWU6IGluaXR9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICd1aScsIHt2YWx1ZToge30sIHdyaXRhYmxlOiB0cnVlfSk7IC8vIHVpIGZ1bmN0aW9uc1xuXG5cbi8vIGFkZCB1dGlsIGZ1bmN0aW9uc1xubGV0IHV0aWwgPSB7fTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eSh1dGlsLCAnYWpheCcsIHt2YWx1ZTogYWpheH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ3V0aWwnLCB7dmFsdWU6IHV0aWx9KTtcblxuLy9UT0RPOiBjcmVhdGUgbWV0aG9kcyBnZXRTb25ncywgcmVtb3ZlU29uZyBhbmQgc28gb25cbi8vT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ2FjdGl2ZVNvbmdzJywge2FjdGl2ZVNvbmdzOiB7fSwgd3JpdGFibGU6IHRydWV9KTsgLy8gdGhlIHNvbmdzIHRoYXQgYXJlIGN1cnJlbnRseSBsb2FkZWQgaW4gbWVtb3J5XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdkZWJ1Z0xldmVsJywge1xuICBnZXQ6IGZ1bmN0aW9uKCl7XG4gICAgcmV0dXJuIGNvbmZpZy5kZWJ1Z0xldmVsO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKXtcbiAgICBpZihjb25maWcgIT09IHVuZGVmaW5lZCl7XG4gICAgICBjb25maWcuZGVidWdMZXZlbCA9IHZhbHVlO1xuICAgIH1lbHNle1xuICAgICAgLy8gYWxsb3cgdGhlIGRlYnVnTGV2ZWwgdG8gYmUgc2V0IGJlZm9yZSBzZXF1ZW5jZXIuaW5pdCgpO1xuICAgICAgZGVidWdMZXZlbCA9IHZhbHVlO1xuICAgIH1cbiAgfVxufSk7XG5cblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnY3JlYXRlTUlESUV2ZW50Jywge3ZhbHVlOiBjcmVhdGVNSURJRXZlbnR9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdjcmVhdGVUcmFjaycsIHt2YWx1ZTogY3JlYXRlVHJhY2t9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdjcmVhdGVTb25nJywge3ZhbHVlOiBjcmVhdGVTb25nfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnY3JlYXRlSW5zdHJ1bWVudCcsIHt2YWx1ZTogY3JlYXRlSW5zdHJ1bWVudH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ3BhcnNlTUlESUZpbGUnLCB7dmFsdWU6IHBhcnNlTUlESUZpbGV9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdjcmVhdGVTb25nRnJvbU1JRElGaWxlJywge3ZhbHVlOiBjcmVhdGVTb25nRnJvbU1JRElGaWxlfSk7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ2NyZWF0ZU5vdGUnLCB7dmFsdWU6IGNyZWF0ZU5vdGV9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdnZXROb3RlTnVtYmVyJywge3ZhbHVlOiBnZXROb3RlTnVtYmVyfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnZ2V0Tm90ZU5hbWUnLCB7dmFsdWU6IGdldE5vdGVOYW1lfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnZ2V0Tm90ZU9jdGF2ZScsIHt2YWx1ZTogZ2V0Tm90ZU9jdGF2ZX0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ2dldEZ1bGxOb3RlTmFtZScsIHt2YWx1ZTogZ2V0RnVsbE5vdGVOYW1lfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnZ2V0RnJlcXVlbmN5Jywge3ZhbHVlOiBnZXRGcmVxdWVuY3l9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdpc0JsYWNrS2V5Jywge3ZhbHVlOiBpc0JsYWNrS2V5fSk7XG5cblxuXG4vLyBub3RlIG5hbWUgbW9kaVxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ1NIQVJQJywge3ZhbHVlOiAnc2hhcnAnfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnRkxBVCcsIHt2YWx1ZTogJ2ZsYXQnfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnRU5IQVJNT05JQ19TSEFSUCcsIHt2YWx1ZTogJ2VuaGFybW9uaWMtc2hhcnAnfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnRU5IQVJNT05JQ19GTEFUJywge3ZhbHVlOiAnZW5oYXJtb25pYy1mbGF0J30pO1xuXG5cbi8vIHN0YW5kYXJkIE1JREkgZXZlbnRzXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnTk9URV9PRkYnLCB7dmFsdWU6IDB4ODB9KTsgLy8xMjhcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdOT1RFX09OJywge3ZhbHVlOiAweDkwfSk7IC8vMTQ0XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnUE9MWV9QUkVTU1VSRScsIHt2YWx1ZTogMHhBMH0pOyAvLzE2MFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ0NPTlRST0xfQ0hBTkdFJywge3ZhbHVlOiAweEIwfSk7IC8vMTc2XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnUFJPR1JBTV9DSEFOR0UnLCB7dmFsdWU6IDB4QzB9KTsgLy8xOTJcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdDSEFOTkVMX1BSRVNTVVJFJywge3ZhbHVlOiAweEQwfSk7IC8vMjA4XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnUElUQ0hfQkVORCcsIHt2YWx1ZTogMHhFMH0pOyAvLzIyNFxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ1NZU1RFTV9FWENMVVNJVkUnLCB7dmFsdWU6IDB4RjB9KTsgLy8yNDBcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdNSURJX1RJTUVDT0RFJywge3ZhbHVlOiAyNDF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdTT05HX1BPU0lUSU9OJywge3ZhbHVlOiAyNDJ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdTT05HX1NFTEVDVCcsIHt2YWx1ZTogMjQzfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnVFVORV9SRVFVRVNUJywge3ZhbHVlOiAyNDZ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdFT1gnLCB7dmFsdWU6IDI0N30pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ1RJTUlOR19DTE9DSycsIHt2YWx1ZTogMjQ4fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnU1RBUlQnLCB7dmFsdWU6IDI1MH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ0NPTlRJTlVFJywge3ZhbHVlOiAyNTF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdTVE9QJywge3ZhbHVlOiAyNTJ9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdBQ1RJVkVfU0VOU0lORycsIHt2YWx1ZTogMjU0fSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnU1lTVEVNX1JFU0VUJywge3ZhbHVlOiAyNTV9KTtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2VxdWVuY2VyLCAnVEVNUE8nLCB7dmFsdWU6IDB4NTF9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZXF1ZW5jZXIsICdUSU1FX1NJR05BVFVSRScsIHt2YWx1ZTogMHg1OH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNlcXVlbmNlciwgJ0VORF9PRl9UUkFDSycsIHt2YWx1ZTogMHgyRn0pO1xuXG5cbmV4cG9ydCBkZWZhdWx0IHNlcXVlbmNlcjtcbiIsIiAgJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgc2VxdWVuY2VyIGZyb20gJy4vc2VxdWVuY2VyJztcbmltcG9ydCB7YWRkRXZlbnRMaXN0ZW5lciwgcmVtb3ZlRXZlbnRMaXN0ZW5lciwgZGlzcGF0Y2hFdmVudH0gZnJvbSAnLi9zb25nX2FkZF9ldmVudGxpc3RlbmVyJztcbmltcG9ydCB7bG9nLCBpbmZvLCB3YXJuLCBlcnJvciwgdHlwZVN0cmluZ30gZnJvbSAnLi91dGlsJztcbmltcG9ydCBnZXRDb25maWcgZnJvbSAnLi9jb25maWcnO1xuaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjayc7XG5pbXBvcnQge1BhcnR9IGZyb20gJy4vcGFydCc7XG5pbXBvcnQge01JRElFdmVudH0gZnJvbSAnLi9taWRpX2V2ZW50JztcbmltcG9ydCB7QXVkaW9FdmVudH0gZnJvbSAnLi9hdWRpb19ldmVudCc7XG5pbXBvcnQgU2NoZWR1bGVyIGZyb20gJy4vc2NoZWR1bGVyJztcbmltcG9ydCB7aW5pdE1pZGlTb25nLCBzZXRNaWRpSW5wdXRTb25nLCBzZXRNaWRpT3V0cHV0U29uZ30gZnJvbSAnLi9pbml0X21pZGknO1xuaW1wb3J0IHthZGRUYXNrLCByZW1vdmVUYXNrfSBmcm9tICcuL2hlYXJ0YmVhdCc7XG5pbXBvcnQge3BhcnNlVGltZUV2ZW50cywgcGFyc2VFdmVudHN9IGZyb20gJy4vcGFyc2VfZXZlbnRzJztcblxuXG5sZXQgc29uZ0lkID0gMCxcbiAgY29uZmlnID0gZ2V0Q29uZmlnKCksXG4gIGRlZmF1bHRTb25nID0gY29uZmlnLmdldCgnZGVmYXVsdFNvbmcnKTtcblxuXG5leHBvcnQgY2xhc3MgU29uZ3tcblxuICAvKlxuICAgIEBwYXJhbSBzZXR0aW5ncyBpcyBhIE1hcCBvciBhbiBPYmplY3RcbiAgKi9cbiAgY29uc3RydWN0b3Ioc2V0dGluZ3Mpe1xuXG4gICAgdGhpcy5pZCA9ICdTJyArIHNvbmdJZCsrICsgRGF0ZS5ub3coKTtcbiAgICB0aGlzLm5hbWUgPSB0aGlzLmlkO1xuICAgIHRoaXMuX2V2ZW50cyA9IFtdOyAvLyBhbGwgTUlESSBhbmQgYXVkaW8gZXZlbnRzXG4gICAgdGhpcy5fYXVkaW9FdmVudHMgPSBbXTsgLy8gb25seSBhdWRpbyBldmVudHNcbiAgICB0aGlzLl9wYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3RyYWNrcyA9IFtdO1xuICAgIHRoaXMuX2V2ZW50c01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9wYXJ0c01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl90cmFja3NNYXAgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZXdUcmFja3MgPSBbXTtcbiAgICB0aGlzLl9yZW1vdmVkVHJhY2tzID0gW107XG4gICAgLy90aGlzLl9jaGFuZ2VkVHJhY2tzID0gW107XG5cbiAgICB0aGlzLl9uZXdQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRQYXJ0cyA9IFtdO1xuICAgIHRoaXMuX2NoYW5nZWRQYXJ0cyA9IFtdO1xuXG4gICAgdGhpcy5fbmV3RXZlbnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuICAgIHRoaXMuX2NoYW5nZWRFdmVudHMgPSBbXTtcblxuXG4gICAgdGhpcy5fdGltZUV2ZW50cyA9IFtdOyAvLyBhbGwgdGVtcG8gYW5kIHRpbWUgc2lnbmF0dXJlIGV2ZW50c1xuICAgIHRoaXMuX2FsbEV2ZW50cyA9IFtdOyAvLyBhbGwgdGVtcG8gYW5kIHRpbWUgc2lnbmF0dXJlIGV2ZW50cywgcGx1cyBhbGwgTUlESSBhbmQgYXVkaW8gZXZlbnRzXG5cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuICAgIHRoaXMubWlsbGlzID0gMDtcblxuICAgIC8vIGZpcnN0IGFkZCBhbGwgc2V0dGluZ3MgZnJvbSB0aGUgZGVmYXVsdCBzb25nXG4gICAgZGVmYXVsdFNvbmcuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KXtcbiAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgIH0sIHRoaXMpO1xuLypcbiAgICAvLyBvcjpcbiAgICBmb3IobGV0W3ZhbHVlLCBrZXldIG9mIGRlZmF1bHRTb25nLmVudHJpZXMoKSl7XG4gICAgICAoKGtleSwgdmFsdWUpID0+IHtcbiAgICAgICAgdGhpc1trZXldID0gdmFsdWU7XG4gICAgICB9KShrZXksIHZhbHVlKTtcbiAgICB9XG4qL1xuXG4gICAgaWYoc2V0dGluZ3MudGltZUV2ZW50cyl7XG4gICAgICB0aGlzLmFkZFRpbWVFdmVudHMoc2V0dGluZ3MudGltZUV2ZW50cyk7XG4gICAgICBkZWxldGUgc2V0dGluZ3MudGltZUV2ZW50cztcbiAgICB9XG5cbiAgICBpZihzZXR0aW5ncy50cmFja3Mpe1xuICAgICAgdGhpcy5hZGRUcmFja3Moc2V0dGluZ3MudHJhY2tzKTtcbiAgICAgIGRlbGV0ZSBzZXR0aW5ncy50cmFja3M7XG4gICAgfVxuXG5cbiAgICAvLyB0aGVuIG92ZXJyaWRlIHNldHRpbmdzIGJ5IHByb3ZpZGVkIHNldHRpbmdzXG4gICAgaWYodHlwZVN0cmluZyhzZXR0aW5ncykgPT09ICdvYmplY3QnKXtcbiAgICAgIE9iamVjdC5rZXlzKHNldHRpbmdzKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSl7XG4gICAgICAgIHRoaXNba2V5XSA9IHNldHRpbmdzW2tleV07XG4gICAgICB9LCB0aGlzKTtcbiAgICB9ZWxzZSBpZihzZXR0aW5ncyAhPT0gdW5kZWZpbmVkKXtcbiAgICAgIHNldHRpbmdzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGtleSl7XG4gICAgICAgIHRoaXNba2V5XSA9IHZhbHVlO1xuICAgICAgfSwgdGhpcyk7XG4gICAgfVxuXG4gICAgLy8gaW5pdGlhbGl6ZSBtaWRpIGZvciB0aGlzIHNvbmc6IGFkZCBNYXBzIGZvciBtaWRpIGluLSBhbmQgb3V0cHV0cywgYW5kIGFkZCBldmVudGxpc3RlbmVycyB0byB0aGUgbWlkaSBpbnB1dHNcbiAgICB0aGlzLm1pZGlJbnB1dHMgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5taWRpT3V0cHV0cyA9IG5ldyBNYXAoKTtcbiAgICBpbml0TWlkaVNvbmcodGhpcyk7IC8vIEBzZWU6IGluaXRfbWlkaS5qc1xuXG4gICAgdGhpcy5sYXN0QmFyID0gdGhpcy5iYXJzO1xuICAgIHRoaXMucGl0Y2hSYW5nZSA9IHRoaXMuaGlnaGVzdE5vdGUgLSB0aGlzLmxvd2VzdE5vdGUgKyAxO1xuICAgIHRoaXMuZmFjdG9yID0gNC90aGlzLmRlbm9taW5hdG9yO1xuICAgIHRoaXMudGlja3NQZXJCZWF0ID0gdGhpcy5wcHEgKiB0aGlzLmZhY3RvcjtcbiAgICB0aGlzLnRpY2tzUGVyQmFyID0gdGhpcy50aWNrc1BlckJlYXQgKiB0aGlzLm5vbWluYXRvcjtcbiAgICB0aGlzLm1pbGxpc1BlclRpY2sgPSAoNjAwMDAvdGhpcy5icG0vdGhpcy5wcHEpO1xuICAgIHRoaXMucmVjb3JkSWQgPSAtMTtcbiAgICB0aGlzLmRvTG9vcCA9IGZhbHNlO1xuICAgIHRoaXMuaWxsZWdhbExvb3AgPSB0cnVlO1xuICAgIHRoaXMubG9vcFN0YXJ0ID0gMDtcbiAgICB0aGlzLmxvb3BFbmQgPSAwO1xuICAgIHRoaXMubG9vcER1cmF0aW9uID0gMDtcbiAgICB0aGlzLmF1ZGlvUmVjb3JkaW5nTGF0ZW5jeSA9IDA7XG4gICAgdGhpcy5ncmlkID0gdW5kZWZpbmVkO1xuXG4gICAgY29uZmlnLmdldCgnYWN0aXZlU29uZ3MnKVt0aGlzLmlkXSA9IHRoaXM7XG5cbiAgICB0aGlzLl9zY2hlZHVsZXIgPSBuZXcgU2NoZWR1bGVyKHRoaXMpO1xuICB9XG5cblxuICBzdG9wKCl7XG4gICAgcmVtb3ZlVGFzaygncmVwZXRpdGl2ZScsIHRoaXMuaWQpO1xuICAgIHRoaXMubWlsbGlzID0gMDtcbiAgICBkaXNwYXRjaEV2ZW50KCdzdG9wJyk7XG4gIH1cblxuICBwbGF5KCl7XG4gICAgc2VxdWVuY2VyLnVubG9ja1dlYkF1ZGlvKCk7XG4gICAgdGhpcy5fc2NoZWR1bGVyLmZpcnN0UnVuID0gdHJ1ZTtcbiAgICB0aGlzLnRpbWVTdGFtcCA9IHNlcXVlbmNlci50aW1lICogMTAwMDtcbiAgICAvL3RoaXMuc3RhcnRNaWxsaXMgPSB0aGlzLm1pbGxpczsgLy8gdGhpcy5taWxsaXMgaXMgc2V0IGJ5IHBsYXloZWFkLCB1c2UgMCBmb3Igbm93XG4gICAgdGhpcy5zdGFydE1pbGxpcyA9IDA7XG4gICAgYWRkVGFzaygncmVwZXRpdGl2ZScsIHRoaXMuaWQsICgpID0+IHtwdWxzZSh0aGlzKTt9KTtcbiAgICBkaXNwYXRjaEV2ZW50KCdwbGF5Jyk7XG4gIH1cblxuICBzZXRNaWRpSW5wdXQoaWQsIGZsYWcgPSB0cnVlKXtcbiAgICBzZXRNaWRpSW5wdXRTb25nKHRoaXMsIGlkLCBmbGFnKTtcbiAgfVxuXG4gIHNldE1pZGlPdXRwdXQoaWQsIGZsYWcgPSB0cnVlKXtcbiAgICBzZXRNaWRpT3V0cHV0U29uZyh0aGlzLCBpZCwgZmxhZyk7XG4gIH1cblxuICBhZGRNaWRpRXZlbnRMaXN0ZW5lciguLi5hcmdzKXtcbiAgICBhZGRNaWRpRXZlbnRMaXN0ZW5lcih0aGlzLCAuLi5hcmdzKTtcbiAgfVxuXG5cbiAgYWRkVHJhY2sodHJhY2spe1xuICAgIGlmKHRyYWNrIGluc3RhbmNlb2YgVHJhY2spe1xuICAgICAgdHJhY2suc29uZyA9IHRoaXM7XG4gICAgICB0cmFjay5zdGF0ZSA9ICduZXcnO1xuICAgICAgdGhpcy5fdHJhY2tzTWFwLnNldCh0cmFjay5pZCwgdHJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG4gIGFkZFRyYWNrcyh0cmFja3Mpe1xuICAgIGZvcihsZXQgdHJhY2sgb2YgdHJhY2tzKXtcbiAgICAgIHRoaXMuYWRkVHJhY2sodHJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG4gIHJlbW92ZVRyYWNrKHRyYWNrKXtcbiAgICBpZih0aGlzLl90cmFja3NNYXAuaGFzKHRyYWNrLmlkKSl7XG4gICAgICB0cmFjay5zdGF0ZSA9ICdyZW1vdmVkJztcbiAgICAgIHRyYWNrLnJlc2V0KCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICB9XG5cbiAgcmVtb3ZlVHJhY2tzKHRyYWNrcyl7XG4gICAgZm9yKGxldCB0cmFjayBvZiB0cmFja3Mpe1xuICAgICAgdGhpcy5yZW1vdmVUcmFjayh0cmFjayk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICB9XG5cbiAgZ2V0VHJhY2tzKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3RyYWNrcztcbiAgfVxuXG4gIGdldFRyYWNrKGlkT3JOYW1lKXtcblxuICB9XG5cbiAgZ2V0UGFydHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcGFydHM7XG4gIH1cblxuICBnZXRFdmVudHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZXZlbnRzO1xuICB9XG5cbiAgZ2V0QXVkaW9FdmVudHMoKXtcbiAgICBpZih0aGlzLl9uZWVkc1VwZGF0ZSl7XG4gICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fYXVkaW9FdmVudHM7XG4gIH1cblxuICBnZXRUaW1lRXZlbnRzKCl7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWVFdmVudHM7XG4gIH1cblxuICBhZGRUaW1lRXZlbnQoZXZlbnQsIHBhcnNlID0gdHJ1ZSl7XG4gICAgLy8gMSkgY2hlY2sgaWYgZXZlbnQgaXMgdGltZSBldmVudFxuICAgIC8vIDIpIHNldCB0aW1lIHNpZ25hdHVyZSBldmVudCBvbiB0aGUgZmlyc3QgY291bnRcbiAgICAvLyAzKSBwYXJzZSB0aW1lIGV2ZW50c1xuICAgIHRoaXMuX3RpbWVFdmVudHMucHVzaChldmVudCk7XG4gICAgaWYocGFyc2UgPT09IHRydWUpe1xuICAgICAgcGFyc2VUaW1lRXZlbnRzKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGFkZFRpbWVFdmVudHMoZXZlbnRzKXtcbiAgICBmb3IobGV0IGV2ZW50IG9mIGV2ZW50cyl7XG4gICAgICB0aGlzLmFkZFRpbWVFdmVudChldmVudCwgZmFsc2UpO1xuICAgIH1cbiAgICBwYXJzZVRpbWVFdmVudHModGhpcyk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB1cGRhdGUoKXtcblxuICAgIHRoaXMuX25ld1RyYWNrcyA9IFtdO1xuICAgIC8vdGhpcy5fY2hhbmdlZFRyYWNrcyA9IFtdO1xuICAgIHRoaXMuX3JlbW92ZWRUcmFja3MgPSBbXTtcblxuICAgIHRoaXMuX25ld1BhcnRzID0gW107XG4gICAgdGhpcy5fY2hhbmdlZFBhcnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZFBhcnRzID0gW107XG5cbiAgICB0aGlzLl9uZXdFdmVudHMgPSBbXTtcbiAgICB0aGlzLl9jaGFuZ2VkRXZlbnRzID0gW107XG4gICAgdGhpcy5fcmVtb3ZlZEV2ZW50cyA9IFtdO1xuXG4gICAgbGV0IHNvcnRFdmVudHMgPSBmYWxzZTtcbiAgICBsZXQgc29ydFBhcnRzID0gZmFsc2U7XG4gICAgbGV0IG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgbGV0IG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IGZhbHNlO1xuICAgIGxldCBldmVudHNUb0JlUGFyc2VkID0gW10uY29uY2F0KHRoaXMuX3RpbWVFdmVudHMpO1xuICAgIGxldCBwYXJ0c1RvQmVQYXJzZWQgPSBbXTtcblxuXG4gICAgZm9yKGxldCB0cmFjayBvZiB0aGlzLl90cmFja3NNYXAudmFsdWVzKCkpe1xuICAgICAgaWYodHJhY2suc3RhdGUgPT09ICdyZW1vdmVkJyl7XG4gICAgICAgIHRoaXMuX3JlbW92ZWRUcmFja3MucHVzaCh0cmFjay5pZCk7XG4gICAgICAgIHRoaXMuX3RyYWNrc01hcC5kZWxldGUodHJhY2suaWQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1lbHNlIGlmKHRyYWNrLnN0YXRlID09PSAnbmV3Jyl7XG4gICAgICAgIHRoaXMuX25ld1RyYWNrcy5wdXNoKHRyYWNrKTtcbiAgICAgIH1cblxuICAgICAgLy8gdHJhY2suZ2V0UGFydHMoKSB0cmlnZ2VycyB0cmFjay51cGRhdGUoKVxuICAgICAgbGV0IHBhcnRzID0gdHJhY2suZ2V0UGFydHMoKTtcblxuICAgICAgLy8gZ2V0IGFsbCB0aGUgbmV3IHBhcnRzXG4gICAgICBpZih0cmFjay5fbmV3UGFydHMuc2l6ZSA+IDApe1xuICAgICAgICBudW1iZXJPZlBhcnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgIGZvcihsZXQgbmV3UGFydCBvZiB0cmFjay5fbmV3UGFydHMudmFsdWVzKCkpe1xuICAgICAgICAgIHRoaXMuX3BhcnRzTWFwLnNldChuZXdQYXJ0LmlkLCBuZXdQYXJ0KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IobGV0IHBhcnQgb2YgcGFydHMpe1xuICAgICAgICBwYXJ0LnVwZGF0ZSgpO1xuICAgICAgICBpZihwYXJ0Ll9uZXdFdmVudHMuc2l6ZSA+IDApe1xuICAgICAgICAgIG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICAgICAgZm9yKGxldCBuZXdFdmVudCBvZiBwYXJ0Ll9uZXdFdmVudHMudmFsdWVzKCkpe1xuICAgICAgICAgICAgdGhpcy5fZXZlbnRzTWFwLnNldChuZXdFdmVudC5pZCwgbmV3RXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0cmFjay5zdGF0ZSA9ICdjbGVhbic7XG4gICAgfVxuXG5cbiAgICBmb3IobGV0IGV2ZW50IG9mIHRoaXMuX2V2ZW50c01hcC52YWx1ZXMoKSl7XG4gICAgICBpZihldmVudC5zdGF0ZSA9PT0gJ3JlbW92ZWQnKXtcbiAgICAgICAgdGhpcy5fcmVtb3ZlZEV2ZW50cy5wdXNoKGV2ZW50KTtcbiAgICAgICAgdGhpcy5fZXZlbnRzTWFwLmRlbGV0ZShldmVudC5pZCk7XG4gICAgICAgIG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9ZWxzZSBpZihldmVudC5zdGF0ZSA9PT0gJ25ldycpe1xuICAgICAgICB0aGlzLl9uZXdFdmVudHMucHVzaChldmVudCk7XG4gICAgICAgIGV2ZW50c1RvQmVQYXJzZWQucHVzaChldmVudCk7XG4gICAgICAgIG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9IHRydWU7XG4gICAgICB9ZWxzZSBpZihldmVudC5zdGF0ZSAhPT0gJ2NsZWFuJyl7XG4gICAgICAgIHRoaXMuX2NoYW5nZWRFdmVudHMucHVzaChldmVudCk7XG4gICAgICAgIGV2ZW50c1RvQmVQYXJzZWQucHVzaChldmVudCk7XG4gICAgICAgIHNvcnRFdmVudHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgZXZlbnQuc3RhdGUgPSAnY2xlYW4nO1xuICAgIH1cblxuICAgIGlmKG51bWJlck9mRXZlbnRzSGFzQ2hhbmdlZCA9PT0gdHJ1ZSl7XG4gICAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICAgIEFycmF5LmZyb20odGhpcy5fZXZlbnRzTWFwLnZhbHVlcygpKS5mb3JFYWNoKChldmVudCkgPT4ge1xuICAgICAgICB0aGlzLl9ldmVudHMucHVzaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZihudW1iZXJPZkV2ZW50c0hhc0NoYW5nZWQgPT09IHRydWUgfHwgc29ydEV2ZW50cyA9PT0gdHJ1ZSl7XG4gICAgICAvLyBAVE9ETzogc29ydCBvbiBzb3J0SW5kZXghIVxuICAgICAgdGhpcy5fZXZlbnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgICB9XG5cblxuXG4gICAgZm9yKGxldCBwYXJ0IG9mIHRoaXMuX3BhcnRzTWFwLnZhbHVlcygpKXtcbiAgICAgIGlmKHBhcnQuc3RhdGUgPT09ICdyZW1vdmVkJyl7XG4gICAgICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5wdXNoKHBhcnQpO1xuICAgICAgICB0aGlzLl9wYXJ0c01hcC5kZWxldGUocGFydC5pZCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgPT09ICduZXcnKXtcbiAgICAgICAgdGhpcy5fbmV3UGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgcGFydHNUb0JlUGFyc2VkLnB1c2gocGFydCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgIT09ICdjbGVhbicpe1xuICAgICAgICB0aGlzLl9jaGFuZ2VkUGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgcGFydHNUb0JlUGFyc2VkLnB1c2gocGFydCk7XG4gICAgICAgIHNvcnRFdmVudHMgPSB0cnVlO1xuICAgICAgfVxuICAgICAgcGFydC5zdGF0ZSA9ICdjbGVhbic7XG4gICAgfVxuXG4gICAgaWYobnVtYmVyT2ZQYXJ0c0hhc0NoYW5nZWQgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICAgIEFycmF5LmZyb20odGhpcy5fcGFydHNNYXAudmFsdWVzKCkpLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgICAgdGhpcy5fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmKG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID09PSB0cnVlIHx8IHNvcnRQYXJ0cyA9PT0gdHJ1ZSl7XG4gICAgICAvLyBAVE9ETzogc29ydCBvbiBzb3J0SW5kZXghIVxuICAgICAgdGhpcy5fcGFydHMuc29ydCgoYSwgYikgPT4gKGEudGlja3MgPD0gYi50aWNrcykgPyAtMSA6IDEpO1xuICAgIH1cblxuICAgIHRoaXMuX2F1ZGlvRXZlbnRzID0gdGhpcy5fZXZlbnRzLmZpbHRlcihmdW5jdGlvbihldmVudCl7XG4gICAgICByZXR1cm4gZXZlbnQgaW5zdGFuY2VvZiBBdWRpb0V2ZW50O1xuICAgIH0pO1xuXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgICB0aGlzLl9zY2hlZHVsZXIudXBkYXRlU29uZygpO1xuICAgIGRlYnVnZ2VyO1xuICB9XG59XG5cblNvbmcucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuU29uZy5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IHJlbW92ZUV2ZW50TGlzdGVuZXI7XG5Tb25nLnByb3RvdHlwZS5kaXNwYXRjaEV2ZW50ID0gZGlzcGF0Y2hFdmVudDtcblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU29uZyhzZXR0aW5ncyl7XG4gIHJldHVybiBuZXcgU29uZyhzZXR0aW5ncyk7XG59XG5cblxuZnVuY3Rpb24gcHVsc2Uoc29uZyl7XG4gIGxldFxuICAgIG5vdyA9IHNlcXVlbmNlci50aW1lICogMTAwMCxcbiAgICBkaWZmID0gbm93IC0gc29uZy50aW1lU3RhbXA7XG5cbiAgc29uZy5taWxsaXMgKz0gZGlmZjtcbiAgc29uZy50aW1lU3RhbXAgPSBub3c7XG4gIHNvbmcuc2NoZWR1bGVyLnVwZGF0ZSgpO1xufSIsImxldCBsaXN0ZW5lcnMgPSB7fTtcblxuZnVuY3Rpb24gYWRkRXZlbnRMaXN0ZW5lcihpZCwgY2FsbGJhY2spe1xuICBsaXN0ZW5lcnNbaWRdID0gY2FsbGJhY2s7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUV2ZW50TGlzdGVuZXIoaWQsIGNhbGxiYWNrKXtcbiAgZGVsZXRlIGxpc3RlbmVyc1tpZF07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoaWQpe1xuICBmb3IobGV0IGtleSBpbiBsaXN0ZW5lcnMpe1xuICAgIGlmKGtleSA9PT0gaWQgJiYgbGlzdGVuZXJzLmhhc093blByb3BlcnR5KGtleSkpe1xuICAgICAgbGlzdGVuZXJzW2tleV0oaWQpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQge2FkZEV2ZW50TGlzdGVuZXIgYXMgYWRkRXZlbnRMaXN0ZW5lcn07XG5leHBvcnQge3JlbW92ZUV2ZW50TGlzdGVuZXIgYXMgcmVtb3ZlRXZlbnRMaXN0ZW5lcn07XG5leHBvcnQge2Rpc3BhdGNoRXZlbnQgYXMgZGlzcGF0Y2hFdmVudH07IiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge2xvZywgaW5mbywgd2FybiwgZXJyb3IsIGJhc2U2NFRvQmluYXJ5LCBhamF4fSBmcm9tICcuL3V0aWwuanMnO1xuaW1wb3J0IHBhcnNlTUlESUZpbGUgZnJvbSAnLi9taWRpX3BhcnNlJztcbmltcG9ydCB7TUlESUV2ZW50fSBmcm9tICcuL21pZGlfZXZlbnQnO1xuaW1wb3J0IHtQYXJ0fSBmcm9tICcuL3BhcnQnO1xuaW1wb3J0IHtUcmFja30gZnJvbSAnLi90cmFjayc7XG5pbXBvcnQge1Nvbmd9IGZyb20gJy4vc29uZyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlU29uZ0Zyb21NSURJRmlsZShkYXRhKXtcblxuICBpZihkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgPT09IHRydWUpe1xuICAgIGxldCBidWZmZXIgPSBuZXcgVWludDhBcnJheShkYXRhKTtcbiAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gIH1lbHNlIGlmKGRhdGEuaGVhZGVyICE9PSB1bmRlZmluZWQgJiYgZGF0YS50cmFja3MgIT09IHVuZGVmaW5lZCl7XG4gICAgcmV0dXJuIHRvU29uZyhkYXRhKTtcbiAgfWVsc2V7XG4gICAgZGF0YSA9IGJhc2U2NFRvQmluYXJ5KGRhdGEpO1xuICAgIGlmKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciA9PT0gdHJ1ZSl7XG4gICAgICBsZXQgYnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoZGF0YSk7XG4gICAgICByZXR1cm4gdG9Tb25nKHBhcnNlTUlESUZpbGUoYnVmZmVyKSk7XG4gICAgfWVsc2V7XG4gICAgICBlcnJvcignd3JvbmcgZGF0YScpO1xuICAgIH1cbiAgfVxufVxuXG5cbmZ1bmN0aW9uIHRvU29uZyhwYXJzZWQpe1xuICBsZXQgdHJhY2tzID0gcGFyc2VkLnRyYWNrcztcbiAgbGV0IHBwcSA9IHBhcnNlZC5oZWFkZXIudGlja3NQZXJCZWF0O1xuICBsZXQgdGltZUV2ZW50cyA9IFtdO1xuICBsZXQgY29uZmlnID0ge1xuICAgIHRyYWNrczogW11cbiAgfTtcbiAgbGV0IGV2ZW50cztcblxuICBmb3IobGV0IHRyYWNrIG9mIHRyYWNrcy52YWx1ZXMoKSl7XG4gICAgbGV0IGxhc3RUaWNrcywgbGFzdFR5cGU7XG4gICAgbGV0IHRpY2tzID0gMDtcbiAgICBsZXQgdHlwZTtcbiAgICBsZXQgY2hhbm5lbCA9IC0xO1xuICAgIGV2ZW50cyA9IFtdO1xuXG4gICAgZm9yKGxldCBldmVudCBvZiB0cmFjayl7XG4gICAgICB0aWNrcyArPSAoZXZlbnQuZGVsdGFUaW1lICogcHBxKTtcbiAgICAgIC8vY29uc29sZS5sb2coZXZlbnQuc3VidHlwZSwgZXZlbnQuZGVsdGFUaW1lLCB0bXBUaWNrcyk7XG5cbiAgICAgIGlmKGNoYW5uZWwgPT09IC0xICYmIGV2ZW50LmNoYW5uZWwgIT09IHVuZGVmaW5lZCl7XG4gICAgICAgIGNoYW5uZWwgPSBldmVudC5jaGFubmVsO1xuICAgICAgICB0cmFjay5jaGFubmVsID0gY2hhbm5lbDtcbiAgICAgIH1cbiAgICAgIHR5cGUgPSBldmVudC5zdWJ0eXBlO1xuXG4gICAgICBzd2l0Y2goZXZlbnQuc3VidHlwZSl7XG5cbiAgICAgICAgY2FzZSAndHJhY2tOYW1lJzpcbiAgICAgICAgICB0cmFjay5uYW1lID0gZXZlbnQudGV4dDtcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCduYW1lJywgdHJhY2submFtZSwgbnVtVHJhY2tzKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdpbnN0cnVtZW50TmFtZSc6XG4gICAgICAgICAgaWYoZXZlbnQudGV4dCl7XG4gICAgICAgICAgICB0cmFjay5pbnN0cnVtZW50TmFtZSA9IGV2ZW50LnRleHQ7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ25vdGVPbic6XG4gICAgICAgICAgZXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg5MCwgZXZlbnQubm90ZU51bWJlciwgZXZlbnQudmVsb2NpdHkpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdub3RlT2ZmJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDgwLCBldmVudC5ub3RlTnVtYmVyLCBldmVudC52ZWxvY2l0eSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ3NldFRlbXBvJzpcbiAgICAgICAgICAvLyBzb21ldGltZXMgMiB0ZW1wbyBldmVudHMgaGF2ZSB0aGUgc2FtZSBwb3NpdGlvbiBpbiB0aWNrc1xuICAgICAgICAgIC8vIHdlIHVzZSB0aGUgbGFzdCBpbiB0aGVzZSBjYXNlcyAoc2FtZSBhcyBDdWJhc2UpXG4gICAgICAgICAgbGV0IGJwbSA9IDYwMDAwMDAwL2V2ZW50Lm1pY3Jvc2Vjb25kc1BlckJlYXQ7XG5cbiAgICAgICAgICBpZih0aWNrcyA9PT0gbGFzdFRpY2tzICYmIHR5cGUgPT09IGxhc3RUeXBlKXtcbiAgICAgICAgICAgIGluZm8oJ3RlbXBvIGV2ZW50cyBvbiB0aGUgc2FtZSB0aWNrJywgdGlja3MsIGJwbSk7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGNvbmZpZy5icG0gPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25maWcuYnBtID0gYnBtO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aW1lRXZlbnRzLnB1c2gobmV3IE1JRElFdmVudCh0aWNrcywgMHg1MSwgYnBtKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAndGltZVNpZ25hdHVyZSc6XG4gICAgICAgICAgLy8gc29tZXRpbWVzIDIgdGltZSBzaWduYXR1cmUgZXZlbnRzIGhhdmUgdGhlIHNhbWUgcG9zaXRpb24gaW4gdGlja3NcbiAgICAgICAgICAvLyB3ZSB1c2UgdGhlIGxhc3QgaW4gdGhlc2UgY2FzZXMgKHNhbWUgYXMgQ3ViYXNlKVxuICAgICAgICAgIGlmKGxhc3RUaWNrcyA9PT0gdGlja3MgJiYgbGFzdFR5cGUgPT09IHR5cGUpe1xuICAgICAgICAgICAgaW5mbygndGltZSBzaWduYXR1cmUgZXZlbnRzIG9uIHRoZSBzYW1lIHRpY2snLCB0aWNrcywgZXZlbnQubnVtZXJhdG9yLCBldmVudC5kZW5vbWluYXRvcik7XG4gICAgICAgICAgICB0aW1lRXZlbnRzLnBvcCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmKGNvbmZpZy5ub21pbmF0b3IgPT09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgICBjb25maWcubm9taW5hdG9yID0gZXZlbnQubnVtZXJhdG9yO1xuICAgICAgICAgICAgY29uZmlnLmRlbm9taW5hdG9yID0gZXZlbnQuZGVub21pbmF0b3I7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRpbWVFdmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweDU4LCBldmVudC5udW1lcmF0b3IsIGV2ZW50LmRlbm9taW5hdG9yKSk7XG4gICAgICAgICAgYnJlYWs7XG5cblxuICAgICAgICBjYXNlICdjb250cm9sbGVyJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEIwLCBldmVudC5jb250cm9sbGVyVHlwZSwgZXZlbnQudmFsdWUpKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlICdwcm9ncmFtQ2hhbmdlJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEMwLCBldmVudC5wcm9ncmFtTnVtYmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAncGl0Y2hCZW5kJzpcbiAgICAgICAgICBldmVudHMucHVzaChuZXcgTUlESUV2ZW50KHRpY2tzLCAweEUwLCBldmVudC52YWx1ZSkpO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0cmFjay5uYW1lLCBldmVudC50eXBlKTtcbiAgICAgIH1cblxuICAgICAgbGFzdFR5cGUgPSB0eXBlO1xuICAgICAgbGFzdFRpY2tzID0gdGlja3M7XG4gICAgfVxuXG4gICAgaWYoZXZlbnRzLmxlbmd0aCA+IDApe1xuICAgICAgY29uZmlnLnRyYWNrcy5wdXNoKG5ldyBUcmFjaygpLmFkZFBhcnQobmV3IFBhcnQoe2V2ZW50czpldmVudHN9KSkpO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpZy5wcHEgPSBwcHE7XG4gIGNvbmZpZy50aW1lRXZlbnRzID0gdGltZUV2ZW50cztcbiAgbGV0IHNvbmcgPSBuZXcgU29uZyhjb25maWcpO1xuICBzb25nLnVwZGF0ZSgpO1xuICByZXR1cm4gc29uZztcbn0iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7UGFydH0gZnJvbSAnLi9wYXJ0JztcblxubGV0IHRyYWNrSWQgPSAwO1xuXG5cbmV4cG9ydCBjbGFzcyBUcmFja3tcblxuICBjb25zdHJ1Y3Rvcihjb25maWcgPSB7fSl7XG4gICAgdGhpcy5pZCA9ICdUJyArIHRyYWNrSWQrKyArIERhdGUubm93KCk7XG4gICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICB0aGlzLl9ldmVudHMgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0gJ2NsZWFuJztcblxuICAgIHRoaXMuX3BhcnRzTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2V2ZW50c01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9uZXdQYXJ0cyA9IG5ldyBNYXAoKTtcbiAgICAvL3RoaXMuX21vdmVkUGFydHMgPSBuZXcgTWFwKCk7XG4gICAgLy90aGlzLl9yZW1vdmVkUGFydHMgPSBuZXcgTWFwKCk7XG4gICAgLy90aGlzLl90cmFuc3Bvc2VkUGFydHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IGZhbHNlO1xuXG4gICAgaWYoY29uZmlnLnBhcnRzKXtcbiAgICAgIHRoaXMuYWRkUGFydHMoY29uZmlnLnBhcnRzKTtcbiAgICAgIGNvbmZpZy5wYXJ0cyA9IG51bGw7XG4gICAgfVxuICAgIHRoaXMubmFtZSA9IGNvbmZpZy5uYW1lIHx8IHRoaXMuaWQ7XG4gICAgY29uZmlnID0gbnVsbDtcbiAgfVxuXG4vKlxuICBhZGRFdmVudChldmVudCl7XG4gICAgbGV0IHBhcnQgPSBuZXcgUGFydCgpO1xuICAgIHBhcnQudHJhY2sgPSB0aGlzO1xuICAgIHBhcnQuYWRkRXZlbnQoZXZlbnQpO1xuICAgIHRoaXMuX3BhcnRzTWFwLnNldChwYXJ0LmlkLCBwYXJ0KTtcbiAgICB0aGlzLm51bWJlck9mUGFydHNDaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gIH1cblxuICBhZGRFdmVudHMoZXZlbnRzKXtcbiAgICBsZXQgcGFydCA9IG5ldyBQYXJ0KCk7XG4gICAgcGFydC50cmFjayA9IHRoaXM7XG4gICAgcGFydC5hZGRFdmVudHMoZXZlbnRzKTtcbiAgICB0aGlzLl9wYXJ0c01hcC5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgdGhpcy5udW1iZXJPZlBhcnRzQ2hhbmdlZCA9IHRydWU7XG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICB9XG4qL1xuXG4gIGFkZFBhcnQocGFydCl7XG4gICAgaWYocGFydCBpbnN0YW5jZW9mIFBhcnQpe1xuICAgICAgcGFydC50cmFjayA9IHRoaXM7XG4gICAgICBwYXJ0LnN0YXRlID0gJ25ldyc7XG4gICAgICB0aGlzLl9wYXJ0c01hcC5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICB9XG5cbiAgYWRkUGFydHMocGFydHMpe1xuICAgIGZvcihsZXQgcGFydCBpbiBwYXJ0cyl7XG4gICAgICB0aGlzLmFkZFBhcnQocGFydCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICB9XG5cblxuICByZW1vdmVQYXJ0KHBhcnQpe1xuICAgIGlmKHRoaXMuX3BhcnRzTWFwLmhhcyhwYXJ0LmlkKSl7XG4gICAgICAvL0B0b2RvOiBwYXJ0LnJlc2V0KCkgaGVyZSwganVzdCBsaWtlIGV2ZW50LnJlc2V0KCkgLT4gWUVTIVxuICAgICAgcGFydC5zdGF0ZSA9ICdyZW1vdmVkJztcbiAgICAgIHRoaXMuX25lZWRzVXBkYXRlID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gIH1cblxuICByZW1vdmVQYXJ0cyhwYXJ0cyl7XG4gICAgZm9yKGxldCBwYXJ0IGluIHBhcnRzKXtcbiAgICAgIHRoaXMucmVtb3ZlUGFydChwYXJ0KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gIH1cblxuXG4gIG1vdmVQYXJ0KHBhcnQsIHRpY2tzKXtcbiAgICBpZih0aGlzLl9wYXJ0c01hcC5oYXMocGFydC5pZCkpe1xuICAgICAgcGFydC5tb3ZlRXZlbnRzKHBhcnQuZXZlbnRzLCB0aWNrcyk7XG4gICAgICBpZihwYXJ0LnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICAgIHBhcnQuc3RhdGUgPSAnbW92ZWQnO1xuICAgICAgfVxuICAgICAgdGhpcy5fbmVlZHNVcGRhdGUgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG4gIG1vdmVQYXJ0cyhwYXJ0cywgdGlja3Mpe1xuICAgIGZvcihsZXQgcGFydCBpbiBwYXJ0cyl7XG4gICAgICB0aGlzLm1vdmVQYXJ0KHBhcnQsIHRpY2tzKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7IC8vIG1ha2UgaXQgY2hhaW5hYmxlXG4gIH1cblxuXG4gIHRyYW5zcG9zZVBhcnQocGFydCwgc2VtaXRvbmVzKXtcbiAgICBpZih0aGlzLl9wYXJ0c01hcC5oYXMocGFydC5pZCkpe1xuICAgICAgcGFydC50cmFuc3Bvc2VFdmVudHMocGFydC5ldmVudHMsIHNlbWl0b25lcyk7XG4gICAgICBpZihwYXJ0LnN0YXRlICE9PSAnbmV3Jyl7XG4gICAgICAgIHBhcnQuc3RhdGUgPSAndHJhbnNwb3NlZCc7XG4gICAgICB9XG4gICAgICB0aGlzLl9uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzOyAvLyBtYWtlIGl0IGNoYWluYWJsZVxuICB9XG5cbiAgdHJhbnNwb3NlUGFydHMocGFydHMsIHNlbWl0b25lcyl7XG4gICAgZm9yKGxldCBwYXJ0IGluIHBhcnRzKXtcbiAgICAgIHRoaXMudHJhbnNwb3NlUGFydChwYXJ0LCBzZW1pdG9uZXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpczsgLy8gbWFrZSBpdCBjaGFpbmFibGVcbiAgfVxuXG5cbiAgZ2V0RXZlbnRzKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2V2ZW50cztcbiAgfVxuXG4gIGdldFBhcnRzKCl7XG4gICAgaWYodGhpcy5fbmVlZHNVcGRhdGUpe1xuICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3BhcnRzO1xuICB9XG5cblxuICByZXNldCgpe1xuXG4gIH1cblxuICB1cGRhdGUoKXtcblxuICAgIC8vIGlmKHRoaXMuX25lZWRzVXBkYXRlID09PSBmYWxzZSl7XG4gICAgLy8gICByZXR1cm47XG4gICAgLy8gfVxuXG4gICAgbGV0IG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgbGV0IHVwZGF0ZVBhcnRzID0gZmFsc2U7XG4vKlxuICAgIEFycmF5LmZyb20odGhpcy5fZXZlbnRzTWFwLnZhbHVlcygpKS5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICBpZihwYXJ0LnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICB0aGlzLl9wYXJ0c01hcC5kZWxldGUocGFydC5pZCk7XG4gICAgICAgIHRoaXMuX3JlbW92ZWRQYXJ0cy5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgPT09ICduZXcnKXtcbiAgICAgICAgdGhpcy5fcGFydHNNYXAuc2V0KHBhcnQuaWQsIHBhcnQpO1xuICAgICAgICB0aGlzLl9uZXdQYXJ0cy5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgPT09ICdtb3ZlZCcpe1xuICAgICAgICB0aGlzLl9tb3ZlZFBhcnRzLnNldChwYXJ0LmlkLCBwYXJ0KTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgPT09ICd0cmFuc3Bvc2VkJyl7XG4gICAgICAgIHRoaXMuX3RyYW5zcG9zZWRQYXJ0cy5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgICB9XG4gICAgICBwYXJ0LnN0YXRlID0gJ2NsZWFuJztcbiAgICB9KTtcbiovXG4gICAgZm9yKGxldCBwYXJ0IG9mIHRoaXMuX3BhcnRzTWFwLnZhbHVlcygpKXtcblxuICAgICAgLy8gcGFydC5nZXRFdmVudHMoKSB0cmlnZ2VycyBwYXJ0LnVwZGF0ZSgpO1xuICAgICAgbGV0IGV2ZW50cyA9IHBhcnQuZ2V0RXZlbnRzKCk7XG4gICAgICAvLyBAVE9ETzogZ2V0IHBhcnQuX25ld0V2ZW50cztcblxuXG4gICAgICBpZihwYXJ0LnN0YXRlID09PSAncmVtb3ZlZCcpe1xuICAgICAgICB0aGlzLl9wYXJ0c01hcC5kZWxldGUocGFydC5pZCk7XG4gICAgICAgIC8vIGluIGNhc2UgYSBuZXcgcGFydCBnZXRzIGRlbGV0ZWQgYmVmb3JlIHRyYWNrLnVwZGF0ZSgpIGlzIGNhbGxlZFxuICAgICAgICB0aGlzLl9uZXdQYXJ0cy5kZWxldGUocGFydC5pZCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgPT09ICduZXcnKXtcbiAgICAgICAgdGhpcy5fcGFydHNNYXAuc2V0KHBhcnQuaWQsIHBhcnQpO1xuICAgICAgICB0aGlzLl9uZXdQYXJ0cy5zZXQocGFydC5pZCwgcGFydCk7XG4gICAgICAgIG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID0gdHJ1ZTtcbiAgICAgIH1lbHNlIGlmKHBhcnQuc3RhdGUgIT09ICdjbGVhbicpe1xuICAgICAgICB1cGRhdGVQYXJ0cyA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYobnVtYmVyT2ZQYXJ0c0hhc0NoYW5nZWQgPT09IHRydWUpe1xuICAgICAgdGhpcy5fcGFydHMgPSBbXTtcbiAgICAgIHRoaXMuX2V2ZW50cyA9IFtdO1xuICAgICAgZm9yKGxldCBwYXJ0IG9mIHRoaXMuX3BhcnRzTWFwLnZhbHVlcygpKXtcbiAgICAgICAgdGhpcy5fcGFydHMucHVzaChwYXJ0KTtcbiAgICAgICAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzLmNvbmNhdChwYXJ0LmdldEV2ZW50cygpKTtcbiAgICAgIH07XG4gICAgICB0aGlzLl9ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCl7XG4gICAgICAgIHRoaXMuX2V2ZW50c01hcC5zZXQoZXZlbnQuaWQsIGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmKG51bWJlck9mUGFydHNIYXNDaGFuZ2VkID09PSB0cnVlIHx8IHVwZGF0ZVBhcnRzID09PSB0cnVlKXtcbiAgICAgIHRoaXMuX3BhcnRzLnNvcnQoKGEsIGIpID0+IChhLnRpY2tzIDw9IGIudGlja3MpID8gLTEgOiAxKTtcbiAgICAgIHRoaXMuX2V2ZW50cy5zb3J0KChhLCBiKSA9PiAoYS50aWNrcyA8PSBiLnRpY2tzKSA/IC0xIDogMSk7XG4gICAgfVxuXG4gICAgdGhpcy5fbmVlZHNVcGRhdGUgPSBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVHJhY2soY29uZmlnKXtcbiAgcmV0dXJuIG5ldyBUcmFjayhjb25maWcpO1xufVxuXG5cbi8qXG5sZXQgVHJhY2sgPSB7XG4gICAgaW5pdDogZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IGlkID0gJ1QnICsgdHJhY2tJZCsrICsgbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaWQnLCB7XG4gICAgICAgICAgICB2YWx1ZTogaWRcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY3JlYXRlVHJhY2soKXtcbiAgdmFyIHQgPSBPYmplY3QuY3JlYXRlKFRyYWNrKTtcbiAgdC5pbml0KGFyZ3VtZW50cyk7XG4gIHJldHVybiB0O1xufVxuXG4qLyIsIi8qXG4gIEFuIHVub3JnYW5pc2VkIGNvbGxlY3Rpb24gb2YgdmFyaW91cyB1dGlsaXR5IGZ1bmN0aW9ucyB0aGF0IGFyZSB1c2VkIGFjcm9zcyB0aGUgbGlicmFyeVxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZ2V0Q29uZmlnIGZyb20gJy4vY29uZmlnJztcblxubGV0XG4gIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZSxcbiAgbVBvdyA9IE1hdGgucG93LFxuICBtUm91bmQgPSBNYXRoLnJvdW5kLFxuICBtRmxvb3IgPSBNYXRoLmZsb29yLFxuICBtUmFuZG9tID0gTWF0aC5yYW5kb20sXG4gIGNvbmZpZyA9IGdldENvbmZpZygpO1xuICAvLyBjb250ZXh0ID0gY29uZmlnLmNvbnRleHQsXG4gIC8vIGZsb29yID0gZnVuY3Rpb24odmFsdWUpe1xuICAvLyAgcmV0dXJuIHZhbHVlIHwgMDtcbiAgLy8gfSxcblxuY29uc3RcbiAgbm90ZUxlbmd0aE5hbWVzID0ge1xuICAgIDE6ICdxdWFydGVyJyxcbiAgICAyOiAnZWlnaHRoJyxcbiAgICA0OiAnc2l4dGVlbnRoJyxcbiAgICA4OiAnMzJ0aCcsXG4gICAgMTY6ICc2NHRoJ1xuICB9O1xuXG5cbmV4cG9ydCBmdW5jdGlvbiB0eXBlU3RyaW5nKG8pe1xuICBpZih0eXBlb2YgbyAhPSAnb2JqZWN0Jyl7XG4gICAgcmV0dXJuIHR5cGVvZiBvO1xuICB9XG5cbiAgaWYobyA9PT0gbnVsbCl7XG4gICAgcmV0dXJuICdudWxsJztcbiAgfVxuXG4gIC8vb2JqZWN0LCBhcnJheSwgZnVuY3Rpb24sIGRhdGUsIHJlZ2V4cCwgc3RyaW5nLCBudW1iZXIsIGJvb2xlYW4sIGVycm9yXG4gIGxldCBpbnRlcm5hbENsYXNzID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG8pLm1hdGNoKC9cXFtvYmplY3RcXHMoXFx3KylcXF0vKVsxXTtcbiAgcmV0dXJuIGludGVybmFsQ2xhc3MudG9Mb3dlckNhc2UoKTtcbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBhamF4KGNvbmZpZyl7XG4gIGxldFxuICAgIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICBtZXRob2QgPSBjb25maWcubWV0aG9kID09PSB1bmRlZmluZWQgPyAnR0VUJyA6IGNvbmZpZy5tZXRob2QsXG4gICAgZmlsZVNpemU7XG5cbiAgZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcblxuICAgIHJlamVjdCA9IHJlamVjdCB8fCBmdW5jdGlvbigpe307XG4gICAgcmVzb2x2ZSA9IHJlc29sdmUgfHwgZnVuY3Rpb24oKXt9O1xuXG4gICAgcmVxdWVzdC5vbmxvYWQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYocmVxdWVzdC5zdGF0dXMgIT09IDIwMCl7XG4gICAgICAgIHJlamVjdChyZXF1ZXN0LnN0YXR1cyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoY29uZmlnLnJlc3BvbnNlVHlwZSA9PT0gJ2pzb24nKXtcbiAgICAgICAgZmlsZVNpemUgPSByZXF1ZXN0LnJlc3BvbnNlLmxlbmd0aDtcbiAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHJlcXVlc3QucmVzcG9uc2UpLCBmaWxlU2l6ZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHJlc29sdmUocmVxdWVzdC5yZXNwb25zZSk7XG4gICAgICAgIHJlcXVlc3QgPSBudWxsO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXF1ZXN0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtcbiAgICAgICAgY29uZmlnLm9uRXJyb3IoZSk7XG4gICAgfTtcblxuICAgIHJlcXVlc3Qub3BlbihtZXRob2QsIGNvbmZpZy51cmwsIHRydWUpO1xuXG4gICAgaWYoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpe1xuICAgICAgICByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoY29uZmlnLm92ZXJyaWRlTWltZVR5cGUpO1xuICAgIH1cblxuICAgIGlmKGNvbmZpZy5yZXNwb25zZVR5cGUpe1xuICAgICAgICBpZihjb25maWcucmVzcG9uc2VUeXBlID09PSAnanNvbicpe1xuICAgICAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSAndGV4dCc7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVxdWVzdC5yZXNwb25zZVR5cGUgPSBjb25maWcucmVzcG9uc2VUeXBlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYobWV0aG9kID09PSAnUE9TVCcpIHtcbiAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyk7XG4gICAgfVxuXG4gICAgaWYoY29uZmlnLmRhdGEpe1xuICAgICAgICByZXF1ZXN0LnNlbmQoY29uZmlnLmRhdGEpO1xuICAgIH1lbHNle1xuICAgICAgICByZXF1ZXN0LnNlbmQoKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZXhlY3V0b3IpO1xufVxuXG5cbmZ1bmN0aW9uIHBhcnNlU2FtcGxlKHNhbXBsZSwgaWQsIGV2ZXJ5KXtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCl7XG4gICAgdHJ5e1xuICAgICAgY29uZmlnLmNvbnRleHQuZGVjb2RlQXVkaW9EYXRhKHNhbXBsZSxcbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzKGJ1ZmZlcil7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyhpZCwgYnVmZmVyKTtcbiAgICAgICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogYnVmZmVyfSk7XG4gICAgICAgICAgICBpZihldmVyeSl7XG4gICAgICAgICAgICAgIGV2ZXJ5KHsnaWQnOiBpZCwgJ2J1ZmZlcic6IGJ1ZmZlcn0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1lbHNle1xuICAgICAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgICAgICAgaWYoZXZlcnkpe1xuICAgICAgICAgICAgICBldmVyeShidWZmZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvbkVycm9yKGUpe1xuICAgICAgICAvL2NvbnNvbGUubG9nKCdlcnJvciBkZWNvZGluZyBhdWRpb2RhdGEnLCBpZCwgZSk7XG4gICAgICAgIC8vcmVqZWN0KGUpOyAvLyBkb24ndCB1c2UgcmVqZWN0IGJlY2F1c2Ugd2UgdXNlIHRoaXMgYXMgYSBuZXN0ZWQgcHJvbWlzZSBhbmQgd2UgZG9uJ3Qgd2FudCB0aGUgcGFyZW50IHByb21pc2UgdG8gcmVqZWN0XG4gICAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gICAgfWNhdGNoKGUpe1xuICAgICAgLy9jb25zb2xlLmxvZygnZXJyb3IgZGVjb2RpbmcgYXVkaW9kYXRhJywgaWQsIGUpO1xuICAgICAgLy9yZWplY3QoZSk7XG4gICAgICBpZihpZCAhPT0gdW5kZWZpbmVkKXtcbiAgICAgICAgcmVzb2x2ZSh7J2lkJzogaWQsICdidWZmZXInOiB1bmRlZmluZWR9KTtcbiAgICAgIH1lbHNle1xuICAgICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuXG5mdW5jdGlvbiBsb2FkQW5kUGFyc2VTYW1wbGUodXJsLCBpZCwgZXZlcnkpe1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gZXhlY3V0b3IocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBhamF4KHt1cmw6IHVybCwgcmVzcG9uc2VUeXBlOiAnYXJyYXlidWZmZXInfSkudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKGRhdGEpe1xuICAgICAgICBwYXJzZVNhbXBsZShkYXRhLCBpZCwgZXZlcnkpLnRoZW4ocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiBvblJlamVjdGVkKCl7XG4gICAgICAgIGlmKGlkICE9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIHJlc29sdmUoeydpZCc6IGlkLCAnYnVmZmVyJzogdW5kZWZpbmVkfSk7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgIHJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0pO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVNhbXBsZXMobWFwcGluZywgZXZlcnkpe1xuICBsZXQga2V5LCBzYW1wbGUsXG4gICAgcHJvbWlzZXMgPSBbXSxcbiAgICB0eXBlID0gdHlwZVN0cmluZyhtYXBwaW5nKTtcblxuICBldmVyeSA9IHR5cGVTdHJpbmcoZXZlcnkpID09PSAnZnVuY3Rpb24nID8gZXZlcnkgOiBmYWxzZTtcbiAgLy9jb25zb2xlLmxvZyh0eXBlLCBtYXBwaW5nKVxuICBpZih0eXBlID09PSAnb2JqZWN0Jyl7XG4gICAgZm9yKGtleSBpbiBtYXBwaW5nKXtcbiAgICAgIGlmKG1hcHBpbmcuaGFzT3duUHJvcGVydHkoa2V5KSl7XG4gICAgICAgIHNhbXBsZSA9IG1hcHBpbmdba2V5XTtcbiAgICAgICAgaWYoc2FtcGxlLmluZGV4T2YoJ2h0dHA6Ly8nKSA9PT0gLTEpe1xuICAgICAgICAgIHByb21pc2VzLnB1c2gocGFyc2VTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwga2V5LCBldmVyeSkpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShzYW1wbGUsIGtleSwgZXZlcnkpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgbWFwcGluZy5mb3JFYWNoKGZ1bmN0aW9uKHNhbXBsZSl7XG4gICAgICBpZihzYW1wbGUuaW5kZXhPZignaHR0cDovLycpID09PSAtMSl7XG4gICAgICAgIHByb21pc2VzLnB1c2gocGFyc2VTYW1wbGUoYmFzZTY0VG9CaW5hcnkoc2FtcGxlKSwgZXZlcnkpKTtcbiAgICAgIH1lbHNle1xuICAgICAgICBwcm9taXNlcy5wdXNoKGxvYWRBbmRQYXJzZVNhbXBsZShzYW1wbGUsIGV2ZXJ5KSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KXtcbiAgICBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihcbiAgICAgIGZ1bmN0aW9uIG9uRnVsZmlsbGVkKHZhbHVlcyl7XG4gICAgICAgIGlmKHR5cGUgPT09ICdvYmplY3QnKXtcbiAgICAgICAgICBsZXQgbWFwcGluZyA9IHt9O1xuICAgICAgICAgIHZhbHVlcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICAgIG1hcHBpbmdbdmFsdWUuaWRdID0gdmFsdWUuYnVmZmVyO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vY29uc29sZS5sb2cobWFwcGluZyk7XG4gICAgICAgICAgcmVzb2x2ZShtYXBwaW5nKTtcbiAgICAgICAgfWVsc2UgaWYodHlwZSA9PT0gJ2FycmF5Jyl7XG4gICAgICAgICAgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gb25SZWplY3RlZChlKXtcbiAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgfVxuICAgICk7XG4gIH0pO1xufVxuXG5cblxuLy8gYWRhcHRlZCB2ZXJzaW9uIG9mIGh0dHBzOi8vZ2l0aHViLmNvbS9kYW5ndWVyL2Jsb2ctZXhhbXBsZXMvYmxvYi9tYXN0ZXIvanMvYmFzZTY0LWJpbmFyeS5qc1xuZnVuY3Rpb24gYmFzZTY0VG9CaW5hcnkoaW5wdXQpe1xuICBsZXQga2V5U3RyID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JyxcbiAgICBieXRlcywgdWFycmF5LCBidWZmZXIsXG4gICAgbGtleTEsIGxrZXkyLFxuICAgIGNocjEsIGNocjIsIGNocjMsXG4gICAgZW5jMSwgZW5jMiwgZW5jMywgZW5jNCxcbiAgICBpLCBqID0gMDtcblxuICBieXRlcyA9IE1hdGguY2VpbCgoMyAqIGlucHV0Lmxlbmd0aCkgLyA0LjApO1xuICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoYnl0ZXMpO1xuICB1YXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIpO1xuXG4gIGxrZXkxID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aC0xKSk7XG4gIGxrZXkyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGlucHV0Lmxlbmd0aC0xKSk7XG4gIGlmKGxrZXkxID09IDY0KSBieXRlcy0tOyAvL3BhZGRpbmcgY2hhcnMsIHNvIHNraXBcbiAgaWYobGtleTIgPT0gNjQpIGJ5dGVzLS07IC8vcGFkZGluZyBjaGFycywgc28gc2tpcFxuXG4gIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcXCtcXC9cXD1dL2csICcnKTtcblxuICBmb3IoaSA9IDA7IGkgPCBieXRlczsgaSArPSAzKSB7XG4gICAgLy9nZXQgdGhlIDMgb2N0ZWN0cyBpbiA0IGFzY2lpIGNoYXJzXG4gICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcbiAgICBlbmMyID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGorKykpO1xuICAgIGVuYzMgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaisrKSk7XG4gICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChqKyspKTtcblxuICAgIGNocjEgPSAoZW5jMSA8PCAyKSB8IChlbmMyID4+IDQpO1xuICAgIGNocjIgPSAoKGVuYzIgJiAxNSkgPDwgNCkgfCAoZW5jMyA+PiAyKTtcbiAgICBjaHIzID0gKChlbmMzICYgMykgPDwgNikgfCBlbmM0O1xuXG4gICAgdWFycmF5W2ldID0gY2hyMTtcbiAgICBpZihlbmMzICE9IDY0KSB1YXJyYXlbaSsxXSA9IGNocjI7XG4gICAgaWYoZW5jNCAhPSA2NCkgdWFycmF5W2krMl0gPSBjaHIzO1xuICB9XG4gIC8vY29uc29sZS5sb2coYnVmZmVyKTtcbiAgcmV0dXJuIGJ1ZmZlcjtcbn1cblxuXG5cbmV4cG9ydCBmdW5jdGlvbiBlcnJvcigpe1xuICBpZihjb25maWcuZ2V0KCdkZWJ1Z0xldmVsJykgPj0gMSl7XG4gICAgLy9jb25zb2xlLmVycm9yKC4uLmFyZ3VtZW50cyk7XG4gICAgLy9jb25zb2xlLnRyYWNlKCk7XG4gICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnRVJST1I6JywgLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3YXJuKCl7XG4gIGlmKGNvbmZpZy5nZXQoJ2RlYnVnTGV2ZWwnKSA+PSAyKXtcbiAgICAvL2NvbnNvbGUud2FybiguLi5hcmd1bWVudHMpO1xuICAgIC8vY29uc29sZS50cmFjZSgpO1xuICAgIGNvbnNvbGUuZ3JvdXBDb2xsYXBzZWQoJ1dBUk5JTkc6JywgLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbmZvKCl7XG4gIGlmKGNvbmZpZy5nZXQoJ2RlYnVnTGV2ZWwnKSA+PSAzKXtcbiAgICAvL2NvbnNvbGUuaW5mbyguLi5hcmd1bWVudHMpO1xuICAgIC8vY29uc29sZS50cmFjZSgnSU5GTycsIC4uLmFyZ3VtZW50cyk7XG4gICAgY29uc29sZS5ncm91cENvbGxhcHNlZCgnSU5GTzonLCAuLi5hcmd1bWVudHMpO1xuICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICBjb25zb2xlLmdyb3VwRW5kKCk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZygpe1xuICBpZihjb25maWcuZ2V0KCdkZWJ1Z0xldmVsJykgPj0gNCl7XG4gICAgLy9jb25zb2xlLmxvZyguLi5hcmd1bWVudHMpO1xuICAgIC8vY29uc29sZS50cmFjZSgnTE9HJywgLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLmdyb3VwQ29sbGFwc2VkKCdMT0c6JywgLi4uYXJndW1lbnRzKTtcbiAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgY29uc29sZS5ncm91cEVuZCgpO1xuICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGdldE5pY2VUaW1lKG1pbGxpcyl7XG4gIGxldCBoLCBtLCBzLCBtcyxcbiAgICAgIHNlY29uZHMsXG4gICAgICB0aW1lQXNTdHJpbmcgPSAnJztcblxuICBzZWNvbmRzID0gbWlsbGlzLzEwMDA7IC8vIOKGkiBtaWxsaXMgdG8gc2Vjb25kc1xuICBoID0gbUZsb29yKHNlY29uZHMgLyAoNjAgKiA2MCkpO1xuICBtID0gbUZsb29yKChzZWNvbmRzICUgKDYwICogNjApKSAvIDYwKTtcbiAgcyA9IG1GbG9vcihzZWNvbmRzICUgKDYwKSk7XG4gIG1zID0gbVJvdW5kKChzZWNvbmRzIC0gKGggKiAzNjAwKSAtIChtICogNjApIC0gcykgKiAxMDAwKTtcblxuICB0aW1lQXNTdHJpbmcgKz0gaCArICc6JztcbiAgdGltZUFzU3RyaW5nICs9IG0gPCAxMCA/ICcwJyArIG0gOiBtO1xuICB0aW1lQXNTdHJpbmcgKz0gJzonO1xuICB0aW1lQXNTdHJpbmcgKz0gcyA8IDEwID8gJzAnICsgcyA6IHM7XG4gIHRpbWVBc1N0cmluZyArPSAnOic7XG4gIHRpbWVBc1N0cmluZyArPSBtcyA9PT0gMCA/ICcwMDAnIDogbXMgPCAxMCA/ICcwMCcgKyBtcyA6IG1zIDwgMTAwID8gJzAnICsgbXMgOiBtcztcblxuICAvL2NvbnNvbGUubG9nKGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIHtcbiAgICAgIGhvdXI6IGgsXG4gICAgICBtaW51dGU6IG0sXG4gICAgICBzZWNvbmQ6IHMsXG4gICAgICBtaWxsaXNlY29uZDogbXMsXG4gICAgICB0aW1lQXNTdHJpbmc6IHRpbWVBc1N0cmluZyxcbiAgICAgIHRpbWVBc0FycmF5OiBbaCwgbSwgcywgbXNdXG4gIH07XG59XG4iXX0=
