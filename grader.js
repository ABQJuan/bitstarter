#!/usr/bin/env node
var sys = require('util');
var rest = require('restler');
var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "Hello";//"index.html";
var CHECKSFILE_DEFAULT = "checks.json";
var URLFILE_DEFAULT = 'http://afternoon-eyrie-7707.herokuapp.com';

var assertFileExists = function(infile){
    //console.log(typeof infile);
    //var instr = infile.toString();
    if(!fs.existsSync(infile)){
	console.log("%s does not exist. Exiting.", infile);
	process.exit(1);
    }
    return infile;
};


var cheerioHtmlFile = function(htmlfile){
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile){
    return JSON.parse(fs.readFileSync(checksfile));
};

var fetchUrl = function(url, checksfile) {
    rest.get(url).on('complete', function(result) {
	if(result instanceof Error) {
		console.log('Error: ' + result.message);
		process.exit(1);
	    } else {
		    $ = cheerio.load(result);
		    var checks = loadChecks(checksfile).sort();
		    var out = {};
		    for(var ii in checks) {
			var present = $(checks[ii]).length > 0;
			out[checks[ii]] = present;
			    }
		    console.log(JSON.stringify(out, null, 4));
		}
    });
};

var checkHtmlFile = function(htmlfile, checksfile){

    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for (var ii in checks){
	var present = $(checks[ii]).length >0;
	out[checks[ii]]= present;
    }
    console.log(JSON.stringify(out,null,4 ));
};


var clone = function(fn){
    return fn.bind({});
};


if(require.main == module){
    program
	.option('-c, --checks <checks>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url>', 'Path to url')
      	.parse(process.argv);

    if (program.url === undefined) {
	var checkJson = checkHtmlFile(program.file, program.checks);
     } else {
	 var checkJson = fetchUrl(program.url, program.checks);
	}
    var outJson = JSON.stringify(checkJson, null, 4);
    //hconsole.log(outJson);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
