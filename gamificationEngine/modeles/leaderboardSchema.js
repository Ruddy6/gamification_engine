var mongoose = require('mongoose');
require('./applicationSchema');

var leaderboardSchema = new mongoose.Schema({
    description: String,
    applicationName: String,
    type: String,
    ranking: [
        {playerName: String,
            points: Number
        }],
    application: {type: mongoose.Schema.Types.ObjectId, ref: 'application'}
});

var modeleLeaderboard = mongoose.model('leaderboard', leaderboardSchema);