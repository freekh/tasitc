const request = require('./request');
// const await = require('./await');

const text = require('./text');
const json = require('./json');
const h = require('./h');

module.exports = {
  //
  request,
  // Types:
  '/tasitc/atoms/json': json,
  '/tasitc/atoms/text': text,
  '/tasitc/atoms/h': h,
  //
};
