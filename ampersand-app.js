/*$AMPERSAND_VERSION*/
var Events = require('backbone-events-standalone');


// instance app, can be used just by itself
// or by calling as function to pass labels
// by attaching all instances to this, we can
// avoid globals
var app = {
    extend: function () {
        var source, prop;
        for (var i = 0, length = arguments.length; i < length; i++) {
            source = arguments[i];
            for (prop in source) {
                app[prop] = source[prop];
            }
        }
        return app;
    },
    reset: function () {
        // clear all events
        this.off();
        // remove all but main two methods
        for (var item in this) {
            if (item !== 'extend' && item !== 'reset') {
                delete this[item];
            }
        }
        // remix events
        Events.mixin(this);
    }
};

Events.mixin(app);

// export our singleton
module.exports = app;
