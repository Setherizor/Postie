// Runs our Website
require('./website')
const joinPath = require('path').join
const debug = require('debug')('postie:start')

// ======= Bot Initalization ========
async function run () {
  const db = await require('./db')

  // Manual Delete
  if (process.argv[2] && process.argv[2] == 'delete') {
    debug('manual database delete')
    db.setState({})
    return
  }

  // Get mode from the DB
  let mode = db.get('config.mode').value()

  // Run the bot
  const bot = require(joinPath(__dirname, '/modes/', mode)).bot
  bot.on('ready', () => debug('Postie is active'))
  // Get the bot to connect to Discord
  bot.connect()
}

run()
