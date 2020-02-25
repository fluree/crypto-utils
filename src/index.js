var crypto = require('fluree-cryptography-base');

// Format Date to RFC1123 -> Mon, 11 Mar 2019 12:23:01 GMT
function getWeekday(idx){
    var weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[idx]
  }
  
  function getMonthWord(idx){
    var months = ["Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"];
    return months[idx]
  }
  
  function formatTwoDigits(str){
    return ("00" + str).slice(-2)
  }
  
function getRFC1123DateTime(){
    var nowDate = new Date()
    var weekday = getWeekday(nowDate.getDay());
    var day = formatTwoDigits(nowDate.getDate());
    var month = getMonthWord(nowDate.getMonth());
    var year = nowDate.getUTCFullYear();  
    var hours = formatTwoDigits(nowDate.getUTCHours());
    var minutes = formatTwoDigits(nowDate.getUTCMinutes());
    var seconds = formatTwoDigits(nowDate.getUTCSeconds());
  
    return weekday + ", " + day + " " + month + " " + year + " " + hours + ":" + minutes + ":" + seconds + " GMT";
}

function generateKeyPair(){
    var keyPair = crypto.generate_key_pair();
    return { privateKey: keyPair.private, publicKey: keyPair.public }
}

function getSinFromPublicKey(publicKey){
    return crypto.account_id_from_public(publicKey);
}

function signCommand(msg, privateKey){
   return crypto.sign_message(msg, privateKey);
}

function signTransaction(auth, db, expire, fuel, nonce, privateKey, tx, deps){

    var dbLower = db.toLowerCase();

    var cmd = {
        "type": "tx", "db": dbLower, "tx": JSON.parse(tx), "auth": auth, "fuel": Number(fuel), 
        "nonce": Number(nonce), "expire": Number(expire) 
    }

    if(deps){
      cmd["deps"] = deps;
    }

    var stringifiedCmd = JSON.stringify(cmd);
    var sig = signCommand(stringifiedCmd, privateKey);

    return { cmd: stringifiedCmd, sig: sig }
}

function signQuery( privateKey, param, queryType, host, db, auth ){

    var dbLower = db.toLowerCase();

    var formattedDate = getRFC1123DateTime();
    var digest = crypto.sha2_256_normalize(param, "base64");
    
    var uri = "/fdb/" + dbLower + "/" + queryType.toLowerCase();
   
    var signingString = "(request-target): post " + uri + 
      "\nx-fluree-date: " + formattedDate + 
      "\ndigest: SHA-256=" + digest;

    var sig = signCommand(signingString, privateKey);
    var authStr;
    if(auth){
      authStr = auth;
    } else {
      authStr = "na"
    }
    var signature = 'keyId="' + authStr + '",' +
      'headers="(request-target) x-fluree-date digest",' +
      'algorithm="ecdsa-sha256",' + 
      'signature="' + sig + '"';

    var headers =  {
      "Content-Type": "application/json",
      "X-Fluree-Date": formattedDate,
      "Digest": "SHA-256=" + digest,
      "Signature": signature
    }             
  
    return {
      method: "POST",
      headers: headers,
      body: param
    };

  }


  module.exports.generateKeyPair = generateKeyPair;
  module.exports.getSinFromPublicKey = getSinFromPublicKey;
  module.exports.signTransaction = signTransaction;
  module.exports.signQuery = signQuery;