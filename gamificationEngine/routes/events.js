var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/eventSchema');

var eventModel = mongoose.model('event');

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
            res.send({
                "code": "200"
            });
        }
    });
};

exports.getAllEventsApplication = function(req, res) {
    var application_id = req.params.app_id;
    eventModel.find({application: application_id}, function(err, events) {
        if (err) {
            throw err;
        } else {
            res.send(events);
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
    eventModel.remove({_id: id}, function(err) {
        if (err) {
            throw err;
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};