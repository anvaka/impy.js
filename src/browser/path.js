/* namespace browser */

var separator = '/';

 // Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
    return splitPathRe.exec(filename).slice(1);
};

var path = {
    dirname : function(path) {
        var result = splitPath(path),
            root = result[0],
            dir = result[1];

        if (!root && !dir) {
            // No dirname whatsoever
            return '.';
        }

        if (dir) {
            // It has a dirname, strip trailing slash
            dir = dir.substr(0, dir.length - 1);
        }

        return root + dir + '/';
    },
    resolve : function (from, to) {
        // todo; need to fix this.
        return from + to;
    }
};

/* export path */