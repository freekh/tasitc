const h = require('hyperscript');

const log = require('../misc/log');

const transpile = require('../lang/transpile');
const parse = require('../lang/parser/parse');
const normalize = require('../misc/normalize');

const tooltips = (cwd, value) => {
  const elem = value === 'ls' ? h('span', 'ls: bla bla') : null;
  return elem;
};

// ----------------------------- Helpers --------------------------------------//

const pre = (clazz) => {
  const elem = document.createElement('pre');
  elem.setAttribute('id', clazz);
  return elem;
};

const clear = (elem) => {
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
};

// --------------------------- Global vars ------------------------------------//
const global = {
  value: '',
  cwd: '~',
  cursor: 0,
  // listen guys, I don't like this any more than you do! I am not sure I even need it!
  block: false,
};

// Fake:
const aliases = {
  ls: '/tasitc/ns/ls',
  html: '/tasitc/dom/html',
  body: '/tasitc/dom/body',
  head: '/tasitc/dom/head',
  style: '/tasitc/dom/style',
  div: '/tasitc/dom/div',
  ul: '/tasitc/dom/ul',
  li: '/tasitc/dom/li',
};

let historyIndex = 0;
const historyMem = [];

let completionIndex = 0;
let completionDialog = false;

//                  ----------------------------                              //

const isMac = navigator.platform.indexOf('Mac') > -1;

const insertText = (value, cursor, text) => {
  const updatedValue = value.slice(0, cursor) + text + value.slice(cursor, value.length + 1);
  return {
    value: updatedValue,
    cursor: cursor + text.length,
  };
};


// ------------------------------ View ----------------------------------------//

// ------------------------------ PS 1 ----------------------------------------//

const ps1 = (cwd, value) => h('div#ps1.line', [
  h('pre', ' '),
  h('span.path', ` ${cwd} `),
  h('span.path-sep', '⮀'),
  h('span.branch', ' ⭠ master '),
  h('span.branch-sep', '⮀ '),
  h('span#input', value),
]);

// ---------------------------- Tooltip --------------------------------------///
const tooltip = () => {
  const tooltipElem = document.createElement('div');
  tooltipElem.setAttribute('class', 'tooltip');
  tooltipElem.hide = () => {
    tooltipElem.setAttribute('style', 'display:none;');
    return tooltipElem;
  };
  tooltipElem.show = () => {
    tooltipElem.removeAttribute('style');
    return tooltipElem;
  };
  tooltipElem.set = (elem) => {
    clear(tooltipElem);
    tooltipElem.appendChild(elem);
    return tooltipElem;
  };
  return tooltipElem;
};

// ------------------------------ Elems ---------------------------------------//

const root = document.getElementById('term');
const parent = h('div#parent');
const history = h('div#history');
const completion = h('div#completion');

const elems = {
  parent,
  history,
  completion,
  preCursor: pre('pre-cursor'),
  cursor: pre('cursor'),
  postCursor: pre('post-cursor'),
  tooltip: tooltip().hide(),
};

root.appendChild(parent);
parent.appendChild(history);
parent.appendChild(ps1(global.cwd, global.value));
root.appendChild(completion);

elems.parent.appendChild(elems.tooltip);
elems.parent.appendChild(elems.preCursor);
elems.parent.appendChild(elems.cursor);
elems.cursor.innerText = ' ';
elems.parent.appendChild(elems.postCursor);

// ------------------------------ Update --------------------------------------//

const updateView = () => {
  const cursorLetter = global.value.slice(global.cursor, global.cursor + 1);
  elems.preCursor.innerText = global.value.slice(0, global.cursor);
  elems.cursor.innerText = cursorLetter;
  if (cursorLetter) {
    elems.postCursor.innerText = global.value.slice(global.cursor + 1, global.value.length + 1);
    elems.postCursor.removeAttribute('class');
  } else {
    elems.postCursor.innerText = ' ';
    elems.cursor.innerText = ' ';
  }

  const currentTooltip = tooltips(global.cwd, global.value);
  if (currentTooltip) {
    elems.tooltip.show().set(currentTooltip);
  } else {
    elems.tooltip.hide();
  }
};

// ----------------------------- Keyboard --------------------------------------//

const moveCharLeft = () => {
  if (global.cursor > 0) {
    global.cursor = global.cursor - 1;
    updateView();
  }
};

const moveCharRight = () => {
  if (global.value.length > global.cursor) {
    global.cursor = global.cursor + 1;
    updateView();
  }
};

const backspace = () => {
  const value = global.value.slice(0, global.cursor - 1) +
          global.value.slice(global.cursor, global.value.length + 1);
  global.cursor = global.cursor - 1;
  global.value = value;
  updateView();
};

const deleteWord = () => {
  let value = global.value;
  let cursor = global.cursor;
  let char = value[cursor];
  while (cursor > 0 && (global.cursor === cursor || char !== ' ')) { // TODO: perf!?
    cursor -= 1;
    char = value[cursor];
    value = value.slice(0, -1);
  }
  global.value = global.value.slice(0, cursor) +
    global.value.slice(global.cursor, global.value.length);
  global.cursor = cursor;
  updateView();
};

const moveLineEnd = () => {
  global.cursor = global.value.length + 1;
  updateView();
};

const moveLineBegin = () => {
  global.cursor = 0;
  updateView();
};

const killLine = () => {
  global.value = global.value.slice(0, global.cursor);
  updateView();
};

const historyUp = () => {
  const updatedHistoryIndex = historyIndex - 1;
  const historyElem = historyMem[updatedHistoryIndex];
  if (updatedHistoryIndex < historyMem.length && updatedHistoryIndex >= 0 && historyElem) {
    historyIndex = updatedHistoryIndex;
    global.value = historyMem[historyIndex].value;
  } else {
    global.value = '';
  }
  global.cursor = global.value.length + 1;
  updateView();
};

const historyDown = () => {
  // TODO: refactor with history up
  const updatedHistoryIndex = historyIndex + 1;
  const historyElem = historyMem[updatedHistoryIndex];
  if (updatedHistoryIndex < historyMem.length && updatedHistoryIndex >= 0 && historyElem) {
    historyIndex = updatedHistoryIndex;
    global.value = historyMem[historyIndex].value;
  } else {
    global.value = '';
  }
  global.cursor = global.value.length + 1;
  updateView();
};

const moveWordRight = () => {
  const value = global.value;
  let cursor = global.cursor;
  while (cursor > 0 && (
    !value[cursor] ||
    value[cursor] === ' ' ||
    (cursor === global.cursor || value[cursor - 1] !== ' ')
  )) { // TODO: perf!?
    cursor -= 1;
  }
  global.cursor = cursor;
  updateView();
};

const moveWordLeft = () => {
  const value = global.value;
  let cursor = global.cursor;
  while (cursor < value.length && (
    value[cursor] === ' ' ||
    (cursor === global.cursor || value[cursor + 1] !== ' ')
  )) { // TODO: perf!?
    cursor += 1;
  }
  global.cursor = cursor;
  updateView();
};

const appendLastToHistory = () => {
  historyMem.push({ cwd: global.cwd, value: global.value });
  historyIndex = historyMem.length;
  elems.history.appendChild(ps1(global.cwd, global.value));
};


const tab = () => {
  console.log('TODO');
};

const tabUp = () => {
  console.log('TODO');
};

const tabDown = () => {
  console.log('TODO');
};

const escape = () => {
  clear(elems.completion);
  completionDialog = false;
};

const lookup = (id) => {
  const content = {
    path: normalize(global.cwd, aliases, id), // FIXME: global == danger
    type: 'get',
  };
  return ($) => {
    return Promise.resolve({
      status: 200,
      mime: 'text/plain',
      content,
    });
  };
};

const enter = () => {
  const complete = () => {
    global.block = false;
    global.value = '';
    global.cursor = 0;
    updateView();
    window.scrollTo(0, elems.parent.offsetTop + elems.parent.offsetHeight);
  };

  const parseTree = parse(global.value);
  if (parseTree.status) {
    global.block = true;
    appendLastToHistory();

    const fn = transpile(parseTree.value, lookup, parseTree.text, { cwd: global.cwd });
    const fakeReq = Promise.resolve({
      request: { verb: 'get', path: '/tasitc/term/freekh' },
      status: 200,
      mime: 'application/json',
      content: { cwd: '/freekh', params: {} },
    });
    fn(fakeReq).then(res => {
      let resElem = h('div');
      if (res.mime === 'text/html') {
        const shadowRoot = resElem.createShadowRoot();
        shadowRoot.innerHTML = res.content;
      } else {
        resElem = h('div', JSON.stringify(res.content));
      }
      elems.history.appendChild(resElem);
      complete();
    }).catch(err => {
      elems.history.appendChild(h('div', JSON.stringify(err)));
      complete();
      throw err;
    });
  } else if (parseTree.expected.indexOf("']'") !== -1 ||
             parseTree.expected.indexOf("')'") !== -1) {
    const { value, cursor } = insertText(global.value, global.cursor, '\n');
    global.cursor = cursor;
    global.value = value;
    updateView();
  } else {
    global.block = true;
    appendLastToHistory();

    elems.history.appendChild(h('div', `Parse error: ${JSON.stringify(parseTree)}`));
    complete();
  }
};

const space = () => {
  const char = ' ';
  const { value, cursor } = insertText(global.value, global.cursor, char);
  global.cursor = cursor;
  global.value = value;
  updateView();
};

// ------------------------------ Events --------------------------------------//

window.addEventListener('keypress', ev => {
  if (!global.block) {
    if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
      const char = String.fromCharCode(ev.keyCode);
      const { value, cursor } = insertText(global.value, global.cursor, char);
      global.cursor = cursor;
      global.value = value;
      updateView();
    }
  }
});


window.addEventListener('keydown', ev => {
  if (!global.block) {
    if (ev.altKey) {
      if (isMac) {
        switch (ev.keyCode) {
          case 8: deleteWord(); ev.preventDefault(); break;
          default: break;
        }
      }
      switch (ev.keyCode) {
        case 66: moveWordRight(); ev.preventDefault(); break;
        case 70: moveWordLeft(); ev.preventDefault(); break;
        default: break;
      }
    } else if (ev.ctrlKey) {
      if (!isMac) {
        switch (ev.keyCode) {
          case 8: deleteWord(); ev.preventDefault(); break;
          default: break;
        }
      }
      switch (ev.keyCode) {
        case 65: moveLineBegin(); ev.preventDefault(); break;
        case 69: moveLineEnd(); ev.preventDefault(); break;
        case 75: killLine(); ev.preventDefault(); break;
        default: break;
      }
    } else if (completionDialog) {
      switch (ev.keyCode) {
        case 13: escape(); enter(); ev.preventDefault(); break;
        case 27: escape(); ev.preventDefault(); break;
        case 38: tabUp(); ev.preventDefault(); break;
        case 40: tabDown(); ev.preventDefault(); break;
        default: break;
      }
    } else if (ev.shiftKey) {
      switch (ev.keyCode) {
        case 8: ev.preventDefault(); break; // avoid chrome nav
        case 32: space(); ev.preventDefault(); break; // avoid chrome scroll
        default: break;
      }
    } else {
      switch (ev.keyCode) {
        case 8: backspace(); ev.preventDefault(); break;
        case 9: tab(); ev.preventDefault(); break;
        case 13: enter(); ev.preventDefault(); break;
        case 37: moveCharLeft(); ev.preventDefault(); break;
        case 38: historyUp(); ev.preventDefault(); break;
        case 39: moveCharRight(); ev.preventDefault(); break;
        case 40: historyDown(); ev.preventDefault(); break;
        default: break;
      }
    }
  }
});

window.addEventListener('paste', ev => {
  let pastedText = '';
  if (ev.clipboardData && ev.clipboardData.getData) {
    pastedText = ev.clipboardData.getData('text/plain');
  } else {
    log.warn('paste event unrecognized. wat browser is this?', ev);
  }
  const { value, cursor } = insertText(global.value, global.cursor, pastedText);
  global.value = value;
  global.cursor = cursor;
  updateView();
});

// HACK: really. redo this!
let pathSelectElem = null;
window.addEventListener('mouseover', ev => {
  if (pathSelectElem) { // HACK: ???
    const isParent = (elem, target) => {
      if (target === null) {
        return false;
      } else if (target === elem) {
        return true;
      }
      return isParent(elem, target.parentElement);
    };
    if (!isParent(pathSelectElem, ev.srcElement)) {
      pathSelectElem.remove();
      pathSelectElem = null;
    }
  } else {
    const pathElem = ev.target && ev.target.getAttribute('class') === 'path' && ev.target;
    if (pathElem) {
      pathSelectElem = h('div.clux2-path-selector', { style: { position: 'absolute' } });
      pathSelectElem.style.top = pathElem.offsetTop;
      pathSelectElem.style.left = pathElem.offsetLeft;
      const lineHeight = pathElem.offsetHeight;
      const listLeft = pathElem.offsetLeft;
      pathSelectElem.appendChild(
        h('ul', {
          style: {
            'min-width': `${pathElem.offsetWidthpx}`,
            top: `${lineHeight}px`,
            left: `${listLeft}px`,
          },
        }, [
          h('li', '..'),
          h('li', 'dir'),
        ])
      );
      pathSelectElem.style.minHeight = pathElem.offsetHeight;
      pathSelectElem.style.minWidth = pathElem.offsetWidth;
      document.body.appendChild(pathSelectElem);
      window.scrollTo(0, pathSelectElem.offsetTop + pathSelectElem.offsetHeight);
    }
  }
});
