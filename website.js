import express from 'express'
import favicon from 'serve-favicon'
import { join } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import Debug from 'debug'

const __dirname = dirname(fileURLToPath(import.meta.url))

const debug = Debug('postie:http')
const app = express()

// Favicon & Static Files
app.use(favicon(join(__dirname, '/public/favicon.ico')))
app.use(express.static(join(__dirname, 'public')))

// Log http requests to the invite site
function logReq (request, status) {
  const { rawHeaders, httpVersion, method, url } = request
  const ip =
    request.headers['x-forwarded-for'] || request.connection.remoteAddress
  debug(ip, ' - ', `"${method} ${url} HTTP/${httpVersion}" ${status}`)
}

// Wildcard handler
app.get('*', function (request, response) {
  response.status(301)
  logReq(request, response.statusCode)
  response.redirect('/')
})

let listener = app.listen(process.env.PORT, function () {
  debug('invite site listening on ' + listener.address().port)
})

// We don't need any exports since everything is handled here
export default {}
