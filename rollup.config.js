// https://hackernoon.com/building-and-publishing-a-module-with-typescript-and-rollup-js-faa778c85396
import pkg from './package.json'

export default {
	input: 'tsc-build/localstorage_values.js',
	output: [
		{
			file:pkg.module,
			format:'es',
			exports:'named'
		},
		// {
			// file:pkg.main,
			// format:'cjs',
			// exports:'named'
		// }
	]
}