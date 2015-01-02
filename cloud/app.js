// 在 Cloud code 里初始化 Express 框架
var express = require('express');
var wechat = require('wechat');
//var config = require('cloud/config.js');

var app = express();

var WxappUser = AV.Object.extend("WxappUser");
//var wxappUser = new WxappUser();


// App 全局配置
app.use(express.query());

APPID = AV.applicationId; // 你的应用 id
MASTER_KEY = AV.masterKey; //你的应用 master key

token = 'ADAQABAAABAQDktH6UrE77vsp';

var config = {
 token: 'ADAQABAAABAQDktH6UrE77vsp',
 appid: 'wx639ea8a58aa706ca',
 encodingAESKey: 'i4aDBFCuxULvr8Eixrc0hLhx7SkqllHnsiGfL6KCY40'
};

function randomString(length) {
  var chars = '0123456789abcdefghiklmnopqrstuvwxyz'.split('');

  if (! length) {
    length = Math.floor(Math.random() * chars.length);
  }
  var str = '';
  for (var i = 0; i < length; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
}

function initUser(userId, openId) {
  var user = new AV.User();
  var rtn;
  user.set("username", userId);
  user.set("password", randomString(6));
  user.set("email", userId + "@example.com");
  user.set("openId", openId);
  user.set("encodingAESKey",randomString(43)); 
  user.set("token",randomString(6));

  user.signUp(null, {
    success: function(user) {
      // Hooray! Let them use the app now.
      rtn = user.get("objectId");
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
      rtn = "-1";
    }
  }); 
  return rtn;
}

function getUserConfig( userId ) {
 return config;
}

//app.use('/base', wechat( token, function (req, res, next) {
//  res.writeHead(200);
//  res.end('hello node api');
//}));

app.get('/u*', wechat( config, function (req, res, next) {
  res.writeHead(200);
  res.end('hello node api');
}));

app.post('/u*', wechat( getUserConfig(req.path), wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName + req.path);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.Event == 'subscribe') {
   res.reply('subscribe' );
 }else if(message.Event == 'unsubscribe') {
   res.reply('unsubscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));

app.use('/base', wechat( config, wechat.text(function (message, req, res, next) {
  res.reply('hehe  ' + message.FromUserName + req.path);
  //res.writeHead(200);
  //res.end('hello node api');
}).event(function (message, req, res, next) {
 if (message.Event == 'subscribe') {
   var UserIdCounter = AV.Object.extend("UserIdCounter");
   var query = new AV.Query(UserIdCounter);
   query.get("54a63c14e4b021ec8f4ee469", {
     success: function(userIdCounter) {
       // The object was retrieved successfully.
       userIdCounter.increment("counter");
       userIdCounter.save();
       initUser(userIdCounter.get("counter"),message.FromUserName);
       res.reply('subscribe:' + userIdCounter.get("counter"));
     },
     error: function(userIdCounter, error) {
     // The object was not retrieved successfully.
     // error is a AV.Error with an error code and description.
       res.reply(error);
     }
   });
   
 }else if(message.Event == 'unsubscribe') {
   res.reply('unsubscribe' );
 }else{
   res.reply('menu ' + message.EventKey);
 }
})));


app.listen();
