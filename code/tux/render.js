const h = require('hyperscript');

const render = (result, error) => {
  if (error && error.msg) {
    return [
      h('div', error.msg),
    ];
  } else if (error) {
    return [
      h('div', JSON.stringify(error)),
    ];
  } else if (result instanceof Array) {
    const root = h('div');
    const shadowRoot = root.createShadowRoot();
    result.forEach(elem => {
      if (elem) {
        shadowRoot.appendChild(elem);
      }
    });
    return [
      root,
    ];
  } else if (result instanceof HTMLElement) {
    const root = h('div');
    const shadowRoot = root.createShadowRoot();
    shadowRoot.appendChild(result);
    return [
      root,
    ];
  } else if (result instanceof Object) {
    return [
      h('div', 'TODO: display object' + JSON.stringify(result)),
    ];
  } else if (result) {
    console.log('??', result);
    return [
      h('div', String(result)),
    ];
  }
  throw new Error('No result or error');
};

module.exports = render;
