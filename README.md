# ampersand-app

<!-- starthide -->
Part of the [Ampersand.js toolkit](http://ampersandjs.com) for building clientside applications.
<!-- endhide -->

Simple instance store for managing instances without circular dependency issues in apps.

This is far more pattern than it is code. It's insanely simple, but the pattern works well. 

Let me explain. In a clientside app, many people create a global called `app` and attach instances to it for things like collections and models. The only trouble is, most of the time, in the module where you create app, you also require other models etc. 

What happens is, when you need to reference an instance from another module you have to just blidly do `app.myWidgets` for example. This means two things, you need to maintain linting rules that allow that reference, when you run tests those will blow up unless you create a corresponding global there too, even if that's not what you're testing.

This module simply creates and exports a singleton where you can attach instances. 

In your app.js (Module "A"):

```js
var MyModel = require('./models/some-model');

window.app = {
    init: function () {
        this.myModel = new MyModel();
    }
};

window.app.init();
```

In another module (Module "B"):

```js
// note we're not requiring anything
module.exports = View.extend({
    someMethod: function () {
        // reference app and models directly
        app.myModel.doSomethig():
    }
});
```

Now module B has a hard dependency on `app` existing. This means for unit testing, you have to mock it up. Plus you have to configure your linter to be ok with you referencing a global, etc.

With `ampersand-app` you'd do this instead:

In your app.js (Module "A"):

```js
var MyModel = require('./models/some-model');
var app = require('ampersand-app');

// here we could certainly *chose* to attach it to
// window for better debuggin in the browser 
// but it's no longer necessary for accessing the 
// app instance from other modules.
app.extend({
    init: function () {
        this.myModel = new MyModel();
    }
};

app.init();
```

In another module (Module "B"):

```js
// now rather than trying to require a relative path to app
// we just require ampersand-app here too:
var app = require('ampersand-app');


module.exports = View.extend({
    someMethod: function () {
        // reference app and models directly
        app.myModel.doSomethig():

        // now as a bonus, since app uses events
        // we've also got a global pubsub mechanism
        // for app events, that other modules can 
        // listen to.
        app.trigger('some custom event');
    }
});
```

Then when we go to write tests for module "B"

We can easily mock things that it expects from `app`. 

So our tests for module B might look like this:

```js
var test = require('tape');
var ModuleB = require('../module-b');
// note we just require ampersand-app here
// and make sure it has what module b expects
var app = require('ampersand-app');


test('test module B', function (t) {
    // stub it out
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
```


## install

```
npm install ampersand-app
```

## credits

If you like this follow [@HenrikJoreteg](http://twitter.com/henrikjoreteg) on twitter.

## license

MIT

