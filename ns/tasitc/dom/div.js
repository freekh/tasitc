const selector = /^(#[\w|\-]+?)?\.([\w|\-|\.]+)*$/;

(ctx, arg, modifier, { primitives }) => {
  const props = {};
  if (modifier) {
    const matches = selector.exec(modifier);
    if (matches) {
      if (matches[1]) {
        props.id = matches[1];
      }
      if (matches[2]) {
        props.class = matches[2].split('.').join(' ');
      }
    }
  }
  return new primitives.DomElement('div', props, arg || ctx || '');
};
