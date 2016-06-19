
const request = (promisedPath, argRaw, env) => {
  const promisedArg = argRaw instanceof Promise ?
          argRaw : Promise.resolve(argRaw);

  return Promise.all([promisedPath, promisedArg]).then(([path, arg]) => {
    if (path === 'ls') {
      return {
        status: 200,
        mime: 'application/json',
        content: [
          { path: '/freekh/dir' },
        ],
      };
    } else if (path === 'li') {
      return {
        status: 200,
        mime: 'application/js',
        content: `
(context, env, fragment, tags, tasitc) => {
  const classAttr = (tags && tags.length) ? 'class='+tags.join(' ')+'"' : '';
  const idAttr = fragment ? 'id="'+fragment+'"' : '';
  let attrs = '';
  if (classAttr.length) {
    attrs = ' '+classAttr;
  }
  if (idAttr.length) {
    attrs = ' '+idAttr;
  }
  const content = typeof context === 'string' ? context : JSON.stringify(context);
  return '<li'+attrs+'>'+content+'</li>';
};`,
      };
    }
    throw new Error('Oh noz: ' + path + arg);
  });
};

module.exports = request;
