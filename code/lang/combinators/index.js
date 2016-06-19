// TODO: the contents here are not really proper combinators,
// but they have the same names (which makes it even worse I suppose)

const map = require('./map');
const flatmap = require('./flatmap');
const ifte = require('./ifte');
const contains = require('./contains');
const html = require('./html');
const text = require('./text');

module.exports = {
  map,
  flatmap,
  //
  ifte,
  contains,
  //
  html,
  text,
};
