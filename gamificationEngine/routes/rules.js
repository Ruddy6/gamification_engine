var mongoose = require('mongoose');

require('./../modeles/ruleSchema');
require('./../modeles/badgeSchema');

var playersController = require('./players');

var ruleModel = mongoose.model('rule');
var badgeModel = mongoose.model('badge');

/**
 * Permet d'ajouter une nouvelle règle dans la base de données.
 * Une règle permet de déterminer si un event effectué par un player lui permet d'obtenir un badge.
 * Chaque règle permet l'obtention d'un et un seul badge.
 * Exemple : 5 event de type "Commentaire" permet d'obtenir le badge "Pipelette".
 * @param {type} req Les données de la règles à ajouter.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si la règle a pu être ajouté ou un code erreur 400 si un problème a été rencontré.
 */
exports.addRule = function(req, res) {
    var application_id = req.params.app_id;
    var badge_id = req.params.badge_id;
    var typeEvent = req.params.typeEvent;
//    var rule = new ruleModel({
//        application: application_id,
//        typeEvent: typeEvent,
//        nbEvent: 5,
//        badge: badge_id
//    });
    var rule = new ruleModel({
        application: application_id,
        typeEvent: req.body.typeEvent,
        nbEvent: req.body.nbEvent,
        badge: req.body.badge_id
    });
    rule.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            badgeModel.findByIdAndUpdate(badge_id, {$addToSet: {rules: rule._id}},
            function(err, badge) {
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
 * Permet de récupérer la liste de toutes les règles liées à une application.
 * @param {type} req L'id de l'application dont on veut récupérer les règles.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns La liste des règles ou un code erreur 400 si un problème a été rencontré.
 */
exports.getRules = function(req, res) {
    var application_id = req.params.app_id;
    ruleModel.find({application: application_id}, function(err, rules) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(rules);
        }
    });
};

/**
 * Permet de récupérer une règle particulière en fonction de son id.
 * @param {type} req L'id de la règle que l'on veut récupérer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns La règle désirée ou un code erreur 400 si un problème a été rencontré.
 */
exports.getRuleById = function(req, res) {
    var rule_id = req.params.rule_id;
    ruleModel.findById(rule_id, function(err, rule) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            res.send(rule);
        }
    });
};

/**
 * Permet de déterminer si une règle permet l'obtention d'un badge suite à l'ajout d'un event par un player.
 * @param {type} nbEvent Le nombre d'event du même type possédé par le player.
 * @param {type} eventAjoute L'event ajouté.
 * @param {type} playerId L'id du player qui a effectué l'event.
 * @returns Ne retourne rien mais demande l'ajout d'un badge au player concerné si une règle est trouvée.
 */
exports.checkRules = function(nbEvent, eventAjoute, playerId) {
    ruleModel.find({typeEvent: eventAjoute.type, nbEvent: nbEvent}, function(err, rule) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            if (rule.length !== 0) {
                playersController.addBadgeToPlayer(rule[0].badge, playerId);
            } else {
                console.log("aucune règle trouvée");
            }
        }
    });
};

/**
 * Permet de modifier une règle.
 * Seul le type d'event, le nombre d'event et le badge sont modifiables.
 * @param {type} req Les données de la règle à modifier.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si la règle a pu être modifiée ou un code erreur 400 si un problème a été rencontré.
 */
exports.updateRule = function(req, res) {
    var id = req.params.rule_id;

    var typeEvent = req.body.typeEvent;
    var nbEvent = req.body.nbEvent;
    var badge = req.body.badge_id;

    ruleModel.findByIdAndUpdate(id, {$set: {typeEvent: typeEvent, nbEvent: nbEvent, badge: badge}}, function(err, rule) {
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
 * Permet de supprimer une règle.
 * @param {type} req L'id de la règle à supprimer.
 * @param {type} res Objet permettant de renvoyer une réponse au navigateur.
 * @returns Un code 200 si la règle a pu être supprimée ou un code erreur 400 si un problème a été rencontré.
 */
exports.deleteRule = function(req, res) {
    var id = req.params.rule_id;
    ruleModel.remove({_id: id}, function(err) {
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