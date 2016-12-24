'use strict'
let   ffmpegCommand = require('fluent-ffmpeg');
const utils         = require('./node_modules/fluent-ffmpeg/lib/utils');
var spawn = require('child_process').spawn;

//remove the ffmpeg path related functions
delete ffmpegCommand.prototype.setFfmpegPath;
delete ffmpegCommand.prototype.setFfprobePath;
delete ffmpegCommand.prototype.setFlvtoolPath;
delete ffmpegCommand.prototype._forgetPaths;
delete ffmpegCommand.prototype._getFfmpegPath;
delete ffmpegCommand.prototype._getFfprobePath;
delete ffmpegCommand.prototype._getFlvtoolPath;

ffmpegCommand.prototype._spawnFfmpeg = function(args, options, processCB, endCB) {
	// Enable omitting options
	if (typeof options === 'function') {
		endCB = processCB;
		processCB = options;
		options = {};
	}

	// Enable omitting processCB
	if (typeof endCB === 'undefined') {
		endCB = processCB;
		processCB = function() {};
	}

	var maxLines = 'stdoutLines' in options ? options.stdoutLines : this.options.stdoutLines;

	// Apply niceness
	if (options.niceness && options.niceness !== 0 && !utils.isWindows) {
		args.unshift('-n', options.niceness, command);
		command = 'nice';
	}

	var stdoutRing = utils.linesRing(maxLines);
	var stdoutClosed = false;

	var stderrRing = utils.linesRing(maxLines);
	var stderrClosed = false;

	// Spawn process
	args.unshift('./adapter.js');
	var ffmpegProc = spawn('node', args, options);

	if (ffmpegProc.stderr) {
		ffmpegProc.stderr.setEncoding('utf8');
	}

	ffmpegProc.on('error', function(err) {
		endCB(err);
	});

	// Ensure we wait for captured streams to end before calling endCB
	var exitError = null;
	function handleExit(err) {
		if (err) {
			exitError = err;
		}

		if (processExited && (stdoutClosed || !options.captureStdout) && stderrClosed) {
			endCB(exitError, stdoutRing, stderrRing);
		}
	}

	// Handle process exit
	var processExited = false;
	ffmpegProc.on('exit', function(code, signal) {
		processExited = true;

		if (signal) {
			handleExit(new Error('ffmpeg was killed with signal ' + signal));
		} else if (code) {
			handleExit(new Error('ffmpeg exited with code ' + code));
		} else {
			handleExit();
		}
	});

	// Capture stdout if specified
	if (options.captureStdout) {
		ffmpegProc.stdout.on('data', function(data) {
			stdoutRing.append(data);
		});

		ffmpegProc.stdout.on('close', function() {
			stdoutRing.close();
			stdoutClosed = true;
			handleExit();
		});
	}

	// Capture stderr if specified
	ffmpegProc.stderr.on('data', function(data) {
		stderrRing.append(data);
	});

	ffmpegProc.stderr.on('close', function() {
		stderrRing.close();
		stderrClosed = true;
		handleExit();
	});

	// Call process callback
	processCB(ffmpegProc, stdoutRing, stderrRing);
};

module.exports = ffmpegCommand;
