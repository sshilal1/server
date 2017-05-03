var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendfile('index.html');
});

var clients = 0;
/* Namespaces
var nsp = io.of('/my-namespace');
nsp.on('connection', function(socket){
  console.log('A user connected to my-namespace');
  nsp.emit('hi','Hello everyone');

  // Need this from down below, bc now clients are connected to this namespace
  // For pitch, may have to have people connect to diff namespaces for diff
  // games. Would basically be var socket = io(namespace), with namespace
  // being the gameid or something
  socket.on('clientTestEvent', function(data) {
    console.log(data);
  })
});
*/

var roomno = 1;
// Whenever someone connects this gets executed
// Using defualt namespace
io.on('connection', function(socket){
  console.log('A user connected');
  clients++;
	
  //Whenever someone disconnects this piece of code executed
  socket.on('disconnect', function () {
    console.log('A user disconnected');
    clients--;
    socket.leave("room-"+roomno);
    //io.sockets.emit('broadcast', { description:clients + ' clients connected!' });
  });

  // CUSTOM FUNCTIONS HERE
  // #####################
  // read these as 'on a 'clientTestEvent' event, lets
  // do this function'
  socket.on('clientTestEvent', function(data) {
    console.log(data);
  })

  /*// Send a message after a timeout of 2seconds
  setTimeout(function(){
    socket.send('Sent a message 2seconds after connection!');
  }, 2000);
  
  // Send a custom 'event; called testerEvent after 2 seconds
  setTimeout(function(){
  socket.emit('testerEvent', { description: 'A custom event named testerEvent!'});
  }, 3000);
  */
  // ### BROADCASTING
  // Broadcasting to all clients
  //io.sockets.emit('broadcast', { description:clients + ' clients connected!' });

  // Broadcasting to everyone except the connector
  //socket.emit('newclientconnect',{ description: 'Hey, welcome!'});
  //socket.broadcast.emit('newclientconnect',{ description: clients + ' clients connected!'})

  // ### ROOMS
  //Increase roomno 2 clients are present in a room.
  // If, default namespace.rooms[room1] AND default namespace.rooms[room1].length >1
  // If room 1 exists and length is greater than 1, lets add to roomnumber
  if(io.nsps['/'].adapter.rooms["room-"+roomno])
    console.log('room' + roomno + ' length: ' + io.nsps['/'].adapter.rooms["room-"+roomno].length);

  if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) {
    roomno++;
  }
  socket.join("room-"+roomno);

  //Send this event to everyone in the room.
  // 'everyone in room-#, shoot event 'connectToRoom'
  io.sockets.in("room-"+roomno).emit('connectToRoom', "You are in room no. "+roomno);

  // ###################
  // ###################

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});