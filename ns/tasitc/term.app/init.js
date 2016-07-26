(arg, ctx, { h }) => { // eslint-disable-line no-unused-expressions
  return {
    elements: [h('div#term')],
    styles: ['scss /tasitc/term.app/main.scss'],
    main: 'browserify /tasitc/term.app/main.js',
  };
};
