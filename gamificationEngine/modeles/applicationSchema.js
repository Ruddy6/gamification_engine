var mongoose = require('mongoose');

require('./badgeSchema');
require('./playerSchema');
require('./typeEventSchema');

var applicationSchema = new mongoose.Schema({
    name: String,
    description: String,
    userKey: String,
    adminKey: String,
    badges : [{ type: mongoose.Schema.Types.ObjectId, ref: 'badge' }],
    numberOfBadge : Number,
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }],
    numberOfPlayer : Number,
    typeEvents : [{
            type : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
            name : String
    }]
});

var modeleApplication = mongoose.model('application', applicationSchema);