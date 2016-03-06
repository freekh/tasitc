const hg = require('mercury')
const h = hg.h

const preview = (parent, user) => {
  if (!parent) {
    return null
  }

  const argAsJs = (arg) => {
    if (arg && arg.atom === 'string') {
      return arg.value
    } else if (arg && arg.path) {
      const children = arg.args ? arg.args.map(argAsJs) : null
      if (typeof children[0] === 'string' && children.length > 1) {
        return h.apply(null, [arg.path + children[0], children.slice(1)])
      } else {
        return h.apply(null, [arg.path, children])
      }
    } else if (arg && arg.constructor === Array){
      return arg.map(argAsJs)
    }
    return null
  }
  const valueAsJs = (value) => {
    if (value.path === 'html') {
      if (value.args[1] && !value.args[1].atom) {
        throw Error('Unexpected css value???')
      }
      const css = value.args[1] && value.args[1].atom === 'string' ? value.args[1].value : null
      const dom = argAsJs(value.args[0])
      return {
        css,
        dom
      }
    } else if (value.save) {
      return {
        dom: h('div.Result-Save', [
          h('span', 'Saving to:'),
          h('a', {href: value.save.replace(/~/, user)}, value.save)
        ]),
        css: '.Result-Save { font-size: 30px; text-align: center; } a { color: #000; }'
      }
    }
    return null
  }
  console.log('res',  valueAsJs(parent))
  return valueAsJs(parent)
}

module.exports = preview
