class Marked {
  withMark(mark) {
    this.start = mark.start;
    this.end = mark.end;
    return this;
  }
}

module.exports = Marked;
