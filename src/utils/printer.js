/* namespace utils */
if (typeof window === 'undefined') {
    var btoa = function (str) {
        return new Buffer(str, 'binary').toString('base64');
    };
} else {
    var btoa = window.btoa;
}
<<<<<<< HEAD
=======

/* export */
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
function printCode(env) {
    var code = env.codeGenerator.getCode();
    if (env.printSourceMap || !env.onlyPrint) {
        // always print the source map when running app
        // otherwise it's configurable by client
        code += ['',
            '//@ sourceURL=' + env.codeGenerator.getFileName(),
            '//@ sourceMappingURL=data:text/javascript;base64,' + btoa(env.codeGenerator.getSourceMap())
            ].join('\n');
    }
    if (env.onlyPrint) {
        console.log(code);
    } else {
        /*jslint evil: true */
        try {
<<<<<<< HEAD
            (function codeRunner() { (0, eval)(code); }());
=======
            return (0, eval)(code);
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
        } catch(e) {
            // todo: should resolve to original source code
            var errorName = ('name' in e ? e.name : 'Error'),
                debugMessage = errorName + ' occured';
            if ('lineNumber' in e) {
                debugMessage += ':' + e.lineNumber;
            }
            if ('message' in e) {
                debugMessage += ': ' + e.message;
            }
            console.error(debugMessage);
            throw e;
        }        
    }
<<<<<<< HEAD
}

/* export printCode */
=======
}
>>>>>>> 6eee4886a37c1bbda9bd546e74be413e7aa3bcf7
