const ifte = (argFun) => {
  return (ctx) => {
    const [predicat, left, right] = argFun(ctx);
    console.log('ifte', ctx, predicat, left, right);
    if (predicat) {
      return left;
    }
    return right;
  };
};

module.exports = ifte;
