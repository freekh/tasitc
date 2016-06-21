const apply = (argFun) => {
  return (ctx) => {
    const [partialFun, partialArg] = argFun();
    return partialFun(() => partialArg)(ctx);
  };
};

module.exports = apply;
