var mongoose = require('mongoose');

require('./../modeles/typeEventSchema');
require('./../modeles/applicationSchema');
require('./../modeles/eventSchema');
require('./../modeles/playerSchema');

var typeEventModel = mongoose.model('typeEvent');
var applicationModel = mongoose.model('application');
var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');

/**
 * Permet d'ajouter un type d'event.
 * Un type d'event est dépendant de la logique de l'application cliente.
 * Exemple de type d'event : commentaire, vote, ouverture d'un poste etc. dans le cas d'une application type forum.
 * @param {type} req Les données du type d'event à ajouter.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le type d'event a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.addTypeEvent = function(req, res) {
    var application_id = req.params.app_id;
//    var typeEvent = new typeEventModel({
//        application: application_id,
//        name: 'frag',
//        points: 10
//    });
    var typeEvent = new typeEventModel({
        application: application_id,
        name: req.body.name,
        points: req.body.points
    });
    typeEvent.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(application_id, {$addToSet: {typeEvents: {type: typeEvent._id, name: typeEvent.name}}},
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
 * Permet de récupérer un type d'event spécifique.
 * @param {type} req L'id du type d'event à récupérer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Le type d'event demandé ou un code erreur 400 si un problème a été rencontré.
 */
exports.getTypeEventById = function(req, res) {
    var typeEvent_id = req.params.typeEvent_id;
    typeEventModel.findById(typeEvent_id, function(err, typeEvent) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(typeEvent);
        }
    });
};

/**
 * Permet de mettre à jour un type d'event spécifique.
 * ATTENTION, la mise à jour du nom d'un type d'event entraine une mise à jour de ce dernier 
 * dans l'application ainsi que dans chaque joueur qui possède un ou plusieurs event de ce type.
 * @param {type} req L'id du type d'event à mettre à jour ainsi que ses informations.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le type d'event a pu être modifié ou un code erreur 400 si un problème a été rencontré.
 */
exports.updateTypeEvent = function(req, res) {
    var id = req.params.typeEvent_id;
    var name = req.body.name;
    var points = req.body.points;

    typeEventModel.findByIdAndUpdate(id, {$set: {name: name, points: points}}, function(err, typeEvent) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            if (name) {
                applicationModel.findOneAndUpdate({_id: typeEvent.application, 'typeEvents.type': new mongoose.Types.ObjectId(id)}, {$set: {'typeEvents.$.name': name}}, {upsert: true}, function(err) {
                    if (err) {
                        console.log(err);
                        res.send({"code": "400"});
                    } else {
                        playerModel.find({'events.type': new mongoose.Types.ObjectId(id)}, function(err, players) {
                            if (err) {
                                console.log(err);
                                res.send({"code": "400"});
                            } else {
                                for (var i = 0; i < players.length; i++) {
                                    playerModel.findOneAndUpdate({_id: players[i]._id, 'events.type': new mongoose.Types.ObjectId(id)},
                                    {$set: {'events.$.name': name}}, {upsert: true}, function(err) {
                                        if (err) {
                                            console.log(err);
                                            res.send({"code": "400"});
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
            } else {
                res.send({
                    "code": "200"
                });
            }
        }
    });
};

/**
 * Permet de supprimer un type d'event particulier.
 * ATTENTION, la suppression d'un type d'event entraine la suppression de tous les events de ce type dans l'application
 * et pour chaque player qui possède un ou plusieurs event de ce type.
 * @param {type} req L'id du type d'event à supprimer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si le type d'event a pu être supprimé ou un code erreur 400 si un problème a été rencontré.
 */
exports.deleteTypeEvent = function(req, res) {
    var id = req.params.typeEvent_id;
    var app_id = req.params.app_id;
    typeEventModel.findById(id, function(err, typeEvent) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            // récupération de tous les events de ce type.
            eventModel.find({type: id}, function(err, events) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    // Pour chaque event, modification du player pour lui supprimer ce type d'event dans son tableau de type d'events.
                    var event;
                    for (var i = 0, l = events.length; i < l; i++) {
                        event = events[i];
                        playerModel.findOneAndUpdate({_id: event.player,
                            'events.type': new mongoose.Types.ObjectId(id)},
                        {$pull: {'events': {type: new mongoose.Types.ObjectId(id)}}}, function(err) {
                            if (err) {
                                console.log(err);
                                res.send({"code": "400"});
                            }
                        });
                    }
                    // Suppression du type d'event dans l'application.
                    applicationModel.findOneAndUpdate({_id: app_id, 'typeEvents.type': new mongoose.Types.ObjectId(id)}, {$pull: {'typeEvents': {type: new mongoose.Types.ObjectId(id)}}}, function(err) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            typeEventModel.remove({_id: id}, function(err) {
                                if (err) {
                                    console.log(err);
                                    res.send({"code": "400"});
                                } else {
                                    // Suppression de tous les events de ce type.
                                    eventModel.remove({type: id}).exec();
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