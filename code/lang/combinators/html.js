const primitives = require('../primitives');

const startsWithType = (type, value) => {
  if (value instanceof Array) {
    for (let elem of value) {
      if (elem instanceof primitives.DomElement) {
        if (elem.type === type) {
          return true;
        }
      }
    }
    return false;
  }
  return type === value.type;
};

const html = (argFun) => {
  return (ctx) => {
    const maybeArgPromises = argFun && argFun(ctx) || ctx;
    const argPromises = maybeArgPromises instanceof Array ? maybeArgPromises : [maybeArgPromises];

    return Promise.all(argPromises).then(args => {
      const value = args || ctx;
      console.log('!!', JSON.stringify(value))
      // TODO: not sure auto-injection is smart, but garantueeing body is probably not dumb
      const hasBody = startsWithType('body', value);
      let children = value instanceof Array ? value : [value];
      if (!hasBody) {
        children = [new primitives.DomElement('body', {}, children)];
      }
      return new primitives.Html(children);
    });
  };
};

module.exports = html;
