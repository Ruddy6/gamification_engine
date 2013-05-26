var mongoose = require('mongoose');

require('./../modeles/applicationSchema');
require('./../modeles/badgeSchema');
require('./../modeles/typeEventSchema');
require('./../modeles/playerSchema');
require('./../modeles/ruleSchema');

var applicationModel = mongoose.model('application');
var badgeModel = mongoose.model('badge');
var typeEventModel = mongoose.model('typeEvent');
var playerModel = mongoose.model('player');
var ruleModel = mongoose.model('rule');
var eventModel = mongoose.model('event');

var nbPlayer;
var nbBadge;
var nbTypeEvent;
var eventParPlayer;

var compteurPlayer;
var compteurBadge;
var compteurTypeId;
var compteurRule;
var compteurPlayerEvent;
var compteurEvent;

var tableauIdBadge;
var tableauIdPlayer;
var tableauIdEvent;

var app_id;

var result;

initVariables = function() {
    nbPlayer = 10;
    nbBadge = 10;
    nbTypeEvent = 10;
    eventParPlayer = 100000;
    
    compteurPlayer = 0;
    compteurBadge = 0;
    compteurTypeId = 0;
    compteurRule = 0;
    compteurPlayerEvent = 0;
    compteurEvent = eventParPlayer;

    tableauIdBadge = new Array();
    tableauIdPlayer = new Array();
    tableauIdEvent = new Array();
};

exports.populateDb = function(req, res) {
    req.connection.setTimeout(120 * 60 * 1000);
    result = res;
    initVariables();
    var uneApplication = new applicationModel({name: 'gamificationEngine'});
    uneApplication.description = 'API REST de gamification';
    uneApplication.userKey = '32l23lk42';
    uneApplication.adminKey = '23lkj234lkj2';
    uneApplication.numberOfBadge = 0;
    uneApplication.numberOfPlayer = 0;

    uneApplication.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            app_id = uneApplication._id;
            addPlayers();
        }
    });
};

addPlayers = function() {

    var player = new playerModel({
        firstname: 'player' + compteurPlayer,
        lastname: 'lastname',
        pseudo: 'ElGringo' + compteurPlayer,
        email: 'elGringo' + compteurPlayer + '@caramba.com',
        //points: 0,
        application: app_id
    });
    player_id = player._id;
    player.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(app_id, {$addToSet: {players: player._id}, $inc: {numberOfPlayer: 1}},
            function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    tableauIdPlayer[compteurPlayer] = player._id;
                    compteurPlayer++;
                    if (compteurPlayer < nbPlayer) {
                        addPlayers();
                    } else {
                        addBadge();
                    }
                }
            });
        }
    });
};

addBadge = function() {
    var badge = new badgeModel({
        name: 'folieMeurtière',
        description: '5 frags',
        picture: 'folie.jpg',
        points: 100 + compteurBadge,
        application: app_id,
        numberOfOwner: 0
    });
    badge.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(app_id, {$addToSet: {badges: badge._id}, $inc: {numberOfBadge: 1}},
            function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    tableauIdBadge[compteurBadge] = badge._id;
                    //console.log(badge._id);
                    compteurBadge++;
                    if (compteurBadge < nbBadge) {
                        addBadge();
                    } else {
                        addTypeEvent();
                    }
                }
            });
        }
    });
};

addTypeEvent = function() {
    var typeEvent = new typeEventModel({
        application: app_id,
        name: 'frag' + compteurTypeId,
        points: 10 + compteurTypeId
    });
    typeEvent.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            applicationModel.findByIdAndUpdate(app_id, {$addToSet: {typeEvents: {type: typeEvent._id, name: typeEvent.name}}},
            function(err, application) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    tableauIdEvent[compteurTypeId] = typeEvent._id;
                    compteurTypeId++;
                    if (compteurTypeId < nbTypeEvent) {
                        addRule(typeEvent._id);
                    } else {
                        addEvent();
                    }
                }
            });
        }
    });
};

addRule = function(typeEvent_id) {
    var rule = new ruleModel({
        application: app_id,
        typeEvent: typeEvent_id,
        nbEvent: 5,
        badge: tableauIdBadge[compteurRule]
    });
    rule.save(function(err) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            badgeModel.findByIdAndUpdate(tableauIdBadge[compteurRule], {$addToSet: {rules: rule._id}},
            function(err, badge) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    compteurRule++;
                    addTypeEvent();
                }
            });
        }
    });
};

addEvent = function() {
    var typeEvent_id = tableauIdEvent[Math.floor(Math.random() * tableauIdEvent.length)];
    var playerEventId = tableauIdPlayer[compteurPlayerEvent];

    var event = new eventModel({
        type: typeEvent_id,
        application: app_id,
        player: playerEventId
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
                    playerModel.find({_id: playerEventId, 'events.type': event.type},
                    function(err, player) {
                        if (err) {
                            console.log(err);
                            res.send({"code": "400"});
                        } else {
                            // si le player possède déjà un event du type de l'event à ajouter, on incrémente simplement la quantité de ce type
                            // sinon, on ajoute une nouvelle entrée dans le tableau
                            if (player.length === 0) {
                                playerModel.findByIdAndUpdate(playerEventId, {$inc: {points: typeEvent.points}, $addToSet: {events: {type: typeEvent_id, name: typeEvent.name, quantity: 1}}}, function(err, player) {
                                    if (err) {
                                        console.log(err);
                                        res.send({"code": "400"});
                                    } else {
                                        checkRules(1, event, playerEventId);
                                    }
                                });
                            } else {
                                playerModel.findOneAndUpdate(
                                        {_id: playerEventId, 'events.type': event.type},
                                {$inc: {'events.$.quantity': 1, points: typeEvent.points}}, function(err, updatedPlayer) {
                                    if (err) {
                                        console.log(err);
                                        res.send({"code": "400"});
                                    } else {
                                        var nbEvent = 0;
                                        for (var i = 0; i < updatedPlayer.events.length; i++) {
                                            if ("'" + updatedPlayer.events[i].type + "'" === "'" + event.type + "'") {
                                                nbEvent = updatedPlayer.events[i].quantity;
                                            }
                                        }
                                        checkRules(nbEvent, event, playerEventId);
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};

checkRules = function(nbEvent, eventAjoute, playerId) {
    ruleModel.find({typeEvent: eventAjoute.type, nbEvent: nbEvent}, function(err, rule) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            if (rule.length !== 0) {
                addBadgeToPlayer(rule[0].badge, playerId);
            } else {
                checkFin();
            }
        }
    });
};

addBadgeToPlayer = function(badge_id, player_id) {
    badgeModel.findOneAndUpdate({_id: badge_id}, {$addToSet: {players: player_id}, $inc: {numberOfOwner: 1}}, function(err, badge) {
        if (err) {
            console.log(err);
            res.send({"code": "400"});
        } else {
            playerModel.findOneAndUpdate({_id: player_id}, {$addToSet: {badges: badge._id}, $inc: {points: badge.points, numberOfBadge: 1}},
            function(err, player) {
                if (err) {
                    console.log(err);
                    res.send({"code": "400"});
                } else {
                    checkFin();
                }
            });
        }
    });
};

checkFin = function() {
    if (compteurEvent > 1) {
        compteurEvent--;
        addEvent();
    } else {
        compteurPlayerEvent++;
        //compteurEvent = Math.floor(Math.random() * eventParPlayer) + 1;
        compteurEvent = eventParPlayer;
        if (compteurPlayerEvent < nbPlayer) {
            addEvent();
        }
        else {
            console.log("fini");
            result.send({
                "code": "200"
            });
        }
    }
};

exports.deleteAll = function(req, res) {
    initVariables();
    applicationModel.collection.drop(function(err) {
        badgeModel.collection.drop(function(err) {
            typeEventModel.collection.drop(function(err) {
                playerModel.collection.drop(function(err) {
                    ruleModel.collection.drop(function(err) {
                        eventModel.collection.drop(function(err) {
                            res.send({
                                "code": "200"
                            });
                        });
                    });
                });
            });
        });
    });
};