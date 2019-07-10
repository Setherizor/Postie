// Runs our Website
require('dotenv').config()
require('./website')

const jsonfile = require('jsonfile')
const joinPath = require('path').join

// ======= Bot Initalization ========
const configFile = joinPath(__dirname, 'data', 'botState.json')

// Reads from file which has last known mode
let mode
try {
  mode = jsonfile.readFileSync(configFile).mode
} catch (err) {
  jsonfile.writeFileSync(configFile, {
    mode: 'default',
    role: '466477351333789707'
  })
  mode = 'default'
}

const bot = require(joinPath(__dirname, '/modes/', mode)).bot

bot.on('ready', () => console.log('Bot Ready!'))

// Get the bot to connect to Discord
bot.connect()
