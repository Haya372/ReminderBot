// .envの読み込み
require('dotenv').config();

const server = require("express")();
const line = require("@line/bot-sdk");

const line_config = {
    channelAccessToken: process.env.LINE_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET
};

const bot = new line.Client(line_config);

const remindFumc = require("./remindFunc");

server.listen(process.env.PORT || 3000);

server.post('/bot/webhook', line.middleware(line_config), (req, res, next) => {
    res.sendStatus(200);
    req.body.events.forEach(function(event){
        // この処理の対象をイベントタイプがメッセージで、かつ、テキストタイプだった場合に限定。
        if (event.type == "message" && event.message.type == "text"){
            var text = event.message.text
            if(!text.includes(':')){
                var time = remindFumc.calcTime(text);
                if (time != -1){
                    console.log("set: timer");
                    setTimeout(function(){
                        bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: "時間です！"
                        });
                        console.log("time out: timer");
                    }, time);
                }else{
                    bot.replyMessage(event.replyToken, {
                        type: "text",
                        text: "入力形式が間違っています。"
                    });
                }
            }else{
                var time = remindFumc.getAlermTime(text);
                if(time != -1){
                    console.log("set: alerm");
                    setTimeout(function(){
                        bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: "時間です！"
                        });
                        console.log("time out: alerm");
                    }, time);
                }else{
                    bot.replyMessage(event.replyToken, {
                        type: "text",
                        text: "入力形式が間違っています。"
                    });
                }
            }
        }
    });
});
