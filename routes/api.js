
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Product = require('../models/product');
var User = require('../models/user');
var Message = require('../models/message');

// Routes
Product.methods(['get', 'put', 'post', 'delete']);
Product.register(router, '/products');

User.methods(['get', 'put', 'post', 'delete']);
User.register(router, '/users');

Message.methods(['get', 'put', 'post', 'delete']);
Message.register(router, '/messages');

// Return router
module.exports = router;
