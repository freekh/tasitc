(ctx, arg, modifier, { primitives }) => {
  return new primitives.DomElement('h1', { id: modifier.slice(1) }, arg || ctx);
};
