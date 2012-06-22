$(function(){
    var socket = io.connect(location.origin);

    socket.on('broadcast msg', function (msgObj) {
        $('#messages').prepend('<li class="msg well" data-time="' + Date.now() + '">' + msgObj.user + ' said: ' + msgObj.msg + ' <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
    });

    socket.on('broadcast login', function (msg) {
        $('#messages').prepend('<li class="msg well" data-time="' + Date.now() + '">' + msg + ' logged in <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
    });

    socket.on('user disconnected', function (msg) {
        $('#messages').prepend('<li class="msg well" data-time="' + Date.now() + '">' + msg + ' disconnected <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
    });

    function updateTime() {
        $('#messages li').each(function(){
            $(this).find('.msg-time').html(moment($(this).data('time')).fromNow());
        });

        setTimeout(updateTime, 10e3);
    }

    $('#login').submit(function(event){
        //event.stopPropagation();
        
        var user = $.trim($('#user').val());

        if(!user){
            return false;
        }

        socket.emit('user login', user, function(msg){
            $('#messages').prepend('<li class="msg well" data-time="' + Date.now() + '">' + msg + ' logged in <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
            $('.nav.username').append('<li><a href="#">' + msg + '</a></li>');
            $('#login').hide();
        });

        return false;
    });

    $('#chat form').submit(function(event){
        //event.stopPropagation();
        
        var msg = $.trim($(this).children('input').val());
        var user = $.trim($('#user').val());

        if(!user){
            alert('Please login');

            return false;
        }

        if(!msg){
            return false;
        }

        $(this).children('input').val('');

        var msgObj = {
            user: user,
            msg: msg
        };

        socket.emit('message', msgObj, function(msg){
            $('#messages').prepend('<li class="msg well" data-time="' + Date.now() + '">' + msgObj.user + ' said: ' + msg + ' <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
        });

        return false;
    });

    setTimeout(updateTime, 10e3);
});