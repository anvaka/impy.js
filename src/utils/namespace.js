/* namespace utils */

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

/* export isNamespaceRegistered */
/* export registerNamespace */