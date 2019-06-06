// Convert a hex string to a byte array
// https://stackoverflow.com/questions/14603205/how-to-convert-hex-string-into-a-bytes-array-and-a-bytes-array-in-the-hex-strin
export function hexToBytes(hex: string) {
  const bytes = [];
  for (let c = 0; c < hex.length; c += 2){
    bytes.push(parseInt(hex.substr(c, 2), 16));
  }
  return bytes;
}

// Format Date to RFC1123 -> Mon, 11 Mar 2019 12:23:01 GMT
function getWeekday(idx: number){
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return weekdays[idx]
  }
  
  function getMonthWord(idx: number){
    const months = ["Jan", "Feb", "Mar", "Apr","May", "Jun", "Jul", "Aug", "Sep","Oct", "Nov", "Dec"];
    return months[idx]
  }
  
  function formatTwoDigits(str: number){
    return ("00" + str).slice(-2)
  }
  
  export function getRFC1123DateTime(){
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