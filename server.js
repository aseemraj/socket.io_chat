var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var redis = require('redis');
var redisClient = redis.createClient(); // arguments host, port, options

var storeMessage = function(name, data){
    var message = JSON.stringify({name: name, data: data});
    redisClient.lpush("messages", message, function(err, response){
        redisClient.ltrim("messages", 0, 20);   // keep only newest 20 messages
    });
    // messages.push({name: name, data: data});
    // if(messages.length>20)messages.shift();
};

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

io.on('connection', function(client) {
    var address = client.handshake.address;
    client.on('join', function(name){
        client.broadcast.emit("add chatter", name);
        redisClient.smembers('chatters', function(err, names){
            names.forEach(function(name){
                client.emit('add chatter', name);
            });
        });
        redisClient.sadd('chatters', name);
        redisClient.lrange("messages", 0, -1, function(err, messages){
            messages = messages.reverse();
            messages.forEach(function(message){
                message = JSON.parse(message);
                client.emit("chat", '<b style="color:#0a0;">'+message.name+":</b> "+message.data);
            });
        });
        client.nickname = name;
        client.broadcast.emit('chat', '<i style="color:#00d;"><b>'+client.nickname + "</b> joined the chat</i>");
    });
    client.on('messages', function(msg) {
        console.log(client.nickname+" said: "+msg);
        io.emit('chat', '<b style="color:#0a0;">'+client.nickname + ":</b> "+msg);
        storeMessage(client.nickname, msg);
    });
    client.on('disconnect', function(name){
        client.broadcast.emit("chat", '<i style="color:#00d;"><b>'+client.nickname+"</b> is gone now</i>");
        client.broadcast.emit("remove chatter", client.nickname);
        redisClient.srem("chatters", client.nickname);
    });
});

server.listen(3000, function(){
  console.log('Server listening on port 3000');
});