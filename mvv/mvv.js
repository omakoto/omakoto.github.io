// 2D game with canvas example: https://github.com/end3r/Gamedev-Canvas-workshop/blob/gh-pages/lesson10.html
// Get screen size: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
// and window.screen.{width,height{

function int(v) {
    return Math.floor(v);
}

var NOTES_COUNT = 128

var HORIZONTAL_MARGIN = 0.01  // Margin at each side
var VERTICAL_MARGIN = 0.01  // Margin at top and bottom
var SPACING = 0.01 // Space between each bar

var LINE_WIDTH = 4

var MID_LINE_COLOR = [200, 200, 255]
var BASE_LINE_COLOR = [200, 255, 200]

var BAR_RATIO = 0.3

var ROLL_SCROLL_TICKS = 1
var ROLL_SCROLL_AMOUNT = 4

var scale = window.devicePixelRatio;
var W = Math.floor(screen.width * scale);
var H = Math.floor(screen.height * scale);

// TODO: Do the margin in CSS
var HM = int(W * HORIZONTAL_MARGIN); // h-margin
var VM = int(H * VERTICAL_MARGIN); // v-margin

var BAR_H = int(H * BAR_RATIO);
var ROLL_H = H - BAR_H;


// Available width / height, for the bar
var AW = W - HM * 2;
var AH = BAR_H - VM;

var MIN_NOTE = 21;
var MAX_NOTE = 108;

var ROLL_SPEED = 2 * int(scale);

// Initialize notes
var tick = 0;
var notes = [];
for (var i = 0; i < NOTES_COUNT; i++) {
    notes[i] = [false, 0, 0]; // note on/off, velocity, tick
}

var onNoteCount = 0;

// Initialize the canvases
var canvasBar = document.getElementById("bar");
var cbar = canvasBar.getContext("2d");

var canvasRoll = document.getElementById("roll");
var croll = canvasRoll.getContext("2d");

canvasBar.width = W;
canvasBar.height = int(H * BAR_RATIO);

canvasRoll.width = W;
canvasRoll.height = H - int(H * BAR_RATIO);

croll.fillStyle = 'rgb(0, 0, 0)';
croll.fillRect(0, 0, canvasRoll.width, canvasRoll.height);


var MIDI_OUT = null;

function setCanvasSize() {
    // TODO: Figure out how to do it in CSS
    console.log("Resized");
    canvasBar.style.width = window.innerWidth + "px";
    canvasBar.style.height = int(window.innerHeight * BAR_RATIO) + "px";

    canvasRoll.style.width = window.innerWidth + "px";
    canvasRoll.style.height = (window.innerHeight - canvasBar.style.height) + "px";
}

function onMIDISuccess(midiAccess) {
    console.log(midiAccess);

    for (var input of midiAccess.inputs.values()) {
        console.log(input);
        input.onmidimessage = getMIDIMessage;
    }
    for (var output of midiAccess.outputs.values()) {
        console.log(output);
        if (!MIDI_OUT && !/through/i.test(output.name)) {
            MIDI_OUT = output;
        }
    }
    console.log("Output device selected:", MIDI_OUT);
}

function onMIDIFailure() {
    alert('Could not access your MIDI devices.');
}

function getMIDIMessage(midiMessage) {
    // console.log(midiMessage);
// Key on
// <Event(32771-MidiIn {'status': 144, 'data1': 48, 'data2': 80, 'data3': 0, 'timestamp': 1111, 'vice_id': 3}) >
// Key-off
// <Event(32771-MidiIn {'status': 128, 'data1': 48, 'data2': 0, 'data3': 0, 'timestamp': 1364, 'vice_id': 3}) >
    var d = midiMessage.data;
    if (d[0] == 144) {
        onNoteCount++;
        notes[d[1]][0] = true;
        notes[d[1]][1] = d[2];
        notes[d[1]][3] = tick;
    } else if (d[0] == 128) {
        notes[d[1]][0] = false;
        notes[d[1]][3] = tick;
    }
}

function hsvToRgb(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255)
    ];
}

function getColor(note) {
    var MAX_H = 0.4
    var h = MAX_H - (MAX_H * note[1] / 127)
    var s = 0.9
    var l = 0
    if (note[0]) l = 1;
    if (l <= 0) {
        return null;
    }
    return hsvToRgb(h, s, l)
}

function getOnColor(count) {
    var h = Math.max(0, 0.2 - count * 0.03)
    var s = Math.min(1, 0.3 + 0.2 * count)
    var l = Math.min(1, 0.4 + 0.2 * count)
    return hsvToRgb(h, s, l)
}

function toColorStr(rgb) {
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}

function line(ctx, left, top, width, height) {
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left + width, top + height);
    ctx.closePath();
    ctx.stroke();
}


var start = Date.now();

function draw() {
    tick++;
    // if (tick % 60 == 0) {
    //     var now = Date.now();
    //     console.log(((now - start) / tick) + " ms");
    // }

    cbar.fillStyle = 'black';
    cbar.fillRect(0, 0, W, H);

    // bar width
    var bw = AW / (MAX_NOTE - MIN_NOTE + 1) - SPACING

    croll.drawImage(canvasRoll, 0, ROLL_SPEED);
    croll.fillStyle = 'black';
    croll.fillRect(0, 0, AW, ROLL_SPEED);

    if (onNoteCount > 0) {
        croll.fillStyle = toColorStr(getOnColor(onNoteCount));
        croll.fillRect(0, ROLL_SCROLL_AMOUNT - 2, AW, 2);
        // croll(self.roll, self._get_on_color(self.on), (0, ROLL_SCROLL_AMOUNT - 1, aw, 1))
    }

    for (var i = MIN_NOTE; i <= MAX_NOTE; i++) {
        var note = notes[i]
        var color = getColor(note)
        if (color === null) continue

        // bar left
        var bl = HM + AW * (i - MIN_NOTE) / (MAX_NOTE - MIN_NOTE + 1)

        // bar height
        var bh = AH * note[1] / 127

        cbar.fillStyle = toColorStr(color);
        cbar.fillRect(bl, VM + AH - bh, bw, bh);
        // todo: draw roll bar
        // pg.draw.rect(self.roll, color, (bl, 0, bw, ROLL_SCROLL_AMOUNT))
        croll.fillStyle = cbar.fillStyle;
        croll.fillRect(bl, 0, bw, ROLL_SPEED);
    }

    cbar.fillStyle = toColorStr(MID_LINE_COLOR);
    cbar.fillRect(HM, VM + AH * 0.25, AW, LINE_WIDTH)
    cbar.fillRect(HM, VM + AH * 0.5, AW, LINE_WIDTH)

    cbar.fillStyle = toColorStr(BASE_LINE_COLOR);
    cbar.fillRect(HM, VM + AH - LINE_WIDTH, AW, LINE_WIDTH)



    // ctx.strokeStyle = 'rgb(255, 255, 255)';
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.moveTo(10, tick);
    // ctx.lineTo(W - 10, tick);
    // ctx.closePath();
    // ctx.stroke();

    onNoteCount = 0;
    requestAnimationFrame(draw)
}

setCanvasSize();
$(window).resize(setCanvasSize);

requestAnimationFrame(draw)

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);

