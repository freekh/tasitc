const ifte = (form) => {
  return ($) => {
    return Promise.resolve(form($) instanceof Promise ? form($) : Promise.resolve(form($))).then(argsResponse => {
      const args = argsResponse.content;
      const predicat = args[0] instanceof Promise ? args[0] : Promise.resolve(args[0]);
      const left = args[0] instanceof Promise ? args[0] : Promise.resolve(args[0]);
      const right = args[1] instanceof Promise ? args[1] : Promise.resolve(args[1]);

      return Promise.all([predicat, left, right]).then(([predicat, left, right]) => {
        if (predicat === undefined || left === undefined || right === undefined) {
          throw new Error('Predicat/left/right missing (TODO: err msg)');
        }
        if (predicat) {
          return {
            
            content: left,
          }
        }
        return right;
      });
    });
  };
};

module.exports = ifte;
