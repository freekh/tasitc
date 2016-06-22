const flatmap = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.reduce) {
      const thisArgFun = argFun || (value => value);
      return Promise.all(ctx.map(element => {
        return thisArgFun(element);
      })).then(resolved => {
        return [].concat.apply([], resolved);
      });
    }
    return Promise.reject(`Cannot flatmap: ${JSON.stringify(ctx)}`);
  };
};

module.exports = flatmap;
