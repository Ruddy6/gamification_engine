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

exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving application: ' + id);
    db.collection('applications', function(err, collection) {
        collection.findOne({'_id': new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

exports.findAll = function(req, res) {
    db.collection('applications', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

exports.addApplication = function(req, res) {
    var application = req.body;
    console.log('Adding application: ' + JSON.stringify(application));
    db.collection('applications', function(err, collection) {
        collection.insert(application, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
};

exports.updateApplication = function(req, res) {
    var id = req.params.id;
    var application = req.body;
    console.log('Updating application: ' + id);
    console.log(JSON.stringify(application));
    db.collection('applications', function(err, collection) {
        collection.update({'_id': new BSON.ObjectID(id)}, application, {safe: true}, function(err, result) {
            if (err) {
                console.log('Error updating application: ' + err);
                res.send({'error': 'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(application);
            }
        });
    });
};

exports.deleteApplication = function(req, res) {
    var id = req.params.id;
    console.log('Deleting application : ' + id);
    db.collection('applications', function(err, collection) {
        collection.remove({'_id': new BSON.ObjectID(id)}, {safe: true}, function(err, result) {
            if (err) {
                res.send({'error': 'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
};

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var applications = [
        {
            name: "Application gamification",
            description: "La gamification c'est top!",
            apiKey: "2lk34j2",
            apiSecret: "lolilol",
            badges: [
                new ObjectId("515c2c601956eb6419000001")
            ]
        },
        {
            name: "Application gamification OSF",
            description: "La gamification OSF c'est top!",
            apiKey: "32oh23s",
            apiSecret: "lolilolilol",
            badges: [
                new ObjectId("515c2c601956eb6419000001"),
                new ObjectId("515c2c601956eb6419000002")
            ]
        }];

    db.collection('applications', function(err, collection) {
        collection.insert(applications, {safe: true}, function(err, result) {
        });
    });

};