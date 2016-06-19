const transduce = (xf, value, node) => {
  if (xf.length) {
    if (!(xf instanceof Array)) {
      throw Error(`XForm not an array: ${JSON.stringify(xf)}. Node: ${JSON.stringify(node)}`);
    }
    const form = xf.shift();
    if (!(form instanceof Function)) {
      throw Error(`Illegal (non-functional) form: ${form.toString()}. ` +
                  `Node: ${JSON.stringify(node)}`);
    }

    if (value instanceof Promise) {
      const promise = value;
      return transduce(xf, promise.then(value => {
        return form(value);
      }));
    }
    return transduce(xf, form(value));
  }
  return value;
};

module.exports = transduce;
