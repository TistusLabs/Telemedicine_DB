var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8077);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('join', function (data) {
    console.log(data);
  });
  
  socket.on('online', function (data) {
    console.log(data);
  });
});