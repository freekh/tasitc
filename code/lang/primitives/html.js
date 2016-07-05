class Html {
  constructor(value, doctype) {
    this.value = value;
    this.doctype = doctype || '<!DOCTYPE html>';
  }
  toString() {
    return `${this.doctype}\n<html>${this.value.map(elem => elem.toString('')).join('\n')}</html>`;
  }
}

module.exports = Html;
