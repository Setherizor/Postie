import fs from 'fs'
import * as Eris from 'eris'
import { join } from 'path'
import botModes from './modes/index.js'
import db from './db.js'
import Debug from 'debug'
const debug = Debug('postie:setup')

let bot = new Eris.CommandClient(
  process.env.DISCORD_BOT_TOKEN,
  {},
  {
    description: 'A lovely bot to help with a number of things',
    owner: 'Seth',
    prefix: process.env.COMMAND_PREFIX
  }
)

// ===== Database & Helper Methods =====
bot.db = db

bot.tmpResponse = async (originalmsg, text, timeout = 5000) => {
  var channel = originalmsg.channel.id
  var tmpMsgId = (await bot.createMessage(channel, text)).id

  setTimeout(
    () =>
      bot.deleteMessage(channel, tmpMsgId, 'cleaning temporary bot message'),
    timeout
  )
}

// ===== Commands =====
// Gives the URL form which to invite the bot
bot.registerCommand(
  'invite',
  (msg, args) => {
    const url = 'https://sethp.cc/postie'
    bot.createMessage(msg.channel.id, '**Invite URL** \n' + url)
  },
  {
    description: 'invite url',
    fullDescription: "Gets the bot's invite url to talk too."
  }
)

const modes = fs
  .readdirSync('./modes/')
  .map(file => file.replace(/\.[^/.]+$/, ''))

// Lists avaliable modes for bot
bot.registerCommand(
  'modes',
  (msg, args) => {
    bot.tmpResponse(
      msg,
      'Avaliable Modes :smiley:\n' + botModes.descriptions(),
      10000
    )
  },
  {
    description: 'lists modes',
    fullDescription: 'Lists avaliable modes for bot',
    deleteCommand: true
  }
)

// Changes Bot's mode for differing active commands
bot.registerCommand(
  'mode',
  async (msg, args) => {
    await bot.db.read()
    let oldmode = bot.db.data.config.mode
    // If we have valid argument
    if (args[0] != undefined && Boolean(args[0].trim())) {
      // If its different from oldmode and a valid mode
      if (args[0] !== oldmode && botModes.valid(args[0])) {
        botModes.setup(bot, args[0], oldmode)
        bot.db.data.config.mode = args[0]
        await bot.db.write()
        bot.tmpResponse(
          msg,
          `**${args[0] || 'Default'}** Mode Enabled :smiley:`,
          5000
        )
      } else {
        bot.tmpResponse(
          msg,
          `**${args[0]}** is not a valid Mode :frowning:`,
          5000
        )
      }
      return
    }
    bot.tmpResponse(
      msg,
      `The bot is currently in **${mode}** mode, type \`${
        process.env.COMMAND_PREFIX
      }help\` to learn more`,
      5000
    )
  },
  {
    description: 'sets mode',
    fullDescription: "Changes bot's mode",
    deleteCommand: true
  }
)

bot.registerCommand(
  'clean',
  async (msg, args) => {
    var limit = 30
    let allMsgs = await msg.channel.getMessages({
      before: encodeURI(msg.id),
      limit
    })
    let toDelete = allMsgs.filter(m => m.author.id == bot.user.id)
    bot.tmpResponse(msg, '**Cleaning up my messages :smiley:**', 5000)
    debug(`deleting ${toDelete.length} of my messages`)
    bot.deleteMessages(msg.channel.id, toDelete, 'cleaning bot messages')
    await Promise.all(
      toDelete.map(m => bot.deleteMessage(msg.channel.id, m.id))
    )
    bot.tmpResponse(msg, '**Finished cleaning up my messages :smiley:**', 5000)
  },
  {
    description: 'bot cleaning',
    fullDescription: 'deletes bots recent messages in channel',
    deleteCommand: true
  }
)

// ===== Init Logic =====

// Restore last active mode
let mode = bot.db.data.config.mode
botModes.setup(bot, mode)
bot.on('ready', () => debug('Postie is active'))

bot.on('guildCreate', guild => {
  debug(`guild joined: ${guild.name} (${guild.id}) `)
})

bot.on('guildDelete', guild => {
  debug(`guild left: ${guild.name} (${guild.id}) `)
})

bot.connect()

// Exports the Bot for further use or customization
export default bot
