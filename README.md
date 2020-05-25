# Library to manage localstorage_values

## Usage
```javascript
import localstorage_values from './dist/index.es.js'

//Register key 'test' in localStorage as storage key
const storage = new localstorage_values('test');

storage.set('x', 3); //set value 'x'
storage.get('x'); //3

storage.set('foo.bar', 42);
storage.get('foo'); // => {bar:42}

storage.set('foo.bar', 42, 2); //value will expire after 2 seconds after setting

storage.on('set', (key, newvalue, oldvalue) => {
	//will be called when value is set
});

storage.on('remove', (key, oldvalue) => {
	//will be called when value is removed
});

storage.on('expired', (key, oldvalue) => {
	//will be called when value expires
});
```