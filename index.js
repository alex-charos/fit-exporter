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
router = require('./router'),
MongoStore = require('connect-mongo')(session);

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ 
    store: new MongoStore({
      db : 'sessions'
    }),
    resave: true,
    saveUninitialized: true,
    secret: 'cats'
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.use('/', router);
// Authentication



app.listen(3000);

module.exports = app;