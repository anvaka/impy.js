impy.js
=======

This is my attempt to make development of my next application fast and easy. The library allows you to organize your code nicely into separate files. When debugging your code within the browser each file appears as a seprate resource in the dev tools. Once you are done developing, you can compile the code and have just one file, wrapped in [UMD loader](https://github.com/umdjs/umd). Compilation result has no dependency on impy.js, and is absolutely valid module in CJS/AMD/Browser worlds.

Example
-------

Let's say your project consists of two files ```timeUtils.js``` and ```main.js```:

*timeUtils.js*
```javascript
/* namespace util */

/* export printTime */
function printTime() {
  return (new Date()).toLocaleTimeString();
}
```

*main.js*
```javascript
/* import 'timeUtils.js' */
console.log(util.printTime());
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

Have a feedback? 
----------------
I love it! Please do not hesitate to drop me a line and tell what you think: anvaka@gmail.com
