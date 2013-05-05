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
        firstname: 'deuxieme',
        lastname: 'exu',
        pseudo: 'deux',
        email: 'dexu.com',
        level: 2,
        nbPoints: 222,
        application: application_id
    });
    player.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {players: player}},
            function(err, player) {
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

exports.addBadge = function(req, res) {
    var badge_id = req.params.badge_id;
    var player_id = req.params.player_id;
    badgeModel.findByIdAndUpdate(badge_id, {$addToSet: {players: player_id}}, function(err, badge) {
        if (err) {
            throw err;
        } else {
            playerModel.findByIdAndUpdate(player_id, {$addToSet: {badges: badge}},
            function(err, player) {
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
    playerModel.findById(id, function(err, player) {
        if (err) {
            throw err;
        } else {
            applicationModel.findById(player.application, function(err, application) {
                if (err) {
                    throw err;
                } else {
                    // mise à jour de l'application en supprimant le badge de sa liste
                    application.collection.update(
                            {'players._id': new mongoose.Types.ObjectId(id)},
                    {$pull: {'players': {_id: new mongoose.Types.ObjectId(id)}}}, function(err) {
                        if (err) {
                            throw err;
                        } else {
                            playerModel.remove({_id: id}, function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                    eventModel.remove({player: id}).exec(); // suppression de tous les events liés à ce player
                                    badgeModel.find({players: id}, function(err, badges) {
                                        if (err) {
                                            throw err;
                                        } else {
                                            var badge;
                                            for (var i = 0, l = badges.length; i < l; i++) {
                                                badge = badges[i];
                                                badge.players.remove(id);
                                                badge.save(function(err) {
                                                });
                                            }
                                        }
                                    });
                                    res.send({
                                        "code": "200"
                                    });
                                }
                            });
                        }
                        ;
                    });
                }
            });
        }
    });
};

                    