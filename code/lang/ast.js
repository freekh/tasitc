const Marked = require('./parser/marked');

class Text extends Marked { // TODO: rename?
  constructor(value) {
    super();
    this.type = 'Text';
    this.value = value;
  }
}

class Num extends Marked { // TODO: rename?
  constructor(value) {
    super();
    this.type = 'Num';
    this.value = value;
  }
}

class Id extends Marked { // TODO: rename to Path?
  constructor(value) {
    super();
    this.type = 'Id';
    this.value = value;
  }
}

class Uri extends Marked { // TODO: rename to Path?
  constructor(protocol, path, params) {
    super();
    this.path = path;
    this.protocol = protocol;
    this.params = params;
    this.value = protocol + ':/' + path;
  }
}

class Subscript extends Marked { // [1][0]
  constructor(index) {
    super();
    this.type = 'Subscript';
    this.index = index;
  }
}

class Attribute extends Marked { // foo.column
  constructor(attr) {
    super();
    this.type = 'Attribute';
    this.attr = attr;
  }
}

class Context extends Marked { // $
  constructor(paths = []) {
    super();
    this.type = 'Context';
    this.paths = paths;
  }
}

class Curry extends Marked { // TODO: rename to unknown argument
  constructor() {
    super();
    this.type = 'Curry';
  }
}

class Composition extends Marked {
  constructor(target, combinators) {
    super();
    this.type = 'Composition';
    this.target = target;
    this.combinators = combinators;
  }
}

class List extends Marked {
  constructor(elements) {
    super();
    this.type = 'List';
    this.elements = elements;
  }
}

class Expression extends Marked {
  constructor(path, arg) {
    super();
    this.type = 'Expression';
    this.path = path;
    this.arg = arg;
  }
}

class Partial extends Marked { // TODO: rename to combinator?
  constructor(path, arg) {
    super();
    this.type = 'Partial';
    this.path = path;
    this.arg = arg;
  }
}

class Apply extends Marked {
  constructor(partial, arg) {
    super();
    this.type = 'Apply';
    this.partial = partial;
    this.arg = arg;
  }
}

class Eval extends Marked {
  constructor(expression, arg, modifier) {
    super();
    this.type = 'Eval';
    this.expression = expression;
    this.arg = arg;
    this.modifier = modifier;
  }
}

class Modifier extends Marked {
  constructor(value) {
    super();
    this.type = 'Modifier';
    this.value = value;
  }
}

class Instance extends Marked {
  constructor(elements) {
    super();
    this.type = 'Instance';
    this.elements = elements;
  }
}

class Keyword extends Marked {
  constructor(id, value) {
    super();
    this.type = 'Keyword';
    this.id = id;
    this.value = value;
  }
}

class Parameter extends Marked {
  constructor(id) {
    super();
    this.type = 'Parameter';
    this.id = id;
  }
}

class Sink extends Marked { // TODO: rename to Write? or something else? Assign? Store?
  constructor(expression, path, start, end) {
    super();
    this.type = 'Sink';
    this.expression = expression;
    this.path = path;
    this.start = start;
    this.end = end;
  }
}

module.exports = {
  Sink,
  Composition,
  Expression,
  Partial,
  Apply,
  Eval,
  Modifier,
  Keyword,
  Parameter,
  Context,
  Curry,
  Attribute,
  Subscript,
  List,
  Instance, // TODO: would like to rename to Object, but can't so find some other better name
  Id,
  Uri,
  Text,
  Num,
  // TODO: add Boolean
  // TODO: add a type representing mimes to represent html, ...
};
