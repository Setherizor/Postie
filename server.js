// Runs our Website
require('dotenv').config()
require('./website')
const joinPath = require('path').join
const debug = require('debug')('postie:start')

const JsonStoreClient = require('async-jsonstore-io')

let store = new JsonStoreClient(process.env.JSONSTORE)

// ======= Bot Initalization ========
async function run () {
  let mode
  try {
    // Manual Delete
    if (process.argv[2] && process.argv[2] == 'delete') {
      debug('delete', await store.delete(''))
      return
    }
    mode = await store.get('config/mode')
    if (!mode) {
      mode = 'default'
      debug('write mode: ', await store.write('config/mode', mode))
    }
  } catch (e) {
    if (e.name == 'Nothing Found Error.') {
      store.send('config/mode', 'default')
      debug('wrote default mode')
    }
    debug('ERROR', e)
  }

  // Second mode issue check
  if (!mode) mode = 'default'

  // Run the bot
  const bot = require(joinPath(__dirname, '/modes/', mode)).bot
  bot.on('ready', () => debug('Postie is active'))
  // Get the bot to connect to Discord
  bot.connect()
}

run()
