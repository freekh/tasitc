'use strict'

const P = require('parsimmon')

const ignore = (parser) => P.optWhitespace.then(parser).skip(P.optWhitespace)

const form  = (expr) => {
  return P.string('(').then(expr).skip(P.string(')'))
}

//TODO: move
class Sink {
  constructor(expression, path) {
    this.expression = expression
    this.path = path
  }
}
Sink.parser = P.lazy('Sink', () => {
  return Comprehension.parser.chain(result => {
    return ignore(P.string('>')).then(Id.parser)
  })
})

class Comprehension {
  constructor(expression, targets = []) {
    this.expression = expression
    this.targets = targets
  }
}
Comprehension.parser = P.lazy('Comprehension', () => {
  return ignore(P.sepBy1(P.alt(
    Obj.parser,
    Call.parser
  ), ignore(P.string('|'))))
})


class Call { //TODO: rename to Request?
  constructor(id, args = [], keywords = {}) {
    this.id = id
    this.args = args
    this.keywords = keywords
  }
}
Call.parser = P.lazy('Call', () => {
  const expr = Id.parser.chain(result => {
    return P.alt(
      P.whitespace
        .then(
          P.sepBy(Argument.parser, P.whitespace)
        ),
      P.optWhitespace
    )
  })
  return P.alt(
    form(ignore(expr)),
    ignore(expr)
  )
})


class Argument {
  constructor(value, position) {
    this.value = value
    this.position = position
  }

  static parser() {
    return P.alt(
      Parameter.parser,
      Str.parser,
      Id.parser
    )
  }
}
Argument.parser = P.lazy('Argument', () => {
  return P.alt(
    form(Comprehension.parser),
    form(Str.parser),
    form(Id.parser),
    Keyword.parser,
    Parameter.parser,
    Str.parser,
    Id.parser
  )
})

class Keyword {
  constructor(id, value) {
    this.id = id
    this.value = value
  }
}
Keyword.parser = P.lazy('Keyword', () => {
  return P.string('--').then(P.letters.chain(result => {
    return P.string('=').then(Call.parser)
  }))
})

class Parameter {
  constructor(id) {
    this.id = id
  }
}
Parameter.parser = P.lazy('Parameter', () => {
  const parameterId = P.regex(/[a-z_]*/i)
  return P.string('?').then(parameterId)
})

class Obj {
  //TODO
}
Obj.parser = P.lazy('Obj', () => {
  return P.alt(
    //TODO: other objects?
    Context.parser
  ).chain(result => {
    const path = P.alt(
      Subscript.parser,
      Attribute.parser.chain(result => {
        return Subscript.parser
      }),
      Attribute.parser
    ).many()
    return path
  })
})

class Context { //$
  constructor() {
    this.id = '$'
  }
}
Context.parser = P.string('$')

class Attribute { //foo.column
  constructor(value, attr) {
    this.value = value
    this.attr = attr
  }
}
Attribute.parser = P.lazy('Attribute', () => {
  return P.string('.').then(Id.parser)
})


class Subscript { //[1][0]
  constructor(value, index) {
    this.value = value
    this.index = index
  }
}
Subscript.parser = P.lazy('Subscript', () => {
  return P.string('[').then(Num.parser).skip(P.string(']'))
})

class Id { //TODO: rename to Path?
  constructor(value) {
    this.value = value
  }
}
Id.parser = P.lazy('Id', () => {
  return P.regex(/[\~\/a-z\-0-9_]*/i)
})

class Str { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}
Str.parser = P.lazy('Str', () => {
  //FIXME:
  return P.string('\'').then(P.regex(/[\.a-z0-9]*/i)).skip(P.string('\''))
})

class Num { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}
Num.parser = P.lazy('Num', () => {
  return P.regex(/[0-9]*/i)
})

//


module.exports = {
  parse: (input) => {
    return P.alt(
      Sink.parser,
      Comprehension.parser
    ).parse(input)
  }
}
