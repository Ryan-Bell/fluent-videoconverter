const ffmpeg        = require('ffmpeg.js');
const fs            = require('fs');

//TODO: the name actually needs to come from the args
var bufferData = new Uint8Array(fs.readFileSync('test.webm'));
var result = ffmpeg({
	MEMFS    : [{ name: 'test.webm', data: bufferData }],
	arguments: process.argv.slice(2), 
	print    : function(data){
		console.log(data);
	},
	printErr : function(data){
		console.error(data);
	}
});

var out = result.MEMFS[0];
if(out){
	fs.writeFileSync(out.name, Buffer(out.data));
}
