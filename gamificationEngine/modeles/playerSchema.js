var mongoose = require('mongoose');
require('./applicationSchema');

var playerSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    pseudo: String,
    email: String,
    level : Number,
    nbPoints : Number,
    applications : [{ type: mongoose.Schema.Types.ObjectId, ref: 'application' }]
});

var playerEvent = mongoose.model('player', playerSchema);