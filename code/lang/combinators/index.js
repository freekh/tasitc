// TODO: the contents here are not really proper combinators,
// but they have the same names (which makes it even worse I suppose)

const reduce = require('./reduce');
const map = require('./map');
const flatmap = require('./flatmap');

module.exports = {
  reduce,
  map,
  flatmap,
};
