const path = require('path');

const isRelative = (path) => {
  return !(/^([a-z]:)?[\\\/]/i).test(path);
};
const normalize = (cwd, id) => {
  return id;
};

module.exports = normalize;

