(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	module.exports.State = __webpack_require__(2);
	module.exports.syncStates = __webpack_require__(3);


/***/ },
/* 2 */
/***/ function(module, exports) {

	function State(state, listener) {
	    if (listener === undefined) {
	        listener = state;
	        state = undefined;
	    }
	    var silent = false;
	    var prevState;
	    if (state === undefined) {
	        state = {};
	    }
	    var listeners = [];
	    addListener(listener);
	    function addListener(listener, context) {
	        if (listener) {
	            context = context || this;
	            listeners.push({
	                listener : listener,
	                context : context
	            });
	        }
	        return function() {
	            removeListener(listener);
	        }
	    }
	    function removeListener(listener, context) {
	        if (!listener)
	            return;
	        context = context || this;
	        for (var i = listeners.length - 1; i >= 0; i--) {
	            var l = listeners[i];
	            if (l.listener === listener && l.context === context) {
	                listeners.splice(i, 1);
	            }
	        }
	    }
	    function notify(cursor) {
	        if (!silent && prevState !== state) {
	            var prev = prevState;
	            prevState = state;
	            var ev = {
	                cursor : cursor,
	                prevState : prev,
	                state : state
	            };
	            for (var i = 0; i < listeners.length; i++) {
	                var l = listeners[i];
	                l.listener.call(l.context, ev);
	            }
	        }
	    }
	    function newCursor(parent, path) {
	        cursor.path = State.toPath(path);
	        cursor.parent = parent;
	        function cursor(value) {
	            if (arguments.length && State.get(state, cursor.path) !== value) {
	                state = State.set(state, cursor.path, value);
	                notify(this);
	            }
	            return State.get(state, cursor.path);
	        }
	        cursor.state = function() {
	            return state;
	        }
	        cursor.root = function() {
	            return cursor.parent ? cursor.parent.root() : cursor;
	        }
	        cursor.on = cursor.addListener = addListener;
	        cursor.off = cursor.removeListener = removeListener;
	        cursor.cursor = function(p) {
	            return newCursor(cursor, cursor.path.concat(State.toPath(p)));
	        };
	        return cursor;
	    }
	    var root = newCursor(null, []);
	    root.set = function(action) {
	        try {
	            silent = true;
	            return action.call(this);
	        } finally {
	            silent = false;
	            notify(this);
	        }
	    }
	    return root;
	}

	State.toPath = function(path) {
	    if (!path)
	        return [];
	    if (typeof path === 'string')
	        return path.split('.');
	    return path;
	}

	State.extend = function extend(to) {
	    for (var i = 1; i < arguments.length; i++) {
	        var from = arguments[i];
	        for ( var key in from) {
	            if (from.hasOwnProperty(key)) {
	                to[key] = from[key];
	            }
	        }
	    }
	    return to;
	};
	State.set = function update(obj, path, value) {
	    path = State.toPath(path);
	    return doUpdate(obj, path, 0, value);
	    function doUpdate(obj, path, pos, value) {
	        if (pos >= path.length)
	            return value;
	        var name = path[pos];
	        var oldValue = obj[name];
	        var newValue = doUpdate(oldValue || {}, path, pos + 1, value);
	        if (oldValue !== newValue) {
	            obj = State.extend({}, obj);
	            if (value === undefined && pos === path.length - 1) {
	                delete obj[name];
	            } else {
	                obj[name] = newValue;
	            }
	        }
	        return obj;
	    }
	}

	State.get = function get(obj, path) {
	    path = State.toPath(path);
	    return doGet(obj, path, 0);
	    function doGet(obj, path, pos) {
	        if (pos === path.length || typeof obj !== 'object')
	            return obj;
	        var name = path[pos];
	        var value = obj[name];
	        if (pos < path.length - 1) {
	            return doGet(value, path, pos + 1);
	        } else {
	            return value;
	        }
	    }
	}

	module.exports = State;

/***/ },
/* 3 */
/***/ function(module, exports) {

	function syncStates(a, b, mapping) {
	    var first = {
	        state : a,
	        cursors : [],
	    };
	    var second = {
	        state : b,
	        cursors : [],
	    };
	    Object.keys(mapping).forEach(function(firstPath) {
	        var secondPath = mapping[firstPath];
	        var firstCursor = first.state.cursor(firstPath);
	        var secondCursor = second.state.cursor(secondPath);
	        first.cursors.push(firstCursor);
	        second.cursors.push(secondCursor);
	    });
	    var subscriptions = [];
	    subscriptions.push(copyValues(first, second));
	    subscriptions.push(copyValues(second, first));
	    return function() {
	        subscriptions.forEach(function(f) {
	            f();
	        });
	    }
	    function copyValues(from, to) {
	        var silent = false;
	        return from.state.addListener(function() {
	            if (silent)
	                return;
	            silent = true;
	            try {
	                to.state.set(function() {
	                    for (var i = 0; i < from.cursors.length; i++) {
	                        var value = from.cursors[i]();
	                        // if (value === undefined)
	                        // value = null;
	                        to.cursors[i](value);
	                    }
	                })
	            } finally {
	                silent = false;
	            }
	        });
	    }
	}
	module.exports = syncStates;


/***/ }
/******/ ])
});
;