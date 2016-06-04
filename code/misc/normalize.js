const path = require('path');

const isRelative = (path) => {
  return !(/^([a-z]:)?[\\\/]/i).test(path);
};
const normalize = (cwdRaw, user, aliases, id) => {
  const alias = aliases[id];
  if (alias) {
    return alias;
  }
  const cwd = cwdRaw.endsWith('/') ? cwdRaw : `${cwdRaw}/`;
  let value = id;
  if (isRelative(id)) {
    if (id.startsWith('~')) {
      const home = id.split('/')[0];
      let normalizedHome = null;
      if (home === '~') {
        normalizedHome = user;
      } else {
        normalizedHome = home.slice(1, home.length);
      }
      value = path.normalize(id.replace(home, `/${normalizedHome}`));
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
