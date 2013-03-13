/*global sourcemap */
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
    var namespaces = [],
        key;
    for (key in this.registeredNamespaces) {
        if (this.registeredNamespaces.hasOwnProperty(key)) {
            // todo: dots?
            namespaces.push(key + ': ' + key);
        }
    }
    if (namespaces.length) {
        return '{' + namespaces.join(',') + '}';
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
    this.addServiceCode('(function ' + expressionName + '(' + namespace + ') {');
    this.addClientCode(moduleDef.code, fileName);

    for (i = 0; i < exports.length; ++i) {
        var exportName = exports[i].exportDeclaration;
        if (namespace) {
            this.addServiceCode(namespace + '.' + exportName + ' = ' +
                      exportName + '; // export ' + exportName);
        } else {
            throw 'Module global exports are not implemented';
        }
    }

    this.addServiceCode('}(' + namespace + '));');
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
    return true;
};

CodeGenerator.prototype.registerNamespace = function (namespace) {
    this.registeredNamespaces[namespace] = true;
};
