var express = require('express');
var router = express.Router(),
passport = require('passport'),
config = require('./config'),
Parser = require('./lib/parser'),
parser = new Parser();

var GOOGLE_CLIENT_ID = config.client_id;
var GOOGLE_CLIENT_SECRET = config.secret;

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, {profile: profile, token: accessToken});
    });
  }
));


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

// route middleware that will happen on every request
router.use(function(req, res, next) {

	// log each request to the console
	console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();	
});

router.get('/', function(req, res){
	console.log(req.isAuthenticated());
	if(req.isAuthenticated()) {
		res.redirect('/data');
	} else {
		res.render('login', { user: req.user});		
	}
});

router.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/fitness.activity.read',
	'https://www.googleapis.com/auth/fitness.body.read',
	'https://www.googleapis.com/auth/fitness.location.read'] }),
function(req, res){
	console.log('authenticated');
});


// about page route (http://localhost:8080/about)
router.get('/data', ensureAuthenticated,function(req, res) {
	var user = req.user;
	var details = parser.getDetails(user.token, function(details){
		res.render('account', {
			user: user.profile,
			details: details
		})
	});
});

router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }),
    function(req, res, stuff) {
    var token = req.user.token;
    res.cookie('token', token);
    res.redirect('/data');
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;