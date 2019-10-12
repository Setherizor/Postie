const fs = require('fs')
const Eris = require('eris') // Communicates with Discord
const joinPath = require('path').join

var jsonstore = require('jsonstore.io')
let store = new jsonstore(process.env.JSONSTORE)

let ar = async s => await store.read(s)

const getMode = m => require(joinPath(__dirname, '/modes/', m)).bot

let bot = new Eris.CommandClient(
  process.env.DISCORD_BOT_TOKEN,
  {},
  {
    description: 'A lovely bot made by Seth',
    owner: 'Setherizor',
    prefix: process.env.COMMAND_PREFIX
  }
)

// Link database to bot
bot.store = store

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

// Message Watcher
bot.on('messageCreate', message => {
  const reply = s =>
    bot.createMessage(message.channel.id, { content: s, tts: true })

  switch (message.content) {
    case 'seff':
      reply(`needs to stop mannn :smile:`)
      break
    case 'who are you':
      reply(`i am groot`)
      break
    case 'alone':
      const alone =
        'https://open.spotify.com/user/crashsaint/playlist/13QvdnK7s0TgEmgANCIbEF'
      reply('Type this: ```>play ' + alone + '```')
      break
    case 'stream':
      const stream = 'https://www.youtube.com/watch?v=SsYkibjW_gc'
      reply('Type this: ```>play ' + stream + '```')
      break
    case 'testme':
      reply('/tts does this work at all?')
      break
    default:
      break
  }
})

// Changes Bot's Role
bot.registerCommand(
  'role',
  async (msg, args) => {
    let postieRole = await ar('config/postieRole')
    const guildID = msg.member.guild.id
    const oldColor = 12745742

    // Create Role
    if (!postieRole) {
      bot
        .createRole(
          guildID,
          {
            name: 'Postie',
            color: oldColor,
            permissions: 2146958591
          },
          'For Postie to Enjoy'
        )
        .catch(e => {
          console.log(e)
        })
        .then(
          botRole => {
            console.log(botRole.id)

            // Add Bot to Role
            bot.addGuildMemberRole(
              guildID,
              bot.user.id,
              botRole.id,
              'bot role creation'
            )

            // Modify it to work
            botRole
              .edit(
                {
                  hoist: true,
                  mentionable: true,
                  position: 8
                },
                'Bot Init Role Creation'
              )
              .catch(error => {
                console.log(error, 'Promise error')
              })

            bot.store.write('config/postieRole', botRole.id)

            bot.createMessage(msg.channel.id, 'Made my own role :wink:')
          },
          err => console.log('Role creating went wrong', err)
        )
    } else {
      console.log(bot.guilds.get(guildID).roles.get(postieRole))
    }
  },
  {
    description: "implements bot's role (ONLY USE ONCE)",
    fullDescription: 'Give Postie his role ;)'
  }
)

const modes = fs
  .readdirSync('./modes/')
  .map(file => file.replace(/\.[^/.]+$/, ''))

// Lists avaliable modes for bot
bot.registerCommand(
  'modes',
  (msg, args) => {
    bot.createMessage(
      msg.channel.id,
      'Avaliable Modes :smiley:\n' +
        modes.map(m => `**${m}** - ${require('./modes/' + m).desc}`).join('\n')
    )
  },
  {
    description: 'lists modes',
    fullDescription: 'Lists avaliable modes for bot'
  }
)

// Changes Bot's mode for differing active commands
bot.registerCommand(
  'mode',
  async (msg, args) => {
    let mode = await ar('config/mode')
    // If we have valid argument
    if (args[0] != undefined && Boolean(args[0].trim())) {
      // If its different from current mode and a valid mode
      if (args[0] !== mode && modes.includes(args[0])) {
        mode = args[0]

        bot.store.write('config/mode', mode)

        bot = getMode(mode) // Change Mode
        bot.createMessage(
          msg.channel.id,
          `**${args[0] || 'Default'}** Mode Enabled :smiley:`
        )
      } else {
        return bot.createMessage(
          msg.channel.id,
          `**${args[0]}** is not a vald Mode :frowning:`
        )
      }
    }
    bot.createMessage(
      msg.channel.id,
      `The bot is currently in **${mode}** mode, type \`${
        process.env.COMMAND_PREFIX
      }help\` to learn more`
    )
  },
  {
    description: 'sets mode',
    fullDescription: "Changes bot's mode"
  }
)

// Changes Bot's mode for differing active commands
bot.registerCommand(
  'default',
  async (msg, args) => {
    let mode = await ar('config/mode')
    // If default different from current mode and a valid mode
    if ('default' !== mode && modes.includes(args[0])) {
      mode = 'default'

      bot.store.write('config/mode', mode)

      bot = getMode(mode) // Change Mode
      bot.createMessage(
        msg.channel.id,
        `**${args[0] || 'Default'}** Mode Enabled :smiley:`
      )
    } else {
      return bot.createMessage(
        msg.channel.id,
        `You are already in **${args[0]}** mode, or it is invalid :frowning:`
      )
    }
    bot.createMessage(
      msg.channel.id,
      `The bot is currently in **${mode}** mode, type \`${
        process.env.COMMAND_PREFIX
      }help\` to learn more`
    )
  },
  {
    description: 'sets mode to default',
    fullDescription: "Changes bot's mode back to default"
  }
)

// Exports the Bot for further use or customization
module.exports = bot
