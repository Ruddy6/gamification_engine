// Inclusion de Mongoose
var mongoose = require('mongoose');
var mongo = require('mongodb');

// On se connecte à la base de données
// N'oubliez pas de lancer ~/mongodb/bin/mongod dans un terminal !
mongoose.connect('mongodb://localhost/gamificationdb', function(err) {
    console.log("connect db mongoose");
    if (err) {
        throw err;
    }
});

var express = require('express'),
        application = require('./routes/applications');
        badge = require('./routes/badges');
        event = require('./routes/events');
        player = require('./routes/players');
        rule = require('./routes/rules');

var app = express();

app.configure(function() {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

// APPLICATIONS
app.get('/applications', application.getAllApplications);
app.post('/applications', application.addApplication);
app.get('/applications/:id', application.getApplicationById);
app.put('/applications/:id', application.updateApplication);
app.delete('/applications/:id', application.deleteApplication);

// BADGES
app.get('/applications/:app_id/badges', badge.getAllBadgesApplication);
app.get('/badges/:badge_id', badge.getBadgeById);
app.get('/applications/:app_id/badges/levels/:level', badge.getBagdesByLevel);
app.post('/applications/:app_id/badge', badge.addBadge);
app.post('/applications/:app_id/badges/:badge_id/player/:player_id', badge.addBadgeToPlayer);
app.get('/applications/:app_id/badges/player/:player_id', badge.getBadgesOfPlayer);
app.put('/applications/:app_id/badges/:badge_id', badge.updateBadge);
app.delete('/applications/:app_id/badges/:badge_id', badge.deleteBadge);

// EVENTS
app.get('/applications/:app_id/events', event.getAllEventsApplication);
app.get('/applications/:app_id/events/:event_id', event.getEventById);
app.post('/applications/:app_id/players/:player_id/events', event.addEvent);
app.put('/applications/:app_id/events/:event_id', event.updateEvent);
app.delete('/applications/:app_id/events/:event_id', event.deleteEvent);

// PLAYERS
app.post('/applications/:app_id/player', player.addPlayer);
app.get('/applications/:app_id/players', player.getAllPlayersApplication);
app.get('/applications/:app_id/players/:player_id', player.getPlayerById);
app.put('/applications/:app_id/players/:player_id', player.updatePlayer);
app.delete('/applications/:app_id/players/:player_id', player.deletePlayer);

// RULES
app.post('/applications/:app_id/players/:player_id/badges/:badge_id/rule', rule.addRule);
app.get('/applications/:app_id/rules', rule.getAllRulesApplication);
app.get('/applications/:app_id/rules/:rule_id', rule.getRuleById);
app.put('/applications/:app_id/rules/:rule_id', rule.updateRule);
app.delete('/applications/:app_id/rules/:rule_id', rule.deleteRule);

app.listen(3000);
console.log('Listening on port 3000...');