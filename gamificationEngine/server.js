// Inclusion de Mongoose
var mongoose = require('mongoose');
var mongo = require('mongodb');

// On se connecte à la base de données
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
        typeEvent = require('./routes/typeEvents');
        player = require('./routes/players');
        rule = require('./routes/rules');
        leaderboard = require('./routes/leaderboard');
        utils = require('./routes/utils');

var app = express();

app.configure(function() {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

////////////////////////////////////////////////////////////////
////                                                        //// 
////    Revoir toutes les "signatures" des Web services     ////
////                                                        ////
////////////////////////////////////////////////////////////////

// APPLICATIONS
app.get('/applications', application.getAllApplications);
app.post('/applications', application.addApplication);
//app.get('/applications/:id', application.getApplicationById);
app.get('/applications/:id', application.getApplication);
app.get('/applications/:id/players', application.getPlayers);
app.get('/applications/:id/badges', application.getBadges);
app.get('/applications/:id/leaderboard', leaderboard.getLeaderboard);
app.put('/applications/:id', application.updateApplication);
app.delete('/applications/:id', application.deleteApplication);

// BADGES
//app.get('/applications/:app_id/badges/:badge_id', badge.getBadgeById);
app.get('/applications/:app_id/badges/:badge_id', badge.getBadge);
app.get('/applications/:app_id/badges/:badge_id/players', badge.getPlayers);
app.get('/applications/:app_id/badges/:badge_id/application', badge.getApplication);
app.post('/applications/:app_id/badges', badge.addBadge);
app.put('/applications/:app_id/badges/:badge_id', badge.updateBadge);
app.delete('/applications/:app_id/badges/:badge_id', badge.deleteBadge);

// TYPE EVENT
app.get('/applications/:app_id/typeEvents/:typeEvent_id', typeEvent.getTypeEventById);
app.post('/applications/:app_id/typeEvents', typeEvent.addTypeEvent);
app.get('/applications/:app_id/typeEvents/:typeEvent_id/application', typeEvent.getApplication);

// EVENTS
app.get('/applications/:app_id/events/:event_id', event.getEventById);
app.post('/applications/:app_id/players/:player_id/typeEvents/:typeEvent_id/events', event.addEvent);
app.get('/applications/:app_id/events/:event_id/player', event.getPlayer);
app.get('/applications/:app_id/events/:event_id/application', event.getApplication);
app.put('/applications/:app_id/events/:event_id', event.updateEvent);
app.delete('/applications/:app_id/events/:event_id', event.deleteEvent);

// PLAYERS
app.post('/applications/:app_id/players', player.addPlayer);
app.get('/applications/:app_id/players/:player_id', player.getPlayer);
//app.post('/applications/:app_id/badge/:badge_id/player/:player_id', player.addBadge);
app.get('/applications/:app_id/players/:player_id/badges', player.getBadges);
app.get('/applications/:app_id/players/:player_id/events', player.getEvents);
app.put('/applications/:app_id/players/:player_id', player.updatePlayer);
app.delete('/applications/:app_id/players/:player_id', player.deletePlayer);

// RULES
app.post('/applications/:app_id/badges/:badge_id/typeEvents/:typeEvent/rules', rule.addRule); // badge_id pour les tests --> normalement pas passé dans l'url
app.get('/applications/:app_id/rules', rule.getAllRulesApplication);
app.get('/applications/:app_id/rules/:rule_id', rule.getRuleById);
app.put('/applications/:app_id/rules/:rule_id', rule.updateRule);
app.delete('/applications/:app_id/rules/:rule_id', rule.deleteRule);

// UTILS
app.post('/utils', utils.populateDb);
app.delete('/utils', utils.deleteAll);

app.listen(3000);
console.log('Listening on port 3000...');