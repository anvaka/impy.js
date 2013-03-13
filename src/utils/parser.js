/* namespace utils */
/* import '../model/moduleDef.js' */

function getNextDeclaration(jsFile, startFrom) {
    // this is dumb, but hey, I don't want to create
    // AST parser here. Who knows, maybe I'll change current approach
    // to implicit exports :). Don't want to waste too much time now,
    // but this could definitely be done better:
    var remaining = jsFile.substring(startFrom),
        declaration = remaining.match(/(?:\svar ([^=,;{}\s]+)|function ([^(\s]+)\s*?\()/);

    if (declaration) {
        return declaration[1] || declaration[2]; // either var or function.
    }
}

function getDiagnosticMissingExport(jsFile, exportDecl, startFrom) {
    return [ "Could not find explicit declaration at " + startFrom,
            "Context: ",
            jsFile.substring(startFrom, 100)].join('\n');
}

/* export parseModule */
function parseModule(jsFile) {
    var moduleDef = new model.ModuleDef(),
        declarationType,
        importDefinition,
        re = /\/\*\s*(import|public export|export|namespace|package)\b(.*);?\s*?\*\//g;

    moduleDef.code = jsFile.replace(re, function (match, declarationType, declaration, pos) {
        declaration = declaration.replace(/\s/g, '');
        if (declarationType === 'import') {
            moduleDef.addImportDef(declaration);
        } else if (declarationType === 'export') {
            if (declaration === '') {
                // implicit declaration, read file to find bound variable:
                declaration = getNextDeclaration(jsFile, pos + match.length);
            }
            if (!declaration) {
                var err = new Error();
                err.message = getDiagnosticMissingExport(jsFile, match, pos);
                throw err;
            }
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

    return moduleDef;
}