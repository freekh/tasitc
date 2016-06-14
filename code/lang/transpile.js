const { map, flatmap, reduce } = require('./combinators');

const transpileStr = (node) => {
  // TODO: is $ function + Promise necessary?
  return ($) => Promise.resolve({
    status: 200,
    mime: 'text/plain',
    content: node.value,
  });
};

const transpileId = (node, lookup) => {
  return lookup(node.value);
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
          if (element.type === 'Attribute') {
            content = content[element.attr.value]; // FIXME: transpile instead or change AST?
          } else {
            throw Error(`Could not handle element ${JSON.stringify(element)} ` +
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

const transpile = (node, lookup, text, env, atoms) => {
  const { request, sink } = atoms;
  const recurse = (node) => {
    if (node.type === 'Call') {
      const path = transpileId(node.id, lookup);
      const arg = node.arg ? recurse(node.arg) : null;
      return ($) => {
        return request(path($), arg ? arg($) : $, env);
      };
    } else if (node.type === 'Chain') {
      const elements = node.elements.map((element, i) => {
        if (i === 0) {
          return recurse(element);
        } else if (i === 1) {
          const chained = recurse(element);
          return map(chained);
        } else if (i > 1) {
          const flatChained = recurse(element);
          return flatmap(flatChained);
        }
        throw Error(`Unexpected index '${i}' of elements ${JSON.stringify(node)}`);
      });
      return ($) => reduce(elements, $);
    } else if (node.type === 'Id') {
      return transpileId(node, lookup);
    } else if (node.type === 'Str') {
      return transpileStr(node);
    } else if (node.type === 'Context') {
      return transpileContext(node);
    } else if (node.type === 'Instance') {
      return $ => {
        const promises = [];
        // FIXME: avoid transpiling here... (it is not transpilation, it is transexecuting)
        node.elements.forEach(element => {
          Object.keys(element).forEach(key => {
            const promise = recurse(element[key])($).then(response => {
              const value = {};
              value[key] = response.content;
              return value;
            });
            promises.push(promise);
          });
        });

        return Promise.all(promises).then(elements => {
          const content = {};
          elements.forEach(element => {
            Object.keys(element).forEach(key => {
              content[key] = element[key];
            });
          });
          return {
            mime: 'application/json',
            status: 200,
            content,
          };
        });
      };
    } else if (node.type === 'List') {
      return ($) => {
        // FIXME: smells bad
        const promisedResponses = Promise.all(node.elements.map(element => {
          return recurse(element)($); // eslint-disable-line no-use-before-define
        }));
        return promisedResponses.then(responses => {
          const content = responses.map(response => response.content);
          return {
            status: 200,
            mime: 'application/json',
            content,
          };
        });
      };
    } else if (node.type === 'Sink') {
      return sink(node, text, node.path.value, env);
    }
    throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node, null, 2)}`);
  };
  return recurse(node);
};

module.exports = transpile;
