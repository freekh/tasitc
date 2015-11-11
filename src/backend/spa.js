
const template = (routes) => {
  return `<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
  </body>
  <script src='${routes.javascript}'></script>
</html>
`
}


module.exports = (routes) => {
  const html = template(routes)
  return (req, res) => {
    res.contentType('text/html; charset=utf-8')
    res.send(html)
  }
}
