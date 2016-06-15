const normalize = require('./normalize');

const lookup = (cwd, aliases) => {
  return id => {
    const alias = aliases[id];
    const content = alias || normalize(cwd, id);
    return ($) => {
      return Promise.resolve({
        status: 200,
        mime: 'text/plain',
        content,
      });
    };
  };
};

module.exports = lookup;
