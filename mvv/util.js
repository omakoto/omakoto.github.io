const DEBUG = parseInt((new URLSearchParams(window.location.search)).get("debug")) ? true : false;

if (!DEBUG) {
    console.log("Debug log is disabled. Use ?debug=1 to enable debug log.");
}

function debug(...args) {
    if (!DEBUG) return;
    console.log(...args);
}

function info(...args) {
    console.log(...args);
}

function w(value, callback) {
    callback(value);
}
