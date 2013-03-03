impy.js
=======

I've been doing JavaScript development for a little over a year now, and I'm disappointed by lack of modules support in JS world. This is my attempt to make development of my next application fast and easy.

Example
-------

Let's say your project consists of two files ```timeUtils.js``` and ```main.js```:

*timeUtils.js*
```javascript
/* namespace util */
function printTime() {
  return (new Date()).toLocaleTimeString();
}

/* export printTime */
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

You can also direct impy.js to compile the code starting from the given file. Once your code is compiled there are no traces of impy at all. Leaving only your code and 0 bytes of extra-dependencies in the runtime.

Experimental Warning
--------------------
This library is highly experimental. It is itself is written in an "impy style": check the ```src``` folder to see how it's structured and compare it with the ```dist``` folder. *The library uses itself to compile its own source code*.

My goal is to make a developer friendly environment, with a very concise API. Thus I may change it as I play with impy in my other projects.

Have a feedback? 
----------------
I love it! Please do not hesitate to drop me a line and tell what you think: anvaka@gmail.com
