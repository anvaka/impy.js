/* namespace browser */

/* import 'path.js' */
/* import '../utils/resolver.js' */
/* import '../utils/printer.js' */

var getEntryPoint = function (env) {
        var allScripts =  document.getElementsByTagName('script'),
            entryPoint = allScripts[allScripts.length - 1].getAttribute('data-main'),
            port = window.location.port ? ':' + window.location.port : '',
            basePath = window.location.protocol + '//' + window.location.hostname + port + window.location.pathname;
        
        basePath = env.path.dirname(basePath);
        return env.path.resolve(basePath, entryPoint);
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

function run (env) {
    env.path = browser.path;
    env.entryPoint = getEntryPoint(env);
    env.getSource = getSource;

    var loader = utils.resolveLoader('', env.entryPoint, env);
    loader.load(function() {
        var topModule = loader.getDefinition();
        utils.printCode(env, topModule.namespace);
    });
}
    
/* export run */