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

	module.exports.State = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports) {

	function State(state, listener) {
		if (listener === undefined) {
			listener = state;
			state = undefined;
		}
		if (state === undefined) {
			state = {};
		}
		function newCursor(parent, path) {
			cursor.path = State.toPath(path);
			cursor.parent = parent;
			function cursor(value) {
				if (value !== undefined) {
					var prevState = state;
					state = State.set(state, cursor.path, value);
					if (prevState !== state) {
						listener({
							cursor : cursor,
							prevState : prevState,
							state : state
						});
					}
				}
				return State.get(state, cursor.path);
			}
			cursor.state = function() {
				return state;
			}
			cursor.root = function() {
				return cursor.parent ? cursor.parent.root() : cursor;
			}
			cursor.cursor = function(p) {
				return newCursor(cursor, cursor.path.concat(State.toPath(p)));
			};
			return cursor;
		}
		return newCursor(null, []);
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
				if (value === undefined || value === null) {
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

/***/ }
/******/ ])
});
;