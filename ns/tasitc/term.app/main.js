const xtend = require('xtend');
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
  return true;
};

const moveCharRight = () => {
  if (global.value.length > global.cursor) {
    global.cursor = global.cursor + 1;
    updateView();
  }
  return true;
};

const backspace = () => {
  const value = global.value.slice(0, global.cursor - 1) +
          global.value.slice(global.cursor, global.value.length + 1);
  global.cursor = global.cursor - 1;
  global.value = value;
  updateView();
  return true;
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
  return true;
};

const moveLineEnd = () => {
  global.cursor = global.value.length + 1;
  updateView();
  return true;
};

const moveLineBegin = () => {
  global.cursor = 0;
  updateView();
  return true;
};

const killLine = () => {
  global.value = global.value.slice(0, global.cursor);
  updateView();
  return true;
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
  return true;
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
  return true;
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
  return true;
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
  return true;
};

const appendLastToHistory = () => {
  historyMem.push({ cwd: global.cwd, value: global.value });
  historyIndex = historyMem.length;
  elems.history.appendChild(ps1(global.cwd, global.value));
  return true;
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
  return true;
};

const space = () => {
  const char = ' ';
  const { value, cursor } = insertText(global.value, global.cursor, char);
  global.cursor = cursor;
  global.value = value;
  updateView();
  return true;
};

// -------------------------- Key/operation buffer ----------------------------//

const shortcutsMac = {
  'alt=true;shift=false;ctrl=false;code=8': deleteWord,

};

const shortcutsPc = {
  'alt=false;shift=false;ctrl=true;code=8': deleteWord,
};

const shortcuts = xtend({
  'alt=true;shift=false;ctrl=false;code=66': moveWordRight,
  'alt=true;shift=false;ctrl=false;code=70': moveWordLeft,

  'alt=false;shift=false;ctrl=true;code=65': moveLineBegin,
  'alt=false;shift=false;ctrl=true;code=69': moveLineEnd,
  'alt=false;shift=false;ctrl=true;code=75': killLine,

  'alt=false;shift=true;ctrl=false;code=8': true, // chrome: prevent nav
  'alt=false;shift=true;ctrl=false;code=32': space, // chrome: prevent scroll

  'alt=false;shift=false;ctrl=false;code=8': backspace,
  'alt=false;shift=false;ctrl=false;code=13': enter,
  'alt=false;shift=false;ctrl=false;code=32': space,
  'alt=false;shift=false;ctrl=false;code=37': moveCharLeft,
  'alt=false;shift=false;ctrl=false;code=38': historyUp,
  'alt=false;shift=false;ctrl=false;code=39': moveCharRight,
  'alt=false;shift=false;ctrl=false;code=40': historyDown,
}, isMac ? shortcutsMac : shortcutsPc);

const execute = (op) => {
  if (typeof op === 'string') {
    const { value, cursor } = insertText(global.value, global.cursor, op);
    global.cursor = cursor;
    global.value = value;
    updateView();
    return true;
  } else if (op instanceof Function) {
    return op();
  }
  throw new Error(`Cannot execute op: ${JSON.stringify(op)}`);
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
  keyBuffer.push(char);
  ev.preventDefault();
});

window.addEventListener('keydown', ev => {
  const shortcut = shortcuts[`alt=${ev.altKey};shift=${ev.shiftKey};` +
                             `ctrl=${ev.ctrlKey};code=${ev.keyCode}`];
  if (shortcut) {
    keyBuffer.push(shortcut);
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
