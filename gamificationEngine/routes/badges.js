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

exports.getAllBadges = function(req, res) {
    db.collection('badges', function(err, collection) {
        collection.find({applications: new ObjectId(req.params.app_id)}).toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.getNbLevel = function(req, res) {
    var application_id = req.params.app_id;
    db.collection('badges', function(err, collection) {
        collection.find({applications: new ObjectId(application_id)}).toArray(function(err, items) {
            var levels = new Array();
            var nbLevel = new Array();

            for (var i = 0; i < items.length; i++) {
                var level = items[i]['level'];
                if (!valueInArray(levels, level)) {
                    levels.push(level);
                }
            }
            nbLevel.push(levels.length);
            res.send(nbLevel);
        });
    });
};

valueInArray = function(tableau, valeur) {
    var estDansTableau = false;
    if (tableau.length != 0) {
        for (var i = 0; i < tableau.length; i++) {
            if(tableau[i] == valeur){
                estDansTableau = true;
            }
        }
    }
    return estDansTableau;
};

exports.getBadgeById = function(req, res) {
    var badge_id = req.params.badge_id;
    console.log("badge id : " + badge_id);
    db.collection('badges', function(err, collection) {
        collection.findOne({_id: new BSON.ObjectID(badge_id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.getBagdesByLevel = function(req, res) {
    var application_id = req.params.app_id;
    var level = req.params.level;
    console.log(application_id);
    console.log(level);
    db.collection('badges', function(err, collection) {
        collection.find({applications: new ObjectId(application_id)}).toArray(function(err, items) {
            var badges = new Array();

            for (var i = 0; i < items.length; i++) {
                if (items[i]['level'] == level) {
                    badges.push(items[i]);
                }
            }
            res.send(badges);
        });
    });
};

var populateDB = function() {

    var badges = [
        {
            description: "Super badge de malade",
            name: "MyBadge",
            picture: "mybadgePicture.png",
            level: 10000,
            applications: [
                new ObjectId("515c31f9c4f0145c0d000001"),
                new ObjectId("515c31f9c4f0145c0d000002")
            ]
        },
        {
            description: "The big boss badge",
            name: "BigBoss",
            picture: "qwertz.png",
            level: 10000,
            applications: [
                new ObjectId("515c31f9c4f0145c0d000002")
            ]
        }];

    db.collection('badges', function(err, collection) {
        collection.insert(badges, {safe: true}, function(err, result) {
        });
    });

};
