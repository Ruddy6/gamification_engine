var mongoose = require('mongoose');
var mongo = require('mongodb');
require('./../modeles/ruleSchema');

var ruleModel = mongoose.model('rule');

exports.addRule = function(req, res) {
    var application_id = req.params.app_id;
    var event_id = req.params.event_id;
    var badge_id = req.params.badge_id;
    var rule = new ruleModel({
        application: application_id,
        event: event_id,
        badge: badge_id
    });
    rule.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.getAllRulesApplication = function(req, res) {
    var application_id = req.params.app_id;
    ruleModel.find({application: application_id}, function(err, rules) {
        if (err) {
            throw err;
        } else {
            res.send(rules);
        }
    });
};

exports.getRuleById = function(req, res) {
    var rule_id = req.params.rule_id;
    ruleModel.findById(rule_id, function(err, event) {
        if (err) {
            throw err;
        } else {
            res.send(event);
        }
    });
};

exports.updateRule = function(req, res) {
    var id = req.params.rule_id;

    ruleModel.findByIdAndUpdate(id, {$set: {badge: 1}}, function(err, rule) {
        if (err) {
            return handleError(err);
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};

exports.deleteRule = function(req, res) {
    var id = req.params.rule_id;
    ruleModel.remove({_id: id}, function(err) {
        if (err) {
            throw err;
        } else {
            res.send({
                "code": "200"
            });
        }
    });
};