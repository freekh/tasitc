const regex = (argFun) => {
  return (ctx) => {
    const str = argFun(ctx);
    if (typeof str === 'string' && typeof ctx === 'string') {
      return new RegExp(str, 'i').test(ctx);
    }
    return false;
  };
};

module.exports = regex;
