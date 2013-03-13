/* namespace model */

/* import 'importDef.js' */
/* import 'exportDef.js' */

/* export */
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
    };
    this.addImportDef = function (importDef) {
        // TODO: Duplicates?
        this.imports.push(new model.ImportDef(importDef));
    };
    this.addExportDef = function (exportDef) {
        // TODO: Duplicates?
        this.exports.push(new model.ExportDef(exportDef));
    };
    this.setNamespace = function (namespaceDecl) {
        // todo: validate, throw error if already defined, reserved words.
        this.namepsace = namespaceDecl;
    };
    this.getNamespace = function () {
        return this.namepsace || ''; // TODO: global?
    };
    this.hasModuleGlobalExports = function () {
        return this.exports.length && !this.namepsace;
    };
    this.setPackage = function(packageDecl) {
        this.packageName = packageDecl.replace(/\s/g, '');
    };
}