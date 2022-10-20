'use strict'

function debugging() {
  return Boolean(process.env.npm_config_debug)
}

function displayErrors() {
  return Boolean(process.env.npm_config_display_errors)
}

function logInterval() {
  return Number(process.env.npm_config_log_interval || 30000)
}

function detectMismatches() {
  return Boolean(process.env.npm_config_detect_mismatches)
}

const OP_TYPES = {
  AGGREGATION: 'AGGREGATION',
  NORMAL: 'NORMAL',
}
function opType() {
  const opType = process.env.npm_config_op_type
  const allowedValues = Object.values(OP_TYPES)
  if (!allowedValues.includes(opType)) {
    throw new Error(`opType should be one of: ${allowedValues}`)
  }
  return opType
}

function fileNamePrefix () {
  const prefix = process.env.npm_config_file_name_prefix
  return prefix ? `${prefix}-` : ''
}

function operationsFileName () {
  return `./inputs/${fileNamePrefix()}operations.json`
}

function expectedDocsFileName () {
  return `./inputs/${fileNamePrefix()}expected-docs.json`
}

function localDb() {
  return Boolean(process.env.npm_config_local_db)
}

function mongoUrl() {
  if (localDb()) {
    return `mongodb://localhost:27017/`
  } else {
    return `mongodb+srv://rob:${process.env.MONGODB_PASSWORD}@cluster1.qi9z0.mongodb.net/?retryWrites=true&w=majority`
  }
}

function checkDocs() {
  return Boolean(process.env.npm_config_check_docs)
}

function opsInBatch() {
  return Number(process.env.npm_config_ops_in_batch || 1000)
}

// Test MongoDB Cluster: Mongo Atlas M10 - AWS

// Run 200000 ops -> actual run under 2 minutes, so not so reliable
// 
// NORMAL: (23:38 - 23:44)
//    command: npm run test --op-type=NORMAL --file-name-prefix=1 --log-interval=5000  --ops-in-batch=10000
//    time: 23,27s user 5,77s system 31% cpu 1:31,40 total
//    output: Errors: 0, Mismatches: 33, Updates: 142121, Inserts: 57846
//    mongo stats:
//      commands: 2.63K/s
//      write ops: 222/s
//      Max Disk util: 77%
//      CPU: 105%
//    
// AGGREGATION: (23:45 - 23:50)
//    command: npm run test --op-type=AGGREGATION --file-name-prefix=1 --log-interval=5000
//    time: 23,49s user 5,61s system 32% cpu 1:29,89 total
//    output: Errors: 0, Mismatches: 33, Updates: 142121, Inserts: 57846
//    mongo stats:
//      commands: 2.5K/s
//      write ops: 180/s
//      Max Disk util: 66.4%
//      CPU: 80%
//


// Run 500000 ops
// 
// NORMAL: (23:52 - 23:58)
//    command: npm run test --op-type=NORMAL --file-name-prefix=2 --log-interval=5000  --ops-in-batch=10000
//    time: 61,79s user 15,23s system 30% cpu 4:08,87 total
//    output: Errors: 0, Mismatches: 56, Updates: 400639, Inserts: 99305
//    mongo stats:
//      commands: 2.63K/s
//      write ops: 236/s
//      Max Disk util: 70%
//      CPU: 108%
//    
// AGGREGATION: (23:59 - 23:20) -> to be repeated
//    command: npm run test --op-type=AGGREGATION --file-name-prefix=2 --log-interval=5000
//    time: 115,65s user 26,75s system 13% cpu 17:24,81 total
//    output: Errors: 0, Mismatches: 68, Updates: 400627, Inserts: 99305
//    mongo stats:
//      commands: 2.63K/s
//      write ops: 237/s
//      Max Disk util: 77%
//      CPU: 107%
//

module.exports = {
  debugging,
  opType,
  OP_TYPES,
  operationsFileName,
  expectedDocsFileName,
  mongoUrl,
  checkDocs,
  opsInBatch,
  displayErrors,
  logInterval,
  detectMismatches,
}
