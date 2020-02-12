const config = {
  port: process.env.APP_PORT,
  db_port: process.env.DB_PORT,
  db_user: process.env.MONGO_INITDB_ROOT_USERNAME,
  db_pass: process.env.MONGO_INITDB_ROOT_PASSWORD,
  db_name: process.env.MONGO_INITDB_DATABASE,
  db_host: process.env.MONGO_HOST,
  node_env: process.env.NODE_ENV,
}

module.exports = config;
