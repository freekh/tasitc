const reverse = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.map && ctx.sort && ctx.reverse) {
      if (!argFun) {
        return Promise.all(ctx.reverse());
      }
      return Promise.all(ctx.sort((a, b) => {
        return argFun(a) - argFun(b);
      }).reverse());
    }
    return Promise.reject(`Cannot reverse: ${JSON.stringify(ctx)}`);
  };
};
module.exports = reverse;
