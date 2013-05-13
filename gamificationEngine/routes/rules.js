var mongoose = require('mongoose');

require('./../modeles/ruleSchema');
require('./../modeles/badgeSchema');

var playersController = require('./players');

var ruleModel = mongoose.model('rule');
var badgeModel = mongoose.model('badge');

exports.addRule = function(req, res) {
    var application_id = req.params.app_id;
    var badge_id = req.params.badge_id;
    var typeEvent = req.params.typeEvent;
    var rule = new ruleModel({
        application: application_id,
        typeEvent: typeEvent,
        nbEvent: 5,
        badge: badge_id
    });
    rule.save(function(err) {
        if (err) {
            return handleError(err);
        } else {
            badgeModel.findByIdAndUpdate(badge_id, {$addToSet: {rules: rule}},
            function(err, badge) {
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

exports.checkRules = function(nbEvent, eventAjoute, playerId) {
    ruleModel.find({typeEvent: eventAjoute.type, nbEvent: nbEvent}, function(err, rule) {
        if (err) {
            throw err;
        } else {
            if (rule.length !== 0) {
                playersController.addBadgeToPlayer(rule[0].badge, playerId);
            } else {
                console.log("aucune règle trouvée");
            }
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