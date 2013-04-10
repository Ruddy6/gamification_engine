var express = require('express'),
        application = require('./routes/applications');
        badge = require('./routes/badges');
        event = require('./routes/events');
        leaderboard = require('./routes/leaderBoard');

var app = express();

app.configure(function() {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/applications', application.findAll);
app.get('/applications/:id', application.findById);
app.post('/applications', application.addApplication);
app.put('/applications/:id', application.updateApplication);
app.delete('/applications/:id', application.deleteApplication);

// GET
app.get('/applications/:app_id/badges', badge.getAllBadges);
app.get('/applications/:app_id/badges/nbLevel', badge.getNbLevel);
app.get('/badges/:badge_id', badge.getBadgeById); // app.get('/applications/:app_id/badges/:badge_id', badge.getBadgeById);
app.get('/applications/:app_id/badges/levels/:level', badge.getBagdesByLevel);

// POST
//app.post('/applications/:app_id/badges', badge.addBadge);
//
//// PUT
//app.put('/applications/:app_id/badges/:badge_id', badge.updateBadge);
//
//// DELETE
//app.delete('/applications/:app_id/badges/:badge_id', badge.deleteBadge);

app.get('/applications/:app_id/events', event.getAllEvents);
app.get('/events/:event_id', event.getEventById);

app.get('/applications/:app_id/leaderboard', leaderboard.getLeaderBoard);

app.listen(3000);
console.log('Listening on port 3000...');