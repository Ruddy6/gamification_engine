var mongoose = require('mongoose');

require('./badgeSchema');
require('./playerSchema');
require('./typeEventSchema');

var applicationSchema = new mongoose.Schema({
    name: String,
    description: String,
    userKey: {type : String, required: true},
    adminKey: {type : String, required: true},
    badges : [{ type: mongoose.Schema.Types.ObjectId, ref: 'badge' }],
    numberOfBadge : {type: Number, default : 0},
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }],
    numberOfPlayer : {type: Number, default : 0},
    typeEvents : [{
            type : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent', require: true },
            name : String
    }]
});

var modeleApplication = mongoose.model('application', applicationSchema);