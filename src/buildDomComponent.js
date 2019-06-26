let rollup = require("rollup");
let svelte = require("rollup-plugin-svelte");
let resolve = require("rollup-plugin-node-resolve");
let commonjs = require("rollup-plugin-commonjs");
let {terser} = require("rollup-plugin-terser");
let requireFromString = require("require-from-string");
let fs = require("flowfs");
let merge = require("lodash.merge");

/*
input: path to a .svelte file

output: client-side Svelte component bundle as a string of JS in IIFE format;
and an array of files to watch for changes
*/

module.exports = async (path, options, cache) => {
	let inputOptions = {
		input: path,
		cache,
		plugins: [
			svelte(merge({
				hydratable: true,
			}, options.svelte)),
	
			resolve({
				browser: true
			}),
			
			commonjs(),
	
			options.minify && terser()
		]
	};
	
	let outputOptions = {
		format: "iife",
		name: fs(path).basename,
	};
	
	let t = new Date().valueOf();
	let bundle = await rollup.rollup(inputOptions);
	console.log("dom " + (new Date().valueOf() - t));
	
	t = new Date().valueOf();
	let {output} = await bundle.generate(outputOptions);
	console.log("dom " + (new Date().valueOf() - t));
	
	return {
		cache: bundle.cache,
		js: output[0],
		watchFiles: bundle.watchFiles,
	};
}
