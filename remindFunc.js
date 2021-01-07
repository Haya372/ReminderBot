//タイマーの時間を計算する
//入力が不適切な場合-1を返す
const calcTime = function(text){
    var chars = text.split('');
    var num = 0;
    var res = 0;
    var ok = true;
    for(let i = 0; i < chars.length; i++){
        var c = chars[i];
        if(c === '分'){
            res += num * 1000 * 60;
            num = 0;
        }else if(c === '時'){
            i++;
            if(chars[i] === '間'){
                res += num * 1000 * 60 * 60;
                num = 0;
            }else{
                ok = false;
                break;
            }
        }else if(c === '秒'){
            res += num * 1000;
            num = 0;
        }else{
            var n = parseInt(c, 10);
            if(isNaN(n)){
                ok = false;
                break;
            }else{
                num = num * 10 + n;
            }
        }
    };
    if(!ok) return -1;
    return res;
}

//アラームの時間を計算する
//入力が不適切な場合-1を返す
const getAlermTime = function(text){
    var chars = text.split(':');
    var now = new Date();
    var now_hour = now.getHours();
    var now_minute = now.getMinutes();
    if(chars.length != 2) return -1;
    var alerm_hour = parseInt(chars[0], 10);
    var alerm_minute = parseInt(chars[1], 10);
    if(isNaN(alerm_hour) || isNaN(alerm_minute)) return -1;
    if(alerm_hour < 0 || alerm_hour >= 24 || alerm_minute < 0 || alerm_minute >= 60) return -1;
    alerm_minute -= now_minute;
    alerm_hour -= now_hour;
    if(alerm_minute < 0){
        alerm_minute += 60;
        alerm_hour--;
    }
    if(alerm_hour < 0) alerm_hour += 24;
    return alerm_hour * 1000 * 60 * 60 + alerm_minute * 1000 * 60;
}

module.exports = {
    calcTime,
    getAlermTime
}