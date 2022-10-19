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

// Run 10000 ops
// Mismatches:
//    18 31 29 25 28
//
// NORMAL:
//    Times: 21s 22s 24.5s 25s 26s
//    commands: 825/s
//    write iops: 90/s
//    max disk util: 50%
//    CPU: 62%
//
// AGGREGATION:
//    Times: 19s 21.5s 23s 24s 24.5s
//    commands: 921/s
//    write iops: 57/s
//    max disk util: 50%
//    CPU: 35%
//

// Run 500000 ops
// Mismatches:
//    
//
// NORMAL: (21:12 - 21:40)
//    Times: ~20m
//    commands: 2.67K
//    write iops: 218/s
//    max disk util: 59%
//    CPU: 147%
//
// AGGREGATION: n.d.
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
