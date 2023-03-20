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
	CORE_ICON_REPO_NAME,
    CORE_ICON_REPO_LINK
} = require('./constants')

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

    const yb_core_icon_git_url = CORE_ICON_REPO_LINK
    const yb_core_icon_dir_name = CORE_ICON_REPO_NAME

    try {
        console.log(`Clonning repository '${yb_core_icon_git_url}'...`);
        await exec(`git clone -b cli_temp ${yb_core_icon_git_url} ${yb_core_icon_dir_name}`)
        console.log('Repository cloned successfully');

        if (addIcons) {
            console.log(`Copying converted svg files into ${CORE_ICON_REPO_NAME} project...`);
            await exec(`cp -R ${SVGR_SRC_DIR}/* ${CORE_ICON_REPO_NAME}/src/svgr/`)
            console.log('done...!')
        }

        if (updateIcons) {
            console.log('Replacing Icons...')
            input.forEach(async iconName => {
                const jsIcon = iconName.replace(".svg", ".js")
                await exec(`rm ${CORE_ICON_REPO_NAME}/src/svgr/${jsIcon}`)
            });
            await exec(`cp -R ${SVGR_SRC_DIR}/* ${CORE_ICON_REPO_NAME}/src/svgr/`)
            console.log('done...!')
        }

        if (deleteIcons) {
            console.log('Deleting icons from src...!')
            input.forEach(async iconName => {
                const jsIcon = iconName.replace(".svg", ".js")
                await exec(`rm ${CORE_ICON_REPO_NAME}/src/svgr/${jsIcon}`)
            });
            console.log('done...!')
        }

        const readdir = util.promisify(fs.readdir)
        const filenames = await readdir(`${SVG_SRC_PATH}/`)
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
        console.log('done...!')

        const packageJson = require(`./${CORE_ICON_REPO_NAME}/package.json`)
        const version = packageJson.version

        if (addIcons) {
            console.log(`Updating iconIndex.ts...`);
            await exec(`./add-icons-index.sh ADD`)
            console.log('done...!')
        }

        if (deleteIcons) {
            console.log(`Updating iconIndex.ts... (delete operation)`);
            await exec(`./add-icons-index.sh DELETE ${iconNames}`)
            console.log('done...!')
        }

        if (addIcons) {
            console.log(`Updating readme.md...(add operation)`);
            await exec(`./add-icons-readme.sh ${version} ADD`)
            console.log('done...!')
        }

        if (updateIcons) {
            console.log(`Updating readme.md...(update operation)`);
            await exec(`./add-icons-readme.sh ${version} UPDATE`)
            console.log('done...!')
        }

        if (deleteIcons) {
            console.log(`Updating readme.md...(delete operation)`);
            await exec(`./add-icons-readme.sh ${version} DELETE ${iconNames}`)
            console.log('done...!')
        }

        console.log('Installing node modules...');
        await exec(`cd ${CORE_ICON_REPO_NAME} && yarn install`)
        console.log('done...!')

        console.log('Building...');
        await exec(`cd ${CORE_ICON_REPO_NAME} && yarn build`)
        console.log('done...!')

        console.log('Prepublish Validating...');
        await exec(`cd ${CORE_ICON_REPO_NAME} && yarn validate-before-publishing`)
        console.log('done...!')

        // Perform GIT operations only if the build is successful. 
        /* Note that yarn build will validate with prepublish validator and will know for sure 
           if the build can be published or not. If we experience any error we can rollback without
           having to cleanup anything in github */

        console.log(`Adding all uncommited files`);
        await exec(`cd ${CORE_ICON_REPO_NAME} && git add .`)
        console.log('done...!')

        console.log(`Git Status`);
        await exec(`cd ${CORE_ICON_REPO_NAME} && git status`)
        console.log('done...!')
        
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
        await exec(`cd ${CORE_ICON_REPO_NAME} && git commit -m '${commitHeader}' -m '${commitDescription}'`)
        console.log('done...!')

        console.log('Pushing to cli_update');
        await exec(`cd ${CORE_ICON_REPO_NAME} && git push`)
        console.log('done...!')

        console.log('Publishing...');
        await exec(`cd ${CORE_ICON_REPO_NAME} && npm publish`)
        console.log('done...!')

        console.log('cleaning up...')

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
        await exec(`rm -rf ${CORE_ICON_REPO_NAME}/`)
        console.log('done...!')

        console.log('Successfully published Icon Component. Version:- ', version)

        console.log('Updated ICONS successfully. Check out https://github.com/credavenue/yb-core-icon/')

    } catch (error) {
        console.error(error)
    }

	input.includes(`help`) && cli.showHelp(0);

	debug && log(flags);
})();
