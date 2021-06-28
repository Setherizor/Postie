import express from 'express'
import cookieParser from 'cookie-parser'
import favicon from 'serve-favicon'
import { join } from 'path'
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import Debug from 'debug'
import db from './db.js'
import crypto from 'crypto'

import bot from './bot.js'

import DiscordOauth2 from 'discord-oauth2'
import { nextTick } from 'process'
const oauth = new DiscordOauth2({
  clientId: process.env.OAUTH2_CLIENT_ID,
  clientSecret: process.env.OAUTH2_CLIENT_SECRET,
  redirectUri: process.env.OAUTH2_CALLBACK
})

const __dirname = dirname(fileURLToPath(import.meta.url))

const debug = Debug('postie:http')
const app = express()

// Favicon & Static Files
app.use(cookieParser())
app.use(favicon(join(__dirname, '/public/favicon.ico')))

// Log http requests to the invite site
function logReq (request, status) {
  const { rawHeaders, httpVersion, method, url } = request
  const ip =
    request.headers['x-forwarded-for'] || request.connection.remoteAddress
  debug(ip, ' - ', `"${method} ${url} HTTP/${httpVersion}" ${status}`)
}

// ======= Authentication =======

// https://discord.com/developers/docs/topics/oauth2#oauth2
app.use(async function (request, response, next) {
  // Handle the authentication logic
  var p = request.query
  // If we are coming back from an actual authentication vs a bot invite
  if (request.path == '/' && Boolean(p.state) && Boolean(p.code)) {
    // Exchange the code for the user's access token
    try {
      var access_object = await oauth.tokenRequest({
        code: p.code,
        scope: 'identify email guilds',
        grantType: 'authorization_code'
      })
      await db.read()
      db.data.authTokens[p.state] = access_object
      db.data.authTokens[p.state].timestamp = Date.now()
      await db.write()
      debug('exchanged for & stored the auth token')
    } catch (error) {
      debug('requesting access_token from discord went wrong: ', error)
    }

    response.cookie('authState', p.state, { maxAge: 900000, httpOnly: true })
    response.cookie('isLoggedIn', true, { maxAge: 900000, httpOnly: false })
    debug('set user cookie')

    return response.redirect(request.originalUrl.split('?').shift())
  }

  // Setup & Manage cookies for other middlewares
  var cookie = request.cookies.authState
  if (cookie) {
    // Retrieve access_token from DB
    await db.read()
    request.access_token = db.data.authTokens[cookie].access_token
  }

  // Logout
  if (request.path == '/logout' && request.access_token) {
    // Client Cookies
    response.clearCookie('authState')
    response.clearCookie('isLoggedIn')
    // Server Token & Database
    const credentials = Buffer.from(
      `${process.env.OAUTH2_CLIENT_ID}:${process.env.OAUTH2_CLIENT_SECRET}`
    ).toString('base64')

    if (db.data.authTokens[cookie]) {
      oauth
        .revokeToken(db.data.authTokens[cookie].access_token, credentials)
        .then(debug)

      await db.read()
      delete db.data.authTokens[cookie]
      await db.write()

      debug('logged user out')
    }
  }

  next()
})

// Handler for expiring tokens
var bufferMiliseconds = 1000 * 60 * 60 * 24 // one day in seconds

async function checkTokenExpiry () {
  // find tokens expiring with the next day and a half
  await db.read()
  var authStates = Object.keys(db.data.authTokens)
  // Get keys for tokens soon to expire
  var expiringTokenKeys = authStates.filter(s => {
    var o = db.data.authTokens[s]
    return (
      o.timestamp + o.expires_in * 1000 < Date.now() + bufferMiliseconds * 1.5
    )
  })
  // Regenerate them
  expiringTokenKeys.forEach(async key => {
    debug('Regenerating expiring token: ' + key)
    await db.read()
    db.data.authTokens[key] = await oauth.tokenRequest({
      refreshToken: db.data.authTokens[key].refresh_token,
      grantType: 'refresh_token'
    })
    db.data.authTokens[key].timestamp = Date.now()
    await db.write()
  })
}

// Run checks now and every day
checkTokenExpiry()
setInterval(checkTokenExpiry, bufferMiliseconds)

// ======= Route Handlers =======

app.get('/authurl', function (request, response) {
  var authUrl = oauth.generateAuthUrl({
    scope: ['identify email guilds'],
    response_type: 'code',
    prompt: 'none', // 'consent' // to have a discord prompt
    state: crypto.randomBytes(16).toString('hex')
  })
  response.redirect(authUrl)
})

app.get('/inviteurl', function (request, response) {
  var authUrl = oauth.generateAuthUrl({
    scope: ['bot'],
    permissions: 2146958591
  })
  response.redirect(authUrl)
})

app.get('/user', async function (request, response) {
  if (request.access_token)
    response.send(await oauth.getUser(request.access_token))
  else response.send(request.cookies)
})

// Guilds the user and the bot are both in
app.get('/guilds', async function (request, response) {
  if (request.access_token) {
    var userGuilds = await oauth.getUserGuilds(request.access_token)
    var botGuildIds = bot.guilds.map(g => g.id)

    var guilds = userGuilds
      .filter(g => botGuildIds.includes(g.id))
      .sort((a, b) => {
        if (a.name < b.name || (!Boolean(a.owner) && Boolean(b.owner))) {
          return -1
        }
        if (a.name > b.name || (Boolean(a.owner) && !Boolean(b.owner))) {
          return 1
        }
        return 0
      })
    response.send(guilds)
  } else response.send(request.cookies)
})

// ======= Catchall Handlers =======

app.use(express.static(join(__dirname, 'public')))

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
