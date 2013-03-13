/* namespace loaders */

/* import '../utils/parser.js' */

/* export */
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
                } 
                // todo: satisfy specific imports?

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
}