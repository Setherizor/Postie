const bot = require('../bot')

console.log('Debug Mode Ready!')

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

bot.registerCommand('guild', (msg, args) => {
  console.log(bot.guilds.get('322149669335728159'))
})

bot.registerCommand('db', (msg, args) => {
  bot.createMessage(
    msg.channel.id,
    'The store ```json' + bot.store.clone() + '```'
  )
})

bot.registerCommand('guildrole', (msg, args) => {
  console.log(
    bot.guilds.get('322149669335728159').roles.get('363519626602086411')
  )
})

bot.registerCommand('d', (msg, args) => {
  if (args[0] !== undefined) {
    console.log(eval(`bot.${args[0]}`))
  }
  console.log(bot)
})

module.exports = { bot: bot, desc: 'used for debugging the bots functionality' }
