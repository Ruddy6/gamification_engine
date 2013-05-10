var mongoose = require('mongoose');
require('./typeEventSchema');
require('./applicationSchema');
require('./playerSchema');

var eventSchema = new mongoose.Schema({
    type: { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
    timestamp: { type : Date, default : Date.now },
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    player : { type: mongoose.Schema.Types.ObjectId, ref: 'player' }
});

var modeleEvent = mongoose.model('event', eventSchema);