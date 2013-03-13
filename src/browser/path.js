/*jslint regexp: true sloppy: true white: true plusplus: true*/
/* namespace browser */

var re_porotocol_domain_path_args = /(.*?\/\/[^\/]+)?(\/?[^#?]*)?([#?].+)?/,
    split = function (address) {
        var match = address.match(re_porotocol_domain_path_args);
        if (match) {
            return {
                domain: match[1] || '',
                path: match[2] || '',
                args: match[3] || ''
            };
        }
        return {
            domain: '',
            path: '',
            args: ''
        };
    };

<<<<<<< HEAD
=======
/* export */
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
var path = {
    /**
     * Based on a given web resource address returns a 'directory' name
     * where resource is located.
     */
    dirname : function (path) {
        if (!path) {
            return '';
        }
        var parts = split(path),
            lastSlash;
        path = parts.path;
        lastSlash = path.lastIndexOf('/');
        if (lastSlash > 0) {
            path = path.substr(0, lastSlash);
        }
        if (lastSlash === 0) {
            path = '';
        }
        return parts.domain + path + '/';
    },
    /**
     * Resolves to to an absolute path with a from as a current dir.
     */
    resolve : function (from, to) {
        if (!to) {
            return from;
        }
        if (to.indexOf('//') !== -1) {
            return to; // assume it's a uri.
        }

        var parts = to.split('/'),
            base = split(from),
            basePathRaw = base.path.split('/'),
            basePath = [],
            i, n, part;
        for (i = 0, n = basePathRaw.length; i < n; ++i) {
            if (basePathRaw[i]) {
                basePath.push(basePathRaw[i]);
            }
        }
        if (to[0] === '/') {
            return this.root + to;
        }
        for(i = 0, n = parts.length; i < n; ++i) {
            part = parts[i];
            if (part === '..') {
                if (basePath.length > 0) {
                    basePath.pop();
                } else {
                    throw 'Error while resolving ' + from + '+' + to + ': Relative path is out of the site root folder';
                }
            } else if (part !== '.') {
                basePath.push(part);
            }
        }
        
        return base.domain + '/' + basePath.join('/');
    },

    /**
     * Returns the last portion of a path.
     */
    basename: function (address) {
        var path = split(address).path;
        return path.substr(path.lastIndexOf('/') + 1);
    },

    root : ''
<<<<<<< HEAD
};

/* export path */
=======
};
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
