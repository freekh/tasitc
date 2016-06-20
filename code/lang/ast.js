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
  constructor(path = []) {
    super();
    this.type = 'Context';
    this.path = path;
  }
}

class Combination extends Marked { // Rename to Composition
  constructor(target, combinators) {
    super();
    this.type = 'Combination';
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
  constructor(id, arg) {
    super();
    this.type = 'Expression';
    this.id = id;
    this.arg = arg;
  }
}

class Eval extends Marked {
  constructor(id, arg, fragment, tags) {
    super();
    this.type = 'Eval';
    this.id = id;
    this.arg = arg;
    this.fragment = fragment;
    this.tags = tags;
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
  Combination,
  Expression,
  Eval,
  Fragment,
  Tag,
  Keyword,
  Parameter,
  Context,
  Attribute,
  Subscript,
  List,
  Instance,
  Id,
  Text,
  Num,
};
