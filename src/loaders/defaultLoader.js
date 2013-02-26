/* namespace loaders */

/* import '../model/moduleDef.js' */
/* import '../utils/namespace.js' */

function DefaultLoader(resourceLocation, env, resolveLoader) {
    var parseModule = function (jsFile) {
            var moduleDef = new model.ModuleDef(),
                declarationType,
                importDefinition,
                re = /\s*?\/\*\s*(import|export|namespace)\s+(.+?);?\s*?\*\//g;

            //while(match = re.exec(jsFile)) {
            moduleDef.code = jsFile.replace(re, function(match, declarationType, declaration, pos) {
                // console.dir(arguments);
                // declarationType = match[1];
                if (declarationType === 'import') {
                    moduleDef.addImportDef(declaration)
                } else if (declarationType === 'export') {
                    moduleDef.addExportDef(declaration);
                } else if (declarationType === 'namespace') {
                    moduleDef.setNamespace(declaration);
                }
                return '';
            });

            // moduleDef.code = jsFile;
            return moduleDef;
        },
        codePrinted = false,
        invoke = function (moduleDef, fileName) {
            var code = [],
                compiledCode,
                exports = moduleDef.exports,
                expressionName = '',
                namespace = moduleDef.getNamespace(),
                argSep = namespace ? ', ' : '';

            if (!utils.isNamespaceRegistered(namespace)) {
                utils.registerNamespace(namespace);
                // should go in global scope. Dots should be resolved.
                code.push('var ' + namespace + ' = {};');
                code.push('');
            }
            if (!codePrinted) {

                if (env.debugerName) {
                    // TODO: should be just a file name!
                    // expressionName = fileName + '_js';
                }
                if (env.onlyPrint) {
                    code.push('// import ' + fileName);
                    code.push('(function ' + expressionName +'(' + namespace + ') {');
                } else {
                    // we need to provide a runtime's global variable to comply with compiled api:
                    code.push('(function ' + expressionName +'(' + namespace + argSep + 'global) {');
                }
                
                // ideally this needs indent (for pretty print):
                code.push(moduleDef.code);
                for (var i = 0; i < exports.length; ++i) {
                    if (namespace) {
                        var exportName = exports[i].exportDeclaration;
                        code.push(namespace + '.' + exportName + ' = ' +
                                  exportName + '; // export ' + exportName);
                    } else {
                        // todo: global?
                        console.log('Global exports are not implemented');
                    }
                }
                if (env.onlyPrint) {
                    code.push('}(' + namespace + '));');
                } else {
                    code.push('}(' + namespace + argSep + env.global + '));');
                }

                compiledCode = code.join('\n');
                codePrinted = true;
            } else {
                // todo: satisfy specific imports.
            }
            /*jslint evil: true */

            if (compiledCode) {
                if (env.onlyPrint) {
                    env.executedCode.push(compiledCode);
                } else {
                    // avoiding problems with IE conditionals:
                    /*@if (@_jscript) @else @*/
                    compiledCode += '\n//@ sourceURL=' + fileName;
                    /*@end@*/
                    (function(){ (0, eval)(compiledCode); }());
                }
            }
        },
        
        moduleDefinition,

        loadModule = function (text, callback) {
            var moduleDef = parseModule(text),
                imports = moduleDef.imports,
                loader,
                i;
            for (i = 0; i < imports.length; ++i) {
                loader = resolveLoader(env.path.dirname(resourceLocation), imports[i].importPath, env);
                imports[i].assignLoader(loader);
            }

            moduleDefinition = moduleDef; // store to let other read info about this module

            moduleDef.resolveImports(function () {
                invoke(moduleDef, resourceLocation);
                callback();
            });
        };

    // loader is considered ready only when it has already loaded 
    // referenced resource:
    this.isReady = false;
    var that = this;
    this.load = function (loadedCallback) {
        if (this.isReady) {
            loadedCallback();
            return true;
        } 
        env.getSource(resourceLocation, function (source) {
            loadModule(source, function() {
                that.isReady = true;
                if (loadedCallback) { loadedCallback(that);}
            });
        });
    };

    this.getDefinition = function () {
        return moduleDefinition;
    };
    this.getLocation = function () {
        return resourceLocation; // todo: should be relative
    }
}

/* export DefaultLoader */