const bot = require('../bot')

console.log('Assistant Mode Ready!')

bot.registerCommand('aa', (msg, args) => {
  bot.createMessage(msg.channel.id, 'I am an Assistant for you :smiley:')
})

bot.registerCommand(
  'recall',
  (msg, args) => {
    if (!bot.store.hasOwn(msg.author.id)) bot.store.set(msg.author.id, {})

    if (args[0]) {
      if (bot.store.hasOwn(`${msg.author.id}.${args[0]}`)) {
        let url = bot.store.get(`${msg.author.id}.${args[0]}`)
        let extension = url.split('.').reverse()[0]
        require('request')({ url, encoding: null }, (err, resp, buffer) => {
          if (err) {
            console.log('issue with request')
            return
          }
          bot.createMessage(msg.channel.id, 'Here you go :white_check_mark:', {
            file: buffer,
            name: `${msg.author.username}s-image.${extension}`
          })
        })
      } else if (args[1]) {
        bot.store.set(`${msg.author.id}.${args[0]}`, args[1])
      } else {
        bot.createMessage(
          msg.channel.id,
          ':red_circle: You need to pass in a name and a url, or a name that has been entered :red_circle:'
        )

        if (Object.keys(bot.store.get(msg.author.id)).length === 0) {
          bot.createMessage(
            msg.channel.id,
            `:clipboard: Here is a list \n ${'```json\n' +
              bot.store.get(msg.author.id) +
              '```'}`
          )
        }
      }
    }
  },
  {
    description: 'stores and retrieves urls',
    fullDescription:
      'Should not be seeing this. go ahead and ```@Setherizor``` if you can... :check:'
  }
)

module.exports = { bot: bot, desc: 'more user focused helper functions' }
