import { generateKeyPair, getSinFromPublicKey, signTransaction } from '../index';

test('genKeysSignTx', () => {
  const keys = generateKeyPair();
  let { publicKey, privateKey } = keys;
  privateKey = String(privateKey);
  const auth = getSinFromPublicKey(publicKey);

  const tx = JSON.stringify([{
    "_id": "_tag",
    "id": "test/one"
  }]);

  const fuel = 1000000;
  const db = "test/one";
  const nonce = 1;
  const expire = Date.now();

  let cmdConstructed = {
    "type": "tx", 
    "db": db, 
    "tx": JSON.parse(tx), 
    "auth": auth, 
    "fuel": Number(fuel), 
    "nonce": Number(nonce), 
    "expire": Number(expire) 
  }

  const { cmd, sig } = signTransaction(auth, db, expire, fuel, 
    nonce, tx, privateKey);
  const sigLength: number = sig.length;

  expect(cmd).toBe(cmdConstructed);
  expect(sigLength).toBe(142);
});