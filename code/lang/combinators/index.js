const apply = require('./apply');
const map = require('./map');
const flatmap = require('./flatmap');
const ifte = require('./ifte');
const regex = require('./regex');
const sort = require('./sort');
const reverse = require('./reverse');
const split = require('./split');
const join = require('./join');
const html = require('./html'); // TODO: move from combinators?
const request = require('./request'); // TODO: move from combinators?

module.exports = {
  '/tasitc/core/combinators/apply': apply,
  //
  '/tasitc/core/combinators/map': map,
  '/tasitc/core/combinators/flatmap': flatmap,
  //
  '/tasitc/core/combinators/ifte': ifte,
  //
  '/tasitc/core/combinators/regex': regex,
  //
  '/tasitc/core/combinators/sort': sort,
  '/tasitc/core/combinators/reverse': reverse,
  '/tasitc/core/combinators/split': split,
  '/tasitc/core/combinators/join': join,
  //
  '/tasitc/core/combinators/html': html,
  //
  '/tasitc/core/combinators/request': request,
};
