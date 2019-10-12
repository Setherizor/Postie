const bot = require('../bot')

console.log('Assistant Mode Ready!')

bot.registerCommand('aa', (msg, args) => {
  bot.createMessage(msg.channel.id, 'I am an Assistant for you :smiley:')
})

bot.registerCommand(
  'recall',
  async (msg, args) => {
    // If we have an argument
    if (args[0]) {
      let result = await bot.store.read(
        `recall/${msg.author.id.toString()}/${args[0]}`
      )

      console.log(result)
      // If we have something stored
      if (result) {
        let extension = result.split('.').reverse()[0]
        require('request')(
          { uri: result, encoding: null },
          (err, resp, buffer) => {
            if (err) {
              console.log('issue with request', err)
              return
            }
            bot.createMessage(
              msg.channel.id,
              'Here you go :white_check_mark:',
              {
                file: buffer,
                name: `${msg.author.username}s-image.${extension}`
              }
            )
          }
        )
        // If we are storing a new thing
      } else if (args[1]) {
        bot.store.write(`recall/${msg.author.id}/${args[0]}`, args[1])
        bot.createMessage(
          msg.channel.id,
          ':white_check_mark: Meme Shortcut `' +
            args[0] +
            '` successfully created! '
        )
        // Some Other Case
      } else {
        bot.createMessage(
          msg.channel.id,
          ':red_circle: You need to pass in a name and a url, or a name that has been entered :red_circle:'
        )

        let userObj = await bot.store.read(`recall/${msg.author.id}`)
        if (userObj && Object.keys(userObj).length === 0) {
          bot.createMessage(
            msg.channel.id,
            `:clipboard: Here is a list \n ${'```json\n' + userObj + '```'}`
          )
        }
      }
      // No Args
    } else {
      bot.createMessage(
        msg.channel.id,
        ':red_circle: You need to pass in a name and a url, or a name that has been entered :red_circle:'
      )
    }
  },
  {
    description: 'stores and retrieves urls',
    fullDescription:
      'Should not be seeing this. go ahead and ```@Setherizor``` if you can... :check:'
  }
)

module.exports = { bot: bot, desc: 'more user focused helper functions' }
