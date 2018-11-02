var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
	socket.on('set nickname', function(name) {
		io.emit('join', 'joined', name);
		console.log('User joined: ' + name);
		io.emit('set nickname', name);
		socket.on('send message', function(msg) {
			console.log(name + ': ' + msg);
			io.emit('send message', name, msg);
		});
		socket.on('disconnect', function() {
			console.log('User left: ' + name);
			io.emit('join', 'left', name);
		});
	});
});

http.listen(3000, function() {
	console.log('Прослушивание порта 3000');
});