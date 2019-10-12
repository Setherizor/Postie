// Runs our Website
require('dotenv').config()
require('./website')
var jsonstore = require('jsonstore.io')
let store = new jsonstore(process.env.JSONSTORE)
const joinPath = require('path').join

// ======= Bot Initalization ========
;(async () => {
  // Option to reset the DB
  if (process.argv[2] && process.argv[2] == 'delete') {
    console.log(await store.delete(''))
    return
  }

  // Boot the bot
  let mode
  try {
    mode = await store.read('config/mode')
    if (!mode) {
      mode = 'default'
      console.log(await store.write('config/mode', mode))
    }
  } catch (err) {
    console.log(err)
  }

  // Run the bot
  const bot = require(joinPath(__dirname, '/modes/', mode)).bot

  bot.on('ready', () => console.log('Bot Ready!'))

  // Get the bot to connect to Discord
  bot.connect()
})()
