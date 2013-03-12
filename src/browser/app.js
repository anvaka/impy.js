/* namespace browser */

/* import 'path.js' */
/* import '../utils/resolver.js' */
/* import '../utils/printer.js' */
/* import '../utils/codeGen.js' */

var getEntryPoint = function (env) {
        var allScripts =  document.getElementsByTagName('script'),
            entryPoint = allScripts[allScripts.length - 1].getAttribute('data-main'),
            port = window.location.port ? ':' + window.location.port : '',
            basePath = window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;

        basePath = env.path.dirname(basePath);
        return entryPoint ? env.path.resolve(basePath, entryPoint) : null;
    },

    getSource = function (location, callback) {
        var r = new XMLHttpRequest(),
            transferComplete = function (e) {
                if (r.status < 200 || r.status > 299) {
                    console.error('Bad response code (' + r.status + ') for ' + location +'. Make sure the file exists.');
                    // exception?
                }
                callback(this.responseText);
            },
            transferFailed = function (e) {
                console.error('Failed to load ' + location);
                throw e;
            };

        r.onload = transferComplete;
        r.onerror = transferFailed;

        r.open('GET', location, true);
        r.send();
    };

function prepareExports (env) {
    env.path = browser.path;
    env.entryPoint = getEntryPoint(env);
    env.getSource = getSource;

    return {
        load : function (file, loadedCallback) {
            var loader = utils.resolveLoader(env.path.dirname(document.URL), file, env);
            env.codeGenerator = new utils.CodeGenerator(env);
            loader.load(function () {
                var topModule = loader.getDefinition();
                env.codeGenerator.setPackageName(topModule.packageName);
                utils.printCode(env);
                if (typeof loadedCallback === 'function') { loadedCallback(topModule); }
            });
        }
    };
}

/* export prepareExports */