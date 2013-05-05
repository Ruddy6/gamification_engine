var mongoose = require('mongoose');
require('./applicationSchema');
var eventSchema = require('./eventSchema');
var badgeSchema = require('./badgeSchema');

var playerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    pseudo: String,
    email: String,
    level : Number,
    nbPoints : Number,
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    events : [eventSchema],
    badges : [badgeSchema]
});

var playerEvent = mongoose.model('player', playerSchema);