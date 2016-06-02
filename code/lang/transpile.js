const { request } = require('./atoms');
const { map, flatmap, reduce } = require('./combinators');

const transpileStr = (node) => {
  // TODO: is $ function + Promise necessary?
  return ($) => Promise.resolve({
    status: 200,
    mime: 'text/plain',
    content: node.value,
  });
};

const transpileId = (node) => {
  return transpileStr(node);
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

const transpile = (node, text) => {
  if (node.type === 'Call') {
    const path = transpile(node.id, text);
    const arg = node.arg ? transpile(node.arg, text) : null;
    return ($) => {
      return request(path($), arg ? arg($) : $);
    };
  } else if (node.type === 'Chain') {
    const elements = node.elements.map((element, i) => {
      if (i === 0) {
        return transpile(element, text);
      } else if (i === 1) {
        const chained = transpile(element, text);
        return map(chained);
      } else if (i > 1) {
        const flatChained = transpile(element, text);
        return flatmap(flatChained);
      }
      throw Error(`Unexpected index '${i}' of elements ${JSON.stringify(node)}`);
    });
    return ($) => reduce(elements, $);
  } else if (node.type === 'Id') {
    return transpileId(node);
  } else if (node.type === 'Str') {
    return transpileStr(node);
  } else if (node.type === 'Context') {
    return transpileContext(node);
  } else if (node.type === 'List') {
    return ($) => {
      // FIXME: smells bad
      const promisedResponses = Promise.all(node.elements.map(element => {
        return transpile(element, text)($); // eslint-disable-line no-use-before-define
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
  }
  throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node)}`);
};

module.exports = transpile;
