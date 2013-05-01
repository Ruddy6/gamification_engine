var mongoose = require('mongoose');

var applicationSchema = new mongoose.Schema({
    name: String,
    description: String,
    apiKey: String,
    apiSecret: String
});

var modeleApplication = mongoose.model('application', applicationSchema);