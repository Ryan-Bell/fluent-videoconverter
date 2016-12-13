'use strict'
let expect = require('chai').expect;
const fs = require('fs');
const app = require('../src/app.js');

describe('api', function(){
	it('should export the fluent function', function(){
		expect(app.fluent).to.be.a('function');
	});

	it('should be true', function(){
		expect(true).to.be.true;
	});
	
	it('should return true', function(){
		expect(app.fluent().testFunction()).to.be.true;
	});
});