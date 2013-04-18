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
        leaderboard = require('./routes/leaderBoard');
        player = require('./routes/players');

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
//app.get('/applications/:app_id/badges/nbLevel', badge.getNbLevel);
app.get('/badges/:badge_id', badge.getBadgeById); // app.get('/applications/:app_id/badges/:badge_id', badge.getBadgeById);
app.get('/applications/:app_id/badges/levels/:level', badge.getBagdesByLevel);
app.post('/applications/:app_id/badge', badge.addBadge);
app.post('/badges/:badge_id/player/:player_id', badge.addBadgeToPlayer);
app.get('/applications/:app_id/badges/player/:player_id', badge.getBadgesOfPlayer);
app.put('/badges/:badge_id', badge.updateBadge); // pas besoin de connaître son application pour modifier un badge.
app.delete('/badges/:badge_id', badge.deleteBadge); // pas besoin de connaître son application pour supprimer un badge.

// EVENTS
app.get('/applications/:app_id/events', event.getAllEventsApplication);
app.get('/events/:event_id', event.getEventById);
app.post('/applications/:app_id/event', event.addEvent);
app.post('/events/:event_id/player/:player_id', event.addEventToPlayer);
app.put('/events/:event_id', event.updateEvent);
app.delete('/events/:event_id', event.deleteEvent);

// LEADERBOARD
app.post('/applications/:app_id/leaderboard', leaderboard.addLeaderboard);
app.get('/applications/:app_id/leaderboard', leaderboard.getLeaderboardApplication);

// PLAYERS
app.post('/applications/:app_id/player', player.addPlayer);
app.get('/applications/:app_id/players', player.getAllPlayersApplication);
app.get('/players/:player_id', player.getPlayerById);
app.put('/players/:player_id', player.updatePlayer);
app.delete('/players/:player_id', player.deletePlayer);

app.listen(3000);
console.log('Listening on port 3000...');