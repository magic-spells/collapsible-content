import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';

const dev = process.env.ROLLUP_WATCH;

// Shared CSS plugin config to avoid duplicate processing
const cssPlugin = postcss({
	extract: 'collapsible-content.min.css',
	minimize: true,
});

export default [
	// ESM build
	{
		input: 'src/collapsible-content.js',
		output: {
			file: 'dist/collapsible-content.esm.js',
			format: 'es',
			sourcemap: true,
		},
		plugins: [resolve(), cssPlugin],
	},
	// CommonJS build
	{
		input: 'src/collapsible-content.js',
		output: {
			file: 'dist/collapsible-content.cjs.js',
			format: 'cjs',
			sourcemap: true,
			exports: 'named',
		},
		plugins: [resolve(), cssPlugin],
	},
	// Minified IIFE for browsers
	{
		input: 'src/collapsible-content.js',
		output: {
			file: 'dist/collapsible-content.min.js',
			format: 'iife',
			name: 'CollapsibleContent',
			sourcemap: false,
		},
		plugins: [
			resolve(),
			cssPlugin,
			terser({
				keep_classnames: true,
				format: {
					comments: false,
				},
			}),
		],
	},
	// Development build
	...(dev
		? [
				{
					input: 'src/collapsible-content.js',
					output: {
						file: 'dist/collapsible-content.esm.js',
						format: 'es',
						sourcemap: true,
					},
					plugins: [
						resolve(),
						cssPlugin,
						serve({
							contentBase: ['dist', 'demo'],
							open: true,
							port: 3000,
						}),
						copy({
							targets: [
								{
									src: 'dist/collapsible-content.esm.js',
									dest: 'demo',
								},
								{
									src: 'dist/collapsible-content.esm.js.map',
									dest: 'demo',
								},
								{
									src: 'dist/collapsible-content.min.css',
									dest: 'demo',
								},
							],
							hook: 'writeBundle',
						}),
					],
				},
			]
		: []),
];
