module.exports = (req, res) => {
  switch(req.params.name) {
    case 'listen':
      require('./listen')(req.query.path)
      res.sendStatus(200)
      break
    default:
      res.sendStatus(404)
  }
}
