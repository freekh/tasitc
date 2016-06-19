const ifte = (form) => {
  return ($) => {
    return Promise.resolve(form($) instanceof Promise ? form($) : Promise.resolve(form($))).then(argsResponse => {
      const args = argsResponse.content;
      const predicat = args[0] instanceof Promise ? args[0] : Promise.resolve(args[0]);
      const left = args[1] instanceof Promise ? args[1] : Promise.resolve(args[1]);
      const right = args[2] instanceof Promise ? args[2] : Promise.resolve(args[2]);

      return Promise.all([predicat, left, right]).then(([predicat, left, right]) => {
        if (!predicat || !left || !right) {
          throw new Error('Predicat/left/right missing (TODO: err msg)');
        }
        if (predicat.content) {
          return left;
        }
        return right;
      });
    });
  };
};

module.exports = ifte;
