const map = require('./map');
const flatmap = require('./flatmap');
const ifte = require('./ifte');
const regex = require('./regex');

module.exports = {
  '/tasitc/core/combinators/map': map,
  '/tasitc/core/combinators/flatmap': flatmap,
  //
  '/tasitc/core/combinators/ifte': ifte,
  //
  '/tasitc/core/combinators/regex': regex,
};
