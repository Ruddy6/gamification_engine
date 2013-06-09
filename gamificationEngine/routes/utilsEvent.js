var mongoose = require('mongoose');

require('./../modeles/eventSchema');

var eventModel = mongoose.model('event');

nbEvent = 10000000;
var result;

exports.populateBd = function(req, res) {
    req.connection.setTimeout(120 * 60 * 1000);
    result = res;
    addEvent();
};

addEvent = function(){
    var typeEvent_id = "519f1f1957c4632c09000033";
    var playerEventId = "519f1f1857c4632c09000004";
    var app_id = "519f1f1857c4632c09000003";

    var event = new eventModel({
        type: typeEvent_id,
        application: app_id,
        player: playerEventId
    });

    event.save(function(err) {
        if (err) {
            console.log(err);
            result.send({"code": "400"});
        } else if (nbEvent > 1) {
            nbEvent--;
            addEvent();
        } else {
            result.send({
                "code": "200"
            });
        }
    });
};

exports.deleteAll = function(req, res) {
    eventModel.collection.drop(function(err) {
        res.send({
            "code": "200"
        });
    });
};