
// Dependencies
var restful = require('node-restful');
var mongoose = restful.mongoose;

// Schema
var consultationSchema = new mongoose.Schema({
    doctor: String,
    patient: String,
    startdatetime: Date,
    enddatetime: Date
});

// Return model
module.exports = restful.model('Consultations', consultationSchema);
