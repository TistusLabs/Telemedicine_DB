
// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var messageSchema = new mongoose.Schema({
	message: String,
	fromusername: String,
	tousername: String,
    datetime: String,
});

// Return model
module.exports = restful.model('Messages', messageSchema);
