var google = require('googleapis'),
config = require('./config'),
bodyParser = require('body-parser'),
Parser = require('./lib/parser'),
parser = new Parser(),
express = require('express'),
EventEmitter = require('events').EventEmitter;
var OAuth2 = google.auth.OAuth2;

var session = require('express-session'),
methodOverride = require('method-override'),
MongoStore = require('connect-mongo')(session);

var oauth2Client = new OAuth2(config.oath.clientId, config.oath.clientSecret, config.oath.redirectUrl);
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
      db : config.mongo.db,
      collection: config.mongo.collection,
      host: config.mongo.host,
      port: config.mongo.port,
      autoReconnect: true,
      username : config.mongo.username,
      password : config.mongo.password


    }),
    resave: true,
    saveUninitialized: true,
    secret: 'cats'
}));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));


var isAuthenticated = function(req, res, next){
	if (req.session.access_token) { 
		parser.setToken(req.session.access_token);
		return next(); 
	}
	res.redirect('/logout');
}


app.get('/logout', function(req, res){
  req.session.destroy(function(){
  	res.send('You have been logged out');
  });
});

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
	  	parser.setToken(tokens.access_token);
	  	res.redirect('/');
	  }
	});
});

app.get('/data', isAuthenticated, function(req, res){
	parser.getDataSources(function(err, req, body){
		body = JSON.parse(body);
		console.log(body);
		if(!err && !body.error) {
			res.render('data', {data: body});
		}else {
			res.send('Your access token expired, please log out and log back in');
		}
	});
});


app.get('/data/:stream_id/details', isAuthenticated , function(req, res) {
	getStreamDetails(req.params.stream_id, res, function(body) {res.render('stream', {stream: body});});
})

var getStreamDetails = function(streamId, res, cb){
	parser.getStreamDetails(streamId, function(err, req, body){
		body = JSON.parse(body);
		console.log(req.params);
		if(!err && !body.error) {
			cb(body);
		}else {
			res.send('Your access token expired, please log out and log back in');
		}
	});



}

app.get('/data/:stream_id/details/raw', isAuthenticated , function(req, res) {
	getStreamDetails(req.params.stream_id, res, function(body) {res.json(body)});
})

app.listen(3000);

ev.on('update:tokens', function(tokens){
	oauth2Client.setCredentials(tokens);
});

console.log(url);

