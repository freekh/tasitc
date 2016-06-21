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

class Curry extends Marked {
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

class Eval extends Marked {
  constructor(expression, arg, fragment, tags) { // FIXME: decide on fragment and tags!
    super();
    this.type = 'Eval';
    this.expression = expression;
    this.arg = arg;
  }
}

class Fragment extends Marked {
  constructor(id) {
    super();
    this.type = 'Fragment';
    this.id = id;
  }
}

class Tag extends Marked {
  constructor(id) {
    super();
    this.type = 'Tag';
    this.id = id;
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
  constructor(expression, path) {
    super();
    this.type = 'Sink';
    this.expression = expression;
    this.path = path;
  }
}

module.exports = {
  Sink,
  Composition,
  Expression,
  Eval,
  Fragment,
  Tag,
  Keyword,
  Parameter,
  Context,
  Curry,
  Attribute,
  Subscript,
  List,
  Instance,
  Id,
  Text,
  Num,
};
