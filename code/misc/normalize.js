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
  let value = id;
  if (isRelative(id)) {
    if (id.startsWith('~')) {
      value = path.normalize(id);
    } else {
      value = path.normalize(cwd + id);
    }
  }
  if (value.endsWith('/')) {
    return value.slice(0, value.length - 1);
  }
  return value;
};

module.exports = normalize;
