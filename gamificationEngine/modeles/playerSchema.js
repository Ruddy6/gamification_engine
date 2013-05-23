var mongoose = require('mongoose');
require('./applicationSchema');
require('./typeEventSchema');
require('./badgeSchema');

var playerSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    pseudo: String,
    email: String,
    points : { type: Number, default: 10 },
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application', required: true },
    events : [{
            type : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
            name : String,
            quantity : {type : Number, required: true}
    }],
    badges : [{ type: mongoose.Schema.Types.ObjectId, ref: 'badge'}],
    numberOfBadge : { type: Number, default: 0 }
});

var playerEvent = mongoose.model('player', playerSchema);