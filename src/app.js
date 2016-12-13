'use strict'

function fluent(){
	let obj = {};
	obj.testFunction = function(){
		return true;
	};
	return obj;
}

module.exports = fluent;

if(process.env.npm_config_expose){
	module.exports = {
		fluent: fluent
	};
}