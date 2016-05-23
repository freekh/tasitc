const h = require('hyperscript');

const render = (result, error) => {
  const root = h('div');
  const shadowRoot = root.createShadowRoot();
  if (error && error.msg) {
    shadowRoot.appendChild(h('div', error.msg));
  } else if (error && error instanceof Error) {
    shadowRoot.appendChild(h('div', error.message));
  } else if (result instanceof Array) {
    result.forEach(elem => {
      if (elem) {
        if (elem instanceof HTMLElement) {
          shadowRoot.appendChild(elem);
        } else {
          shadowRoot.appendChild(h('div', JSON.stringify(elem)));
        }
      }
    });
  } else if (result instanceof HTMLElement) {
    shadowRoot.appendChild(result);
  } else if (result instanceof Object) {
    shadowRoot.appendChild(h('div', JSON.stringify(result)));
  } else if (result) {
    shadowRoot.appendChild(h('div', JSON.stringify(result)));
  }
  return [
    root,
  ];
};

module.exports = render;
