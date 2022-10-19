'use strict'

const fs = require('fs')
const { opType, operationsFileName, expectedDocsFileName } = require('./utils')

function generate () {
  const N_OPS = Number(process.env.npm_config_ops_count)
  const MAX_PK_VALUE = Number(process.env.npm_config_max_pk_value)

  const expectedMap = {}, operations = []
  for (let i = 0; i < N_OPS; ++i) {
    const pk = Math.ceil(Math.random() * MAX_PK_VALUE)
    const field1 = Math.random() * 1000
    const field2 = Math.random() * 1000

    const obj = { pk, field1, field2, internal_counter: i }
    expectedMap[pk] = {...obj}

    operations.push({ pk, obj })
  }

  const expectedDocs = Object.values(expectedMap).sort((a, b) => a.pk - b.pk)

  return { operations, expectedDocs }
}

function main() {
  const { operations, expectedDocs } = generate()
  fs.writeFileSync(operationsFileName(), JSON.stringify(operations))
  fs.writeFileSync(expectedDocsFileName(), JSON.stringify(expectedDocs))
}

main()
