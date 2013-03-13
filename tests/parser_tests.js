/*globals impyjs, test, ok, equal, throws */
/*globals browser */

impyjs.load('../src/utils/parser.js',
    function (_, api) {
        var parser = api.utils.parseModule;

        test('Empty file', function () {
            var moduleDef = parser('');

            equal(moduleDef.exports.length, 0, "No exports");
            equal(moduleDef.imports.length, 0, "No imports");
        });
        test('Finds explicit exports/imports', function () {
            var code = [
                        '/* export foo */',
                        '/* export bar */',
                        '/* import "file.js" */',
                        'console.log("hello world");'
                    ].join('\n'),
                moduleDef = parser(code);

            equal(moduleDef.exports.length, 2, "Found two modules");
            equal(moduleDef.exports[0].exportDeclaration, 'foo', "Found foo");
            equal(moduleDef.exports[1].exportDeclaration, 'bar', "Found bar");

            equal(moduleDef.imports.length, 1, "Found import");
            equal(moduleDef.imports[0].importPath, 'file.js', "Import path is correct");
        });
        test('Finds implicit exports', function () {
            var code = [
                        '/* export */',
                        'function foo() { console.log("Hell world"); }'
                    ].join('\n'),
                moduleDef = parser(code);

            equal(moduleDef.exports.length, 1, "Found impolicit export");
            equal(moduleDef.exports[0].exportDeclaration, 'foo', "Found foo");

            code = '/* export */ function foo(){ }; function bar() {}';
            moduleDef = parser(code);
            equal(moduleDef.exports.length, 1, "Only one implicit export should be here");
            equal(moduleDef.exports[0].exportDeclaration, 'foo', "The nearest function is exported");

            code = [
                    '/* export */',
                    'var foo = function () {}',
                    '/* export */',
                    'function MyClass(){}'
                ].join('\n');

            moduleDef = parser(code);
            equal(moduleDef.exports[0].exportDeclaration, 'foo', "The nearest variable is exported");
            equal(moduleDef.exports[1].exportDeclaration, 'MyClass', "The next export is found");

            code = '/*export*/function foo(){}';
            moduleDef = parser(code);
            equal(moduleDef.exports.length, 1, 'Can parse "dense" export declarations');
        });
    }
);