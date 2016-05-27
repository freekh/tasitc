const { parse } = require('./grammar');
const transpile = require('./transpile');
const log = require('../misc/log');
const post = require('../misc/post');

const write = (expression, ast, input, path) => { // eslint-disable-line no-unused-vars
  log.debug('Writing to:', path);
  return expression
    .then(() => {
      return post('/tasitc/fs/write', {
        path,
        ast,
        input,
      });
    })
    .then(() => {
      return expression;
    });
};

const parameter = (id) => { // eslint-disable-line no-unused-vars
  log.debug('Retrieving parameter:', id);
  return Promise.resolve('Test');
};

const exec = (path, args, context) => {
  // const service = services[id];
  // const argsPromises = args && args.map(a => {
  //   if (a instanceof Array) {
  //     return Promise.all(a);
  //   } else if (a instanceof Promise) {
  //     return a;
  //   } else if (a instanceof Object) {
  //     // FIXME: this is a keyword so this might be right? still smells bad:
  //     const id = Object.keys(a)[0];
  //     if (a[id] instanceof Promise) {
  //       return a[id].then(value => {
  //         const ret = {};
  //         ret[id] = value;
  //         return ret;
  //       });
  //     }
  //     return Promise.resolve(a[id]);
  //   }
  //   return Promise.resolve(a);
  // }) || [];
  // return Promise.all(argsPromises)
  //   .then(args => service(id, args, context));
};

const callOrString = (path, args, context) => { // eslint-disable-line no-unused-vars
  // if (services[path]) {
  //   return exec(path, args, context);
  // }
  // return Promise.resolve(path);
};

const pipe = (result) => {
  return {
    pipe: (f) => {
      
    }
  };
};

const call = (path, args, context) => { // eslint-disable-line no-unused-vars
  // const service = services[path];
  // if (service) {
  //   // TODO: hmm... this flattening is pret-ty ugly!
  //   // FIXME: keywords and args WILL break unless it only flattens things
  //   //        that are supposed to be flattened (Promises)
  //   return exec(path, args, context);
  // }
  // return Promise.reject({ msg: `Unknown service: '${path}'`, path, args, code: 0 });
  const result = ['TODO'];
  return 
};

const $ = {}; // eslint-disable-line no-unused-vars

module.exports = (parseTree) => {
  if (parseTree.status) {
    const ast = parseTree.value;
    const input = parseTree.input;
    const transpiled = transpile(ast, input);
    log.info({ transpiled, input });
    // FIXME: eval? REAAAAAALY?
    return eval(transpiled); // eslint-disable-line no-eval
  }
  return Promise.reject(parseTree);
};
