class DomElement {
  constructor(type, style, content) {
    if (!type) {
      // TODO: uncertain about this, but rather be defensive
      throw new Error('Cannot construct dom element with empty type');
    }
    this.type = type;
    this.style = style || {};
    this.content = content || '';
  }

  toString() {
    let props = '';
    Object.keys(this.style).forEach(key => {
      props += ` ${key}=${JSON.stringify((this.style[key]))}`; // TODO: not right ofc
    });
    let content = '';
    if (this.content && this.content instanceof Array) {
      content = `${this.content.map(child => child.toString()).join('')}`;
    } else {
      content = this.content;
    }

    return `<${this.type}${props}>${content}</${this.type}>`;
  }
}

module.exports = DomElement;
