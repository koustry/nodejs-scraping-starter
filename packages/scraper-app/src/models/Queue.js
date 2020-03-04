"use strict";


class Queue {

    constructor() {
        this._elements = []
    }

    enqueue(...items) {
        return this._elements.push(...items)
    }

    dequeue() {
        return this._elements.shift()
    }

    getLength() {
        return this._elements.length
    }

}

module.exports = Queue
