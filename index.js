var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);
var fs = require('fs');
var userList = [];

express.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});
express.get('/style/style.css', function(req, res) {
	res.sendFile(__dirname + '/public/style/style.css');
});
express.get('/js/script.js', function(req, res) {
	res.sendFile(__dirname + '/public/js/script.js');
});

io.on('connection', function(socket) {
	io.emit('update user list', userList);
	socket.on('set nickname', function(name) {
		if (searchArr(userList, name) > 0) {
			console.log('Пользователь с ником ' + name + ' уже подключен');
			io.emit('nickname denied', 'That nickname is already taken');
			return false;
		}
		socket.emit('nickname accepted');
		socket.nickname = name;
		appendToFile('history/chat.txt', getCurrentTime() + ' User joined: ' + name + '\n');
		io.emit('join', 'joined', name);
		userList[userList.length] = name;
		console.log('User joined: ' + name);
		io.emit('set nickname', name);
		io.emit('update user list', userList);
		socket.on('message typing', function(nickname) {
			socket.broadcast.emit('message typing', socket.nickname);
		});
		socket.on('send message', function(msg) {
			console.log(name + ': ' + msg);
			appendToFile('history/chat.txt', getCurrentTime() + ' ' + name + ': ' + msg + '\n');
			io.emit('send message', name, msg);
		});
		socket.on('disconnect', function() {
			var index = userList.indexOf(name);
			if (index >= 0) userList.splice(index, 1);
			console.log('User left: ' + name);
			appendToFile('history/chat.txt', getCurrentTime() + ' User left: ' + name + '\n');
			io.emit('join', 'left', name);
			io.emit('update user list', userList);
		});
	});
});

http.listen(3000, function() {
	if (!fs.existsSync('./history')) fs.mkdirSync('./history');
	appendToFile('history/chat.txt', getCurrentTime() + ' It\'s working...\n');
	console.log('Прослушивание порта 3000');
});

function appendToFile(file, text) {
	fs.appendFile(file, text, function(error) { if(error) throw error; });
}

function getCurrentTime() {
	var date = new Date(), hour = date.getHours(), minute = date.getMinutes(), second = date.getSeconds(), day = date.getDay(), month = date.getMonth(), year = date.getFullYear();
	if (hour < 10) hour = '0' + hour;
	if (minute < 10) minute = '0' + minute;
	if (second < 10) second = '0' + second;
	if (day < 10) day = '0' + day;
	if (month < 10) month = '0' + month;
	return '(' + hour + ':' + minute + ':' + second + ' ' + day + '.' + month + '.' + year + ')';
}

function searchArr(arr, word) {
	return arr.filter(function(el) {
		return el.toLowerCase().indexOf(word.toLowerCase()) > -1;
	}).length;
}