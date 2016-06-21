const map = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.map) {
      if (!argFun) {
         // TODO: this is actually an optimization but id (v => v) is more 'correct'?
        return Promise.all(ctx);
      }
      return Promise.all(ctx.map(element => {
        return argFun(element);
      }));
    }
    return Promise.reject(`Cannot map: ${JSON.stringify(ctx)}`);
  };
};

module.exports = map;
