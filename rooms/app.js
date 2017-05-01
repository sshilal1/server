var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var Room = function(host,clientId) {
    this.hostname = host.name;
    this.hostid = clientId;
    this.number = roomno;
    this.members = new Array();
    this.members.push(host);
};

var clients = 0;
var roomno = 1;
var rooms = new Array();
// Whenever someone connects this gets executed
// Using defualt namespace
io.on('connection', function(socket){
  console.log('A user: '+ socket.client.id +' connected');
  var clientId = socket.client.id;
  socket.emit('initClient', { clientId });
  io.sockets.emit('roomUpdate', { rooms });
  console.log(io.nsps['/'].adapter.rooms);
  clients++;
	
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user "'+ socket.client.id +'"" disconnected');
    for (i=0;i<rooms.length;i++) {
      if (rooms[i].hostid == socket.client.id) {
        rooms.splice(i,1);
      }
      else {
        for (j=0;j<rooms[i].members.length;j++) {
          console.log(rooms[i].members[j].id);
          if (rooms[i].members[j].id == socket.client.id) {
            rooms[i].members.splice(j,1);
          }
        }
      }
    }
    console.log(io.nsps['/'].adapter.rooms);
    io.sockets.emit('roomUpdate', { rooms });
  });

  socket.on('clientaddRoom', function(data) {

    console.log(data.name + ' created a room');
    var newRoom = new Room(data,socket.client.id);   
		socket.join("room-"+newRoom.number);
    
    console.log(io.nsps['/'].adapter.rooms);
		
		rooms.push(newRoom);
    io.sockets.emit('roomUpdate', { rooms });
		roomno++;
  });
	
	socket.on('clientjoinRoom', function(data) {
		console.log(data);
		console.log(data.player.id + ' wants to join room ' + data.roomid);
		rooms[data.roomid-1].members.push(data.player);
    for (member of rooms[data.roomid-1].members) {
      console.log(member.id);
    }
		socket.join("room-"+data.roomid);
    console.log(io.nsps['/'].adapter.rooms);

		io.sockets.emit('roomUpdate', { rooms });
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