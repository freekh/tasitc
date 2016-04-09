const hg = require('mercury')
const h = hg.h

const state = hg.state({
  value: hg.value(''),
  cursor: hg.value(0)
})
const render = (state) => {
  const highlight = state.value.slice(state.cursor, state.cursor + 1)
  return h('span.input', [
    h('span.pre-cursor', state.value.slice(0, state.cursor) ),
    h('span.cursor' + (highlight ? '' : '-empty'), highlight ? highlight : '_'),
    highlight ? h('span.post-cursor', state.value.slice(state.cursor + 1, state.value.length + 1) ) : null
  ])
}
const elem = document.getElementById('input')
hg.app(elem, state, render)

const delegator = hg.Delegator()
delegator.listenTo('keypress')
delegator.addGlobalEventListener('keypress', (ev) => {
  const char = String.fromCharCode(ev.keyCode)
  const current = state()
  const value = current.value.slice(0, current.cursor) + char + current.value.slice(current.cursor, current.value.length + 1)
  state.cursor.set(current.cursor + 1)
  state.value.set(value)
})

const historyUp = () => {
  console.log('arrow up')
}
const historyDown = () => {
  console.log('arrow down')
}
const moveCharRight = () => {
  const current = state()
  if (current.value.length > current.cursor) {
    state.cursor.set(current.cursor + 1)
  }
}
const moveCharLeft = () => {
  const current = state()
  if (current.cursor > 0) {
    state.cursor.set(current.cursor - 1)
  }
}
const backspace = () => {
  const current = state()
  const value = current.value.slice(0, current.cursor - 1) +
          current.value.slice(current.cursor, current.value.length + 1)
  state.cursor.set(current.cursor - 1)
  state.value.set(value)
}

const deleteWord = () => {
  const current = state()
  let value = current.value
  let cursor = current.cursor
  let char = value[cursor]
  while (cursor > 0 && (current.cursor === cursor || char !== ' ')) { //TODO: perf!?
    cursor -= 1
    char = value[cursor]
    value = value.slice(0, -1)
  }
  state.value.set(current.value.slice(0, cursor) + current.value.slice(current.cursor, current.value.length))
  state.cursor.set(cursor)
}

const moveLineEnd = () => {
  const current = state()
  state.cursor.set(current.value.length + 1)
}

const moveLineBegin = () => {
  state.cursor.set(0)
}

const killLine = () => {
  const current = state()
  state.value.set(current.value.slice(0, current.cursor))
}

delegator.listenTo('keydown')
delegator.addGlobalEventListener('keydown', (ev) => {
  if (ev.ctrlKey) {
    //console.log(ev.keyCode)
    switch(ev.keyCode) {
    case 8: deleteWord(); ev.preventDefault(); break
    case 69: moveLineEnd(); ev.preventDefault(); break
    case 65: moveLineBegin(); ev.preventDefault(); break
    case 75: killLine(); ev.preventDefault(); break
    }
  } else {
    switch(ev.keyCode) {
    case 8: backspace(); ev.preventDefault(); break
    case 37: moveCharLeft(); break
    case 38: historyDown(); break
    case 39: moveCharRight(); break
    case 40: historyUp(); break
    }
  }
})
