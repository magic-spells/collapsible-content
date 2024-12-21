import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import serve from "rollup-plugin-serve";
import copy from "rollup-plugin-copy";
import postcss from "rollup-plugin-postcss";

const dev = process.env.ROLLUP_WATCH;

export default [
	// Development build
	{
		input: "src/collapsible-content.js",
		output: {
			file: "dist/collapsible-content.js",
			format: "iife",
			sourcemap: dev,
		},
		plugins: [
			resolve(),
			postcss({
				extract: "collapsible-content.min.css", // Extracts the CSS to a separate file
				minimize: true,
			}),
			dev &&
				serve({
					contentBase: ["dist", "demo"],
					open: true,
					port: 3000,
				}),
			copy({
				targets: [
					{ src: "dist/collapsible-content.js", dest: "demo" },
					{ src: "dist/collapsible-content.min.css", dest: "demo" },
				],
				hook: "writeBundle",
			}),
		],
	},
	// Production build (minified)
	{
		input: "src/collapsible-content.js",
		output: {
			file: "dist/collapsible-content.min.js",
			format: "iife",
			sourcemap: false,
		},
		plugins: [
			resolve(),
			postcss({
				extract: "dist/collapsible-content.min.css", // Minified CSS output
				minimize: true,
			}),
			terser({
				format: {
					comments: false,
				},
			}),
		],
	},
];
