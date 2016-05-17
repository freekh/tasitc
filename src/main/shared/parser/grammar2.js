'use strict'

const P = require('parsimmon')

const ignore = (parser) => P.optWhitespace.then(parser).skip(P.optWhitespace)

//TODO: move
class Sink {
  constructor(expression, path) {
    this.expression = expression
    this.path = path
  }
}

class Comprehension {
  constructor(expression, targets = []) {
    this.expression = expression
    this.targets = targets
  }

  static parser() {
    return P.lazy('Comprehension', () => {
      return ignore(Call.parser())
    })
  }
}

class Call { //TODO: rename to Request?
  constructor(id, args = [], keywords = {}) {
    this.id = id
    this.args = args
    this.keywords = keywords
  }

  static parser() {
    return P.lazy('Keyword', () => {
      return Id.parser().chain(result => {
        return P.whitespace.then(P.optWhitespace).then(
          P.alt(
            Argument.parser().many().then(Keyword.parser().many()),
            Keyword.parser().many(),
            Argument.parser().many()
          ))
      })
    })
  }
}

class Attribute { //foo.column
  constructor(value, attr) {
    this.value = value
    this.attr = attr
  }
}

class Argument {
  constructor(value, position) {
    this.value = value
    this.position = position
  }

  static parser() {
    return P.lazy('Argument', () => {
      return P.regex(/[\/a-z_]*/i)
    })
  } 
}

class Keyword {
  constructor(id, value) {
    this.id = id
    this.value = value
  }

  static parser() {
    return P.lazy('Keyword', () => {
      return P.string('--').then(P.letters.chain(result =>  {
        return P.string('=').then(P.string('(').then(Call.parser().map(rs => {
          console.log(rs)
          return rs
        })).skip(P.string(')')))
      }))
    })
  }
}

class Parameter {
  constructor(id) {
    this.id = id
  }
}

class Context { //$
  constructor() {
    this.id = '$'
  }
}

class Subscript { //[1][0]
  constructor(value, index) {
    this.value = value
    this.index = index
  }
}

class Id { //TODO: rename to Path?
  constructor(value) {
    this.value = value
  }

  static parser() {
    return P.lazy('Id', () => {
      return P.regex(/[\/a-z_]*/i)
    })
  }
}

class Str { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}

class Num { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}

//


module.exports = {
  parse: (input) => {
    return Comprehension.parser().parse(input)
  }
}
