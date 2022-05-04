# Fluree Cryptography 

A collection of Javascript cryptography functions for Fluree

NOTE: This library has been deprecated. We recommend using the
flureedb / flureenjs libraries directly instead. If there is something in here
that you'd like to see in those libraries, please let us know by opening a
GitHub issue here: [https://github.com/fluree/db/issues](https://github.com/fluree/db/issues).

## Installation
```
npm install @fluree/crypto-utils
```

## Breaking change between version 1.9 & 1.10
The `db` parameter has been changed to `ledger` as it should have been named in
the first place. This requires Fluree Ledger version 1.0.1 or higher.

## Breaking change between version 1.8 & 1.9
The `host` parameter has been dropped from the signQuery function since it is no longer used to create the signing string.

## API

### Generate Keys

Returns a hex string of a public and private key pair. 

#### JavaScript version
```javascript
import { generateKeyPair } from '@fluree/crypto-utils';

const { publicKey, privateKey }  = generateKeyPair();
```

#### Node.js version
For Node.js, you will need to reference the Node.js crypto module.
This is because the randomness for Node.js seed generation is 
determined differently than the browser.

```javascript
const crypto = require("crypto");
const {generateKeyPair,getSinFromPublicKey} = require('@fluree/crypto-utils');

const { publicKey, privateKey }  = generateKeyPair();
```

### Get Auth ID from Public Key

Returns the `_auth/id` that accompanies a given public key. 

```javascript
import { generateKeyPair, getSinFromPublicKey } from '@fluree/crypto-utils';

const { publicKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

```

### Sign Transaction

signTransaction returns an object with the keys: sig, cmd, which should then be sent in the body of a request to the `/command` endpoint. 

```javascript
import { generateKeyPair, getSinFromPublicKey, signTransaction } from '@fluree/crypto-utils';

const { publicKey, privateKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

const ledger = "test/one";
const expire = Date.now() + 1000;
const fuel = 100000;
const nonce = 1; 
// Deps is an optional parameter - it is a array of _tx/ids that must have succeeded
// for the current transaction to be accepted.
const deps = null; 

const tx = JSON.stringifiy([{
    "_id": "_tag",
    "id": "tag/test" }])

let command = signTransaction(authId, ledger, expire, fuel, nonce, privateKey, tx, deps)

// If you want to receive the verbose results from the transaction, 
// set the txid-only property to false.  By default (true), only the
// transaction id will be returned.
Object.assign(command, {"txid-only": false});

const fetchOpts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(command)
  };

const fullURI = `https://localhost:8090/fdb/${ledger}/command`;

fetch(fullURI, fetchOpts)
```

### Sign Query

signQuery returns an object with the keys: header, method, body, which should then be sent to any of the query endpoints (`/query`, `/multi-query`, `history`, `block`).

```javascript
import { generateKeyPair, getSinFromPublicKey, signQuery } from '@fluree/crypto-utils';

const { publicKey, privateKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

const param = JSON.stringify({select: ["*"], from: "_collection"});
const ledger = "test/one";
const queryType = "query";


const fetchOpts = signQuery(privateKey, param, queryType, ledger)

const fullURI = `https://localhost:8090/fdb/${ledger}/query`;

fetch(fullURI, fetchOpts)
```

### Sign Request

signRequest returns an object containing the keys: header, method and body. This object can be used to sign requests that are not related to transactions or queries.

#### Example: Delete Ledger
The following example demonstrates how to sign a request to delete a ledger.

```javascript
import { generateKeyPair, getSinFromPublicKey, signRequest } from '@fluree/crypto-utils';

const { publicKey, privateKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

// The host portion of the URL is required as the signRequest 
// function parses the entire url to build the signing string.
var endpoint = 'http://localhost:8090/fdb/delete-db';

var body = JSON.stringify({
  "ledger/id": 'test/deleteme',
  "auth": authId
});

var fetchOpts = signRequest("POST", endpoint, body, privateKey, authId);

fetch(endpoint, fetchOpts)
```
