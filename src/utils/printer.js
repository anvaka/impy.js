/* namespace utils */

function printCode(env, topNamespace) {
    if (env.onlyPrint) {
        // wrap top module into its own block to export module's public api:
        env.executedCode.unshift('','(function (global) {');
        env.executedCode.push('', '}).call(this, (typeof module !== "undefined" && module.exports) || window);');

        console.log(env.executedCode.join('\n'));
    }
}

/* export printCode */