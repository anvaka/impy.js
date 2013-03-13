<<<<<<< HEAD
=======
/*global window */
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
/* namespace browser */

/* import 'path.js' */
/* import '../utils/resolver.js' */
/* import '../utils/printer.js' */
/* import '../utils/codeGen.js' */

<<<<<<< HEAD
var getEntryPoint = function (env) {
        var allScripts =  document.getElementsByTagName('script'),
            entryPoint = allScripts[allScripts.length - 1].getAttribute('data-main'),
=======
var getCurrentScript = function () {
        var allScripts =  window.document.getElementsByTagName('script');
        return allScripts[allScripts.length - 1];
    },
    getEntryPoint = function (env) {
        var entryPoint = getCurrentScript().getAttribute('data-main'),
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
            port = window.location.port ? ':' + window.location.port : '',
            basePath = window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;

        basePath = env.path.dirname(basePath);
        return entryPoint ? env.path.resolve(basePath, entryPoint) : null;
    },

    getSource = function (location, callback) {
<<<<<<< HEAD
        var r = new XMLHttpRequest(),
            transferComplete = function (e) {
                if (r.status < 200 || r.status > 299) {
                    console.error('Bad response code (' + r.status + ') for ' + location +'. Make sure the file exists.');
=======
        var r = new window.XMLHttpRequest(),
            transferComplete = function (e) {
                if (r.status < 200 || r.status > 299) {
                    window.console.error('Bad response code (' + r.status + ') for ' + location + '. Make sure the file exists.');
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
                    // exception?
                }
                callback(this.responseText);
            },
            transferFailed = function (e) {
<<<<<<< HEAD
                console.error('Failed to load ' + location);
=======
                window.console.error('Failed to load ' + location);
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
                throw e;
            };

        r.onload = transferComplete;
        r.onerror = transferFailed;

        r.open('GET', location, true);
        r.send();
    };

<<<<<<< HEAD
function prepareExports (env) {
    env.path = browser.path;
    env.entryPoint = getEntryPoint(env);
    env.getSource = getSource;

    return {
        load : function (file, loadedCallback) {
            var loader = utils.resolveLoader(env.path.dirname(document.URL), file, env);
=======
/* export */
function prepareExports(env) {
    env.path = browser.path;
    env.entryPoint = getEntryPoint(env);
    env.getSource = getSource;
    env.exposeNamespace = getCurrentScript().getAttribute('data-expose-namespace');

    return {
        load : function (file, loadedCallback) {
            var loader = utils.resolveLoader(env.path.dirname(window.document.URL), file, env);
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
            env.codeGenerator = new utils.CodeGenerator(env);
            loader.load(function () {
                var topModule = loader.getDefinition();
                env.codeGenerator.setPackageName(topModule.packageName);
<<<<<<< HEAD
                utils.printCode(env);
                if (typeof loadedCallback === 'function') { loadedCallback(topModule); }
            });
        }
    };
}

/* export prepareExports */
=======
                var result = utils.printCode(env);
                if (typeof loadedCallback === 'function') {
                    loadedCallback(topModule, result);
                }
            });
        }
    };
}
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
