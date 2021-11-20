class BytesWriter {
    #cap = 8; // 1024 * 32;
    #size = 0;
    #buf;

    constructor() {
        this.#buf = new Uint8Array(this.#cap);
    }

    writeByte(b) {
        this.#ensureSize(1);
        this.#buf[this.#size] = b;
        this.#size++;
    }

    #ensureSize(size) {
        if (this.#cap >= (this.#size + size)) {
            return;
        }
        this.#cap *= 2;
        var nb = new Uint8Array(this.#cap);
        nb.set(this.#buf);
        this.#buf = nb;
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
