// SMF Format: https://ccrma.stanford.edu/~craig/14q/midifile/MidiFileFormat.html
// https://www.music.mcgill.ca/~gary/306/week9/smf.html
// https://midimusic.github.io/tech/midispec.html

function logBlob(blob) {
    let fileReader = new FileReader();
    fileReader.readAsArrayBuffer(blob);

    fileReader.onload = function(event) {
        console.log(fileReader.result);
    };
    return blob;
}

class BytesWriter {
    #cap = 2; // 1024 * 32;
    #size = 0;
    #buf;

    constructor() {
        this.#buf = new Uint8Array(this.#cap);
    }

    writeVar(val) {
        if (val >= 0x200000) {
            let v = val / 0x200000;
            val &= (0x200000 - 1)
            this.writeI8(0x80 | v);
        }
        if (val >= 0x4000) {
            let v = val / 0x4000;
            val &= (0x4000 - 1)
            this.writeI8(0x80 | v);
        }
        if (val >= 0x80) {
            let v = val / 0x80;
            val &= (0x80 - 1)
            this.writeI8(0x80 | v);
        }
        this.writeI8(val);
        return this;
    }

    writeI8(val) {
        this.setI8(this.#size, val);
        this.#size += 1;
        return this;
    }

    writeI16(val) {
        this.setI16(this.#size, val);
        this.#size += 2;
        return this;
    }

    writeI32(val) {
        this.setI32(this.#size, val);
        this.#size += 4;
        return this;
    }

    setI8(pos, val) {
        this.#ensureCap(pos + 1);
        this.#buf[pos + 0] = (val >>  0) & 255;
        return this;
    }

    setI16(pos, val) {
        this.#ensureCap(pos + 2);
        this.#buf[pos + 0] = (val >>  8) & 255;
        this.#buf[pos + 1] = (val >>  0) & 255;
        return this;
    }

    setI32(pos, val) {
        this.#ensureCap(pos + 4);
        this.#buf[pos + 0] = (val >> 24) & 255;
        this.#buf[pos + 1] = (val >> 16) & 255;
        this.#buf[pos + 2] = (val >>  8) & 255;
        this.#buf[pos + 3] = (val >>  0) & 255;
        return this;
    }

    #grow() {
        this.#cap *= 2;
        let nb = new Uint8Array(this.#cap);
        nb.set(this.#buf);
        this.#buf = nb;
        return this;
    }

    #ensureCap(cap) {
        if (this.#cap >= cap) {
            return;
        }
        this.#grow();
        return this;
    }

    #ensureGrowth(size) {
        return this.#ensureCap(this.#size + size);
    }

    getSize() {
        return this.#size;
    }

    getBlob(contentType) {
        let ret = (new Blob([this.#buf])).slice(0, this.#size, contentType);
        // logBlob(ret);
        return ret;
    }
}

class BytesReader {
    constructor() {
    }
}

class SmfReader {
    constructor() {
    }
}

class SmfWriter {
    #writer = new BytesWriter();

    #trackLengthPos;

    #closed = false;

    constructor() {
        this.#writer.writeI8(0x4D); // M
        this.#writer.writeI8(0x54); // T
        this.#writer.writeI8(0x68); // h
        this.#writer.writeI8(0x64); // d

        this.#writer.writeI32(6); // header length

        this.#writer.writeI16(0); // single track
        this.#writer.writeI16(1); // contains a single track
        this.#writer.writeI16(96); // 96 per quarter-note

        this.#writer.writeI8(0x4D); // M
        this.#writer.writeI8(0x54); // T
        this.#writer.writeI8(0x72); // r
        this.#writer.writeI8(0x6B); // k

        this.#trackLengthPos = this.#writer.getSize();
        this.#writer.writeI32(0); // Track length

        // Time signature
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(0xff);
        this.#writer.writeI8(0x58);
        this.#writer.writeI8(0x04);
        this.#writer.writeI8(0x04);
        this.#writer.writeI8(0x02);
        this.#writer.writeI8(0x18);
        this.#writer.writeI8(0x08);

        // tempo
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(0xff);
        this.#writer.writeI8(0x51);
        this.#writer.writeI8(0x03);
        this.#writer.writeI8(0x07);
        this.#writer.writeI8(0xa1);
        this.#writer.writeI8(0x20);

        this.#writeResetData();

        // Sample data

        // Note on
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(90);
        this.#writer.writeI8(48);
        this.#writer.writeI8(96)

        // Note off
        this.#writer.writeVar(192); // time
        this.#writer.writeI8(80);
        this.#writer.writeI8(48);
        this.#writer.writeI8(64);
    }

    #writeResetData() {
        // All notes off
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(176);
        this.#writer.writeI8(123);
        this.#writer.writeI8(0);

        // Reset all controllers
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(176);
        this.#writer.writeI8(121);
        this.#writer.writeI8(0);

        // // All reset
        // TODO: Hmm, 0xFF conflicts with meta event header, so we can't use it?
        // this.#writer.writeVar(0); // time
        // this.#writer.writeI8(255);
    }

    close() {
        if (this.#closed) {
            return;
        }
        // end of track
        this.#writer.writeVar(0); // time
        this.#writer.writeI8(0xff);
        this.#writer.writeI8(0x2f);
        this.#writer.writeI8(0x00);

        let pos = this.#writer.getSize();
        this.#writer.setI32(this.#trackLengthPos, pos - this.#trackLengthPos - 4);
    }

    getBlob() {
        this.close();
        return this.#writer.getBlob("audio/mid");
    }

    download(filename) {
        downloadMidi(this.getBlob(), filename);
    }
}

function downloadMidi(blob, filename) {
    if (!filename) {
        filename = "mvv.mid";
    }

    let element = document.createElement('a');
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    let reader = new FileReader();
    reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

    reader.onload = function() {
        element.href = reader.result; // data url
        element.click();
        document.body.removeChild(element);
    };
}

// For manual testing
function t() {
    (new SmfWriter()).download();
}

