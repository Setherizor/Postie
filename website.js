const express = require('express')
const favicon = require('serve-favicon')
const joinPath = require('path').join
const app = express()
const debug = require('debug')('postie:http')

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static('views'))

// Favicon
app.use(favicon(joinPath(__dirname, '/public/favicon.ico')))

// Log http requests to the invite site
function logReq (request, status) {
  const { rawHeaders, httpVersion, method, url } = request
  const ip =
    request.headers['x-forwarded-for'] || request.connection.remoteAddress
  debug(ip, ' - ', `"${method} ${url} HTTP/${httpVersion}" ${status}`)
}

// Serve main page
app.get('/', function (request, response) {
  logReq(request, response.statusCode)
  response.sendFile(joinPath(__dirname, '/public/index.html'))
})

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
