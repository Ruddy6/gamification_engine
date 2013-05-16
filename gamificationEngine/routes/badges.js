var mongoose = require('mongoose');

require('./../modeles/badgeSchema');
require('./../modeles/ruleSchema');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');

var db = mongoose.connection;

var badgeModel = mongoose.model('badge');
var ruleModel = mongoose.model('rule');
var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');

exports.addBadge = function(req, res) {
    var application_id = req.params.app_id;
    var badge = new badgeModel({
        name: 'folieMeurtière',
        description: '5 frags',
        picture: 'folie.jpg',
        points: 100,
        application: application_id
    });
    badge.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {badges: badge}, $inc: {numberOfBadge: 1}},
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

exports.getBadgeById = function(req, res) {
    var badge_id = req.params.badge_id;
    badgeModel.findById(badge_id, function(err, badge) {
        if (err) {
            throw err;
        } else {
            res.send(badge);
        }
    });
};

exports.getBadge = function(req, res) {
    var badge_id = req.params.badge_id;
    badgeModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(badge_id)}}
        , {$project: {name: 1, description: 1, picture: 1, points: 1, numberOfOwner: 1, rules: 1}}
    ], function(err, badge) {
        res.send(badge);
    });
};

// récupère tous les players qui ont ce badge
exports.getPlayers = function(req, res) {
    var application_id = req.params.app_id;
    var badge_id = req.params.badge_id;
    badgeModel.findById(badge_id, function(err, badge) {
        if (err) {
            throw err;
        } else {
            playerModel.find({_id: {$in: badge.players}}, function(err, players) {
                res.send(players);
            });
        }
    });
};

// récupère l'application liée à ce badge
// puisqu'on reçoit l'id de l'app, pas besoin de faire la permière partie de la requête...? --> idem que event
exports.getApplication = function(req, res) {
    var application_id = req.params.app_id;
    var badge_id = req.params.badge_id;
    badgeModel.findById(badge_id, function(err, badge) {
        if (err) {
            throw err;
        } else {
            applicationModel.find({_id: badge.application}, function(err, application) {
                res.send(application);
            });
        }
    });
};

exports.updateBadge = function(req, res) {
    var id = req.params.badge_id;

    badgeModel.findByIdAndUpdate(id, {$set: {name: 'Un badge à jour'}}, function(err, badge) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.deleteBadge = function(req, res) {
    var id = req.params.badge_id;
    badgeModel.findById(id, function(err, badge) {
        if (err) {
            throw err;
        } else {
            ruleModel.remove({badge: badge.id}).exec();
            playerModel.find({_id: {$in: badge.players}}, function(err, players) {
                if (err) {
                    throw err;
                } else {
                    var player;
                    for (var i = 0, l = players.length; i < l; i++) {
                        player = players[i];
                        player.badges.remove(id);
                        player.save(function(err) {
                        });
                        playerModel.findOneAndUpdate(
                                {_id: player._id},
                        {$inc: {points: -badge.points, numberOfBadge: -1}}, function(err, updatedPlayer) {
                        });
                    }
                    // mise à jour de l'application en supprimant le badge de sa liste
                    // récupération de l'application liée au badge
                    applicationModel.findOneAndUpdate({_id: badge.application}, {$inc: {numberOfBadge: -1}}, function(err, application) {
                        if (err) {
                            throw err;
                        } else {
                            // mise à jour de l'application en supprimant le badge de sa liste
                            application.badges.remove(id);
                            application.save(function(err) {
                            });
                            badgeModel.remove({_id: id}, function(err) {
                                if (err) {
                                    throw err;
                                } else {
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
        ;
    });
};
            