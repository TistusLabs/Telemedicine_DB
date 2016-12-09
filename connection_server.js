
// Dependencies
var express = require('express');
var redis = require('redis');
var cors = require('cors');
var bodyParser = require('body-parser');
var jsonify = require('redis-jsonify');
var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('C:/Telemedicine/myserver.key', 'utf8');
var certificate = fs.readFileSync('C:/Telemedicine/prepaid_topas_tv_ee.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Redic Client
//var client = redis.createClient(); //creates a new client
var client = jsonify(redis.createClient())

client.on('connect', function() {
    console.log('Redis client connected...');
});

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
/*var httpserver = require('http').Server(app);
var io = require('socket.io')(httpserver);

var httpsserver = require('http').Server(credentials, app);
var ios = require('socket.io')(httpsserver);*/

var httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
var httpsServer = https.createServer(credentials, app);
var ios = require('socket.io')(httpsServer);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});


// Routes
app.post('/connection/get',function(req,res) {
    var key = req.body.key;
    client.get(key, function(err, reply) {
        console.log("reply:",reply);
        console.log("error:",err);
        res.send({"status":true,"message":"Successfully retrived connection","value":reply});
    });
    
});

app.post('/connection/set', function(req, res) {
    var key = req.body.key;
    var value = req.body.value;
    client.set(key, value, function(err, reply) {
        console.log("reply:",reply);
        console.log("Key: ",key," - Value: ", value); 
        console.log("error:",err);
        client.expire(key, 86400); // expries each key after 24 hours
        res.send({"status":true,"message":"Successfully saved connection","value":reply});
    });
    
});

app.post('/connection/del',function(req,res) {
    var key = req.body.key;
    client.del(key, function(err, reply) {
        console.log("reply:",reply);
        console.log("error:",err);
        res.send({"status":true,"message":"Successfully deleted connection","value":reply});
    });
    
});

io.on('connection', function (socket) {
  console.log("A browser connected - http");
  socket.on('disconnect', function(){
    console.log('browser disconnected');
    console.log('');
  });

  socket.emit('news', { hello: 'world' });
  socket.on('join', function (data) {
    console.log(data);
  });
  
  socket.on('useronline', function (username) {
    console.log("User logged in : "+username);
    //io.emit('useronline', username);
    socket.broadcast.emit('useronline', username);
  });
});

// workfing area /////////////////////////////////////////////////////////////////////////////

ios.on('connection', function (socket) {
  console.log("- Browser connected - https");
  socket.on('disconnect', function(){
    console.log('- Browser disconnected');
  });

  
  socket.on('useronline', function (username) {
    console.log("User logged in : "+username);
    ios.emit('useronline', username);
    //socket.broadcast.emit('useronline', username);
  });

  socket.on('statuschange', function (obj) {
    console.log("User changins status : "+obj.user+" -> "+obj.status);
    ios.emit('statuschange', obj);
    //socket.broadcast.emit('useronline', username);
  });

  socket.on('call', function (broadcast) {
    console.log("Sending call from "+broadcast.from.username+" to "+broadcast.to.username);
    ios.emit('call', broadcast);
  });

  socket.on('callrejected', function (broadcast) {
    console.log("Rejected call from "+broadcast.username);
    ios.emit('callrejected', broadcast);
  });

  socket.on('answercall', function (broadcast) {
    console.log("Ansering call from "+broadcast.username);
    ios.emit('answercall', broadcast);
  });

  socket.on('callended', function (broadcast) {
    console.log("Ended call from "+broadcast);
    ios.emit('callended', broadcast);
  });

  socket.on('connected', function (username) {
    console.log("User connected to session in : "+username);
    //socket.emit('userconnected', username);
    socket.broadcast.emit('userconnected', username);
  });
});

// Start server
httpServer.listen(4000);
httpsServer.listen(4001);
console.log('Redic Client is running on port 4000');
