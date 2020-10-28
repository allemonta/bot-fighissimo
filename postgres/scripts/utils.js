const { join } = require("path")
require("dotenv").config({
  path: join(__dirname, "../../.env")
})
const { Client } = require("pg")

const e = module.exports

e.getClient = () => {
  const connectionParams = {
    user: process.env.POSTGRES_USER,
    host: "localhost",
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432
  }

  return new Client(connectionParams)
}
