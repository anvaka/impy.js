/* import 'node/app.js' */
/* import 'browser/app.js' */
/* import 'version.js' */

var env = {
        isNode: (typeof process !== 'undefined'),
        onlyPrint: true,  // a switch: print program or run it?
        executedCode: [], // if only print - this will hold program's code
        debugerName: true // all IIFEs will get a debugger friendly name
    },
    impyAPI;

if (env.isNode) {
    impyAPI = node.prepareExports(env);
} else {
    env.onlyPrint = false; // just for test: run the code, do not print it.
    impyAPI = browser.prepareExports(env);
}

if (env.entryPoint) { // load the first script, if environment has it.
    impyAPI.load(env.entryPoint);
}

// TODO: I'm still playing with library exports. This part may be changed
global.impyjs = impyAPI;