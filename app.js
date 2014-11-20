var google = require('googleapis'),
config = require('./config'),
request = require('request'),
bodyParser = require('body-parser'),
express = require('express'),
EventEmitter = require('events').EventEmitter;
var OAuth2 = google.auth.OAuth2;

var session = require('express-session'),
methodOverride = require('method-override'),
MongoStore = require('connect-mongo')(session);

var oauth2Client = new OAuth2(config.CLIENT_ID, config.CLIENT_SECRET, config.REDIRECT_URL);
var ev = new EventEmitter();

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
	'https://www.googleapis.com/auth/userinfo.profile',
	'https://www.googleapis.com/auth/userinfo.email',
	'https://www.googleapis.com/auth/fitness.activity.read',
	'https://www.googleapis.com/auth/fitness.body.read',
	'https://www.googleapis.com/auth/fitness.location.read'
];

var url = oauth2Client.generateAuthUrl({
  access_type: 'offline', 
  scope: scopes 
});

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(methodOverride());
app.use(session({ 
    store: new MongoStore({
      db : 'sessions'
    }),
    resave: true,
    saveUninitialized: true,
    secret: 'cats'
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


var isAuthenticated = function(req, res, next){
	if (req.session.access_token) { return next(); }
	res.redirect('/login');
}

app.get('/', isAuthenticated, function(req, res){
	res.redirect('/data');
});

app.get('/login', function(req, res){
	res.render('login', { url: url });		
});

app.get('/auth/google/callback', function(req, res){
	oauth2Client.getToken(req.query.code, function(err, tokens) {
	  if(!err) {
	  	ev.emit('update:tokens', tokens);
	  	req.session.access_token = tokens.access_token;
	  	console.log(tokens.access_token, req.session);
	  	res.redirect('/');
	  }
	});
});

app.get('/data', function(req, res){
	var token = req.session.access_token;
	console.log(token);
	request(
      {
        url: 'https://www.googleapis.com/fitness/v1/users/me/dataSources',
         headers : {
              "Authorization" : 'Bearer '+token
          }
      },
      function(err, req, body){
      	if(!err) {
      		res.send(body);
      	}
      }
  );
});

app.listen(3000);

ev.on('update:tokens', function(tokens){
	oauth2Client.setCredentials(tokens);
});

console.log(url);

