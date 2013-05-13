var mongoose = require('mongoose');

require('./../modeles/eventSchema');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');
require('./../modeles/ruleSchema');
require('./../modeles/badgeSchema');

var playersController = require('./players');
var rulesController = require('./rules');

var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');
var ruleModel = mongoose.model('rule');
var badgeModel = mongoose.model('badge');

exports.addEvent = function(req, res) {
    var application_id = req.params.app_id;
    var player_id = req.params.player_id;
    var typeEvent_id = req.params.typeEvent_id;

    var event = new eventModel({
        type: typeEvent_id,
        application: application_id,
        player: player_id
    });

    event.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            playerModel.find({_id: player_id, 'events.type': event.type},
            function(err, player) {
                if (err) {
                    throw err;
                } else {
                    // si le player possède déjà un event du type de l'event à ajouter, on incrémente simplement la quantité de ce type
                    // sinon, on ajoute une nouvelle entrée dans le tableau
                    if (player.length === 0) {
                        playerModel.findByIdAndUpdate(player_id, {$addToSet: {events: {type: typeEvent_id, quantity: 1}}}, function(err, player) {
                            if (err) {
                                throw err;
                            } else {
                                rulesController.checkRules(1, event, player_id);
                            }
                        });
                    } else {
                        playerModel.findOneAndUpdate(
                                {_id: player_id, 'events.type': event.type},
                        {$inc: {'events.$.quantity': 1}}, function(err, updatedPlayer) {
                            if (err) {
                                throw err;
                            } else {
                                var nbEvent = 0;
                                for (var i = 0; i < updatedPlayer.events.length; i++)
                                {
                                    if ("'"+updatedPlayer.events[i].type+"'" === "'"+event.type+"'") {
                                        nbEvent = updatedPlayer.events[i].quantity;
                                    }
                                }
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
};

exports.getEventById = function(req, res) {
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            throw err;
        } else {
            res.send(event);
        }
    });
};

// récupère le player qui a effectué cet event
exports.getPlayer = function(req, res) {
    var application_id = req.params.app_id;
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            throw err;
        } else {
            playerModel.find({_id: event.player}, function(err, player) {
                res.send(player);
            });
        }
    });
};

// récupère l'application liée à cet event
// puisqu'on reçoit l'id de l'app, pas besoin de faire la permière partie de la requête...?
exports.getApplication = function(req, res) {
    var application_id = req.params.app_id;
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            throw err;
        } else {
            applicationModel.find({_id: event.application}, function(err, application) {
                res.send(application);
            });
        }
    });
};

exports.updateEvent = function(req, res) {
    var id = req.params.event_id;

    eventModel.findByIdAndUpdate(id, {$set: {type: 'mise à jour'}}, function(err, event) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.deleteEvent = function(req, res) {
    var id = req.params.event_id;
    eventModel.findById(id, function(err, event) {
        if (err) {
            throw err;
        } else {
            // récupération du player lié à cet event
            playerModel.findById(event.player, function(err, player) {
                if (err) {
                    throw err;
                } else {
                    // mise à jour du player en supprimant l'event de sa liste
                    player.collection.update(
                            {'events._id': new mongoose.Types.ObjectId(id)},
                    {$pull: {'events': {_id: new mongoose.Types.ObjectId(id)}}}, function(err) {
                        if (err) {
                            throw err;
                        } else {
                            // suppression effective de l'event
                            eventModel.remove({_id: id}, function(err) {
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
};