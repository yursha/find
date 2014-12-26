#!/usr/bin/env node

/**
 * Searches a file in a directory (recursively)
 */

var fs = require('fs')
var log = require('y-log')

var args = process.argv.slice(2); // strip node and program names
var what = args[0];
var where = args[1] || '.';

var skipRoots = ['/dev', '/private']

checkdir(where, function (resolved) {
    fileInfo(resolved, function (info) {
        if (!info.isDirectory()) {
            log.error(resolved + ' is not a directory');
        } else {
            log.info('Searching in ' + resolved);
            traverseDirectory(resolved);
        }
    })
})


function traverseDirectory(dir) {
    fs.readdir(dir, function (err, files) {
        if (err) {
            if (err.code == 'EACCES') {
                log.warn('Access forbidden: ' + dir)
            } else {
                log.dunno(err)
            }
        } else {
            files.filter(function (item) {
                return item !== '.' && item !== '..'
            })
                .forEach(function (element, index, array) {
                    var path = glue(dir, element)
                    fileInfo(path, function (info) {
                        if (info.isDirectory()) {
                            checkdir(path, traverseDirectory) // recurse here
                        } else {
                            if (element.indexOf(what) !== -1) {
                                log.success(path);
                            }
                        }
                    })
                })
        }
    })
}

function glue(folder, file) {
    if (folder == '/') {
        return '/' + file
    } else {
        return folder + '/' + file
    }
}

function fileInfo(path, fn) {
    fs.lstat(path, function (err, stats) {
        if (err) {
            if (err.code == 'ENOENT') {
                log.warn('Broken link: ' + path)
            } else if (err.code == 'EACCES') {
                log.warn('Access forbidden: ' + path)
            } else if (err.code == 'EBADF') {
                log.warn('Not a valid open file: ' + path)
            } else {
                log.dunno(err)
            }
        } else {
            fn(stats)
        }
    })
}

function checkdir(dir, fn) {
    fs.realpath(dir, function (err, resolvedPath) {
        if (err) {
            log.error('Cannot resolve path: ' + dir + ' ' + JSON.stringify(error))
        }
        var ndirs = skipRoots.length
        skipRoots.forEach(function (item) {
            if (resolvedPath.indexOf(item) == 0) {
                log.warn('Sorry, we don\'t search in [' + resolvedPath + ']')
            } else {
                if (--ndirs == 0) { // none of forbidden directories matched
                    fn(resolvedPath);
                }
            }
        })
    })
}