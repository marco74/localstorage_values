import { assert } from 'chai';
import localstorage_values from '../lib/localstorage_values';
import {store} from '../lib/localstorage_values';
import observer from 'ts-test-functions';

describe("storage", () => {
	let storage: localstorage_values;
	beforeEach(() => {
		storage = new localstorage_values('test');
	});
	afterEach(() => {
		delete store.test;
	})
	describe("get", () => {
		it("should return the value of the specified key", () => {
			assert(typeof storage.get("a") == 'undefined');
			store['test'] = '{"b":{"c":{"d":"anything"}}}';
			assert(typeof storage.get("a") == 'undefined');
			assert(storage.get('b.c.d') == 'anything');
		});
	});
	describe("set", () => {
		it("should set the specified value", () => {
			storage.set("e.f.g", 3);
			assert(JSON.parse(store.test).e.f.g === 3);
		});
	});
	describe("set with timeout", () => {
		it("should set the specified value which expires after given time", () => {
			storage.set("x", 3, 1000);
			let t0 = new Date().valueOf();
			return new Promise((resolve) => {
				storage.on('expired', (key, oldvalue) => {
					assert(key == 'x');
					assert(oldvalue == 3);
					assert(typeof storage.get(key) == 'undefined');
					let t1 = new Date().valueOf();
					assert(Math.abs(t1-t0-1000) < 10);
					resolve();
				});
			});
		});
	});

	describe("timeouts", () => {
		it("should be set when instance is recreated", () => {
			store['test_s1'] = JSON.stringify({
				y:42,
				__expirations__:{
					y:{
						expires_at:(new Date()).valueOf() + 1000
					}
				}
			});
			let t0 = new Date().valueOf();
			assert(JSON.parse(store['test_s1'])['y'] == 42);
			let s1 = new localstorage_values("test_s1");
			return new Promise((resolve) => {
				s1.on('expired', (key, oldvalue) => {
					assert(key == 'y');
					assert(oldvalue == 42);
					let t1 = new Date().valueOf();
					assert(Math.abs(t1-t0-1000) < 10);
					resolve();
				});
			});
		});
	});

	describe("remove", () => {
		it("should remove the specified value", () => {
			storage.set("h.i.j", 3);
			storage.remove("h.i.j");
			assert(typeof JSON.parse(store.test).h.i.j == 'undefined');
		});
	});
	describe("clear", () => {
		it("should remove all values", () => {
			storage.set('a', 3);
			storage.set('b', 4);
			storage.clear();
			assert(typeof storage.get('a') == 'undefined');
			assert(typeof storage.get('b') == 'undefined');
		})
	})
})
