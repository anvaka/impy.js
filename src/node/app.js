/* namespace node */
/* import '../utils/resolver.js' */
/* import '../utils/printer.js' */

var getSource = function (location, callback) {
        var fs = require('fs');
        fs.readFile(location, 'utf8', function(err, data) {
            if (err) {
                console.error('Could not read ' + location +'. Make sure the file exists.');
                throw err;
            }
            callback(data);
        });
    };

function prepareExports(env) {
    env.getSource = getSource;
    env.path = require('path');

    return {
        load : function (file, loadedCallback) {
            env.entryPoint = env.path.resolve(file);
            env.global = 'module.exports';

            var currentDir = process.cwd();
            
            var loader = utils.resolveLoader(currentDir, file, env);
            loader.load(function () {
                var topModule = loader.getDefinition();
                utils.printCode(env, topModule.namespace);
                if (typeof loadedCallback === 'function') { loadedCallback(topModule); }
            });
        }
    };
}

/* export prepareExports */