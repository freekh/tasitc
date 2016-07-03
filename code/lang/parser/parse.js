const P = require('parsimmon');

// We use these to catch renames of the internal AST easily
const { Sink,
        Composition,
        Expression,
        Partial,
        Apply,
        Eval,
        Modifier,
        Keyword,
        Parameter,
        Instance,
        List,
        Context,
        Curry,
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
  const reify = (data) => {
    const str = data;
    return new Text(str);
  };
  // FIXME:
  return P.string('\'').then(P.regex(/[\*\?\[\]\/\.a-zA-Z0-9:; {}\-]*/i))
    .skip(P.string('\''))
    .map(reify);
});

Num.parser = P.lazy('Num', () => {
  const reify = (data) => {
    const num = data;
    return new Num(parseInt(num, 10));
  };
  return P.regex(/[0-9]+/i).map(reify);
});

Id.parser = P.lazy('Id', () => {
  const reify = data => {
    const id = data;
    return new Id(id);
  };
  return P.regex(/[\.~\/a-z\-0-9_]+/i).desc('URL safe character').map(reify);
});

Subscript.parser = P.lazy('Subscript', () => {
  const reify = (data) => {
    const num = data;
    return new Subscript(num);
  };
  return P.string('[').then(Num.parser).skip(P.string(']'))
    .map(reify);
});

Attribute.parser = P.lazy('Attribute', () => {
  const reify = (data) => {
    const id = data;
    return new Attribute(id);
  };
  return P.string('.').then(Id.parser)
    .map(reify);
});

Context.parser = P.lazy('Context', () => {
  const reify = (data) => {
    const path = data;
    return new Context(path);
  };
  return P.string('$').then(P.alt(
    Subscript.parser,
    Attribute.parser
  ).many())
    .map(reify);
});

Curry.parser = P.lazy('Curry', () => {
  const reify = () => {
    return new Curry();
  };
  return P.string('?').map(reify);
});

Composition.parser = P.lazy('Composition', () => {
  const reify = (data) => {
    const expressions = data;
    if (expressions && expressions.length <= 1) {
      return expressions[0];
    }
    return new Composition(expressions[0], expressions.slice(1));
  };

  return ignore(P.sepBy1(P.alt(
    Text.parser,
    Context.parser,
    Instance.parser,
    List.parser,
    Apply.parser,
    Eval.parser,
    Expression.parser
  ), ignore(P.string('|'))))
    .map(reify);
});

List.parser = P.lazy('List', () => {
  const reify = data => {
    const elements = data;
    return new List(elements);
  };
  return P.string('[')
    .then(ignore(
      P.sepBy(
        Composition.parser,
        ignore(P.string(','))
      )))
    .skip(P.string(']'))
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

// TODO: Partial, Apply, etc needs refactoring
const partialListParser = P.lazy('PartialList', () => {
  const reify = data => {
    const elements = data;
    return new List(elements);
  };
  return P.string('[')
    .then(ignore(
      P.sepBy(
        P.alt(
          Partial.parser,
          Text.parser,
          Context.parser,
          partialListParser
        ),
        ignore(P.string(','))
      )))
    .skip(P.string(']'))
    .map(reify);
});

Partial.parser = P.lazy('Partial', () => {
  const expr = P.alt(
    Id.parser,
    form(Partial.parser)
  ).chain(idOrPartial => {
    const reify = arg => {
      return new Partial(idOrPartial, arg || null);
    };
    return P.alt(
      ignore(P.alt(Curry.parser, partialListParser, Partial.parser)).map(reify),
      P.succeed(reify(null))
    );
  });
  return ignore(expr);
});

Apply.parser = P.lazy('Apply', () => {
  const expr = P.string('(').desc('start apply')
          .then(Partial.parser)
          .desc('partial apply')
          .skip(P.string(')').desc('end apply'))
          .skip(P.whitespace)
          .chain(partial => {
            const reify = arg => {
              return new Apply(partial, arg);
            };
            return argumentParser.desc('Apply.Argument').map(reify);
          });
  return expr;
});

Expression.parser = P.lazy('Expression', () => {
  const expr = Id.parser.chain(id => {
    const reify = arg => {
      return new Expression(id, arg || null);
    };
    return P.alt(
      ignore(argumentParser.desc('Expression.Argument')).map(reify),
      P.succeed(reify(null))
    );
  });
  return ignore(expr);
});

const cssSelector = P.regex(/-?[#\._a-zA-Z]+[_a-zA-Z0-9-]*/).desc('CSS selector');

Modifier.parser = P.lazy('Modifier', () => {
  const reify = (data) => {
    const id = data;
    return new Modifier(id);
  };
  return P.string('[')
    .then(cssSelector)
    .skip(P.string(']'))
    .map(reify);
});


Eval.parser = P.lazy('Eval', () => {
  return P.string(':').then(P.alt(Id.parser).chain(expression => {
    return P.alt(Modifier.parser, P.succeed(null)).chain(modifier => {
      return P.alt(P.whitespace.then(argumentParser), P.succeed(null)).map(arg => {
        return new Eval(expression, arg, modifier);
      });
    });
  }));
});

Instance.parser = P.lazy('Instance', () => {
  const reify = data => {
    const elements = data;
    return new Instance(elements);
  };
  return P.string('{')
    .then(P.sepBy(ignore(Text.parser).chain(key => {
      return ignore(P.string(':')).then(Composition.parser).map(value => {
        return { key, value };
      });
    }), P.string(',')))
    .skip(P.string('}'))
    .map(reify);
});

Keyword.parser = P.lazy('Keyword', () => {
  return P.string('--').then(P.letters.chain(id => {
    const reify = (data) => {
      const value = data;
      return new Keyword(id, value);
    };
    return P.string('=')
      .then(Composition.parser)
      .map(reify);
  }));
});

Parameter.parser = P.lazy('Parameter', () => {
  const reify = (data) => {
    const id = data;
    return new Parameter(id);
  };
  const parameterId = P.regex(/[a-z_]+/i);
  return P.string('?').then(parameterId)
    .map(reify);
});

Sink.parser = P.lazy('Sink', () => {
  return P.alt(Partial.parser, Composition.parser).mark().skip(P.optWhitespace).chain(expression => {
    const reify = (data) => {
      const path = data;
      return new Sink(expression.value, path, expression.start.offset, expression.end.offset);
    };
    return ignore(P.string('>')).
      then(Id.parser).
      map(reify);
  });
});

//

const parse = (text) => {
  // FIXME: gross hack: related to https://github.com/jneen/parsimmon/issues/73?
  let result = Composition.parser.parse(text);
  const expected = [];
  if (!result.status) {
    expected.push(result.expected.slice());
    result = Sink.parser.parse(text);
    if (!result.status) {
      expected.push(result.expected.slice());
      result = Partial.parser.parse(text);
    }
  }
  if (!result.status) {
    expected.push(result.expected.slice());
    result.expected = expected;
  }
  result.text = text;
  return result;
};

module.exports = parse;
