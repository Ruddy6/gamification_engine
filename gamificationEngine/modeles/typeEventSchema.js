var mongoose = require('mongoose');
require('./applicationSchema');

var typeEventSchema = new mongoose.Schema({
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    name: String,
    points : Number
});

var modeleTypeEvent = mongoose.model('typeEvent', typeEventSchema);