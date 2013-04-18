/* 
 * Tutorial Mongoose http://www.atinux.fr/2011/10/15/tutoriel-sur-mongoose-mongodb-avec-node-js/
 */

var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/eventSchema');
require('./../modeles/leaderboardSchema');
require('./../modeles/playerSchema');

// Récupération du modèle pour d'application
var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var eventModel = mongoose.model('event');
var leaderboardModel = mongoose.model('leaderboard');
var playerModel = mongoose.model('player');

exports.addApplication = function(req, res) {
    // On créé une instance du Model
    var uneApplication = new applicationModel({name: 'applicationTest'});
    uneApplication.description = 'applicaiton de test';
    uneApplication.apiKey = '32l23lk42'; // peut aussi être effectué à l'instanciation
    uneApplication.apiSecret = 'test';
    //uneApplication.badges = [];

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

exports.updateApplication = function(req, res) {
    var id = req.params.id;

    applicationModel.findByIdAndUpdate(id, {$set: {name: 'Un nom à jour'}}, function(err, tank) {
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
            eventModel.remove({application: id}).exec(); // suppression de tous les events liés à cette application!
            leaderboardModel.remove({application: id}).exec(); // suppression du leaderboard lié à cette application!

            // Récupère tous les player liés à l'application à supprimer et enlève le lien du tableau d'application
            playerModel.find({applications: id}, function(err, players) {
                if (err) {
                    throw err;
                } else {
                    var player;
                    for (var i = 0, l = players.length; i < l; i++) {
                        player = players[i];
                        player.applications.remove(id)
                        player.save(function(err){});
                    }
                }
            });
            res.send({
                "code": "200"
            });
        }
    });
};