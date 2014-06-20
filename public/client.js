$(document).ready(function() {
    var server = io.connect('192.168.1.121:3000');  // replace with host and port
    var nickname = 'anonymous';
    $('form').submit(function(){
      server.emit('messages', $('#m').val());
      $('#m').val('');
      return false;
    });
    
    server.on('connect', function(data){
        nickname = prompt("Nick?").toLowerCase().trim();
        server.emit('join', nickname)
    });

    server.on('chat', function(msg){
      $('#messages').append($('<li>').html(msg));
      $('#mdiv')[0].scrollTop = $('#mdiv')[0].scrollHeight;
    });
    
    server.on('add chatter', function(name){
        $('#chatters').append($('<li>').html(" • "+name));
    });

    server.on('remove chatter', function(name){
        $("#chatters li").remove( ":contains('"+name+"')" );
    });
});
