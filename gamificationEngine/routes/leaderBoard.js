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

exports.getLeaderBoard = function(req, res) {
    console.log(req.params.app_id);
    db.collection('leaderboards', function(err, collection) {
        collection.find({applicationId: new ObjectId(req.params.app_id)}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

var populateDB = function() {
    var leaderboards = [
        {
            id: "1",
            description: "leaderBoard",
            applicationId: new ObjectId("515c31f9c4f0145c0d000001"),
            applicationName: "Application",
            ranking: [
                {
                    playerName: "Toto",
                    points: "5000"
                },
                {
                    playerName: "Titi",
                    points: "1000"
                }
            ]
        }];

    db.collection('leaderboards', function(err, collection) {
        collection.insert(leaderboards, {safe: true}, function(err, result) {
        });
    });

};
