/* export TimeManager */
function TimeManager() {
}


TimeManager.prototype.getLocal = function () {
    return (new Date()).toLocaleTimeString();
};