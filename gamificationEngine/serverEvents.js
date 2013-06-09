var mongoose = require('mongoose');
var mongo = require('mongodb');

mongoose.connect('mongodb://localhost/gamificationdbEvents', function(err) {
    console.log("connect db mongoose");
    if (err) {
        throw err;
    }
});

var express = require('express'),
        utilsEvent = require('./routes/utilsEvent');
        event = require('./routes/events');

var app = express();

app.configure(function() {
    app.use(express.logger('dev')); /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

// UTILS
app.post('/utils', utilsEvent.populateBd);
app.delete('/utils', utilsEvent.deleteAll);

app.get('/events/:event_id', event.getEventById);

app.listen(3000);
console.log('Listening on port 3000...');