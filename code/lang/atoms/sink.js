const post = require('../../misc/post');

const sink = (ast, text, path, env) => {
  return ($) => {
    return post('/tasitc/ns/write', { ast, text, path, env });
  };
};

module.exports = sink;
