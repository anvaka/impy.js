/* import 'node/app.js' */
/* import 'browser/app.js' */
/* import 'version.js' */

/* namespace impyjs */

var env = {
    isNode: (typeof process !== 'undefined'),
    executedCode: [],
    onlyPrint: true
};

if (env.isNode) {
    node.run(env);
} else {
    env.onlyPrint = false; // run the code, do not print it.
    loader = browser.run(env);
}

// TODO: I still need to work on global module exports.
// this is not really good and will not work in node.
global.impyjs = impyjs;