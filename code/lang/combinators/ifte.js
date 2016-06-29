const ifte = (argFun) => {
  return (ctx) => {
    const [predicat, left, right] = argFun(ctx);
    if (predicat) {
      return left;
    }
    return right;
  };
};

module.exports = ifte;
