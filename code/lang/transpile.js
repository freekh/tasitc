const transduce = require('./transduce');
const builtins = require('./combinators');

const transpile = (parseTree) => {
  const init = (node, aliases, request) => {
    const recurse = (node) => {
      if (node.type === 'Expression') {
        const path = node.path.value;
        const alias = aliases[path];
        const fullPath = alias || path;
        const builtin = builtins[fullPath];
        const argFun = node.arg ? recurse(node.arg) : null;
        if (builtin) {
          return builtin(argFun);
        }
        return request(fullPath, argFun);
      } else if (node.type === 'Composition') {
        return ctx => {
          // FIXME: [{'a': 'foo'}, {'a': 'bar'}] | map ($.a | regex 'foo') fails if the 2 lines below are outside of this closure!?!?!?!?!?!?!?!?!?!?!?!?
          const combinators = node.combinators.map(recurse);
          const argFun = recurse(node.target);

          return transduce(combinators, argFun(ctx), node.combinators);
        };
      } else if (node.type === 'List') {
        const elements = node.elements.map(recurse);
        return ctx => {
          return elements.map(element => element(ctx));
        };
      } else if (node.type === 'Instance') {
        const pairs = {};
        node.elements.forEach(({ key, value }) => {
          pairs[key.value] = recurse(value);
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
      }

      throw new Error('TODO '+ JSON.stringify(node));
    };

    return recurse(node);
  };

  return (ctx, aliases, request) => {
    return aliases.then(aliases => {
      return init(parseTree.value, aliases, request)(ctx);
    });
  };
};

module.exports = transpile;
