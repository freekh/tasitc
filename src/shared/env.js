
const port = process.env['PORT'] || 8080

module.exports = {
  port,
  server: process.env['SERVER'] || 'http://localhost:' + port,
  appDir: process.cwd(),
  tmpDir: process.cwd() + '/.tmp/'
}
