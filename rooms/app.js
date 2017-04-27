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
  console.log('A user connected');
  var newUser = new Object;
  newUser.id = clients;
  newUser.description = 'You are client number ' + clients;
  socket.emit('initClient', { newUser });
  io.sockets.emit('roomList', { roomList });
  clients++;
	
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user disconnected');
    clients--;
  });

  socket.on('clientaddRoom', function(data) {
    console.log(data.name + ' created a room');
    var newRoom = new Room(data.name,roomno);
    roomList.rooms.push(newRoom);
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