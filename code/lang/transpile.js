const transduce = require('./transduce');
const builtins = require('./combinators');
const primitives = require('./primitives');

const lift = (node) => { // FIXME: feels very unefficient, but perhaps it is best?
  if (node.type === 'Expression') {
    if (node.arg && node.arg.type === 'Curry') {
      return true;
    }
    return lift(node.arg);
  } else if (node.type === 'Composition') {
    return node.combinators.reduce(false, (acc, curr) => {
      return acc || lift(curr);
    }) || lift(node.target);
  } else if (node.type === 'List') {
    return node.elements.reduce(false, (acc, curr) => {
      return acc || lift(curr);
    });
  } else if (node.type === 'Instance') {
    let lifted = false;
    node.elements.forEach(({ value }) => {
      lifted = lift(value);
    });
    return lifted;
  } else if (node.type === 'Text') {
    return false;
  } else if (node.type === 'Context') {
    return false;
  } else if (node.type === 'Eval') {
    return lift(node.expression);
  }
  throw new Error(`Cannot lift: ${JSON.stringify(node)}`);
};

const normalize = (id, aliases) => {
  const path = id.value;
  const alias = aliases[path];
  return alias || path;
};

const transpileFun = (node, aliases, request) => {
  const fullPath = normalize(node.path, aliases);
  const builtin = builtins[fullPath];

  let fun = null;
  if (builtin) {
    fun = builtin;
  } else {
    fun = request(`${fullPath}.tasitc`);
  }

  return fun;
};

const asPromise = maybePromise => {
  if (maybePromise instanceof Promise) {
    return maybePromise;
  }
  return Promise.resolve(maybePromise);
};
const flattenPromises = maybePromise => {
  return asPromise(maybePromise).then(value => {
    if (value instanceof Array) {
      return Promise.all(value.map(flattenPromises));
    }
    return value;
  });
};

const transpile = (parseTree) => {
  const init = (node, aliases, request) => {
    const recurse = (node, partialFun) => { // TODO: rename partialFun to applyArgFun
      if (node.type === 'Expression') {
        const fullPath = normalize(node.path, aliases);
        const builtin = builtins[fullPath];

        if (builtin) {
          if (node.arg && node.arg.type === 'Curry') {
            return builtin;
          }
        }
        const argFun = node.arg ? recurse(node.arg, partialFun) : null;
        if (builtin) {
          return ctx => {
            const result = builtin(argFun)(ctx);
            return result;
          };
        }

        return (ctx) => {
          const argPromise = asPromise(argFun ? argFun(ctx) : null);
          return argPromise.then(arg => {
            return request(`${fullPath}.tasitc`, arg, ctx).catch(err => {
              if (!arg) {
                return new primitives.Text(fullPath);
              }
              return Promise.reject(err);
            }).then(result => {
              if (result instanceof primitives.Node) {
                return recurse(result.data, argFun)(ctx);
              } else if (result instanceof primitives.Text) {
                return result.value;
              } else if (result instanceof primitives.App) {
                return result;
              }
              throw new Error(`TODO: ${JSON.stringify(result)}`);
            });
          });
        };
      } else if (node.type === 'Composition') {
        return ctx => {
          // FIXME: [{'a': 'foo'}, {'a': 'bar'}] | map ($.a | regex 'foo') fails if the 2 lines below are outside of this closure!?!?!?!?!?!?!?!?!?!?!?!?
          const combinators = node.combinators.map(combinator => recurse(combinator, partialFun));
          const argFun = recurse(node.target, partialFun);
          return transduce(combinators, argFun(ctx), node.combinators);
        };
      } else if (node.type === 'List') {
        const elements = node.elements.map(element => recurse(element, partialFun));
        return ctx => {
          return elements.map(element => element(ctx));
        };
      } else if (node.type === 'Partial') {
        const fun = transpileFun(node, aliases, request);
        if (node.arg && node.arg.type === 'Curry') {
          if (partialFun) {
            return fun(partialFun);
          }
          return fun;
        }
        const argFun = node.arg ? recurse(node.arg, partialFun) : null;
        return fun(argFun);
      } else if (node.type === 'Apply') {
        const argFun = node.arg ? recurse(node.arg, partialFun) : null;
        if (node.partial && node.partial.type === 'Partial') {
          return recurse(node.partial, argFun);
        }
        throw new Error(`Cannot apply a non-partial node ${JSON.stringify(node)}`);
      } else if (node.type === 'Instance') {
        const pairs = {};
        node.elements.forEach(({ key, value }) => {
          pairs[key.value] = recurse(value, partialFun);
        });
        return ctx => {
          const result = {};
          Object.keys(pairs).forEach(key => {
            result[key] = pairs[key](ctx);
          });
          return result;
        };
      } else if (node.type === 'Text') {
        return () => node.value;
      } else if (node.type === 'Sink') {
        return () => {
          const content = parseTree.text.slice(node.start, node.end);
          const path = node.path.value;
          return request('/localhost/ns/sink.tasitc', path, content);
        };
      } else if (node.type === 'Context') {
        const scope = (ctx, paths) => {
          if (!paths.length) {
            return ctx;
          }
          const path = paths[0];
          if (path.type === 'Attribute') {
            return scope(ctx[path.attr.value], paths.slice(1));
          } else if (path.type === 'Subscript') {
            return scope(ctx[path.index.value], paths.slice(1));
          }
          throw new Error(`Unkown path of type in node: ${JSON.stringify(node)}`);
        };
        const scoped = ctx => {
          return scope(ctx, node.paths);
        };
        return ctx => {
          return scoped(ctx);
        };
      } else if (node.type === 'Eval') {
        const argFun = node.arg ? recurse(node.arg, partialFun) : null;
        const fullPath = normalize(node.expression, aliases); // TODO: rename expression to path?
        const modifier = (node.modifier && node.modifier.value) ? node.modifier.value : null;
        return ctx => {
          return request(`${fullPath}.js`).then(content => {
            const argPromise = flattenPromises(argFun ? argFun(ctx) : null);
            return argPromise.then(arg => {
              return eval(content.value)(ctx, arg, modifier, { primitives });
            });
          });
        };
      }

      throw new Error('TODO '+ JSON.stringify(node));
    };
    return recurse(node);
  };

  return (ctx, aliases, request) => {
    return aliases.then(aliases => {
      const maybePromise = init(parseTree.value, aliases, request)(ctx);
      const promise = maybePromise instanceof Promise ?
              maybePromise : Promise.resolve(maybePromise);
      return promise.then(result => {
        // TODO: all primitives
        if (result instanceof primitives.Node || result instanceof primitives.Text || result instanceof primitives.DomElement || result instanceof primitives.Html || result instanceof primitives.App) {
          return result;
        } else if (result instanceof Function) {
          return new primitives.Node(parseTree.value);
        } else if (result instanceof Object || result instanceof Array) {
          return new primitives.Json(result);
        }
        return new primitives.Text((result === undefined || result === null) ? '' : result.toString());
      });
    });
  };
};

module.exports = transpile;
