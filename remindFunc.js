const isEnable = function(text){
    var chars = text.split('');
    var num = 0;
    var res = 0;
    var ok = true;
    chars.forEach(c => {
        if(c === '分'){
            res += num * 1000 * 60;
            num = 0;
        }else if(c === '時間'){
            res += num * 1000 * 60 * 60;
            num = 0;
        }else if(c === '秒'){
            res += num * 1000;
            num = 0;
        }else{
            var n = parseInt(c, 10);
            if(isNaN(n)){
                ok = false;
            }else{
                num = num * 10 + n;
            }
        }
    });
    if(!ok) return -1;
    return res;
}

module.exports = {
    isEnable,
}