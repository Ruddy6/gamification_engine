var mongoose = require('mongoose');

require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/eventSchema');

var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var eventModel = mongoose.model('event');

/**
 * Permet d'ajouter un nouveau player dans la base de données.
 * @param {type} req Les données du player à ajouter.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le player a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.addPlayer = function(req, res) {
    var application_id = req.params.app_id;
//    var player = new playerModel({
//        firstname: 'deuxieme',
//        lastname: 'exu',
//        pseudo: 'deux',
//        email: 'dexu.com',
//        //points: 200,
//        application: application_id
//    });
    var player = new playerModel({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        pseudo: req.body.pseudo,
        email: req.body.email,
        points: req.body.points,
        application: application_id
    });
    player.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            // Ajoute le player à la liste des players de l'application et incrémente son nombre de player.
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

/**
 * Permet de récupérer un player spécifique.
 * Le player retourné est constitué de son prénom, nom, pseudo, email, points, 
 * le tableau récapitulatif de ses events (nom et nombre d'event par type) ainsi que le nombre de badge qu'il possède.
 * @param {type} req L'id du player que l'on veut récupérer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Le player désiré ou un code erreur 400 si un problème a été rencontré.
 */
exports.getPlayer = function(req, res) {
    var player_id = req.params.player_id;
    playerModel.aggregate([
        {$match: {_id: new mongoose.Types.ObjectId(player_id)}}
        , {$project: {firstname: 1, lastname: 1, pseudo: 1, email: 1, points: 1, events: 1, numberOfBadge: 1, badges: 1}}
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

/**
 * Permet d'ajouter un badge à un player.
 * @param {type} badge_id L'id du badge à ajouter.
 * @param {type} player_id L'id du player concerné.
 * @returns Un code erreur 400 si un problème a été rencontré.
 */
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

/**
 * Permet de récupérer la liste des badges d'un player.
 * Chaque badge de cette liste est composé de son id, de son nom, de sa description, de son image et de son nombre de points.
 * @param {type} req L'id du player dont on veut récupérer la liste de badges.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns La liste des badges du player ou un code erreur 400 si un problème a été rencontré.
 */
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
                , {$project: {_id: 1, name: 1, description: 1, picture: 1, points: 1}}
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
 * Permet de récupérer la liste des events d'un player.
 * Chaque event de cette liste est composé de son type et de la date et heure à laquelle il a été ajouté, trié par date décroissante.
 * @param {type} req L'id du player dont on veut récupérer la liste des events.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns La liste des events du player ou un code erreur 400 si un problème a été rencontré.
 */
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
                , {$project: {_id: 1, type: 1, timestamp: 1}}
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

/**
 * Permet de mettre à jour un player.
 * Seul son firstname, lastname, pseudo, email et points sont modifiables.
 * @param {type} req Les données du player à mettre à jour.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le player a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.updatePlayer = function(req, res) {
    var id = req.params.player_id;
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var points = req.body.points;

    playerModel.findByIdAndUpdate(id, {$set: {firstname: firstname, lastname: lastname, pseudo: pseudo, email: email, points: points}}, function(err, event) {
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
 * Permet de supprimer un player.
 * ATTENTION, la suppression d'un player entraine la suppression de tous ses events!
 * @param {type} req L'id du player à supprimer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le player a pu être supprimé ou un code erreur 400 si un problème a été rencontré.
 */
exports.deletePlayer = function(req, res) {
    var id = req.params.player_id;
    playerModel.findById(id, function(err, player) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            // Mise à jour de l'application en décrémentant de 1 son nombre de player.
            applicationModel.findOneAndUpdate({_id: player.application}, {$inc: {numberOfPlayer: -1}}, function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    application.players.remove(id);
                    application.save(function(err) {
                    });
                    // Mise à jour de l'application en supprimant le player de sa liste
                    playerModel.remove({_id: id}, function(err) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // Suppression de tous les events liés à ce player.
                            eventModel.remove({player: id}).exec();
                            // Suppression de l'id du player de la liste des owner de tous les badges qu'il possédait.
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
                    