$(function(){
    
    var socket = io.connect('http://localhost');

    socket.on('broadcast msg', function (msgObj) {
        $('#messages').prepend('<li class="msg" data-time="' + Date.now() + '">' + msgObj.user + ' said: ' + msgObj.msg + ' <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
    });


    function updateTime() {

        $('#messages li').each(function(){
            $(this).find('.msg-time').html(moment($(this).data('time')).fromNow());
        });

        setTimeout(updateTime, 10e3);
    }


    $('#chat form').submit(function(event){
        event.stopPropagation();
        
        var msg = $.trim($(this).children('input').val());
        var user = $.trim($('#user').val());

        if(!msg || !user){
            return false;
        }

        var msgObj = {
            user: user,
            msg: msg
        };

        socket.emit('message', msgObj, function(msg){
            $('#messages').prepend('<li class="msg" data-time="' + Date.now() + '">' + msgObj.user + ' said: ' + msg + ' <em><span class="msg-time">'+ moment().fromNow() +'</span></em> </li>');
        });

        return false;
    });

    setTimeout(updateTime, 10e3);

});