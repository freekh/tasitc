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
}

module.exports = DomElement;
