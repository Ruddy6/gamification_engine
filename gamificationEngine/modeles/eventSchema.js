var mongoose = require('mongoose');
require('./applicationSchema');
require('./playerSchema');

var eventSchema = new mongoose.Schema({
    type: Number,
    points: Number,
    timestamp: { type : Date, default : Date.now },
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    player : { type: mongoose.Schema.Types.ObjectId, ref: 'player' }
});

var modeleEvent = mongoose.model('event', eventSchema);