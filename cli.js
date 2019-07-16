#!/usr/bin/env node

const program = require('commander');
const glob = require('glob');
const packageInfo = require('./package.json');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const showErrorAndExit = err => {
	console.error(red('Something went wrong:'));
	console.error(red(err.stack || err.message));
	process.exit(1);
};

let source;

program
	.version(packageInfo.version)
	.arguments('<source>')
	.option('-t, --target <target>', 'Target file relative from working directory, defaults to "concat.json"')
	.action((s) => {
		source = s;
	})
	.parse(process.argv);

let targetFile = "concat.json";
if (typeof program.target === 'string') {
	targetFile = program.target;
}
let targetFolder = path.dirname(path.resolve(targetFile));
mkdirp(targetFolder, err => {
	if (err) {
		return showErrorAndExit(err);
	}

	glob(source, {realpath: true}, (err, files) => {
		if (err) {
			return showErrorAndExit(err);
		}

		if (!Array.isArray(files) || files.length == 0) {
			throw new Error("No files in folder.");
		}

		var data = [];
		for (var i in files) {
			let file = files[i];
			try {
				data.push(JSON.parse(fs.readFileSync(file)));
			} catch(err) {
				throw new Error("File '" + file + "' is not a valid JSON file.");
			}
		}
		fs.writeFileSync(targetFile, JSON.stringify(data, null, 2));

		console.log('Done! Check out your new file at:');
		console.log(targetFile);
	});
});

process.on('unhandledRejection', showErrorAndExit);