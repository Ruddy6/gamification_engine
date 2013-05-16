/* 
 * Tutorial Mongoose http://www.atinux.fr/2011/10/15/tutoriel-sur-mongoose-mongodb-avec-node-js/
 */

var mongoose = require('mongoose');

require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/typeEventSchema');
require('./../modeles/playerSchema');
require('./../modeles/ruleSchema');

// Récupération du modèle pour d'application
var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var typeEventModel = mongoose.model('typeEvent');
var playerModel = mongoose.model('player');
var ruleModel = mongoose.model('rule');

exports.addApplication = function(req, res) {
    // On créé une instance du Model
    var uneApplication = new applicationModel({name: 'applicationTest'});
    uneApplication.description = 'applicaiton de test';
    uneApplication.userKey = '32l23lk42';
    uneApplication.adminKey = 'test';
    uneApplication.numberOfBadge = 0;
    uneApplication.numberOfPlayer = 0;

    // On le sauvegarde dans MongoDB !
    uneApplication.save(function(err) {
        if (err) {
            throw err;
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.getAllApplications = function(req, res) {
    applicationModel.find(null, function(err, apps) {
        if (err) {
            throw err;
        } else {
            res.send(apps);
        }
    });
};

exports.getApplicationById = function(req, res) {
    applicationModel.findById(req.params.id, function(err, application) {
        if (err) {
            throw err;
        } else {
            res.send(application);
        }
    });
};

exports.getApplication = function(req, res) {
    var application_id = req.params.id;
    applicationModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(application_id)}}
        , {$project: {name: 1, description: 1, numberOfBadge: 1, numberOfPlayer: 1, typeEvents: 1}}
    ], function(err, application) {
        res.send(application);
    });
};

// récupère tous les players d'une application
exports.getPlayers = function(req, res) {
    var application_id = req.params.id;
    playerModel.aggregate([
        {$match: {application: new mongoose.Types.ObjectId(application_id)}}
        , {$project: {pseudo: 1, points: 1, numberOfBadge: 1}}
        , { $sort: {pseudo: 1}}
    ], function(err, player) {
        res.send(player);
    });
};

// récupère tous les badges d'une application
exports.getBadges = function(req, res) {
    var application_id = req.params.id;
    badgeModel.aggregate([
        {$match: {application: new mongoose.Types.ObjectId(application_id)}}
        , {$project: {name: 1, description: 1, picture: 1, points: 1, numberOfOwner: 1}}
    ], function(err, badge) {
        res.send(badge);
    });
};

exports.updateApplication = function(req, res) {
    var id = req.params.id;

    applicationModel.findByIdAndUpdate(id, {$set: {name: 'Un nom à jour'}}, function(err, application) {
        if (err) {
            return handleError(err);
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
            throw err;
        } else {
            badgeModel.remove({application: id}).exec(); // suppression de tous les badges liés à cette application!
            typeEventModel.remove({application: id}).exec(); // suppression de tous les events liés à cette application!
            playerModel.remove({application: id}).exec(); // suppression de tous les players liés à cette application!
            ruleModel.remove({application: id}).exec(); // suppression de toutes les règles liées à cette application!

            res.send({
                "code": "200"
            });
        }
    });
};