var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/leaderboardSchema');

var leaderboardModel = mongoose.model('leaderboard');

exports.addLeaderboard = function(req, res) {
    var application_id = req.params.app_id;
    var leaderboard = new leaderboardModel({
        description: 'Leaderboard de la première application',
        applicationName: 'Première application',
        ranking: [
            {
                playerName: "Toto",
                points: "5000"
            },
            {
                playerName: "Titi",
                points: "1000"
            }
        ],
        application: application_id
    });
    leaderboard.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.getLeaderboardApplication = function(req, res) {
    var application_id = req.params.app_id;
    leaderboardModel.find({application: application_id}, function(err, leaderboard) {
        if (err) {
            throw err;
        } else {
            res.send(leaderboard);
        }
    });
};