const bot = require('../bot')
const debug = require('debug')('postie:module')

debug('Assistant Mode Ready!')

bot.registerCommand('aa', (msg, args) => {
  bot.createMessage(msg.channel.id, 'I am an Assistant for you :smiley:')
})

bot.registerCommand(
  'recall',
  async (msg, args) => {
    // Define Resource Locations
    const ownerURI = `recall.${msg.author.id.toString()}`
    const resourceURI = `${ownerURI}.${args[0]}`

    // If we have argument and are listing items
    if (args[0] && args[0] == 'list') {
      // List Existing recalls
      let userObj = (await bot.db).get(ownerURI).value()
      if (userObj && Object.keys(userObj).length != 0) {
        bot.createMessage(
          msg.channel.id,
          `:clipboard: Here is a list \n ${'```json\n' +
            Object.keys(userObj) +
            '```'}`
        )
      } else {
        bot.createMessage(msg.channel.id, `You have no recalls that I know of.`)
      }
    }
    // If we have an argument
    else if (args[0]) {
      // Check if record exists
      if ((await bot.db).has(resourceURI).value()) {
        // If we have something stored
        let result = (await bot.db).get(resourceURI).value()
        debug('recall result:', result)
        let extension = result.split('.').reverse()[0]

        // Get file buffer
        require('request')(
          { uri: result, encoding: null },
          (err, resp, buffer) => {
            if (err) {
              debug('issue with request for image', err)
              return
            }
            // Send file and message back
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
      } else if (args[1]) {
        // If we are storing a new thing
        ;(await bot.db).set(resourceURI, args[1]).write()
        bot.createMessage(
          msg.channel.id,
          ':white_check_mark: Meme Shortcut `' +
            args[0] +
            '` successfully created! '
        )
      }
      // No Args
    }
    // Error state
    else {
      bot.createMessage(
        msg.channel.id,
        ':red_circle: You need to pass in a name and a url, or a name that has been entered :red_circle:'
      )
    }
  },
  {
    description: 'stores and retrieves urls',
    fullDescription:
      'Allows you to pass in the url of an image and a meaningful name. Later you can recall the image with this command and the name you specified'
  }
)

module.exports = { bot, desc: 'more user focused helper functions' }
