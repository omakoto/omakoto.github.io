// 2D game with canvas example: https://github.com/end3r/Gamedev-Canvas-workshop/blob/gh-pages/lesson10.html
// Get screen size: https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio
// and window.screen.{width,height{


const DEBUG = parseInt((new URLSearchParams(window.location.search)).get("debug")) ? true : false;
const SCALE_ARG = parseFloat("0" + (new URLSearchParams(window.location.search)).get("scale"));
const SCALE = SCALE_ARG > 0 ? SCALE_ARG : window.devicePixelRatio;
console.log("Scale: " + SCALE);
const NOTES_COUNT = 128;

if (!DEBUG) {
    console.log("Debug log is disabled. Use ?debug=1 to enable debug log.");
}

// We set some styles in JS.
const BAR_RATIO = 0.3; // Bar : Roll height
const MARGIN = 0.005; // Margin at each side

// Common values
const RGB_BLACK = [0, 0, 0];

// Utility functions

function int(v) {
    return Math.floor(v);
}

function s(v) {
    return int(v * SCALE);
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

function rgbToStr(rgb) {
    // special common cases
    if (rgb[0] == 0 && rgb[1] == 0 && rgb[2] == 0) {
        return "black";
    }
    return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}

function debug(...args) {
    if (!DEBUG) return;
    console.log(...args);
}

function info(...args) {
    console.log(...args);
}


// Logic



class Renderer {
    #BAR_SUB_LINE_WIDTH = s(2);
    #BAR_BASE_LINE_COLOR = [200, 255, 200];
    #ROLL_SCROLL_AMOUNT = s(2);

    #W; // Width in canvas pixels
    #H; // Height in canvas pixels
    #BAR_H;
    #ROLL_H;
    #MIN_NOTE = 21;
    #MAX_NOTE = 108;
    #cbar;
    #bar;
    #croll;
    #roll;

    #frameCount = 0;

    constructor() {
        // Adjust CSS with the constants.
        $("body").css("padding", (MARGIN * 100) + "%");
        $("#canvases").css("width", (100 - MARGIN * 200) + "%");
        $("#bar").css("height", (BAR_RATIO * 100) + "%");
        $("#roll").css("height", (100 - BAR_RATIO * 100) + "%");

        this.#W = s(screen.width * (1 - MARGIN * 2));
        this.#H = s(screen.height * (1 - MARGIN * 2));
        this.#BAR_H = int(this.#H * BAR_RATIO);
        this.#ROLL_H = this.#H - this.#BAR_H;

        const colorSpace = "srgb"; // "display-p3";
        var options = { colorSpace: colorSpace};

        this.#cbar = document.getElementById("bar");
        this.#bar = this.#cbar.getContext("2d", options);

        this.#croll = document.getElementById("roll");
        this.#roll = this.#croll.getContext("2d", options);

        this.#cbar.width = this.#W;
        this.#cbar.height = this.#BAR_H;

        this.#croll.width = this.#W;
        this.#croll.height = this.#ROLL_H;

        this.#roll.fillStyle = 'black';
        this.#roll.fillRect(0, 0, this.#croll.width, this.#croll.height);
    }

    getBarColor(velocity) {
        var MAX_H = 0.4
        var h = MAX_H - (MAX_H * velocity / 127)
        var s = 0.9;
        var l = 1;
        return hsvToRgb(h, s, l)
    }

    getOnColor(count) {
        var h = Math.max(0, 0.2 - count * 0.03)
        var s = Math.min(1, 0.3 + 0.2 * count)
        var l = Math.min(1, 0.4 + 0.2 * count)
        return hsvToRgb(h, s, l)
    }

    getPedalColor(value) {
        if (value <= 0) {
            return RGB_BLACK;
        }
        var h = 0.65 - (0.2 * value / 127);
        var s = 0.7;
        var l = 0.2;
        return hsvToRgb(h, s, l)
    }


    drawSubLine(percent) {
        this.#bar.fillStyle = rgbToStr(this.getBarColor(127 * (1 - percent)));
        this.#bar.fillRect(0, this.#BAR_H * percent, this.#W, this.#BAR_SUB_LINE_WIDTH)
    }

    onDraw(now) {
        this.#frameCount++;

        // Scroll the roll.
        this.#roll.drawImage(this.#croll, 0, this.#ROLL_SCROLL_AMOUNT);
        this.#roll.fillStyle = rgbToStr(this.getPedalColor(midiRenderingStatus.pedal));
        this.#roll.fillRect(0, 0, this.#W, this.#ROLL_SCROLL_AMOUNT);

        // Clear the bar area.
        this.#bar.fillStyle = 'black';
        this.#bar.fillRect(0, 0, this.#W, this.#H);

        // Individual bar width
        var bw = this.#W / (this.#MAX_NOTE - this.#MIN_NOTE + 1) - 1;

        // "On" line
        if (midiRenderingStatus.onNoteCount > 0) {
            this.#roll.fillStyle = rgbToStr(this.getOnColor(midiRenderingStatus.onNoteCount));
            this.#roll.fillRect(0, this.#ROLL_SCROLL_AMOUNT - s(2), this.#W, s(2));
        }

        // Sub lines.
        this.drawSubLine(0.25);
        this.drawSubLine(0.5);
        this.drawSubLine(0.7);

        for (var i = this.#MIN_NOTE; i <= this.#MAX_NOTE; i++) {
            var note = midiRenderingStatus.getNote(i);
            if (!note[0]) {
                continue;
            }
            var color = this.getBarColor(note[1])
            var colorStr = rgbToStr(color);

            // bar left
            var bl = this.#W * (i - this.#MIN_NOTE) / (this.#MAX_NOTE - this.#MIN_NOTE + 1)

            // bar height
            var bh = this.#BAR_H * note[1] / 127;

            this.#bar.fillStyle = colorStr;
            this.#bar.fillRect(bl, this.#BAR_H, bw, -bh);

            this.#roll.fillStyle = colorStr;
            this.#roll.fillRect(bl, 0, bw, this.#ROLL_SCROLL_AMOUNT);
        }

        // Base line.
        this.#bar.fillStyle = rgbToStr(this.#BAR_BASE_LINE_COLOR);
        this.#bar.fillRect(0, this.#BAR_H, this.#W, -this.#BAR_SUB_LINE_WIDTH)
    }

    toggleMute() {
        $('#canvases').toggle();
    }

    show() {
        $('#canvases').show();
    }
}

const renderer = new Renderer();

class MidiRenderingStatus {
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
        } else if (d[0] == 128) { // Note off
            this.#notes[d[1]][0] = false;
        } else if (d[0] == 176 && d[1] == 64) { // Pedal
            this.#pedal = d[2];
        }
    }

    reset() {
        this.#notes = [];
        for (var i = 0; i < NOTES_COUNT; i++) {
            this.#notes[i] = [false, 0]; // note on/off, velocity
        }
        this.#pedal = 0;
        this.#onNoteCount = 0;
    }

    afterDraw(now) {
        this.#onNoteCount = 0;
    }

    get onNoteCount() {
        return this.#onNoteCount;
    }

    get pedal() {
        return this.#pedal;
    }

    getNote(note) {
        return this.#notes[note];
    }
}

const midiRenderingStatus = new MidiRenderingStatus();

class MidiOutputManager {
    #device = null;
    constructor() {
    }

    setMidiOut(device) {
        console.log("MIDI output device set:", device);
        this.#device = device;
        midiOutputManager.reset();
    }

    reset() {
        if (!this.#device) {
            return;
        }
        if (this.#device.clear) {
            this.#device.clear(); // Chrome doesn't support it yet.
        }
        this.#device.send([176, 123, 0], 0); // All notes off
        this.#device.send([176, 121, 0], 0); // Reset all controllers
        this.#device.send([255], 0); // All reset
        info("MIDI reset");
    }


    sendEvent(data, timestamp) {
        if (!this.#device) {
            return;
        }
        this.#device.send(data, timestamp);
    }
}

const midiOutputManager = new MidiOutputManager();

class RecordedEvent {
    constructor(relativeTimeStamp, ev) {
        this.relativeTimeStamp = relativeTimeStamp;
        this.event = ev;
    }
}

class Recorder {
    #events = [];
    #isPlaying = false;
    #isRecording = false;

    #recordingStartTimestamp = 0;
    #playbackStartTimestamp = 0;
    #playbackTimeAdjustment = 0;
    #nextPlaybackIndex = 0;

    constructor() {
    }

    startRecording() {
        if (this.#isRecording) {
            return false;
        }
        if (this.#isPlaying) {
            return false;
        }
        this.#startRecording();
    }

    stopRecording() {
        if (!this.#isRecording) {
            return false;
        }
        this.#stopRecording();
        return true;
    }

    startPlaying() {
        if (this.#isRecording) {
            return false;
        }
        if (this.#isPlaying) {
            return false;
        }
        this.#startPlaying();
    }

    stopPlaying() {
        if (!this.#isPlaying) {
            return false;
        }
        this.#stopPlaying();
        return true;
    }

    get isRecording() {
        return this.#isRecording;
    }

    get isPlaying() {
        return this.#isPlaying;
    }

    #startRecording() {
        info("Recording started");
        this.#isRecording = true;
        this.#events = [];
    }

    #stopRecording() {
        info("Recording stopped");
        this.#isRecording = false;
    }

    #startPlaying() {
        info("Playback started");
        this.#isPlaying = true;
        this.#playbackStartTimestamp = window.performance.now();
        this.#playbackTimeAdjustment = 0;
        this.#nextPlaybackIndex = 0;
    }

    #stopPlaying() {
        info("Playback stopped");
        this.#isPlaying = false;
    }

    recordEvent(ev) {
        if (!this.#isRecording) {
            return false;
        }

        // Only record certain events.
        switch (ev.data[0]) {
            case 144: // Note on
            case 128: // Note off
            case 176: // Control
                break;
            default:
                return false;
        }

        if (this.#events.length == 0) {
            // First event, remember the timestamp.
            this.#recordingStartTimestamp = ev.timeStamp;
        }
        this.#events.push(new RecordedEvent(ev.timeStamp - this.#recordingStartTimestamp, ev));

        return true;
    }

    // Fastfoward or rewind.
    adjustPlaybackPosition(milliseconds) {
        this.#playbackTimeAdjustment += milliseconds;
        var ts = this.#getCurrentPlaybackTimestamp();
        // If rewound beyond the starting point, just reset the
        if (ts <= 0) {
            this.#playbackStartTimestamp = window.performance.now();
            this.#playbackTimeAdjustment = 0;
            ts = -1; // Special case: Move before the first note.
        }
        info("New playback timestamp: " + ts);

        // Find the next play event index.
        this.#nextPlaybackIndex = 0;
        this.#moveUpToTimestamp(ts, null);
    }

    #getCurrentPlaybackTimestamp() {
        return (window.performance.now() - this.#playbackStartTimestamp) + this.#playbackTimeAdjustment;
    }

    playback() {
        if (!this.#isPlaying) {
            return false;
        }

        // Current timestamp
        var ts = this.#getCurrentPlaybackTimestamp();

        return this.#moveUpToTimestamp(ts, function(ev) {
            midiRenderingStatus.onMidiMessage(ev);
            midiOutputManager.sendEvent(ev.data, 0)
        });
    }

    #moveUpToTimestamp(timestamp, callback) {
        for (;;) {
            if (this.#events.length <= this.#nextPlaybackIndex) {
                // No more events.
                this.#isPlaying = false;
                coordinator.onPlaybackFinished();
                return false;
            }
            var ev = this.#events[this.#nextPlaybackIndex];
            if (ev.relativeTimeStamp > timestamp) {
                return true;
            }
            this.#nextPlaybackIndex++;

            if (callback) {
                callback(ev.event);
            }
        }
    }
}

const recorder = new Recorder();

class Coordinator {
    #now = 0;
    #nextSecond = 0;
    #frames = 0;
    #timerTicks = 0;
    #efps;

    constructor() {
        this.#nextSecond = window.performance.now() + 1000;
        this.#efps = $("#fps");
    }

    onKeyDown(ev) {
        debug("onKeyDown", ev.timeStamp, ev.which, ev);

        // Don't respond if any modifier keys are pressed.
        if (ev.ctrlKey || ev.shiftKey || ev.altKey || ev.metaKey) {
            return;
        }
        // Ignore key repeats.
        if (ev.originalEvent.repeat) {
            return;
        }

        switch (ev.which) {
            case 112: // F1
                this.toggleVideoMute();
                break;
            case 70: // F
                this.#efps.toggle();
                break;
            case 82: // R
                this.toggleRecording();
                break;
            case 32: // Space
                this.togglePlayback();
                break;
            case 37: // Left
                if (recorder.isPlaying) {
                    this.resetMidi();
                    recorder.adjustPlaybackPosition(-1000);
                }
                break;
            case 39: // Right
                if (recorder.isPlaying) {
                    this.resetMidi();
                    recorder.adjustPlaybackPosition(1000);
                }
                break;
            default:
                return;
        }
        ev.preventDefault();
    }

    toggleVideoMute() {
        info("Toggle video mute");
        renderer.toggleMute();
    }

    toggleRecording() {
        if (recorder.isRecording) {
            recorder.stopRecording();
        } else {
            recorder.startRecording();
        }
        this.#updateRecorderStatus();
    }

    togglePlayback() {
        if (recorder.isPlaying) {
            recorder.stopPlaying();
            this.resetMidi();
        } else {
            renderer.show();
            recorder.startPlaying();
        }
        this.#updateRecorderStatus();
    }

    onPlaybackFinished() {
        info("Playback finished");
        this.#updateRecorderStatus();
        this.resetMidi();
    }

    #updateRecorderStatus() {
        if (recorder.isPlaying) {
            $('#playing').show();
        } else {
            $('#playing').hide();
        }
        if (recorder.isRecording) {
            $('#recording').show();
        } else {
            $('#recording').hide();
        }
    }

    #normalizeMidiEvent(ev) {
        // Allow V25's leftmost knob to be used as the pedal.
        if (ev.currentTarget.name.startsWith("V25")) {
            var d = ev.data;
            if (d[0] == 176 && d[1] == 20) {
                d[1] = 64;
            }
        }
    }

    onMidiMessage(ev) {
        debug("onMidiMessage", ev.timeStamp, ev.data[0], ev.data[1], ev.data[2],  ev);
        this.#normalizeMidiEvent(ev);

        midiRenderingStatus.onMidiMessage(ev);
        if (recorder.isRecording) {
            recorder.recordEvent(ev);
        }
    }

    resetMidi() {
        midiRenderingStatus.reset();
        midiOutputManager.reset();
    }

    onDraw() {
        // Update FPS
        this.#frames++;
        var now = window.performance.now();
        if (now >= this.#nextSecond) {
            this.#efps.text(this.#frames + "/" + this.#timerTicks);
            this.#frames = 0;
            this.#timerTicks = 0;
            this.#nextSecond += 1000;
        }

        this.#now = now;

        renderer.onDraw(this.#now);
        midiRenderingStatus.afterDraw(this.#now);

        Coordinator.scheduleOnDraw();
    }

    static scheduleOnDraw() {
        requestAnimationFrame(function() {coordinator.onDraw();})
    }

    onTimer() {
        this.#timerTicks++;
        if (recorder.isPlaying) {
            recorder.playback();
        }
    }

    close() {
        recorder.stopPlaying();
        this.resetMidi();
    }
}

const coordinator = new Coordinator();

function onMIDISuccess(midiAccess) {
    console.log("onMIDISuccess");

    for (var input of midiAccess.inputs.values()) {
        console.log("Input: ", input);
        input.onmidimessage = function(ev) {coordinator.onMidiMessage(ev); };
    }
    for (var output of midiAccess.outputs.values()) {
        console.log("Output: ", output);
        if (!/midi through/i.test(output.name)) {
            midiOutputManager.setMidiOut(output);
        }
    }
}

function onMIDIFailure() {
    alert('Could not access your MIDI devices.');
}

setInterval(function() {coordinator.onTimer();}, 5);
Coordinator.scheduleOnDraw();
navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);
$(window).keydown(function(ev) {coordinator.onKeyDown(ev);});

$(window).on('beforeunload', function(){
    return 'Are you sure you want to leave?';
});
$(window).on('unload', function() {
    coordinator.close();
});

