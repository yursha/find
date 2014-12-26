#!/usr/bin/env node

/**
 * Searches a file in a directory (recursively)
 */

var fs = require('fs')
var log = require('y-log')

var args = process.argv.slice(2); // strip node and program names
var what = args[0];
var where = args[1] || '.';

fs.stat(where, function (err, stats) {
	if (err) {
		console.error(err);
	} else {
		if (!stats.isDirectory()) {
			log.error(dir + ' is not a directory');
		} else {
            log.info('Searching in ' + where);
			traverseDirectory(where);
		}
	}
})

function traverseDirectory (dir) {
	fs.readdir(dir, function (err, files) {
		if (err) {
			console.error(err)
		} else {
			files.forEach(function (element, index, array) {
				fs.stat(dir + '/' + element, function (err, stats) {
					if (err) {
						console.error(err)
					} else {
						if (stats.isDirectory()) {
							traverseDirectory(dir + '/' + element) // recurse here
						} else {
                            if (element.indexOf(what) !== -1) {
                                log.success(dir + '/' + element);
                            }
						}
					}
				})
			})
		}
	})
}