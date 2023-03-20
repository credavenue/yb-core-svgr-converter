#!/usr/bin/env node

/**
 * yb-core-svgr-converter
 * Converts SVG file into SVGr file
 *
 * @author Raja Vijaya Kumar <https://github.com/rajavijayakumar-r>
 */


const {
	SVG_SRC_DIR,
	SVGR_SRC_DIR,
	SVG_SRC_PATH,
	SVGR_DEST_PATH,
	CORE_ICON_REPO_NAME,
	CORE_ICON_DIR
} = require('./constants')

const fs = require('fs').promises;
const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');
const { spawn } = require('child_process')

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const input = cli.input;
const flags = cli.flags;
const { clear, debug, deleteIcons, updateIcons, addIcons } = flags;

(async () => {
	init({ clear });
	console.log('inputs:- ', input)
	console.log('flags:- ', flags)

	if (!addIcons && !deleteIcons && !updateIcons) {
		console.log('No Flags provided. Provide one flag. i.e:- --addIcons --updateIcons --deleteIcons')
		return
	}

	if (addIcons && updateIcons) {
		console.log('Cannot have both add and update operations. Please selece any one')
		return
	}

	if (addIcons && deleteIcons) {
		console.log('Cannot have both add and delete operations. Please selece any one')
		return
	}

	if (deleteIcons && updateIcons) {
		console.log('Cannot have both delete and update operations. Please selece any one')
		return
	}

	if (deleteIcons && input.length <= 0) {
		console.log('No Icons to delete. Please provide icon names to delete')
		return
	}

	let isKebabCase = true
	const kebabCaseRegex = /^[a-z0-9]+(-[a-z0-9]+)*\.svg$/;

	const files = await fs.readdir(SVG_SRC_PATH)
	files.forEach((file) => {
		if (!kebabCaseRegex.test(file)) {
			isKebabCase = false
		}
	})

	if (!isKebabCase) {
		console.log('One or more icon file are not in kebab case. Please change the file name and try again.')
		return
	}

	if (addIcons || updateIcons) {
		let svgrArgs = [
			SVG_SRC_PATH, 
			'--template', 'custom-template.js', 
			'--out-dir', SVGR_DEST_PATH, 
			'--no-svgo', 
			'--filename-case', 'kebab', 
			'--no-index', 
			'--native'
		]

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

				// Add Logic to upload the svg files first in promise to server before running the master updater.

				let arr = []
				if (addIcons) {
					arr = ['--addIcons']
				}
				if (updateIcons) {
					arr = ['--updateIcons']
				}
				const masterUpdater = spawn('./master-updater.js', arr)
				console.log(`Starting master updater...`);

				masterUpdater.stdout.on('data', (data) => {
					console.log(`stdout: ${data}`)
				})

				// Handle errors from the "svgr" command
				masterUpdater.stderr.on('data', async (data) => {
					console.error(`stderr: ${data}`);

					console.log('rolling back...')

					console.log('Deleting svg folder...')
					await exec(`rm -rf ${SVG_SRC_DIR}/`)
					console.log('done...!')

					console.log('Deleting svgr folder...')
					await exec(`rm -rf ${SVGR_SRC_DIR}/`)
					console.log('done...!')

					console.log('generating required directories...')
					await exec(`mkdir ${SVGR_SRC_DIR}/`)
					await exec(`mkdir ${SVG_SRC_DIR}/`)
					console.log('done...!')

					console.log(`Deleting Project folder: ${CORE_ICON_REPO_NAME}...`)
					await exec(`rm -rf ${CORE_ICON_DIR}`)
					console.log('done...!')
				});

				masterUpdater.on('exit', (code) => {
					console.log(`done with exit code: ${code}`);
				})
			}
		});
	}

	if (deleteIcons) {

		// Add Logic to upload the svg files first in promise to server before running the master updater.

		const masterUpdater = spawn('./master-updater.js', ['--deleteIcons', ...input])
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

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
