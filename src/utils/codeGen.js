/*global sourcemap */
/* import '../../libs/sourcemap.js' */
/* namespace utils */

function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

/* export */
function CodeGenerator(env) {
    this.env = env;
    this.code = [];
    this.generatedOffset = 1;
    this.fileName = 'bundle.js';
    this.sourceMap = new sourcemap.SourceMapGenerator({file: this.fileName, sourceRoot: ''});
    this.addServiceCode([
        "(function (root, factory) {",
        "    'use strict';",
        "",
        "    // Universal Module Definition (UMD) to support AMD, CommonJS/Node.js,",
        "    // Rhino, and plain browser loading.",
        "    if (typeof define === 'function' && define.amd) {",
        "        define(['exports'], factory);",
        "    } else if (typeof exports !== 'undefined') {",
        "        factory(exports);",
        "    } else {",
        "        return factory({});",
        "    }",
        "}(this, function (exports) {"]);

    this.registeredNamespaces = {};
    this.moduleGlobals = {};
}

CodeGenerator.prototype.setPackageName = function (packageName) {
    if (packageName) {
        // <ugly>replace in UMD header the package name export for the browser 
        // environments </ugly>
        this.code[10] = '        return factory((root.' + packageName + ' = {}));';
        this.fileName = packageName + '.js';
        this.sourceMap._fileName = this.fileName;
    }
};

CodeGenerator.prototype.getFileName = function () {
    return this.fileName;
};
CodeGenerator.prototype.getCode = function () {
    var exposedNamespaces = '';
    if (this.env.exposeNamespace) {
        exposedNamespaces = '\nreturn ' + this.getExposedNamespaces() + ';\n';
    }
    return this.code.join('\n') + exposedNamespaces + '}));'; // end of UMD
};

CodeGenerator.prototype.getSourceMap = function () {
    return this.sourceMap.toString();
};

CodeGenerator.prototype.getExposedNamespaces = function () {
    var exposedCode = [],
        key;
    for (key in this.registeredNamespaces) {
        if (this.registeredNamespaces.hasOwnProperty(key)) {
            // todo: dots?
            exposedCode.push(key + ': ' + key);
        }
    }
    for (key in this.moduleGlobals) {
        if (this.moduleGlobals.hasOwnProperty(key)) {
            exposedCode.push(key + ': ' + key);
        }
    }
    if (exposedCode.length) {
        return '{' + exposedCode.join(',') + '}';
    }
    return '';
};

CodeGenerator.prototype.addFile = function generateCode(moduleDef, fileName) {
    var env = this.env,
        exports = moduleDef.exports,
        expressionName = '',
        i,
        namespace = moduleDef.getNamespace();

    if (!this.isNamespaceRegistered(namespace)) {
        this.registerNamespace(namespace);
        // should go in module global scope. TODO: Dots should be resolved.
        this.addServiceCode('var ' + namespace + ' = {};');
        this.addServiceCode('');
    }
    if (env.debugerName) {
        expressionName = env.path.basename(fileName).replace(/[\/\\\.]/, '_');
    }

    this.addServiceCode('// import ' + fileName);

    if (namespace) {
        this.printNamespacedCode(moduleDef, fileName, expressionName);
    } else {
        this.printModuleGlobalCode(moduleDef, fileName, expressionName);
    }
};

CodeGenerator.prototype.printModuleGlobalCode = function(moduleDef, fileName, expressionName) {
// to export into the module global scope we declare the same variables in the module
// scope when, using two IFFEs we set the variable values. This guaranties we
// are not polluting the module's scope.
    var exportedVariables = [], i,
        code = [],
        returnStatement = [],
        exports = moduleDef.exports;
    for (i = 0; i < exports.length; ++i) {
        exportedVariables.push(exports[i].exportDeclaration);
    }
    if (exportedVariables.length) {
        code.push('var ' + exportedVariables.join(', ') + ';');
        code.push('(function (__localScope__) {');
        for (i = 0; i < exportedVariables.length; ++i) {
            if (this.moduleGlobals.hasOwnProperty(exportedVariables[i])) {
                var err = new Error();
                err.message = 'Exported variable ' + exportedVariables[i] + ' was already declared in ' + this.moduleGlobals[exportedVariables[i]];
                throw err;
            } else {
                this.moduleGlobals[exportedVariables[i]] = fileName;
            }
            code.push('  ' + exportedVariables[i] + ' = ' + '__localScope__.' + exportedVariables[i] + ';');
        }
        code.push('}(function ' + expressionName + '() {');
    } else {
        code.push('(function ' + expressionName + '() {');
    }
    this.addServiceCode(code);

    this.addClientCode(moduleDef.code, fileName);
    this.addPublicExports(moduleDef, fileName);
    
    code.length = 0;
    if (exportedVariables.length) {
        code.push('return { ');
        for (i = 0; i < exportedVariables.length; ++i) {
            returnStatement.push(' ' + exportedVariables[i] + ' : ' + exportedVariables[i]);
        }
        code.push(returnStatement.join(','));
        code.push('};');
        code.push('}()));');
        this.addServiceCode(code);

    } else {
        this.addServiceCode('}());');
    }
};

CodeGenerator.prototype.printNamespacedCode = function(moduleDef, fileName, expressionName) {
    var namespace = moduleDef.getNamespace(),
        exports = moduleDef.exports, i;
    this.addServiceCode('(function ' + expressionName + '(' + namespace + ') {');

    this.addClientCode(moduleDef.code, fileName);
    this.addPublicExports(moduleDef, fileName);

    for (i = 0; i < exports.length; ++i) {
        var exportName = exports[i].exportDeclaration;
        this.addServiceCode(namespace + '.' + exportName + ' = ' +
                      exportName + '; // export ' + exportName);
    }

    this.addServiceCode('}(' + namespace + '));');
};

CodeGenerator.prototype.addPublicExports = function(moduleDef, fileName) {
    var publicExports = moduleDef.publicExports,
        i;
    for (i = 0; i < publicExports.length; ++i) {
        var declaration = publicExports[i].exportDeclaration;
        var code = declaration.split('.');    
        this.addServiceCode('exports.' + code[code.length - 1] + ' = ' + declaration + ';');
    }
};

CodeGenerator.prototype.addServiceCode = function (code) {
    if (isArray(code)) {
        for (var i = 0; i < code.length; ++i) {
            this.code.push(code[i]);
        }
        this.generatedOffset += code.length;
    } else {
        this.code.push(code);
        this.generatedOffset += 1;
    }
};

CodeGenerator.prototype.addClientCode = function (code, fileName) {
    var lines = code.split('\n');
    fileName = fileName.replace('/Users/anvaka/Documents/projects/impyjs', '');
    for (var i = 0; i < lines.length; ++i) {
        this.sourceMap.addMapping({
            generated: { line: this.generatedOffset, column: 0},
            original: { line: i + 1, column: 0},
            source: fileName
        });
        this.generatedOffset += 1;
        this.code.push(lines[i])
    }
};

CodeGenerator.prototype.isNamespaceRegistered = function (namespace) {
    if (namespace) {
        return this.registeredNamespaces.hasOwnProperty(namespace);
    }
    return true; // it's a module scope
};

CodeGenerator.prototype.registerNamespace = function (namespace) {
    this.registeredNamespaces[namespace] = true;
};
