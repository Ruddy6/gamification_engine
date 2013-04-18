var mongoose = require('mongoose');
//require('./badgeSchema');

var applicationSchema = new mongoose.Schema({
    name: String,
    description: String,
    apiKey: String,
    apiSecret: String
    //badges : [{ type: mongoose.Schema.Types.ObjectId, ref: 'badge' }]
});

var modeleApplication = mongoose.model('application', applicationSchema);