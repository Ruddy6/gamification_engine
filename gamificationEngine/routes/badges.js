var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/badgeSchema');

var badgeModel = mongoose.model('badge');

exports.addBadge = function(req, res) {
    var application_id = req.params.app_id;
    var badge = new badgeModel({
        description: 'troisime badge ajouté',
        name: 'TroisièmeBadge',
        picture: 'troisieme.jpg',
        level: 2,
        application: application_id
    });
    badge.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });

//    applicationModel.findByIdAndUpdate(application_id, {$addToSet: {badges: badge}},
//    function(err, model) {
//        res.send({
//            "code": "200"
//        });
//    }
//    );
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

exports.getAllBadgesApplication = function(req, res) {
    var application_id = req.params.app_id;
    badgeModel.find({application: application_id}, function(err, badge) {
        if (err) {
            throw err;
        } else {
            res.send(badge);
        }
    });
};

exports.getBagdesByLevel = function(req, res) {
    var application_id = req.params.app_id;
    var level = req.params.level;
    badgeModel.find({application: application_id, level: level}, function(err, badge) {
        if (err) {
            throw err;
        } else {
            res.send(badge);
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
    badgeModel.remove({_id: id}, function(err) {
        if (err) {
            throw err;
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.addBadgeToPlayer = function(req, res) {
    var badge_id = req.params.badge_id;
    var player_id = req.params.player_id;
    badgeModel.findByIdAndUpdate(badge_id, {$addToSet: {players: player_id}},
    function(err, model) {
        res.send({
            "code": "200"
        });
    }
    );
};

exports.getBadgesOfPlayer = function(req, res) {
    var application_id = req.params.app_id;
    var player_id = req.params.player_id;
    badgeModel.find({application: application_id, players: player_id}, function(err, badges) {
        if (err) {
            throw err;
        } else {
            res.send(badges);
        }
    });
};

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
