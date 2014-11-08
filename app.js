var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
  config = require('./config'),
   http = require('http'),
   cookieParser = require('cookie-parser'),
   bodyParser = require('body-parser'),
   session = require('express-session'),
   methodOverride = require('method-override'),
   jade = require('jade'),
   request = require('request');

// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = config.client_id;
var GOOGLE_CLIENT_SECRET = config.secret;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


var getDetails = function(token) {
  // token = new Buffer(token).toString('base64')
  console.log(token)
  request(
      {
        url: 'https://www.googleapis.com/fitness/v1/users/me/dataSources',
         headers : {
              "Authorization" : 'Bearer '+token
          }
      },
      function (error, response, body) {
        console.log('error', error);
        console.log('response', response);
        console.log('body', body);
          // Do more stuff with 'body' here
      }
  );
}

// Use the GoogleStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {

    console.log('access', accessToken);

    // store the access token
    getDetails(accessToken);

    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's Google profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Google account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));




var app = express();

// configure Express
// app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.logger());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(session({ 
    secret: 'keyboard cat' ,
    resave: true,
    saveUninitialized: true
}));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(app.router);
  app.use(express.static(__dirname + '/public'));
// });


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  console.log(req)
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});




// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
'https://www.googleapis.com/auth/userinfo.email',
'https://www.googleapis.com/auth/fitness.activity.read',
// 'https://www.googleapis.com/auth/fitness.activity.write'
'https://www.googleapis.com/auth/fitness.body.read',
// 'https://www.googleapis.com/auth/fitness.body.write'
'https://www.googleapis.com/auth/fitness.location.read'
// 'https://www.googleapis.com/auth/fitness.location.write'
                                            ] }),
  function(req, res){

    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login');
}