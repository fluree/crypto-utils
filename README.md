# Fluree Cryptography 

A collection of Javascript cryptography functions for Fluree

```
npm install fluree-cryptography 
```

## API

### Generate Keys

Returns a hex string of a public and private key pair. 

```javascript
import { generateKeyPair } from 'fluree-cryptography';

const { publicKey, privateKey }  = generateKeyPair();

```

### Get Auth ID from Public Key

Returns the `_auth/id` that accompanies a given public key. 

```javascript
import { generateKeyPair, getSinFromPublicKey } from 'fluree-cryptography';

const { publicKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

```

### Sign Transaction

signTransaction returns an object with the keys: sig, cmd, which should then be sent in the body of a request to the `/command` endpoint. 

```javascript
import { generateKeyPair, getSinFromPublicKey, signTransaction } from 'fluree-cryptography';

const { publicKey, privateKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

const db = "test/one";
const expire = Date.now() + 1000;
const fuel = 100000;
const nonce = 1;

const exampleTx = JSON.stringifiy([{
    "_id": "_tag",
    "id": "tag/test" }])

const command = signTransaction(authId, db, expire, fuel, nonce, privateKey, exampleTx)

const fetchOpts = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };

const fullURI = `https://localhost:8090/fdb/${db}/command`;

fetch(fullURI, fetchOpts)
```

### Sign Query

signQuery returns an object with the keys: header, method, body, which should then be sent to any of the query endpoints (`/query`, `/multi-query`, `history`, `block`).

```javascript
import { generateLeyPair, getSinFromPublicKey, signQuery } from 'fluree-cryptography';

const { privateKey }  = generateKeyPair();
const authId = getSinFromPublicKey(publicKey);

const param = JSON.stringify({select: ["*"], from: "_collection"});
const db = "test/one";
const host = "localhost";
const queryType = "query";


const fetchOpts = signQuery(privateKey, param, queryType, host, db)

const fullURI = `https://localhost:8090/fdb/${db}/query`;

fetch(fullURI, fetchOpts)
```


