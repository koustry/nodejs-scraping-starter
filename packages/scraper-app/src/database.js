const mongoose = require('mongoose');

const config = require('./config');

async function connectDatabase() {
  const uri = `mongodb://${config.db_host}:${config.db_port}`
  const options = {
    useCreateIndex: true, 
    useUnifiedTopology: true, 
    useNewUrlParser: true,
    user: config.db_user,
    pass: config.db_pass
  }

  try {
    await mongoose.connect(uri, options)
  } catch (error) {
    console.error("Error connect to DB:", error)
    throw error
  }
  mongoose.connection
    .on('error', (err) => console.error('Connection error:', err.message))
    .once('open', () => console.log('Connected to DB!'))
}

async function initialize() {
  await connectDatabase()
}

module.exports = {
  initialize
}
