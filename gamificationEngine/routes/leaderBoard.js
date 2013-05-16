var mongoose = require('mongoose');

require('./../modeles/playerSchema');

var playerModel = mongoose.model('player');

exports.getLeaderboard = function(req, res) {
    playerModel.aggregate({
        $project: {
            pseudo: 1,
            points: 1
        }},
        { $sort: {points: -1}}, function(err, leaderboard) {
        if (err) {
            throw err;
        } else {
            res.send(leaderboard);
        }
    });
};
