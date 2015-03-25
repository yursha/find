#!/usr/bin/env node

/**
 * Searches a keyword in file names in a directory (recursively)
 *
 * Algorithm:
 *
 * 1. Process arguments
 * 1.1. Parse arguments
 * 1.1.1. Argument 0 is a keyword to search
 * 1.1.2. Argument 1 is a directory name to search under
 * 1.1.3. Canonicalize arg 1
 * 1.2. Validate arguments
 * 1.2.1. Argument 1 must be an existent file system path (realpath)
 * 1.2.1. Argument 1 must be a directory name
 * 2. Search in a directory
 * 2.1. Read directory
 * 2.2. Process each directory entry
 * 2.2.1. Add directory entry to results if it contains the keyword
 * 2.2.2. If it is a directory search in it recursively (goto 2) 
 */

/*
 * Globals
 */

var fs = require('fs')
var log = require('y-log')

/**
 * keyword to search for in file names
 */
var keyword

/**
 * folder to search in
 */
var folder

function processArgs (args) {
    var args = process.argv.slice(2) // strip node and program names
    keyword = args[0]
    folder = args[1] || '.'
    fs.realpath(folder, function (err, resolvedPath) {
    if (err) {
        log.error('Cannot resolve path: ' + dir + ' ' + JSON.stringify(error))
    } else {
        examinePath(resolved)
    }
})
    
}

function searchDir (dir) {
    
}

/*
 * Examines a resolved filesystem path.  Arguments:
 *
 *    err            Error if path was not resolved
 *
 *    tcpPort        a positive integer representing a valid TCP port
 *
 *    timeout        a positive integer denoting the number of milliseconds
 *                   to wait for a response from the remote server before
 *                   considering the connection to have failed.
 *
 *    callback       invoked when the connection succeeds or fails.  Upon
 *                   success, callback is invoked as callback(null, socket),
 *                   where `socket` is a Node net.Socket object.  Upon failure,
 *                   callback is invoked as callback(err) instead.
 *
 * This function may fail for several reasons:
 *
 *    SystemError    For "connection refused" and "host unreachable" and other
 *                   errors returned by the connect(2) system call.  For these
 *                   errors, err.errno will be set to the actual errno symbolic
 *                   name.
 *
 *    TimeoutError   Emitted if "timeout" milliseconds elapse without
 *                   successfully completing the connection.
 *
 * All errors will have the conventional "remoteIp" and "remotePort" properties.
 * After any error, any socket that was created will be closed.
 */
function examinePath(resolved) {
    checkdir(resolved, function (checked) {
        fileInfo(checked, function (info) {
            if (!info.isDirectory()) {
                log.error(checked + ' is not a directory');
            } else {
                log.info('Searching in ' + checked);
                traverseDirectory(checked);
            }
        })
    })
}
/**
 * Recursive
 *
 * Error: 
 * Error:
 */
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
                            fs.realpath(dir, function (err, resolvedPath) {
                                if (err) {
                                    log.error('Cannot resolve path: ' + dir + ' ' + JSON.stringify(error))
                                } else {
                                    checkdir(path, traverseDirectory) // recurse here
                                }
                            } else {
                                if (element.indexOf(what) !== -1) {
                                    log.success(path);
                                }
                            })
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

/**
 * Handles all errors caused by call to fs.lstat().
 *
 * @param String path File system path to get info about.
 * @param Callback onSuccess(stats) Will be invoked on successed and passed a parameter containing file info.
 *
 * @error ENOENT Signals attempt to follow a broken symbolik link.
 * @error EACCESS Signals attempt to read information about a file with insufficient permissions.
 * @error EBADF Signals attempt to read information about a file which is not a valid file.
 *
 * @returns Void
 */
function fileInfo(path, onSuccess) {
    // validate the types of all arguments here
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
            onSuccess(stats)
        }
    })
}

/**
 * Checks if the search is allowed in the path and fires a callback on success.
 */
function checkdir(dir, onSuccess) {
    var dirsToCheck = skipRoots.length
    skipRoots.forEach(function (dirToCheck) {
        if (resolvedPath.indexOf(dirToCheck) == 0) { // TODO: string.startsWith()
            log.warn('Sorry, we don\'t search in [' + resolvedPath + ']')
        } else {
            if (--dirsToCheck == 0) { // none of forbidden directories matched
                onSuccess(resolvedPath);
            }
        }
    })
}