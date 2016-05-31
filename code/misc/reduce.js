// TODO: move to lang/execute

// TODO: do we need more support for combinators or is a simple reduce enough?
// the lang could be built up on Joys combinators I think...

const shortCircuitResponse = value => {
  console.log('?', value);
  return value.response.status !== 200; // TODO
};

const reduce = (xf, value) => {
  if (xf.length) {
    const form = xf.shift();
    if (value instanceof Promise) {
      const promise = value;
      return reduce(xf, promise.then(value => {
        if (shortCircuitResponse(value)) {
          return Promise.reject(value);
        }
        return form(value);
      }));
    }

    if (shortCircuitResponse(value)) {
      return value;
    }
    return reduce(xf, form(value));
  }
  return value;
};

module.exports = reduce;
