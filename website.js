const express = require('express')
const favicon = require('serve-favicon')
const joinPath = require('path').join
const app = express()

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static('views'))

// Favicon
app.use(favicon(joinPath(__dirname, 'favicon.ico')))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(joinPath(__dirname, '/index.html'))
})

// listen for requests :)
let listener = app.listen(process.env.PORT, function () {
  console.log('Invite site hosted on port ' + listener.address().port)
})

// We don't need any exports since everything is handled here
