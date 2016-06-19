const transduce = require('./transduce');
const builtins = require('./combinators');

const transpileText = (node) => {
  return {
    status: 200,
    content: node.value,
    mime: 'text/plain',
  };
};

const transpileId = (node) => {
  return node.value;
};

const transpileContext = (node) => {
  return ($) => {
    const context = $ instanceof Promise ? $ : Promise.resolve($);
    return context.then($ => {
      let content = $.content;
      let mime = $.mime;
      const status = $.status;
      let missingAttribute = null;
      node.path.forEach(element => { // FIXME: ? prefer transpiling outside of function
        if (content) {
           // FIXME: transpile instead or change AST?
          if (element.type === 'Attribute') {
            content = content[element.attr.value];
          } else if (element.type === 'Subscript') {
            content = content[element.index.value];
          } else {
            throw Error(`Could not handle element ${JSON.stringify(element)}` +
                        `in node: ${JSON.stringify(node)}`);
          }
        }
        if (!content) {
          missingAttribute = element.attr.value;
        }
      });
      if (node.path.length) {
        if (!content) {
          return Promise.reject({
            mime: 'text/plain',
            status: 500,
            content: `No attribute ${missingAttribute} in ${JSON.stringify($.content)}`,
          });
          // Note: typeof: http://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
        } else if (typeof content === 'string') {
          mime = 'text/plain';
        }
        // TODO: mroe here?
      }
      return {
        status,
        mime,
        content,
      };
    });
  };
};

const transpile = (parseTree) => {
  const init = (node, aliases, request) => {
    const recurse = (node) => {
      if (node.type === 'Expression') {
        const path = transpileId(node.id);
        const alias = aliases[path];
        const fullPath = alias || path;
        const arg = node.arg ? recurse(node.arg) : null;
        const builtin = builtins[fullPath];
        if (builtin) {
          return builtin($ => {
            let argValue = null;
            if (arg) {
              if (arg instanceof Function) {
                argValue = arg($);
              } else if (node.arg && node.arg.type === 'Id') {
                argValue = request(arg, $);
              } else {
                argValue = arg;
              }
            }
            return argValue || $;
          });
        }
        return $ => {
          return request(fullPath, arg || $);
        };
      } else if (node.type === 'Combination') {
        const combinators = node.combinators.map(recurse);
        const target = recurse(node.target);
        return $ => {
          return transduce(combinators, target($), node.combinators);
        };
      } else if (node.type === 'Id') {
        return transpileId(node);
      } else if (node.type === 'Text') {
        return $ => transpileText(node);
      } else if (node.type === 'Context') {
        return transpileContext(node);
      } else if (node.type === 'Eval') {
        const path = transpileId(node.id);
        const alias = aliases[path];
        const fullPath = alias || path;
        const arg = node.arg ? recurse(node.arg) : null;
        return $ => {
          return request(fullPath).then(expression => {
            if (expression.mime.indexOf('application/js') === -1) {
              return Promise.reject({
                status: 500,
                mime: 'text/plain',
                content: `Expression must be application/js but got: '${expression.mime}'`,
              });
            }
            let result = null;
            const argPromise = Promise.resolve((arg && arg($) || $));
            return argPromise.then(argValue => {
              try {
                result = {
                  mime: 'text/plain',
                  status: 200,
                  content: eval(expression.content)(argValue.content), // FIXME: eval, only read content...?
                };
              } catch (e) {
                result = {
                  mime: 'application/json',
                  status: 500,
                  content: e.toString(),
                };
              }
              return result;
            });
          });
        };
      } else if (node.type === 'Instance') {
        throw new Error('INSTANCE TODO');
      } else if (node.type === 'List') {
        return $ => {
          return {
            status: 200,
            mime: 'application/json',
            content: node.elements.map(element => {
              return recurse(element)($);
            }),
          };
        };
      } else if (node.type === 'Sink') {
        throw new Error('SINK TODO');
      }
      throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node, null, 2)}`);
    };
    return recurse(node);
  };
  return ($, aliases, request) => {
    return aliases.then(aliases => init(parseTree.value, aliases, request)($));
  };
};

module.exports = transpile;
