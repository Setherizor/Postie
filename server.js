// Runs our Website
require('dotenv').config()
// require('./website')
const joinPath = require('path').join

// var jsonstore = require("jsonstore.io");
const JsonStoreClient = require('async-jsonstore-io')

let store = new JsonStoreClient(process.env.JSONSTORE)

// ======= Bot Initalization ========
async function lit () {
  let mode
  try {
    if (process.argv[2] && process.argv[2] == 'delete') {
      console.log(await store.delete(''))
      return
    }
    mode = await store.get('config/mode')
    console.log(Boolean(mode))
    if (!mode) {
      mode = 'default'
      console.log(await store.write('config/mode', mode))
    }
  } catch (e) {
    if (e.name == 'Nothing Found Error.') {
      store.send('config/mode', 'default')
      console.log('default state written')
    }
    console.error(e)
  }

  // Run the bot
  const bot = require(joinPath(__dirname, '/modes/', mode)).bot
  bot.on('ready', () => console.log('Bot Ready!'))
  // Get the bot to connect to Discord
  bot.connect()
}

lit()
