var mongoose = require('mongoose');
require('./applicationSchema');
require('./playerSchema');
var ruleSchema = require('./ruleSchema');

var badgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    picture: String,
    points : {type : Number, required: true},
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }],
    numberOfOwner : {type: Number, default : 0},
    rules : [ruleSchema]
});

var modeleBadge = mongoose.model('badge', badgeSchema);