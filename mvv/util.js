const DEBUG = parseInt((new URLSearchParams(window.location.search)).get("debug")) ? true : false;

if (!DEBUG) {
    console.log("Debug log is disabled. Use ?debug=1 to enable debug log.");
}

function debug(...args) {
    if (!DEBUG) return;
    console.log(...args);
}

const elStatus = $("#status");

function info(...args) {
    console.log(...args);
    let message = args.join(" ");


    elStatus.text(message);
    elStatus.show();
    elStatus.delay(3000).fadeOut(1000);

}

function w(value, callback) {
    callback(value);
}
