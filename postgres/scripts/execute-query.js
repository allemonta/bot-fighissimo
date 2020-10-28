const { join } = require("path")
const { readFileSync } = require("fs")
const { getClient } = require("./utils.js")

const sql = readFileSync(join(__dirname, "../sql/", `${process.argv[2]}.sql`), "utf8")

const printSqlQueryResults = (results) => {
  results.forEach(({ command }) => {
    console.log(`\tCOMMMAND EXECUTED: ${command}`)
  })
}

void (async () => {
  const client = getClient()
  client.connect()
  try {
    console.log(`EXECUTING QUERIES IN ${process.argv[2]}.sql`)
    printSqlQueryResults(await client.query(sql))
  } catch (err) {
    console.error(err)
  } finally {
    await client.end()
  }
})()
  .catch(console.error)
