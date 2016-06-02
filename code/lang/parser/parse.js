const P = require('parsimmon');

// We use these to catch renames of the internal AST easily
const { Sink,
        Chain,
        Call,
        Keyword,
        Parameter,
        Instance,
        List,
        Context,
        Attribute,
        Subscript,
        Id,
        Str,
        Num,
      } = require('../ast');

const ignore = (parser) => {
  return P.optWhitespace.then(parser).skip(P.optWhitespace);
};

const form = (expr) => {
  return P.string('(').then(expr).skip(P.string(')'));
};

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
  return P.regex(/[\.~\/a-z\-0-9_]+/i).mark().map(reify);
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

Chain.parser = P.lazy('Chain', () => {
  const reify = (mark) => {
    const elements = mark.value;
    if (elements.length === 1) {
      return elements[0];
    }
    return new Chain(elements).withMark(mark);
  };
  return ignore(P.sepBy1(P.alt(
    Str.parser,
    Context.parser,
    Instance.parser, // eslint-disable-line no-use-before-define
    List.parser, // eslint-disable-line no-use-before-define
    Call.parser // eslint-disable-line no-use-before-define
  ), ignore(P.string('|')))).mark().map(reify);
});

List.parser = P.lazy('List', () => {
  const reify = mark => {
    const elements = mark.value;
    return new List(elements).withMark(mark);
  };
  return P.string('[')
    .then(ignore(
      P.sepBy(
        Chain.parser,
        ignore(P.string(','))
      )))
    .skip(P.string(']'))
    .mark()
    .map(reify);
});

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
      Instance.parser,
      List.parser,
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

Instance.parser = P.lazy('Instance', () => {
  const reify = mark => {
    const elements = mark.value;
    return new Instance(elements).withMark(mark);
  };
  return P.string('{')
    .then(P.seq(
      ignore(Str.parser).chain(key => {
        return ignore(P.string(':'))
          .then(Chain.parser)
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
      .then(P.alt(
        Context.parser,
        Num.parser,
        Str.parser,
        Call.parser
      )).mark()
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

const parser = (text) => {
  const result = P.alt(
    Sink.parser,
    Chain.parser
  ).parse(text);
  result.text = text;
  return result;
};

module.exports = parser;
