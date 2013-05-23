var mongoose = require('mongoose');

require('./../modeles/eventSchema');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');
require('./../modeles/ruleSchema');
require('./../modeles/typeEventSchema');

var playersController = require('./players');
var rulesController = require('./rules');
//var typeEventController = require('./typeEvents');

var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');
var typeEventModel = mongoose.model('typeEvent');

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
                            // si le player possède déjà un event du type de l'event à ajouter, on incrémente simplement la quantité de ce type
                            // sinon, on ajoute une nouvelle entrée dans le tableau
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

// récupère le player qui a effectué cet event
exports.getPlayer = function(req, res) {
    var event_id = req.params.event_id;
    eventModel.findById(event_id, function(err, event) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            playerModel.findById(event.player, function(err, player) {
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
                    // récupération du player lié à cet event
                    playerModel.findById(event.player, function(err, player) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // mise à jour du player en supprimant l'event de sa liste
                            var eventToDel;
                            for (var i = 0; i < player.events.length; i++) {
                                if ("'" + player.events[i].type + "'" === "'" + event.type + "'") {
                                    eventToDel = player.events[i];
                                }
                            }
                            if ("'" + eventToDel.quantity + "'" === "'" + 1 + "'") {
                                playerModel.findOneAndUpdate(
                                        {_id: event.player, 'events.type': event.type},
                                {$inc: {points: -typeEvent.points}, $pull: {'events': {type: event.type}}}, function(err, updatedPlayer) {

                                });

                            } else {
                                playerModel.findOneAndUpdate(
                                        {_id: event.player, 'events.type': event.type},
                                {$inc: {'events.$.quantity': -1, points: -typeEvent.points}}, function(err, updatedPlayer) {

                                });
                            }
                            // suppression effective de l'event
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