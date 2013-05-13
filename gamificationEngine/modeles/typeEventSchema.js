var mongoose = require('mongoose');
require('./applicationSchema');

var typeEventSchema = new mongoose.Schema({
    application : { type: mongoose.Schema.Types.ObjectId, ref: 'application' },
    nom: String,
    points : Number
});

var modeleEvent = mongoose.model('typeEvent', typeEventSchema);