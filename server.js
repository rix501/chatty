//system and npm libs
var express = require('express');
var request = require('request');
var HTMLParser  = require('htmlparser');
var Select = require( "soupselect" ).select;

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

function rstbot(msg, callback){
    var command = msg.replace(/^rstbot /,'');
    var returnMsg = '';
    var cmdMsg = '';
    var img = '';

    if(command === 'whois'){
        callback('<strong>rstbot whois:</strong> I\'m rstbot, welcome to chatty!');
    }
    else if(command === 'wat' || command === 'wut') {
        request('http://watme.herokuapp.com/random', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var cmdMsg = '<strong>rstbot '+ command +': </strong>';
                var img = '<img src="'+JSON.parse(body).wat+'" />';
                callback(cmdMsg + ' ' + img);
            }
        });
    }
    else if(command === 'gob'){
        var gobs = [
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/chicken-dance-2.gif",
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/Gob.gif",
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/pants.gif",
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/pennies1.gif",
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/queen_reveal.gif",
          "http://bite-prod.s3.amazonaws.com/wp-content/uploads/2012/05/scotch.gif",
          "http://farm1.static.flickr.com/223/511011836_56ae92ec1a_o.gif",
          "http://cdn.nextround.net/wp-content/uploads/2010/03/gob-bluth-gif-6.gif"
        ];
        
        cmdMsg = '<strong>rstbot '+ command +': </strong>';
        img = '<img src="'+gobs[ Math.floor(Math.random() * gobs.length) ]+'" />';
        callback(cmdMsg + ' ' + img);
    }
    else if(command === 'gif'){
        var gifDomain ='http://www.gifbin.com/random';

        request(gifDomain, function (error, response, body) {
            var html_handler = new HTMLParser.DefaultHandler( function(){},{ ignoreWhitespace: true });
            var html_parser = new HTMLParser.Parser(html_handler);

            html_parser.parseComplete(body);

            var url = Select( html_handler.dom, '.box a img' )[0].attribs.src;

            cmdMsg = '<strong>rstbot '+ command +': </strong>';
            img = '<img src="'+url+'" />';

            callback(cmdMsg + ' ' + img);
        });
    }
    else {
        callback('cumbalacachanga');
    }
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
            rstbot(data.msg, function(msg){
                data.msg = msg;

                socket.broadcast.emit('broadcast msg', data);

                cb(msg);
            });
        }
        else{
            socket.broadcast.emit('broadcast msg', data);

            cb(data.msg);
        }
    });

    socket.on('disconnect', function () {
        socket.get('user', function (err, user) {

            if(!!user){
                socket.broadcast.emit('user disconnected', user);
            }
            
        });
    });
});