var mongoose = require('mongoose');

require('./../modeles/typeEventSchema');
require('./../modeles/applicationSchema');
require('./../modeles/eventSchema');
require('./../modeles/playerSchema');

var typeEventModel = mongoose.model('typeEvent');
var applicationModel = mongoose.model('application');
var eventModel = mongoose.model('event');
var playerModel = mongoose.model('player');

exports.addTypeEvent = function(req, res) {
    var application_id = req.params.app_id;
    var typeEvent = new typeEventModel({
        application: application_id,
        name: 'frag',
        points: 10
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

exports.updateTypeEvent = function(req, res) {
    var name = req.body.name;
    var id = req.params.typeEvent_id;

    typeEventModel.findByIdAndUpdate(id, {$set: {name: 'mise à jour'}}, function(err, typeEvent) {
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

exports.deleteTypeEvent = function(req, res) {
    var id = req.params.typeEvent_id;
    var app_id = req.params.app_id;
    typeEventModel.findById(id, function(err, typeEvent) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            // récupération de tous les events de ce type
            eventModel.find({type: id}, function(err, events) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    // pour chaque event, modification du player pour lui supprimer ce type d'event dans son tableau de type d'events
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
                                    // suppression de tous les events de ce type
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