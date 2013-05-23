var mongoose = require('mongoose');

require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/typeEventSchema');
require('./../modeles/playerSchema');
require('./../modeles/ruleSchema');
require('./../modeles/eventSchema');

// Récupération du modèle pour d'application
var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var typeEventModel = mongoose.model('typeEvent');
var playerModel = mongoose.model('player');
var ruleModel = mongoose.model('rule');
var eventModel = mongoose.model('event');

exports.addApplication = function(req, res) {
    var uneApplication = new applicationModel({name: 'applicationTest'});
    uneApplication.description = 'applicaiton de test';
    uneApplication.userKey = '32l23lk42';
    uneApplication.adminKey = 'test';
    uneApplication.numberOfBadge = 0;
    uneApplication.numberOfPlayer = 0;

    uneApplication.save(function(err) {
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

exports.getApplications = function(req, res) {
    applicationModel.find(null, function(err, apps) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(apps);
        }
    });
};

exports.getApplication = function(req, res) {
    var application_id = req.params.id;
    applicationModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(application_id)}}
        , {$project: {name: 1, description: 1, numberOfBadge: 1, numberOfPlayer: 1, typeEvents: 1}}
    ], function(err, application) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(application);
        }
    });
};

// récupère tous les players d'une application
exports.getPlayers = function(req, res) {
    var application_id = req.params.id;
    playerModel.aggregate([
        {$match: {application: new mongoose.Types.ObjectId(application_id)}}
        , {$project: {pseudo: 1, points: 1, numberOfBadge: 1}}
        , {$sort: {pseudo: 1}}
    ], function(err, player) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(player);
        }
    });
};

// récupère tous les badges d'une application
exports.getBadges = function(req, res) {
    var application_id = req.params.id;
    applicationModel.findById(application_id, function(err, application) {
        if (err) {
            console.log(err);
            res.send({
                "code": "400"
            });
        } else {
            badgeModel.aggregate([
                {$match: {_id: {$in: application.badges}}}
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

exports.updateApplication = function(req, res) {
    var id = req.params.id;

    applicationModel.findByIdAndUpdate(id, {$set: {name: 'Un nom à jour'}}, function(err, application) {
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

exports.deleteApplication = function(req, res) {
    var id = req.params.id;
    applicationModel.remove({_id: id}, function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            badgeModel.remove({application: id}).exec(); // suppression de tous les badges liés à cette application!
            typeEventModel.remove({application: id}).exec(); // suppression de tous les events liés à cette application!
            playerModel.remove({application: id}).exec(); // suppression de tous les players liés à cette application!
            ruleModel.remove({application: id}).exec(); // suppression de toutes les règles liées à cette application!
            eventModel.remove({application: id}).exec();
            
            res.send({
                "code": "200"
            });
        }
    });
};