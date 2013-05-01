var mongoose = require('mongoose');
require('./applicationSchema');
require('./eventSchema');
require('./badgeSchema');

var ruleSchema = new mongoose.Schema({
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    event : { type: mongoose.Schema.Types.ObjectId, ref: 'event' },
    badge : { type: mongoose.Schema.Types.ObjectId, ref: 'badge' }
});

var modeleEvent = mongoose.model('rule', ruleSchema);