
// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var userSchema = new mongoose.Schema( {
	name: String,
	username: String,
	password: String,
	status: String,
	type: String,
	gender:String,
	country: String,
	city: String,
	languages: [],
	profileimage: String,
	peer: {},
	otherdata: {
		speciality: String,
		currency: String,
		rate: String,
		shortbiography: String,
		awards: String,
		graduateschool: String,
		residenceplace: String
	}
});

// Return model
module.exports = restful.model('Users', userSchema);
