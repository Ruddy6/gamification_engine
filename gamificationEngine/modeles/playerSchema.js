var mongoose = require('mongoose');
require('./applicationSchema');
require('./badgeSchema');

var playerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    pseudo: String,
    email: String,
    level : Number,
    nbPoints : Number,
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' }
});

var playerEvent = mongoose.model('player', playerSchema);