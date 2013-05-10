var mongoose = require('mongoose');
var mongo = require('mongodb');
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
        application: application_id
    });
    badge.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {badges: badge}},
            function(err, badge) {
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

// même question que pour getApplication dans event et badge, si on reçoit l'id de l'app --> pas besoin de la première partie de la requête.
//exports.deleteBadge = function(req, res) {
//    var id = req.params.badge_id;
//    badgeModel.findById(id, function(err, badge) {
//        if (err) {
//            throw err;
//        } else {
//            applicationModel.findById(badge.application, function(err, application) {
//                if (err) {
//                    throw err;
//                } else {
//                    application.badges.remove({_id : id}, function(err) {
//                        if (err) {
//                            throw err;
//                        } else {
//                            application.save(function(err){});
//                            badgeModel.remove({_id: id}, function(err) {
//                                if (err) {
//                                    throw err;
//                                } else {
//                                    res.send({
//                                        "code": "200"
//                                    });
//                                }
//                                ;
//                            });
//                        }
//                        ;
//                    });
//                }
//                ;
//            });
//        }
//        ;
//    });
//};

//exports.getBadgesOfPlayer = function(req, res) {
//    var application_id = req.params.app_id;
//    var player_id = req.params.player_id;
//    badgeModel.find({application: application_id, players: player_id}, function(err, badges) {
//        if (err) {
//            throw err;
//        } else {
//            res.send(badges);
//        }
//    });
//};

//exports.getNbLevel = function(req, res) {
//    var application_id = req.params.app_id;
//    db.collection('badges', function(err, collection) {
//        collection.find({applications: new ObjectId(application_id)}).toArray(function(err, items) {
//            var levels = new Array();
//            var nbLevel = new Array();
//
//            for (var i = 0; i < items.length; i++) {
//                var level = items[i]['level'];
//                if (!valueInArray(levels, level)) {
//                    levels.push(level);
//                }
//            }
//            nbLevel.push(levels.length);
//            res.send(nbLevel);
//        });
//    });
//};
//
//valueInArray = function(tableau, valeur) {
//    var estDansTableau = false;
//    if (tableau.length != 0) {
//        for (var i = 0; i < tableau.length; i++) {
//            if(tableau[i] == valeur){
//                estDansTableau = true;
//            }
//        }
//    }
//    return estDansTableau;
//};

//exports.getAllBadgesApplication = function(req, res) {
//    var application_id = req.params.app_id;
//    badgeModel.find({application: application_id}, function(err, badge) {
//        if (err) {
//            throw err;
//        } else {
//            res.send(badge);
//        }
//    });
//};


//update(
//                            {_id : application.badges},
//                    {$pull: {badges: {_id: id}}}


exports.deleteBadge = function(req, res) {
    var id = req.params.badge_id;
    badgeModel.findById(id, function(err, badge) {
        if (err) {
            throw err;
        } else {
            playerModel.find({_id: {$in: badge.players}}, function(err, players) {
                if (err) {
                    throw err;
                } else {
                    console.log(players);
                    var player;
                    for (var i = 0, l = players.length; i < l; i++) {
                        player = players[i];
                        player.collection.update(
                                {'badges._id': new mongoose.Types.ObjectId(id)},
                        {$pull: {'badges': {_id: new mongoose.Types.ObjectId(id)}}}, function(err){});
                    }
                    // mise à jour de l'application en supprimant le badge de sa liste
                    // récupération de l'application liée au badge
                    applicationModel.findById(badge.application, function(err, application) {
                        if (err) {
                            throw err;
                        } else {
                            // mise à jour de l'application en supprimant le badge de sa liste
                            application.collection.update(
                                    {'badges._id': new mongoose.Types.ObjectId(id)},
                            {$pull: {'badges': {_id: new mongoose.Types.ObjectId(id)}}}, function(err) {
                                if (err) {
                                    throw err;
                                } else {
                                    // suppression effective du badge
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
                            });
                        }
                    });
                }
            });
        }
        ;
    });
};

//exports.deleteBadge = function(req, res) {
//    var id = req.params.badge_id;
//    badgeModel.findById(id, function(err, badge) {
//        if (err) {
//            throw err;
//        } else {
//            applicationModel.update(
//                    {_id: badge.application},
//            {$pull: {badges: {_id: id}}}, function(err) {
//                if (err) {
//                    throw err;
//                } else {
//                    badgeModel.remove({_id: id}, function(err) {
//                        if (err) {
//                            throw err;
//                        } else {
//                            res.send({
//                                "code": "200"
//                            });
//                        }
//                    });
//                }
//            });
//        }
//    });
//};

//exports.deleteBadge = function(req, res) {
//    var id = req.params.badge_id;
//    badgeModel.findById(id, function(err, badge) {
//        if (err) {
//            throw err;
//        } else {
//            applicationModel.update(
//                    {'badges._id': new mongoose.Types.ObjectId(badge.application)},
//            {$pull: {'badges': {_id: new mongoose.Types.ObjectId(id)}}}, function(err) {
//                if (err) {
//                    throw err;
//                } else {
//                    badgeModel.remove({_id: id}, function(err) {
//                        if (err) {
//                            throw err;
//                        } else {
//                            res.send({
//                                "code": "200"
//                            });
//                        }
//                    });
//                }
//            });
//        }
//    });
//};
            