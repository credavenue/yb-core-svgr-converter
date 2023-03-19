const meow = require('meow');
const meowHelp = require('cli-meow-help');

const flags = {
	clear: {
		type: `boolean`,
		default: false,
		alias: `c`,
		desc: `Clear the console`
	},
	noClear: {
		type: `boolean`,
		default: false,
		desc: `Don't clear the console`
	},
	debug: {
		type: `boolean`,
		default: false,
		alias: `d`,
		desc: `Print debug info`
	},
	version: {
		type: `boolean`,
		alias: `v`,
		desc: `Print CLI version`
	},
	avoidNative: {
		type: `boolean`,
		default: false,
		alias: `x`,
		desc: `Converts only for React and discards the support of react-native-svg`
	},
	deleteIcons: {
		type: `boolean`,
		default: false,
		desc: `Used to delete the existing Icons. Usage delete [array of icon.svg names]`
	},
	updateIcons: {
		type: `boolean`,
		default: false,
		desc: `Used to update the existing Icons`
	},
	addIcons: {
		type: `boolean`,
		default: false,
		desc: `Used to add new Icons`
	}
};

const commands = {
	help: { desc: `Print help info` }
};

const helpText = meowHelp({
	name: `yb-svgr-converter`,
	flags,
	commands
});

const options = {
	inferType: true,
	description: false,
	hardRejection: false,
	flags
};

module.exports = meow(helpText, options);
