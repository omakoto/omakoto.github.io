// 2D game with canvas example: https://github.com/end3r/Gamedev-Canvas-workshop/blob/gh-pages/lesson10.html
// Get screen size: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
// and window.screen.{width,height{

function int(v) {
    return Math.floor(v);
}

const DEBUG = true;
const SCALE = 1; // window.devicePixelRatio;
const NOTES_COUNT = 128;

const PEDAL_CONTROL = 20; // 64 ; is the real number, but to use V25's leftmost knob, which is 20.

function debug(...args) {
    if (!DEBUG) return;
    console.log(...args);
}

function info(...args) {
    console.log(...args);
}

class Renderer {
    constructor() {
    }
}

const renderer = new Renderer();

class MidiInputHandler {
    #notes;
    #pedal = 0;
    #onNoteCount = 0;

    constructor() {
        this.reset();
    }

    onMidiMessage(ev) {
        var d = ev.data;
        if (d[0] == 144) { // Note on
            this.#onNoteCount++;
            this.#notes[d[1]][0] = true;
            this.#notes[d[1]][1] = d[2];
            this.#notes[d[1]][3] = tick;
        } else if (d[0] == 128) { // Note off
            this.#notes[d[1]][0] = false;
            this.#notes[d[1]][3] = tick;
        } else if (d[0] == 176 && d[1] == PEDAL_CONTROL) { // Pedal
            this.#pedal = d[2];
        }
    }

    reset() {
        this.#notes = [];
        for (var i = 0; i < NOTES_COUNT; i++) {
            this.#notes[i] = [false, 0, 0]; // note on/off, velocity, tick
        }
        this.#pedal = 0;
        this.#onNoteCount = 0;
    }

    onDraw() {
        this.#onNoteCount = 0;
    }

    get onNoteCount() {
        return this.#onNoteCount;
    }

    get pedal() {
        return this.#pedal;
    }
}

const midiInputHandler = new MidiInputHandler();

class MidiOutputHandler {
    #device;
    constructor() {
    }

    setMidiOut(device) {
        console.log("MIDI output device set:", device);
        this.#device = device;
    }

    reset() {
        if (!this.#device) {
            return;
        }
        this.#device.clear();
        this.#device.send([176, 123, 0], 0); // All notes off
        this.#device.send([176, 121, 0], 0); // Reset all controllers
        this.#device.send([255], 0); // All reset
    }
}

const midiOutputHandler = new MidiOutputHandler();

class Recorder {
    constructor() {
    }
}

const recorder = new Recorder();

class Coordinator {
    onKeyDown(ev) {
        debug("onKeyDown", ev);
    }

    onMidiMessage(m) {
        debug("onMidiMessage", m.data[0], m.data[1], m.data[2],  m);
        midiInputHandler.onMidiMessage(m);
    }

    resetMidi() {
        midiInputHandler.reset();
        midiOutputHandler.reset();
    }
}

const coordinator = new Coordinator();

function onMIDISuccess(midiAccess) {
    console.log("onMIDISuccess");

    for (var input of midiAccess.inputs.values()) {
        console.log("Input: ", input);
        input.onmidimessage = coordinator.onMidiMessage;
    }
    for (var output of midiAccess.outputs.values()) {
        console.log("Output: ", output);
        if (!/midi through/i.test(output.name)) {
            midiOutputHandler.setMidiOut(output);
        }
    }
}

function onMIDIFailure() {
    alert('Could not access your MIDI devices.');
}

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
$(window).keydown(coordinator.onKeyDown);



// var BAR_RATIO = 0.3;

// var LINE_WIDTH = 2 * scale;

// var BASE_LINE_COLOR = [200, 255, 200];

// var ROLL_SCROLL_TICKS = 1;
// var ROLL_SCROLL_AMOUNT = 2;

// var W = Math.floor(screen.width * scale);
// var H = Math.floor(screen.height * scale);

// var BAR_H = int(H * BAR_RATIO);
// var ROLL_H = H - BAR_H;


// var MIN_NOTE = 21;
// var MAX_NOTE = 108;

// // Initialize notes
// var tick = 0;
// var notes = [];
// for (var i = 0; i < NOTES_COUNT; i++) {
//     notes[i] = [false, 0, 0]; // note on/off, velocity, tick
// }

// var onNoteCount = 0;

// // Initialize the canvases
// var canvasBar = document.getElementById("bar");
// var cbar = canvasBar.getContext("2d");

// var canvasRoll = document.getElementById("roll");
// var croll = canvasRoll.getContext("2d");

// canvasBar.width = W;
// canvasBar.height = int(H * BAR_RATIO);

// canvasRoll.width = W;
// canvasRoll.height = H - int(H * BAR_RATIO);

// croll.fillStyle = 'rgb(0, 0, 0)';
// croll.fillRect(0, 0, canvasRoll.width, canvasRoll.height);


// var MIDI_OUT = null;

// function setCanvasSize() {
//     // TODO: Figure out how to do it in CSS
//     console.log("Resized");
//     // canvasBar.style.width = window.innerWidth + "px";
//     // canvasBar.style.height = int(window.innerHeight * BAR_RATIO) + "px";

//     // canvasRoll.style.width = window.innerWidth + "px";
//     // canvasRoll.style.height = (window.innerHeight - canvasBar.style.height) + "px";
// }

// function onMIDISuccess(midiAccess) {
//     console.log(midiAccess);

//     for (var input of midiAccess.inputs.values()) {
//         console.log(input);
//         input.onmidimessage = getMIDIMessage;
//     }
//     for (var output of midiAccess.outputs.values()) {
//         console.log(output);
//         if (!MIDI_OUT && !/through/i.test(output.name)) {
//             MIDI_OUT = output;
//         }
//     }
//     console.log("Output device selected:", MIDI_OUT);
// }

// function onMIDIFailure() {
//     alert('Could not access your MIDI devices.');
// }

// function getMIDIMessage(midiMessage) {
//     // console.log(midiMessage);
// // Key on
// // <Event(32771-MidiIn {'status': 144, 'data1': 48, 'data2': 80, 'data3': 0, 'timestamp': 1111, 'vice_id': 3}) >
// // Key-off
// // <Event(32771-MidiIn {'status': 128, 'data1': 48, 'data2': 0, 'data3': 0, 'timestamp': 1364, 'vice_id': 3}) >
//     var d = midiMessage.data;
//     if (d[0] == 144) {
//         onNoteCount++;
//         notes[d[1]][0] = true;
//         notes[d[1]][1] = d[2];
//         notes[d[1]][3] = tick;
//     } else if (d[0] == 128) {
//         notes[d[1]][0] = false;
//         notes[d[1]][3] = tick;
//     }
// }

// class Recorder {
//     constructor() {
//         this._playing = false;
//         this._recording = false;
//     }
// }

// var recorder = new Recorder();

// function keyDown(ev) {
//     // console.log("keydown", ev.originalEvent.key);

//     var handled = false;
//     if (ev.originalEvent.key == 'F1') {
//         $('#canvases').toggle();
//         console.log("Video mute toggle");
//         handled = true;
//     } else if (ev.originalEvent.key == 'r') {
//         $('#recording').toggle();
//     } else if (ev.originalEvent.key == ' ') {
//         $('#playing').toggle();
//     }
//     if (handled) {
//         ev.preventDefault();
//     }
// }

// function hsvToRgb(h, s, v) {
//     var r, g, b, i, f, p, q, t;
//     if (arguments.length === 1) {
//         s = h.s, v = h.v, h = h.h;
//     }
//     i = Math.floor(h * 6);
//     f = h * 6 - i;
//     p = v * (1 - s);
//     q = v * (1 - f * s);
//     t = v * (1 - (1 - f) * s);
//     switch (i % 6) {
//         case 0: r = v, g = t, b = p; break;
//         case 1: r = q, g = v, b = p; break;
//         case 2: r = p, g = v, b = t; break;
//         case 3: r = p, g = q, b = v; break;
//         case 4: r = t, g = p, b = v; break;
//         case 5: r = v, g = p, b = q; break;
//     }
//     return [
//         Math.round(r * 255),
//         Math.round(g * 255),
//         Math.round(b * 255)
//     ];
// }

// function getColor(velocity) {
//     var MAX_H = 0.4
//     var h = MAX_H - (MAX_H * velocity / 127)
//     var s = 0.9;
//     var l = 1;
//     return hsvToRgb(h, s, l)
// }

// function getOnColor(count) {
//     var h = Math.max(0, 0.2 - count * 0.03)
//     var s = Math.min(1, 0.3 + 0.2 * count)
//     var l = Math.min(1, 0.4 + 0.2 * count)
//     return hsvToRgb(h, s, l)
// }

// function toColorStr(rgb) {
//     return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
// }

// function line(ctx, left, top, width, height) {
//     ctx.beginPath();
//     ctx.moveTo(left, top);
//     ctx.lineTo(left + width, top + height);
//     ctx.closePath();
//     ctx.stroke();
// }

// var start = Date.now();

// function draw() {
//     tick++;
//     // if (tick % 60 == 0) {
//     //     var now = Date.now();
//     //     console.log(((now - start) / tick) + " ms");
//     // }

//     // Scroll the roll
//     croll.drawImage(canvasRoll, 0, ROLL_SCROLL_AMOUNT);
//     croll.fillStyle = 'black';
//     croll.fillRect(0, 0, W, ROLL_SCROLL_AMOUNT);

//     cbar.fillStyle = 'black';
//     cbar.fillRect(0, 0, W, H);

//     // bar width
//     var bw = W / (MAX_NOTE - MIN_NOTE + 1) - 1


//     if (onNoteCount > 0) {
//         croll.fillStyle = toColorStr(getOnColor(onNoteCount));
//         croll.fillRect(0, ROLL_SCROLL_AMOUNT - 1, W, 1);
//         // croll(self.roll, self._get_on_color(self.on), (0, ROLL_SCROLL_AMOUNT - 1, aw, 1))
//     }

//     cbar.fillStyle = toColorStr(getColor(127 * (1 - 0.25)));
//     cbar.fillRect(0, BAR_H * 0.25, W, LINE_WIDTH)

//     cbar.fillStyle = toColorStr(getColor(127 * (1 - 0.5)));
//     cbar.fillRect(0, BAR_H * 0.5, W, LINE_WIDTH)

//     cbar.fillStyle = toColorStr(getColor(127 * (1 - 0.7)));
//     cbar.fillRect(0, BAR_H * 0.7, W, LINE_WIDTH)

//     for (var i = MIN_NOTE; i <= MAX_NOTE; i++) {
//         var note = notes[i]
//         if (!note[0]) {
//             continue;
//         }
//         var color = getColor(note[1])
//         if (color === null) continue

//         // bar left
//         var bl = W * (i - MIN_NOTE) / (MAX_NOTE - MIN_NOTE + 1)

//         // bar height
//         var bh = BAR_H * note[1] / 127;

//         cbar.fillStyle = toColorStr(color);
//         cbar.fillRect(bl, BAR_H, bw, -bh);
//         // todo: draw roll bar
//         // pg.draw.rect(self.roll, color, (bl, 0, bw, ROLL_SCROLL_AMOUNT))
//         croll.fillStyle = cbar.fillStyle;
//         croll.fillRect(bl, 0, bw, ROLL_SCROLL_AMOUNT);
//     }

//     cbar.fillStyle = toColorStr(BASE_LINE_COLOR);
//     cbar.fillRect(0, BAR_H - LINE_WIDTH, W, LINE_WIDTH)

//     onNoteCount = 0;
//     requestAnimationFrame(draw)
// }

// // setCanvasSize();
// // $(window).resize(setCanvasSize);

// $(window).keydown(keyDown);

// requestAnimationFrame(draw)

// navigator.requestMIDIAccess()
//     .then(onMIDISuccess, onMIDIFailure);

