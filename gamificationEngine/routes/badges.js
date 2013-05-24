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

/**
 * Permet d'ajouter un nouveau badge dans la base de données.
 * Les données sont envoyées par l'utilisateur dans le corps de la requête POST.
 * 
 * @param {type} req Les données du badge à ajouter.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le badge a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.addBadge = function(req, res) {
    var application_id = req.params.app_id;
//    var badge = new badgeModel({
//        name: 'folieMeurtière',
//        description: '5 frags',
//        picture: 'folie.jpg',
//        points: 100,
//        application: application_id
//    });
    var badge = new badgeModel({
        name: req.body.name,
        description: req.body.description,
        picture: req.body.picture,
        points: req.body.points,
        application: application_id
    });
    badge.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {badges: badge._id}, $inc: {numberOfBadge: 1}},
            function(err, application) {
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
};

/**
 * Permet de récupérer un badge particulier.
 * Les données renvoyées contiennent uniquement son nom, sa description, son image, 
 * son nombre de points, son nombre de possesseur ainsi qu'un tableau contenant les règles permettant de l'obtenir.
 * @param {type} req L'id du badge à récupérer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Le badge ou un code erreur 400 si un problème a été rencontré.
 */
exports.getBadge = function(req, res) {
    var badge_id = req.params.badge_id;
    badgeModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(badge_id)}}
        , {$project: {name: 1, description: 1, picture: 1, points: 1, numberOfOwner: 1, rules: 1}}
    ], function(err, badge) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(badge);
        }
    });
};

/**
 * Permet de récuprer la liste de tous les players qui possèdent ce badge.
 * @param {type} req L'id du badge dont on veut récupérer les possesseurs.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un tableau de players possesseur de ce badge ou un code erreur 400 si un problème a été rencontré.
 */
exports.getPlayers = function(req, res) {
    var badge_id = req.params.badge_id;
    badgeModel.findById(badge_id, function(err, badge) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            playerModel.find({_id: {$in: badge.players}}, function(err, players) {
                res.send(players);
            });
        }
    });
};

/**
 * Permet de mettre à jour un badge spécifique.
 * Seuls les éléments nom, description, picture et points sont modifiables.
 * @param {type} req Les données du badge à modifier.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le badge a pu être mis à jour ou un code erreur 400 si un problème a été rencontré.
 */
exports.updateBadge = function(req, res) {
    var id = req.params.badge_id;
    var name = req.body.name;
    var description = req.body.description;
    var picture = req.body.picture;
    var points = req.body.points;
    badgeModel.findByIdAndUpdate(id, {$set: {name: name, description: description, picture: picture, points: points}}, function(err, badge) {
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
 * Permet de supprimer un badge.
 * ATTENTION, la suppression d'un badge entrainera également sa suppression dans chaque player qui le possède ainsi que dans l'application.
 * @param {type} req L'id du badge à supprimer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le badge a pu être mis à jour ou un code erreur 400 si un problème a été rencontré.
 */
exports.deleteBadge = function(req, res) {
    var id = req.params.badge_id;
    badgeModel.findById(id, function(err, badge) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            ruleModel.remove({badge: badge.id}).exec();
            playerModel.find({_id: {$in: badge.players}}, function(err, players) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
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
                    // Mise à jour de l'application en décrémentant son nombre de badges.
                    applicationModel.findOneAndUpdate({_id: badge.application}, {$inc: {numberOfBadge: -1}}, function(err, application) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // Mise à jour de l'application en supprimant le badge de sa liste
                            application.badges.remove(id);
                            application.save(function(err) {
                            });
                            badgeModel.remove({_id: id}, function(err) {
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
                        ;
                    });
                }
            });
        }
        ;
    });
};
            