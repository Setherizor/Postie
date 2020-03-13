const low = require('lowdb')

const defaultValue = {
  config: {
    mode: 'default'
  },
  recall: {}
}

// In memory option
// const Memory = require('lowdb/adapters/Memory')
// const db = low(new Memory())
// db.defaults(defaultValue).write()

// Better option that handles concurrency
const FileAsync = require('lowdb/adapters/FileAsync')
// Init File with default configs
const adapter = new FileAsync(process.env.DB_FILE, { defaultValue })
module.exports = low(adapter)
