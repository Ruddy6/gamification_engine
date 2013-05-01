var mongoose = require('mongoose');
require('./applicationSchema');
require('./playerSchema');

var badgeSchema = new mongoose.Schema({
    name: String,
    description: String,
    picture: String,
    level: Number,
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    players : [{ type: mongoose.Schema.Types.ObjectId, ref: 'player' }]
});

var modeleBadge = mongoose.model('badge', badgeSchema);