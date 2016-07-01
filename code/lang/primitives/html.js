class Html {
  constructor(value, doctype) {
    this.value = value;
    this.doctype = doctype || '<!DOCTYPE html>';
  }
}

module.exports = Html;
