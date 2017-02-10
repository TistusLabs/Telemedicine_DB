
// Dependencies
var express = require('express');
var router = express.Router();

// Models
var Product = require('../models/product');
var User = require('../models/user');
var Message = require('../models/message');
var Consultation = require('../models/consultation');

// Routes
Product.methods(['get', 'put', 'post', 'delete']);
Product.register(router, '/products');

User.methods(['get', 'put', 'post', 'delete']);
User.register(router, '/users');

Message.methods(['get', 'put', 'post', 'delete']);
Message.register(router, '/messages');

Consultation.methods(['get', 'put', 'post', 'delete']);
Consultation.register(router, '/consultation');

// Return router
module.exports = router;
