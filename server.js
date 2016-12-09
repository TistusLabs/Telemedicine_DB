
// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var socket = require('socket.io');

var fs = require('fs');
var cors = require('cors');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('/SSL/myserver.key', 'utf8');
var certificate = fs.readFileSync('/SSL/prepaid_topas_tv_ee.crt', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Express
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Socket.io

var httpServer = http.createServer(app);
var io = require('socket.io')(httpServer);
var httpsServer = https.createServer(credentials, app);
var ios = require('socket.io')(httpsServer);

io.on("connection", function (socket) {
	console.log("A user connected");
});

ios.on("connection", function (socket) {
	console.log("A user connected");
});

// MongoDB
mongoose.connect('mongodb://localhost/rest_test');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/api', require('./routes/api'));

// Start server
httpServer.listen(3000);
httpsServer.listen(3001);
console.log('API is running on port 3000');