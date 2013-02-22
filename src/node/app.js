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

function run(env) {
    env.getSource = getSource;
    env.path = require('path');

    exports.load = function(file) {
        env.entryPoint = env.path.resolve(file);
        var currentDir = process.cwd();
        
        var loader = utils.resolveLoader(currentDir, file, env);
        loader.load(function () {
            var topModule = loader.getDefinition();
            utils.printCode(env, topModule.namespace);
        });
    }
}

/* export run */