'use strict'
const ffmpeg = require('ffmpeg.js');
let ffmpegCommand = require('fluent-ffmpeg');
const fs = require('fs');
const utils = require('./node_modules/fluent-ffmpeg/lib/utils');

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

			console.log('args:', args);
var testData = new Uint8Array(fs.readFileSync('test.webm'));

var result = ffmpeg({
	MEMFS: [{name: 'test.webm', data: testData }],
	arguments: ['-i', 'test.webm', '-y', '-an', 'out.webm'],
	stdout: function(data){ console.log(data); },
	print: function(data){ console.log(data); },
	printErr: function(data){ console.log(data); },
	stdin: function(){},
});

console.log(result);
var out = result.MEMFS[0];
console.log(out);
fs.writeFileSync(out.name, Buffer(out.data));
/*
			var result = ffmpeg({
				MEMFS: [{name: "test.webm", data: testData}],
				arguments: args,
				stdout: function(data){ console.log(data); },
				print: function(data){
					console.log(data);
					if (options.captureStdout) {
						stdoutRing.append(data);
					}
				},
				printErr: function(data){
					console.log(data);
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
*/
			console.log(result);
			var out = result.MEMFS[0];
			console.log(out);
			if(out){
				console.log('try write');
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
			console.log('about to call callback');
      // Call process callback
      processCB(result, stdoutRing, stderrRing);
};

ffmpegCommand('test.webm')
	.noAudio()
	.save('out.webm');

module.exports = ffmpegCommand;
