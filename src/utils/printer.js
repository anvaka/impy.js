/* namespace utils */

function printCode(env, topNamespace) {
    if (env.onlyPrint) {
        // wrap top module into its own block:
        env.executedCode.unshift('');
        env.executedCode.unshift('(function (global) {');
        env.executedCode.push('})(this);')

        console.log(env.executedCode.join('\n'));
    }
}

/* export printCode */