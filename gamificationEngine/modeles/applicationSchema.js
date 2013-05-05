var mongoose = require('mongoose');

var eventSchema = require('./eventSchema');
var badgeSchema = require('./badgeSchema');
var playerSchema = require('./playerSchema');

var applicationSchema = new mongoose.Schema({
    name: String,
    description: String,
    apiKey: String,
    apiSecret: String,
    events : [eventSchema],
    badges : [badgeSchema],
    players : [playerSchema]
});

var modeleApplication = mongoose.model('application', applicationSchema);