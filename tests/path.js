/*globals impyjs, test, ok, equal, throws */
/*globals browser */
/*jslint sloppy: true */
impyjs.load('../src/browser/path.js', function (module) {
    var path = browser.path;

    test("Path interface is defined", function () {
        ok(!!path, "Path is defined");
        equal(typeof path.dirname, 'function', "dirname() is defined");
        equal(typeof path.resolve, 'function', "resolve() is defined");
        equal(typeof path.basename, 'function', "basename() is defined");
    });

    test('dirname() operations', function () {
        equal(path.dirname('http://www.site.com'), 'http://www.site.com/', "Top domain dirname");
        equal(path.dirname('https://www.site.com'), 'https://www.site.com/', "Top domain secure dirname");
        equal(path.dirname('ftp://www.site.com'), 'ftp://www.site.com/', "Top domain ftp dirname");
        equal(path.dirname('//www.site.com'), '//www.site.com/', "Top domain default protocol dirname");
        equal(path.dirname('www.site.com'), 'www.site.com/', "Top domain no protocol dirname");
        equal(path.dirname('http://www.site.com:8000'), 'http://www.site.com:8000/', "Top domain custom port dirname");

        equal(path.dirname('www.site.com/foo'), 'www.site.com/', "Domain with one subdir");
        equal(path.dirname('www.site.com/foo.html'), 'www.site.com/', "Domain with one subdir and extension");
        equal(path.dirname('www.site.com/foo.html?q=hello'), 'www.site.com/', "Domain with one subdir and extension and arguments");
        equal(path.dirname('www.site.com/foo.html?q=hello/bar'), 'www.site.com/', "Domain with one subdir and extension and arguments");
        equal(path.dirname('www.site.com/foo.html#q=hello/bar'), 'www.site.com/', "Domain with one subdir and extension and anchor");
        equal(path.dirname('goo.gl/com/foo.html'), 'goo.gl/com/', "Domain with one subdir and extension and anchor");

        equal(path.dirname('/'), '/', "Empty path");
        equal(path.dirname('foo/'), 'foo/', "Direcotry as a source");
        equal(path.dirname('http://www.site.com/something/'), 'http://www.site.com/something/', "Directory is returned");
    });

    test('resolve() operations', function () {
        equal(path.resolve('http://www.site.com/', 'file.js'), 'http://www.site.com/file.js', 'Simple file');
        equal(path.resolve('http://www.site.com/bar/', 'file.js'), 'http://www.site.com/bar/file.js', 'Simple nested file');
        equal(path.resolve('http://www.site.com/bar/', '../file.js'), 'http://www.site.com/file.js', 'Parent folder');
        equal(path.resolve('http://www.site.com/bar/', '../foo/file.js'), 'http://www.site.com/foo/file.js', 'Parent folder with a subfodler');
        equal(path.resolve('http://www.site.com/bar/', '../foo/.././file.js'), 'http://www.site.com/file.js', 'Lots of ups and downs');
        equal(path.resolve('http://www.site.com/bar/', '.file.js'), 'http://www.site.com/bar/.file.js', 'Hidden file');

        equal(path.resolve('http://www.site.com/bar/', '/file.js'), '/file.js', 'Absolute path');
        equal(path.resolve('http://www.site.com/bar/', '/bar/file.js'), '/bar/file.js', 'Absolute path with subdir');

        equal(path.resolve('bar/foo/', 'file.js'), '/bar/foo/file.js', 'Base dir is not a site');
        equal(path.resolve('/bar/foo/', 'file.js'), '/bar/foo/file.js', 'Base dir is not a site and is absolute');
        equal(path.resolve('/bar/foo/', '../file.js'), '/bar/file.js', 'Base dir is not a site and is absolute and parent folder');
        equal(path.resolve('/bar/foo/', './file.js'), '/bar/foo/file.js', 'Base dir is not a site and is absolute and current folder');
        equal(path.resolve('/bar/foo/', 'bar/foo/file.js'), '/bar/foo/bar/foo/file.js', 'Base dir is not a site and is absolute and nested resolve');
        equal(path.resolve('/bar/', 'bar/../file.js'), '/bar/file.js', 'Base dir is not a site and is absolute and nested resolve');

        equal(path.resolve('/bar/', ''), '/bar/', 'Base dir and no file');
        equal(path.resolve('/bar/'), '/bar/', 'Base dir and undefined file');
        
        equal(path.resolve('/bar/', 'http://site.com/file.js'), 'http://site.com/file.js', 'Absolute file address');
    });

    test('resolve() misuse', function () {
        throws(function () { path.resolve('http://www.site.com/', '../file.js'); }, 'Resolve out of site root folder');
        throws(function () { path.resolve('/', '../file.js'); }, 'Resolve out of site root folder');
    });

    test('basename() operations', function () {
        equal(path.basename('http://www.site.com/file.js'), 'file.js', 'Simple file');
        equal(path.basename('file.js'), 'file.js', 'Simple file no dir');
        equal(path.basename('bar/foo/file.js'), 'file.js', 'Base dir is not a site');
    });
});
