#!/usr/bin/env node

/**
 * yb-core-svgr-converter
 * Converts SVG file into SVGr file
 *
 * @author Raja Vijaya Kumar <https://github.com/rajavijayakumar-r>
 */

const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

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

    const yb_core_icon_git_url = 'https://github.com/credavenue/yb-core-icon'
    const yb_core_icon_dir_name = 'yb-core-icon'

    try {
        console.log(`Clonning repository '${yb_core_icon_git_url}'...`);
        await exec(`git clone -b cli_temp ${yb_core_icon_git_url} ${yb_core_icon_dir_name}`)
        console.log('Repository cloned successfully');

        console.log(`Copying converted svg files into yb-core-icon project...`);
        await exec(`cp -R dest_svgr/* yb-core-icon/src/svgr/`)

        console.log(`Updating iconIndex.ts...`);
        await exec(`./add-icons-index.sh`)

        console.log(`Updating readme.md...`);
        await exec(`./add-icons-readme.sh`)

        console.log(`Updating version...`);
        await exec(`./version-incrementor.sh`)

        console.log(`Adding all uncommited files`);
        await exec(`cd yb-core-icon && git add .`)

        console.log(`Git Status`);
        await exec(`cd yb-core-icon && git status`)

        const packageJson = require('./yb-core-icon/package.json')
        const version = packageJson.version

        const readdir = util.promisify(fs.readdir)
        const filenames = await readdir('./src_svg/')
        const prettifiedFileNames = filenames.reduce((pre, crnt) => {
            const val = pre + '\n' + crnt
            return val
        })
        
        const commitHeader = `CLI UPDATE: v${version}`
        const commitDescription = `Version:- ${version} \n Added Files: \n ${prettifiedFileNames}`

        console.log(`commiting...`);
        console.log(commitHeader + '\n' + commitDescription)
        await exec(`cd yb-core-icon && git commit -m '${commitHeader}' -m '${commitDescription}'`)

        console.log('Pushing to cli_update');
        await exec(`cd yb-core-icon && git push`)

        console.log('cleaning up...')
        console.log('Deleting Project folder: yb-core-icon...')
        await exec(`rm -rf yb-core-icon/`)

        console.log('Deleting svg folder...')
        await exec(`rm -rf src_svg/`)

        console.log('Deleting svgr folder...')
        await exec(`rm -rf dest_svgr/`)

        console.log('generating required directories...')
        await exec(`mkdir dest_svgr/`)
        await exec(`mkdir src_svg/`)

        console.log('Updated ICONS successfully. Check out https://github.com/credavenue/yb-core-icon/')

    } catch (error) {
        console.error(error)
    }

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
