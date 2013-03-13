/* import '../loaders/defaultLoader.js' */

/* namespace utils */
// TODO: this shouldn't be global!
var resolvedLoaders = {};

/* export */
function resolveLoader(currentDir, importPath, env) {
    // split('!') and get prefix. Calculate absolute path.
    // note: should get loader by loaders map, key is path.
    var resourceLocation = env.path.resolve(currentDir, importPath);
    if (!resolvedLoaders.hasOwnProperty(resourceLocation)) {
        resolvedLoaders[resourceLocation] = new loaders.DefaultLoader(resourceLocation, env, resolveLoader);
    }
    return resolvedLoaders[resourceLocation];
}