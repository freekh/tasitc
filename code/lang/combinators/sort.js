const sort = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.sort) {
      if (!argFun) {
        return Promise.all(ctx.sort());
      }
      return Promise.all(ctx.sort((a, b) => {
        return argFun(a) - argFun(b);
      }));
    }
    return Promise.reject(`Cannot sort: ${JSON.stringify(ctx)}`);
  };
};

module.exports = sort;
