import assistantmode from './assistant.js'
import defaultmode from './default.js'
import debugmode from './debug.js'

const modes = ['default', 'assistant', 'debug']

function setup (bot, newmode, oldmode = '') {
  if (oldmode != '') {
    this[oldmode + 'mode'].disable(bot)
  }
  this[newmode + 'mode'].enable(bot)
}

function valid (mode) {
  return modes.includes(mode)
}

function descriptions () {
  return modes.map(m => `**${m}** - ${this[m + 'mode'].desc}`).join('\n')
}

export default {
  setup,
  valid,
  descriptions,
  defaultmode,
  assistantmode,
  debugmode
}
