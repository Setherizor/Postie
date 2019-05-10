// Runs our Website
require('dotenv').config()

require('./website')
const jsonfile = require('jsonfile')
const joinPath = require('path.join')

// ======= Bot Initalization ========

// Reads from file which has last known mode
const { mode } = jsonfile.readFileSync(
  joinPath(__dirname, 'data/botState.json')
)
const getMode = m => require(joinPath(__dirname, '/modes/', m)).bot
const bot = getMode(mode)

bot.on('ready', () => console.log('Bot Ready!'))

// Get the bot to connect to Discord
bot.connect()
