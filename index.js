var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var userList = [];

express.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
express.get('/style/style.css', function(req, res) {
	res.sendFile(__dirname + '/public/style/style.css');
});

io.on('connection', function(socket) {
	io.emit('update user list', userList);
	socket.on('set nickname', function(name) {
		io.emit('join', 'joined', name);
		userList[userList.length] = name;
		console.log('User joined: ' + name);
		io.emit('set nickname', name);
		io.emit('update user list', userList);
		socket.on('send message', function(msg) {
			console.log(name + ': ' + msg);
			io.emit('send message', name, msg);
		});
		socket.on('disconnect', function() {
			var index = userList.indexOf(name);
			if (index >= 0) userList.splice(index, 1);
			console.log('User left: ' + name);
			io.emit('join', 'left', name);
			io.emit('update user list', userList);
		});
	});
});

http.listen(3000, function() {
	console.log('Прослушивание порта 3000');
});