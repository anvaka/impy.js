impy.js
=======

<<<<<<< HEAD
This is my attempt to make development of my next application fast and easy. The library allows you to organize your code nicely into separate files. When debugging your code within the browser each file appears as a seprate resource in the dev tools. Once you are done developing, you can compile the code and have just one file, wrapped in [UMD loader](https://github.com/umdjs/umd). Compilation result has no dependency on impy.js, and is absolutely valid module in CJS/AMD/Browser worlds.
=======
This is my attempt to make development of my next application fast and easy. The library allows you to organize your code nicely into separate files. When debugging your code within the browser each file appears as a separate resource in the dev tools. Once you are done developing, you can compile the code and have just one file, wrapped in [UMD loader](https://github.com/umdjs/umd). Compilation result has no dependency on impy.js, and is absolutely valid module in CJS/AMD/Browser worlds. Let's see these features in more details.
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7

Example
-------

Let's say your project consists of two files ```timeUtils.js``` and ```main.js```:

*timeUtils.js*
```javascript
/* namespace util */

<<<<<<< HEAD
/* export printTime */
function printTime() {
=======
/* export */
function getLocalTime() {
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
  return (new Date()).toLocaleTimeString();
}
```

*main.js*
```javascript
/* import 'timeUtils.js' */
<<<<<<< HEAD
console.log(util.printTime());
=======
console.log(util.getLocalTime());
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
```

Your main development page *index.html*:
```html
<html>
<head>
    <title>Time logger</title>
    <script src='impy.js' data-main='main.js'></script>
</head>
<body>
<!-- ... -->
</body>
</html>
```

<<<<<<< HEAD
When you open this page in the browser impy resolves all dependencies and executes the code:
```javascript
(function(global) {
    var util = {};

    // import timeUtils.js
    (function timeUtils_js(util) {

        function printTime() {
            return (new Date()).toLocaleTimeString();
        }
        util.printTime = printTime; // export printTime
    }(util));

    // import main.js
    (function main_js() {
        console.log("Current time is: " + util.printTime());
    }());

}).call(this, (typeof module !== "undefined" && module.exports) || window);
```

It will also load each file in your developer tools as a separate resource, so you are never lost in the 80,000 lines of combined code.
![Debugging by files](https://raw.github.com/anvaka/impy.js/master/docs/assets/impy_files.png)

You can also direct impy.js to compile the code starting from the given file. Once your code is compiled there are no traces of impy at all. Leaving only your code and 0 bytes of extra-dependencies in the runtime.

Experimental Warning
--------------------
This library is highly experimental. It is itself is written in an "impy style": check the ```src``` folder to see how it's structured and compare it with the ```dist``` folder. *The library uses itself to compile its own source code*.

My goal is to make a developer friendly environment, with a very concise API. Thus I may change it as I play with impy in my other projects.
=======
When you open this page in the browser impy.js resolves all dependencies and runs the program. This is the final code which actually gets executed:
```javascript
(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory({});
    }
}(this, function (exports) {
    var util = {};
    // import timeUtils.js into util namespace:
    (function(util) {
        function getLocalTime() {
          return (new Date()).toLocaleTimeString();
        }
        
        util.getLocalTime = getLocalTime;
    }(util));

    console.log(util.getLocalTime());
}));
```

Namespaces is the way to organize internal code structure. As you can see from code above the outer world never gets a chance to know what's inside your library. This helps to not pollute global JavaScript namespace, but what if you want to export stuff to let others use your library?

/* package */
-------------
In different programming languages the set of public library API is often known as a package, a module or an assembly. Impy provides two instructions to let you declare public API of your code:

* ```/* package name */``` - by this ```name``` your code will go in the browser environment. (i.e. window.name will be your "window" into the library's public export).
* ```/* public export foo */``` - makes variable ```foo``` part of the public API of your library. 

You can see both of these directives being used in the impy itself: take a look at impy's [main.js](https://github.com/anvaka/impy.js/blob/master/src/main.js#L1) - the library goes by name ```impyjs```, and exports ```load``` function. Oh, yes, the impy is using itself to organize and compile its own code. 

Development experience is at core
---------------------------------

When developing your code with impy each file of your project is shown as a separate resource in the dev tools:

![Debugging by files](https://raw.github.com/anvaka/impy.js/master/docs/assets/impy_files.png)

Impy generates source maps on the fly and provides it to the browser.

Awesome unit testing experience
-------------------------------
When testing impy-based code it's super easy to test one file at a time, and have all required dependencies pulled in, with no need to rebuild your entire code base. The following is a part of the actual impy's test suite ([parser_tests.js](https://github.com/anvaka/impy.js/blob/master/tests/parser_tests.js#L4-L6)):

```javascript
impyjs.load('../src/utils/parser.js',
    function (_, api) {
        var parser = api.utils.parseModule;

        test('Empty file', function () {
            var moduleDef = parser('');

            equal(moduleDef.exports.length, 0, "No exports");
            equal(moduleDef.imports.length, 0, "No imports");
        });
    }
);
```
Let's say this test fails. To fix it, you only need to edit [parser.js](https://github.com/anvaka/impy.js/blob/master/src/utils/parser.js), and nothing else. Impy knows how to dynamically pull all dependencies of the parser.js, and provide exported features of the 'parser.js' via the second ```api``` argument. This keeps global namespace always clean and nice.


Experimental Warning
--------------------
This library is highly experimental. My goal is to make a developer friendly environment, with a very concise API. Thus I may change it as I play with impy in my other projects.
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7

Have a feedback? 
----------------
I love it! Please do not hesitate to drop me a line and tell what you think: anvaka@gmail.com
