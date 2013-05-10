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
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }],
    typeEvents : [{ type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' }]
});

var modeleApplication = mongoose.model('application', applicationSchema);