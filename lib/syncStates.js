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
