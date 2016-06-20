const P = require('parsimmon');

// We use these to catch renames of the internal AST easily
const { Sink,
        Composition,
        Expression,
        Eval,
        Fragment,
        Tag,
        Keyword,
        Parameter,
        Instance,
        List,
        Context,
        Attribute,
        Subscript,
        Id,
        Text,
        Num,
      } = require('../ast');

const ignore = (parser) => {
  return P.optWhitespace.then(parser).skip(P.optWhitespace);
};

const form = (expr) => {
  return P.string('(').then(expr).skip(P.string(')'));
};

Text.parser = P.lazy('Text', () => {
  const reify = (mark) => {
    const str = mark.value;
    return new Text(str).withMark(mark);
  };
  // FIXME:
  return P.string('\'').then(P.regex(/[\.a-zA-Z0-9:; {}\-]*/i))
    .skip(P.string('\''))
    .mark()
    .map(reify);
});

Num.parser = P.lazy('Num', () => {
  const reify = (mark) => {
    const num = mark.value;
    return new Num(parseInt(num, 10)).withMark(mark);
  };
  return P.regex(/[0-9]+/i).mark().map(reify);
});

Id.parser = P.lazy('Id', () => {
  const reify = mark => {
    const id = mark.value;
    return new Id(id).withMark(mark);
  };
  return P.regex(/[\.~\/a-z\-0-9_]+/i).desc('URL safe character').mark().map(reify);
});

Subscript.parser = P.lazy('Subscript', () => {
  const reify = (mark) => {
    const num = mark.value;
    return new Subscript(num).withMark(mark);
  };
  return P.string('[').then(Num.parser).skip(P.string(']'))
    .mark()
    .map(reify);
});

Attribute.parser = P.lazy('Attribute', () => {
  const reify = (mark) => {
    const id = mark.value;
    return new Attribute(id).withMark(mark);
  };
  return P.string('.').then(Id.parser)
    .mark()
    .map(reify);
});

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

Composition.parser = P.lazy('Composition', () => {
  const reify = (mark) => {
    const expressions = mark.value;
    if (expressions.length <= 1) {
      return expressions[0];
    }
    return new Composition(expressions[0], expressions.slice(1));
  };

  return ignore(P.sepBy1(P.alt(
    Text.parser,
    Context.parser,
    Instance.parser,
    List.parser,
    Expression.parser,
    Eval.parser
  ), ignore(P.string('|'))))
    .mark()
    .map(reify);
});

List.parser = P.lazy('List', () => {
  const reify = mark => {
    const elements = mark.value;
    return new List(elements).withMark(mark);
  };
  return P.string('[')
    .then(ignore(
      P.sepBy(
        Composition.parser,
        ignore(P.string(','))
      )))
    .skip(P.string(']'))
    .mark()
    .map(reify);
});

const argumentParser = P.lazy('Argument', () => {
  return P.alt(
    form(Composition.parser),
    Instance.parser,
    List.parser,
    Eval.parser,
    Expression.parser,
    Context.parser,
    Keyword.parser, // eslint-disable-line no-use-before-define
    Parameter.parser, // eslint-disable-line no-use-before-define
    Text.parser
  );
});

Expression.parser = P.lazy('Expression', () => {
  const expr = Id.parser.mark().chain(mark => { // FIXME: there is something fishy with this mark
    const id = mark.value;
    const reify = arg => {
      return new Expression(id, arg || null).withMark(mark);
    };
    return P.alt(
      ignore(argumentParser).map(reify),
      P.succeed(reify(null))
    );
  });
  return P.alt(
    form(ignore(expr)),
    ignore(expr)
  );
});

const cssSelector = P.regex(/-?[_a-zA-Z]+[_a-zA-Z0-9-]*/).desc('CSS selector');

Fragment.parser = P.lazy('Fragment', () => {
  const reify = (mark) => {
    const id = mark.value;
    return new Fragment(id).withMark(mark);
  };
  return P.string('#')
    .then(cssSelector)
    .mark()
    .map(reify);
});

Tag.parser = P.lazy('Tag', () => {
  const reify = (mark) => {
    const id = mark.value;
    return new Tag(id).withMark(mark);
  };
  return P.string('.')
    .then(cssSelector)
    .mark()
    .map(reify);
});

Eval.parser = P.lazy('Eval', () => {
  return P.string(':').then(Id.parser.chain(expression => {
    return P.alt(Fragment.parser, P.succeed(null)).chain(fragment => {
      return P.alt(P.seq(Tag.parser), P.succeed([])).chain(tags => {
        return P.alt(P.whitespace.then(argumentParser), P.succeed(null)).map(arg => {
          const fragmentEnd = fragment ? fragment.end : -1;
          const tagsEnd = tags && tags.length ? tags.slice(-1)[0].end : -1;
          const argEnd = arg ? arg.end : -1;
          const end = Math.max([fragmentEnd, tagsEnd, argEnd]);
          const mark = {
            start: expression.start,
            end,
          };
          return new Eval(expression, arg, fragment, tags).withMark(mark);
        });
      });
    });
  }));
});

Instance.parser = P.lazy('Instance', () => {
  const reify = mark => {
    const elements = mark.value;
    return new Instance(elements).withMark(mark);
  };
  return P.string('{')
    .then(P.seq(
      ignore(Text.parser).chain(key => {
        return ignore(P.string(':'))
          .then(Composition.parser)
          .skip(P.alt(
            ignore(P.string(',')),
            P.succeed(null)
          ))
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

Keyword.parser = P.lazy('Keyword', () => {
  return P.string('--').then(P.letters.chain(id => {
    const reify = (mark) => {
      const value = mark.value;
      return new Keyword(id, value).withMark(mark);
    };
    return P.string('=')
      .then(Composition.parser)
      .mark()
      .map(reify);
  }));
});

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

Argument.parser = P.lazy('Argument', () => {
  
});

Sink.parser = P.lazy('Sink', () => {
  return Composition.parser.skip(P.optWhitespace).chain(expression => {
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
    Composition.parser
  ).parse(text);
  result.text = text;
  return result;
};

module.exports = parse;
