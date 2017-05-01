var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = new Array();
var Game = function(host,path) {
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
			console.log("games[i].host:" + games[i].host);
			console.log("data.gameid:" + data.gameid);
			if (games[i].host == data.gameid) {
				games[i].members.push(data.myId);
			}
		}
		io.sockets.emit('gamesList', { games });
	});
	
});

function createNewGame(gameinfo) {
	
	console.log('created a new game: ' + gameinfo.id);
	
	var newNspPath = '/game' + gameinfo.id;
	games.push(new Game(gameinfo.id,newNspPath));
	io.sockets.emit('gamesList', { games });
	
	var nsp = io.of(newNspPath);
	nsp.on('connection', function(game){
		nsp.emit('hi', 'Hello, and welcome to game ' + gameinfo.id);
		io.sockets.emit('gamesList', { games });
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});