/**
 * New node file
 */
var mongo = require('mongodb');

var ObjectId = require('mongodb').ObjectID;

var Server = mongo.Server,
        Db = mongo.Db,
        BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
db = new Db('gamificationdb', server);

db.open(function(err, db) {
    //populateDB();
    if (!err) {
        console.log("Connected to 'gamificationdb' database");
        db.collection('applications', {safe: true}, function(err, collection) {
            if (err) {
                console.log("The 'applications' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

exports.getAllEvents = function(req, res) {
    db.collection('events', function(err, collection) {
        collection.find({applications: new ObjectId(req.params.app_id)}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.getEventById = function(req, res) {
    var event_id = req.params.event_id;
    db.collection('events', function(err, collection) {
        collection.findOne({_id: new BSON.ObjectID(event_id)}, function(err, item) {
            res.send(item);
        });
    });
};

var populateDB = function() {

    var events = [
        {
            applicationId : "1",
            applicationName : "une application",
            type : "message",
            timestamp : "234234",
            applications: [
                new ObjectId("515c31f9c4f0145c0d000001"),
                new ObjectId("515c31f9c4f0145c0d000002")
            ]
        },
        {
            applicationId : "2",
            applicationName : "une deuxième application",
            type : "notification",
            timestamp : "456456456",
            applications: [
                new ObjectId("515c31f9c4f0145c0d000001")
            ]
        }];

    db.collection('events', function(err, collection) {
        collection.insert(events, {safe: true}, function(err, result) {
        });
    });

};
