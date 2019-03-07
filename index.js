var elliptic = require('elliptic');
var sha256 = require('js-sha256').sha256;
var RIPEMD160 = require('ripemd160');
var bs58 = require('bs58');

export function genKeyPair(){
    const keyPair = new elliptic.ec('secp256k1').genKeyPair();
    let privateKey = keyPair.getPrivate('hex');
    let compressed = keyPair.getPublic(true, 'hex');

    return { private: privateKey, public: compressed }
}

// Convert a hex string to a byte array
// https://stackoverflow.com/questions/14603205/how-to-convert-hex-string-into-a-bytes-array-and-a-bytes-array-in-the-hex-strin
function hexToBytes(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
      bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
}  

export function getSinFromPublicKey(publicKey){
    let pub = hexToBytes(compressed);
    let pubSHA256 = Buffer.from(sha256.arrayBuffer(pub));
    let pubRIPEMD = new RIPEMD160().update(pubSHA256).digest()

    let padding = new Uint8Array([0x0F, 0x02]);
    let concatedComp = new Uint8Array(padding.length + pubRIPEMD.length)
    concatedComp.set(padding)
    concatedComp.set(pubRIPEMD, padding.length);

    let checksum = Buffer.from(sha256.arrayBuffer(sha256.arrayBuffer(concatedComp)).slice(0, 4));
    let bytesToEncode = new Uint8Array(concatedComp.length + checksum.length);
    bytesToEncode.set(concatedComp)
    bytesToEncode.set(checksum, concatedComp.length);
  
    let bytesToEncodeBuf = Buffer.from(bytesToEncode);
    let sin = bs58.encode(bytesToEncodeBuf);

    return sin;
}

export function signCommand(cmd, privateKey){
    let stringifiedCmd = JSON.stringify(cmd)
    let hash = sha256.hex(stringifiedCmd);
  
    let ec = new elliptic.ec('secp256k1');  
    let keyPair = ec.keyPair({ priv: privateKey })
      
    let sig = ec.sign(hash, keyPair, 'hex' );
    let derSig = sig.toDER('hex');
    let recovery = get(sig, "recoveryParam") + 27;
    let recoveryByte = (recovery).toString(16);
  
    let fullSig = recoveryByte + derSig;
    return fullSig
}

export function signTransaction(auth, fuel, nonce, expire, privateKey){
    let cmd = {
        "type": type, "db": db, "tx": JSON.parse(tx), "auth": auth, "fuel": Number(fuel), 
        "nonce": Number(nonce), "expire": Number(expire) 
    }

    let sig = signCommand(cmd, privateKey)
  
    return { cmd: stringifiedCmd, sig: sig }
}


