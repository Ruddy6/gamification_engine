var mongoose = require('mongoose');
require('./applicationSchema');
var playerSchema = require('./playerSchema');
var ruleSchema = require('./ruleSchema');

var eventSchema = new mongoose.Schema({
    type: Number,
    points: Number,
    timestamp: { type : Date, default : Date.now },
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    player : playerSchema,
    rule : ruleSchema
});

var modeleEvent = mongoose.model('event', eventSchema);