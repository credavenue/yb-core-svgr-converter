#!/usr/bin/env node

/**
 * yb-core-svgr-converter
 * Converts SVG file into SVGr file
 *
 * @author Raja Vijaya Kumar <https://github.com/rajavijayakumar-r>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const { spawn } = require('child_process')

const input = cli.input;
const flags = cli.flags;
const { clear, debug, avoidNative } = flags;

(async () => {
	init({ clear });
	console.log(input)
	console.log(flags)
	console.log("printing nonNative: ", avoidNative)

	let svgrArgs = ['./src_svg', '--template', 'custom-template.js',  '--out-dir', './dest_svgr', '--no-svgo', '--filename-case', 'kebab', '--no-index']
	if (!avoidNative) {
		svgrArgs.push('--native')
	}
	const svgr = spawn('svgr', svgrArgs);

	svgr.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`)
	})

	// Handle errors from the "svgr" command
	svgr.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});

	// Handle the "exit" event for the "svgr" command
	svgr.on('exit', async (code) => {
		console.log(`child process exited with code ${code}`);
		if (code === 0) {
			const masterUpdater = spawn('./master-updater.js', [])
			console.log(`Starting master updater...`);

			masterUpdater.stdout.on('data', (data) => {
				console.log(`stdout: ${data}`)
			})
		
			// Handle errors from the "svgr" command
			masterUpdater.stderr.on('data', (data) => {
				console.error(`stderr: ${data}`);
			});

			masterUpdater.on('exit', (code) => {
				console.log(`done with exit code: ${code}`);
			})
		}
	});

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
