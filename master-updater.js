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
const { clear, debug, avoidNative, deleteIcons, updateIcons, addIcons } = flags;

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

        if (addIcons) {
            console.log(`Copying converted svg files into yb-core-icon project...`);
            await exec(`cp -R dest_svgr/* yb-core-icon/src/svgr/`)
        }

        if (updateIcons) {
            input.forEach(async iconName => {
                const jsIcon = iconName.replace(".svg", ".js")
                await exec(`rm yb-core-icon/src/svgr/${jsIcon}`)
            });
            await exec(`cp -R dest_svgr/* yb-core-icon/src/svgr/`)
        }

        if (deleteIcons) {
            input.forEach(async iconName => {
                const jsIcon = iconName.replace(".svg", ".js")
                await exec(`rm yb-core-icon/src/svgr/${jsIcon}`)
            });
        }

        const readdir = util.promisify(fs.readdir)
        const filenames = await readdir('./src_svg/')
        const prettifiedFileNames = filenames.length > 0 ? filenames.reduce((pre, crnt) => {
            const val = pre + '\n' + crnt
            return val
        }) : ""
        const iconNames = input.length > 0 ? input.reduce((pre, current) => {
            const val = pre + " " + current
            return val
        }) : ""

        console.log(`Updating version...`);
        await exec(`./version-incrementor.sh`)

        const packageJson = require('./yb-core-icon/package.json')
        const version = packageJson.version

        if (addIcons) {
            console.log(`Updating iconIndex.ts...`);
            await exec(`./add-icons-index.sh ADD`)
        }

        if (deleteIcons) {
            console.log(`Updating iconIndex.ts... (delete operation)`);
            await exec(`./add-icons-index.sh DELETE ${iconNames}`)
        }

        if (addIcons) {
            console.log(`Updating readme.md...(add operation)`);
            await exec(`./add-icons-readme.sh ${version} ADD`)
        }

        if (updateIcons) {
            console.log(`Updating readme.md...(update operation)`);
            await exec(`./add-icons-readme.sh ${version} UPDATE`)
        }

        if (deleteIcons) {
            console.log(`Updating readme.md...(delete operation)`);
            await exec(`./add-icons-readme.sh ${version} DELETE ${iconNames}`)
        }

        console.log(`Adding all uncommited files`);
        await exec(`cd yb-core-icon && git add .`)

        console.log(`Git Status`);
        await exec(`cd yb-core-icon && git status`)
        
        let commitHeader = ""
        let commitDescription = ""

        if (addIcons) {
            commitHeader = `CLI ADD Icons: v${version}`
            commitDescription = `Version:- ${version} \n Added Files: \n ${prettifiedFileNames}`
        }

        if (updateIcons) {
            commitHeader = `CLI UPDATE Icons: v${version}`
            commitDescription = `Version:- ${version} \n Updated Files: \n ${prettifiedFileNames}`
        }

        if (deleteIcons) {
            commitHeader = `CLI DELETE Icons: v${version}`
            commitDescription = `Version:- ${version} \n Deleted Files: \n ${prettifiedFileNames}`
        }

        console.log(`commiting...`);
        console.log(commitHeader + '\n' + commitDescription)
        await exec(`cd yb-core-icon && git commit -m '${commitHeader}' -m '${commitDescription}'`)

        console.log('Pushing to cli_update');
        await exec(`cd yb-core-icon && git push`)

        console.log('Installing node modules...');
        await exec(`cd yb-core-icon && yarn install`)

        console.log('Building...');
        await exec(`cd yb-core-icon && yarn build`)

        console.log('Publishing...');
        await exec(`cd yb-core-icon && npm publish`)

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

        console.log('Successfully published Icon Componnet. Version:- ', version)

        console.log('Updated ICONS successfully. Check out https://github.com/credavenue/yb-core-icon/')

    } catch (error) {
        console.error(error)
    }

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
