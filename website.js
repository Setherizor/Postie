const express = require('express')
const joinPath = require('path.join')
const app = express()

// http://expressjs.com/en/starter/static-files.html
// app.use(express.static('views'))

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(joinPath(__dirname, '/index.html'))
})

// listen for requests :)
let listener = app.listen(process.env.PORT || 80, function () {
  console.log('Invite site hosted on port ' + listener.address().port)
})

// We don't need any exports since everything is handled here
