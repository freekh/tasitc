const P = require('parsimmon');

const ignore = (parser) => {
  return P.optWhitespace.then(parser).skip(P.optWhitespace);
};

const form = (expr) => {
  return P.string('(').then(expr).skip(P.string(')'));
};

class Marked {
  withMark(mark) {
    // TODO: reenable this
    //this.start = mark.start;
    //this.end = mark.end;
    return this;
  }
}

// --------- AST ----------

//
class Str extends Marked { // TODO: rename?
  constructor(value) {
    super();
    this.type = 'Str';
    this.value = value;
  }
}
Str.parser = P.lazy('Str', () => {
  const reify = (mark) => {
    const str = mark.value;
    return new Str(str).withMark(mark);
  };
  // FIXME:
  return P.string('\'').then(P.regex(/[\.a-zA-Z0-9:; {}\-]*/i))
    .skip(P.string('\''))
    .mark()
    .map(reify);
});

//
class Num extends Marked { // TODO: rename?
  constructor(value) {
    super();
    this.type = 'Num';
    this.value = value;
  }
}
Num.parser = P.lazy('Num', () => {
  const reify = (mark) => {
    const num = mark.value;
    return new Num(parseInt(num, 10)).withMark(mark);
  };
  return P.regex(/[0-9]+/i).mark().map(reify);
});

//
class Id extends Marked { // TODO: rename to Path?
  constructor(value) {
    super();
    this.type = 'Id';
    this.value = value;
  }
}
Id.parser = P.lazy('Id', () => {
  const reify = mark => {
    const id = mark.value;
    return new Id(id).withMark(mark);
  };
  return P.regex(/[~\/a-zA-Z\-0-9_]+/i).mark().map(reify);
});

//
class Subscript extends Marked { // [1][0]
  constructor(index) {
    super();
    this.type = 'Subscript';
    this.index = index;
  }
}
Subscript.parser = P.lazy('Subscript', () => {
  const reify = (mark) => {
    const num = mark.value;
    return new Subscript(num).withMark(mark);
  };
  return P.string('[').then(Num.parser).skip(P.string(']'))
    .mark()
    .map(reify);
});

//
class Attribute extends Marked { // foo.column
  constructor(attr) {
    super();
    this.type = 'Attribute';
    this.attr = attr;
  }
}
Attribute.parser = P.lazy('Attribute', () => {
  const reify = (mark) => {
    const id = mark.value;
    return new Attribute(id).withMark(mark);
  };
  return P.string('.').then(Id.parser)
    .mark()
    .map(reify);
});

//
class Context extends Marked { // $
  constructor(path = []) {
    super();
    this.type = 'Context';
    this.id = '$';
    this.path = path;
  }
}
Context.parser = P.lazy('Context', () => {
  const reify = (mark) => {
    const path = mark.value;
    return new Context(path).withMark(mark);
  };
  return P.string('$').then(P.alt(
    Subscript.parser,
    Attribute.parser
  ).many())
    .mark()
    .map(reify);
});

//
class Chain extends Marked {
  constructor(elements) {
    super();
    this.type = 'Chain';
    this.elements = elements;
  }
}
Chain.parser = P.lazy('Chain', () => {
  const reify = (mark) => {
    const elements = mark.value;
    if (elements.length === 1) {
      return elements[0];
    }
    return new Chain(elements).withMark(mark);
  };
  return ignore(P.sepBy1(P.alt(
    Context.parser,
    Instance.parser, // eslint-disable-line no-use-before-define
    List.parser, // eslint-disable-line no-use-before-define
    Call.parser // eslint-disable-line no-use-before-define
  ), ignore(P.string('|')))).mark().map(reify);
});

//
class List extends Marked {
  constructor(elements) {
    super();
    this.type = 'List';
    this.elements = elements;
  }
}
List.parser = P.lazy('List', () => {
  const reify = mark => {
    const elements = mark.value;
    return new List(elements).withMark(mark);
  };
  return P.string('[')
    .then(ignore(
      P.sepBy(
        Chain.parser,
        P.whitespace
      )))
    .skip(P.string(']'))
    .mark()
    .map(reify);
});

//
class Call extends Marked { // TODO: rename to Request? or Fn?
  constructor(id, arg) {
    super();
    this.type = 'Call';
    this.id = id;
    this.arg = arg;
  }
}
Call.parser = P.lazy('Call', () => {
  const expr = Id.parser.mark().chain(mark => { // FIXME: there is something fishy with this mark
    const id = mark.value;
    const reify = arg => {
      return new Call(id, arg || null).withMark(mark);
    };
    const argument = P.alt(
      form(Chain.parser),
      form(Str.parser),
      form(Id.parser),
      Context.parser,
      Keyword.parser, // eslint-disable-line no-use-before-define
      Parameter.parser, // eslint-disable-line no-use-before-define
      Str.parser,
      Id.parser
    );

    return P.alt(
      ignore(argument).map(reify),
      P.succeed(reify(null))
    );
  });
  return P.alt(
    form(ignore(expr)),
    ignore(expr)
  );
});

//
class Instance extends Marked {
  constructor(value) {
    super();
    this.type = 'Instance';
    this.value = value;
  }
}
Instance.parser = P.lazy('Instance', () => {
  const reify = mark => {
    const value = mark.value;
    return new Instance(value).withMark(mark);
  };
  return P.string('{')
    .then(P.seq(
      ignore(Str.parser).chain(key => {
        return ignore(P.string(':'))
          .then(Chain.parser)
          .map(call => {
            const value = {};
            value[key.value] = call;
            return value;
          });
      })
    ))
    .skip(P.string('}'))
    .mark()
    .map(reify);
});

//
class Keyword extends Marked {
  constructor(id, value) {
    super();
    this.type = 'Keyword';
    this.id = id;
    this.value = value;
  }
}
Keyword.parser = P.lazy('Keyword', () => {
  return P.string('--').then(P.letters.chain(id => {
    const reify = (mark) => {
      const value = mark.value;
      return new Keyword(id, value).withMark(mark);
    };
    return P.string('=')
      .then(P.alt(
        Context.parser,
        Num.parser,
        Str.parser,
        Call.parser
      )).mark()
      .map(reify);
  }));
});

//
class Parameter extends Marked {
  constructor(id) {
    super();
    this.type = 'Parameter';
    this.id = id;
  }
}
Parameter.parser = P.lazy('Parameter', () => {
  const reify = (mark) => {
    const id = mark.value;
    return new Parameter(id).withMark(mark);
  };
  const parameterId = P.regex(/[a-z_]*/i);
  return P.string('?').then(parameterId)
    .mark()
    .map(reify);
});

//
class Sink extends Marked { // TODO: rename to Write? or something else?
  constructor(expression, path) {
    super();
    this.type = 'Sink';
    this.expression = expression;
    this.path = path;
  }
}
Sink.parser = P.lazy('Sink', () => {
  return Chain.parser.skip(P.optWhitespace).chain(expression => {
    const reify = (mark) => {
      const path = mark.value;
      return new Sink(expression, path).withMark(mark);
    };
    return ignore(P.string('>')).
      then(Id.parser).
      mark().
      map(reify);
  });
});

//

const parse = (text) => {
  const result = P.alt(
    Sink.parser,
    Chain.parser
  ).parse(text);
  result.text = text;
  return result;
};

const uniq = array => { // TODO: go through this, its pasted in from somewhere (dumbass)
  const seen = {};
  const out = [];
  let j = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
};

const ast = {
  Sink,
  Chain,
  Call,
  Keyword,
  Parameter,
  Context,
  Attribute,
  Subscript,
  Id,
  Str,
  Num,
};

// TODO: move:
const error = (parseTree, text) => {
  const lines = [];
  lines.push('##############################');
  lines.push(text);
  lines.push('##############################');

  if (!parseTree.status) {
    lines.push(JSON.stringify(parseTree, null, 2));
  }
  if (parseTree.status === false) {
    let indents = '';
    let column = 0;
    let line = 1;
    for (let i = 0; i < parseTree.index; i++) {
      if (text[i] === '\n') {
        indents = '';
        column = 0;
        line += 1;
      } else {
        indents += '~';
        column += 1;
      }
    }
    lines.push('\x1b[91m', `\nFAILURE: line: ${line}, column: ${column}\n`, '\x1b[0m');
    lines.push(` ${text.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`);
    lines.push('\x1b[91m', `${indents}^`, '\x1b[0m');
    const context = text
            .split('\n')
            .slice(line, line + 3 <= text.length ? line + 3 : text.length)
            .join('\n');
    lines.push(`${context}`);
    const expected = uniq(parseTree.expected).join(' or ');
    const actual = text[parseTree.index] ? text[parseTree.index].replace('\n', '\\n') : 'EOF';
    lines.push('\x1b[91m', `Got: '${actual}'. Expected: ${expected}\n`, '\x1b[0m');
    return lines;
  }
  return [];
};

module.exports = {
  ast,
  parse,
  error,
};
