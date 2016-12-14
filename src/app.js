'use strict'
const ffmpeg = require('ffmpeg.js');
//TODO: These paths suck
//TODO: get rid of path manip and replace command in spawn_ffmpeg
const vcpath = process.cwd() + '/node_modules/videoconverter/build/ffmpeg-all-codecs.js';


var ffmpegCommand = require('fluent-ffmpeg');
const utils = require('../node_modules/fluent-ffmpeg/lib/utils');

//TODO these shouldn't be needed and should be removed
ffmpegCommand.setFfmpegPath(vcpath);
ffmpegCommand.setFfprobePath(vcpath);
ffmpegCommand.setFlvtoolPath(vcpath);

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

      // Spawn process
			var result = ffmpeg({
				arguments: args,
				print: function(data){
					if (options.captureStdout) {
						stdoutRing.append(data);
					}
				},
				printErr: function(data){
					stderrRing.append(data);
				},
				onExit: function(code){
          stdoutRing.close();
          stdoutClosed = true;

					stderrRing.close();
					stderrClosed = true;

					processExited = true;
					if (code) {
						console.log('code: ', code);
						handleExit();
						return;
						handleExit(new Error('ffmpeg exited with code ' + code));
					} else {
						handleExit();
					}
				}
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

      // Call process callback
      processCB(result, stdoutRing, stderrRing);
};

ffmpegCommand(process.cwd() + '/bigbuckbunny.webm')
	.noAudio()
	.on('start', function(cl){
		console.log('started with ', cl);
	})
	.on('progress', function(obj){
		console.log(obj);
	})
	.on('error', function(err){
		console.log(err);
	}).save(process.cwd() + '/test.mp4');

module.exports = ffmpegCommand;
