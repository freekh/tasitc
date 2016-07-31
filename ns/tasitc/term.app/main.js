const h = require('hyperscript');

const log = require('../../../code/dev-utils/log');
const request = require('../../../code/dev-utils/request');

const parse = require('../../../code/lang/parser/parse');

const tooltips = (cwd, value) => {
  return null;
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
  user: 'freekh', // FIXME: hardcoded
  cursor: 0,
};

let historyIndex = 0;
const historyMem = [];


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
  while (cursor > 0 && (
    global.cursor === cursor || (
      char !== ' ' && char !== '|' && char !== '\''))) { // TODO: perf!?
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

const enter = () => {
  const complete = () => {
    global.value = '';
    global.cursor = 0;
    updateView();
    window.scrollTo(0, elems.parent.offsetTop + elems.parent.offsetHeight);
  };

  const parseTree = parse(global.value);
  if (parseTree.status) {
    appendLastToHistory();
    request(
      '/tasitc/core/eval',
      { mime: 'application/json', type: 'POST', data: parseTree }
    ).then(res => {
      let resElem = h('div');
      if (res.mime.indexOf('text/html') !== -1) {
        const shadowRoot = resElem.createShadowRoot();
        shadowRoot.innerHTML = res.content;
      } else if (res.mime.indexOf('text/plain') !== -1) {
        resElem = h('div', res.content);
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
  } else {
    appendLastToHistory();
    parseError(parseTree).forEach(line => elems.history.appendChild(line));
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

// -------------------------- Key/operation buffer ----------------------------//

const execute = (key) => {
  if (key.char) {
    const { value, cursor } = insertText(global.value, global.cursor, key.char);
    global.cursor = cursor;
    global.value = value;
    updateView();
  } else if (key.code) {
    if (key.alt) {
      if (isMac) {
        switch (key.code) {
          case 8: deleteWord(); break;
          default: break;
        }
      }
      switch (key.code) {
        case 66: moveWordRight(); break;
        case 70: moveWordLeft(); break;
        default: break;
      }
    } else if (key.ctrl) {
      if (!isMac) {
        switch (key.code) {
          case 8: deleteWord(); break;
          default: break;
        }
      }
      switch (key.code) {
        case 65: moveLineBegin(); break;
        case 69: moveLineEnd(); break;
        case 75: killLine(); break;
        default: break;
      }
    } else if (key.shift) {
      switch (key.code) {
        case 8: break; // avoid chrome nav
        case 32: space(); break; // avoid chrome scroll
        default: break;
      }
    } else {
      switch (key.code) {
        case 8: backspace(); break;
        case 13: enter(); break;
        case 37: moveCharLeft(); break;
        case 38: historyUp(); break;
        case 39: moveCharRight(); break;
        case 40: historyDown(); break;
        default: break;
      }
    }
  } else {
    throw new Error(`Cannot execute key: ${JSON.stringify(key)}`);
  }
};

let keyBuffer = [];
const operationLoop = () => {
  const current = keyBuffer.slice();
  keyBuffer = [];
  current.forEach(execute);
  window.requestAnimationFrame(operationLoop);
};

window.addEventListener('keypress', ev => {
  const char = String.fromCharCode(ev.keyCode);
  keyBuffer.push({ char });
  ev.preventDefault();
});

window.addEventListener('keydown', ev => {
  const op = { ctrl: ev.ctrlKey, shift: ev.shiftKey, alt: ev.altKey, code: ev.keyCode };
  if (op.keyCode || op.ctrl || op.alt || op.code === 8) {
    keyBuffer.push(op);
    ev.preventDefault();
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

// -------------------------- Module ----------------------------//

module.exports = (arg, ctx) => {
  const root = document.getElementById('term');
  root.appendChild(parent);

  parent.appendChild(history);
  parent.appendChild(ps1(global.cwd, global.value));
  root.appendChild(completion);

  elems.parent.appendChild(elems.tooltip);
  elems.parent.appendChild(elems.preCursor);
  elems.parent.appendChild(elems.cursor);
  elems.cursor.innerText = ' ';
  elems.parent.appendChild(elems.postCursor);
  window.requestAnimationFrame(operationLoop);
};
