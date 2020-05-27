import eventemitter from './ee';

export const store: {
	[key:string]:string
} = {};

class storage {
	public key(n:number):string | null {
		return Object.keys(store)[n] || null;
	}
	public getItem(key:string):string|null {
		return store[key] || null;
	}
	public setItem(key:string, value:string):void {
		store[key] = value;
	}
	public removeItem(key:string):void {
		delete store[key];
	}
	public clear():void {
		for (let key in store) {
			delete store[key];
		}
	}
};

let localStorage:storage;

if (typeof window == 'undefined') {
	localStorage = new storage();
} else {
	localStorage = window.localStorage;
}

export default class localstorage_values extends eventemitter {
	private storage_key:string;
	private prefix_path:string[];
	private storage = localStorage;
	private timeouts:{[key:string]:any} = {};
	constructor (storage_key:string, option_prefix?:string) {
		super();
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
	private get_storevalue(): {[key:string]:any} {
		const store_value = this.storage.getItem(this.storage_key);
		return store_value && JSON.parse(store_value) || {};
	}

	/**
	* Gets a persistent remote_peer option
	* 
	* @param {string} key The option's key
	*/
	public get = (key: string):any => {
		return this.prefix_path.concat(key.split('.'))
			.reduce(
				(c, n) => c && c[n],
				this.get_storevalue()
			) || undefined;
	}

	/**
	 * Sets timeout for specified key or for all necessary keys
	 * 
	 * @param key key for which to set timeout
	 */
	private settimeout(key?:string):void {
		const expirations = this.get_storevalue().__expirations__ || {};
		
		let set_singletimeout = (key:string) => {
			if (key in expirations && (!(key in this.timeouts))) {
				let now = (new Date()).valueOf();
				let milliseconds = expirations[key].expires_at - now;
				this.timeouts[key] = setTimeout(() => {
					const oldvalue = this.get(key);
					const data = this.get_storevalue();
					delete data[key];
					delete data['__expirations__'][key];

					this.storage.setItem(this.storage_key, JSON.stringify(data));

					this.emit('expired', key, oldvalue);
				}, milliseconds);
			}
		}
		
		key &&
			set_singletimeout(key) ||
			Object.keys(expirations).forEach(set_singletimeout);
	}

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
	public set = (key: string, value: any, milliseconds?: number):any => {
		const data = this.get_storevalue();

		const path = key.split('.');
		const last_key:string = path.pop() || '';
		
		// walk along the path
		const dict = this.prefix_path.concat(path)
			.reduce((c, n) => {
				if (typeof c[n] == 'undefined') {
					c[n] = {};
				}
				return c[n]
			}, data);

		// get old value
		const oldvalue = dict[last_key];

		// set new value
		dict[last_key] = value;

		// expiration_date
		delete this.timeouts[key];
		data['__expirations__'] = data['__expirations__'] || {};
		delete data.__expirations__[key]

		if (typeof milliseconds != 'undefined') {
			let expires_at = (new Date()).valueOf() + milliseconds;
			data['__expirations__'][key] = {
				expires_at
			};
		}

		// save data
		this.storage.setItem(this.storage_key, JSON.stringify(data));

		// settimeout
		this.settimeout(key);

		// emit event
		this.emit('set', key, value, oldvalue);
	
		return value;
	}
	
	private delete = (key:string):any => {
		const data = this.get_storevalue();

		const path = key.split('.');
		const last_key = path.pop() || '';

		// walk along the path
		const dict = this.prefix_path.concat(path)
			.reduce((c, n) => {
				if (typeof c[n] == 'undefined') {
					c[n] = {};
				}
				return c[n]
			}, data);

		// get old value
		const oldvalue = dict[last_key];

		// set new value
		delete dict[last_key];

		// save data
		this.storage.setItem(this.storage_key, JSON.stringify(data));
		
		return oldvalue;
	}

	/**
	* Removes a persistent remote_peer option
	* 
	* @param {string} key The option's key
	*/
	public remove = (key:string) => {
		let oldvalue = this.delete(key);

		// emit event
		this.emit('remove', key, oldvalue);
	}
	
	public clear = () => {
		this.storage.setItem(this.storage_key, '{}');
	}
}
