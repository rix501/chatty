//system and npm libs
var express = require('express');

// Configuration
var app = module.exports = express.createServer();
process.env.NODE_ENV = app.settings.env;

var io = require('socket.io').listen(app);

app.configure(function(){
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

function rstbot(msg){
    var command = msg.replace(/^rstbot /,'');
    var returnMsg = '';

    if(command === 'whois'){
        returnMsg = '<strong>rstbot whois:</strong> I\'m rstbot, welcome to chatty!';
    }
    else {
        returnMsg = 'cumbalacachanga';
    }

    return returnMsg;
}

app.listen(process.env.C9_PORT || process.env.PORT || 5000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {

    socket.on('user login', function (user, cb) {
        var u = user;
        var next = cb;

        socket.set('user', user, function(){
            socket.broadcast.emit('broadcast login', u);

            next(u);
        });
    });

    socket.on('message', function (data, cb) {

        if(/^rstbot .+/.test(data.msg)){
            data.msg = rstbot(data.msg);
        }

        socket.broadcast.emit('broadcast msg', data);

        cb(data.msg);
    });

    socket.on('disconnect', function () {
        socket.get('user', function (err, user) {

            if(!!user){
                socket.broadcast.emit('user disconnected', user);
            }
            
        });
    });
});