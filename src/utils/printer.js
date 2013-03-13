/* namespace utils */
if (typeof window === 'undefined') {
    var btoa = function (str) {
        return new Buffer(str, 'binary').toString('base64');
    };
} else {
    var btoa = window.btoa;
}

/* export */
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
            return (0, eval)(code);
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
}