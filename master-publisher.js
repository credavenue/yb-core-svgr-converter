#!/usr/bin/env node

/**
 * yb-core-svgr-converter
 * Converts SVG file into SVGr file
 *
 * @author Raja Vijaya Kumar <https://github.com/rajavijayakumar-r>
 */

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');

const input = cli.input;
const flags = cli.flags;
const { clear, debug, avoidNative } = flags;

(async () => {
	init({ clear });
	console.log(input)
	console.log(flags)
	console.log("printing nonNative: ", avoidNative)

    const yb_core_icon_git_url = 'https://github.com/credavenue/yb-core-icon'
    const yb_core_icon_dir_name = 'yb-core-icon'

    try {
        console.log(`Clonning repository '${yb_core_icon_git_url}'...`);
        await exec(`git clone -b cli_temp ${yb_core_icon_git_url} ${yb_core_icon_dir_name}`)
        console.log('Repository cloned successfully');

        const packageJson = require('./yb-core-icon/package.json')
        const version = packageJson.version        

        console.log('Installing node modules...');
        await exec(`cd yb-core-icon && yarn install`)

        console.log('Building...');
        await exec(`cd yb-core-icon && yarn build`)

        console.log('Publishing...');
        await exec(`cd yb-core-icon && npm publish`)

        console.log('Successfully published Icon Componnet. Version:- ', version)
    } catch (error) {
        console.error(error)
    }

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
