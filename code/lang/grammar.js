const P = require('parsimmon');

const ignore = (parser) => {
  return P.optWhitespace.then(parser).skip(P.optWhitespace);
};

const form = (expr) => {
  return P.string('(').then(expr).skip(P.string(')'));
};

class Marked {
  withMark(mark) {
    this.start = mark.start;
    this.end = mark.end;
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
class Comprehension extends Marked {
  constructor(expression, targets = []) {
    super();
    this.type = 'Comprehension';
    this.expression = expression;
    this.targets = targets;
  }
}
Comprehension.parser = P.lazy('Comprehension', () => {
  const reify = (mark) => {
    const expressions = mark.value;
    if (expressions.length === 1) {
      return expressions[0];
    }
    return new Comprehension(expressions[0], expressions.slice(1)).withMark(mark);
  };
  return ignore(P.sepBy1(P.alt(
    Context.parser,
    Call.parser // eslint-disable-line no-use-before-define
  ), ignore(P.string('|')))).mark().map(reify);
});

//
class Call extends Marked { // TODO: rename to Request?
  constructor(id, args = []) {
    super();
    this.type = 'Call';
    this.id = id;
    this.args = args;
  }
}
Call.parser = P.lazy('Call', () => {
  const expr = Id.parser.chain(id => {
    const reify = mark => {
      const args = mark.value;
      return new Call(id, args || []).withMark(mark);
    };
    const argument = P.alt(
      form(Comprehension.parser),
      form(Str.parser),
      form(Id.parser),
      Context.parser,
      Keyword.parser, // eslint-disable-line no-use-before-define
      Parameter.parser, // eslint-disable-line no-use-before-define
      Str.parser,
      Id.parser
    );

    return P.alt(
      P.whitespace
        .then(
          P.sepBy(argument, P.whitespace)
        ).skip(P.optWhitespace),
      P.optWhitespace
    ).mark().map(reify);
  });
  return P.alt(
    form(ignore(expr)),
    ignore(expr)
  );
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
  return Comprehension.parser.skip(P.optWhitespace).chain(expression => {
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
    Comprehension.parser
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
  Comprehension,
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
const error = (expr, result) => {
  const lines = [];
  lines.push('##############################');
  lines.push(expr);
  lines.push('##############################');

  if (!result.status) {
    lines.push(JSON.stringify(result, null, 2));
  }
  if (result.status === false) {
    let indents = '';
    let column = 0;
    let line = 1;
    for (let i = 0; i < result.index; i++) {
      if (expr[i] === '\n') {
        indents = '';
        column = 0;
        line += 1;
      } else {
        indents += '~';
        column += 1;
      }
    }
    lines.push('\x1b[91m', `\nFAILURE: line: ${line}, column: ${column}\n`, '\x1b[0m');
    lines.push(` ${expr.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`);
    lines.push('\x1b[91m', `${indents}^`, '\x1b[0m');
    const context = expr
            .split('\n')
            .slice(line, line + 3 <= expr.length ? line + 3 : expr.length)
            .join('\n');
    lines.push(`${context}`);
    const expected = uniq(result.expected).join(' or ');
    const actual = expr[result.index] ? expr[result.index].replace('\n', '\\n') : 'EOF';
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
