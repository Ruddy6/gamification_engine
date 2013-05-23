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
        //points: 200,
        application: application_id
    });
    player.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {players: player._id}, $inc: {numberOfPlayer: 1}},
            function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({
                        "code": "400"
                    });
                } else {
                    res.send({
                        "code": "200"
                    });
                }
            });
        }
    });
};

exports.getPlayer = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(player_id)}}
        , {$project: {firstname: 1, lastname: 1, pseudo: 1, email: 1, points: 1, events: 1, numberOfBadge: 1}}
    ], function(err, player) {
        if (err) {
            console.log(err);
            res.send({
                "code": "400"
            });
        } else {
            res.send(player);
        }
    });
};

exports.addBadgeToPlayer = function(badge_id, player_id) {
    badgeModel.findOneAndUpdate({_id: badge_id}, {$addToSet: {players: player_id}, $inc: {numberOfOwner: 1}}, function(err, badge) {
        if (err) {
            console.log(err);
            res.send({
                "code": "400"
            });
        } else {
            playerModel.findOneAndUpdate({_id: player_id}, {$addToSet: {badges: badge._id}, $inc: {points: badge.points, numberOfBadge: 1}},
            function(err, player) {
                if (err) {
                    console.log(err);
                    res.send({
                        "code": "400"
                    });
                }
            });
        }
    });
};

exports.getBadges = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.findById(player_id, function(err, player) {
        if (err) {
            console.log(err);
            res.send({
                "code": "400"
            });
        } else {
            badgeModel.aggregate([
                {$match: {_id: {$in: player.badges}}}
                , {$project: {name: 1, description: 1, picture: 1, points : 1}}
                , {$sort: {points: -1}}
            ], function(err, badges) {
                if (err) {
                    console.log(err);
                    res.send({
                        "code": "400"
                    });
                } else {
                    res.send(badges);
                }
            });
        }
    });
};

exports.getEvents = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.findById(player_id, function(err, player) {
        if (err) {
            console.log(err);
            res.send({
                "code": "400"
            });
        } else {
            eventModel.aggregate([
                {$match: {player: player._id}}
                , {$project: {type: 1, timestamp: 1}}
                , {$sort: {timestamp: -1}}
            ], function(err, events) {
                if (err) {
                    console.log(err);
                    res.send({
                        "code": "400"
                    });
                } else {
                    res.send(events);
                }
            });
        }
    });
};

exports.updatePlayer = function(req, res) {
    var id = req.params.player_id;

    playerModel.findByIdAndUpdate(id, {$set: {points: 150}}, function(err, event) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
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
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findOneAndUpdate({_id: player.application}, {$inc: {numberOfPlayer: -1}}, function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    application.players.remove(id);
                    application.save(function(err) {
                    });
                    // mise à jour de l'application en supprimant le player de sa liste
                    playerModel.remove({_id: id}, function(err) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            eventModel.remove({player: id}).exec(); // suppression de tous les events liés à ce player
                            badgeModel.update({players: new mongoose.Types.ObjectId(id)}, {$inc: {numberOfOwner: -1}, $pull: {players: id}}, {multi: true}, function(err, badges) {
                                if (err) {
                                    console.log(err);
                                    res.send({"code": "400"});
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
                    