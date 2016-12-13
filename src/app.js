const vcpath = process.cwd() + '/node_modules/videoconverter/build/ffmpeg-all-codecs.js';

var ffmpegCommand = require('fluent-ffmpeg');
ffmpegCommand.setFfmpegPath(vcpath);
ffmpegCommand.setFfprobePath(vcpath);
ffmpegCommand.setFlvtoolPath(vcpath);

ffmpegCommand(process.cwd() + '/node_modules/videoconverter/demo/bigbuckbunny.webm')
	.noAudio().size('50%')
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
