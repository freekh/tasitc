const h = require('hyperscript');

const render = (result, error) => {
  let hack = null;
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
          if (elem.file !== undefined && elem.path && elem.dir !== undefined) { // FIXME: ugly hack to render ls
            // FIXME: OMG, this is ugly
            if (!hack) hack = h('div');
            hack.appendChild(h('div.output-line', [
              elem.dir ? h('span.icon', h('i.fa.fa-caret-right')) : null,
              elem.dir ? h('span.icon', h('i.fa.fa-folder')) : null,
              !elem.dir ? h('span.icon.padded', h('i.fa.fa-file')) : null,
              h('span.filename', elem.path),
            ]));
          } else {
            shadowRoot.appendChild(h('div', JSON.stringify(elem)));
          }
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
    hack,
  ];
};

module.exports = render;
