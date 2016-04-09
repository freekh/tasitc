const hg = require('mercury') //HACK: remove!
const h = hg.h

const execute = require('./execute')

//--------------------------- Global vars ------------------------------------//
const global = {
  value: '',
  cwd: 'freekh/tasitc-test',
  cursor: 0,
  block: false //listen guys, I don't like this any more than you do! I am not sure I even need it!
}

//----------------------------- Config ---------------------------------------//

const config = {
  cursor: '_'
}

//----------------------------- Helpers --------------------------------------//

const pre = (clazz) => {
  const elem = document.createElement('pre')
  elem.setAttribute('id', clazz)
  return elem
}

//                  ----------------------------                              //

const isMac = navigator.platform.indexOf('Mac') > -1

//------------------------------ View ----------------------------------------//

const elems = {
  parent: document.getElementById('input'),
  preCursor: pre('pre-cursor'),
  cursor: pre('cursor'),
  postCursor: pre('post-cursor'),
  history: document.getElementById('history')
}

elems.parent.appendChild(elems.preCursor)
elems.parent.appendChild(elems.cursor)
elems.cursor.innerText = ' '
elems.parent.appendChild(elems.postCursor)

//------------------------------ Update --------------------------------------//

const update = () => {
  const cursorLetter = global.value.slice(global.cursor, global.cursor + 1)
  elems.preCursor.innerText = global.value.slice(0, global.cursor)
  elems.cursor.innerText = cursorLetter
  if (cursorLetter) {
    elems.postCursor.innerText = global.value.slice(global.cursor + 1, global.value.length + 1)
    elems.postCursor.removeAttribute('class')
  } else {
    elems.postCursor.innerText = ' '
    elems.cursor.innerText = ' '
  }
}

//----------------------------- Keyboard --------------------------------------//

const moveCharLeft = () => {
  if (global.cursor > 0) {
    global.cursor = global.cursor - 1
    update()
  }
}

const moveCharRight = () => {
  if (global.value.length > global.cursor) {
    global.cursor = global.cursor + 1
    update()
  }
}

const backspace = () => {
  const value = global.value.slice(0, global.cursor - 1) +
          global.value.slice(global.cursor, global.value.length + 1)
  global.cursor = global.cursor - 1
  global.value = value
  update()
}

const deleteWord = () => {
  let value = global.value
  let cursor = global.cursor
  let char = value[cursor]
  while (cursor > 0 && (global.cursor === cursor || char !== ' ')) { //TODO: perf!?
    cursor -= 1
    char = value[cursor]
    value = value.slice(0, -1)
  }
  global.value = global.value.slice(0, cursor) + global.value.slice(global.cursor, global.value.length)
  global.cursor = cursor
  update()
}

const moveLineEnd = () => {
  global.cursor = global.value.length + 1
  update()
}

const moveLineBegin = () => {
  global.cursor = 0
  update()
}

const killLine = () => {
  global.value = global.value.slice(0, global.cursor)
  update()
}

const historyUp = () => {
  console.log('arrow up')
}
const historyDown = () => {
  console.log('arrow down')
}

const moveWordRight = () => {
  let value = global.value
  let cursor = global.cursor
  while (cursor > 0 && (
    !value[cursor] ||
    value[cursor] === ' ' ||
    (cursor === global.cursor || value[cursor - 1] !== ' ')
  )) { //TODO: perf!?
    cursor -= 1
  }
  global.cursor = cursor
  update()
}

const moveWordLeft = () => {
  let value = global.value
  let cursor = global.cursor
  while (cursor < value.length && (
    value[cursor] === ' ' ||
    (cursor === global.cursor || value[cursor + 1] !== ' ')
  )) { //TODO: perf!?
    cursor += 1
  }
  global.cursor = cursor
  elems.input
  update()
}


const enter = () => {
  //HACK: :(
  const saveLast = () => {
    elems.history.appendChild(hg.create(h('div.line', [
      h('span.path', global.cwd + ' '),
      h('span.path-sep', '⮀'),
      h('span.branch', ' ⭠ master '),
      h('span.branch-sep', '⮀ '),
      h('span', global.value)
    ])))
  }
  const complete = () => {
    global.block = false
    global.value = ''
    global.cursor = 0
    update()
    window.scrollTo(0, elems.parent.offsetTop)
  }

  global.block = true
  execute(global.cwd, global.value).then(res => {
    saveLast()
    res.forEach(elem => {
      elems.history.appendChild(elem)
    })
    complete()
  }).catch(err => {
    saveLast()
    elems.history.appendChild(hg.create(h('div', 'Unknown command: ' + err)))
    complete()
    throw new Error(err)
  })

}

//------------------------------ Events --------------------------------------//

window.addEventListener('keypress', ev => {
  if (!global.block) {
    if (!ev.ctrlKey && !ev.altKey && !ev.metaKey) {
      const char = String.fromCharCode(ev.keyCode)
      const value = global.value.slice(0, global.cursor) + char + global.value.slice(global.cursor, global.value.length + 1)
      global.cursor += 1
      global.value = value
      update()
    }
  }
})


window.addEventListener('keydown', ev => {
  if (!global.block) {
    if (ev.ctrlKey) {
      switch (ev.keyCode) {
        case 65: moveLineBegin(); ev.preventDefault(); break
        case 69: moveLineEnd(); ev.preventDefault(); break
        case 75: killLine(); ev.preventDefault(); break
      }
    } else if ((isMac && ev.altKey || !isMac && ev.ctrlKey)) {
      switch (ev.keyCode) {
        case 8: deleteWord(); ev.preventDefault(); break
        case 66: moveWordRight(); ev.preventDefault(); break
        case 70: moveWordLeft(); ev.preventDefault(); break
      }
    } else {
      switch (ev.keyCode) {
        case 8: backspace(); ev.preventDefault(); break
        case 13: enter(); ev.preventDefault(); break
        case 37: moveCharLeft(); break
        case 38: historyDown(); break
        case 39: moveCharRight(); break
        case 40: historyUp(); break
      }
    }
  }
})
