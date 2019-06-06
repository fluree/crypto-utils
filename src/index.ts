import { ec } from 'elliptic';
import { sha256 } from 'js-sha256';
import get = require('lodash.get');
import RIPEMD160 = require('ripemd160');
import { getRFC1123DateTime, hexToBytes } from './util';
import baseX = require('base-x');

export function generateKeyPair(){
    const keyPair = new ec('secp256k1').genKeyPair();
    const privateKey = keyPair.getPrivate('hex');
    const compressed = keyPair.getPublic(true, 'hex');

    return { privateKey: String(privateKey), publicKey: compressed }
}

export function getSinFromPublicKey(publicKey: string){
    const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const bs58 = baseX(BASE58)

    const pub = hexToBytes(publicKey);
    const pubSHA256 = Buffer.from(sha256.arrayBuffer(pub));
    const pubRIPEMD = new RIPEMD160().update(pubSHA256).digest()

    const padding = new Uint8Array([0x0F, 0x02]);
    const concatedComp = new Uint8Array(padding.length + pubRIPEMD.length)
    concatedComp.set(padding)
    concatedComp.set(pubRIPEMD, padding.length);

    const checksum = Buffer.from(sha256.arrayBuffer(sha256.arrayBuffer(concatedComp)).slice(0, 4));
    const bytesToEncode = new Uint8Array(concatedComp.length + checksum.length);
    bytesToEncode.set(concatedComp)
    bytesToEncode.set(checksum, concatedComp.length);
  
    const bytesToEncodeBuf = Buffer.from(bytesToEncode);
    const sin = bs58.encode(bytesToEncodeBuf);

    return sin;
}

export function signCommand(hash: string, privateKey: string){
    const privBuffer = Buffer.from(hexToBytes(privateKey));
    const ecCurve = new ec('secp256k1');  
    const keyPair = ecCurve.keyPair({ priv:  privBuffer})
      
    const sig = ecCurve.sign(hash, keyPair, 'hex' );
    const derSig = sig.toDER('hex');
    const recoveryParam = get(sig, "recoveryParam");
    let recovery; 

    if(recoveryParam === null){
        recovery = 27;
    } else {
        recovery = recoveryParam + 27;
    }

    const recoveryByte = (recovery).toString(16);
  
    const fullSig = recoveryByte + derSig;
    return fullSig
}

export function signTransaction(auth: string, db: string, expire: string | number, 
    fuel: string | number, nonce: string | number, privateKey: string, tx: string){

    let dbLower = db.toLowerCase();

    const cmd = {
        "type": "tx", "db": dbLower, "tx": JSON.parse(tx), "auth": auth, "fuel": Number(fuel), 
        "nonce": Number(nonce), "expire": Number(expire) 
    }

    const stringifiedCmd = JSON.stringify(cmd);
    const hash = sha256.hex(stringifiedCmd);
    const sig = signCommand(hash, privateKey);

    return { cmd: stringifiedCmd, sig }
}

export function signQuery( privateKey: string, 
    param: string, queryType: string, 
    host: string, db: string ){

    let dbLower = db.toLowerCase();

    const formattedDate = getRFC1123DateTime();
    let digest = sha256(param)
    digest = Buffer.from(digest, 'hex').toString("base64");
    
    const uri = `/fdb/${dbLower}/${queryType.toLowerCase()}`
   
    const signingString = `(request-target): post ${uri}\nhost: ${host}\nmydate: ${formattedDate}\ndigest: SHA-256=${digest}`
    const hash = sha256(signingString);

    const sig = signCommand(hash, privateKey);
    const signature = `keyId="na",headers="(request-target) host mydate digest",algorithm="ecdsa-sha256",signature="${sig}"`

    const headers =  {
      "content-type": "application/json",
      "mydate": formattedDate,
      "digest": `SHA-256=${digest}`,
      "signature": signature
    }             
  
    return {
      method: 'POST',
      headers,
      body: param
    };

  }
