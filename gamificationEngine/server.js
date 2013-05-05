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
app.get('/applications/:id/players', application.getPlayers);
app.get('/applications/:id/badges', application.getBadges);
app.put('/applications/:id', application.updateApplication);
app.delete('/applications/:id', application.deleteApplication);

// BADGES
app.get('/applications/:app_id/badges/:badge_id', badge.getBadgeById);
app.get('/applications/:app_id/badges/levels/:level', badge.getBagdesByLevel);
app.get('/applications/:app_id/badges/:badge_id/players', badge.getPlayers);
app.get('/applications/:app_id/badges/:badge_id/application', badge.getApplication);
app.post('/applications/:app_id/badge', badge.addBadge);
app.put('/applications/:app_id/badges/:badge_id', badge.updateBadge);
app.delete('/applications/:app_id/badges/:badge_id', badge.deleteBadge);

// EVENTS
app.get('/applications/:app_id/events/:event_id', event.getEventById);
app.post('/applications/:app_id/players/:player_id/events', event.addEvent);
app.get('/applications/:app_id/events/:event_id/player', event.getPlayer);
app.get('/applications/:app_id/events/:event_id/application', event.getApplication);
app.put('/applications/:app_id/events/:event_id', event.updateEvent);
app.delete('/applications/:app_id/events/:event_id', event.deleteEvent);

// PLAYERS
app.post('/applications/:app_id/player', player.addPlayer);
app.get('/applications/:app_id/players/:player_id', player.getPlayerById);
app.post('/applications/:app_id/badge/:badge_id/player/:player_id', player.addBadge);
app.get('/applications/:app_id/players/:player_id/badges', player.getBadges);
app.get('/applications/:app_id/players/:player_id/events', player.getEvents);
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