const log = require('../misc/log');

// TODO: remove
const h = require('hyperscript');

module.exports = { // DUMMY
  ls: (id, args, context) => {
    log.debug(id, args, context);
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/files',
      content: [
        { path: 'file.txt', file: true, dir: false },
        { path: 'dir', dir: true, file: false },
      ],
    });
  },
  html: (id, args, context) => {
    log.debug(id, args, context);
    console.log(id, args, context);
    const dom = args[0] || context || '';
    const style = args[1] ? args[1] : null;
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/html',
      content: [
        style ? h('style', style) : null,
        dom,
      ],
    });
  },
  json: (id, args, context) => {
    // FIXME: NO!!! This is not right ;) ofc
    log.debug(id, args, context);
    console.log(id, args, context);
    const dom = args[0] || context || '';
    const style = args[1] ? args[1] : null;
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/html',
      content: [
        style ? h('style', style) : null,
        dom,
      ],
    });
  },
  li: (id, args, context) => {
    log.debug(id, args, context);
    const content = args[0] || context || '';
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/html/li',
      content: h('li', content),
    });
  },
  ul: (id, args, context) => {
    log.debug(id, args, context);
    const content = args[0] || context || '';
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/html/ul',
      content: h('ul', content),
    });
  },
  div: (id, args, context) => {
    log.debug(id, args, context);
    const content = args[0] || context || '';
    return Promise.resolve({
      status: 200,
      mime: 'tasitc/html/div',
      content: h('div', content),
    });
  },
  str: (id, args, context) => {
    log.debug(id, args, context);
    return Promise.resolve({
      status: 200,
      mime: 'text/plain',
      content: args.length > 0 ? args.join('') : JSON.stringify(context),
    });
  },
};
