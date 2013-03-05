/*jslint sloppy: true*/
/* namespace utils */

var registeredNamespaces = {},
    moduleGlobalNamespaceName = '__moduleGlobals';

/* export isNamespaceRegistered */
function isNamespaceRegistered(namespace) {
    if (namespace) {
        return registeredNamespaces.hasOwnProperty(namespace);
    }
    return true; // global namespace
}

/* export registerNamespace */
function registerNamespace(namespace) {
    registeredNamespaces[namespace] = true;
}

/* export isModuleGlobalRegisterd */
function isModuleGlobalRegisterd() {
    return isNamespaceRegistered(moduleGlobalNamespaceName);
}

/* export prepareModuleGlobalNamespace */
function prepareModuleGlobalNamespace() {
    if (!isNamespaceRegistered(moduleGlobalNamespaceName)) {
        registerNamespace(moduleGlobalNamespaceName);
    }
    return moduleGlobalNamespaceName;
}