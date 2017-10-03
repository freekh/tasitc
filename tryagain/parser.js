const { tokenize } = require('./tokenizer');
const { treeify } = require('./treeifyer');

const parse = (input) => {
  return treeify(tokenize(input));
};

module.exports = {
  parse,
};