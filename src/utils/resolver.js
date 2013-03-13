/* import '../loaders/defaultLoader.js' */

/* namespace utils */
<<<<<<< HEAD

var resolvedLoaders = {};
=======
// TODO: this shouldn't be global!
var resolvedLoaders = {};

/* export */
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
function resolveLoader(currentDir, importPath, env) {
    // split('!') and get prefix. Calculate absolute path.
    // note: should get loader by loaders map, key is path.
    var resourceLocation = env.path.resolve(currentDir, importPath);
    if (!resolvedLoaders.hasOwnProperty(resourceLocation)) {
        resolvedLoaders[resourceLocation] = new loaders.DefaultLoader(resourceLocation, env, resolveLoader);
    }
    return resolvedLoaders[resourceLocation];
<<<<<<< HEAD
}

/* export resolveLoader */
=======
}
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
