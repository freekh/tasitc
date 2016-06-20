// FIXME: rename combinator => transducers?

const map = require('./map');
const flatmap = require('./flatmap');
const ifte = require('./ifte');
const contains = require('./contains');
const html = require('./html');
const text = require('./text');

module.exports = {
  '/tasitc/core/combinators/map': map,
  '/tasitc/core/combinators/flatmap': flatmap,
  //
  '/tasitc/core/combinators/ifte': ifte,
  '/tasitc/core/combinators/contains': contains,
  //
  '/tasitc/core/combinators/text': text,
  '/tasitc/core/combinators/html': html,
};
