var express = require('express'),
passport = require('passport'),
util = require('util')
GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
http = require('http'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
session = require('express-session'),
methodOverride = require('method-override'),
jade = require('jade'),
request = require('request'),
router = require('./router');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ 
    secret: 'keyboard cat' ,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));


// Authentication

app.use('/', router);

app.listen(3000);

module.exports = app;