const crypto = require('fluree-cryptography-base');

// Format Date to RFC1123 -> Mon, 11 Mar 2019 12:23:01 GMT
function getWeekday(idx){
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[idx]
  }
  
  function getMonthWord(idx){
    const months = ["Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"];
    return months[idx]
  }
  
  function formatTwoDigits(str){
    return ("00" + str).slice(-2)
  }
  
function getRFC1123DateTime(){
    const nowDate = new Date()
    const weekday = getWeekday(nowDate.getDay());
    const day = formatTwoDigits(nowDate.getDate());
    const month = getMonthWord(nowDate.getMonth());
    const year = nowDate.getUTCFullYear();  
    const hours = formatTwoDigits(nowDate.getUTCHours());
    const minutes = formatTwoDigits(nowDate.getUTCMinutes());
    const seconds = formatTwoDigits(nowDate.getUTCSeconds());
  
    return `${weekday}, ${day} ${month} ${year} ${hours}:${minutes}:${seconds} GMT`;
}

function generateKeyPair(){
    const keyPair = crypto.generate_key_pair();
    return { privateKey: keyPair.private, publicKey: keyPair.public }
}

function getSinFromPublicKey(publicKey){
    return crypto.account_id_from_public(publicKey);
}

function signCommand(msg, privateKey){
   return crypto.sign_message(msg, privateKey);
}

function signTransaction(auth, db, expire, fuel, nonce, privateKey, tx){

    let dbLower = db.toLowerCase();

    const cmd = {
        "type": "tx", "db": dbLower, "tx": JSON.parse(tx), "auth": auth, "fuel": Number(fuel), 
        "nonce": Number(nonce), "expire": Number(expire) 
    }

    const stringifiedCmd = JSON.stringify(cmd);
    const sig = signCommand(stringifiedCmd, privateKey);

    return { cmd: stringifiedCmd, sig }
}

function signQuery( privateKey, param, queryType, host, db, auth ){

    let dbLower = db.toLowerCase();

    const formattedDate = getRFC1123DateTime();
    let digest = crypto.sha2_256_normalize(param, "base64");
    
    const uri = `/fdb/${dbLower}/${queryType.toLowerCase()}`
   
    const signingString = `(request-target): post ${uri}\nhost: ${host}\nmydate: ${formattedDate}\ndigest: SHA-256=${digest}`

    const sig = signCommand(signingString, privateKey);
    const signature = `keyId="${auth || "na"}",headers="(request-target) host mydate digest",algorithm="ecdsa-sha256",signature="${sig}"`

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


  module.exports.generateKeyPair = generateKeyPair;
  module.exports.getSinFromPublicKey = getSinFromPublicKey;
  module.exports.signTransaction = signTransaction;
  module.exports.signQuery = signQuery;