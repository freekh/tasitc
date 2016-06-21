const split = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.split) {
      const arg = argFun && argFun(ctx) || '';
      return Promise.resolve(ctx.split(arg));
    }
    return Promise.reject(`Cannot split: ${JSON.stringify(ctx)}`);
  };
};

module.exports = split;
