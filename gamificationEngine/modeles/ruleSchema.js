var mongoose = require('mongoose');
require('./applicationSchema');
require('./typeEventSchema');
require('./badgeSchema');

var ruleSchema = new mongoose.Schema({
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    typeEvent : { type: mongoose.Schema.Types.ObjectId, ref: 'typeEvent' },
    nbEvent : Number, // nombre d'event de ce type qui permettent d'avoir CE badge (un seul)
    badge : { type: mongoose.Schema.Types.ObjectId, ref: 'badge' }
});

var modeleEvent = mongoose.model('rule', ruleSchema);