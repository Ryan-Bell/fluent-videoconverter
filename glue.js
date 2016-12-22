'use strict'
const ffmpeg        = require('ffmpeg.js');
let   ffmpegCommand = require('fluent-ffmpeg');
const fs            = require('fs');
const utils         = require('./node_modules/fluent-ffmpeg/lib/utils');

//remove the ffmpeg path related functions
delete ffmpegCommand.prototype.setFfmpegPath;
delete ffmpegCommand.prototype.setFfprobePath;
delete ffmpegCommand.prototype.setFlvtoolPath;
delete ffmpegCommand.prototype._forgetPaths;
delete ffmpegCommand.prototype._getFfmpegPath;
delete ffmpegCommand.prototype._getFfprobePath;
delete ffmpegCommand.prototype._getFlvtoolPath;

ffmpegCommand.prototype._spawnFfmpeg = function(args, options, processCB, endCB){
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
		//TODO: check that the niceness argument is not backwards
		if (options.niceness && options.niceness !== 0 && !utils.isWindows)
			args.unshift('-n', options.niceness);

		var stdoutRing = utils.linesRing(maxLines);
		var stdoutClosed = false;

		var stderrRing = utils.linesRing(maxLines);
		var stderrClosed = false;

		var processExited = false;

		//TODO: the name actually needs to come from the args
		var bufferData = new Uint8Array(fs.readFileSync('test.webm'));
		console.log(args);
		console.log(typeof args);
		var result = ffmpeg({
			MEMFS    : [{name: 'test.webm', data: bufferData }],
			arguments: args, 
			//TODO: these should be linked up with fluent-ffmpeg if possible
			print    : function(data){ console.log(data); },
			/*
					if (options.captureStdout) {
						stdoutRing.append(data);
					}
			*/
			printErr : function(data){ console.log(data); },
			/*
					stderrRing.append(data);
			*/
			//TODO: needed?
			stdin    : function(){},
			onExit: function(code){
				stdoutRing.close();
				stdoutClosed = true;

				stderrRing.close();
				stderrClosed = true;

				processExited = true;
				if (code) {
					handleExit();
					return;
					handleExit(new Error('ffmpeg exited with code ' + code));
				} else {
					handleExit();
				}
			}
		});

			var out = result.MEMFS[0];
			if(out){
				fs.writeFileSync(out.name, Buffer(out.data));
			}

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
			//TODO: determine the best way to actually call this (or if it doesn't need to be called)
			processCB(result, stdoutRing, stderrRing);
};

ffmpegCommand('test.webm').noAudio().save('out.webm');

module.exports = ffmpegCommand;
