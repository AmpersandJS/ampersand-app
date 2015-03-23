# ampersand-app

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

Simple instance store and event channel that allows different modules within your app to communicate without requiring each other directly. The entire module is only ~30 lines of code, you can [read the source here](https://github.com/AmpersandJS/ampersand-app/blob/master/ampersand-app.js) to see exactly what it does.


## The Singleton pattern

Whenever you `require('ampersand-app')` it returns *the same instance of a plain 'ol JavaScript `Object`*.

This is called the [Singleton pattern](http://en.wikipedia.org/wiki/Singleton_pattern). 

This object it returns is nothing special. It's just a plain old JavaScript `Object` that has been decorated with [ampersand-events](http://ampersandjs.com/docs#ampersand-events) methods as well as an `extend` and `reset` method.

That's it!


## Why is this useful?

It's quite common to create an `app` global to store collections and models on and then to reference that global whenever you need to look up related model instance from another module within your app. However, this creates many indirect interdependencies within your application which makes it more difficult to test isolated parts of your application. 

It's also quite common to need "application-level" events that any number of pieces of your app may need to handle. For example, navigation events, or error events that could be triggered by any number of things within your app but that you want to handle by a single module that shows them as nice error dialogs.

This module provides a pattern to address both those cases without having to rely on globals, or have circular dependency issues within your apps. It also means you don't have to adjust code linting rules to ignore that `app` global.


**Before `ampersand-app`**

Module "A" (app.js):

```javascript
var MyModel = require('./models/some-model');

// explicitly create global
window.app = {
    init: function () {
        this.myModel = new MyModel();
    }
};

window.app.init();
```

Module "B" (that needs access to `app`):

```javascript
// note we're not requiring anything
module.exports = View.extend({
    someMethod: function () {
        // reference app and models directly
        app.myModel.doSomething():
    }
});
```

**With `ampersand-app` you'd do this instead:**

Module "A" (app.js):

```javascript
// it just requires ampersand-app too!
var app = require('ampersand-app');
var MyModel = require('./models/some-model');

// Here we could certainly *chose* to attach it to
// window for better debugging in the browser 
// but it's no longer necessary for accessing the 
// app instance from other modules.
app.extend({
    init: function () {
        this.myModel = new MyModel();
    }
};

app.init();
```

Module "B" (that needs access to `app`):

```javascript
// this just requires ampersand-app too!
var app = require('ampersand-app');


module.exports = View.extend({
    someMethod: function () {
        // reference app that we required above
        app.myModel.doSomething():

        // now as a bonus, since `app` supports events
        // we've also got a global "pubsub" mechanism
        // for app events, that any other modules can 
        // listen to.
        app.trigger('some custom event');
    }
});
```

Now when we go to write tests for module "B" we can easily mock things that it expects from `app`. 

So our tests for module B might look like this:

```js
var test = require('tape');
var ModuleB = require('../module-b');
// note we just require ampersand-app here
// and make sure it has what module b expects
var app = require('ampersand-app');


test('test module B', function (t) {
    // each test can clear it.
    app.reset();
    // stub out what it might need for the
    // test.
    app.myModel = {
        doSomething: function () {}
    };

    // check to make sure calling 
    // `someMethod` fires event on app
    app.on('some custom event', function () {
        t.pass('custom event fired');

        // app also has a `reset` for testing
        // purposes that purges it to start over
        // so this could be used to reset before each test
        app.reset();

        t.end();
    });

    var view = new ModuleB();
    
    t.doesNotThrow(function () {
        view.someMethod();
    }, 'make sure calling some method does not explode');
});

test('next test', function () {
    // now we can use `reset` if we want
    // to make sure we clear that state
    app.reset();

    // etc. etc.
});
```


## Warning: Not for use in re-usable modules

**If you're writing a re-usable module for distribution on [npm](http://npmjs.org/) it should not have `ampersand-app` as a dependency.**

Doing so makes assumptions about how you want it to be used.

Say you want to make an `error` event handling module, that requires `ampersand-app` listens for `error` events from that `app` and shows a nice error dialog. 

Rather than make all those assumptions about how its going to be used, just make the nice error dialog view and suggest in the readme how someone might use `ampersand-app` as an event channel to trigger them.

This allows people who don't use this particular application pattern to still use your npm module and leaves the event names, and application architecture up to the person building the app.


## install

```
npm install ampersand-app
```

## API Reference

### event methods

The `app` object is an event object so it contains all the methods as described in the [ampersand-events docs](http://ampersandjs.com/docs#ampersand-events).

The `app` object becomes a handy way to communicate within your app so various modules can notify each other about "app-level" events such as user navigation, etc.

### extend `app.extend(obj, [*objs])`

Convenience method for attaching multiple things to the app at once. This is simply an alias for `amp-extend` that pre-fills the `app` as the object being extended.

* `obj` {Object} copy properties from this object onto `app`. You can pass as many objects to this as you want as additional arguments.

```javascript
var app = require('ampersand-app');
var UserCollection = require('./models/user-collection');
var MeModel = require('./models/me');


app.extend({
    me: new MeModel(),
    users: new UserCollection(),
    router: new Router(),
    init: function () {
        this.router.history.start({pushState: true});
    }
});
```

### reset `app.reset()`

Resets the app singleton to its original state, clearing all listeners, and deleting everything you've added to it, but keeping the same object instance.

This is primarily for simplifying unit testing of modules within your app. Whenever you `require('ampersand-app')` you get the same object instance (this is the [Singleton pattern](http://en.wikipedia.org/wiki/Singleton_pattern)). So, having `app.reset()` lets you mock app state required for testing a given module.

<!-- starthide -->
## credits

Created by [@HenrikJoreteg](http://twitter.com/henrikjoreteg).

## license

MIT
<!-- endhide -->
