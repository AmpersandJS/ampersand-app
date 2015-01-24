var test = require('tape');
var app = require('../ampersand-app');
var Events = require('ampersand-events');
var objKeys = require('amp-keys');


test('ampersand-app basic functionality', function (t) {
    // build list of all keys that should be present
    // at base-state.
    var baseKeys = objKeys(Events);
    baseKeys.push('extend', 'reset');
    baseKeys.sort();

    t.deepEqual(objKeys(app).sort(), baseKeys);
    app.extend({some: 'thing'}, {something: 'ok'});
    t.equal(app.some, 'thing', 'should support extend');
    t.equal(app.something, 'ok', 'with multiple objects');

    app.on('message', function (msg) {
        t.equal(msg, 'monosodium glutamate', 'should be eventable');
    });
    app.trigger('message', 'monosodium glutamate');

    app.reset();

    t.deepEqual(objKeys(app).sort(), baseKeys, 'should now only have same keys as when starting');        

    t.end();
});
