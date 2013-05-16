var mongoose = require('mongoose');

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
        firstname: 'deuxieme',
        lastname: 'exu',
        pseudo: 'deux',
        email: 'dexu.com',
        points: 200,
        application: application_id
    });
    player.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {players: player._id}, $inc: {numberOfPlayer: 1}},
            function(err, application) {
                if (err) {
                    throw err;
                } else {
                    res.send({
                        "code": "200"
                    });
                }
            });
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

exports.getPlayer = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(player_id)}}
        , {$project: {firstname: 1, lastname: 1, pseudo: 1, email: 1, points: 1, events: 1, numberOfBadge: 1}}
    ], function(err, player) {
        res.send(player);
    });
};

exports.addBadgeToPlayer = function(badge_id, player_id) {
    badgeModel.findOneAndUpdate({_id: badge_id}, {$addToSet: {players: player_id}, $inc: {numberOfOwner: 1}}, function(err, badge) {
        if (err) {
            throw err;
        } else {
            playerModel.findOneAndUpdate({_id: player_id}, {$addToSet: {badges: badge._id}, $inc: {points: badge.points, numberOfBadge: 1}},
            function(err, player) {
                if (err) {
                    throw err;
                }
            });
        }
    });
};

exports.getBadges = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.find({_id: player_id}, {badges: 1}, function(err, badges) {
        if (err) {
            throw err;
        } else {
            res.send(badges);
        }
    });
};

exports.getEvents = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.find({_id: player_id}, {events: 1}, function(err, events) {
        if (err) {
            throw err;
        } else {
            res.send(events);
        }
    });
};

exports.updatePlayer = function(req, res) {
    var id = req.params.player_id;

    playerModel.findByIdAndUpdate(id, {$set: {points: 150}}, function(err, event) {
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
    playerModel.findById(id, function(err, player) {
        if (err) {
            throw err;
        } else {
            applicationModel.findOneAndUpdate({_id: player.application}, {$inc: {numberOfPlayer: -1}}, function(err, application) {
                if (err) {
                    throw err;
                } else {
                    application.players.remove(id);
                    application.save(function(err) {
                    });
                    // mise à jour de l'application en supprimant le player de sa liste
                    playerModel.remove({_id: id}, function(err) {
                        if (err) {
                            throw err;
                        } else {
                            eventModel.remove({player: id}).exec(); // suppression de tous les events liés à ce player
                            badgeModel.update({players: new mongoose.Types.ObjectId(id)}, {$inc: {numberOfOwner: -1}, $pull: {players: id}}, {multi: true}, function(err, badges) {
                                if (err) {
                                    throw err;
                                } else {
                                    res.send({
                                        "code": "200"
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};
                    