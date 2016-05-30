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
    console.log(JSON.stringify(parseTree, null, 2))
    const transpiled = transpile(ast, input);
    //console.log(JSON.stringify(transpiled), transpiled.toString());

    // TODO: remove
    const { into, comp, identity, map, mapcat } = require('transducers-js');
    const t = require('transducers-js')
    // console.log('?', into([], comp(
    //   mapcat(($) => [{ p: 'a.txt' }, { p: 'b.txt' }]),
    //   map(($) => '<li>'+$.p+'</li>')
    // ), [{ request: 'get'}]));

    t.Promise = function(f, xf) {
      return {
         "@@transducer/init": function() {
           return xf["@@transducer/init"]();
         },
         "@@transducer/result": function(result) {
           return xf["@@transducer/result"](result);
         },
         "@@transducer/step": function(result, input) {
           return xf["@@transducer/step"](result, f(input));
         }
      };
    };

    t.promise = function(f) {
      return function(xf) {
        return new t.Promise(f, xf);
      }
    }

    var xf = t.map(p => {
      return n + 1;
    });
    var promiseReduce = function(xf, init, array) {
        var acc = init;
        for(var i = 0; i < array.length; i++) {
            acc = xf["@@transducer/step"](acc, array[i]);
            if(transducers.isReduced(acc)) {
                acc = transducers.deref(acc);
                break;
            }
        }
        return xf["@@transducer/result"](acc);
    };
    //const promiseBuilder = 
    //const a = promiseReduce(xf, Promise.resolve(0), ),
    const a = t.transduce(promiseReduce, promiseBuilder, Promise.resolve(0), Promise.all([Promise.resolve(0)]))
    console.log(a)
    return Promise.resolve(a);
    // console.log('?', into([],
    //   t.promise($ => {
    //     return {test: $};
    //   })
    // , [{ foo: 'bar' }]));
    //console.log(JSON.stringify(into({}, transpiled, { request: 'get' }), null, 2));
    //log.info({ transpiled, input });
    // FIXME: eval? REAAAAAALY?
    //return eval(transpiled); // eslint-disable-line no-eval
  }
  return Promise.reject(parseTree);
};
