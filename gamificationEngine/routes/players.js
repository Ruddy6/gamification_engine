var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/eventSchema');

var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var eventModel = mongoose.model('event');

exports.addPlayer = function(req, res) {
    var application_id = req.params.app_id;
    var player = new playerModel({
        firstName: 'Test',
        lastName: 'Test',
        pseudo: 'testtest',
        email: 'test@test.com',
        level: 2,
        nbPoints: 39393,
        applications: application_id
    });
    player.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.getAllPlayersApplication = function(req, res) {
    var application_id = req.params.app_id;
    playerModel.find({applications: application_id}, function(err, players) {
        if (err) {
            throw err;
        } else {
            res.send(players);
        }
    });
};

exports.getPlayerById = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.findById(player_id, function(err, player) {
        if (err) {
            throw err;
        } else {
            res.send(player);
        }
    });
};

exports.updatePlayer = function(req, res) {
    var id = req.params.player_id;

    playerModel.findByIdAndUpdate(id, {$set: {email: 'unMailAJour@mail.com'}}, function(err, event) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.deletePlayer = function(req, res) {
    var id = req.params.player_id;
    playerModel.remove({_id: id}, function(err) {
        if (err) {
            throw err;
        } else {
            badgeModel.find({players: id}, function(err, badges) {
                if (err) {
                    throw err;
                } else {
                    var badge;
                    for (var i = 0, l = badges.length; i < l; i++) {
                        badge = badges[i];
                        badge.players.remove(id)
                        badge.save(function(err) {
                        });
                    }
                }
            });
            eventModel.find({players: id}, function(err, events) {
                if (err) {
                    throw err;
                } else {
                    var event;
                    for (var i = 0, l = events.length; i < l; i++) {
                        event = events[i];
                        event.players.remove(id)
                        event.save(function(err) {
                        });
                    }
                }
            });
            res.send({
                "code": "200"
            });
        }
    });
};