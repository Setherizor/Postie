import { join } from 'path'
import { Low, JSONFile } from 'lowdb'

// Use JSON file for storage
const file = join('.', 'data', 'db.json')
const db = new Low(new JSONFile(file))

async function init () {
  await db.read()
  // Set default data
  if (db.data == null) {
    db.data = {
      config: {
        mode: 'default'
      },
      recall: {}
    }
  }
  await db.write()
  return db
}

export default await init()
