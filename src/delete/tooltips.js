const index = {
  'ls': 'list directory contents',
  'help': 'display documentation'
}

const tooltips = (cwd, value) => {
  if (!value) {
    return null
  }
  const cmds = Object.keys(index)
  for (const cmd of cmds) {
    if (cmd.startsWith(value.trim())) {
      return index[cmd]
    }
  }
  return null
}

module.exports = tooltips
