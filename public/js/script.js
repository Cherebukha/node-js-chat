var socket = io();
var nickname;
socket.on('update user list', function(userList) {
	$('#userList').empty();
	userList.sort();
	for (var i = 0; i < userList.length; i++) {
		$('#userList').append($('<li>').text(userList[i]));
	}
});
$('#nickname').submit(function() {
	if ($('#nickname input').val() == "") return false;
	socket.emit('set nickname', $('#nicknameInput').val(), $('#p').val());
	$('#overlay').fadeOut(300);
	$('#nickname input').val('');
	document.getElementById('messageInput').focus();
	return false;
});
$('#message').submit(function() {
	if ($('#messageInput').val() == "" || $('#messageInput').val() == null) return false;
	console.log($('messageInput').val());
	socket.emit('send message', $('#messageInput').val());
	$('#messageInput').val('');
	return false;
});
$('#messageInput').bind('keypress', function() {
	socket.emit('message typing', nickname);
});
socket.on('join', function(status, name) {
	$('#messages').append($('<li class="system">').text('User ' + status + ': ' + name));
	nickname = name;
});
socket.on('send message', function(name, msg) {
	$('#messages').append($('<li>').text(name + ': ' + msg));
	$('#chatTyping').hide();
	$('#chatContainer').animate({ scrollTop: $('#chatContainer').height() }, 'fast');
});
socket.on('message typing', function(nickname) {
	$('#chatTyping').text(nickname + ' is typing...').show().delay(3000).fadeOut();
});