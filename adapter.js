const ffmpeg        = require('ffmpeg.js');
const fs            = require('fs');

//base options
let ffmpegOptions = {
	arguments: process.argv.slice(2), 
	print    : function(data){
		console.log(data);
	},
	printErr : function(data){
		console.error(data);
	}
};

//file i/o?
var inputFlagIndex = process.argv.indexOf('-i'); 
if(inputFlagIndex > 0 && process.argv.length >= inputFlagIndex + 1){
	let input = process.argv[inputFlagIndex + 1];
	let bufferData = new Uint8Array(fs.readFileSync(input));
	ffmpegOptions.MEMFS = [{ name: input, data: bufferData }];
}

//run ffmepg
var result = ffmpeg(ffmpegOptions);

//write result to disk if there was a file io operation
var out = result.MEMFS[0];
if(out){
	fs.writeFileSync(out.name, Buffer(out.data));
}
