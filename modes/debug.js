import Debug from 'debug'
const debug = Debug('postie:module')

function enable (bot) {
  debug('Debug Mode Ready!')

  // ===== Debug Commands =====
  bot.registerCommand('ping', 'Pong!', {
    description: 'Pong!',
    fullDescription:
      "This command could be used to check if the bot is up. Or entertainment when you're bored.",
    reactionButtons: [
      // Add reaction buttons to the command
      {
        emoji: '⬅',
        type: 'edit',
        response: msg => {
          // Reverse the message content
          return msg.content
            .split()
            .reverse()
            .join()
        }
      },
      {
        emoji: '🔁',
        type: 'edit', // Pick a new pong variation
        response: ['Pang!', 'Peng!', 'Ping!', 'Pong!', 'Pung!']
      },
      {
        emoji: '⏹',
        type: 'cancel' // Stop listening for reactions
      }
    ],
    reactionButtonTimeout: 60000 // After 60 seconds, the buttons won't work anymore
  })

  bot.registerCommand(
    'db',
    async (msg, args) => {
      await bot.db.read()
      bot.createMessage(
        msg.channel.id,
        'The database ```json\n' + JSON.stringify(bot.db.data) + '```'
      )
    },
    {
      deleteCommand: true
    }
  )

  bot.registerCommand(
    'delete',
    async (msg, args) => {
      if (args[0] == undefined) {
        bot.tmpResponse(msg, '**Nothing to delete**', 2000)
      }
      bot.tmpResponse(msg, '**Deleting single message: ' + args[0] + '**', 2000)
      bot.deleteMessage(msg.channel.id, args[0], 'cleaning single message')
    },
    {
      description: 'deletes single message',
      fullDescription: 'deletes single message with id',
      deleteCommand: true
    }
  )

  // Dangerous Only dev checking
  // TODO: DISABLE THIS ASAP
  // bot.registerCommand('d', (msg, args) => {
  //   if (args[0] !== undefined) {
  //     eval(args[0])
  //   }
  //   msg.author.id = bot.user.id
  // })
}
function disable (bot) {
  bot.unregisterCommand('ping')
  bot.unregisterCommand('db')
  bot.unregisterCommand('delete')
  // bot.unregisterCommand('d')
}

export default {
  enable,
  disable,
  desc: 'used for debugging the bots functionality'
}
