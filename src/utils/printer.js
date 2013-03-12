/* namespace utils */
if (typeof window === 'undefined') {
    var btoa = function (str) {
        return new Buffer(str, 'binary').toString('base64');
    };
} else {
    var btoa = window.btoa;
}
function printCode(env) {
    var code = env.codeGenerator.getCode();

    if (env.onlyPrint) {
        console.log(code);
    } else {
        /*jslint evil: true */
        try {
            (function codeRunner(){ (0, eval)(code); }());
        } catch(e) {
            // todo: should resolve to original source code
            var errorName = ('name' in e ? e.name : 'Error'),
                debugMessage = errorName + ' occured in "' + fileName + '"';
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

/* export printCode */