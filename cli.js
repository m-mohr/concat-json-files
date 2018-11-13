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

let sourceFolder, targetFile;

program
	.version(packageInfo.version)
	.arguments('<sourceFolder> <targetFile>')
	.action((s, t) => {
		sourceFolder = path.resolve(s);
		targetFile = path.resolve(t);
	})
	.parse(process.argv);

mkdirp(path.dirname(targetFile), err => {
	if (err) {
		return showErrorAndExit(err);
	}

	glob(sourceFolder, {realpath: true}, (err, files) => {
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