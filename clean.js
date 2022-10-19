'use strict'

const { MongoClient } = require('mongodb')
const { mongoUrl } = require('./utils')

async function main() {
  const mongo = new MongoClient(mongoUrl())
  await mongo.connect()
  const dbs = await mongo.db('test').admin().listDatabases()
  await Promise.all(dbs.databases.filter(db => db.name.match(/^(AGGREGATION|NORMAL).+/)).map(db => mongo.db(db.name).dropDatabase()))
  await mongo.close()
}

main()
