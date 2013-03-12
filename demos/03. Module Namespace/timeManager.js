/* export */
function TimeManager() {
}


TimeManager.prototype.getLocal = function () {
    return (new Date()).toLocaleTimeString();
};