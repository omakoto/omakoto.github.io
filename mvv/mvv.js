// 2D game with canvas example: https://github.com/end3r/Gamedev-Canvas-workshop/blob/gh-pages/lesson10.html
// Get screen size: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
// and window.screen.{width,height{

var tick = 0;
var notes = [];
for (var i = 0; i <= 127; i++) {
    notes[i] = [false, 0, 0]; // note on/off, velocity, tick
}

var canvas = document.getElementById("main");
var ctx = canvas.getContext("2d");

var scale = window.devicePixelRatio;
var W = Math.floor(screen.width * scale);
var H = Math.floor(screen.width * scale);
canvas.width = W;
canvas.height = H;

console.log(canvas);
console.log(ctx);


function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    var inputs = midiAccess.inputs;

    for (var input of inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function onMIDIFailure() {
    alert('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    console.log(midiMessage);
// Key on
// <Event(32771-MidiIn {'status': 144, 'data1': 48, 'data2': 80, 'data3': 0, 'timestamp': 1111, 'vice_id': 3}) >
// Key-off
// <Event(32771-MidiIn {'status': 128, 'data1': 48, 'data2': 0, 'data3': 0, 'timestamp': 1364, 'vice_id': 3}) >
    var d = midiMessage.data;
    if (d[0] == 144) {
        notes[d[1]][0] = true;
        notes[d[1]][1] = d[2];
        notes[d[1]][3] = tick;
    } else if (d[0] == 128) {
        notes[d[1]][0] = false;
        notes[d[1]][3] = tick;
    }
}

function draw() {
    tick++;

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = 'rgb(255, 255, 255)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, tick);
    ctx.lineTo(W - 10, tick);
    ctx.closePath();
    ctx.stroke();

    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
