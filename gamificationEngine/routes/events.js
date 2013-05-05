var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/eventSchema');
require('./../modeles/playerSchema');
require('./../modeles/applicationSchema');

var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');
var applicationModel = mongoose.model('application');

exports.addEvent = function(req, res) {
    var application_id = req.params.app_id;
    var player_id = req.params.player_id;

    var event = new eventModel({
        type: 1,
        points: 10,
        application: application_id,
        player: player_id
    });

    event.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            playerModel.findByIdAndUpdate(player_id, {$addToSet: {events: event}},
            function(err, player) {
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
};

//exports.getAllEventsApplication = function(req, res) {
//    var application_id = req.params.app_id;
//    eventModel.find({application: application_id}, function(err, events) {
//        if (err) {
//            throw err;
//        } else {
//            res.send(events);
//        }
//    });
//};

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
            playerModel.find({_id : event.player}, function(err, player){
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
            playerModel.find({_id : event.application}, function(err, application){
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