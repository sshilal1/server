var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var Room = function(host,num) {
    this.host = host;
    this.num = num;
    this.members = [host];
};

var clients = 0;
var roomno = 0;
var roomList = new Object;
roomList.rooms = new Array();
// Whenever someone connects this gets executed
// Using defualt namespace
io.on('connection', function(socket){
  console.log('A user: '+ socket.client.id +' connected');
  var clientId = socket.client.id;
  socket.emit('initClient', { clientId });
  io.sockets.emit('roomList', { roomList });
  clients++;
	
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user disconnected');
		console.log(socket.client.id);
    clients--;
  });

  socket.on('clientaddRoom', function(data) {
    console.log(data.name + ' created a room');
    var newRoom = new Room(data,roomno);   
		// make the host join room
		socket.join("room-"+roomno);
		// add new room to roomList object
		roomList.rooms.push(newRoom);
		// push the new room list to all clients
    io.sockets.emit('roomList', { roomList });
		roomno++;
  });
	
	socket.on('clientjoinRoom', function(data) {
		console.log(data);
		console.log(data.player.name + ' wants to join room ' + data.roomno);
		roomList.rooms[data.roomno].members.push(data.player);
		socket.join("room-"+roomno);
		io.sockets.emit('roomList', { roomList });
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