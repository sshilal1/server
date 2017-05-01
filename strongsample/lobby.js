var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var gameIterateId = 0;
var games = new Array();
var Game = function(host,path) {
		this.id = gameIterateId;
    this.host = host;
    this.path = path;
		this.members = new Array();
		this.members.push(host);
};

app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.on('connection', function(socket){
  console.log('A user: '+ socket.client.id +' connected');
	
	io.sockets.emit('gamesList', { games });
	
	socket.on('clientCreateGame', function(data) {
		createNewGame(data);
	});
	
	socket.on('clientJoinGame', function(data) {
		for (i=0;i<games.length;i++) {
			if (games[i].id == data.gameid) {
				games[i].members.push(data.myId);
			}
		}
		console.log('client ' + data.myId + ' is trying to join game ' + data.gameid);
		io.sockets.emit('gamesList', { games });
	});
	
	socket.on('clientLeaveGame', function(data) {
		console.log('client ' + data.myId + ' is leaving game ' + data.gameid);
		for (i=0;i<games.length;i++) {	
			var index = games[i].members.indexOf(data.myId);
			if (index > -1) {
				games[i].members.splice(index, 1);
			}
		}
		setTimeout(function(){io.sockets.emit('gamesList', { games });},5);
	});
	
});

function createNewGame(gameinfo) {
	
	gameIterateId ++;
	console.log('created a new game: ' + gameIterateId);
	
	var newNspPath = '/game' + gameIterateId;
	games.push(new Game(gameinfo.id,newNspPath));
	io.sockets.emit('gamesList', { games });
	
	var nsp = io.of(newNspPath);
	nsp.on('connection', function(socket){
		nsp.emit('hi', 'Hello, and welcome to game ' + gameIterateId);
		io.sockets.emit('gamesList', { games });		
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});