var mongoose = require('mongoose');
require('./applicationSchema');
require('./playerSchema');

var eventSchema = new mongoose.Schema({
    applicationName: String,
    type: String,
    timestamp: { type : Date, default : Date.now },
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }]
});

var modeleEvent = mongoose.model('event', eventSchema);