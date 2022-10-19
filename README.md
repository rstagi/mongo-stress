# Mongo Stress scripts

## Overview

This script aims to mesure the performance of two different solutions for the Idempotence problem in the Fast Data product.

The first approach (a.k.a. `NORMAL`) leverages the simple Duplicate Key errors from Mongo in order to ensure the correct order of the operations.

The second approach (a.k.a. `AGGREGATION`) performs an aggregation in order to decide if update the document or not.

Both ensure the idempotence, but has their pros and cons.


## Generate the files

Example command:
```
npm run generate --ops-count=200000 --max-pk-value=60000
```

This will generate two files:
- `operations.json` containing 200K operations
- `expected-docs.json` containing all the expected values for the generated documents

## Run the test

Example command:
```
npm run test --op-type=NORMAL --log-interval=5000 --ops-in-batch=10000
```

This will run the test using the files generated above. It will print a log every 5000ms and will perform 10K ops at a time.

`op-type` must be either `NORMAL` or `AGGREGATION`.

## Clean the database

Example command:
```
npm run clean
```

This will clean the database. **Be careful**: it deletes all the database from the mongodb cluster.

