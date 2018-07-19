var wmlStart = require('wml/src/cli/start.js');

exports.handler = async () => {
  const wmlAdd = require('../autoAddSymlink.js');
  await wmlAdd();
  wmlStart.handler();
};