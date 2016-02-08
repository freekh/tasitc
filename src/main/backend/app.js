/*--
IT STARTS HERE.

The feeling was that a different spin were to be taken in this project, however
it is done usually, in that, comments, like these, would be written as to
give context to the mood and aspiration of the writer, at the time of writing.

Rejection by the writee, or reader, as prefered, was considered. A writee
following these convictions, may safely disregard this; automata to remove
will likely be avaiable upon request.

However, as it stood, an experiment was called for: is this, the art and
craftmanship of programming, not fit for more than "just" code?

Are comments only signs of mediocre craftmanship? Yes, code must be clear and
auto-explanatory, but is code really only that which such a project should, or
can, express?

The experiment thus proceeds to demonstrate that such need not be the norm!

More about (or like) this at a later conjuction.
--*/

const express = require('express')
const log = require('../shared/log')
const env = require('../shared/env')

const routes = require('./routes')

const app = express()

routes.init(app)

app.listen(env.port, () => {
  log.info(`initialized on ${env.port}`)
})
