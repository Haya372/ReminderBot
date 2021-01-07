// .envの読み込み
require('dotenv').config();
const redis = require("redis");

const client = redis.createClient();

client.on('connect', function(){
    console.log("connent to redis");
});

const server = require("express")();
const line = require("@line/bot-sdk");
const { concatLimit } = require('async');

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
            var text = event.message.text;
            var userID = event.source.userId;
            if(text === "タイマー" || text === "アラーム"){
                client.get(userID, function(err, val){
                    if(!val){
                        client.set(userID, text);
                        if(text === "タイマー"){
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: "「○時間○分○秒」の形式でタイマーをセットしてください。"
                            });
                        }else{
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: "「○：○」の形式でアラームをセットしてください。"
                            });
                        }
                        //５分以内にセットされなければ設定を破棄
                        setTimeout(function(){
                            client.del(userID);
                            console.log("time out");
                        }, 5 * 60 * 1000);
                    }else{
                        bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: "すでに" + val + "がセットされています。\nセットしなおすには[リセット」で今の設定を削除してください。"
                        });
                    }
                });
            }else if(text === "リセット"){
                client.del(userID);
                bot.replyMessage(event.replyToken, {
                    type: "text",
                    text: "タイマーorアラーム"
                });
            }else{
                client.get(userID, function(err, val){
                    if(val === "タイマー"){
                        var time = remindFumc.calcTime(text);
                        if (time != -1){
                            console.log("set: timer");
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: text + "後にタイマーをセットしました。"
                            });
                            setTimeout(function(){
                                bot.pushMessage(userID, {
                                    type: "text",
                                    text: "時間です！"
                                });
                                console.log("time out: timer");
                            }, time);
                            client.del(userID);
                        }else{
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: "入力形式が間違っています。\nタイマーは「○時間○分○秒」の形式でセットしてください。"
                            });
                        }
                    }else if(val === "アラーム"){
                        var time = remindFumc.getAlermTime(text);
                        if(time != -1){
                            console.log("set: alerm");
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: text + "にアラームをセットしました。"
                            });
                            setTimeout(function(){
                                bot.pushMessage(userID, {
                                    type: "text",
                                    text: "時間です！"
                                });
                                console.log("time out: alerm");
                            }, time);
                            client.del(userID);
                        }else{
                            bot.replyMessage(event.replyToken, {
                                type: "text",
                                text: "入力形式が間違っています。\nアラームは「○：○」の形式でセットしてください。"
                            });
                        }
                    }else{
                        bot.replyMessage(event.replyToken, {
                            type: "text",
                            text: "入力形式が間違っています。\nタイマーをセットするかアラームをセットするかを選んでください。"
                        });
                    }
                });
            }
        }
    });
});
