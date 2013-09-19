#!/usr/bin/env node

process.title = 'awsbox';

const
aws = require('./lib/aws.js'),
path = require('path'),
colors = require('colors'),
util = require('util');

var verbs = require('./lib/commands.js');

// allow multiple different env vars (for the canonical AWS_ID and AWS_SECRET)
[ 'AWS_KEY', 'AWS_ID', 'AWS_ACCESS_KEY' ].forEach(function(x) {
  process.env['AWS_ID'] = process.env['AWS_ID'] || process.env[x];
});
[ 'AWS_SECRET', 'AWS_SECRET_KEY' ].forEach(function(x) {
  process.env['AWS_SECRET'] = process.env['AWS_SECRET'] || process.env[x];
});

colors.setTheme({
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

if (process.argv.length <= 2) usage();

var verb = process.argv[2].toLowerCase();
if (!verbs[verb]) fail(verb != '-h' ? "no such command: " + verb : null);

// check for required environment variables
if (!process.env['AWS_ID'] || !process.env['AWS_SECRET']) {
  fail('Missing aws credentials\nPlease configure the AWS_ID and AWS_SECRET environment variables.');
}

// set the region (or use the default if none supplied)
var region = aws.createClients(process.env['AWS_REGION']);
console.log("(Using region", region + ")");

// now call the command
try {
  verbs[verb](process.argv.slice(3));
} catch(e) {
  fail("error running '".error + verb + "' command: ".error + e);
}

function usage() {
  process.stderr.write('A tool to deploy NodeJS systems on Amazon\'s EC2\n');
  process.stderr.write('Usage: ' + path.basename(__filename) +
                       ' <' + Object.keys(verbs).join('|') + "> [args]\n\n");
  Object.keys(verbs).sort().forEach(function(verb) {
    process.stderr.write(util.format("  %s:\t%s\n", verb,
                                     verbs[verb].doc || "no docs"));
  });
  process.exit(1);
}

function fail(error) {
  process.stderr.write('fatal error: '.error + error + "\n");
  process.exit(1);
}
