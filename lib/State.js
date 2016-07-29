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
        for (var i = listeners.length; i >= 0; i--) {
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