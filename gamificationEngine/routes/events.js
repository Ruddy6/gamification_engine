var mongoose = require('mongoose');

require('./../modeles/eventSchema');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');
require('./../modeles/ruleSchema');
require('./../modeles/typeEventSchema');

var rulesController = require('./rules');

var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');
var typeEventModel = mongoose.model('typeEvent');

/**
 * Permet d'ajouter un nouvel event dans la base de données.
 * ATTENTION, l'ajout d'un event déclanche la vérification des règles liés à son type 
 * et permet, le cas échéant, l'obtention d'un badge pour le player concerné.
 * @param {type} req Les données de l'event à ajouter.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si l'event a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.addEvent = function(req, res) {
    var application_id = req.params.app_id;
    var player_id = req.body.player_id;
    var typeEvent_id = req.body.typeEvent_id;

//    var event = new eventModel({
//        type: typeEvent_id,
//        application: application_id,
//        player: player_id
//    });
    
    var event = new eventModel({
        type: typeEvent_id,
        application: application_id,
        player: player_id
    });

    event.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            typeEventModel.findById(event.type, function(err, typeEvent) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    playerModel.find({_id: player_id, 'events.type': event.type},
                    function(err, player) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // Si le player possède déjà un event du type de l'event à ajouter, on incrémente simplement la quantité de ce type
                            // Sinon, on ajoute une nouvelle entrée dans le tableau
                            if (player.length === 0) {
                                playerModel.findByIdAndUpdate(player_id, {$inc: {points: typeEvent.points}, $addToSet: {events: {type: typeEvent_id, name: typeEvent.name, quantity: 1}}}, function(err, player) {
                                    if (err) {
                                        console.log(err);
                                        res.send({"code": "400"});
                                    } else {
                                        rulesController.checkRules(1, event, player_id);
                                    }
                                });
                            } else {
                                playerModel.findOneAndUpdate(
                                        {_id: player_id, 'events.type': event.type},
                                {$inc: {'events.$.quantity': 1, points: typeEvent.points}}, function(err, updatedPlayer) {
                                    if (err) {
                                        console.log(err);
                                        res.send({"code": "400"});
                                    } else {
                                        var nbEvent = 0;
                                        for (var i = 0; i < updatedPlayer.events.length; i++)
                                        {
                                            if ("'" + updatedPlayer.events[i].type + "'" === "'" + event.type + "'") {
                                                nbEvent = updatedPlayer.events[i].quantity;
                                            }
                                        }
                                        // Permet de contrôler si l'ajout de cet event permet l'obtention d'un badge.
                                        rulesController.checkRules(nbEvent, event, player_id);
                                    }
                                });
                            }
                            res.send({
                                "code": "200"
                            });
                        }
                    });
                }
            });
        }
    });
};

/**
 * Permet de récupérer un event spécifique via son id.
 * @param {type} req L'id de l'event à récupérer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns L'event désiré ou un code erreur 400 si un problème a été rencontré.
 */
exports.getEventById = function(req, res) {
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(event);
        }
    });
};

/**
 * Permet de récupérer le player qui a effectué un event spécifique.
 * Le player est représenté par son id, son pseudo, son nombre de points et son nombre de badge.
 * Les informations sont retournées dans l'ordre alphabétique croissant du pseudo.
 * @param {type} req L'id de l'event dont on veut connaître l'auteur.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Le player auteur de l'event ou un code erreur 400 si un problème a été rencontré.
 */
exports.getPlayer = function(req, res) {
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            console.log(event.player);
            playerModel.aggregate([
                {$match: {_id: event.player}}
                , {$project: {_id: 1, pseudo: 1, points: 1, numberOfBadge: 1}}
                , {$sort: {pseudo: 1}}
            ], function(err, player) {
                res.send(player);
            });
        }
    });
};

//exports.updateEvent = function(req, res) {
//    var id = req.params.event_id;
//
//    eventModel.findByIdAndUpdate(id, {$set: {type: 'mise à jour'}}, function(err, event) {
//        if (err) {
//            console.log(err);
//            res.send({"code": "400"});
//        } else {
//            res.send({
//                "code": "200"
//            });
//        }
//    });
//};

/**
 * Permet de supprimer un event spécifique.
 * @param {type} req L'id de l'event que l'on veut supprimer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si l'event a pu être supprimé ou un code erreur 400 si un problème a été rencontré.
 */
exports.deleteEvent = function(req, res) {
    var id = req.params.event_id;
    eventModel.findById(id, function(err, event) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            typeEventModel.findById(event.type, function(err, typeEvent) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    // Récupération du player lié à cet event
                    playerModel.findById(event.player, function(err, player) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // Mise à jour du player en supprimant l'event de sa liste
                            var eventToDel;
                            for (var i = 0; i < player.events.length; i++) {
                                if ("'" + player.events[i].type + "'" === "'" + event.type + "'") {
                                    eventToDel = player.events[i];
                                }
                            }
                            // Si il s'agissait de son dernier event de ce type, suppression de ce type d'event
                            if ("'" + eventToDel.quantity + "'" === "'" + 1 + "'") {
                                playerModel.findOneAndUpdate(
                                        {_id: event.player, 'events.type': event.type},
                                {$inc: {points: -typeEvent.points}, $pull: {'events': {type: event.type}}}, function(err, updatedPlayer) {

                                });
                            // S'il possède encore des event de ce type, décrémenter sa quantité de 1 et diminuer son nombre de points.
                            } else {
                                playerModel.findOneAndUpdate(
                                        {_id: event.player, 'events.type': event.type},
                                {$inc: {'events.$.quantity': -1, points: -typeEvent.points}}, function(err, updatedPlayer) {

                                });
                            }
                            // Suppression effective de l'event
                            eventModel.remove({_id: id}, function(err) {
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
        ;
    });
};