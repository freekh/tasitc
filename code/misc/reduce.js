// TODO: move to lang/execute

// TODO: do we need more support for combinators or is a simple reduce enough?
// the lang could be built up on Joys combinators I think...

const errorStatus = value => {
  return value.status !== 200; // TODO
};

const reduce = (xf, value) => {
  if (xf.length) {
    if (!(xf instanceof Array)) {
      throw Error(`XForm not an array: ${JSON.stringify(xf)}`);
    }
    const form = xf.shift();
    if (!(form instanceof Function)) {
      throw Error(`Illegal (non-functional) form: ${form.toString()}`);
    }

    if (value instanceof Promise) {
      const promise = value;
      return reduce(xf, promise.then(value => {
        if (errorStatus(value)) {
          throw Error(`Short circuited at ${JSON.stringify(value)} ` +
                      `(form: ${form}, xf: ${JSON.stringify(xf)}`);
        }
        return form(value);
      }));
    }
    if (errorStatus(value)) {
      throw Error(`Short circuited at ${JSON.stringify(value)} ` +
                  `(form: ${form}, xf: ${JSON.stringify(xf)}`);
    }
    return reduce(xf, form(value));
  }
  return value;
};

module.exports = reduce;
