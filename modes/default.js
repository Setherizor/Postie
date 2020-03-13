const request = require('request') // Enables HTTP Requests
const bot = require('../bot')

const debug = require('debug')('postie:module')
debug('Default Mode Ready!')

// Request Function
const post = (payload, url, callback) => {
  request.post(url, { json: { body: payload } }, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      debug('post response:', body)
      callback(body)
    }
  })
}

// Does HTTP post to my catcher
bot.registerCommand(
  'post',
  (msg, args) => {
    const url = args[0] || 'http://seth.requestcatcher.com/test'
    post('Its me', url, data => {
      bot.createMessage(msg.channel.id, 'Request: ```' + data + '```' + url)
    })
  },
  {
    description: 'http post',
    fullDescription: 'This command performs basic http post'
  }
)

bot.registerCommand(
  'play',
  (msg, args) => {
    bot.createMessage(msg.channel.id, '**NOT SUPPOSED TO SEE THIS**')
    const channel = msg.channel.guild.channels.get(
      msg.member.voiceState.channelID
    )
    channel.leave()
    channel
      .join()
      .then(connection => {
        debug('connected to voice channel')
        connection.volume = 100
        // const dispatcher =
        connection.play(
          'https://cdn.glitch.com/9dd5ac6b-827a-4403-85d1-9ce1cc6ee750%2Fand-his-name-is-john-cena-1.mp3?1535563563167'
        )
        connection.on('end', function (end) {
          debug('leaving voice channel')
          channel.leave()
        })
      })
      .catch(e => debug('audio playback error', e))
  },
  {
    description: 'play some audio',
    fullDescription:
      'Should attempt to play some funny audio. Does not always work :smile:'
  }
)

bot.registerCommand(
  'stop',
  (msg, args) => {
    bot.createMessage(msg.channel.id, '__sorry...__')

    const channel = msg.channel.guild.channels.get(
      msg.member.voiceState.channelID
    )
    channel.leave()
  },
  {
    description: 'leaves voice channel',
    fullDescription: 'goodbye to current voice channel'
  }
)

bot.registerCommand(
  'clean',
  (msg, args) => {
    bot.createMessage(msg.channel.id, '**Cleaning up my messages :smiley:**')
    let toDelete = msg.channel.messages.filter(m => m.author.id == bot.user.id)
    debug(`deleting ${toDelete.length} messages`)
    toDelete.forEach(m =>
      bot.deleteMessage(m.channel.id, m.id, 'cleaning bot messages')
    )
  },
  {
    description: 'bot cleaning',
    fullDescription: 'deletes bots recent messages in channel'
  }
)

module.exports = { bot, desc: 'default mode with normal functions' }
