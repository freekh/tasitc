const flatmap = (argFun) => {
  return (ctx) => {
    if (ctx && ctx.reduce) {
      const thisArgFun = argFun || (value => value);
      return Promise.all(ctx.reduce((acc, curr) => {
        return [].concat(acc, thisArgFun(curr));
      }, []));
    }
    return Promise.reject(`Cannot flatmap: ${JSON.stringify(ctx)}`);
  };
};

module.exports = flatmap;
