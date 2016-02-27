const hg = require('mercury')
const h = hg.h

const preview = (parent) => {
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
    }
    return null
  }
  return valueAsJs(parent)
}

module.exports = preview
