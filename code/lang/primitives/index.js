const request = require('./request');
const listen = require('./listen');

const str = require('./str');
const json = require('./json');
const html = require('./html');

module.exports = {
  //
  '/tasitc/stdlib/request': request,
  '/tasitc/stdlib/listen': listen,
  '/tasitc/stdlib/str': str,
  '/tasitc/stdlib/json': json,
  '/tasitc/stdlib/h': html,
  //
};
