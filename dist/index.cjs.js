'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class eventemitter {
    constructor() {
        this.callbacks = {};
    }
    on(eventname, f) {
        this.callbacks = this.callbacks || {};
        this.callbacks[eventname] = this.callbacks[eventname] || [];
        this.callbacks[eventname].push(f);
    }
    off(eventname, f) {
        this.callbacks = this.callbacks || {};
        this.callbacks[eventname] = this.callbacks[eventname] || [];
        this.callbacks[eventname].filter(fn => fn != f);
    }
    emit(eventname, ...args) {
        this.callbacks = this.callbacks || {};
        for (let f of this.callbacks[eventname] || []) {
            f(...args);
        }
    }
}

const store = {};
class storage {
    key(n) {
        return Object.keys(store)[n] || null;
    }
    getItem(key) {
        return store[key] || null;
    }
    setItem(key, value) {
        store[key] = value;
    }
    removeItem(key) {
        delete store[key];
    }
    clear() {
        for (let key in store) {
            delete store[key];
        }
    }
}
let localStorage;
if (typeof window == 'undefined') {
    localStorage = new storage();
}
else {
    localStorage = window.localStorage;
}
class localstorage_values extends eventemitter {
    constructor(storage_key, option_prefix) {
        super();
        this.storage = localStorage;
        this.timeouts = {};
        /**
        * Gets a persistent remote_peer option
        *
        * @param {string} key The option's key
        */
        this.get = (key) => {
            return this.prefix_path.concat(key.split('.'))
                .reduce((c, n) => c && c[n], this.get_storevalue()) || undefined;
        };
        /**
        * Sets a persistent remote_peer option
        *
        * @param {string} key The option's key
        * @param {string} value The option's value
        * @param {number} seconds Number of section the value is valid
        */
        this.set = (key, value, seconds) => {
            const data = this.get_storevalue();
            const path = key.split('.');
            const last_key = path.pop() || '';
            // walk along the path
            const dict = this.prefix_path.concat(path)
                .reduce((c, n) => {
                if (typeof c[n] == 'undefined') {
                    c[n] = {};
                }
                return c[n];
            }, data);
            // get old value
            const oldvalue = dict[last_key];
            // set new value
            dict[last_key] = value;
            // expiration_date
            if (typeof seconds != 'undefined') {
                let expires_at = (new Date()).valueOf() + seconds * 1000;
                data['__expirations__'] = data['__expirations__'] || {};
                data['__expirations__'][key] = { expires_at };
            }
            // save data
            this.storage.setItem(this.storage_key, JSON.stringify(data));
            // settimeout
            this.settimeout(key);
            // emit  event
            this.emit('option', 'set', key, value, oldvalue);
        };
        this.delete = (key) => {
            const data = this.get_storevalue();
            const path = key.split('.');
            const last_key = path.pop() || '';
            // walk along the path
            const dict = this.prefix_path.concat(path)
                .reduce((c, n) => {
                if (typeof c[n] == 'undefined') {
                    c[n] = {};
                }
                return c[n];
            }, data);
            // get old value
            const oldvalue = dict[last_key];
            // set new value
            delete dict[last_key];
            // save data
            this.storage.setItem(this.storage_key, JSON.stringify(data));
            return oldvalue;
        };
        /**
        * Removes a persistent remote_peer option
        *
        * @param {string} key The option's key
        */
        this.remove = (key) => {
            let oldvalue = this.delete(key);
            // emit event
            this.emit('option', 'remove', key, oldvalue);
        };
        if (typeof storage_key == 'undefined') {
            throw new Error("invalid value for 'key'");
        }
        this.storage_key = storage_key;
        this.prefix_path = option_prefix && option_prefix.split('.') || [];
        this.settimeout();
    }
    /**
     * Retrieves the value of the storage parsed as JSON
     *
     * @returns {Object} value of the specified key
     */
    get_storevalue() {
        const store_value = this.storage.getItem(this.storage_key);
        return store_value && JSON.parse(store_value) || {};
    }
    /**
     * Sets timeout for specified key or for all necessary keys
     *
     * @param key key for which to set timeout
     */
    settimeout(key) {
        const expirations = this.get_storevalue().__expirations__ || {};
        let set_singletimeout = (key) => {
            if (key in expirations && (!(key in this.timeouts))) {
                let now = (new Date()).valueOf();
                let milliseconds = (expirations[key].expires_at - now) / 1000;
                this.timeouts[key] = setTimeout(() => {
                    const oldvalue = this.get(key);
                    this.delete(key);
                    this.emit('expired', key, oldvalue);
                }, milliseconds);
            }
        };
        key &&
            set_singletimeout(key) ||
            Object.keys(expirations).forEach(set_singletimeout);
    }
}

exports.default = localstorage_values;
exports.store = store;
