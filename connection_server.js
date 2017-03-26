
// Dependencies
var express = require('express');
var redis = require('redis');
var cors = require('cors');
var bodyParser = require('body-parser');
var jsonify = require('redis-jsonify');
var fs = require('fs');
var http = require('http');
var https = require('https');
var ss = require('socket.io-stream');
var path = require('path');
var privateKey;
var certificate;


path.join('file_uploads');


if (process.platform == "win32") {

} else {
  privateKey = fs.readFileSync('/etc/httpd/ssl/apache.key', 'utf8');
  certificate = fs.readFileSync('/etc/httpd/ssl/apache.crt', 'utf8');
}

var credentials = { key: privateKey, cert: certificate };

// Redic Client
//var client = redis.createClient(); //creates a new client
var client = jsonify(redis.createClient())

client.on('connect', function () {
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
app.post('/connection/get', function (req, res) {
  var key = req.body.key;
  client.get(key, function (err, reply) {
    console.log("reply:", reply);
    console.log("error:", err);
    res.send({ "status": true, "message": "Successfully retrived connection", "value": reply });
  });

});

app.post('/connection/set', function (req, res) {
  var key = req.body.key;
  var value = req.body.value;
  client.set(key, value, function (err, reply) {
    console.log("reply:", reply);
    console.log("Key: ", key, " - Value: ", value);
    console.log("error:", err);
    client.expire(key, 86400); // expries each key after 24 hours
    res.send({ "status": true, "message": "Successfully saved connection", "value": reply });
  });

});

app.post('/connection/del', function (req, res) {
  var key = req.body.key;
  client.del(key, function (err, reply) {
    console.log("reply:", reply);
    console.log("error:", err);
    res.send({ "status": true, "message": "Successfully deleted connection", "value": reply });
  });

});

// routes related to online users

app.post('/status/set', function (req, res) {
  // getting items from the request
  var username = req.body.username;
  var status = req.body.status;
  var json = { "username": username, "status": status };

  // get all items
  client.lrange('userstatuses', 0, -1, function (err, statuses) {

    var usernameAlreadyAvailable = false;
    var usernameIndex = 0;
    var newList = [];
    statuses.forEach(function (status, index) {
      var convertedObj = JSON.parse(status);
      if (convertedObj.username == username) {
        usernameAlreadyAvailable = true;
        usernameIndex = index;
      }
      statuses[index] = convertedObj;
    });

    if (usernameAlreadyAvailable) {
      statuses.splice(usernameIndex, 1);
    }

    client.del('userstatuses', function (err, reply) {
      console.log("crearing the statuses.");
    });
    statuses.push(json);
    statuses.forEach(function (status, index) {
      newList.push(status);
    });

    client.rpush("userstatuses", newList, function (err, reply) {
      if (err) { throw err; } else {
        console.log("");
        console.log("Setting user status:");
        console.log("Username: ", username, " - Status: ", status);
        console.log("error:", err);
        res.send({ "status": true, "message": "User status updated Successfully!", "value": reply });

        //socket.broadcast.emit('statuschanged', statuses);
      }
    });


    /*var multi = client.multi();
    multi.rpush("userstatuses", statuses);

    multi.exec(function (err, reply) {

  });*/
  });

});

app.get('/status/getall', function (req, res) {
  client.lrange('userstatuses', 0, -1, function (err, statuses) {
    console.log(statuses);
    res.send({ "status": true, "message": "All User status are retrived Successfully!", "value": statuses });
  });
});

app.delete('/status/reset', function (req, res) {
  console.log("");
  console.log("Resetting user status:");
  client.del('userstatuses', function (err, reply) {
    console.log("reply:", reply);
    console.log("error:", err);
    res.send({ "status": true, "message": "Reset Successfull", "value": reply });
  });

});

io.on('connection', function (socket) {
  console.log("A browser connected - http");
  socket.on('disconnect', function () {
    console.log('browser disconnected');
    console.log('');
  });

  socket.emit('news', { hello: 'world' });
  socket.on('join', function (data) {
    console.log(data);
  });

  socket.on('useronline', function (username) {
    console.log("User logged in : " + username);
    //io.emit('useronline', username);
    socket.broadcast.emit('useronline', username);
  });
});

// workfing area /////////////////////////////////////////////////////////////////////////////

ios.on('connection', function (socket) {
  console.log("- Browser connected - https");
  socket.on('disconnect', function () {
    console.log('- Browser disconnected');
  });

  // socket.io-stream starting location  //

  ss(socket).on('file', function (stream, data) {
    console.log("New file upload request - ss");
    var filename = path.basename(data.name);
    var fileAndPath = "file_uploads/" + filename;
    console.log("File name: "+filename);
    console.log("Location: "+fileAndPath);
    stream.pipe(fs.createWriteStream(fileAndPath));
  });


  ///////////////////////////////////////////////

  socket.on('useronline', function (username) {
    console.log("User logged in : " + username);
    ios.emit('useronline', username);
    //socket.broadcast.emit('useronline', username);
  });

  socket.on('statuschange', function (obj) {
    console.log("User changins status : " + obj.user + " -> " + obj.status);
    ios.emit('statuschange', obj);
    //socket.broadcast.emit('useronline', username);
  });

  socket.on('call', function (broadcast) {
    console.log("Sending call from " + broadcast.from.username + " to " + broadcast.to.username);
    ios.emit('call', broadcast);
  });

  socket.on('offlineMessage', function (broadcast) {
    console.log("Sending offline message from " + broadcast.from + " to " + broadcast.to);
    ios.emit('offlineMessage', broadcast);
  });

  socket.on('callrejected', function (broadcast) {
    console.log("Rejected call from " + broadcast.username);
    ios.emit('callrejected', broadcast);
  });

  socket.on('answercall', function (broadcast) {
    console.log("Ansering call from " + broadcast.username);
    ios.emit('answercall', broadcast);
  });

  socket.on('callended', function (broadcast) {
    console.log("Ended call from " + broadcast);
    ios.emit('callended', broadcast);
  });

  socket.on('unmutevoice', function (broadcast) {
    console.log("Unmute voice : " + broadcast);
    ios.emit('unmutevoice', broadcast);
  });

  socket.on('mutevoice', function (broadcast) {
    console.log("Mute voice : " + broadcast);
    ios.emit('mutevoice', broadcast);
  });

  socket.on('unmutevideo', function (broadcast) {
    console.log("Unmute video : " + broadcast);
    ios.emit('unmutevideo', broadcast);
  });

  socket.on('mutevideo', function (broadcast) {
    console.log("Mute voice : " + broadcast);
    ios.emit('mutevideo', broadcast);
  });

  socket.on('connected', function (username) {
    console.log("User connected to session in : " + username);
    //socket.emit('userconnected', username);
    socket.broadcast.emit('userconnected', username);
  });
});

// Start server
httpServer.listen(4000);
httpsServer.listen(4001);
console.log('Redic Client is running on port 4000');
