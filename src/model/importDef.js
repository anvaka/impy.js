/* namespace model */

<<<<<<< HEAD
/* Represents an import statment */
function ImportDef(importDeclaration) {
    this.importDeclaration = importDeclaration;

=======
/* export */
/* Represents an import statment */
function ImportDef(importDeclaration) {
    this.importDeclaration = importDeclaration;
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
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
<<<<<<< HEAD
}

/* export ImportDef */
=======
}
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
