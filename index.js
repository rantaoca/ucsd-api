var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var url = require("url");
var courseSearch = require('./bin/course-schedule/course-search');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api', function(req, res, next){
    var urlString = req.url;
    var urlParse = url.parse(urlString, true);
    console.log("Query");
    console.log(urlParse.query);
    
    courseSearch(urlParse.query, function(err, data) {
        if(err) {
            console.log("ERRORORORORORO");
            console.log(err);
            return;
        } 
        res.json(data);
        console.log(data);
    });

});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    if(1==1) { return; }
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);
var server = app.listen(app.get('port'), "0.0.0.0", function() {
    console.log("listening on " + app.get('port'));
});

module.exports = app;
