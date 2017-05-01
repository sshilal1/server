var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var games = new Array();
var Game = function(host,path) {
    this.host = host;
    this.path = path;
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
	
});

function createNewGame(gameinfo) {
	var newNspPath = '/game' + gameinfo.id;
	games.push(new Game(gameinfo.id,newNspPath));
	io.sockets.emit('gamesList', { games });
	
	var nsp = io.of(newNspPath);
	nsp.on('connection', function(game){
		console.log('created a new game: ' + gameinfo.id);
		nsp.emit('hi', 'Hello, and welcome to game ' + gameinfo.id);
		io.sockets.emit('gamesList', { games });
	});
}

http.listen(3000, function(){
  console.log('listening on *:3000');
});