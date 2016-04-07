
const aliases = {
  'html': '/html',
  'str': '/str',
  'env': '~/.env'
}


const paths = {
  '~/.env': {
    '.': 'request ',
    'config': '{tasitc: "http://localhost:8080/tasitc"}'
  },
  '/html': {
    '.': `request (str (env/config | &.tasitc) 'html')`
  }
}


//transforms/reduces an expression to only requests and atoms
//on client: request checks url and checks wether it can be called directly
//on server: request checks which requests are tasitc requests and executes them directly
module.exports = (expr) => {
  const applyValue = (value) => {
    if (value.path) {
      const realpath = aliases[value.path] || value.path
      paths[value.path]
      return
    }
  }
  applyValue(expr.value)
}
