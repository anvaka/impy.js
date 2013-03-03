
(function (global) {
var impyjs = {};

// import /Users/anvaka/Documents/projects/impyjs/src/version.js
(function (impyjs) {

var version = '0.0.1';
impyjs.version = version; // export version
}(impyjs));
var utils = {};

// import /Users/anvaka/Documents/projects/impyjs/src/utils/printer.js
(function (utils) {


function printCode(env, topNamespace) {
    if (env.onlyPrint) {
        // wrap top module into its own block to export module's public api:
        env.executedCode.unshift('','(function (global) {');
        env.executedCode.push('', '}).call(this, (typeof module !== "undefined" && module.exports) || window);');

        console.log(env.executedCode.join('\n'));
    }
}
utils.printCode = printCode; // export printCode
}(utils));
var browser = {};

// import /Users/anvaka/Documents/projects/impyjs/src/browser/path.js
(function (browser) {
/*jslint regexp: true sloppy: true white: true plusplus: true*/

var re_porotocol_domain_path_args = /(.*?\/\/[^\/]+)?(\/?[^#?]*)?([#?].+)?/,
    split = function (address) {
        var match = address.match(re_porotocol_domain_path_args);
        if (match) {
            return {
                domain: match[1] || '',
                path: match[2] || '',
                args: match[3] || ''
            };
        }
        return {
            domain: '',
            path: '',
            args: ''
        };
    };

var path = {
    /**
     * Based on a given web resource address returns a 'directory' name
     * where resource is located.
     */
    dirname : function (path) {
        if (!path) {
            return '';
        }
        var parts = split(path),
            lastSlash;
        path = parts.path;
        lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
            path = path.substr(0, lastSlash);
        }
        if (lastSlash === 0) {
            path = '';
        }
        return parts.domain + path + '/';
    },
    /**
     * Resolves to to an absolute path with a from as a current dir.
     */
    resolve : function (from, to) {
        if (!to) {
            return from;
        }
        if (to.indexOf('//') !== -1) {
            return to; // assume it's a uri.
        }

        var parts = to.split('/'),
            base = split(from),
            basePathRaw = base.path.split('/'),
            basePath = [],
            i, n, part;
        for (i = 0, n = basePathRaw.length; i < n; ++i) {
            if (basePathRaw[i]) {
                basePath.push(basePathRaw[i]);
            }
        }
        if (to[0] === '/') {
            return this.root + to;
        }
        for(i = 0, n = parts.length; i < n; ++i) {
            part = parts[i];
            if (part === '..') {
                if (basePath.length > 0) {
                    basePath.pop();
                } else {
                    throw 'Error while resolving ' + from + '+' + to + ': Relative path is out of the site root folder';
                }
            } else if (part !== '.') {
                basePath.push(part);
            }
        }
        
        return base.domain + '/' + basePath.join('/');
    },

    /**
     * Returns the last portion of a path.
     */
    basename: function (address) {
        var path = split(address).path;
        return path.substr(path.lastIndexOf('/') + 1);
    },

    root : ''
};
browser.path = path; // export path
}(browser));
// import /Users/anvaka/Documents/projects/impyjs/src/utils/namespace.js
(function (utils) {


var registeredNamespaces = {};

function isNamespaceRegistered(namespace) {
    if (namespace) {
        return registeredNamespaces.hasOwnProperty(namespace);
    }
    return true; // global namespace
}

function registerNamespace(namespace) {
    registeredNamespaces[namespace] = true;
}
utils.isNamespaceRegistered = isNamespaceRegistered; // export isNamespaceRegistered
utils.registerNamespace = registerNamespace; // export registerNamespace
}(utils));
var model = {};

// import /Users/anvaka/Documents/projects/impyjs/src/model/importDef.js
(function (model) {


/* Represents an import statment */
function ImportDef(importDeclaration) {
    this.importDeclaration = importDeclaration;

    var assignedLoader,
        rePath = /['"](.+)['"]/,
        pathMatch = importDeclaration.match(rePath),
        resourceLocation;

    if (pathMatch) {
        this.importPath = pathMatch[1];
    } else {
        throw 'Could not parse module declaration: ' + importDeclaration;
    }

    this.assignLoader = function (loader) {
        assignedLoader = loader;
    };
    this.getLoader = function () {
        return assignedLoader;
    };
}
model.ImportDef = ImportDef; // export ImportDef
}(model));
// import /Users/anvaka/Documents/projects/impyjs/src/model/exportDef.js
(function (model) {


function ExportDef(exportDeclaration) {
    // todo: validate
    this.exportDeclaration = exportDeclaration;
}
model.ExportDef = ExportDef; // export ExportDef
}(model));
// import /Users/anvaka/Documents/projects/impyjs/src/model/moduleDef.js
(function (model) {


function ModuleDef() {
    this.code = '';
    this.imports = [];
    this.exports = [];

    var self = this;
    this.resolveImports = function (callback) {
        var imports = self.imports,
            importsToResolve = imports.length,
            loader, i,
            loaderReady = function () {
                importsToResolve -= 1;
                if (importsToResolve === 0) {
                    callback();
                }
            };
        for (i = 0; i < imports.length; ++i) {
            loader = imports[i].getLoader();
            loader.load(loaderReady);
        }
        if (imports.length === 0) {
            callback(); // nothing to load here.
        }
    }
    this.addImportDef = function (importDef) {
        // TODO: Duplicates?
        this.imports.push(new model.ImportDef(importDef));
    }
    this.addExportDef = function (exportDef) {
        // TODO: Duplicates?
        this.exports.push(new model.ExportDef(exportDef));
    }
    this.setNamespace = function (namespaceDecl) {
        // todo: validate, throw error if already defined, reserved words.
        this.namepsace = namespaceDecl;
    }
    this.getNamespace = function () { 
        return this.namepsace || ''; // TODO: global?
    }
}
model.ModuleDef = ModuleDef; // export ModuleDef
}(model));
var loaders = {};

// import /Users/anvaka/Documents/projects/impyjs/src/loaders/defaultLoader.js
(function (loaders) {


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
loaders.DefaultLoader = DefaultLoader; // export DefaultLoader
}(loaders));
// import /Users/anvaka/Documents/projects/impyjs/src/utils/resolver.js
(function (utils) {


var resolvedLoaders = {};
function resolveLoader(currentDir, importPath, env) {
    // split('!') and get prefix. Calculate absolute path.
    // note: should get loader by loaders map, key is path.
    var resourceLocation = env.path.resolve(currentDir, importPath);
    if (!resolvedLoaders.hasOwnProperty(resourceLocation)) {
        resolvedLoaders[resourceLocation] = new loaders.DefaultLoader(resourceLocation, env, resolveLoader);
    }
    return resolvedLoaders[resourceLocation];
}
utils.resolveLoader = resolveLoader; // export resolveLoader
}(utils));
var node = {};

// import /Users/anvaka/Documents/projects/impyjs/src/node/app.js
(function (node) {


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
node.prepareExports = prepareExports; // export prepareExports
}(node));
// import /Users/anvaka/Documents/projects/impyjs/src/browser/app.js
(function (browser) {


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
    env.global = 'window';

    return {
        load : function (file, loadedCallback) {
            var loader = utils.resolveLoader(env.path.dirname(document.URL), file, env);
            loader.load(function() {
                var topModule = loader.getDefinition();
                utils.printCode(env, topModule.namespace);
                if (typeof loadedCallback === 'function') { loadedCallback(topModule); }
            });
        }
    };
}
browser.prepareExports = prepareExports; // export prepareExports
}(browser));
// import /Users/anvaka/Documents/projects/impyjs/src/main.js
(function () {


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
}());

}).call(this, (typeof module !== "undefined" && module.exports) || window);
