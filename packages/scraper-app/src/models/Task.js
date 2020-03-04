"use strict";


class Task {

    constructor(url, dueDate, type, status) {
        this._url = url;
        this._dueDate = dueDate;
        this._type = type;
        this._status = status;
    }

    get url() {
        return this._url;
    }

    get dueDate() {
        return this._dueDate;
    }

    set dueDate(timestamp) {
        this._dueDate = timestamp;
    }

    get type() {
        return this._type;
    }

    set type(type) {
        this._type = type;
    }

    get status() {
        return this._status;
    }

    set status(status) {
        this._status = status;
    }

}

module.exports = Task
