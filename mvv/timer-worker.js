console.log("Worker loaded");

onmessage = (e) => {
    console.log("Worker.onmessage", e);
    const data = e.data;
    if (data.action == "setInterval") {
        console.log("Setting timer with interval: " + data.interval + " ms, result:", data.result);

        // TODO: Use setTimeout
        setInterval(() => {
            postMessage(data.result);
        }, data.interval);
    }
};
