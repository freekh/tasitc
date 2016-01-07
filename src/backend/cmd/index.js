module.exports = (req, res) => {
  switch(req.params.name) {
    case 'eval':
      res.json(require('./eval')(req.query.data))
      break
    case 'listen':
      require('./listen')(req.query.path)
      break
    default:
      res.sendStatus(404)
  }
}
