'use strict'

const { MongoClient } = require('mongodb')
const { eqProps, equals } = require('ramda')
const { logInterval, debugging, opType, expectedDocsFileName, operationsFileName, OP_TYPES, mongoUrl, checkDocs, opsInBatch, displayErrors, detectMismatches } = require('./utils')

async function initCollection () {
  const mongo = new MongoClient(mongoUrl())
  await mongo.connect()
  const collection = mongo.db(`${opType()}${Date.now()}`).collection(`test`)
  await collection.createIndex({ pk: 1 }, { unique: true })
  return { mongo, collection }
}

async function main() {
  const { mongo, collection } = await initCollection()
  const operations = require(operationsFileName())
  const expectedDocs = require(expectedDocsFileName())
  const getOp = opType() === OP_TYPES.AGGREGATION ? aggregationOp : normalOp
  const N_OPS_IN_BATCH = opsInBatch()
  
  const errors = []
  let doneOps = 0, mismatches = 0, updates = 0, inserts = 0
  const log = () => console.log(`Processed ${doneOps} operations (Errors: ${errors.length}, Mismatches: ${mismatches}, Updates: ${updates}, Inserts: ${inserts})`)
  const loggingInterval = setInterval(log, logInterval())
  while (operations.length > 0) {
    const proms = operations.splice(0, N_OPS_IN_BATCH).map(async ({ pk, obj }) => {
      const op = getOp(pk, obj)
      try {
        const result = await collection.findOneAndUpdate(op.filter, op.updateStatement, { upsert: true })
        if (result.value) {
          if(op.counter < result.value.internal_counter) {
            mismatches++
          } else  {
            updates++
          }
        } else {
          inserts++
        }
        if (debugging()) {
          console.log(pk, obj)
          console.log(op)
          console.log(result)
        }
        if (!result.lastErrorObject.n || !result.ok) {
          notOks.push(result)
        }
      } catch (error) {
        const isCounterMismatch = opType() === OP_TYPES.NORMAL && error.code === 11000

        if (debugging() || displayErrors() && !isCounterMismatch) {
          console.log(error)
        }

        if (isCounterMismatch) {
          mismatches++
        } else {
          errors.push(error)
        }
      } finally {
        doneOps++
      }
    })
    await Promise.all(proms)
  }

  clearInterval(loggingInterval)
  log()

  const finalDocs = await collection.find({}).project({ _id: 0 }).sort({pk: 1}).toArray()
  if (debugging()) {
    console.log('Expected Docs: ', expectedDocs)
    console.log('Final Docs: ', finalDocs)
  }
  
  if (checkDocs()) {
    if (!equals(finalDocs, expectedDocs)) {
      console.log('!!! THERE ARE SOME ERRORS IN FINAL DOCS !!!')
    } else {
      console.log('Final Docs and Expected Docs are the same.')
    }
  }



  await mongo.close()
}

function normalOp(pk, obj) {
  return {
    filter: { pk, internal_counter: { $lte: obj.internal_counter } },
    updateStatement: { $set: obj },
    counter: obj.internal_counter,
  }
}

function aggregationOp(pk, obj) {
  return {
    counter: obj.internal_counter,
    filter: { pk },
    updateStatement: [{
      $replaceRoot: {
        newRoot: {
            $cond: [
              { $gt: [obj.internal_counter, "$internal_counter"]},
              { $mergeObjects: ["$$ROOT", obj] },
              "$$ROOT"
            ]
        }
      }
    }]
  }
}

main()
