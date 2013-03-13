/* namespace loaders */

/* import '../utils/parser.js' */

<<<<<<< HEAD
=======
/* export */
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
function DefaultLoader(resourceLocation, env, resolveLoader) {
    var codeGenerated = false,
        moduleDefinition,
        loadModule = function (text, callback) {
            var moduleDef = utils.parseModule(text),
                imports = moduleDef.imports,
                loader,
                i;
            for (i = 0; i < imports.length; ++i) {
                loader = resolveLoader(env.path.dirname(resourceLocation), imports[i].importPath, env);
                imports[i].assignLoader(loader);
            }

            moduleDefinition = moduleDef; // store to let other read info about this resource

            moduleDef.resolveImports(function onImportsResolved() {
                if (!codeGenerated) {
                    env.codeGenerator.addFile(moduleDef, resourceLocation);
                    codeGenerated = true;
<<<<<<< HEAD
                } else {
                    // todo: satisfy specific imports.
                }
=======
                } 
                // todo: satisfy specific imports?
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7

                callback();
            });
        };

    // loader is considered ready only when it has already loaded 
    // referenced resource:
    this.isReady = false;
    var that = this;
    this.load = function (loadedCallback) {
        if (this.isReady) {
            setTimeout(function onTransferCompleted() { loadedCallback(that); }, 0);
        } else {
            env.getSource(resourceLocation, function onTransferCompleted(source) {
                loadModule(source, function () {
                    that.isReady = true;
                    if (loadedCallback) { loadedCallback(that); }
                });
            });
        }
    };

    this.getDefinition = function () {
        return moduleDefinition;
    };
    this.getLocation = function () {
        return resourceLocation; // todo: should be relative
    };
<<<<<<< HEAD
}

/* export DefaultLoader */
=======
}
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
