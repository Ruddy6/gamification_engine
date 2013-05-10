var mongoose = require('mongoose');
require('./applicationSchema');
require('./typeEventSchema');
require('./badgeSchema');

var playerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    pseudo: String,
    email: String,
    points : Number,
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    events : [{
            type : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
            quantity : Number
    }],
    badges : [{ type: mongoose.Schema.Types.ObjectId, ref: 'badge' }]
});

var playerEvent = mongoose.model('player', playerSchema);