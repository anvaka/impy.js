/* namespace model */

/* export */
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