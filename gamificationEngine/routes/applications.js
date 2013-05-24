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

// 
// 
/**
 * Permet d'ajouter une nouvelle application dans la base de données.
 * Les données sont envoyées par l'utilisateur dans le corps de la requête POST.
 * 
 * @param {type} req Les données de l'application.
 * @param {type} res
 * @returns Un code d'erreur 200 si l'opération s'est bien déroulée, 400 sinon.
 */
exports.addApplication = function(req, res) {
//    var uneApplication = new applicationModel({name: 'applicationTest'});
//    uneApplication.description = 'applicaiton de test';
//    uneApplication.userKey = '32l23lk42';
//    uneApplication.adminKey = 'test';
//    uneApplication.numberOfBadge = 0;
//    uneApplication.numberOfPlayer = 0;
    
    var application = new applicationModel({
        name: req.body.name,
        description: req.body.description,
        userKey: req.body.userKey,
        adminKey: req.body.adminKey
    });

    application.save(function(err) {
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

/**
 * Permet de retourner toutes les applications de la base de données.
 * @param {type} req NULL
 * @param {type} res
 * @returns Toutes les applications de la BD sous forme JSON ou un code erreur 400 si un problème a été rencontré.
 */
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

/**
 * Permet de récupérer une application spécifique.
 * Les données renvoyées contiennent uniquement son nom, sa description, le nombre de badges qu'elle possède, le nombre de player associé
 * et un tableau récapitulatif des types d'events qu'il est possible d'effectuer (id et nom).
 * @param {type} req L'id de l'application à récupérer.
 * @param {type} res
 * @returns L'application ou un code erreur 400 si un problème a été rencontré.
 */
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

/**
 * Permet de récupérer tous les players d'une application.
 * Chaque player est représenté par son pseudo, son nombre de points et son nombre de badge.
 * Les informations sont retournées dans l'ordre alphabétique croissant du pseudo.
 * @param {type} req L'id de l'application dont on veut récupérer les players.
 * @param {type} res
 * @returns La liste récapitulative des players de l'application ou un code erreur 400 si un problème a été rencontré. 
*/
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

/**
 * Permet de récupérer tous les badges liés à une application.
 * Chaque badge est représenté par son nom, sa description, sa photo et son nombre de points.
 * Les informations sont retournées par nombre de point croissant.
 * @param {type} req L'id de l'application dont on veut récupérer les badges.
 * @param {type} res
 * @returns La liste récapitulative des badges de l'application ou un code erreur 400 si un problème a été rencontré.
*/
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

/**
 * Permet de mettre à jour une application spécifique. 
 * @param {type} req L'id de l'application à mettre à jour.
 * @param {type} res
 * @returns Un code 200 si l'application a pu être mise à jour ou un code erreur 400 si un problème a été rencontré. 
 */
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

/**
 * Permet de supprimer une application.
 * ATTENTION, la suppression d'une application supprimera l'ensemble des éléments liés (players, badges, typeEvents, rules et events).
 * @param {type} req L'id de l'application à supprimer.
 * @param {type} res
 * @returns Un code 200 si l'application a pu être supprimée ou un code erreur 400 si un problème a été rencontré. 
 */
exports.deleteApplication = function(req, res) {
    var id = req.params.id;
    applicationModel.remove({_id: id}, function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            badgeModel.remove({application: id}).exec(); // suppression de tous les badges liés à cette application!
            typeEventModel.remove({application: id}).exec(); // suppression de tous les types d'events liés à cette application!
            playerModel.remove({application: id}).exec(); // suppression de tous les players liés à cette application!
            ruleModel.remove({application: id}).exec(); // suppression de toutes les règles liées à cette application!
            eventModel.remove({application: id}).exec(); // suppression de tous les events liées à cette application!
            
            res.send({
                "code": "200"
            });
        }
    });
};