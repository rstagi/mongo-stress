# Mongo Stress scripts

## Overview

This script aims to mesure the performance of two different solutions for the Idempotence problem in the Fast Data product.

The first approach (a.k.a. `NORMAL`) leverages the simple Duplicate Key errors from Mongo in order to ensure the correct order of the operations.

The second approach (a.k.a. `AGGREGATION`) performs an aggregation in order to decide if update the document or not.

Both ensure the idempotence, but has their pros and cons.


## How to use the script

### Generate the files

Example command:
```
npm run generate --ops-count=200000 --max-pk-value=60000
```

This will generate two files:
- `operations.json` containing 200K operations
- `expected-docs.json` containing all the expected values for the generated documents

### Run the test

Example command:
```
npm run test --op-type=NORMAL --log-interval=5000 --ops-in-batch=10000
```

This will run the test using the files generated above. It will print a log every 5000ms and will perform 10K ops at a time.

`op-type` must be either `NORMAL` or `AGGREGATION`.

### Clean the database

Example command:
```
npm run clean
```

This will clean the database. **Be careful**: it deletes all the database from the mongodb cluster.

## Proposed solution (to be reviewed)

The "aggregation" approach looks quite slower than the "normal" one. However, the "normal" approach has an important shortcoming: we rely on a MongoDB Error to perform some logic. Moreover, the recovery of the Mongo error is also complex and error prone.

For this reason, my proposed solution is the following:
- keep the "normal" approach, letting Mongo launch a Duplicate Key error if something goes wrong with the counter
- if a mongo error is catched, then the RTU enters a "safer" mode, in which tries to perform again all the (current) operations using the "aggregation" approach
- if the mongo error persists, then it must be something more than just a counter issue, so we do want to rethrow
- however, if the mongo error does not persist, we solved the problem by just slowing the consumer for some seconds and without relying on fancy and error-prone recoveries

Notice that we might couple this mixed solution with something about recoveryng the last committed offsets for the current partition, which might very well help in the task (notice: I'm not talking about the proposed solution employing mongo transactions to store the committed offsets in some other collection, but I'm just implying that we might want to save the committed offsets in there and then retrieve the offsets at the beginning of the batch and perform a seek to them. Such operation is not atomic, but imho it will solve most of the issues about concurrent services, helping any recovery mechanism by mitigating their causes).

So, just as a recap, my proposed solution is the following:
- for each batch, I retrieve the offsets from mongo (or redis?) and I seek to them
- for each operation I add the check on the internal_counter to be smaller than the operation one
  - if Mongo launches an error, I try to perform the same operation with the aggregation
    - if Mongo still launches an error, I fail (pausing the fetch by the current topic)
- if everything goes right, I advancde by both committing the offsets on Kafka and storing them on MongoDB
