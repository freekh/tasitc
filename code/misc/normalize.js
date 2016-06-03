const path = require('path');

const isRelative = (path) => {
  return !(/^([a-z]:)?[\\\/]/i).test(path);
};
const normalize = (cwdRaw, aliases, id) => {
  const alias = aliases[id];
  if (alias) {
    return alias;
  }
  const cwd = cwdRaw.endsWith('/') ? cwdRaw : `${cwdRaw}/`;
  if (isRelative(id)) {
    return path.normalize(cwd + id);
  }
  return id;
};

module.exports = normalize;
