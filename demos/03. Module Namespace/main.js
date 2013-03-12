/* import 'timeManager.js'; */

// see, no namespaces. TimeManager is global within library:
var manager = new TimeManager();
console.log("Current time is: " + manager.getLocal());