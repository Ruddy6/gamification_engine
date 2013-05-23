var mongoose = require('mongoose');

require('./applicationSchema');
require('./typeEventSchema');
require('./badgeSchema');

var ruleSchema = new mongoose.Schema({
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    typeEvent : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
    nbEvent : Number,
    badge : { type: mongoose.Schema.Types.ObjectId, ref: 'badge' }
});

var modeleRule = mongoose.model('rule', ruleSchema);