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

    // Find ffmpeg
    this._getFfmpegPath(function(err, command) {
      if (err) {
        return endCB(err);
      } else if (!command || command.length === 0) {
        return endCB(new Error('Cannot find ffmpeg'));
      }

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
			//args.unshift(command);
			console.log(args, options);
			ffmpeg({
				arguments: args,
				print: function(data){console.log(data);},
				printErr: function(data){console.log(data);},
				onExit: function(code){
					console.log('code: ', code);
				}
			});

      //var ffmpegProc = spawn('node', args, options);

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
					console.log('code: ', code);
					handleExit();
					return;
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
    });
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
