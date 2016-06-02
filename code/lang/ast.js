const Marked = require('./parser/marked');

class Str extends Marked { // TODO: rename?
  constructor(value) {
    super();
    this.type = 'Str';
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
    this.id = '$';
    this.path = path;
  }
}

class Chain extends Marked {
  constructor(elements) {
    super();
    this.type = 'Chain';
    this.elements = elements;
  }
}

class List extends Marked {
  constructor(elements) {
    super();
    this.type = 'List';
    this.elements = elements;
  }
}

class Call extends Marked { // TODO: rename to Request? or Fn?
  constructor(id, arg) {
    super();
    this.type = 'Call';
    this.id = id;
    this.arg = arg;
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

class Sink extends Marked { // TODO: rename to Write? or something else?
  constructor(expression, path) {
    super();
    this.type = 'Sink';
    this.expression = expression;
    this.path = path;
  }
}

module.exports = {
  Sink,
  Chain,
  Call,
  Keyword,
  Parameter,
  Context,
  Attribute,
  Subscript,
  List,
  Instance,
  Id,
  Str,
  Num,
};
