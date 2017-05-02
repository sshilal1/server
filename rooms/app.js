var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendfile('index.html');
});

var Room = function(roomno,client) {
    this.hostname = client.name;
    this.hostid = client.id;
    this.number = roomno;
    this.members = new Array();
    this.members.push(client);
};
function randomString(length) {
	return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
}

var roomno = 1;
var rooms = new Array();

io.on('connection', function(socket){
	var clientId = socket.client.id;
	var clientName = randomString(5);
	console.log('A user: '+ socket.client.id +' connected, name=' + clientName);
	
	socket.emit('initClient', { clientId,clientName });
	io.sockets.emit('roomUpdate', { rooms });
	
  //Whenever someone disconnects this piece of code executed
	socket.on('disconnect', function () {
		console.log('A user "'+ socket.client.id +'"" disconnected');
		//io.sockets.emit('roomUpdate', { rooms });
	});

	socket.on('clientaddRoom', function(data) {
		// create the new room
		console.log(data.name + ' created room ' + roomno);
		var newRoom = new Room(roomno,data);
		
		// update local rooms array
		rooms.push(newRoom);
		
		// join the room
		socket.join("room-" + roomno);

		// send out new room status and iterate roomno
		io.sockets.emit('roomUpdate', { rooms });
		roomno++;
	});
	
	socket.on('clientjoinRoom', function(data) {
		// join the room array
		console.log(data.player.name + ' wants to join room ' + data.roomid);
		rooms[data.roomid-1].members.push(data.player);
		
		// join the actual room
		socket.join("room-"+data.roomid);
		
		// send out new room status
		console.log(io.nsps['/'].adapter.rooms);
		io.sockets.emit('roomUpdate', { rooms });
	});
	
	socket.on('clientleaveRoom', function(data) {
		// leave the room array
		console.log('client ' + data.player.name + ' is leaving room ' + data.roomid);
		for (i=0;i<rooms.length;i++) {
			for (j=0;j<rooms[i].members.length;j++) {
				console.log('index for '+ rooms[i].members[j].name + ' =' + j);
				if (rooms[i].members[j].name == data.player.name) {
					rooms[i].members.splice(j, 1);
				}
			}
			// if host, set new host, or delete room if nobody left
			if (rooms[i].hostname == data.player.name) {
				if (rooms[i].members.length < 1) {
					rooms.splice(i,1);
					roomno--;
				}
				else {
					rooms[i].hostname = rooms[i].members[0].name;
					rooms[i].hostid = rooms[i].members[0].id;
				}
			}
		}
		
		// leave the actual room
		socket.leave("room-"+data.roomid);
		
		// send out new room status
		console.log(io.nsps['/'].adapter.rooms);
		io.sockets.emit('roomUpdate', { rooms });
	});
	
	socket.on('checkRooms', function(data) {
		console.log(io.nsps['/'].adapter.rooms);
	});

  // ### ROOMS
  //Increase roomno 2 clients are present in a room.
  // If, default namespace.rooms[room1] AND default namespace.rooms[room1].length >1
  // If room 1 exists and length is greater than 1, lets add to roomnumber
  //if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) {
    //roomno++;
  //}
  //socket.join("room-"+roomno);
  //Send this event to everyone in the room.
  // 'everyone in room-#, shoot event 'connectToRoom'
  //io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});