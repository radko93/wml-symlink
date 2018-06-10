var wmlStart = require('wml/src/cli/start.js');

exports.handler = () => {
  require('../autoAddSymlink.js');
	wmlStart.handler();
};