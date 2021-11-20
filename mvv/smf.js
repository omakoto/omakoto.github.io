// SMF Format: https://ccrma.stanford.edu/~craig/14q/midifile/MidiFileFormat.html
// https://www.music.mcgill.ca/~gary/306/week9/smf.html

class BytesWriter {
    #cap = 8; // 1024 * 32;
    #size = 0;
    #buf;

    constructor() {
        this.#buf = new Uint8Array(this.#cap);
    }

    writeVar(val) {
        if (val >= 0x200000) {
            var v = val / 0x200000;
            val &= (0x200000 - 1)
            this.writeI8(0x80 | v);
        }
        if (val >= 0x4000) {
            var v = val / 0x4000;
            val &= (0x4000 - 1)
            this.writeI8(0x80 | v);
        }
        if (val >= 0x80) {
            var v = val / 0x80;
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
        this.#ensureCap(pos);
        this.#buf[pos + 0] = (val >>  0) & 255;
        return this;
    }

    setI16(pos, val) {
        this.#ensureCap(pos + 1);
        this.#buf[pos + 0] = (val >>  8) & 255;
        this.#buf[pos + 1] = (val >>  0) & 255;
        return this;
    }

    setI32(pos, val) {
        this.#ensureCap(pos + 3);
        this.#buf[pos + 0] = (val >> 24) & 255;
        this.#buf[pos + 1] = (val >> 16) & 255;
        this.#buf[pos + 2] = (val >>  8) & 255;
        this.#buf[pos + 3] = (val >>  0) & 255;
        return this;
    }

    #grow() {
        this.#cap *= 2;
        var nb = new Uint8Array(this.#cap);
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
    constructor() {
    }
}
