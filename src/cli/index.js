#!/usr/bin/env node
'use strict';

var start = require('./start.js');

require('yargs')
	.usage('$0 <cmd> [args]')
	.command(start)
	.help('help')
	.argv