/* namespace utils */
/* import '../model/moduleDef.js' */

/* export parseModule */
function parseModule(jsFile) {
    var moduleDef = new model.ModuleDef(),
        declarationType,
        importDefinition,
        re = /\/\*\s*(import|public export|export|namespace|package)\s+(.+?);?\s*?\*\//g;

    //while(match = re.exec(jsFile)) {
    moduleDef.code = jsFile.replace(re, function (match, declarationType, declaration, pos) {
        if (declarationType === 'import') {
            moduleDef.addImportDef(declaration);
        } else if (declarationType === 'export') {
            moduleDef.addExportDef(declaration);
        } else if (declarationType === 'namespace') {
            moduleDef.setNamespace(declaration);
        } else if (declarationType === 'package') {
            moduleDef.setPackage(declaration);
        } else if (declarationType === 'public export') {
            // this shouldn't be here, but in the codegen.js
            var code = declaration.split('.');
            return 'exports.' + code[code.length - 1] + ' = ' + declaration + ';';
        }
        return '';
    });

    // moduleDef.code = jsFile;
    return moduleDef;
}