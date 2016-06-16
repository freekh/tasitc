const request = require('./request');
// const await = require('./await');

const text = require('./text');
const json = require('./json');
const js = require('./js');
const css = require('./css');
const xml = require('./xml');
const h = require('./h');

module.exports = {
  //
  request,
  // Types:
  '/tasitc/atoms/json': json,
  '/tasitc/atoms/text': text,
  '/tasitc/atoms/js': js,
  '/tasitc/atoms/css': css,
  '/tasitc/atoms/xml': xml,
  '/tasitc/atoms/h': h,
  //
};
