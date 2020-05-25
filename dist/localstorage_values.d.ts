import eventemitter from './ee';
export declare const store: {
    [key: string]: string;
};
export default class localstorage_values extends eventemitter {
    private storage_key;
    private prefix_path;
    private storage;
    private timeouts;
    constructor(storage_key: string, option_prefix?: string);
    /**
     * Retrieves the value of the storage parsed as JSON
     *
     * @returns {Object} value of the specified key
     */
    private get_storevalue;
    /**
    * Gets a persistent remote_peer option
    *
    * @param {string} key The option's key
    */
    get: (key: string) => any;
    /**
     * Sets timeout for specified key or for all necessary keys
     *
     * @param key key for which to set timeout
     */
    private settimeout;
    /**
    * Sets a persistent remote_peer option
    *
    * @param {string} key The option's key, may also be the path
    *                     within a dictionary with crumb's delimited by '.'
    * @param {any} value The option's value
    * @param {number} seconds Number of section the value is valid
    *
    * @returns {any} the given value
    */
    set: (key: string, value: any, milliseconds?: number | undefined) => any;
    private delete;
    /**
    * Removes a persistent remote_peer option
    *
    * @param {string} key The option's key
    */
    remove: (key: string) => void;
}
