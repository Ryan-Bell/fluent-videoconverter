'use strict'
let expect = require('chai').expect;
const fs = require('fs');
const app = require('../glue.js');

describe('api', function(){

	it('should export the fluent function', function(){
		expect(app).to.be.a('function');
	});

	it('should not have path manipulation functions', function(){
		expect(app.setFfmpegPath).to.be.undefined;
		expect(app.setFfprobePath).to.be.undefined;
		expect(app.setFlvtoolPath).to.be.undefined;
		expect(app._forgetPaths).to.be.undefined;
		expect(app._getFfmpegPath).to.be.undefined;
		expect(app._getFfprobePath).to.be.undefined;
		expect(app._getFlvtoolPath).to.be.undefined;
	});

});
