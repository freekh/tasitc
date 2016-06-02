const post = require('../../misc/post');

const sink = (ast, text, path) => {
  return ($) => {
    return post('/tasitc/ns/write', { ast, text, path });
  };
};

module.exports = sink;
