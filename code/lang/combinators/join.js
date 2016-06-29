const primitives = require('../primitives');

const join = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.join) {
      const arg = argFun && argFun(ctx) || '';
      return new primitives.Text(Promise.resolve(ctx.join(arg)));
    }
    return Promise.reject(`Cannot join: ${JSON.stringify(ctx)}`);
  };
};

module.exports = join;
